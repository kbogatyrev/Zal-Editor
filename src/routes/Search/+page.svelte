<script lang="ts">
    // Props
    import { lexemes } from '$lib/stores' ;
    import { currentLexeme } from "$lib/stores";
    import { currentInflection } from "$lib/stores";

    let prompt: string = 'Введите слово';
    let btnText: string = 'Искать';
    let lexemeDescr: object[];

    let lexemeDivs = $state(lexemes);

    let inputValue: string = '';

    let homonymsVisible: boolean = false;

    function handleLexemeData() {
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

            if ('Verb' === lexemeDescr['partOfSpeech']) {
                if ('isTransitive' in lexeme) {
                    currentLexeme['isTransitive'] = lexeme['isTransitive'];
                } else {
                    console.log("isTransitive property not found");
                }
            }

            if ('section' in lexeme) {
                currentLexeme['section'] = lexeme['section'];
            }

            if ('inflections' in lexeme) {
                let inflections = lexeme['inflections'];
                for (let j: number = 0; j < inflections.length; j++) {
                    let inflection = inflections[j];

                    currentInflection['seqNum'] = j + 1;

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
                }
            }

            currentLexeme['inflections'] = lexeme['inflections'];

            lexemeDivs.push({ ...currentLexeme });

        }
        console.log('-----------------\n', lexemes, '\n-----------------');
    }

    async function handleClick() {
        try {
            const response = await fetch('http://localhost:8088/query?word=мама' +
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
{#each lexemeDivs as div (div.seqNum)}
    <div class="dynamic-div">
        <p>Lexeme ID: {div.lexemeId}</p>
        <p>Source form: {div.sourceForm}</p>
        {#if homonymsVisible}
            <p>Homonyms: {div.homonyms}</p>
        {/if}
        <p>Part of speech: {div.partOfSpeech}</p>
        <p>Main symbol: {div.mainSymbol}</p>
        {#each div.inflections as inflection (inflection.seqNum)}
            <p>Inflection ID: {inflection.inflectionId}</p>
            <p>Inflection type: {inflection.inflectionType}</p>
            <p>Accent type: {inflection.accentType1}</p>
        {/each}
    </div>
{/each}

<style>
    .dynamic-div {
        border: 1px solid blue;
        padding: 10px;
        margin: 5px 0;
        background-color: #f0f0f0;
    }
</style>