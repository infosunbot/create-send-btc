import 'dotenv/config';
import { TatumSDK, Network } from '@tatumio/tatum';
import { UtxoWalletProvider } from '@tatumio/utxo-wallet-provider';

const tatum = await TatumSDK.init({
// Initialize the Tatum SDK for Bitcoin Testnet.
// Testnet avoids spending real BTC while demonstrating wallet features.
  network: Network.BITCOIN_TESTNET,
  configureWalletProviders: [UtxoWalletProvider],
});

// 24-word seed 
const mnemonic = tatum.walletProvider.use(UtxoWalletProvider).generateMnemonic();

const { xpub } = await tatum.walletProvider.use(UtxoWalletProvider).generateXpub(mnemonic);
// Derive the first deposit address (index 0)
// - HD wallet derive addresses by index.
const addr0 = await tatum.walletProvider.use(UtxoWalletProvider).generateAddressFromMnemonic(mnemonic, 0);

// Derive the private key that controls addr0 (index 0)
const pk0 = await tatum.walletProvider.use(UtxoWalletProvider).generatePrivateKeyFromMnemonic(mnemonic, 0);

console.log({ mnemonic, xpub, addr0, pk0 });

await tatum.destroy();
