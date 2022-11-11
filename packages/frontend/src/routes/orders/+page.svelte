<script lang="ts">
	import { user as userFromStore } from '../stores';
	import { getContextClient, gql, queryStore } from '@urql/svelte';

	let user: any;
	userFromStore.subscribe((value) => {
		user = value;
	});

	const client = getContextClient();
	let orders: any;
	$: if (user.id !== '') {
		orders = queryStore({
			client,
			query: gql`
				query allOrders($customerId: String) {
					getOrderList(customerId: $customerId) {
						id
						customerId
						customerName
						coffee {
							id
							name
							description
							price
						}
						status
						note
						createdAt
					}
				}
			`,
			variables: {
				customerId: user.id
			}
		});
	}
</script>

{#if user.name !== ''}
	<h2 class="text-2xl font-bold">Hey {user.name}, your orders:</h2>

	{#if $orders && $orders.fetching}
		<p>Loading...</p>
	{:else if $orders.error}
		<p>Error: {$orders.error.message}</p>
	{:else if $orders.data.getOrderList.length === 0}
		<p>You have no orders yet.</p>
	{:else}
		<div class="container">
			{#each $orders.data.getOrderList as order}
				<div class="overflow-hidden bg-base-200 shadow sm:rounded-lg mb-2">
					<div class="px-6 py-1">
						<h3 class="text-lg font-medium leading-6 text-gray-900">{order.coffee.name}</h3>
						<p class="mt-1 max-w-2xl text-sm text-gray-500">Order ID: {order.id}</p>
					</div>
					<div class="border-t border-gray-200">
						<dl>
							<div class="bg-gray-50 px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
								<dt class="text-sm font-medium text-gray-500">Status</dt>
								<dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{order.status}</dd>
							</div>
							<div class="bg-white px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
								<dt class="text-sm font-medium text-gray-500">Note</dt>
								<dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{order.note}</dd>
							</div>
						</dl>
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/if}
