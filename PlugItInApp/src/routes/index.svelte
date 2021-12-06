<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import Switch from "svelte-switch";
	import LoadedUI from "../components/LoadedUI.svelte";
	let isChecked = false;
</script>

<svelte:head>
	<title>PlugItIn!</title>
</svelte:head>

<section>
	<LoadedUI/>
</section>

<style>
	section{
		display: flex;
		justify-content: center;
		align-items: center;
		height: 400px;
	}
</style>
