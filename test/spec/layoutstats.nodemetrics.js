( function( window, QUnit ) {

	"use strict";

	var testCanvas = document.getElementById('testCanvas');

	QUnit.module("Layoutstats Node Metrics", {
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

	QUnit.test("measures the css class attributes used by child nodes. It ", function (assert) {
		var ls = injectAndGetLayoutStats('<div class="foo1 foo2 foo3"></div><span class="foo1 foo2 foo3"></span><div class="bar1 bar2 bar2"></div>');
		assert.deepEqual(ls.nodeUsedCSSClassAttributesList.sort(),["foo1 foo2 foo3", "bar1 bar2 bar2"].sort(),"creates an array of unique class list combinations");
	});

})( window, QUnit );
