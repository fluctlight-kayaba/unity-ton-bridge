export const global = window as any;

import { TonConnectUI } from '@tonconnect/ui';

export const gameTokensPerTon = 1000;
export const gameTokensPerNanoTon = gameTokensPerTon / 1000000000;

export let tonConnectUI: TonConnectUI;

global.onUnityReady = () => {
	tonConnectUI = new TonConnectUI({
		manifestUrl: `${location.origin}/tonconnect-manifest.json`,
		// buttonRootId: 'connect-button',
	});

	tonConnectUI.onStatusChange((wallet) => {
		if (wallet) {
			sendUnityMessage(
				'TonBridge',
				'OnWalletConnected',
				wallet.account.address,
				wallet.provider,
			);
		} else {
			sendUnityMessage('TonBridge', 'OnWalletDisconnected');
		}
	});
};

/* eslint-disable-next-line */
export const sendUnityMessage = (className: string, methodName: string, ...args: any[]) => {
	global.unityInstance.SendMessage(className, methodName, ...args);
};
