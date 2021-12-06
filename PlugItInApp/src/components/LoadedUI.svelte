<script lang="ts">
	import Switch from "svelte-switch";
	let isChecked = false;
</script>

<div class="switch">
    <Switch height=70 width=140 bind:checked={isChecked}></Switch>
    <h3>Your product is: <b>{isChecked ? "on" : "off"}</b></h3>
</div>

<style>
	.switch{
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.switch > h3{
		margin-top: 30px;
	}
</style>
