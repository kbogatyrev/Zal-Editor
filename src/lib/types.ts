
export interface IInflection {
    seqNum: number;
    inflectionId: number;
    inflectionType: string;
    accentType1: string;
    accentType2: string;
    aspectPair: string;
    altAspectPair: string;
}

export interface ILexeme {
    seqNum: number
    lexemeId: number;
    sourceForm: string;
    homonyms: string[];
    mainSymbol: string;
    partOfSpeech: string;
    isTransitive: boolean;
//    spryazhSm
//  spryazhSmRef
    section: number;
    inflections: object[];
}

export interface IWordFormNoun
{
    wordForm: string;
    subParadigm: string;
    case: string;
    number: string;
    isIrregular: boolean;
    isDifficult: boolean;
    status: string;
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
    [inflectionId: number]: IPresentTenseTable[][];
}

export interface IPastTenseTableEntry
{
    number: string;
    person: string;
    form: string;
    isIrregular: string;
    isDifficult: boolean;
    isAssumed: boolean;
}

export interface IPastTenseTable {
    [inflectionId: number]: IPastTenseTable[][];
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
    [inflectionId: number]: IImperativeTable[][];
}
