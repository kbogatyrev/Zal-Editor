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
    <h1>Грамматический словарь русского языка</h1>
    <form class="word-entry-basic">
        <label>
            <input type="text"
                   bind:value={inputValue}
                   placeholder="Введите слово..." />
        </label>
    </form>
</div>

<svelte:window onkeyup={handleKeydown} />
