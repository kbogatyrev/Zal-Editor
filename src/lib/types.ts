
export interface IInflection {
    seqNum: number;
    inflectionId: number;
    inflectionType: string;
    accentType1: string;
    accentType2: string;
    aspectPair: string;
    altAspectPair: string;
    commonDeviations: string[];
}

export interface ILexeme {
    seqNum: number
    lexemeId: number;
    sourceForm: string;
    homonyms: string[];
    headwordComment: string;
    mainSymbol: string;
    partOfSpeech: string;
    isTransitive: boolean;
//    spryazhSm
//  spryazhSmRef
    section: number;
    inflections: object[];
}

export interface INounTableEntry
{
    number: string;
    case: string;
    form: string;
    isIrregular: string;
    isDifficult: boolean;
    isAssumed: boolean;
}

export interface INounTable {
    [inflectionId: number]: INounTableEntry[][];
}

export interface ILastNameTableEntry
{
    number: string;
    case: string;
    gender: string;
    form: string;
    isIrregular: string;
    isDifficult: boolean;
    isAssumed: boolean;
}

export interface ILastNameTable {
    [inflectionId: number]: ILastNameTableEntry[][];
}

export interface IAdjLongTableEntry
{
    gender: string;
    number: string;
    case: string;
    form: string;
    isIrregular: string;
    isDifficult: boolean;
    isAssumed: boolean;
}

export interface IAdjLongTable {
    [inflectionId: number]: IAdjLongTableEntry[][];
}

export interface IAdjShortTableEntry
{
    gender: string;
    number: string;
    form: string;
    isIrregular: string;
    isDifficult: boolean;
    isAssumed: boolean;
}

export interface IAdjShortTable {
    [inflectionId: number]: IAdjShortTableEntry[][];
}

export interface IComparativesEntry
{
    form: string;
    isIrregular: string;
    isDifficult: boolean;
    isAssumed: boolean;
}

export interface IComparatives {
    [inflectionId: number]: IComparativesEntry;
}

export interface IPresentTenseTableEntry
{
    number: string;
    person: string;
    form: string;
    isIrregular: string;
    isDifficult: boolean;
    isAssumed: boolean;
}

export interface IPresentTenseTable {
    [inflectionId: number]: IPresentTenseTableEntry[][];
}

export interface IPastTenseTableEntry
{
    number: string;
    gender: string;
    form: string;
    isIrregular: string;
    isDifficult: boolean;
    isAssumed: boolean;
}

export interface IPastTenseTable {
    [inflectionId: number]: IPastTenseTableEntry[][];
}

export interface IImperativeTableEntry
{
    number: string;
    form: string;
    isIrregular: string;
    isDifficult: boolean;
    isAssumed: boolean;
}

export interface IImperativeTable {
    [inflectionId: number]: IImperativeTableEntry[][];
}

export interface IBaseParticiplesTableEntry
{
    subParadigm: string;
    form: string;
    isIrregular: string;
    isDifficult: boolean;
    isAssumed: boolean;
}

export interface IBaseParticiplesTable {
    [inflectionId: number]: IBaseParticiplesTableEntry;
}

export interface IParticipleTableEntry {
    gender: string;
    number: string;
    case: string;
    form: string;
    isIrregular: string;
    isDifficult: boolean;
    isAssumed: boolean;
}

export interface IParticipleTable {
    [inflectionId: number]: IParticipleTableEntry[];
}
