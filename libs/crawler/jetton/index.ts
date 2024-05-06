import { Address, toNano, fromNano } from '@ton/core';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';

import { getClient, config } from '../util';

import { JettonMinter } from './minter';
import { JettonWallet } from './wallet';

const minterAddress = Address.parse(
	'kQACW8oUW4NHN2FlX4fO3UPno_kZn0232Hfw1sIJIb89qTVs',
);

export const transferJetton = async (amount: bigint | number, to: string) => {
	const adminKeypair = await mnemonicToPrivateKey(config.adminMnemonic);
	const adminWallet = WalletContractV4.create({
		workchain: 0,
		publicKey: adminKeypair.publicKey,
	});
	const client = await getClient();
	const walletContract = client.open(adminWallet);
	const jettonMinter = client.open(JettonMinter.createFromAddress(minterAddress));
	console.log(await jettonMinter.getJettonData());
	const userWallet = async (address: Address) => {
		const jettonAddress = await jettonMinter.getWalletAddress(address);
		return client.open(JettonWallet.createFromAddress(jettonAddress));
	};

	const adminJetton = await userWallet(walletContract.address);
	const receiverAddress = Address.parse(to);
	const receiverJetton = await userWallet(receiverAddress);
	await adminJetton.sendTransfer(
		walletContract.sender(adminKeypair.secretKey),
		toNano(0.1),
		toNano(amount),
		Address.parse(to),
		adminWallet.address,
		null,
		toNano(0.05),
		null,
	);

	const receiverBalance = await receiverJetton.getJettonBalance();
	console.log('Balance after:', fromNano(receiverBalance));
};
