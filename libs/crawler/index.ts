import { Address, fromNano } from '@ton/ton';
import axios from 'axios';

import {
	config,
	getAllPendingTransactions,
	parseTransactionInfo,
	sleep,
} from './util';

const { address: adminAddress } = Address.parseFriendly(config.adminWallet);

export const crawl = async () => {
	const transactions = await getAllPendingTransactions(adminAddress);
	const infos = await Promise.all(
		transactions.map((i) => parseTransactionInfo(i)),
	);
	const filteredInfos = infos.filter(
		(i) => i.comment === 'Purchase Game Token',
	);

	for (const info of filteredInfos) {
		/* further detail about address format:
		 * https://docs.ton.org/develop/dapps/cookbook#what-flags-are-there-in-user-friendly-addresses */
		const formattedAddress = info.sender?.toString({
			bounceable: false,
			testOnly: true,
		});

		console.log(
			`Processing ${fromNano(String(info.value))} TON transfer from ${formattedAddress}`,
		);

		await axios.post(
			`https://api.xcoinplay.online:1000/home/charge-coin`,
			null,
			{
				params: {
					walletaddress: formattedAddress,
					coin: info.value ? fromNano(info.value) : 0,
				},
			},
		);
	}

	await sleep(1000 * 60); // 1 minutes interval
	await crawl();
};

crawl();
