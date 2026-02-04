<script lang="ts">

    import { SvelteMap } from 'svelte/reactivity';

// Props
    import type { IWordFormNoun } from "$lib/types";

    import { currentLexeme, caseToHash, numberToHash } from "$lib/stores";
    import { currentInflection } from "$lib/stores";

    let prompt: string = 'Введите слово';
    let btnText: string = 'Искать';
    let lexemeDescr: object[];
    let lexemes = $state([]);
    let inputValue: string = $state('');
    let homonymsVisible: boolean = $state(false);
    let nounForms = $state(new SvelteMap<number, IWordFormNoun>());

    function handleNounForms(jsonForms: Array)
    {
        for (const [idx, form] of jsonForms.entries()) {
            let formCase: string = caseToHash.get(form['case']);
            let formNumber: string = numberToHash.get(form['number']);
            if (formCase !== '' && formNumber !== undefined) {
                let hash = formCase + '_' + formNumber;
                let fwDescr: IWordFormNoun = {wordForm: form['wordForm'], subparadigm: form['subParadigm'], case: form['case'], number: form['number']};
                nounForms.set(idx, fwDescr);
            }
        }
        console.log('---------------');
        console.log(nounForms);
        const koko = Array.from(nounForms.entries()) as [id, word];
        console.log(koko);
        console.log('++++++++++++++++');
    }

    function updateNounMap(id: number, field: keyof IWordFormNoun, value: any) {
        const item = nounForms.get(id);
        if (item) {
            nounForms.set(id, { ...item, [field]: value });
        }
    }

    async function requestForms(inflectionId: number)
    {
        try {
            console.log('Input value: ' + inputValue);
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
        console.log(lexemes);

        await Promise.all(lexemes.flatMap(lexeme => // Await all requests
            lexeme.inflections.map(inflection => requestForms(inflection['inflectionId']))
        ));
        for(let lexeme of lexemes) {
            for(let inflection of lexeme.inflections) {
                requestForms(inflection['inflectionId']);
                console.log('----------------------- requested forms');
            }
        }
    }

    async function handleClick() {
        try {
            console.log('Input value: ' + inputValue);
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
<div class="container">
    <input
    type="text"
    {prompt}
    bind:value={inputValue}
    />
    <button onclick={handleClick}>
    {btnText}
    </button>
</div>

{#each lexemes as lexProp (lexProp.seqNum)}
<div class="container">
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

<table>
    <thead>
    <tr>
        <th></th>
        <th></th>
    </tr>
    </thead>
    <tbody>
        {#each Array.from(nounForms.entries()) as [id, word] (id)}
            <tr>
                <td>{id}</td>
                <td>
                    <input type='text'
                           value={word.wordForm}
                           oninput={(e) => updateNounMap(id, 'wordForm', e.currentTarget.value)}
                    />
                </td>
            </tr>
        {/each}
    </tbody>
</table>
<!-- <pre>{JSON.stringify(Array.from(nounForms.entries()), null, 2)}</pre> -->

<style>
    .container {
        border: 1px solid black;
        padding: 15px;
        margin: 5px 0;
        background-color: #FFFAF0;
        margin-bottom: 10px;
/*        padding: 50px;  */
        max-width:500px;

/*        border: #b3b3b3;    */
    }
    .row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-left: 1px solid #eee;
/*        border-right: 1px solid #eee;  */
        max-width: 500px;
        padding-left: 15px;
        padding-right: 15px;
    }
    .col {
        flex: 1; /* Each column takes up equal space */
    }
    .col:first-child {
        text-align: left;
        max-width: 300px
    }
    .col:last-child {
        text-align: left;
    }
</style>