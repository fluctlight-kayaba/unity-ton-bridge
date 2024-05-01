import { beginCell } from '@ton/core';
import type { SendTransactionRequest } from '@tonconnect/sdk';

import { gameTokensPerNanoTon, tonConnection } from './util';

export const purchaseGameToken = async (amount: number) => {
	const transaction: SendTransactionRequest = {
		messages: [
			{
				address: '0QATUnNyja0PmKVxaSEeZXj6N9EVZVYnxEIuoM_gQFRdPYSk',
				amount: String(amount / gameTokensPerNanoTon),
				payload: beginCell()
					.storeUint(0, 32)
					.storeStringTail('Purchase Game Token')
					.endCell()
					.toBoc()
					.toString('base64'),
			},
		],
		validUntil: new Date().getTime() + 1000 * 60 * 15, // 15 minutes
	};
	await tonConnection.sendTransaction(transaction);
	console.log('Purchasing...', amount);
};
