import type { ExternalAddress } from '@ton/core';
import type { Address, Transaction } from '@ton/core';
import { TonClient } from '@ton/ton';
import leveldown from 'leveldown';
import levelup from 'levelup';

const defaultEndpoint = 'https://testnet.toncenter.com/api/v2/jsonRPC';
const rpcEndpoint = process.env.RPC_ENDPOINT || defaultEndpoint;
const defaultAdminWallet = '0QATUnNyja0PmKVxaSEeZXj6N9EVZVYnxEIuoM_gQFRdPYSk';
const adminWallet = process.env.ADMIN_WALLET || defaultAdminWallet;
const adminMnemonic = process.env.ADMIN_MNEMONIC || '';

export const config = {
	rpcEndpoint: rpcEndpoint as string,
	adminWallet: adminWallet as string,
	adminMnemonic: adminMnemonic.split(' '),
};

export const db = levelup(leveldown('./storage'));
export const client = new TonClient({
	endpoint: config.rpcEndpoint,
});

export const Opcodes = {
	// from minter repo: https://github.com/ton-blockchain/minter
	changeAdmin: 3,
	replaceMetadata: 4,
	mint: 21,
	internalTransfer: 0x178d4519,
	transfer: 0xf8a7ea5,
	burn: 0x595f07bc,
	// for transaction history parse/detection
	bareTransaction: 0,
	jettonTransfer: 0x7362d09c,
	nftTransfer: 0x05138d91,
};

export interface CrawlerCursor {
	lt: string;
	hash: string;
}

export const getPreviousCursor = async (): Promise<
	CrawlerCursor | undefined
> => {
	try {
		const result = await db.get('previousHash');
		return JSON.parse(result.toString()) as CrawlerCursor;
	} catch {
		console.log('previous hash not found..');
	}
};

export const storeCursor = async (
	transaction: Transaction,
): Promise<CrawlerCursor> => {
	const cursor: CrawlerCursor = {
		lt: transaction.lt.toString(),
		hash: transaction.hash().toString('base64'),
	};

	await db.put('previousHash', JSON.stringify(cursor));
	return cursor;
};

export const makeCursor = async (
	transaction: Transaction,
): Promise<CrawlerCursor> => {
	return {
		lt: transaction.lt.toString(),
		hash: transaction.hash().toString('base64'),
	};
};

export const sleep = async (timeout: number) => {
	return new Promise((resolve) => {
		setTimeout(() => resolve(true), timeout);
	});
};

export const getAllPendingTransactions = async (
	owner: Address,
	chunkSize = 100,
	chunkDelay = 2000,
): Promise<Transaction[]> => {
	const pendingTransactions: Transaction[] = [];
	const globalCusor = await getPreviousCursor();
	let localCursor: Partial<CrawlerCursor> = {};
	let isContinued = true;

	while (isContinued) {
		/* eslint-disable-next-line */
		const options: any = { limit: chunkSize };

		if (localCursor?.lt) {
			options.lt = localCursor.lt;
			options.hash = localCursor.hash;
		}

		const chunkItems = await client.getTransactions(owner, options);
		const globalCursorIndex = chunkItems.findIndex(
			(item) => item.hash().toString('base64') === globalCusor?.hash,
		);
		const isGlobalCursorFound = globalCursorIndex >= 0;
		const endIndex = isGlobalCursorFound
			? globalCursorIndex
			: chunkItems.length;

		for (let i = 0; i < endIndex; i += 1) {
			pendingTransactions.push(chunkItems[i]);
		}

		if (isGlobalCursorFound || chunkItems.length < chunkSize) {
			isContinued = false;
		} else {
			const lastTransaction = chunkItems[chunkItems.length - 1];
			localCursor = await makeCursor(lastTransaction);
			await sleep(chunkDelay);
		}
	}

	if (pendingTransactions[0]) {
		await storeCursor(pendingTransactions[0]);
	}

	return pendingTransactions;
};

export interface TransactionInfo {
	type: 'jetton' | 'nft' | 'bare';
	sender?: Address;
	receiver?: Address;
	comment?: string;
	value?: bigint;
	jettonValue?: bigint;
	jettonSender?: Address | ExternalAddress | null;
	originalForwardPayload?: string;
	nftFromOwner?: Address;
}

/* Part of the TON Cookbook: https://docs.ton.org/develop/dapps/cookbook */
export const parseTransactionInfo = async ({
	inMessage,
}: Transaction): Promise<TransactionInfo> => {
	const info: TransactionInfo = { type: 'bare' };

	if (inMessage?.info?.type === 'internal') {
		info.sender = inMessage.info.src;
		info.receiver = inMessage.info.dest;
		info.value = inMessage.info.value.coins;

		const originalBody = inMessage.body.beginParse();
		const body = originalBody.clone();

		/* ignore parsing body without opcode, which is a simple message without any info */
		if (body.remainingBits >= 32) {
			const op = body.loadUint(32);

			if (op === Opcodes.bareTransaction) {
				info.comment = body.loadStringTail();
			} else if (op === Opcodes.jettonTransfer) {
				body.skip(64); // skip queryId
				info.type = 'jetton';
				info.jettonValue = body.loadCoins();
				info.jettonSender = body.loadAddressAny();
				const originalForwardPayload = body.loadBit()
					? body.loadRef().beginParse()
					: body;
				const forwardPayload = originalForwardPayload.clone();

				/* similar, ignore parsing jetton body without opcode */
				if (forwardPayload.remainingBits >= 32) {
					const forwardOp = forwardPayload.loadUint(32);

					if (forwardOp === Opcodes.bareTransaction) {
						info.comment = forwardPayload.loadStringTail();
					}
				}
			} else if (op === Opcodes.nftTransfer) {
				body.skip(64); // skip queryId
				info.type = 'nft';
				info.nftFromOwner = body.loadAddress();

				const originalForwardPayload = body.loadBit()
					? body.loadRef().beginParse()
					: body;
				const forwardPayload = originalForwardPayload.clone();

				if (forwardPayload.remainingBits >= 32) {
					const forwardOp = forwardPayload.loadUint(32);

					if (forwardOp === Opcodes.bareTransaction) {
						info.comment = forwardPayload.loadStringTail();
					}
				}
			}
		}
	}

	return info;
};
