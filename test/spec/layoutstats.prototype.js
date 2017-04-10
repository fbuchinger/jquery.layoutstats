( function( $, QUnit ) {

	"use strict";

	var testCanvas = document.getElementById("testCanvas");

	QUnit.module("layoutstats.js is compatible with prototype.js", {
		beforeEach: function () {
			var iframeHTML = [
				'<html>',
				'<head>',
				'<script src="../src/layoutstats.js"></script>',
				'<script src="https://cdnjs.cloudflare.com/ajax/libs/prototype/1.7.0.0/prototype.min.js"></script>',
				'</head>',
				'<body>',
				  '<div id="iframe-test"><b>ab</b><i>cd</i></div>',
				'</body>',
				'</html>'

			];
			var iframe = document.createElement('iframe');
			iframe.setAttribute('id','testframe');
			testCanvas.appendChild(iframe);
			iframe.contentWindow.document.open();
			iframe.contentWindow.document.write(iframeHTML.join('\n'));
			iframe.contentWindow.document.close();
		},
		afterEach: function() {
			testCanvas.innerHTML = '';
		}
	} )

	QUnit.test( "it survives the overwriting of Array.prototype methods", function( assert ) {
		var done = assert.async();
		var iframe = document.getElementById('testframe');
		iframe.onload = function (){
			var div=iframe.contentWindow.document.getElementById('iframe-test');
			var innerLayoutstats = iframe.contentWindow.layoutstats;
			assert.ok(innerLayoutstats(div).textVisibleCharCount > 0);
			done();
		}
	} );


} )( window, QUnit );
