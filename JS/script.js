// js/script.js

// Funzione di utilità per interagire con localStorage
function getPrenotazioni() {
    // Restituisce l'array delle prenotazioni o un array vuoto se non esiste
    return JSON.parse(localStorage.getItem('prenotazioni')) || [];
}

function salvaPrenotazioni(prenotazioni) {
    localStorage.setItem('prenotazioni', JSON.stringify(prenotazioni));
}

function generaIdPrenotazione() {
    // Genera un ID semplice e sufficientemente unico (es. P-timestamp-random)
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 6);
    return `P-${timestamp.toUpperCase()}-${randomPart.toUpperCase()}`;
}

// -------------------------------------------------------------
// LOGICA DI POPOLAMENTO E INTERAZIONE DEL FORM (booking.html)
// -------------------------------------------------------------

const form = document.getElementById('prenotazioneForm');
const specialitaSelect = document.getElementById('specialita');
const medicoSelect = document.getElementById('medico');
const dataVisitaInput = document.getElementById('data-visita');
const slotOrariDiv = document.getElementById('slot-orari');
const orarioSelezionatoInput = document.getElementById('orario-selezionato');

// Fieldset da sbloccare man mano
const medicoFieldset = document.getElementById('medicoFieldset');
const datetimeFieldset = document.getElementById('datetimeFieldset');
const datiPazienteFieldset = document.getElementById('datiPazienteFieldset');
const medicoInfo = document.getElementById('medico-info');
const messaggioRisposta = document.getElementById('messaggio-risposta');


// Funzione 1: Inizializza il form al caricamento della pagina
function initBookingForm() {
    // 1. Popola il menu a tendina delle specialità
    SPECIALITA_DISPONIBILI.forEach(spec => {
        const option = document.createElement('option');
        option.value = spec;
        option.textContent = spec;
        specialitaSelect.appendChild(option);
    });

    // 2. Imposta la data minima a domani (o oggi se si vuole)
    const oggi = new Date();
    // Vogliamo che la prima data prenotabile sia domani
    oggi.setDate(oggi.getDate() + 1); 
    const minDate = oggi.toISOString().split('T')[0];
    dataVisitaInput.min = minDate;


    // 3. Aggiungi i listener
    specialitaSelect.addEventListener('change', popolaMedici);
    medicoSelect.addEventListener('change', abilitaSelezioneData);
    dataVisitaInput.addEventListener('change', mostraSlotOrari);
    
    // Listener per la selezione degli orari tramite click sui bottoni
    slotOrariDiv.addEventListener('click', gestisciSelezioneOrario);

    // Listener per l'invio del form
    form.addEventListener('submit', gestisciPrenotazione);
}


// Funzione 2: Popola il menu dei medici in base alla specialità
function popolaMedici() {
    medicoSelect.innerHTML = '<option value="">Seleziona un medico</option>';
    medicoInfo.textContent = '';
    
    const specialitaSelezionata = specialitaSelect.value;
    
    // Reset e disabilita passaggi successivi
    medicoFieldset.disabled = true;
    datetimeFieldset.disabled = true;
    datiPazienteFieldset.disabled = true;
    
    if (!specialitaSelezionata) return;

    const mediciFiltrati = LISTA_MEDICI.filter(m => m.specialita === specialitaSelezionata);

    mediciFiltrati.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.id;
        option.textContent = medico.nome;
        medicoSelect.appendChild(option);
    });

    // Sblocca il campo medico
    medicoFieldset.disabled = false;
}

// Funzione 3: Abilita la selezione della data e aggiorna info medico
function abilitaSelezioneData() {
    const medicoId = medicoSelect.value;
    
    // Reset e disabilita
    datetimeFieldset.disabled = true;
    datiPazienteFieldset.disabled = true;
    medicoInfo.textContent = '';
    slotOrariDiv.innerHTML = '<p>Seleziona una data per visualizzare gli orari.</p>';
    orarioSelezionatoInput.value = '';

    if (!medicoId) return;
    
    // Aggiorna l'info sul medico
    const medico = LISTA_MEDICI.find(m => m.id === medicoId);
    if (medico) {
        medicoInfo.textContent = `Tariffa stimata: €${medico.tariffa}`;
    }

    // Sblocca la selezione data
    datetimeFieldset.disabled = false;
}

