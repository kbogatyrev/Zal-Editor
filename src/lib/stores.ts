import { writable } from 'svelte/store';
import type { ILexeme, IInflection } from './types';

// Create a writable store to hold the current user profile
const initialInflection: IInflection | null = null;
const initialLexeme: ILexeme | null = null;
export const currentInflection = writable<IInflection | null>(initialInflection);
export const currentLexeme = writable<ILexeme | null>(initialLexeme);

export const caseToHash = new Map<string, string>();
caseToHash.set('Nominative', 'N');
caseToHash.set('Accusative', 'A');
caseToHash.set('Dative', 'D');
caseToHash.set('Genitive', 'G');
caseToHash.set('Prepositional', 'P');
caseToHash.set('Instrumental', 'I');

export const numberToHash = new Map<string, string>();
numberToHash.set('Singular', 'Sg');
numberToHash.set('Plural', 'Pl');
