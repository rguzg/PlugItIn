import {writable} from 'svelte/store';

export const alarms = writable([]);
export const is_connected = writable(false);
export const is_on = writable(false);

