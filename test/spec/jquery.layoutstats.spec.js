( function( $, QUnit ) {

	"use strict";

	var $testCanvas = $( "#testCanvas" );
	var $fixture = null;

	QUnit.module( "jQuery Layoutstats", {
		beforeEach: function () {
		},
		afterEach: function() {

			// we empty the testcanvas
			$testCanvas.empty();
		}
	} )

	QUnit.test( "is inside jQuery library", function( assert ) {

		assert.equal( typeof $.fn.layoutstats, "function", "has function inside jquery.fn" );
	} );


	QUnit.test( "caches plugin instance", function( assert ) {
		$testCanvas.layoutstats();
		assert.ok(
			$testCanvas.data( "plugin_layoutstats" ),
			"has cached it into a jQuery data"
		);
	} );

	QUnit.test( "enable custom config", function( assert ) {
		$testCanvas.layoutstats( {
			foo: "bar"
		} );

		var pluginData = $testCanvas.data( "plugin_layoutstats" );

		assert.deepEqual(
			pluginData.settings,
			{
				"uniqueFontStyles": true,
				"visibleChars": true
			},
			"extend plugin settings"
		);

	} );


}( jQuery, QUnit ) );
