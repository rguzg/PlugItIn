<script lang="ts">
	import Switch from "svelte-switch";
    import TimePicker from "svelte-time-picker";
	import { is_on, alarms } from "../stores/_stores";
	import type PlugItIn from "../api/PlugItInAPI";

    export let api: PlugItIn;

    console.log($alarms);
    let modal = false;

    function handleSwitch(event){
        is_on.set(event.detail.checked);
        
        if($is_on){
            api.TurnOnDevice();
        } else {
            api.TurnOffDevice();
        }
    }

    function handleOKButton(event){
        api.NewAlarm(event.detail).then(result => {
            modal=false;
            api.GetAlarms().then(response => {
                alarms.set(response);
            });
        });
    }

    function UnixEpochToTime(epoch: number){
        let date = new Date(epoch * 1000);
        return date.getHours() + ":" + date.getMinutes();
    }
</script>

<div class="switch">
    <Switch height=70 width=140 checked={$is_on} on:change={handleSwitch}></Switch>
    <h3>Your product is: <b>{$is_on ? "on" : "off"}</b></h3>
</div>

<div class="alarms">
    <h5>Alarms:</h5>
    {#if $alarms.length}
        <div class="alarm-list">
            {#each $alarms as alarm}
                <div class="alarm">
                    <img src="clock-solid.svg" alt="Reloj"/>
                    {UnixEpochToTime(alarm)}
                    <img src="trash-solid.svg" alt="Basura" class="basura"/>
                </div>
            {/each}
        </div>
    {:else}
    <p>No alarms...</p>
    {/if} 
    {#if $alarms.length < 5}
        <img src="plus-circle-solid.svg" alt="Añadir" class="añadir" on:click={() => modal = true}/>
    {/if}
</div>
{#if modal}
    <div class="modal">
        <TimePicker date={new Date()} options={{hasButtons:true}} on:cancel={() => modal = false} on:ok={handleOKButton}/>

    </div>
{/if}

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

    .modal{
        display: flex;
        flex-direction: column;
        z-index: 999;
        position: absolute;
        width: 100%;
        height: 100%;
        justify-content: center;
        background-color: var(--tertiary-color);
        top: 0px;
        align-items: center;
    }
</style>
