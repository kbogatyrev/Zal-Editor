<script lang="ts">

    import { SvelteMap } from 'svelte/reactivity';

// Props
    import type { INounTable, INounTableEntry, IAdjLongTable, IAdjLongTableEntry,
                  IAdjShortTable, IAdjShortTableEntry,
                  IComparativesEntry, IComparatives,
                  IPresentTenseTableEntry, IPresentTenseTable,
                  IPastTenseTableEntry, IPastTenseTable,
                  IImperativeTableEntry, IImperativeTable,
                  ILexeme, IInflection}
        from "$lib/types";

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
    let homonymsVisible: boolean = $state(false);
    let nounTable: INounTable = $state({});
    let adjLongTable: IAdjLongTable = $state({});
    let adjShortTable: IAdjShortTable = $state({});
    let comparatives: IComparatives = $state({});
    let presentTenseTable: IPresentTenseTable = $state({});
    let pastTenseTable: IPastTenseTable = $state({});
    let imperativeTable: IImperativeTable = $state({});
    let mapInflectionToLexeme = new Map<number, ILexeme>();

    const triangle: string = '\u25B3';
    const largeAsterisk = '\uFF0A';

    function getNounTable()
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

    function getAdjLongTable()
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

    function getAdjShortTable()
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

    function getComparatives()
    {
        const rowTemplate = { form: '', isIrregular: '', isDifficult: false, isAssumed: false };
        return rowTemplate;
    }

    function getPresentTenseTable()
    {
        const rowTemplate = { number: '', person: '', form: '', isIrregular: '', isDifficult: false, isAssumed: false };

        let table = [];
        for (let personName of ['P1', 'P2', 'P3']) {
            let row = [];
            for (let numberName of ['Sg', 'Pl']) {
                row.push({...rowTemplate, number: numberName, person: personName});
            }
            table.push(row);
        }
        console.log ('Present tense template', table);
        return table;
    }

    function getPastTenseTable()
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

    function getImperativeTable()
    {
        const rowTemplate = { number: '', form: '', isIrregular: '', isDifficult: false, isAssumed: false };

        let table = [];
        let row = [];
        for (let col of ['Sg', 'Pl']) {
            row.push({...rowTemplate, subParadigm: 'Imperative', number: col});
        }
        table.push(row);

//        console.log ('Past tense template', table);

        return table;
    }

    function handleNounForms(inflectionId: number, jsonForms: Array<any>)
    {
        nounTable[inflectionId] = getNounTable();
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
                    console.log('*** Cell not found');
                }
            }
        }
