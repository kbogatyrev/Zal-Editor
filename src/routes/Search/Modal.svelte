<script>
    // Svelte 5 uses destructuring for component props
    let { isOpen = $bindable(false), children } = $props();

    let dialogElement;

    // Synchronize the boolean state with the native DOM element methods
    $effect(() => {
        if (isOpen) {
            dialogElement?.showModal();
        } else {
            dialogElement?.close();
        }
    });
</script>

<!-- The onclick listener closes the modal if the user clicks the backdrop -->
<!-- The onclose listener ensures state stays in sync if closed via Escape key -->
<dialog
        bind:this={dialogElement}
        onclose={() => isOpen = false}
        onclick={(e) => { if (e.target === dialogElement) isOpen = false; }}
>
    <div class="modal-content">
        {@render children?.()}
        <button class="close-btn" onclick={() => isOpen = false}>OK</button>
    </div>
</dialog>

<style>
    dialog {
        border: none;
        border-radius: 8px;
        padding: 0;
        max-width: 500px;
        width: 100%;
    }
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
    }
    .modal-content {
        padding: 24px;
        position: relative;
    }
    .close-btn {
        margin-top: 16px;
    }
</style>