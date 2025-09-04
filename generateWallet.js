import 'dotenv/config';
import { TatumSDK, Network } from '@tatumio/tatum';
import { UtxoWalletProvider } from '@tatumio/utxo-wallet-provider';

const tatum = await TatumSDK.init({
  // The SDK’s Bitcoin “Getting Started” flow is testnet-oriented.
  // Use the UTXO wallet provider for BTC-like chains.
  network: Network.BITCOIN_TESTNET,
  configureWalletProviders: [UtxoWalletProvider],
});

// 24-word seed (store securely!)
const mnemonic = tatum.walletProvider.use(UtxoWalletProvider).generateMnemonic();

// Derive xpub and first deposit address (index 0)
const { xpub } = await tatum.walletProvider.use(UtxoWalletProvider).generateXpub(mnemonic);
const addr0 = await tatum.walletProvider.use(UtxoWalletProvider).generateAddressFromMnemonic(mnemonic, 0);

// Derive the private key that controls addr0 (index 0)
const pk0 = await tatum.walletProvider.use(UtxoWalletProvider).generatePrivateKeyFromMnemonic(mnemonic, 0);

console.log({ mnemonic, xpub, addr0, pk0 });

await tatum.destroy();
