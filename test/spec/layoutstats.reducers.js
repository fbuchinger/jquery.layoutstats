( function( window, QUnit ) {

	"use strict";

	QUnit.module( "jQuery Layoutstats Reducers");

	QUnit.test( "The average reducer ", function( assert ) {
		var lineheightsByCharacters = [{"key":"1.50px","value":20},{"key":"1.50px","value":12},{"key":"2.25px","value":4},{"key":"2.25px","value":4}];
		var average = LayoutStats.getReducer("average");
		assert.equal(lineheightsByCharacters.reduce(average.fn, average.initialValue()), 1.65, "can calculate the average of a key/value based metric");

	})

})( window, QUnit );
