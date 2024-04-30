import type { SSTConfig } from 'sst';
import type { StackContext } from 'sst/constructs';
import { StaticSite } from 'sst/constructs';

export const htmlGame = ({ stack }: StackContext) => {
	const wallet = new StaticSite(stack, 'wallet', {
		path: './',
		buildOutput: './build/game',
		buildCommand: 'yarn build',
	});

	stack.addOutputs({
		url: wallet.url || 'localhost',
	});
};

export default {
	config() {
		return {
			name: 'upwork-ton-game',
			region: 'ap-south-1',
		};
	},
	stacks(app) {
		app.stack(htmlGame);
	},
} satisfies SSTConfig;
