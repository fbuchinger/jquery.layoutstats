;( function( window, document, undefined ) {

	function _isVisible(elem){
		return  !(elem.offsetWidth === 0 && elem.offsetHeight === 0);
	}

	//check if prototype.js has overwritten the map function
	// and replace it with a polyfill
	var polyfill = {
		map:  function(fn) {
			var rv = [];

			for(var i=0, l=this.length; i<l; i++)
				rv.push(fn(this[i]));

			return rv;
		},
		filter: function(fn) {
			var rv = [];

			for(var i=0, l=this.length; i<l; i++)
				if (fn(this[i])) rv.push(this[i]);

			return rv;
		},
		// Reduce polyfill provided by polyfill.io,
		// licensed under a MIT License - https://github.com/Financial-Times/polyfill-service/blob/master/LICENSE.md
		reduce:  function (callback) {
			if (this === undefined || this === null) {
				throw new TypeError(this + ' is not an object');
			}

			if (!(callback instanceof Function)) {
				throw new TypeError(callback + ' is not a function');
			}

			var
				object = Object(this),
				arraylike = object instanceof String ? object.split('') : object,
				length = Math.max(Math.min(arraylike.length, 9007199254740991), 0) || 0,
				index = -1,
				previousValue;

			if (1 in arguments) {
				previousValue = arguments[1];
			} else {
				while (++index < length && !(index in arraylike)) {}

				if (index >= length) {
					throw new TypeError('Reduce of empty array with no initial value');
				}

				previousValue = arraylike[index];
			}

			while (++index < length) {
				if (index in arraylike) {
					previousValue = callback(previousValue, arraylike[index], index, object);
				}
			}

			return previousValue;
		}
	};


	function isProtoOverwritten (protoFunc){
		return protoFunc.toString().indexOf('native code') < 0
	}


	var map = isProtoOverwritten(Array.prototype.map) ? polyfill.map: Array.prototype.map;
	var filter = isProtoOverwritten(Array.prototype.filter) ? polyfill.filter: Array.prototype.filter;
	var reduce = isProtoOverwritten(Array.prototype.reduce) ? polyfill.reduce: Array.prototype.reduce;


	window.LayoutStats = function (){
		var self = this;

		this.metrics = this.constructor.metrics;

		this._getVisibleTextNodes = function (element){
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
				var parentNodeVisible =  (node.parentNode && _isVisible(node.parentNode));
				if (!justContainsWhitespace & parentNodeVisible){
					textNodes.push(node);
				}
			}
			return textNodes;
		}



		this.measure = function (node, options){
			 var measurements = {};
			 self.metrics.forEach(function (metric) {
				 var key = metric.name;
				 var value;

				 if (metric.selector){
					 var selectedItems = selectors[metric.selector](node);
					 value = map.call(selectedItems,metric.value);
				 }
				 else {
					 value = nodes.map(metric.value);
				 }


				 if (metric.reduce) {

					 var metricReducers = (Array.isArray(metric.reduce) ? metric.reduce : [metric.reduce]);

					 metricReducers.forEach(function (metricReducer) {
						 var reducer = (LayoutStats.getReducer(metricReducer) ? LayoutStats.getReducer(metricReducer) : metricReducer);
						 var reducedValue = reduce.call(value, reducer.fn, reducer.initialValue());
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
	'images': function (node){
		//filter all images greater 50x50px;
		return filter.call(node.querySelectorAll('img'),function(img){
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
	},
	'nodesWithClassAttribute': function (node){
		return node.querySelectorAll('*[class]');
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
				var avg = reduce.call(Object.keys(acc),function(avg,key){
					avg.sum += (parseFloat(key,10) * acc[key]);
					avg.amount += acc[key];
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
		return {key: firstFont.toLowerCase(), value: node.textContent.length};
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
		if (!(isNaN(lineHeight) || isNaN(fontSize))){
			var relativeLineHeight = (lineHeight / fontSize).toFixed(2) + 'px';
			return {key: relativeLineHeight, value: node.textContent.length};
		}
		else {
			// use browser default if we cannot determine line height
			// see https://developer.mozilla.org/de/docs/Web/CSS/line-height#Values
			return {key: 1.2, value: node.textContent.length}
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

		return {key: nodeStyle.join(' '), value: node.textContent.length};
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
		return {key: fontSize, value: node.textContent.length};
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
		return {key: hexColor, value: node.textContent.length}
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

LayoutStats.addMetric({
	group:"node",
	selector: "nodesWithClassAttribute",
	name: "UsedCSSClassAttributes",
	value: function (node){
		// borrowed from https://www.npmjs.com/package/string-hash (Public Domain)
		function hash(str) {
			var hash = 5381,
				i    = str.length;

			while(i) {
				hash = (hash * 33) ^ str.charCodeAt(--i);
			}
			return hash >>> 0;
		}

		var cssClassList = Array.prototype.join.call(node.classList," ");
		// return css classlist as a hash to decrease the size of the JSON payload
		if (cssClassList.length > 0) {
			return {key: hash(cssClassList).toString(36), value: 1};
		}
	},
	reduce: ['uniquekeylist']
});



} )( window, document );
