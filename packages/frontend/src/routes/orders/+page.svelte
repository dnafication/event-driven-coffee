<script lang="ts">
  import { user as userFromStore } from '../stores'

  let user:any;
  userFromStore.subscribe(value => {
    user = value
  })
  

</script>

{#if user.name !== '' }
	<h2 class="text-2xl font-bold">{user.name}, your orders</h2>
{/if}