
// sendBtc.js
// Purpose: Sign and broadcast a *Bitcoin Testnet* transaction using Tatum's JS SDK.
// Notes for reviewers:
// - Uses Tatum's UTXO wallet provider to sign locally and broadcast via Tatum infra.
// - Verifies balance and fetches spendable UTXOs before attempting to send.
// - All secrets (API key, private key) are provided through .env and never committed.

import 'dotenv/config';
import axios from 'axios';
import { TatumSDK, Network } from '@tatumio/tatum';
import { UtxoWalletProvider } from '@tatumio/utxo-wallet-provider';
// ---- Config -----------------------------------------------------------------

// Tatum public API + API key. API key is required for Data API and broadcast.
//I created a personal tatum account and get my Testnet API key from the dashboard
const API = 'https://api.tatum.io';
const KEY = process.env.TATUM_API_KEY;

// Addresses & amounts are provided via environment variables to avoid committing secrets.
const FROM_ADDR  = process.env.FROM_ADDR; // Testnet address with UTXOs (e.g., m/n... or tb1...)
const FROM_PRIV  = process.env.FROM_PRIV; // Corresponding Testnet Private Key (controls FROM_ADDR)
const TO_ADDR    = process.env.TO_ADDR;              // use a DIFFERENT addr from FROM_ADDR
const AMOUNT_BTC = Number(process.env.AMOUNT_BTC || '0.00001'); // BTC to send
const FEE_BTC    = Number(process.env.FEE_BTC || '0.00002');  // Flat fee in BTC

// ---- Lightweight pre-checks (balance + UTXOs) -------------------------------

// 1) Read-only balance (v3). Helpful for a quick sanity check; amounts are BTC strings.
async function getBalance(addr) {
  const { data } = await axios.get(`${API}/v3/bitcoin/address/balance/${addr}`, {
    headers: { 'x-api-key': KEY }
  });
  return data; // { incoming, outgoing, incomingPending, outgoingPending }
}

// 2) UTXO selection (v4 data API). Requests enough spendable inputs to cover amount+fee.
//    Chain selector here is *bitcoin-testnet* (Testnet3). If you switch to Signet or Testnet4,
//    change the "chain=" parameter accordingly (e.g., bitcoin-signet, bitcoin-testnet4).
async function getUtxos(addr, totalBtc) {
  const url = `${API}/v4/data/utxos?chain=bitcoin-testnet&address=${addr}&totalValue=${totalBtc}`;
  const { data } = await axios.get(url, { headers: { 'x-api-key': KEY } });
  return Array.isArray(data) ? data : [];
}


// ---- Main flow ---------------------------------------------------------------

(async () => {
    // A) Show balance (purely informative; broadcast relies on UTXO set below).
  console.log('--- Checking balance ---');
  const bal = await getBalance(FROM_ADDR);
  console.log('Balance:', bal); 

  // B) Ask the Data API for enough UTXOs to cover amount + fee.
  const need = AMOUNT_BTC + FEE_BTC;
  console.log(`Need at least: ${need} BTC (amount + fee)`);

  console.log('--- Fetching UTXOs (v4) ---');
  const utxos = await getUtxos(FROM_ADDR, need);
  console.log('Selected UTXOs:', utxos);

  if (utxos.length === 0) {
    throw new Error('No UTXOs returned yet — wait for faucet confirmation or increase totalValue.');
  }

// C) Init Tatum SDK for Bitcoin *Testnet3* and enable the UTXO wallet provider.
  const tatum = await TatumSDK.init({
    network: Network.BITCOIN_TESTNET,
    configureWalletProviders: [UtxoWalletProvider],
    apiKey: { v4: KEY },
  });

  // D) Build a minimal transfer payload.
  //    - "fromAddress" pairs the sender address with its private key for local signing.
  //    - "to" lists outputs; "changeAddress" receives the leftover change.
  const payload = {
    fromAddress: [{ address: FROM_ADDR, privateKey: FROM_PRIV }],
    to: [{ address: TO_ADDR, value: AMOUNT_BTC }],
    fee: FEE_BTC,
    changeAddress: FROM_ADDR,
  };

  console.log('--- Broadcasting ---');

  // E) Sign inputs locally and broadcast via Tatum. Returns the transaction hash.
  const txHash = await tatum.walletProvider.use(UtxoWalletProvider).signAndBroadcast(payload);
  console.log('txHash:', txHash);

// F) Clean shutdown.
  await tatum.destroy();
})().catch((e) => {
  console.error('Error:', e.response?.data || e.message || e);
  process.exit(1);
});
