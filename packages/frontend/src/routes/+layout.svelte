<script lang="ts">
	import '../app.css';
	import { createClient, setContextClient } from '@urql/svelte';
	import { onMount } from 'svelte';
  import { user as userFromStore} from './stores'

  import { customAlphabet } from 'nanoid';
	const nanoid = customAlphabet('1234567890abcdef', 10);

  let ls: Storage | null = null;
	let user = { id: '', name: '' };
	let showModal = false;

	onMount(() => {
		typeof localStorage !== `undefined` && (ls = localStorage);
		user = getUser() ?? { id: '', name: '' };
		console.log('user', user);
    userFromStore.update(() => user)
    console.log('userFromStore', $userFromStore);
		if (user.id === '' || user.name === '') {
			showModal = true;
		}
	});

	const getUser = (): any => {
		if (ls) {
			const user = ls.getItem('user');
			if (user) {
				return JSON.parse(user);
			}
			return { id: '', name: '' };
		}
	};

	const setUser = () => {
		// generate random id
		const id = nanoid();
		const name = user.name;
		if (name === '') {
			return;
		}
		user.id = id;
		!!ls &&
			ls.setItem(
				'user',
				JSON.stringify({
					id,
					name
				})
			);
    userFromStore.update(() => user)

		showModal = false;
	};

	const client = createClient({
		url: `http://localhost:4000/`
	});

	setContextClient(client);
</script>

<main class="container mx-auto max-w-lg p-2 bg-slate-200 prose">
	<slot />
</main>

<div class="modal modal-bottom sm:modal-middle" class:modal-open={showModal}>
	<div class="modal-box">
		<h3 class="font-bold text-lg pb-3">What should I call you?</h3>
		<input
			type="text"
			placeholder="Type here"
			bind:value={user.name}
			class="input input-bordered input-primary w-full"
		/>
		<div class="modal-action">
			<button for="my-modal-6" class="btn" on:click={setUser}>Let's GO!</button>
		</div>
	</div>
</div>
