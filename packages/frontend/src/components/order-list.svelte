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

</div>
