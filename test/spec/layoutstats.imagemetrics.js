( function( window, QUnit ) {

	"use strict";

	var testCanvas = document.getElementById('testCanvas');

	QUnit.module("Layoutstats Image Metrics", {
		beforeEach: function () {

		},
		afterEach: function () {
			// we empty the testcanvas
			testCanvas.innerHTML = '';
		}
	});

	function injectAndGetLayoutStats(htmlStr){
		testCanvas.innerHTML = htmlStr;
		return layoutstats(testCanvas);
	}

	QUnit.test("measure the area of all images on the page using the imageMegapixelArea metric. It ", function (assert) {
		var ls = layoutstats(window.document.body);
		var png1px = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
		assert.notEqual(ls.imageArea, undefined, 'is available in the layoutstats object');
		ls = injectAndGetLayoutStats('<img width="150" height="300" src="'+png1px+'">');
		assert.equal(ls.imageArea,45000,'measures the dimension of a single image with width and height attributes' );
		ls = injectAndGetLayoutStats('<img style="width:150px;height:300px;" src="'+png1px+'">');
		assert.equal(ls.imageArea,45000,'measures the dimension of a single image with width and height set by css' );
		/*ls = injectAndGetLayoutStats('<img src="'+png1px+'"><img src="'+png1px+'">');
		assert.equal(ls.imageArea,2,'measures the dimension of multiple images without dimension information' );*/
	});

})( window, QUnit );
