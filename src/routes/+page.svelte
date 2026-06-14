<script lang="ts">
    import { goto } from '$app/navigation';
    import { searchRequest } from '$lib/stores'

    let inputValue:string = $state('');

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            searchRequest.set({
                query: inputValue,
                submit: true
            });
            goto('/Search');        }
    }
</script>


<div class="flex-container">
    <h1>Грамматический словарь русского языка</h1>
<!--    <a href="/Search">   -->
<!--     <button type="submit" class="start-btn" >Search ></button>   -->
<!--        <div class="prompt-container-basic">   -->
            <!--    <form onsubmit={handleClick}>    -->
            <form class="word-entry-basic">
                <label>
                    <input type="text"
                           bind:value={inputValue}
                           placeholder="Введите слово..." />
                </label>
<!--                <button type="submit">{btnText}</button> -->
            </form>
<!--        </div>       -->
<!--    </a>   -->
</div>

<svelte:window onkeydown={handleKeydown} />
