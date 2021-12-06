<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import LoadedUI from "../components/LoadedUI.svelte";
	import { DoubleBounce } from 'svelte-loading-spinners'
	import PlugItIn from "../api/PlugItInAPI";
	import { is_connected, is_on } from "../stores/_stores";

	console.log($is_connected);
	console.log($is_on);
	let plugItIn = new PlugItIn(() => is_connected.set(true));

	if($is_connected) {
		plugItIn.GetStatus().then(status => is_on.set(status));
	}
</script>

<svelte:head>
	<title>PlugItIn!</title>
</svelte:head>

<section>
	{#if is_connected}
		<LoadedUI />
	{:else}
		<div class="loading">
			<DoubleBounce color="#444444"/>
			<h3>Loading...</h3>
		</div>
	{/if}
</section>

<style>
	section{
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: column;
		height: 400px;
	}

	.loading{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