// Funzione 4: Mostra gli slot orari disponibili
function mostraSlotOrari() {
    const medicoId = medicoSelect.value;
    const dataSelezionata = dataVisitaInput.value;
    
    slotOrariDiv.innerHTML = '';
    datiPazienteFieldset.disabled = true;
    orarioSelezionatoInput.value = '';

    if (!medicoId || !dataSelezionata) return;
    
    // Trova le prenotazioni esistenti per questo medico/data
    const prenotazioniEsistenti = getPrenotazioni().filter(p => 
        p.medicoId === medicoId && p.data === dataSelezionata
    );

    let disponibiliTrovati = false;

    ORARI_DISPONIBILI.forEach(orario => {
        const isOccupato = prenotazioniEsistenti.some(p => p.orario === orario);
        
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = orario;
        button.classList.add('time-slot-button');
        button.dataset.orario = orario;

        if (isOccupato) {
            button.classList.add('unavailable');
            button.disabled = true;
        } else {
            disponibiliTrovati = true;
        }
        
        slotOrariDiv.appendChild(button);
    });

    if (!disponibiliTrovati) {
        slotOrariDiv.innerHTML = '<p>Non ci sono orari disponibili in questa data. Prova un altro giorno.</p>';
    }
}

// Funzione 5: Gestisce la selezione/deselezione degli slot orari
function gestisciSelezioneOrario(event) {
    const target = event.target;
    if (target.classList.contains('time-slot-button') && !target.classList.contains('unavailable')) {
        
        // Deseleziona tutti gli altri bottoni
        document.querySelectorAll('.time-slot-button').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Seleziona il bottone cliccato
        target.classList.add('selected');
        orarioSelezionatoInput.value = target.dataset.orario;

        // Abilita l'ultimo fieldset (dati paziente)
        datiPazienteFieldset.disabled = false;
    } else {
        datiPazienteFieldset.disabled = true; // Nel caso in cui clicchi un non-bottone
        orarioSelezionatoInput.value = '';
    }
}


// Funzione 6: Gestisce l'invio del form e salva la prenotazione
function gestisciPrenotazione(event) {
    event.preventDefault();

    // 1. Validazione base dei dati utente (HTML required già aiuta)
    if (!form.checkValidity() || !orarioSelezionatoInput.value) {
        mostraMessaggio('Per favore, compila tutti i campi obbligatori e seleziona un orario.', 'error');
        return;
    }

    // 2. Raccogli i dati
    const medicoSelezionato = LISTA_MEDICI.find(m => m.id === medicoSelect.value);
    
    const nuovaPrenotazione = {
        id: generaIdPrenotazione(),
        nomeUtente: document.getElementById('nome').value,
        cognomeUtente: document.getElementById('cognome').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        medicoId: medicoSelezionato.id,
        nomeMedico: medicoSelezionato.nome,
        specialita: medicoSelezionato.specialita,
        data: dataVisitaInput.value,
        orario: orarioSelezionatoInput.value,
        timestampCreazione: new Date().toISOString()
    };

    // 3. Salva nel localStorage
    const prenotazioni = getPrenotazioni();
    prenotazioni.push(nuovaPrenotazione);
    salvaPrenotazioni(prenotazioni);

    // 4. Mostra conferma e resetta
    mostraMessaggio(
        `Prenotazione confermata! ID: <strong>${nuovaPrenotazione.id}</strong>. Ti abbiamo inviato una conferma via email.`,
        'success'
    );
    
    form.reset();
    medicoFieldset.disabled = true;
    datetimeFieldset.disabled = true;
    datiPazienteFieldset.disabled = true;
    slotOrariDiv.innerHTML = '<p>Seleziona una data per visualizzare gli orari.</p>';
}


// Funzione 7: Mostra messaggi all'utente
function mostraMessaggio(testo, tipo) {
    messaggioRisposta.textContent = '';
    messaggioRisposta.innerHTML = testo;
    messaggioRisposta.style.display = 'block';
    
    // Stile in base al tipo (successo o errore)
    if (tipo === 'success') {
        messaggioRisposta.style.backgroundColor = '#d4edda'; // Verde chiaro
        messaggioRisposta.style.color = '#155724'; // Verde scuro
        messaggioRisposta.style.borderColor = '#c3e6cb';
    } else if (tipo === 'error') {
        messaggioRisposta.style.backgroundColor = '#f8d7da'; // Rosso chiaro
        messaggioRisposta.style.color = '#721c24'; // Rosso scuro
        messaggioRisposta.style.borderColor = '#f5c6cb';
    }
    
    // Nascondi dopo 8 secondi
    setTimeout(() => {
        messaggioRisposta.style.display = 'none';
    }, 8000);
}


