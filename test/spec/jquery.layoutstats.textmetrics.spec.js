( function( $, QUnit ) {

	"use strict";

	var $testCanvas = $( "#testCanvas" );

	QUnit.module( "jQuery Layoutstats Text Metrics", {
		beforeEach: function() {

		},
		afterEach: function() {

			// we empty the testcanvas
			$testCanvas.empty();
		}
	} );

	QUnit.test( "count the visible characters on a page", function( assert ) {
		var charCountTests = [
			{node: '<div>1234</div>', charCount:4 , assertion:'returns the visible count of all chars'},
			{node: '<div>    </div>', charCount:0 , assertion:'ignores textnodes that just consist of whitespace'},
			{node: '<div><style>.myclass {color: #f3f3f3;}</style></div>', charCount:0 , assertion:'ignores text in <style> nodes'},
			{node: '<div><script type="text/javascript">var foo = "bar";</script></div>', charCount:0 , assertion:'ignores text in <script> nodes'},
			{node: '<div><!-- a comment --></div>', charCount:0 , assertion:'ignores text in html comments'},
			{node: '<div><div>aa</div><div>bb</div></div>', charCount:4 , assertion:'counts chars in child nodes'},
			{node: '<div><div style="display:none;">aa</div><div>bb</div></div>', charCount:2 , assertion:'ignores invisible nodes'},
		];

		for (var i = 0; i < charCountTests.length; i++){
			var test = charCountTests[i];
			var $charDiv = $(test.node).appendTo($testCanvas);
			var result =  $charDiv.layoutstats().textVisibleCharCount;

			assert.equal(result, test.charCount, test.assertion );
		}

	});

	QUnit.test( "count the number of font styles used", function( assert ) {
		var charCountTests = [
			{node: '<div>1234</div>', expected: {styleCount:1 , fontCount: 1, colorCount: 1},  assertion:'returns the number of font styles used in a node'},
			{node: '<div>12<b>3</b>4</div>', expected: {styleCount:2 , fontCount: 1, colorCount: 1}, assertion:'detects style modifications caused by html nodes (e.g. <b></b>'},
			{node: '<div>12<span style="color:blue;">3</span>4</div>', expected: {styleCount:2 , fontCount: 1, colorCount: 2}, assertion:'detects style modifications caused by style attributes (e.g. style="color:blue;"'},
			{node: '<div>12<span style="color:blue;display:none;">3</span>4</div>', expected: {styleCount:1 , fontCount: 1, colorCount: 1} ,assertion:'ignores styles of hidden elements'},
			{node: '<div><style>.myclass {color: #f3f3f3; font-family: "sans-serif"}</style>12<span class="myclass">3</span>4</div>', expected: {styleCount:2 , fontCount: 2, colorCount: 2},  assertion:'detects style modifications by css classes (class="myclass")'},
		];

		for (var i = 0; i < charCountTests.length; i++){
			var test = charCountTests[i];
			var $charDiv = $(test.node).appendTo($testCanvas);
			var res = $charDiv.layoutstats();
			var result =  {
				fontCount: res.textUniqueFontCount,
				colorCount: res.textUniqueFontColorCount,
				styleCount: res.textUniqueFontStyleCount
			}
			var fontCountResult =  $charDiv.layoutstats().textUniqueFontCount;

			assert.deepEqual(result, test.expected, test.assertion );

		}

	});

	QUnit.test( "find the top font and font style/color/size", function( assert ) {
		var topPropertyTests = [
			{node: '<div style="font-family: Arial, sans-serif; font-size: 11px;">1234</div>', expected: {topFont:"Arial" , topStyle: "Arial 11px #000000", topSize:"11px", topColor:"#000000"},  assertion:'returns the top font size/style/color/variant used in an html document'},
			{node: '<div style="font-family: Arial, sans-serif; font-size: 11px;"><small style="font-family: serif;">1</small><b>234</b></div>', expected: {topFont:"Arial" , topStyle: "Arial 11px #000000 bold", topSize:"11px", topColor:"#000000"},  assertion:'uses inherited styles for its calculations'},
		];

		for (var i = 0; i < topPropertyTests.length; i++){
			var test = topPropertyTests[i];
			var $charDiv = $(test.node).appendTo($testCanvas);
			var res = $charDiv.layoutstats();
			var result =  {
				topFont: res.textTopFont,
				topStyle: res.textTopFontStyle,
				topSize: res.textTopFontSize,
				topColor: res. textTopFontColor
			}
			var fontCountResult =  $charDiv.layoutstats().textUniqueFontCount;

			assert.deepEqual(result, test.expected, test.assertion );

		}

	});





}( jQuery, QUnit ) );
