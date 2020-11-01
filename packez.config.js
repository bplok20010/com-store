const pkg = require("./package.json");
module.exports = function (options, state) {
	return {
		useTypeScript: false,
		babel: {
			plugins: [
				[
					"search-and-replace",
					{
						rules: [
							{
								search: "%VERSION%",
								replace: pkg.version,
							},
						],
					},
				],
			],
		},
		eslint: {
			rules: {
				"react-hooks/rules-of-hooks": "warn",
			},
		},
	};
};
