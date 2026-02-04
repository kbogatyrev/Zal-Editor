
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
}
