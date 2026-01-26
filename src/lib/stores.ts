import { writable } from 'svelte/store';
import type { IInflection } from './types';
import type { ILexeme } from './types';
//import type { LexemeDict } from './types';

// Create a writable store to hold the current user profile
const initialInflection: IInflection | null = null;
const initialLexeme: ILexeme | null = null;
export const currentInflection = writable<IInflection | null>(initialInflection);
export const currentLexeme = writable<ILexeme | null>(initialLexeme);
//export const lexemes= writable<Lexeme[]>([]);
export let lexemes: ILexeme[] = [];
//export let lexemes: LexemeDict = {};
