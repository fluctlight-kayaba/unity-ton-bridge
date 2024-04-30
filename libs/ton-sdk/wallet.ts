import type { WalletInfoCurrentlyEmbedded } from '@tonconnect/sdk';
import {
	isWalletInfoCurrentlyEmbedded,
	isWalletInfoCurrentlyInjected,
} from '@tonconnect/sdk';

import { tonConnection } from './util';

export const connect = async (): Promise<void> => {
	tonConnection.restoreConnection();
	const wallets = await tonConnection.getWallets();
	const embeddedWallet = wallets.find(
		isWalletInfoCurrentlyEmbedded,
	) as WalletInfoCurrentlyEmbedded;
	const injectedWallet = wallets.find(isWalletInfoCurrentlyInjected);

	if (embeddedWallet) {
		console.log('connecting...');
		tonConnection.connect({
			jsBridgeKey: embeddedWallet.jsBridgeKey,
		});
	} else if (injectedWallet) {
		tonConnection.connect({
			jsBridgeKey: injectedWallet.jsBridgeKey,
		});
	}
};

export const disconnect = async () => {
	tonConnection.disconnect();
};
