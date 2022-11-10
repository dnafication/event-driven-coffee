<script lang="ts">
	import { loadStripe } from '@stripe/stripe-js';
	import { Elements, PaymentElement } from 'svelte-stripe';

	import { onMount } from 'svelte';
  import { goto} from '$app/navigation'

  import { user } from './stores'

  console.log('user', $user);

	import { getContextClient, gql, queryStore, mutationStore } from '@urql/svelte';

	import { customAlphabet } from 'nanoid';
	const nanoid = customAlphabet('1234567890abcdef', 10);

  
	let selectedCoffee: any; //

	const client = getContextClient();
	const coffeeStore = queryStore({
		client,
		query: gql`
			query AllCoffees {
				getCoffees {
					id
					name
					price
					description
				}
			}
		`
	});

	/**
	 * Place order
	 */

	let placeOrderResult: any;
	let makePaymentResult: any;
	const placeOrder = () => {
		placeOrderResult = mutationStore({
			client,
			query: gql`
				mutation CreateOrder($coffeeId: ID!, $customerName: String!, $customerId: String!) {
					createOrder(coffeeId: $coffeeId, customerName: $customerName, customerId: $customerId) {
						id
						customerId
						customerName
						status
						note
						createdAt
					}
				}
			`,
			variables: {
				coffeeId: selectedCoffee.id,
				customerName: $user.name,
				customerId: $user.id
			}
		});
	};

	$: if ($placeOrderResult && !$placeOrderResult.fetching && $placeOrderResult.data) {
		const order = $placeOrderResult.data.createOrder;
		console.log('order', order);
		makePayment(order.id);
	}
	const makePayment = (orderId: string) => {
		makePaymentResult = mutationStore({
			client,
			query: gql`
				mutation MakePayment($orderId: ID!) {
					makePayment(orderId: $orderId) {
						id
						orderId
						status
						paymentIntentId
						clientSecret
						note
						createdAt
					}
				}
			`,
			variables: {
				orderId
			}
		});
	};

	/**
	 * Stripe
	 */
	let stripe: any = null;
	let elements: any;
	let clientSecret = '';
	let processing = false;
	let error;
	let showPayElement = false;

	onMount(async () => {
		console.log('onMount: stripe', import.meta.env.VITE_STRIPE_PUBLIC_KEY);
		stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
	});

  $: if ($makePaymentResult && !$makePaymentResult.fetching && $makePaymentResult.data) {
    const payment = $makePaymentResult.data.makePayment;
    console.log('payment', payment);
    clientSecret = payment.clientSecret;
    showPayElement = true;
  }

	async function submit() {
		// avoid processing duplicates
		if (processing) return;

		processing = true;

		// confirm payment with stripe
		const result = await stripe.confirmPayment({
			elements,
			redirect: 'if_required'
		});

		// log results, for debugging
		console.log({ result });

		if (result.error) {
			// payment failed, notify user
			error = result.error;
			processing = false;
		} else {
			console.log('payment success');
			processing = false;
      showPayElement = false;

			// payment succeeded, redirect to "thank you" page
			goto('/orders')
		}
	}
</script>

{#if $user.name !== '' }
	<h2 class="text-2xl font-bold">Welcome {$user.name}</h2>
{/if}

{#if $coffeeStore.data}
	<p>What would you like to have?</p>
	<div>
		<select class="select select-bordered w-full " bind:value={selectedCoffee}>
			{#each $coffeeStore.data.getCoffees as coffee}
				<option value={coffee}>{coffee.name}</option>
			{/each}
		</select>
		<p>{selectedCoffee ? selectedCoffee.description : ''}</p>
		<div class="mt-4 mb-2 font-medium text-slate-900">
			AUD ${selectedCoffee && selectedCoffee.price / 100}
		</div>
		<button class="btn btn-primary mb-4 w-6/12" on:click={placeOrder} disabled={!selectedCoffee}
			>Place Order
		</button>
	</div>
{/if}

{#if stripe && clientSecret && showPayElement}
	<Elements {stripe} {clientSecret} theme="stripe" bind:elements>
		<form on:submit|preventDefault={submit}>
			<PaymentElement />

			<button class="btn mt-3 w-6/12" disabled={processing}>
				{#if processing}
					Processing...
				{:else}
					Pay
				{/if}
			</button>
		</form>
	</Elements>
{/if}

{#if $coffeeStore.error}
	<div
		class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
		role="alert"
	>
		<span class="block sm:inline">{$coffeeStore.error.message}</span>
	</div>
{/if}


