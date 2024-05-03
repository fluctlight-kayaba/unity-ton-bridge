import { getHttpEndpoint } from '@orbs-network/ton-access';
import {
	Address,
	beginCell,
	internal,
	storeMessageRelaxed,
	toNano,
} from '@ton/core';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { JettonMaster, TonClient, WalletContractV4 } from '@ton/ton';

import { config, Opcodes } from './util';

const endpointPromise = getHttpEndpoint({ network: 'testnet' });

export const getEndpoint = async () => {
	return endpointPromise;
};

export const getClient = async () => {
	return new TonClient({ endpoint: await endpointPromise });
};

const adminAddress = Address.parse(
	'0QATUnNyja0PmKVxaSEeZXj6N9EVZVYnxEIuoM_gQFRdPYSk',
);
const jettonMasterAddress = Address.parse(
	'EQACW8oUW4NHN2FlX4fO3UPno_kZn0232Hfw1sIJIb89qY7m',
);

export const transferJetton = async (amount: number, to: string) => {
	const client = await getClient();
	const workchain = 0;
	const adminKeypair = await mnemonicToPrivateKey(config.adminMnemonic);
	const adminWallet = WalletContractV4.create({
		workchain,
		publicKey: adminKeypair.publicKey,
	});
	const adminAddressCalucated = adminWallet.address;
	console.log(adminAddress, adminAddressCalucated);
	const adminWalletContract = client.open(adminWallet);
	const toAddress = Address.parse(to);
	const jettonMaster = client.open(JettonMaster.create(jettonMasterAddress));
	const jettonWalletAddress = await jettonMaster.getWalletAddress(toAddress);
	const body = createTransferCell(toAddress, adminAddress, toNano(amount));

	const internalMessage = internal({
		to: jettonWalletAddress,
		value: toNano('0.01'),
		bounce: true,
		body,
	});

	const internalMessageCell = beginCell()
		.store(storeMessageRelaxed(internalMessage))
		.endCell();

	console.log(internalMessageCell);
	console.log(adminWalletContract);
	// const seqno: number = await adminWalletContract.getSeqno();
	// const result = await adminWalletContract.sendTransfer({
	// 	seqno,
	// 	secretKey: adminKeypair.secretKey,
	// 	messages: [internalMessage],
	// });

	// console.log(result);
};

export const createTransferCell = (
	to: Address,
	from: Address,
	jettonAmount: bigint | number,
) => {
	return beginCell()
		.storeUint(Opcodes.transfer, 32)
		.storeUint(0, 64)
		.storeCoins(jettonAmount)
		.storeAddress(to)
		.storeAddress(from)
		.storeBit(false)
		.storeCoins(toNano(0.001))
		.storeBit(false) // no further refs
		.endCell();
};
