<script lang="ts">
	import '../app.css';

	type Coffee = {
		id: string;
		name: string;
		description: string;
		price: number;
	};

	export let coffeeList: Coffee[];
	export let selectedCoffee: Coffee | null = null;
</script>

<div class="space-y-4">
	{#each coffeeList as coffee}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="pointer-events-auto rounded-lg bg-white p-4 text-[0.8125rem] leading-5 shadow-xl shadow-black/5 hover:bg-slate-50 ring-2" class:ring-indigo-600={selectedCoffee && selectedCoffee.id === coffee.id}
			id={coffee.id} on:click={() => (selectedCoffee = coffee)}
		>
			<div class="flex justify-between">
				<div class="font-medium text-slate-900">{coffee.name}</div>
				{#if selectedCoffee && selectedCoffee.id === coffee.id}
					<svg class="h-5 w-5 flex-none" fill="none"
						><path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z"
							fill="#4F46E5"
						/></svg
					>
				{/if}
			</div>
			<div class="mt-1 text-slate-700">{coffee.description}</div>
			<div class="mt-6 font-medium text-slate-900">AUD ${coffee.price / 100}</div>
		</div>
	{/each}
</div>
