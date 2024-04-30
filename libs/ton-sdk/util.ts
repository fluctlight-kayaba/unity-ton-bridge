/* eslint-disable-next-line */
export const global = window as any;

import TonConnect from '@tonconnect/sdk';

export const gameTokensPerTon = 1000;
export const gameTokensPerNanoTon = gameTokensPerTon / 1000000000;
export const tonConnection = new TonConnect();

tonConnection.onStatusChange((wallet) => {
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

/* eslint-disable-next-line */
export const sendUnityMessage = (className: string, methodName: string, ...args: any[]) => {
	global.unityInstance.SendMessage(className, methodName, ...args);
};