// Avvia l'inizializzazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', initBookingForm);

// js/user-script.js

// -- UTILITY da script.js (necessarie anche qui) --
function getPrenotazioni() {
    return JSON.parse(localStorage.getItem('prenotazioni')) || [];
}

function salvaPrenotazioni(prenotazioni) {
    localStorage.setItem('prenotazioni', JSON.stringify(prenotazioni));
}
// -- FINE UTILITY --

const ricercaForm = document.getElementById('ricercaForm');
const listaPrenotazioniDiv = document.getElementById('lista-prenotazioni');
const messaggioRicercaDiv = document.getElementById('messaggio-ricerca');

const modificaModal = document.getElementById('modificaModal');
const modificaForm = document.getElementById('modificaForm');
const closeButton = document.querySelector('.close-button');
const modificaDataInput = document.getElementById('modifica-data');
const modificaSlotOrariDiv = document.getElementById('modifica-slot-orari');
const modificaOrarioInput = document.getElementById('modifica-orario-selezionato');

let currentEditingId = null; // ID della prenotazione attualmente in modifica

// -------------------------------------------------------------
// INIZIALIZZAZIONE E RICERCA
// -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Aggiungi listener per la ricerca
    ricercaForm.addEventListener('submit', gestisciRicerca);

    // Gestione della modale (chiusura)
    closeButton.addEventListener('click', () => modificaModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === modificaModal) {
            modificaModal.style.display = 'none';
        }
    });
});

function gestisciRicerca(event) {
    event.preventDefault();
    listaPrenotazioniDiv.innerHTML = '';
    messaggioRicercaDiv.textContent = '';
    
    const emailUtente = document.getElementById('ricerca-email').value.trim();
    if (!emailUtente) {
        messaggioRicercaDiv.textContent = 'Inserisci un\'email valida.';
        return;
    }

    const prenotazioni = getPrenotazioni();
    const risultati = prenotazioni.filter(p => p.email.toLowerCase() === emailUtente.toLowerCase());

    if (risultati.length === 0) {
        listaPrenotazioniDiv.innerHTML = '<p>Non è stata trovata alcuna prenotazione associata a questa email.</p>';
    } else {
        mostraPrenotazioni(risultati);
    }
}

// -------------------------------------------------------------
// VISUALIZZAZIONE
// -------------------------------------------------------------

