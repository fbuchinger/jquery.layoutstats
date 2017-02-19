;( function( window, document, undefined ) {




	window.LayoutStats = function (node, options){
		var self = this;
		var node = node || document.body;

		this.metrics = this.constructor.metrics;


		this.measure = function (node, options){
			 var measurements = {};
			 self.metrics.forEach(function (metric) {
				 var key = metric.name;
				 var value;

				 if (metric.selector){
					 var selectedItems = selectors[metric.selector](node);
					 value = Array.prototype.map.call(selectedItems,metric.value);
				 }
				 else {
					 throw ("missing selector for metric: " + metric.name);
				 }

				 if (metric.reduce) {

					 var metricReducers = (Array.isArray(metric.reduce) ? metric.reduce : [metric.reduce]);

					 metricReducers.forEach(function (metricReducer) {
						 var reducer = (LayoutStats.getReducer(metricReducer) ? LayoutStats.getReducer(metricReducer) : metricReducer);
						 var reducedValue = value.reduce(reducer.fn, reducer.initialValue());
						 var reduceKey = metric.group + (reducer.metricPrefix || '') + key + (reducer.metricSuffix || '');
						 measurements[reduceKey] = reducedValue;
					 });
				 }
				 //no reduce func
				 else {
					 measurements[ metric.group + key] = value;
				 }

			})
			return measurements;
		}
	}

	LayoutStats.addMetric = function (metricObj){
		if (!this.metrics){
			this.metrics = [];
		}
		this.metrics.push(metricObj);
	}

	window.layoutstats = function(node, options){
		return (new LayoutStats()).measure(node, options);
	}


function incrementAcc (acc, item){
	if (item && item.key && item.value){
		acc[item.key] = (acc[item.key]||0) + item.value;
	}
	return acc;
}

function sortKeysByValue (obj){
	return Object.keys(obj).sort(function(keyA, keyB){
		return obj[keyB] - obj[keyA];
	});
}

var selectors = {
	'rootElement': function (element){
		return element;
	},
	'images': function (element){
		var images = element.querySelectorAll('img');
		//filter all images greater 50x50px;
		return Array.prototype.filter.call(images, function(img){
			return img.width > 50 && img.height > 50;
		})
	},
	'visibleTextNodes': function (element){

		function _isVisible(elem){
			return  !(elem.offsetWidth === 0 && elem.offsetHeight === 0);
		}


		var walker = document.createTreeWalker(
			element,
			NodeFilter.SHOW_TEXT,
			null,
			false
		);

		var node;
		var textNodes = [];

		while(node = walker.nextNode()) {
			var justContainsWhitespace = (node.nodeValue.trim().length === 0);
			var parentNodeVisible =  (node.parentNode &&   _isVisible(node.parentNode));
			if (!justContainsWhitespace & parentNodeVisible){
				textNodes.push(node);
			}
		}
		return textNodes;
	}
}

function emptyObject (){
	return {}
}

var reducers = {
	'sum': {
		fn: function (acc, item){
			return acc + item;
		},
		initialValue: function(){return 0}
	},
	'unique': {
		fn: function (acc, item){
			acc = incrementAcc(acc, item);
			return acc;
		},
		initialValue: emptyObject,
		metricPrefix: 'Unique',
		metricSuffix: 's'
	},
	'uniquecount': {
		fn: function (acc, item, itemIndex, array){
			acc = incrementAcc(acc, item);

			//return the total count if we arrived at the last element
			if (itemIndex === array.length -1){
				return Object.keys(acc).length;
			}
			return acc;
		},
		initialValue: emptyObject,
		metricPrefix: 'Unique',
		metricSuffix: 'Count'
	},
	'uniquekeylist': {
		fn: function (acc, item, itemIndex, array){
			acc = incrementAcc(acc, item);

			if (itemIndex === array.length -1){
				return sortKeysByValue(acc);
			}
			return acc;
		},
		initialValue: emptyObject,
		metricSuffix: 'List',
	},
	'top': {
		fn: function (acc, item, itemIndex, array){
			acc = incrementAcc(acc, item);
			//return the total count if we arrived at the last element
			if (itemIndex === array.length -1){
				return sortKeysByValue(acc)[0];
			}
			return acc;
		},
		initialValue: emptyObject,
		metricPrefix: "Top"
	},
	'average': {
		fn: function (acc, item, itemIndex, array){
			acc = incrementAcc(acc, item);
			//return the total count if we arrived at the last element
			if (itemIndex === array.length -1){
				var avg = Object.keys(acc).reduce(function(avg,key){
					avg.sum += (parseFloat(key,10) * acc[key]);
					avg.amount += acc[key]
					return avg
				},{sum: 0,amount:0});
				return avg.sum/avg.amount;
			}
			return acc;
		},
		initialValue: emptyObject,
		metricPrefix: "Average"
	}
}

LayoutStats.reducers = reducers;

LayoutStats.getReducer = function (reducerName){
	if (this.reducers[reducerName]){
		var reducer = this.reducers[reducerName];
		return reducer;
	}
}

var rgbToHex = function (rgbStr){

	var rgbParts = rgbStr.split('(')[1].split(',').map(function(rgbPart){
		return parseInt(rgbPart,10);
	});


	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	return "#" + componentToHex(rgbParts[0]) + componentToHex(rgbParts[1]) + componentToHex(rgbParts[2]);

}

// from: http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
function isElementVisible(el) {
	var rect     = el.getBoundingClientRect(),
		vWidth   = window.innerWidth || document.documentElement.clientWidth,
		vHeight  = window.innerHeight || document.documentElement.clientHeight,
		efp      = function (x, y) { return document.elementFromPoint(x, y) };

	// Return false if it's not in the viewport
	if (rect.right < 0 || rect.bottom < 0
		|| rect.left > vWidth || rect.top > vHeight)
		return false;

	// Return true if the center of the bounding box is visible
	return (el.contains(efp(rect.right - (rect.width / 2), rect.bottom - (rect.height / 2))))
}

function isFullyShownInParent(nodeRect, parentNode){
	var parentRect = parentNode.getBoundingClientRect();
	return (
		parentRect.right >= nodeRect.right &&
		parentRect.left <= nodeRect.left &&
		parentRect.top <= nodeRect.top &&
		parentRect.bottom >= nodeRect.bottom
	)
}

function getTextNodeBBox(textNode) {
	var dims = {};
	var range = document.createRange();
	range.selectNode(textNode);
	var rect = range.getBoundingClientRect();
	if (rect.left && rect.right && rect.top && rect.bottom && rect.width && rect.height){
		var centerX = rect.left + rect.width/2
		var centerY = rect.top + rect.height/2;
		//check that parent Node of text node is visible and that the text node is fully shown in the parent
		if (isElementVisible(textNode.parentNode) && isFullyShownInParent(rect, textNode.parentNode)) {
			dims.bottom = rect.bottom;
			dims.left = rect.left;
			dims.right = rect.right;
			dims.top = rect.top;
			dims.width = rect.width;
			dims.height = rect.height;

		}
		else {
			//console.log(textNode, "is out of canvas", rect);
		}
	}
	return dims;
	range.detach();
}

LayoutStats.addMetric({
	group: "text",
	name: "VisibleCharCount",
	selector: 'visibleTextNodes',
	value: function (node){
		return node.textContent.length
	},
	reduce: 'sum'
});

LayoutStats.addMetric({
	group: "text",
	name: "Font",
	selector: 'visibleTextNodes',
	value: function (node){
		var fontFamilies = getComputedStyle(node.parentNode).fontFamily;
		var firstFont = fontFamilies.split(",")[0];
		var textBBOX = getTextNodeBBox(node);
		return {key: firstFont.toLowerCase(), value: textBBOX.width*textBBOX.height};
	},
	reduce: ['unique','uniquecount','uniquekeylist', 'top']
});

LayoutStats.addMetric({
	group: "text",
	name: "RelativeLineHeight",
	selector: 'visibleTextNodes',
	value: function (node){
		var textStyle = getComputedStyle(node.parentNode);
		var lineHeight = parseInt(textStyle.lineHeight,10);
		var fontSize= parseInt(textStyle.fontSize,10);
		var textBBOX = getTextNodeBBox(node);
		var bboxArea =  textBBOX.width*textBBOX.height;
		if (!(isNaN(lineHeight) || isNaN(fontSize))){

			var relativeLineHeight = (lineHeight / fontSize).toFixed(2) + 'px';
			return {key: relativeLineHeight, value:bboxArea};
		}
		else {
			// use browser default if we cannot determine line height
			// see https://developer.mozilla.org/de/docs/Web/CSS/line-height#Values
			return {key: 1.2, value: bboxArea}
		}
	},
	reduce: ['average']
});

LayoutStats.addMetric({
	group: "text",
	name: "FontStyle",
	selector: 'visibleTextNodes',
	value: function (node){
		var css = getComputedStyle(node.parentNode); //$textParent.css(['fontFamily','fontSize','fontWeight','fontVariant','fontStyle','color']);
		var styleParams = JSON.parse(JSON.stringify(css));
		styleParams.fontSize = Math.round(parseInt(styleParams.fontSize, 10)) + 'px';
		styleParams.color = rgbToHex(styleParams.color);


		var miscProperties = '';
		miscProperties += (styleParams.fontWeight === "bold" || parseInt(styleParams.fontWeight, 10) > 699 ? "bold": ""); //bold font?
		miscProperties += (styleParams.fontStyle !== "normal" ? " " +styleParams.fontStyle: ""); //italics font?
		miscProperties += (styleParams.fontVariant !== "normal" ? " " + styleParams.fontVariant: ""); //small caps?

		var nodeStyle = [
			styleParams.fontFamily.split(",")[0].toLowerCase(),
			styleParams.fontSize,
			styleParams.color,
		];

		if (miscProperties.length > 0){
			nodeStyle.push(miscProperties);
		}

		var textBBOX = getTextNodeBBox(node);
		var bboxArea =  textBBOX.width*textBBOX.height;
		return {key: nodeStyle.join(' '), value: bboxArea};
	},
	reduce: ['unique','uniquecount','top']
});

LayoutStats.addMetric({
	group: "text",
	name: "FontSize",
	selector: 'visibleTextNodes',
	value: function (node){
		var fontSize = getComputedStyle(node.parentNode).fontSize;
		 fontSize = Math.round(parseInt(fontSize, 10)) + 'px';
		var textBBOX = getTextNodeBBox(node);
		var bboxArea =  textBBOX.width*textBBOX.height;
		return {key: fontSize, value: bboxArea};
	},
	reduce: ['unique','uniquecount','top','average']
});


LayoutStats.addMetric({
	group: "text",
	name: "FontColor",
	selector: 'visibleTextNodes',
	value: function (node){
		var color = getComputedStyle(node.parentNode).color;
		var hexColor =  rgbToHex(color);
		var textBBOX = getTextNodeBBox(node);
		var bboxArea =  textBBOX.width*textBBOX.height;
		return {key: hexColor, value: bboxArea}
	},
	reduce: ['unique','uniquecount','top']
});

LayoutStats.addMetric({
	group: "text",
	name: "First1000Chars",
	selector: 'visibleTextNodes',
	value: function (node){
		return node.textContent;
	},
	reduce: {
		fn: function (acc, item){
			return (acc + item).slice(0,1000);
		},
		initialValue: function (){
			return '';
		}
	}
});

//TODO: experimental selectors - need additional performance testing
var maximum = function ( max, cur ){ return  Math.max( max, cur )};
var minimum = function ( min, cur ) { return Math.min( min, cur )};
var mapProperty = function (obj, property){
	return function (obj){
		return obj[property];
	}
}

LayoutStats.addMetric({
	group: "text",
	name: "BBoxWidth",
	selector: 'visibleTextNodes',
	value: function (node){
		var textBBOX = getTextNodeBBox(node);
		if (textBBOX.right > 0 && textBBOX.right < window.innerWidth && textBBOX.left > 0){
			return {right: textBBOX.right, left: textBBOX.left}

		}
	},
	reduce: {
		fn: function (acc, item, itemIndex, array){
			if (itemIndex === array.length -1){
				array = array.filter(function(bbox){
					return bbox !== undefined;
				});
				var maxHOffset = array.map(mapProperty(item,'right')).reduce( maximum, -Infinity );
				var minHOffset = array.map(mapProperty(item,'left') ).reduce( minimum, Infinity );
				return Math.round(maxHOffset) - Math.round(minHOffset);
			}
		},
		initialValue: function (){
			return 0;
		}
	}
});

LayoutStats.addMetric({
	group: "root",
	name: "BBoxHeight",
	selector: 'rootElement',
	value: function (node){
		return node.scrollHeight;
	}
});



LayoutStats.addMetric({
	group:"image",
	selector: "images",
	name: "Area",
	value: function (img){
		return img.width * img.height;
	},
	reduce: 'sum'
});

LayoutStats.addMetric({
	group:"image",
	selector: "images",
	name: "Dimensions",
	value: function (img){
		return {key: img.width + ' x ' + img.height, value: 1};
	},
	reduce: ['unique','uniquecount','uniquekeylist','top']
});

LayoutStats.addMetric({
	group:"image",
	selector: "images",
	name: "Count",
	value: function (img){
		return 1;
	},
	reduce: ['sum']
});



} )( window, document );
