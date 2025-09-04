# Bitcoin Testnet Transaction Demo – Tatum SDK

## Overview
This demo shows how to:
- Create Bitcoin Testnet wallets (`generateWallet.js`)
- Fund an address via a Testnet3 faucet
- Sign and broadcast a transaction (`sendBtc.js`)

## Prerequisites
- Node.js 18+
- NPM
- Tatum API Key (https://dashboard.tatum.io)

## Setup
```bash
git clone <repo_url>
cd create-send-btc
npm install

## Wallet Generation

Run the generator to create addresses & private keys:
```bash
node generateWallet.js


This prints:

addr0 (fund with faucet → FROM_ADDR)

pk0 (private key for FROM_ADDR)

addr1 (use as TO_ADDR)

Environment Variables

Create a .env file:

TATUM_API_KEY=your-key
FROM_ADDR=addr0
FROM_PRIV=pk0
TO_ADDR=addr1
AMOUNT_BTC=0.00001
FEE_BTC=0.00002


Run Transaction
node sendBtc.js


Expected:

--- Checking balance ---
Balance: { incoming: '0.00282553', ... }
--- Fetching UTXOs ---
Selected UTXOs: [...]
--- Broadcasting ---
txHash: <transaction hash>


Use a Testnet3 explorer (mempool.space/testnet) to confirm.

Notes

If UTXOs are empty: wait for faucet confirmation.

If fee too low: increase FEE_BTC.

Keys live only in .env.
