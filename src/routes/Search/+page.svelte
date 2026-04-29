<script lang="ts">

    import { slide } from 'svelte/transition';

// Props
    import type {
        INounTable, INounTableEntry, IAdjLongTable, IAdjLongTableEntry,
        IAdjShortTable, IAdjShortTableEntry,
        IComparativesEntry, IComparatives,
        IPresentTenseTableEntry, IPresentTenseTable,
        IPastTenseTableEntry, IPastTenseTable,
        IImperativeTableEntry, IImperativeTable,
        ILexeme, IInflection, IBaseParticiplesTable, IBaseParticiplesTableEntry
    } from "$lib/types";

    import {caseToHash, numberToHash, genderToHash} from "$lib/stores";
    import {presentTenseToPerson} from "$lib/stores.ts";

    function preventDefault(fn: Function) {
        return (e: Event) => {
            e.preventDefault();
            fn();
        };
    }

    let prompt: string = 'Введите слово...';
    let btnText: string = 'Искать';
    let inputValue: string = $state('');
    let lexemeDescr: object[];
    let lexemes = $state([]);
    let nounTable: INounTable = $state({});
    let adjLongTable: IAdjLongTable = $state({});
    let adjShortTable: IAdjShortTable = $state({});
    let comparatives: IComparatives = $state({});
    let presentTenseTable: IPresentTenseTable = $state({});
    let pastTenseTable: IPastTenseTable = $state({});
    let imperativeTable: IImperativeTable = $state({});
    let presActLongTable: IAdjLongTable = $state({});
    let adverbialPresent: IBaseParticiplesTable = $state({});
    let partPresActBase: IBaseParticiplesTable = $state({});
    let partPresPassBase: IBaseParticiplesTable = $state({});
    let partPastActBase: IBaseParticiplesTable = $state({});
    let partPastPassBase: IBaseParticiplesTable = $state({});
    let presPassLongTable: IAdjLongTable = $state({});
    let presPassShortTable: IAdjShortTable = $state({});
    let pastActLongTable: IAdjLongTable = $state({});
    let pastPassLongTable: IAdjLongTable = $state({});
    let pastPassShortTable: IAdjShortTable = $state({});
    let adverbialPast: IBaseParticiplesTable = $state({});

    let showLongPresAct: boolean = $state(false);
    let expandPresPass: boolean = $state(false);
    let showLongPastAct: boolean = $state(false);
    let showLongPastPass: boolean = $state(false);

    let mapInflectionToLexeme = new Map<number, ILexeme>();

    const triangle: string = '\u25B3';
    const largeAsterisk = '\uFF0A';

    function getNounTableTemplate()
    {
        const declRowTemplate = { number: '', case: '', form: '', isIrregular: '', isDifficult: false, isAssumed: false };

        let table = [];
        for (let caseName of ['N', 'A', 'G', 'D', 'P', 'I']) {
            let row = [];
            for (let number of ['Sg', 'Pl']) {
                row.push({...declRowTemplate, number: number, case: caseName});
            }
            table.push(row);
        }
        return table;
    }

    function getAdjLongTableTemplate()
    {
        const declRowTemplate = { gender: '', number: '', case: '', form: '', isIrregular: '', isDifficult: false, isAssumed: false };

        let table = [];
        for (let caseName of ['N', 'A', 'A (anim)', 'G', 'D', 'P', 'I']) {
            let row = [];
            for (let col of ['m', 'f', 'n', 'Pl']) {
                if (col === 'Pl') {
                    row.push({...declRowTemplate, number: 'Pl', case: caseName});
                }
                else{
                    row.push({...declRowTemplate, gender: col, number: 'Sg', case: caseName});
                }
            }
            table.push(row);
        }
        return table;
    }

    function getAdjShortTableTemplate()
    {
        const rowTemplate = { gender: '', number: '', form: '', isIrregular: '', isDifficult: false, isAssumed: false };

        let table = [];
        let row = [];
        for (let col of ['m', 'f', 'n', 'Pl']) {
            if (col === 'Pl') {
                row.push({...rowTemplate, subParadigm: 'ShortAdj', number: 'Pl'});
            }
            else{
                row.push({...rowTemplate, subParadigm: 'ShortAdj', gender: col, number: 'Sg'});
            }
        }
        table.push(row);

//        console.log ('ShortAdj template', table);

        return table;
    }

    function getComparativesTableTemplate()
    {
        const rowTemplate = { form: '', isIrregular: '', isDifficult: false, isAssumed: false };
        return rowTemplate;
    }

    function getPresentTenseTableTemplate()
    {
        const rowTemplate = { number: '', person: '', form: '', isIrregular: '', isDifficult: false, isAssumed: false };
        let table = [];
        for (let personName of ['1', '2', '3']) {
            let row = [];
            for (let numberName of ['Sg', 'Pl']) {
                row.push({...rowTemplate, number: numberName, person: personName});
            }
            table.push(row);
        }
        console.log ('Present tense template', table);
        return table;
    }

    function getPastTenseTableTemplate()
    {
        const rowTemplate = { gender: '', number: '', form: '', isIrregular: '', isDifficult: false, isAssumed: false };

        let table = [];
        let row = [];
        for (let col of ['m', 'f', 'n', 'Pl']) {
            if (col === 'Pl') {
                row.push({...rowTemplate, subParadigm: 'PastTense', number: 'Pl'});
            }
            else{
                row.push({...rowTemplate, subParadigm: 'PastTense', gender: col, number: 'Sg'});
            }
        }
        table.push(row);

//        console.log ('Past tense template', table);

        return table;
    }

    function getImperativeTableTemplate()
    {
        const rowTemplate = { number: '', form: '', isIrregular: '', isDifficult: false, isAssumed: false };

        let table = [];
        let row = [];
        for (const col of ['Sg', 'Pl']) {
            row.push({...rowTemplate, subParadigm: 'Imperative', number: col});
        }
        table.push(row);
        return table;
    }

    function getBaseParticiplesTableTemplate(subParadigm: string)
    {
        const rowTemplate = { subParadigm: subParadigm, form: '', isIrregular: '', isDifficult: false, isAssumed: false };
        return {...rowTemplate};
    }

    function handleNounForms(inflectionId: number, jsonForms: Array<any>)
    {
        nounTable[inflectionId] = getNounTableTemplate();
        for (const [,form] of jsonForms.entries()) {
            let formCase: string = caseToHash.get(form['case']) || '';
            let formNumber: string = numberToHash.get(form['number']) || '';
            let isIrregular: boolean = form['isIrregular'] !== undefined && form['isIrregular'];
            let isDifficult: boolean = form['isDifficult'] !== undefined && form['isDifficult'];
            let isAssumed: boolean = form['status'] === 'Assumed';
            if (formCase !== '' && (formNumber === 'Sg' || formNumber === 'Pl')) {
                const findCell = nounTable[inflectionId].flat().find(item => item.case === formCase && item.number === formNumber);
                if (findCell) {
                    findCell.form = form['wordForm'];
                    if (isIrregular) {
                        findCell.isIrregular = triangle;
                    }
                    if (isDifficult) {
                        findCell.isDifficult = true;
                    }
                    if (isAssumed) {
                        findCell.isAssumed = true;
//                        findCell.form = supQuestionMark + form['wordForm'];
//                        console.log('*** Assumed form', findCell.form);
                    }
                } else {
                    console.log('*** Noun entry not found');
                }
            }
        }
//        console.log (nounTable);
    }

    const getNounFormClass = (item: INounTableEntry) => {
        if (item.isDifficult) return "col-difficult-form";
        return "col-form";
    };

    function handleLongForms(inflectionId: number, subParadigm: string, jsonForms: Array<any>)
    {
        let targetContainer: IAdjLongTable;
        switch (subParadigm) {
            case 'LongAdj':
                targetContainer = adjLongTable;
                break;
            case 'PartPresAct':
                targetContainer = presActLongTable;
                break;
            case 'PartPresPassLong':
                targetContainer = presPassLongTable;
                break;
            case 'PartPastAct':
                targetContainer = pastActLongTable;
                break;
            case 'PartPastPassLong':
                targetContainer = pastPassLongTable;
                break;
            default:
                console.log('*** Unknown subParadigm: ', subParadigm);
                alert("Internal error.");
                return;
        }

        targetContainer[inflectionId] = getAdjLongTableTemplate();
        let table = targetContainer[inflectionId];
        for (const [,form] of jsonForms.entries()) {
            if (subParadigm !== form['subParadigm']) continue;
            let formCase: string = caseToHash.get(form['case']) || '';
            let formNumber: string = numberToHash.get(form['number']) || '';
            let formGender: string = genderToHash.get(form['gender']) || '';
            let isIrregular: boolean = form['isIrregular'] !== undefined && form['isIrregular'];
            let isDifficult: boolean = form['isDifficult'] !== undefined && form['isDifficult'];
            let isAssumed: boolean = form['status'] === 'Assumed';
            let findCell = undefined;
            if (formCase !== '' && formNumber === 'Sg' && (formGender === 'm' || formGender === 'f' || formGender === 'n')) {
                findCell = table.flat().find(item => item.case === formCase && item.gender === formGender);
            }
            else if (formCase !== '' && formNumber === 'Pl' ) {
                findCell = table.flat().find(item => item.case === formCase && item.number === formNumber);
            }
            if (findCell) {
                findCell.form = form['wordForm'];
                if (isIrregular) {
                    findCell.isIrregular = triangle;
                }
                if (isDifficult) {
                    findCell.isDifficult = true;
                }
                if (isAssumed) {
                    findCell.isAssumed = true;
                }
            } else {
                console.log('*** Long form not found');
            }
//            console.log ('******* ', findCell);
        }

        let gSgM = table.flat().find(item => item.case === 'G' && item.gender === 'm' && item.number==='Sg');
        let aAnimSgM = table.flat().find(item => item.case === 'A (anim)' && item.gender === 'm' && item.number==='Sg');
        if (gSgM && aAnimSgM) {
            aAnimSgM.form = gSgM.form;
        }

        let gPl = table.flat().find(item => item.case === 'G' && item.number==='Pl');
        let aAnimPl = table.flat().find(item => item.case === 'A (anim)' && item.number==='Pl');
        if (gPl && aAnimPl) {
            aAnimPl.form = gPl.form;
        }

        console.log ('==============================', table);
    }       //  handleLongForms

    function handleShortForms(inflectionId: number, subParadigm: string, jsonForms: Array<any>)
    {
        let targetContainer: IAdjShortTable;

        switch (subParadigm) {
            case 'ShortAdj':
                targetContainer = adjShortTable;
                break;
            case 'PartPresPassShort':
                targetContainer = presPassShortTable;
                break;
            case 'PartPastPassShort':
                targetContainer = pastPassShortTable;
                break;
            default:
                console.log('*** Unknown subParadigm: ', subParadigm);
                alert("Internal error.");
                return;
        }

        targetContainer[inflectionId] = getAdjShortTableTemplate();
        let table = targetContainer[inflectionId];
        for (const [,form] of jsonForms.entries()) {
            if (subParadigm !== form['subParadigm']) continue;
            let formNumber: string = numberToHash.get(form['number']) || '';
            let formGender: string = genderToHash.get(form['gender']) || '';
            let isIrregular: boolean = form['isIrregular'] !== undefined && form['isIrregular'];
            let isDifficult: boolean = form['isDifficult'] !== undefined && form['isDifficult'];
            let isAssumed: boolean = form['status'] === 'Assumed';
            let findCell = undefined;
            if (formNumber != '' && formNumber === 'Sg' && (formGender === 'm' || formGender === 'f' || formGender === 'n')) {
                findCell = table.flat().find(item => item.gender === formGender && item.number==='Sg');
            }
            else if (formNumber === 'Pl' ) {
                findCell = table.flat().find(item => item.number === formNumber);
            }
            if (findCell) {
                findCell.form = form['wordForm'];
                if (isIrregular) {
                    findCell.isIrregular = triangle;
                }
                if (isDifficult) {
                    findCell.isDifficult = true;
                }
                if (isAssumed) {
                    findCell.isAssumed = true;
                }
            } else {
                console.log('*** Short form not found');
            }
//            console.log(form);

//            findCell = adjTableShort[inflectionId].flat().find(item => item.gender === formGender && item.number === formNumber);
//            console.log ('******* ', findCell);
        }
        console.log ('=======================', adjShortTable);

    }       //  handleShortForms

    function handleComparatives(inflectionId: number, jsonForms: Array<any>)
    {
        comparatives[inflectionId] = getComparativesTableTemplate();
        for (const [,form] of jsonForms.entries()) {
            let formSubParadigm: string = form['subParadigm'] || '';
            let isIrregular: boolean = form['isIrregular'] !== undefined && form['isIrregular'];
            let isDifficult: boolean = form['isDifficult'] !== undefined && form['isDifficult'];
            let isAssumed: boolean = form['status'] === 'Assumed';
            let entry = undefined;
            if (formSubParadigm === 'Comparative') {
                entry = comparatives[inflectionId];
                entry.form = form['wordForm'];
                entry.isIrregular = isIrregular ? triangle : '';
                entry.isDifficult = isDifficult;
                entry.isAssumed = isAssumed;
            }
        }
    }

    function handlePresentTenseForms(inflectionId: number, jsonForms: Array<any>)
    {
        presentTenseTable[inflectionId] = getPresentTenseTableTemplate();
        for (const [,form] of jsonForms.entries()) {
            let formSubParadigm: string = form['subParadigm'] || '';
            if (formSubParadigm !== 'PresentTense') continue;

            let formPerson: string = presentTenseToPerson.get(form['person']) || '';
            let formNumber: string = numberToHash.get(form['number']) || '';
            let isIrregular: boolean = form['isIrregular'] !== undefined && form['isIrregular'];
            let isDifficult: boolean = form['isDifficult'] !== undefined && form['isDifficult'];
            let isAssumed: boolean = form['status'] !== undefined && form['status'] === 'Assumed';
            if (formPerson !== '' && (formNumber === 'Sg' || formNumber === 'Pl')) {
                const findCell = presentTenseTable[inflectionId].flat().find(item => item.person === formPerson && item.number === formNumber);
                if (findCell) {
                    findCell.form = form['wordForm'];
                    if (isIrregular) {
                        findCell.isIrregular = triangle;
                    }
                    if (isDifficult) {
                        findCell.isDifficult = true;
                    }
                    if (isAssumed) {
                        findCell.isAssumed = true;
//                        findCell.form = supQuestionMark + form['wordForm'];
//                        console.log('*** Assumed form', findCell.form);
                    }
                } else {
                    console.log('*** Present tense form not found');
                }
            }
        }
    }

    function handlePastTenseForms(inflectionId: number, jsonForms: Array<any>)
    {
        pastTenseTable[inflectionId] = getPastTenseTableTemplate();
        for (const [,form] of jsonForms.entries()) {
            if (form['subParadigm'] !== 'PastTense') continue;
            let formNumber: string = numberToHash.get(form['number']) || '';
            let formGender: string = genderToHash.get(form['gender']) || '';
            let isIrregular: boolean = form['isIrregular'] !== undefined && form['isIrregular'];
            let isDifficult: boolean = form['isDifficult'] !== undefined && form['isDifficult'];
            let isAssumed: boolean = form['status'] === 'Assumed';
            let findCell = undefined;
            if (formGender === 'm' || formGender === 'f' || formGender === 'n') {
                findCell = pastTenseTable[inflectionId].flat().find(item => item.gender === formGender && item.number==='Sg');
            }
//            else if (formNumber === 'Pl' ) {          // need to fix Node
            else {
//                findCell = pastTenseTable[inflectionId].flat().find(item => item.number === formNumber);
                findCell = pastTenseTable[inflectionId].flat().find(item => item.gender === '');
            }
            if (findCell) {
                findCell.form = form['wordForm'];
                if (isIrregular) {
                    findCell.isIrregular = triangle;
                }
                if (isDifficult) {
                    findCell.isDifficult = true;
                }
                if (isAssumed) {
                    findCell.isAssumed = true;
                }
            } else {
                console.log('*** Past tense form not found');
            }
        }
    }

    function handleImperativeForms(inflectionId: number, jsonForms: Array<any>)
    {
        imperativeTable[inflectionId] = getImperativeTableTemplate();
        for (const [,form] of jsonForms.entries()) {
            if (form['subParadigm'] !== 'Imperative') continue;
            let formNumber: string = numberToHash.get(form['number']) || '';
            let isIrregular: boolean = form['isIrregular'] !== undefined && form['isIrregular'];
            let isDifficult: boolean = form['isDifficult'] !== undefined && form['isDifficult'];
            let isAssumed: boolean = form['status'] === 'Assumed';
            let findCell = undefined;
//            else if (formNumber === 'Pl' ) {          // need to fix Node
//                findCell = pastTenseTable[inflectionId].flat().find(item => item.number === formNumber);
            findCell = imperativeTable[inflectionId].flat().find(item => item.number === formNumber);
            if (findCell) {
                findCell.form = form['wordForm'];
                if (isIrregular) {
                    findCell.isIrregular = triangle;
                }
                if (isDifficult) {
                    findCell.isDifficult = true;
                }
                if (isAssumed) {
                    findCell.isAssumed = true;
                }
            } else {
                console.log('*** Imperative form not found');
            }
        }
    }

    function handlePartBaseForm(inflectionId: number, subParadigm:string, jsonForms: Array<any>)
    {
        console.log(jsonForms);
        let partBase = getBaseParticiplesTableTemplate(subParadigm);
        for (const [,form] of jsonForms.entries()) {
            let formCase: string = caseToHash.get(form['case']) || '';
            let formNumber: string = numberToHash.get(form['number']) || '';
            let formGender: string = genderToHash.get(form['gender']) || '';
            let isIrregular: boolean = form['isIrregular'] !== undefined && form['isIrregular'];
            let isDifficult: boolean = form['isDifficult'] !== undefined && form['isDifficult'];
            let isAssumed: boolean = form['status'] === 'Assumed';
            if (subParadigm === form['subParadigm']
                && formGender === 'm' &&  formNumber === 'Sg' && formCase === 'N') {
                if (partBase) {
                    partBase.form = form['wordForm'];
                    partBase.isIrregular = isIrregular ? triangle : '';
                    }
                    if (isDifficult) {
                        partBase.isDifficult = true;
                    }
                    if (isAssumed) {
                        partBase.isAssumed = true;
//                        findCell.form = supQuestionMark + form['wordForm'];
//                        console.log('*** Assumed form', findCell.form);
                    }
            }
        }

        if (!partBase.form) {
            console.log('*** %s base form not found');
            return;
        }

        switch (subParadigm) {
            case 'PartPresAct':
                partPresActBase[inflectionId] = partBase;
                break;
            case 'PartPresPassLong':
                partPresPassBase[inflectionId] = partBase;
                break;
            case 'PartPastAct':
                partPastActBase[inflectionId] = partBase;
                break;
            case 'PartPastPassLong':
                partPastPassBase[inflectionId] = partBase;
                break;
            default:
                console.log('*** Unknown subParadigm: ', subParadigm);
        }
//        console.log ('============================================== Base form: ', partBase);
    }

    function handleAdverbials(inflectionId: number, subParadigm:string, jsonForms: Array<any>)
    {
        console.log(jsonForms);
        let adverbial = getBaseParticiplesTableTemplate(subParadigm);
        for (const [,form] of jsonForms.entries()) {
            let isIrregular: boolean = form['isIrregular'] !== undefined && form['isIrregular'];
            let isDifficult: boolean = form['isDifficult'] !== undefined && form['isDifficult'];
            let isAssumed: boolean = form['status'] === 'Assumed';
            if (subParadigm === form['subParadigm']) {
                adverbial.form = form['wordForm'];
                adverbial.isIrregular = isIrregular ? triangle : '';
                if (isDifficult) {
                    adverbial.isDifficult = true;
                }
                if (isAssumed) {
                    adverbial.isAssumed = true;
//                        findCell.form = supQuestionMark + form['wordForm'];
//                        console.log('*** Assumed form', findCell.form);
                }
            }
        }

        if (!adverbial.form) {
            console.log('*** %s not found');
            return;
        }

        if (subParadigm === 'AdverbialPresent') {
            adverbialPresent[inflectionId] = adverbial;
        }
        else if (subParadigm === 'AdverbialPast') {
            adverbialPast[inflectionId] = adverbial;
        }
        else {
            console.log('*** Unknown subParadigm: ', subParadigm);
        }
//        console.log ('============================================== Adverbial: ', adverbial);

    }       //  handleAdverbials()

    const getAdjLongFormClass = (item: IAdjLongTableEntry) => {
        if (item.isDifficult) return "col-difficult-form";
        return "col-form";
    };

    const getAdjShortFormClass = (item: IAdjShortTableEntry) => {
        if (item.isDifficult) return "col-difficult-form";
        return "col-form";
    };

    const getComparativeClass = (item: IComparativesEntry | undefined) => {
        if (!item || item.isDifficult) return "col-difficult-form";
        return "comparative-form";
    };

    const getPresentTenseClass = (item: IPresentTenseTableEntry | undefined) => {
        if (!item || item.isDifficult) return "col-difficult-form";
        return "col-form";
    };

    const getPastTenseFormClass = (item: IAdjShortTableEntry) => {
        if (item.isDifficult) return "col-difficult-form";
        return "col-form";
    };

    const getImperative = (item: IImperativeTableEntry) => {
        if (item.isDifficult) return "col-difficult-form";
        return "col-form";
    };

    const getParticipleListClass = (item: IBaseParticiplesTableEntry | undefined) => {
        if (!item || item.isDifficult) return "col-difficult-form-no-border";
        return "col-form-no-border";
    };

    async function requestForms(inflectionId: number)
    {
        console.log('Requesting forms for inflection ID: ' + inflectionId);
        try {
            const response = await fetch(`http://localhost:8088/forms?inflection-id=${inflectionId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            let resp = await response.json(); // Assign the fetched data
            let forms = resp['wordForms'];
            if (forms.length === 0) {
                console.log('No forms');
                return;
            }

            let lexeme = mapInflectionToLexeme.get(inflectionId);
            if (lexeme === undefined) {
                console.log('Lexeme not found for inflection ID: ' + inflectionId);
                return;
            }

            if(lexeme['partOfSpeech'] === 'Noun'
                || lexeme['partOfSpeech'] === 'Pronoun'
                || lexeme['partOfSpeech'] === 'Numeral') {
                handleNounForms(inflectionId, forms);
            }
            else if (lexeme['partOfSpeech'] === 'Adj') {
                handleLongForms(inflectionId, 'LongAdj', forms);
                handleShortForms(inflectionId, 'ShortAdj', forms);
                handleComparatives(inflectionId, forms);
           }
           else if (lexeme['partOfSpeech'] === 'Verb') {
               handlePresentTenseForms(inflectionId, forms);
               handlePastTenseForms(inflectionId, forms);
               handleImperativeForms(inflectionId, forms);
               handlePartBaseForm(inflectionId, 'PartPresAct', forms);
               handleLongForms(inflectionId, 'PartPresAct', forms);
               handleAdverbials(inflectionId, 'AdverbialPresent', forms);
               handlePartBaseForm(inflectionId, 'PartPresPassLong', forms);
               handleLongForms(inflectionId, 'PartPresPassLong', forms);
               handleShortForms(inflectionId, 'PartPresPassShort', forms);
               handlePartBaseForm(inflectionId, 'PartPastAct', forms);
               handleLongForms(inflectionId, 'PartPastAct', forms);
               handlePartBaseForm(inflectionId, 'PartPastPassLong', forms);
               handleLongForms(inflectionId, 'PartPastPassLong', forms);
               handleShortForms(inflectionId, 'PartPastPassShort', forms);
               handleAdverbials(inflectionId, 'AdverbialPast', forms);
           }
           else {
                console.log('*** ', lexeme['partOfSpeech'], 'is not supported yet');
           }
        }
        catch (err: any) {
//            error: string = err.message;
            console.log('Error: ' + err.message);
            return;
        } finally {
//            let isLoading: boolean = false;
        }
    }

    async function handleLexemeData() {
        for (let i:number = 0; i < lexemeDescr.length; i++)
        {
            let lexemeData = lexemeDescr[i];
            let lexeme: ILexeme = {
                seqNum: i + 1,
                lexemeId: lexemeData['lexemeId'],
                sourceForm: lexemeData['sourceForm'],
                homonyms: [],
                headwordComment: lexemeData['headwordComment'],
                lexTrailingComment: lexemeData['lexTrailingComment'],
                mainSymbol: lexemeData['mainSymbol'],
                partOfSpeech: lexemeData['partOfSpeech'],
                isTransitive: lexemeData['isTransitive'],
                section: lexemeData['section'],
                inflections: []
            };

            if ('homonyms' in lexemeData) {
                lexeme.homonyms = Object.values(lexemeData['homonyms']);
            }

            if ('inflections' in lexemeData) {
                let inflectionsData = lexemeData['inflections'];
                for (let j: number = 0; j < inflectionsData.length; j++) {
                    let inflectionData = inflectionsData[j];
                    let inflection: IInflection = {
                        seqNum: i + j + 1,
                        inflectionId: inflectionData['inflectionId'],
                        inflectionType: inflectionData['inflectionType'],
                        accentType1: inflectionData['accentType1'],
                        accentType2: inflectionData['accentType2'],
                        aspectPairs: inflectionData['aspectPairs'],
                        altAspectPair: inflectionData['altAspectPair']
                    };
                    lexeme.inflections.push(inflection);
                    mapInflectionToLexeme.set(inflection.inflectionId, lexeme);
                }
            }
            lexemes.push(lexeme);
        }

        for(let lexeme of lexemes) {
//            console.log('Lexeme ID: ', lexeme.lexemeId);
            await Promise.all(
                lexeme.inflections.map(inflection => requestForms(inflection.inflectionId))
            );
        }
    }

    async function handleClick() {
        try {
//            console.log('Input value: ' + inputValue);
            const response = await fetch(`http://localhost:8088/query?word=${inputValue}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            lexemeDescr = await response.json(); // Assign the fetched data

            if (lexemeDescr.length === 0) {
                console.log('No lexeme data');
                return;
            }
        }
        catch (err: any) {
//            error: string = err.message;
            console.log('Error: ' + err.message);
            return;
        } finally {
//            isLoading = false;
        }

        lexemes.length = 0;
        handleLexemeData();
    }

    const presActToggleExpand = () => {
        showLongPresAct = !showLongPresAct;
    }
    const presPassToggleExpand = () => {
        expandPresPass = !expandPresPass;
    }
    const pastActToggleExpand = () => {
        showLongPastAct = !showLongPastAct;
    }
    const pastPassToggleExpand = () => {
        showLongPastPass = !showLongPastPass;
    }
</script>

{#snippet longForms(inflection, table)}
    <div class="section-subheading">Long Forms</div>
    <table class="paradigm-table">
        <colgroup>
            <col class="col-adj-case" span="1"/>
            <col class="col-form" span="4"/>
        </colgroup>
        <thead class="paradigm-header">
        <tr>
            <th class="col-adj-case"></th>
            <th class="col-head">m</th>
            <th class="col-head">f</th>
            <th class="col-head">n</th>
            <th class="col-head">Pl</th>
        </tr>
        </thead>
        <tbody>
        {#each table[inflection.inflectionId] as item}
            <tr>
                <td class="col-adj-case">{item[0].case}</td>
                <td class={getAdjLongFormClass(item[0])}>
                    {#if item[0].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                    {item[0].form}
                    {item[0].isIrregular}
                </td>
                {#if item[1].case === 'A' && item[1].number === 'Sg'}
                    <td class={getAdjLongFormClass(item[1])} rowspan="2">
                        {#if item[1].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                        {item[1].form}
                        {item[1].isIrregular}
                    </td>
                {:else if item[1].case !== 'A (anim)'}
                    <td class={getAdjLongFormClass(item[1])}>
                        {#if item[1].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                        {item[1].form}
                        {item[1].isIrregular}
                    </td>
                {/if}
                {#if item[2].case === 'A' && item[2].number === 'Sg'}
                    <td class={getAdjLongFormClass(item[2])} rowspan="2">
                        {#if item[2].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                        {item[2].form}
                        {item[2].isIrregular}
                    </td>
                {:else if item[2].case !== 'A (anim)'}
                    <td class={getAdjLongFormClass(item[2])}>
                        {#if item[2].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                        {item[2].form}
                        {item[2].isIrregular}
                    </td>
                {/if}
                <td class={getAdjLongFormClass(item[3])}>
                    {#if item[3].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                    {item[3].form}
                    {item[3].isIrregular}
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
{/snippet}

{#snippet shortForms(inflection, table)}
    <div class="section-subheading">Short Forms</div>
    <table class="paradigm-table">
        <colgroup>
            <col class="col-form" span="4"/>
        </colgroup>
        <thead class="paradigm-header">
        <tr>
            <th class="col-head">m</th>
            <th class="col-head">f</th>
            <th class="col-head">n</th>
            <th class="col-head">Pl</th>
        </tr>
        </thead>
        <tbody>
        {#each table[inflection.inflectionId] as item}
            <tr>
                <td class={getAdjShortFormClass(item[0])}>
                    {#if item[0].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                    {item[0].form}
                    {item[0].isIrregular}
                </td>
                <td class={getAdjShortFormClass(item[1])}>
                    {#if item[1].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                    {item[1].form}
                    {item[1].isIrregular}
                </td>
                <td class={getAdjShortFormClass(item[2])}>
                    {#if item[2].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                    {item[2].form}
                    {item[2].isIrregular}
                </td>
                <td class={getAdjShortFormClass(item[3])}>
                    {#if item[3].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                    {item[3].form}
                    {item[3].isIrregular}
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
{/snippet}

{#snippet comparative(inflection)}
    <div class="section-subheading">Comparative</div>
    {#if comparatives[inflection.inflectionId] && comparatives[inflection.inflectionId].form}
        <div class={getComparativeClass(comparatives[inflection.inflectionId])} />
        {#if comparatives[inflection.inflectionId].isAssumed}<sup>{largeAsterisk}</sup>{/if}
        {comparatives[inflection.inflectionId].form}
        {comparatives[inflection.inflectionId].isIrregular}
    {/if}
{/snippet}

<h1>Поиск в словаре</h1>
<div class="prompt-container">
<!--    <form onsubmit={handleClick}>    -->
    <form class="word-entry" onsubmit={preventDefault(handleClick)}>
        <label>
            <input type="text"
                   bind:value={inputValue}
                   placeholder="Введите слово..." />
        </label>
    <button type="submit">{btnText}</button>
    </form>
</div>

{#each lexemes as lexProp (lexProp.seqNum)}
    <div class="display-container">
        <div class="lexeme-container">
            <div class="lex-row">
                <div class="lex-col">Lexeme ID:</div>
                <div class="lex-col">{lexProp.lexemeId}</div>
            </div>
            <div class="lex-row">
                <div class="lex-col">Source form:</div>
                <div class="lex-col">{lexProp.sourceForm}</div>
            </div>
            {#if lexProp.homonyms.length > 0}
                <div class="lex-row">
                    <div class="lex-col">Homonyms:</div>
                    <div class="lex-col">{lexProp.homonyms.join(', ')}</div>
                </div>
            {/if}
            {#if lexProp.headwordComment}
                <div class="lex-row">
                    <div class="lex-col">Headword comment:</div>
                    <div class="lex-col">{lexProp.headwordComment}</div>
                </div>
            {/if}
            {#if lexProp.lexTrailingComment}
                <div class="lex-row">
                    <div class="lex-col">Trailing comment:</div>
                    <div class="lex-col">{lexProp.lexTrailingComment}</div>
                </div>
            {/if}
            <div class="lex-row">
                <div class="lex-col">Part of speech:</div>
                <div class="lex-col">{lexProp.partOfSpeech}</div>
            </div>
            <div class="lex-row">
                <div class="lex-col">Main symbol:</div>
                <div class="lex-col">{lexProp.mainSymbol}</div>
            </div>
            {#each lexProp.inflections as inflection (inflection.seqNum)}
                <div class="inflection-container">
                    <div class="lex-row">
                        <div class="lex-col">Inflection ID:</div>
                        <div class="lex-col">{inflection.inflectionId}</div>
                    </div>
                    <div class="lex-row">
                        <div class="lex-col">Inflection type:</div>
                        <div class="lex-col">{inflection.inflectionType}</div>
                    </div>
                    <div class="lex-row">
                        <div class="lex-col">Accent type:</div>
                        <div class="lex-col">{inflection.accentType1}</div>
                    </div>
                    {#if inflection.aspectPairs.length > 0}
                        {#each inflection.aspectPairs as aspectPair (aspectPair.seqNum)}
                            <div class="lex-row">
                                <div class="lex-col">Aspect pair:</div>
                                <div class="lex-col">{inflection.aspectPairs[0]}</div>
                            </div>
                        {/each}
                    {/if}
                </div>
            {/each}
        </div>      <!-- lexeme-container  -->

        <div class="right-panel">
            {#each lexProp.inflections as inflection (inflection.seqNum)}
                {#if lexProp['partOfSpeech'] == 'Noun'
                    || lexProp['partOfSpeech'] == 'Pronoun'
                    || lexProp['partOfSpeech'] == 'Numeral'}
                    <!--  NOUN               -->
                    <table class="paradigm-table">
                    <thead class="paradigm-header">
                        <tr>
                            <th class="col-noun-case"></th>
                            <th class="col-head">Sg</th>
                            <th class="col-head">Pl</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each nounTable[inflection.inflectionId] as itemPair}
                            <tr>
                                <td class="col-noun-case">{itemPair[0].case}</td>
                                <td class={getNounFormClass(itemPair[0])}>
                                    {#if itemPair[0].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                    {itemPair[0].form}
                                    {itemPair[0].isIrregular}
                                </td>
                                <td class={getNounFormClass(itemPair[1])}>
                                    {#if itemPair[1].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                    {itemPair[1].form}
                                    {itemPair[1].isIrregular}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                    </table>
                {/if}

                <!--  ADJECTIVES          -->
                {#if lexProp['partOfSpeech'] == 'Adj'}
                    <!--  ADJ               -->
                    {@render longForms(inflection, adjLongTable)}
                    {@render shortForms(inflection, adjShortTable)}
                    {@render comparative(inflection)}
                {/if}                           <!-- if adj -->
                <!-- END ADJ -->

                <!--  VERB -->
                {#if lexProp['partOfSpeech'] == 'Verb'}
                    <div class="section-heading">Present Tense</div>
                    <table class="paradigm-table">
                        <thead class="paradigm-header">
                        <tr>
                            <th class="col-present-tense-person"></th>
                            <th class="col-head">Sg</th>
                            <th class="col-head">Pl</th>
                        </tr>
                        </thead>
                        <tbody>
                        {#each presentTenseTable[inflection.inflectionId] as itemPair}
                            <tr>
                                <td class="col-present-tense-person">{itemPair[0].person}</td>
                                <td class={getPresentTenseClass(itemPair[0])}>
                                    {#if itemPair[0].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                    {itemPair[0].form}
                                    {itemPair[0].isIrregular}
                                </td>
                                <td class={getPresentTenseClass(itemPair[1])}>
                                    {#if itemPair[1].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                    {itemPair[1].form}
                                    {itemPair[1].isIrregular}
                                </td>
                            </tr>
                        {/each}
                        </tbody>
                    </table>

                    <div class="section-heading">Past Tense</div>
                    <table class="paradigm-table">
                        <colgroup>
                            <col class="col-form" span="4"/>
                        </colgroup>
                        <thead class="paradigm-header">
                        <tr>
                            <th class="col-head">m</th>
                            <th class="col-head">f</th>
                            <th class="col-head">n</th>
                            <th class="col-head">Pl</th>
                        </tr>
                        </thead>
                        <tbody>
                        {#each pastTenseTable[inflection.inflectionId] as item}
                            <tr>
                                <td class={getPastTenseFormClass(item[0])}>
                                    {#if item[0].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                    {item[0].form}
                                    {item[0].isIrregular}
                                </td>
                                <td class={getPastTenseFormClass(item[1])}>
                                    {#if item[1].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                    {item[1].form}
                                    {item[1].isIrregular}
                                </td>
                                <td class={getPastTenseFormClass(item[2])}>
                                    {#if item[2].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                    {item[2].form}
                                    {item[2].isIrregular}
                                </td>
                                <td class={getPastTenseFormClass(item[3])}>
                                    {#if item[3].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                    {item[3].form}
                                    {item[3].isIrregular}
                                </td>
                            </tr>
                        {/each}
                        </tbody>
                    </table>        <!-- end past tense  -->

                    <div class="section-heading">Imperative</div>
                    <table class="paradigm-table">
                        <thead class="paradigm-header">
                        <tr>
                            <th class="col-head">Sg</th>
                            <th class="col-head">Pl</th>
                        </tr>
                        </thead>
                        <tbody>
                        {#each imperativeTable[inflection.inflectionId] as itemPair}
                            <tr>
                                <td class={getPresentTenseClass(itemPair[0])}>
                                    {#if itemPair[0].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                    {itemPair[0].form}
                                    {itemPair[0].isIrregular}
                                </td>
                                <td class={getPresentTenseClass(itemPair[1])}>
                                    {#if itemPair[1].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                    {itemPair[1].form}
                                    {itemPair[1].isIrregular}</td>
                            </tr>
                        {/each}
                        </tbody>
                    </table>        <!-- imperative -->

                    <div class="section-heading">Participles & Adverbials</div>
                    {#if partPresActBase[inflection.inflectionId]}
                        <div class="participle-container">
                            <span class="section-subheading">Part. Pres. Active:</span>
                            <span class="base-form">
                                {#if partPresActBase[inflection.inflectionId].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                {partPresActBase[inflection.inflectionId].form}
                                {partPresActBase[inflection.inflectionId].isIrregular}
                            </span>
                            <button class="expand-btn"  onclick={() => presActToggleExpand()}>
                                <span class="icon" class:rotated={showLongPresAct}>&gt;</span>
                            </button>
                            {#if showLongPresAct }
                                <span class="slider" transition:slide>
                                        <span transition:slide={{duration: 300}} />
                                        {@render longForms(inflection, presActLongTable)}
                                </span>
                            {/if}
                        </div>
                    {/if}
                    {#if adverbialPresent[inflection.inflectionId]}
                        <div class="adverbial-container">
                            <span class="section-subheading">Pres. Adverbial:</span>
                            <span class="base-form">
                                {#if adverbialPresent[inflection.inflectionId].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                {adverbialPresent[inflection.inflectionId].form}
                                {adverbialPresent[inflection.inflectionId].isIrregular}
                            </span>
                        </div>
                    {/if}
                    {#if partPresPassBase[inflection.inflectionId]}
                        <div class="participle-container">
                            <span class="section-subheading">Part. Pres. Passive:</span>
                            <span class="base-form">
                                {#if partPresPassBase[inflection.inflectionId].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                {partPresPassBase[inflection.inflectionId].form}
                                {partPresPassBase[inflection.inflectionId].isIrregular}
                            </span>
                            <button class="expand-btn" onclick={() => presPassToggleExpand()}>
                                <span class="icon" class:rotated={expandPresPass}>&gt;</span>
                            </button>
                            <span class="slider" transition:slide>
                                {#if expandPresPass}
                                    {@render longForms(inflection, presPassLongTable)}
                                    {@render shortForms(inflection, presPassShortTable)}
                                {/if}
                            </span>
                        </div>
                    {/if}
                    {#if partPastActBase[inflection.inflectionId]}
                        <div class="participle-container">
                            <span class="section-subheading">Part. Past Active:</span>
                            <span class="base-form">
                                {#if partPastActBase[inflection.inflectionId].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                {partPastActBase[inflection.inflectionId].form}
                                {partPastActBase[inflection.inflectionId].isIrregular}
                            </span>
                            <button class="expand-btn" onclick={() => pastActToggleExpand() }>
                                <span class="icon" class:rotated={showLongPastAct}>&gt;</span>
                            </button>
                            <span class="slider" transition:slide>
                                {#if showLongPastAct }
                                    {@render longForms(inflection, pastActLongTable)}
                                {/if}
                            </span>
                        </div>
                    {/if}
                    {#if adverbialPast[inflection.inflectionId]}
                        <div class="adverbial-container">
                            <span class="section-subheading">Past Adverbial:</span>
                             <span class="base-form">
                                {#if adverbialPast[inflection.inflectionId].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                {adverbialPast[inflection.inflectionId].form}
                                {adverbialPast[inflection.inflectionId].isIrregular}
                             </span>
                        </div>
                    {/if}
                    {#if partPastPassBase[inflection.inflectionId]}
                        <div class="participle-container">
                            <span class="section-subheading">Part. Past Passive:</span>
                            <span class="base-form">
                                {#if partPastPassBase[inflection.inflectionId].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                {partPastPassBase[inflection.inflectionId].form}
                                {partPastPassBase[inflection.inflectionId].isIrregular}
                            </span>
                            <button class="expand-btn" onclick={() => pastPassToggleExpand() }>
                                <span class="icon" class:rotated={showLongPastPass}>&gt;</span>
                            </button>
                            <span class="slider" transition:slide>
                                {#if showLongPastPass }
                                    {@render longForms(inflection, pastPassLongTable)}
                                    {@render shortForms(inflection, pastPassShortTable)}
                                {/if}
                            </span>
                        </div>
                    {/if}
                {/if}           <!-- verb  -->
            {/each}
        </div>      <!-- right-panel  -->
    </div>      <!-- display-container  -->
{/each}

<style>
    .prompt-container {
        display: flex;
        flex-direction: row;
        border: 1px solid black;
        margin: 5px 0;
        background-color: #FFFAF0;
        margin-left: 15px;
        padding: 20px;
        max-width:350px;
        justify-content: center;
/*        border: #b3b3b3;    */
    }

    .word-entry {
        display: flex;
        flex-direction: row;
        justify-content:space-between;
        width: 300px;
    }

    .display-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
/*        padding: 20px;   */
        max-width: 1000px;
    }

    .lexeme-container {
        border: 1px solid black;
        display: flex;
        flex-direction: column;
        padding: 15px;
        margin: 5px 0;
        background-color: #FFFAF0;
        margin-left: 15px;
        padding: 20px;
        max-width: 350px;
        /*        border: #b3b3b3;    */
    }

    .lex-row {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        border-left: 1px solid #eee;
        /*        border-right: 1px solid #eee;  */
        padding-left: 25px;
        padding-right: 5px;
    }

    .lex-col {
        flex: 1;
    }

    .inflection-container {
        display: flex;
        flex-direction: column;
        margin: 5px 0;
        margin-left: 50px;
        padding: 5px;
        max-width: 350px;
    }

    .right-panel {
        padding: 20px;
        margin: 5px 0;
        column-gap: 50px;
        min-width: 300px;
    }

    .section-heading {
        font-weight: normal;
        font-size: larger;
        text-align: left;
        color: gray;
        margin-top: 25px;
        margin-bottom: 5px;
    }

    .paradigm-table {
        border-collapse: collapse;
        width: 100%;
        table-layout: fixed;
/*        margin-bottom: 25px;   */
        margin-left: 30px;
    }

    .paradigm-table row {
        padding: 20px;
    }

    .section-subheading {
        display: inline-block;
        width: 140px;
        font-weight: normal;
        font-size: medium;
        text-align: left;
        color: gray;
    }

    .base-form {
        display: inline-block;
        width: 150px;
    }

    .col-present-tense-person, .col-noun-case {
        width: 30px;
/*        background-color: #f3f4f6;    */
        color: gray;
        text-align: center;
        border: 1px solid #e5e7eb;
    }

    .col-adj-case {
        width: 100px;
/*        background-color: #f3f4f6;    */
        color: gray;
        text-align: center;
        border: 1px solid #e5e7eb;
    }

    .col-invisible {
        width: 100px;
        border-collapse: collapse;
        border: none;
    }

    .col-head {
        width: 175px;
        padding-left: 25px;
        padding-right: 25px;
        color: gray;
        text-align: center;
        font-weight: normal;
/*        border: none;   */
        border: 1px solid #e5e7eb;
    }

    .col-head-invisible {
        width: 175px;
        padding-left: 25px;
        padding-right: 25px;
        color: gray;
        text-align: center;
        font-weight: normal;
        border: none;
        border-collapse: collapse;
    }

    .paradigm-header {
        border-collapse: collapse;
        width: 175px;
        padding-left: 25px;
        padding-right: 25px;
        color: gray;
        text-align: center;
        font-weight: normal;
/*        border: none;    */
    }

    .col-form {
        width: 175px;
        padding-left: 25px;
        padding-right: 25px;
        border: 1px solid #e5e7eb;
    }

    .col-form-no-border {
        width: 175px;
        padding-left: 25px;
        padding-right: 25px;
        padding-bottom: 5px;
    }

    .comparative-form {
        padding-left: 25px;
        padding-right: 25px;
/*        border: 1px solid #e5e7eb;    */
        border-collapse: collapse;
        text-align: left;
    }

    comparative-difficult-form {
        width: 250px;
        padding-left: 25px;
        padding-right: 25px;
        padding-top: 2px;
        padding-bottom: 1px;

        font-style: italic;
        color:gray;
/*        border: 1px solid #e5e7eb;  */
        border-collapse: collapse;
    }

    .col-difficult-form {
        width: 250px;
        padding-left: 25px;
        padding-right: 25px;
                padding-top: 2px;
                padding-bottom: 1px;

        font-style: italic;
        color:gray;
        border: 1px solid #e5e7eb;
    }

    .col-difficult-form-no-border {
        width: 250px;
        padding-left: 25px;
        padding-right: 25px;
        padding-top: 2px;
        padding-bottom: 5px;
        font-style: italic;
        color:gray;
    }

    .expand-btn {
        padding-top: 0;
        margin-top: 0;
        background: none;
        height: 0;
/*        text-align: left;  */
/*        background: none;  */
/*        border: none;  */
/*        padding: 1rem;   */
        cursor: pointer;
/*        justify-content: space-between;   */
    }

    .participle-container {
        margin-left: 30px;
    }

    .adverbial-container {
        margin-left: 30px;
    }

    .icon {
        display: inline-block;
        color: black;
        transition: rotate 0.2s;
    }

    .rotated {
        rotate: 90deg;
    }
/* ----------------------------------------------------------------------*/

/*     .accordion {
         margin-bottom: 0;
     }
    .slider {
        border: 1px solid #eee;
        padding: 4px 20px;
    }
    */
/* ----------------------------------------------------------------------*/

</style>

