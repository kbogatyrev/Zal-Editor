<script lang="ts">
    import { goto } from '$app/navigation';
    import { searchRequest } from '$lib/stores.svelte'

//    let inputValue:string = $state('');
    let inputValue:string = '';

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            searchRequest.query = inputValue;
            searchRequest.ignore = false;
            goto('/Search');        }
    }
</script>


<div class="flex-container">
    <div class="title-block">
        <div class="author">А. А. Зализняк</div>
        <h1>Грамматический словарь русского языка</h1>
        <div class="subtitle">Электронная версия</div>
    </div>
    <form class="word-entry-basic">
        <label>
            <input type="text"
                   bind:value={inputValue}
                   placeholder="Введите слово..." />
        </label>
    </form>
</div>

<svelte:window onkeyup={handleKeydown} />

<style>
    .flex-container {
        display: grid;
        grid-template-columns: minmax(0, max-content);   /* column is as wide as the title, but may shrink on narrow windows */
        justify-content: center;
        grid-template-rows: 1fr auto 1fr;   /* prompt in the middle row, so it is vertically centered */
        justify-items: stretch;             /* form fills the column; title-block keeps fit-content */
        max-height: none;
        padding-bottom: 0;
    }
    .word-entry-basic label,
    .word-entry-basic input[type="text"] {
        width: 100%;
        box-sizing: border-box;
    }
    .title-block {
        align-self: end;        /* sit directly above the prompt */
        margin-bottom: 30px;    /* space between "Электронная версия" and the prompt */
        width: fit-content;   /* as wide as the title, so right-justify lines up with its right edge */
    }
    .title-block h1 {
        margin-top: 0.2em;   /* tighten the gap between the author line and the title */
    }
    .author, .subtitle {
        font-size: 2em;   /* same as the default h1 size */
        font-weight: normal;
    }
    .author {
        margin-bottom: 7px;
        font-size: 1.8em;   /* same as the default h1 size */
        text-align: right;
    }
    .subtitle {
        font-size: calc(2em - 5pt);   /* 3pt smaller than the title */
        text-align: center;
        color: gray;
    }
</style>
