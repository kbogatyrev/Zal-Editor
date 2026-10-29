<script lang="ts">
    import { goto } from '$app/navigation';
    import { searchRequest } from '$lib/stores.svelte'

//    let inputValue:string = $state('');
    let inputValue:string = '';

    function search() {
        searchRequest.query = inputValue;
        searchRequest.ignore = false;
        goto('/Search');
    }
</script>


<div class="flex-container">
    <div class="title-block">
        <div class="author">А.&nbsp;А.&nbsp;Зализняк</div>
        <h1>Грамматический словарь русского языка</h1>
        <div class="subtitle">Электронная версия (черновой вариант)</div>
    </div>
    <form class="word-entry-basic" onsubmit={(e) => { e.preventDefault(); search(); }}>
        <label>
            <input type="text"
                   bind:value={inputValue}
                   aria-label="Введите слово"
                   placeholder="Введите слово..." />
        </label>
        <button type="submit">Искать</button>
    </form>
    <footer class="copyright">
        <div>© А.&nbsp;А.&nbsp;Зализняк, наследники, 2026 (текст словаря, алгоритмы порождения словоформ)</div>
        <div>© К.&nbsp;Богатырев, 2026 (программная реализация, структура базы данных, сайт)</div>
        <div><a href="/about">О проекте</a></div>
    </footer>
</div>

<style>
    .flex-container {
        height: 100%;                       /* fits inside body (100vh minus margins), so no page scrollbar */
        display: grid;
        grid-template-columns: minmax(0, max-content);   /* column is as wide as the title, but may shrink on narrow windows */
        justify-content: center;
        grid-template-rows: 1fr auto 1fr;   /* prompt in the middle row, so it is vertically centered */
        justify-items: stretch;             /* form fills the column; title-block keeps fit-content */
        max-height: none;
        padding-bottom: 0;
    }
    .word-entry-basic {
        flex-direction: row;       /* override the global form { flex-direction: column } */
        align-items: center;       /* button lines up vertically with the input */
        gap: 10px;
    }
    .word-entry-basic label {
        flex: 1;            /* input takes the remaining width, button keeps its natural size */
        width: auto;
        margin: 0;          /* cancel the global label margin so the input is truly centered against the button */
    }
    .word-entry-basic input[type="text"] {
        width: 100%;
        box-sizing: border-box;
        border-color: #767676;              /* about 4.5:1 on white, above the 3:1 needed for control edges */
    }
    .word-entry-basic input[type="text"]:focus-visible {
        outline: 2px solid var(--link);
        outline-offset: 1px;
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
        font-weight: normal;
    }
    .author {
        margin-bottom: 7px;
        font-size: 1.5em;   /* clearly subordinate to the title */
        text-align: right;
    }
    .subtitle {
        font-size: calc(2em - 6pt);   /* 3pt smaller than the title */
        text-align: center;

        color: #6b6b6b;     /* about 5.3:1 on white, passes AA at any size */
    }
    .copyright {
        align-self: end;        /* bottom of the empty third row */
        width: 0;               /* don't widen the grid column beyond the title */
        min-width: 100%;
        text-align: left;       /* © signs line up in a column, flush with the title and input */
        font-size: 0.85em;
        color: #6b6b6b;         /* same AA-passing gray as the subtitle */
    }
</style>
