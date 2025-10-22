<script lang="ts">
	import favicon from "$lib/assets/favicon.ico";
	import "../styles/fonts.css";

	let { children } = $props();
</script>

<svelte:head>
	<title>GT</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<style>
	:global(body) {
		background-color: rgb(207, 177, 214);
	}
</style>
