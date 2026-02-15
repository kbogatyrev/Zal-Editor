<script lang="ts">

    import { SvelteMap } from 'svelte/reactivity';

// Props
    import type { IWordFormNoun, INounTable } from "$lib/types";
    import type { INounTableRow } from "$lib/types";

    import { currentLexeme, caseToHash, numberToHash } from "$lib/stores";
    import { currentInflection } from "$lib/stores";

    let prompt: string = 'Введите слово...';
    let btnText: string = 'Искать';
    let lexemeDescr: object[];
    let lexemes = $state([]);
    let homonymsVisible: boolean = $state(false);
    let nounForms = $state(new SvelteMap<string, IWordFormNoun>());
    let nounTable: INounTable = $state({});
    let inputValue: string = $state('');

    const triangle: string = '\u25B3';
    const nounTableRows = [
        { case: 'N', formSg: '', formPl: '', isIrregular: '' },
        { case: 'A', formSg: '', formPl: '', isIrregular: '' },
        { case: 'D', formSg: '', formPl: '', isIrregular: '' },
        { case: 'G', formSg: '', formPl: '', isIrregular: '' },
        { case: 'P', formSg: '', formPl: '', isIrregular: '' },
        { case: 'I', formSg: '', formPl: '', isIrregular: '' },
    ];

    function handleNounForms(inflectionId: number, jsonForms: Array)
    {
        nounTable[inflectionId] = [ ...nounTableRows];
        for (const [idx, form] of jsonForms.entries()) {
            let formCase: string = caseToHash.get(form['case']);
            let formNumber: string = numberToHash.get(form['number']);
            let isIrregular: boolean = form['isIrregular'] !== undefined;
            if (formCase !== '' && (formNumber === 'Sg' || formNumber === 'Pl')) {
                const findCell = nounTable[inflectionId].find(item => item.case === formCase);
                if (findCell) {
                    if (formNumber === 'Sg') {
                        findCell.formSg = form['wordForm'];
                    } else if (formNumber === 'Pl') {
                        findCell.formPl = form['wordForm'];
                    }
                    if (isIrregular) {
                        findCell.isIrregular = triangle;
                    }
                } else {
                    console.log('*** Cell not found');
                }
            }
        }
//        console.log (nounTableRows);
    }

    function updateNounMap(hash: string, field: keyof IWordFormNoun, value: any) {
        const sgForm = nounForms.get(hash);
        if (sgForm) {
            nounForms.set(hash, { ...sgForm, [field]: value });
        }
    }

    async function requestForms(inflectionId: number)
    {
        console.log('Requesting forms for inflection ID: ' + inflectionId);
        try {
//            console.log('Input value: ' + inputValue);
            const response = await fetch(`http://localhost:8088/forms?inflection-id=${inflectionId}` +
                '')
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            let resp = await response.json(); // Assign the fetched data
            let forms = resp['wordForms'];
            if (forms.length === 0) {
                console.log('No forms');
                return;
            }
            handleNounForms(inflectionId, forms);
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
            let lexeme = lexemeDescr[i];

            currentLexeme['seqNum'] = i + 1;

            if ('lexemeId' in lexeme) {
                currentLexeme['lexemeId'] = lexeme['lexemeId'];
            } else {
                console.log('lexemeId property not found');
            }

            if ('sourceForm' in lexeme) {
                currentLexeme['sourceForm'] = lexeme['sourceForm'];
            } else {
                console.log("sourceForm property not found");
            }

            if ('homonyms' in lexeme) {
                let homonyms: string = '';
                for ( const[key, value] of Object.entries(lexeme['homonyms'])) {
                    if (homonyms.length > 0) {
                        homonyms += ', ';
                    }
                    homonyms += value;
                }
                currentLexeme['homonyms'] = homonyms;
                homonymsVisible = true;
            } else {
                homonymsVisible = false;
            }

            if ('mainSymbol' in lexeme) {
                currentLexeme['mainSymbol'] = lexeme['mainSymbol'];
            } else {
                console.log("mainSymbol property not found");
            }

            if ('partOfSpeech' in lexeme) {
                currentLexeme['partOfSpeech'] = lexeme['partOfSpeech'];
            } else {
                console.log("partOfSpeech property not found");
            }

            if ('Verb' === lexeme['partOfSpeech']) {
                if ('isTransitive' in lexeme) {
                    currentLexeme['isTransitive'] = lexeme['isTransitive'];
                } else {
                    console.log("isTransitive property not found");
                }
            }

            if ('section' in lexeme) {
                currentLexeme['section'] = lexeme['section'];
            }

            currentLexeme['inflections'] = [];
            if ('inflections' in lexeme) {
                let inflections = lexeme['inflections'];
                for (let j: number = 0; j < inflections.length; j++) {
                    let inflection = inflections[j];

                    currentInflection['seqNum'] = i + j + 1;

                    if ('inflectionId' in inflection) {
                        currentInflection['inflectionId'] = inflection['inflectionId'];
                    } else {
                        console.log("inflectionId property not found");
                    }

                    if ('inflectionType' in inflection) {
                        currentInflection['inflectionType'] = inflection['inflectionType'];
                    } else {
                        console.log("inflectionType property not found");
                    }

                    if ('accentType1' in inflection) {
                        currentInflection['accentType1'] = inflection['accentType1'];
                    } else {
                        console.log("accentType1 property not found");
                    }
                    currentLexeme['inflections'].push({...currentInflection});
                }
            }
            lexemes.push({ ...currentLexeme });
        }
//        console.log(lexemes);

        for(let lexeme of lexemes) {
            console.log('Lexeme ID: ', lexeme['lexemeId']);
            for(let inflection of lexeme.inflections) {
                await Promise.all( // Await all requests
                    lexeme.inflections.map(inflection => requestForms(inflection['inflectionId']))
                );
            }
        }
    }

    async function handleClick() {
        try {
//            console.log('Input value: ' + inputValue);
            const response = await fetch(`http://localhost:8088/query?word=${inputValue}` +
                '')
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
    <form onsubmit={handleClick}>
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
                <div class="lex-col">{lexProp.homonyms}</div>
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
            <table class="paradigm-table">
                <colgroup>
                    <col class="col-case" span="1"/>
                    <col class="col-form" span="2"/>
                    <col class="col-irreg" span="1"/>
                </colgroup>
                <thead>
                    <tr>
                        <th class="col-case"></th>
                        <th class="col-form">Sg</th>
                        <th class="col-form">Pl</th>
                        <th class="col-irreg"></th>
                    </tr>
                </thead>
                <tbody>
                    {#each nounTable[inflection.inflectionId] as item}
                        <tr>
                            <td class="col-case">{item.case}</td>
                            <td class="col-form">{item.formSg}</td>
                            <td class="col-form">{item.formPl}</td>
                            <td class="col-irreg">{item.isIrregular}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            {/each}
        </div>      <!-- right-panel  -->
    </div>      <!-- display-container  -->
{/each}
<!-- <pre>{JSON.stringify(Array.from(nounForms.entries()), null, 2)}</pre> -->

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

    form {
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
    }

    .paradigm-table {
        border-collapse: collapse;
        width: 100%;
        table-layout: fixed;
        margin-bottom: 50px;
    }

    .paradigm-table row {
        padding: 20px;
    }

    .col-case, .col-form, .col-irreg {
        border: 1px solid #e5e7eb;
    }

    .col-case {
        width: 25px;
/*        background-color: #f3f4f6;    */
        color: gray;
        text-align: center;
    }

    .col-form {
        width: 250px;
        padding-left: 25px;
        padding-right: 25px;
    }

    .col-irreg {
        width: 25px;
        /*        background-color: #f3f4f6;    */
        text-align: center;
        border-collapse: collapse ;
        border-right: none;
        border-top: none;
        border-bottom: none;
    }

    .paradigm-table th {
/*        border: 1px solid #e5e7eb;   */
        text-align: center;
        padding-right: 25px;
/*        background-color: #f3f4f6;    */
        color: gray;
        font-weight: normal;
    }

    /*
    .paradigm-table td {
        border: 1px solid #e5e7eb;
        border-collapse: collapse;
    }
     */

    /*
    .paradigm-table td:nth-child(1), th:nth-child(1) {
        width: 15%;
        text-align: center;
    }
    .paradigm-table td:nth-child(2), th:nth-child(2) {
        width: 42%;
        padding-left: 15px;
    }
    .paradigm-table td:nth-child(3), th:nth-child(3) {
        width: 42%;
        padding-left: 15px;
    }
    */

</style>