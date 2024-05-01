const { writeFile } = require('fs/promises');
const { build } = require('esbuild');
const { watch } = require('chokidar');
const { polyfillNode } = require('esbuild-plugin-polyfill-node');

const domainUrl = 'http://localhost:8080';
const isWatchMode = process.argv.includes('--watch');

const buildTonSDK = async () => {
	try {
		const connectManifest = {
			url: `${domainUrl}`,
			name: 'Ton Game',
			iconUrl: `${domainUrl}/TemplateData/icon.png`,
			termsOfUseUrl: `${domainUrl}/term-of-use`,
			privacyPolicyUrl: `${domainUrl}/privacy-policy`,
		};

		await build({
			entryPoints: ['./libs/ton-sdk/index.ts'],
			bundle: true,
			outfile: './build/game/ton-sdk.js',
			plugins: [
				polyfillNode({
					globals: { buffer: true },
				}),
			],
		});

		await writeFile(
			'./build/game/tonconnect-manifest.json',
			JSON.stringify(connectManifest, null, 4),
		);
	} catch (error) {
		console.log(error);
	}
};

if (isWatchMode) {
	watch('./libs', {
		ignoreInitial: true,
		ignored: ['**/node_modules/**/*', '**/.git/**/*', '**/.idea/**/*'],
	}).on('all', async () => {
		await buildTonSDK();
		console.log('re-build completed...');
	});
}

buildTonSDK();
