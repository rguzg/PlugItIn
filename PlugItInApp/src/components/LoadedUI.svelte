<script lang="ts">
	import Switch from "svelte-switch";
	let isChecked = false;
    let alarms = ["3:00", "4:00", "5:00", "6:00"];
</script>

<div class="switch">
    <Switch height=70 width=140 bind:checked={isChecked}></Switch>
    <h3>Your product is: <b>{isChecked ? "on" : "off"}</b></h3>
</div>

<div class="alarms">
    <h5>Alarms:</h5>
    {#if alarms.length}
        <div class="alarm-list">
            {#each alarms as alarm}
                <div class="alarm">
                    <img src="clock-solid.svg" alt="Reloj"/>
                    {alarm}
                    <img src="trash-solid.svg" alt="Basura" class="basura"/>
                </div>
            {/each}
        </div>
        {#if alarms.length < 5}
            <img src="plus-circle-solid.svg" alt="Añadir" class="añadir"/>
        {/if}
    {:else}
        <p>No alarms...</p>
    {/if}        
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

    .alarms{
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }

    .alarm-list{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-evenly;
        width: 100%;
    }

    .alarm{
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .basura{
        width: 20px;
        height: 20px;
        margin-top: 10px;
        cursor: pointer;
    }

    .añadir{
        height: 40px;
        margin-top: 40px;
    }
</style>
