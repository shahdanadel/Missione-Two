// js/data.js

/**
 * Elenco dei Medici disponibili, con ID, specialità e nome.
 * Gli ID sono importanti per identificare in modo univoco il medico nelle prenotazioni.
 */
const LISTA_MEDICI = [
    { id: 'C001', nome: 'Dott. Mario Rossi', specialita: 'Cardiologia', tariffa: 120 },
    { id: 'C002', nome: 'Dott.ssa Laura Bianchi', specialita: 'Cardiologia', tariffa: 110 },
    { id: 'D001', nome: 'Prof. Giovanni Verdi', specialita: 'Dermatologia', tariffa: 150 },
    { id: 'D002', nome: 'Dott.ssa Anna Neri', specialita: 'Dermatologia', tariffa: 130 },
    { id: 'O001', nome: 'Dott. Paolo Gialli', specialita: 'Ortopedia', tariffa: 135 },
    { id: 'F001', nome: 'Dott.ssa Elena Blu', specialita: 'Fisioterapia', tariffa: 80 },
];

/**
 * Orari di lavoro standard disponibili per qualsiasi medico.
 * L'effettiva disponibilità sarà calcolata filtrando le prenotazioni salvate.
 */
const ORARI_DISPONIBILI = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '14:00',
    '15:00',
    '16:00',
];

/**
 * Elenco delle specialità. Utile per popolare i menu a tendina.
 */
const SPECIALITA_DISPONIBILI = [
    'Cardiologia',
    'Dermatologia',
    'Ortopedia',
    'Fisioterapia',
    'Oculistica',
    'Otorinolaringoiatria'
];

console.log("Dati statici (Medici e Specialità) caricati.");