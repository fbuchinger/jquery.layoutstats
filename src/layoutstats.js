;( function( window, document, undefined ) {

	function _isVisible(elem){
		return  !(elem.offsetWidth === 0 && elem.offsetHeight === 0);
	}


	function LayoutStats (){
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
			var nodes = self._getVisibleTextNodes(node);
			 var measurements = {};
			 self.metrics.forEach(function (metric) {
				 var key = metric.name;
				 var value = nodes.map(metric.value);
				 if (metric.reduce) {

					 var metricReducers = (Array.isArray(metric.reduce) ? metric.reduce : [metric.reduce]);

					 metricReducers.forEach(function (metricReducer) {
						 var reducer = (reducers[metricReducer] ? reducers[metricReducer] : metricReducer);
						 //initialValue is an object property -> passed by reference, we need to clone it for a "clean" copy
						 var clonedInitial = JSON.parse(JSON.stringify(reducer.initialValue));
						 var reducedValue = value.reduce(reducer.fn, clonedInitial);
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

var reducers = {
	'sum': {
		fn: function (acc, item){
			return acc + item;
		},
		initialValue: 0
	},
	'unique': {
		fn: function (acc, item){
			acc = incrementAcc(acc, item);
			return acc;
		},
		initialValue: {},
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
		initialValue: {},
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
		initialValue: {},
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
		initialValue: {},
		metricPrefix: "Top"
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
	value: function (node){
		return node.textContent.length
	},
	reduce: 'sum'
});

LayoutStats.addMetric({
	group: "text",
	name: "Font",
	value: function (node){
		var fontFamilies = getComputedStyle(node.parentNode).fontFamily;
		var firstFont = fontFamilies.split(",")[0];
		return {key: firstFont.toLowerCase(), value: node.textContent.length};
	},
	reduce: ['unique','uniquecount','uniquekeylist', 'top']
});

LayoutStats.addMetric({
	group: "text",
	name: "FontStyle",
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
	value: function (node){
		var fontSize = getComputedStyle(node.parentNode).fontSize;
		 fontSize = Math.round(parseInt(fontSize, 10)) + 'px';
		return {key: fontSize, value: node.textContent.length};
	},
	reduce: ['unique','uniquecount','top']
});

LayoutStats.addMetric({
	group: "text",
	name: "FontColor",
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
	value: function (node){
		return node.textContent;
	},
	reduce: {
		fn: function (acc, item){
			return (acc + item).slice(0,1000);
		},
		initialValue: ''
	}
});



} )( window, document );
