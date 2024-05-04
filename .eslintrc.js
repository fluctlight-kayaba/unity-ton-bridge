module.exports = {
	root: true,
	extends: ['@metacraft/eslint-config'],
	ignorePatterns: ['node_modules', 'build'],
	env: {
		node: true,
	},
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
	},
	globals: {
		window: true,
		document: true,
		navigator: true,
		fetch: true,
		WebAssembly: true,
	},
};
