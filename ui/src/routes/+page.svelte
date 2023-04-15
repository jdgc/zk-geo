<script lang="ts">
import { onMount } from "svelte";
import { fetchAccount, isReady, Mina, PublicKey, Field, setGraphqlEndpoint, fetchEvents, setArchiveGraphqlEndpoint } from 'snarkyjs';
import { writable } from "svelte/store";
/* import { Add } from "../../../contracts/build/src/Add"; */
import { Geo } from 'geo3';

const zkAppAddress = 'B62qnHxWZfGxZAwogieDNgSDfF7FUTzNaaMf3hoJY81Gs7muCZjmj7e'

let zkApp = writable();

let events = writable();

const fetchAllEvents = async () => {
    const contractAddr = PublicKey.fromBase58(zkAppAddress);
    await fetchAccount({ publicKey: zkAppAddress })
    setGraphqlEndpoint('https://proxy.berkeley.minaexplorer.com/graphql')
    setArchiveGraphqlEndpoint('https://archive.berkeley.minaexplorer.com/')
    const zkGeo = new Geo(PublicKey.fromBase58(zkAppAddress))

    /* const eventList = await fetchEvents({ publicKey: zkAppAddress }) */
    const eventList = await zkGeo.fetchEvents();
    alert(eventList)
    events.set(eventList)
}

const updateState = async () => {
  const contractAddr = PublicKey.fromBase58(zkAppAddress);

  const tx = await Mina.transaction(async () => {
      await fetchAccount({ publicKey: zkAppAddress })
      const zkGeo = new Geo(contractAddr);
      // placeholder hard code
      zkGeo.validateCoords(PublicKey.fromBase58('B62qkRcrp27AH9dQr74BeG6Jy3PXR15H7e2bs4dtmFtJxjR2WXXMg1g'), Field(3568), Field(13968));
  })

  // attach proof to tx
  await tx.prove();

  try {
    const { hash } = await window.mina.sendTransaction({
        transaction: tx.toJSON(),
        feePayer: {
           fee: 0.11,
           memo: 'Checking coordinates'
        }
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

    const zkAppAddress = 'B62qnHxWZfGxZAwogieDNgSDfF7FUTzNaaMf3hoJY81Gs7muCZjmj7e'
    /* const zkAppAddress = 'B62qpHY3Q9do7SycwCeXD9Qst2Rqa6PRdQv4BLRxG4NqGZYpRCndLRW' */

    setGraphqlEndpoint('https://proxy.berkeley.minaexplorer.com/graphql')

    const Berkeley = Mina.Network(
       'https://proxy.berkeley.minaexplorer.com/graphql'
     );
    Mina.setActiveInstance(Berkeley);

    const zkGeo = new Geo(PublicKey.fromBase58(zkAppAddress))
    zkApp.set(zkGeo)
    let account = await fetchAccount({ publicKey: zkAppAddress })
    });
</script>

<h1>ZK Coordinate Check</h1>
{#if $accounts}
<p>{`connected account: ${$accounts}`}</p>
{/if}
{#if $events && $events[0]}
<p>{$events[0]}</p>
{/if}
<button on:click={updateState}>submit location</button>
<button on:click={fetchAllEvents}>fetch attended list</button>
