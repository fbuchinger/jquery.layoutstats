( function( $, QUnit ) {

	"use strict";

	var testCanvas = document.getElementById('testCanvas');

	QUnit.module( "jQuery Layoutstats Text Metrics", {
		beforeEach: function() {

		},
		afterEach: function() {

			// we empty the testcanvas
			testCanvas.innerHTML = '';
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
			testCanvas.innerHTML = test.node;
			var charDiv = testCanvas.firstElementChild;
			var result =  layoutstats(charDiv).textVisibleCharCount;

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
			testCanvas.innerHTML = test.node;
			var charDiv = testCanvas.firstElementChild;
			var res = layoutstats(charDiv);
			var result =  {
				fontCount: res.textUniqueFontCount,
				colorCount: res.textUniqueFontColorCount,
				styleCount: res.textUniqueFontStyleCount
			}
			var fontCountResult =  layoutstats(charDiv).textUniqueFontCount;

			assert.deepEqual(result, test.expected, test.assertion );

		}

	});

	QUnit.test( "finds the top font and font style/color/size, the list of fonts and the average font size", function( assert ) {
		var topPropertyTests = [
			{
				node: '<div style="font-family: Arial, sans-serif; font-size: 11px;">1234</div>',
				expected: {topFont: "arial", topStyle: "arial 11px #000000", fontList: ["arial"], topSize: "11px", avgFontSize: 11, topColor: "#000000", avgRelativeLineHeight: 1.2},
				assertion: 'returns the top font size/style/color/variant as well as the list of fonts and the average font size/line height used in an html document'
			},
			{
				node: '<div style="font-family: Arial, sans-serif; font-size: 11px;"><small style="font-family: serif; font-size: 7px;line-height:21px;">1</small><b>234</b></div>',
				expected: {topFont: "arial", topStyle: "arial 11px #000000 bold", fontList: ["arial","serif"],topSize: "11px", avgFontSize: 10, avgRelativeLineHeight: 1.65, topColor: "#000000"},
				assertion: 'uses inherited styles for its calculations'
			},
		];

		for (var i = 0; i < topPropertyTests.length; i++) {
			var test = topPropertyTests[i];
			testCanvas.innerHTML = test.node;
			var charDiv = testCanvas.firstElementChild;
			var res = layoutstats(charDiv);
			var result = {
				topFont: res.textTopFont,
				fontList: res.textFontList,
				avgFontSize: res.textAverageFontSize,
				avgRelativeLineHeight: res.textAverageRelativeLineHeight,
				topStyle: res.textTopFontStyle,
				topSize: res.textTopFontSize,
				topColor: res.textTopFontColor
			}
			var fontCountResult = layoutstats(charDiv).textUniqueFontCount;

			assert.deepEqual(result, test.expected, test.assertion);

		}
		;
	});


		QUnit.test( "returns the first 1000 characters of the extracted text", function( assert ) {

			var txt2000Chars = (new Array (2000)).join('a') + 'a';
			var txt1000Chars = (new Array (1000)).join('a') + 'a';

			var first1000CharTests = [
				{node: '<div style="font-family: Arial, sans-serif; font-size: 11px;">1234</div>', expected: {textFirst1000Chars:'1234'},  assertion:'returns the full text if there are less than 1000 chars'},
				{node: '<div style="font-family: Arial, sans-serif; font-size: 11px;">'+ txt2000Chars + '</div>', expected: {textFirst1000Chars: txt1000Chars},  assertion:'returns the first 1000 chars if there are more characters on the page'},
			];

			for (var i = 0; i < first1000CharTests.length; i++){
				var test = first1000CharTests[i];
				testCanvas.innerHTML = test.node;
				var charDiv = testCanvas.firstElementChild;
				var res = layoutstats(charDiv);
				var result =  {
					textFirst1000Chars: res.textFirst1000Chars
				}

				assert.deepEqual(result, test.expected, test.assertion );

			}

	});





}( window, QUnit ) );
