module.exports = function( config ) {

	config.set( {
		files: [
			"node_modules/jquery/dist/jquery.js",
			"src/layoutstats.js",
			"test/setup.js",
			"test/spec/*"
		],
		frameworks: [ "qunit" ],
		plugins: ['karma-qunit'],
		autoWatch: true
	} );
};
