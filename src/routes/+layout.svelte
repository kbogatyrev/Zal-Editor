<script lang="ts">
	import favicon from '$lib/assets/Zal.ico';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<a href="/">Home</a>
	<a href="/Search">Искать</a>
</nav>

{@render children()}