function mostraPrenotazioni(prenotazioni) {
    let html = '<table><thead><tr><th>ID</th><th>Specialità</th><th>Medico</th><th>Data</th><th>Ora</th><th>Azioni</th></tr></thead><tbody>';

    prenotazioni.forEach(p => {
        html += `
            <tr>
                <td>${p.id}</td>
                <td>${p.specialita}</td>
                <td>${p.nomeMedico}</td>
                <td>${p.data}</td>
                <td>${p.orario}</td>
                <td>
                    <button class="button-modifica" data-id="${p.id}">Modifica</button>
                    <button class="button-cancella" data-id="${p.id}">Cancella</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    listaPrenotazioniDiv.innerHTML = html;

    // Aggiungi listener ai pulsanti Azioni
    document.querySelectorAll('.button-cancella').forEach(btn => {
        btn.addEventListener('click', () => cancellaPrenotazione(btn.dataset.id));
    });

    document.querySelectorAll('.button-modifica').forEach(btn => {
        btn.addEventListener('click', () => apriModificaModal(btn.dataset.id));
    });
}

// -------------------------------------------------------------
// CANCELLAZIONE
// -------------------------------------------------------------

function cancellaPrenotazione(id) {
    if (!confirm(`Sei sicuro di voler cancellare la prenotazione con ID ${id}?`)) {
        return;
    }

    let prenotazioni = getPrenotazioni();
    const indice = prenotazioni.findIndex(p => p.id === id);

    if (indice !== -1) {
        prenotazioni.splice(indice, 1); // Rimuove 1 elemento all'indice trovato
        salvaPrenotazioni(prenotazioni);
        
        // Ricarica la lista per l'utente corrente
        gestisciRicerca({ preventDefault: () => {} }); // Simula l'invio del form
        alert(`Prenotazione ${id} cancellata con successo.`);
    }
}

// -------------------------------------------------------------
// MODIFICA (Modal)
// -------------------------------------------------------------

function apriModificaModal(id) {
    const prenotazioni = getPrenotazioni();
    const prenotazione = prenotazioni.find(p => p.id === id);

    if (!prenotazione) {
        alert('Prenotazione non trovata.');
        return;
    }

    currentEditingId = id;

    // Popola i campi nascosti e visibili nella modale
    document.getElementById('modifica-id').value = prenotazione.id;
    document.getElementById('modifica-medico-id').value = prenotazione.medicoId;
    document.getElementById('modifica-medico-nome').textContent = prenotazione.nomeMedico;
    document.getElementById('modifica-specialita').textContent = prenotazione.specialita;
    
    // Imposta la data minima
    const oggi = new Date();
    oggi.setDate(oggi.getDate() + 1); 
    modificaDataInput.min = oggi.toISOString().split('T')[0];

    // Imposta la data corrente della prenotazione
    modificaDataInput.value = prenotazione.data;
    
    // Aggiungi listener per la data e la selezione oraria
    modificaDataInput.removeEventListener('change', mostraSlotModifica);
    modificaDataInput.addEventListener('change', mostraSlotModifica);
    
    modificaSlotOrariDiv.removeEventListener('click', gestisciSelezioneOrarioModifica);
    modificaSlotOrariDiv.addEventListener('click', gestisciSelezioneOrarioModifica);

    // Mostra gli slot per la data pre-selezionata
    mostraSlotModifica(prenotazione.orario); 
    
    modificaForm.removeEventListener('submit', gestisciSalvataggioModifica);
    modificaForm.addEventListener('submit', gestisciSalvataggioModifica);

    modificaModal.style.display = 'block';
}

function mostraSlotModifica(orarioIniziale = null) {
    const medicoId = document.getElementById('modifica-medico-id').value;
    const dataSelezionata = modificaDataInput.value;
    modificaSlotOrariDiv.innerHTML = '';
    modificaOrarioInput.value = '';

    // Trova le prenotazioni esistenti (escludendo quella che stiamo modificando)
    const prenotazioniEsistenti = getPrenotazioni().filter(p => 
        p.medicoId === medicoId && p.data === dataSelezionata && p.id !== currentEditingId
    );

    const orari = window.ORARI_DISPONIBILI || ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

    orari.forEach(orario => {
        const isOccupato = prenotazioniEsistenti.some(p => p.orario === orario);
        
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = orario;
        button.classList.add('time-slot-button');
        button.dataset.orario = orario;

        if (isOccupato) {
            button.classList.add('unavailable');
            button.disabled = true;
        } else if (orario === orarioIniziale) {
            button.classList.add('selected');
            modificaOrarioInput.value = orario;
        }
        
        modificaSlotOrariDiv.appendChild(button);
    });
}

function gestisciSelezioneOrarioModifica(event) {
    const target = event.target;
    if (target.classList.contains('time-slot-button') && !target.classList.contains('unavailable')) {
        // Deseleziona tutti gli altri
        document.querySelectorAll('#modifica-slot-orari .time-slot-button').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Seleziona il bottone cliccato
        target.classList.add('selected');
        modificaOrarioInput.value = target.dataset.orario;
    }
}

function gestisciSalvataggioModifica(event) {
    event.preventDefault();

    if (!modificaForm.checkValidity() || !modificaOrarioInput.value) {
        alert('Seleziona una data e un orario validi.');
        return;
    }

    const idDaModificare = document.getElementById('modifica-id').value;
    const nuovaData = modificaDataInput.value;
    const nuovoOrario = modificaOrarioInput.value;

    let prenotazioni = getPrenotazioni();
    const indice = prenotazioni.findIndex(p => p.id === idDaModificare);

    if (indice !== -1) {
        // Aggiorna solo data e orario
        prenotazioni[indice].data = nuovaData;
        prenotazioni[indice].orario = nuovoOrario;
        salvaPrenotazioni(prenotazioni);
        
        modificaModal.style.display = 'none';
        gestisciRicerca({ preventDefault: () => {} }); // Ricarica la lista
        alert('Prenotazione modificata con successo!');
    } else {
        alert('Errore: ID prenotazione non trovato.');
    }
}