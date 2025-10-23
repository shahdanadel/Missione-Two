
2)	Realizzate un sito NON mono pagina per un poliambulatorio privato che offre diversi servizi e offre l’opportunità ai potenziali utenti di prenotare delle visite specialistiche potendo scegliere il medico della relativa specialità e data e orario fra quelli disponibili. L’utente potrà anche modificare la data o cancellare la prenotazione. Guardate esempi esistenti e cercate di capire quali funzionalità sono generalmente presenti. Non disponendo di database potete usare il localstorage per tenere in memoria le visite ed eventualmente scrivere direttamente nel codice l’elenco dei medici e delle relative specialità.

#Piano di Sviluppo del Sito Web Poliambulatorio Alpha

Questo piano definisce la struttura e le funzionalità essenziali del nuovo sito web (non monopagina), con l'obiettivo principale di **automatizzare il processo di prenotazione visite** tramite l'interfaccia utente.

 1. Architettura del Sito (Pagine e Contenuti)

Il sito sarà suddiviso in pagine tematiche per una navigazione intuitiva e professionale.

| Pagina | Obiettivo Principale | Contenuti Chiave |
| :--- | :--- | :--- |
| **Home Page** (`index.html`) | Primo Impatto e Invito all'Azione (CTA) | Presentazione, Missione, Elenco Breve Servizi, **Bottone "Prenota Ora" (CTA)**. |
| **Chi Siamo** (`about.html`) | Costruire Fiducia e Credibilità | Storia, Team di Gestione, Certificazioni e Valori. |
| **Servizi** (`services.html`) | Dettaglio Offerta Medica | Elenco completo e schede di dettaglio per ogni **Specialità** (es. Cardiologia, Dermatologia). |
| **Contatti** (`contact.html`) | Accessibilità e Informazioni Pratiche | Indirizzo, Mappa, Numeri di Telefono e Orari di Apertura. |

 2. Funzionalità Generali e Usabilità (Base Tecnica)

Questi elementi garantiscono che il sito sia facile da usare, professionale e accessibile.

* **Navigazione Professionale:** Implementazione di un'intestazione (`Header`) fissa o ben visibile con il Logo e un **Menu chiaro e Responsivo**, funzionante perfettamente su smartphone e desktop.
* **Accessibilità Informazioni:** Posizionamento di indirizzo, telefono e orari nel **Footer** e nella pagina Contatti.
* **Motore di Ricerca:** Funzionalità di ricerca per permettere agli utenti di trovare rapidamente Specialità, Medici o Servizi specifici.

---

 3. Modulo di Prenotazione Avanzato (`booking.html`) 💡

Questo è il cuore del progetto, che digitalizza l'intero processo di prenotazione, riducendo le chiamate al centralino.

| Funzione | Descrizione e Beneficio | Dati Richiesti |
| :--- | :--- | :--- |
| **Selezione Guidata (Step-by-Step)** | Guida l'utente attraverso la scelta di **Specialità** $\rightarrow$ **Medico** $\rightarrow$ **Data** $\rightarrow$ **Ora** per evitare errori di prenotazione. | - |
| **Disponibilità Medici** | Una volta scelta la Specialità, vengono **filtrati e mostrati solo i medici** competenti. | Elenco Medici (interno al codice). |
| **Gestione Slot Orari** | Il sistema mostra un calendario interattivo e **filtra gli orari disponibili** (escludendo quelli già occupati e le date passate). | **Contenuto del `localStorage`**. |
| **Raccolta Dati Paziente** | Form semplice e obbligatorio per identificare il paziente al momento della visita. | Nome, Cognome, Telefono, Email. |
| **Conferma e ID** | Al termine, viene generato e mostrato un **ID di Prenotazione univoco** per il tracciamento. | ID Univoco (generato da JS). |

---

 4. Gestione Autonoma delle Prenotazioni (`mybookings.html`) 🔄

Questa sezione offre agli utenti il pieno controllo delle loro visite, delegando la gestione delle modifiche dall'amministrazione all'utente finale.

| Funzione | Obiettivo e Impatto | Meccanismo Tecnico |
| :--- | :--- | :--- |
| **Visualizzazione** | Permette all'utente di recuperare la lista delle proprie visite inserendo la propria Email (o ID). | Ricerca nel `localStorage`. |
| **Modifica (Data/Ora)** | Permette all'utente di selezionare una nuova Data e/o un nuovo Orario tra gli slot disponibili per quello specifico medico. | Finestra **Modal** che riutilizza la logica di disponibilità della Fase 3. |
| **Cancellazione** | Pulsante semplice e chiaro per eliminare la prenotazione dal sistema. | Rimozione diretta del record dal `localStorage`. |

 5. Archiviazione Dati (Nota Tecnica)

* **Simulazione DB:** Verrà utilizzato il **`loca Storage`** del browser per memorizzare tutte le prenotazioni. Questo permette di testare la logica di disponibilità, modifica e cancellazione senza la necessità di un database server.
* **Dati Statici:** L'elenco dei medici, specialità e orari standard è inserito direttamente nel codice JavaScript (`data.js`).

