<script lang="ts">

    import { SvelteMap } from 'svelte/reactivity';

// Props
    import type { IWordFormNoun } from "$lib/types";
    import type { INounTableRow } from "$lib/types";

    import { currentLexeme, caseToHash, numberToHash } from "$lib/stores";
    import { currentInflection } from "$lib/stores";

    let prompt: string = 'Введите слово...';
    let btnText: string = 'Искать';
    let lexemeDescr: object[];
    let lexemes = $state([]);
    let homonymsVisible: boolean = $state(false);
    let nounForms = $state(new SvelteMap<string, IWordFormNoun>());
    let nounTableRows = $state([]);
    let inputValue: string = $state('');

    nounTableRows = [
        { case: 'N', formSg: '', formPl: '' },
        { case: 'A', formSg: '', formPl: '' },
        { case: 'D', formSg: '', formPl: '' },
        { case: 'G', formSg: '', formPl: '' },
        { case: 'P', formSg: '', formPl: '' },
        { case: 'I', formSg: '', formPl: '' },
    ];

    function handleNounForms(jsonForms: Array)
    {
        for (const [idx, form] of jsonForms.entries()) {
            let formCase: string = caseToHash.get(form['case']);
            let formNumber: string = numberToHash.get(form['number']);
            if (formCase !== '' && (formNumber === 'Sg' || formNumber === 'Pl')) {
                let hash = formCase + '_' + formNumber;
                let fwDescr: IWordFormNoun = {wordForm: form['wordForm'], subparadigm: form['subParadigm'], case: form['case'], number: form['number']};
                const findSgCell = nounTableRows.find(item => item.case === formCase);
                if (findSgCell) {
                    if (formNumber === 'Sg') {
                        findSgCell.formSg = fwDescr['wordForm'];
                    } else if (formNumber === 'Pl') {
                        findSgCell.formPl = fwDescr['wordForm'];
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
            handleNounForms(forms);
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
<!--            {prompt}           -->
            <input type="text"
                   bind:value={inputValue}
                   placeholder="Введите слово..." />
<!--                   class:dimmed="{isPrompt}"
                   oninput="{handleInput}" /> -->
        </label>
    <button type="submit">{btnText}</button>
    </form>
</div>

{#each lexemes as lexProp (lexProp.seqNum)}
<div class="lexeme-container">
    <div class="row">
        <div class="col">Lexeme ID:</div>
        <div class="col">{lexProp.lexemeId}</div>
    </div>
    <div class="row">
        <div class="col">Source form:</div>
        <div class="col">{lexProp.sourceForm}</div>
    </div>
        {#if homonymsVisible}
        <div class="row">
            <div class="col">Homonyms:</div>
            <div class="col">{lexProp.homonyms}</div>
        </div>
        {/if}
    <div class="row">
        <div class="col">Part of speech:</div>
        <div class="col">{lexProp.partOfSpeech}</div>
    </div>
    <div class="row">
        <div class="col">Main symbol:</div>
        <div class="col">{lexProp.mainSymbol}</div>
    </div>
        {#each lexProp.inflections as inflection (inflection.seqNum)}
        <div class="row">
            <div class="col">Inflection ID:</div>
            <div class="col">{inflection.inflectionId}</div>
        </div>
        <div class="row">
            <div class="col">Inflection type:</div>
            <div class="col">{inflection.inflectionType}</div>
        </div>
        <div class="row">
            <div class="col">Accent type:</div>
            <div class="col">{inflection.accentType1}</div>
        </div>
        {/each}
 </div>
{/each}

{#if lexemes && lexemes.length > 0}
<table>
    <thead>
    <tr>
        <th></th>
        <th>Sg</th>
        <th>Pl</th>
    </tr>
    </thead>
    <tbody>
        {#each nounTableRows as item }
            <tr>
                <td>{item.case}</td>
                <td>{item.formSg}</td>
                <td>{item.formPl}</td>
            </tr>
        {/each}
    </tbody>
</table>
{/if}
<!-- <pre>{JSON.stringify(Array.from(nounForms.entries()), null, 2)}</pre> -->

<style>
    .prompt-container {
        border: 1px solid black;
        padding: 15px;
        margin: 5px 0;
        background-color: #FFFAF0;
        margin-left: 15px;
        padding: 20px;
        max-width:350px;
/*        border: #b3b3b3;    */
    }

    .lexeme-container {
        display: flex;
        flex-direction: column;
        border: 1px solid black;
        padding: 15px;
        margin: 5px 0;
        background-color: #FFFAF0;
        margin-left: 15px;
        padding: 20px;
        max-width:350px;
        /*        border: #b3b3b3;    */
    }

    form {
        display: flex;
        flex-direction: row;
        justify-content:space-between;
        width: 350px;
    }

    .row {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        border-left: 1px solid #eee;
/*        border-right: 1px solid #eee;  */
        max-width: 500px;
        padding-left: 15px;
        padding-right: 15px;
    }

    .col {
        flex: 1;
    }

    th {
        font-weight: normal;
        text-align: center;
        padding-right: 25px;
    }

    td {
        padding-left: 15px;
        padding-right: 15px;
    }

    td:nth-child(1), th:nth-child(1) {
        width: 15%;
    }
    td:nth-child(2), th:nth-child(2) {
        width: 42%;
    }
    td:nth-child(3), th:nth-child(3) {
        width: 42%;
    }
</style>