//        console.log (nounTable);
    }

    const getNounFormClass = (item: INounTableEntry) => {
        if (item.isDifficult) return "col-difficult-form";
        return "col-form";
    };

    function handleAdjLongForms(inflectionId: number, jsonForms: Array<any>)
    {
        adjLongTable[inflectionId] = getAdjLongTable();
        for (const [,form] of jsonForms.entries()) {
            let formCase: string = caseToHash.get(form['case']) || '';
            let formNumber: string = numberToHash.get(form['number']) || '';
            let formGender: string = genderToHash.get(form['gender']) || '';
            let isIrregular: boolean = form['isIrregular'] !== undefined && form['isIrregular'];
            let isDifficult: boolean = form['isDifficult'] !== undefined && form['isDifficult'];
            let isAssumed: boolean = form['status'] === 'Assumed';
            let findCell = undefined;
            if (formCase !== '' && formNumber === 'Sg' && (formGender === 'm' || formGender === 'f' || formGender === 'n')) {
                findCell = adjLongTable[inflectionId].flat().find(item => item.case === formCase && item.gender === formGender);
            }
            else if (formCase !== '' && formNumber === 'Pl' ) {
                findCell = adjLongTable[inflectionId].flat().find(item => item.case === formCase && item.number === formNumber);
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
                console.log('*** Cell not found');
            }
//            console.log ('******* ', findCell);
        }

        let gSgM = adjLongTable[inflectionId].flat().find(item => item.case === 'G' && item.gender === 'm' && item.number==='Sg');
        let aAnimSgM = adjLongTable[inflectionId].flat().find(item => item.case === 'A (anim)' && item.gender === 'm' && item.number==='Sg');
        aAnimSgM.form = gSgM.form;

        let gPl = adjLongTable[inflectionId].flat().find(item => item.case === 'G' && item.number==='Pl');
        let aAnimPl = adjLongTable[inflectionId].flat().find(item => item.case === 'A (anim)' && item.number==='Pl');
        aAnimPl.form = gPl.form;

//        console.log ('==============================', adjLongTable);
    }

    function handleAdjShortForms(inflectionId: number, jsonForms: Array<any>)
    {
        adjShortTable[inflectionId] = getAdjShortTable();
        for (const [,form] of jsonForms.entries()) {
            let formNumber: string = numberToHash.get(form['number']) || '';
            let formGender: string = genderToHash.get(form['gender']) || '';
            let isIrregular: boolean = form['isIrregular'] !== undefined && form['isIrregular'];
            let isDifficult: boolean = form['isDifficult'] !== undefined && form['isDifficult'];
            let isAssumed: boolean = form['status'] === 'Assumed';
            let findCell = undefined;
            if (formNumber != '' && formNumber === 'Sg' && (formGender === 'm' || formGender === 'f' || formGender === 'n')) {
                findCell = adjShortTable[inflectionId].flat().find(item => item.gender === formGender && item.number==='Sg');
            }
            else if (formNumber === 'Pl' ) {
                findCell = adjShortTable[inflectionId].flat().find(item => item.number === formNumber);
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
                console.log('*** Cell not found');
            }
//            console.log(form);

//            findCell = adjTableShort[inflectionId].flat().find(item => item.gender === formGender && item.number === formNumber);
//            console.log ('******* ', findCell);
        }
//        console.log ('==============================', adjShortTable);
    }

    function handleComparatives(inflectionId: number, jsonForms: Array<any>)
    {
        comparatives[inflectionId] = getComparatives();
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
        presentTenseTable[inflectionId] = getPresentTenseTable();
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
                    console.log('*** Cell not found');
                }
            }
        }
    }

    function handlePastTenseForms(inflectionId: number, jsonForms: Array<any>)
    {
        pastTenseTable[inflectionId] = getPastTenseTable();
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
                console.log('*** Cell not found');
            }
        }
    }

    function handleImperativeForms(inflectionId: number, jsonForms: Array<any>)
    {
        imperativeTable[inflectionId] = getImperativeTable();
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
                console.log('*** Cell not found');
            }
        }
    }

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

            if(lexeme['partOfSpeech'] === 'Noun') {
                handleNounForms(inflectionId, forms);
            }
            else if (lexeme['partOfSpeech'] === 'Adj') {
                handleAdjLongForms(inflectionId, forms);
                handleAdjShortForms(inflectionId, forms);
                handleComparatives(inflectionId, forms);
           }
           else if (lexeme['partOfSpeech'] === 'Verb') {
               handlePresentTenseForms(inflectionId, forms);
               handlePastTenseForms(inflectionId, forms);
               handleImperativeForms(inflectionId, forms);
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
                mainSymbol: lexemeData['mainSymbol'],
                partOfSpeech: lexemeData['partOfSpeech'],
                isTransitive: lexemeData['isTransitive'],
                section: lexemeData['section'],
                inflections: []
            };

            if ('homonyms' in lexemeData) {
                lexeme.homonyms = Object.values(lexemeData['homonyms']);
                homonymsVisible = true;
            } else {
                homonymsVisible = false;
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
                        aspectPair: inflectionData['aspectPair'],
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
</script>

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
            {#if homonymsVisible}
                <div class="lex-row">
                <div class="lex-col">Homonyms:</div>
                <div class="lex-col">{lexProp.homonyms.join(', ')}</div>
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
                </div>
            {/each}
        </div>      <!-- lexeme-container  -->

        <div class="right-panel">
            {#each lexProp.inflections as inflection (inflection.seqNum)}
                {#if lexProp['partOfSpeech'] == 'Noun'}
                    <!--  NOUN               -->
                    <table class="paradigm-table">
                    <colgroup>
                        <col class="col-noun-case" span="1"/>
                        <col class="col-form" span="2"/>
                    </colgroup>
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
                {#if lexProp['partOfSpeech'] == 'Adj'}
                    <!--  ADJ               -->
                    <div class="section-heading">Long Forms</div>
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
                        {#each adjLongTable[inflection.inflectionId] as item}
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
                        <div class="section-heading">Short Forms</div>
                        <table class="paradigm-table">
                            <colgroup>
<!--                                <col class="col-head-invisible" span="1"/>       -->
                                <col class="col-form" span="4"/>
                            </colgroup>
                            <thead class="paradigm-header">
                            <tr>
<!--                                <th class="col-invisible"></th>     -->
                                <th class="col-head">m</th>
                                <th class="col-head">f</th>
                                <th class="col-head">n</th>
                                <th class="col-head">Pl</th>
                            </tr>
                            </thead>
                            <tbody>
                        {#each adjShortTable[inflection.inflectionId] as item}
                            <tr>
<!--                                <td class="col-invisible"></td>         -->
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
                    <div class="section-heading">Comparative</div>
                    {#if comparatives[inflection.inflectionId] && comparatives[inflection.inflectionId].form}
                    <table class="comparative-table">
                        <colgroup>
                            <col class="col-invisible" span="1"/>
                            <col class="col-comparative" span="4"/>
                        </colgroup>
                        <tbody>
                    <tr>
                        <td class="col-invisible"></td>
                        <td class={getComparativeClass(comparatives[inflection.inflectionId])} colspan="4">
                            {#if comparatives[inflection.inflectionId].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                            {comparatives[inflection.inflectionId].form}
                            {comparatives[inflection.inflectionId].isIrregular}
                        </td>
                    </tr>
                    </tbody>
                    </table>
                    {/if}
                {/if}         <!-- ADJ -->
                {#if lexProp['partOfSpeech'] == 'Verb'}
                    <!--  VERB -->
                    <div class="section-heading">Present Tense</div>
                    <table class="paradigm-table">
                        <colgroup>
                            <col class="col-present-tense-name" span="1"/>
                            <col class="col-form" span="2"/>
                        </colgroup>
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
                                <td class="col-present-tense-name">{itemPair[0].case}</td>
                                <td class={getPresentTenseClass(itemPair[0])}>
                                    {#if itemPair[0].isAssumed}<sup>{largeAsterisk}</sup>{/if}
                                    {itemPair[0].form}
                                    {itemPair[0].isIrregular}
                                </td>
                                <td class={getPresentTenseClass(itemPair[1])}>
                                    {#if itemPair[1].isAssumed}<sup>{largeAsterisk}</sup>{/if}{itemPair[1].form}  {itemPair[1].isIrregular}</td>
                            </tr>
                        {/each}
                        </tbody>
                    </table>
                    <div class="section-heading">Past Tense</div>
                    <table class="paradigm-table">
                        <colgroup>
                            <!--                                <col class="col-head-invisible" span="1"/>       -->
                            <col class="col-form" span="4"/>
                        </colgroup>
                        <thead class="paradigm-header">
                        <tr>
                            <!--                                <th class="col-invisible"></th>     -->
                            <th class="col-head">m</th>
                            <th class="col-head">f</th>
                            <th class="col-head">n</th>
                            <th class="col-head">Pl</th>
                        </tr>
                        </thead>
                        <tbody>
                        {#each pastTenseTable[inflection.inflectionId] as item}
                            <tr>
                                <!--                                <td class="col-invisible"></td>         -->
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
                    </table>
                    <div class="section-heading">Imperative</div>
                    <table class="paradigm-table">
                        <colgroup>
                            <col class="col-present-tense-name" span="1"/>
                            <col class="col-form" span="2"/>
                        </colgroup>
                        <thead class="paradigm-header">
                        <tr>
                            <th class="col-present-tense-person"></th>
                            <th class="col-head">Sg</th>
                            <th class="col-head">Pl</th>
                        </tr>
                        </thead>
                        <tbody>
                        {#each imperativeTable[inflection.inflectionId] as itemPair}
                            <tr>
                                <td class="col-present-tense-name">{itemPair[0].case}</td>
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
                    </table>
                {/if}
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
        font-size: large;
        text-align: center;
        color: gray;
        margin-bottom: 10px;
    }

    .paradigm-table {
        border-collapse: collapse;
        width: 100%;
        table-layout: fixed;
        margin-bottom: 25px;
        margin-left: 30px;
    }

    .paradigm-table row {
        padding: 20px;
    }

    .col-noun-case {
        width: 30px;
/*        background-color: #f3f4f6;    */
        color: gray;
        text-align: center;
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
</style>
