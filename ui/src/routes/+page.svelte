<script lang="ts">
import { onMount } from "svelte";
import { fetchAccount, isReady, Mina, PublicKey, setGraphqlEndpoint } from 'snarkyjs';
import { writable } from "svelte/store";
/* import { Add } from "../../../contracts/build/src/Add"; */
import { Add } from 'geo3';

const zkAppAddress = 'B62qpHY3Q9do7SycwCeXD9Qst2Rqa6PRdQv4BLRxG4NqGZYpRCndLRW'

let zkApp = writable();

const updateState = async () => {
  console.log('entering function')
  const contractAddr = PublicKey.fromBase58(zkAppAddress);

  console.log('building tx')
  const tx = await Mina.transaction(async () => {
      let _account = await fetchAccount({ publicKey: zkAppAddress })
      const zkAdd = new Add(contractAddr);
      zkAdd.update();
  })

  // attach proof to tx
  await tx.prove();

  const Berkeley = Mina.Network(
     'https://proxy.berkeley.minaexplorer.com/graphql'
   );
  Mina.setActiveInstance(Berkeley);

  try {
    const { hash } = await window.mina.sendTransaction({
        transaction: tx.toJSON(),
    })

    console.log(hash);

    if (hash !== undefined) {
      console.log(`
    Success! Update transaction sent.

    Your smart contract state will be updated
    as soon as the transaction is included in a block:
    https://berkeley.minaexplorer.com/transaction/${hash}
    `);
    }
  } catch (e) {
    alert(tx.toJSON());
    console.error(e)
  }
}

let accounts = writable();

onMount(async () => {
    await isReady;

    accounts.set(await window.mina.requestAccounts());

    // Update this to use the address (public key) for your zkApp account
    // To try it out, you can try this address for an example "Add" smart contract that we've deployed to
    // Berkeley Testnet B62qisn669bZqsh8yMWkNyCA7RvjrL6gfdr3TQxymDHNhTc97xE5kNV
    const zkAppAddress = 'B62qpHY3Q9do7SycwCeXD9Qst2Rqa6PRdQv4BLRxG4NqGZYpRCndLRW'
    // This should be removed once the zkAppAddress is updated.
    if (!zkAppAddress) {
    console.error(
        'The following error is caused because the zkAppAddress has an empty string as the public key. Update the zkAppAddress with the public key for your zkApp account, or try this address for an example "Add" smart contract that we deployed to Berkeley Testnet: B62qqkb7hD1We6gEfrcqosKt9C398VLp1WXeTo1i9boPoqF7B1LxHg4',
        );
    }

    setGraphqlEndpoint('https://proxy.berkeley.minaexplorer.com/graphql')

    console.log("hello from mount")
    zkApp.set(new Add(PublicKey.fromBase58(zkAppAddress)))
    let account = await fetchAccount({ publicKey: zkAppAddress })
    console.log(account.account?.balance.toString());
    });
</script>

<h1>zkApp Test</h1>
{#if $zkApp}
    {#await $zkApp.num.fetch()}
        <p>loading chain state...</p>
    {:then stateNum}
        <p>{stateNum.toString()}</p>
    {/await}
{/if}

{#if $accounts}
<p>{`connected account: ${$accounts}`}</p>
{/if}
<button on:click={updateState}>increment state</button>
