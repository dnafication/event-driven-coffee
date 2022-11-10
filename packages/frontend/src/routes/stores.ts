import { writable } from 'svelte/store';

export const user = writable({ id: '', name: '' });

user.subscribe((value) => {
	console.log('user in store', value);
});
