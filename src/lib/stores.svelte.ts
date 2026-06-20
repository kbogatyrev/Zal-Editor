import type { ILexeme, IInflection } from './types';

// Create a writable store to hold the current user profile
const initialInflection: IInflection | null = null;
const initialLexeme: ILexeme | null = null;

// Search term to be passed from the landing page to the Search page
export const searchRequest =
    $state({ query: null,
             ignore: false });

export const caseToHash = new Map<string, string>();
caseToHash.set('Nominative', 'И');
caseToHash.set('Accusative', 'В');
caseToHash.set('Dative', 'Д');
caseToHash.set('Genitive', 'Р');
caseToHash.set('Prepositional', 'П');
caseToHash.set('Instrumental', 'Т');

export const numberToHash = new Map<string, string>();
numberToHash.set('Singular', 'ед.');
numberToHash.set('Plural', 'мн.');

export const genderToHash = new Map<string, string>();
genderToHash.set('Masculine', 'м');
genderToHash.set('Feminine', 'ж');
genderToHash.set('Neuter', 'с');

export const presentTenseToPerson = new Map<string, string>();
presentTenseToPerson.set('1stPerson', '1');
presentTenseToPerson.set('2ndPerson', '2');
presentTenseToPerson.set('3rdPerson', '3');
