;( function( $, window, document, undefined ) {
	$.fn.layoutstats = function (options){
		var $selectedNodes = this;
		var _getVisibleTextNodes = function (element){
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
				var parentNodeVisible =  (node.parentNode && $(node.parentNode).is(':visible'));
				if (!justContainsWhitespace & parentNodeVisible){
					textNodes.push(node);
				}
			}
			return $(textNodes);
		};

		var _updateCount = function (obj, key, count){
			if (!obj[key]){
				obj[key] = count;
			}
			else {
				obj[key] += count;
			}
		}

		var _count = function (obj){
			return Object.keys(obj).length;
		}

		var getUniqueFontStyles = function(element){
			var unique = {
				fontStyles: {},
				fontColors: {},
				fontSizes: {},
				fonts: {}
			},
			$visibleTextNodes = _getVisibleTextNodes(element);

			var fontStyles = $visibleTextNodes.each(function(){
				var $textParent = $(this).parent();
				var styleParams = $textParent.css(['fontFamily','fontSize','fontWeight','fontVariant','fontStyle','color']);
				styleParams.color = rgbToHex(styleParams.color);
				styleParams.fontSize = Math.round(parseInt(styleParams.fontSize, 10)) + 'px';
				var miscProperties = '';
				miscProperties += (styleParams.fontWeight === "bold" || parseInt(styleParams.fontWeight, 10) > 699 ? "bold": ""); //bold font?
				miscProperties += (styleParams.fontStyle !== "normal" ? " " +styleParams.fontStyle: ""); //italics font?
				miscProperties += (styleParams.fontVariant !== "normal" ? " " + styleParams.fontVariant: ""); //small caps?

				var nodeStyle = [
					styleParams.fontFamily.split(",")[0],
					styleParams.fontSize,
					styleParams.color,
				];

				if (miscProperties.length > 0){
					nodeStyle.push(miscProperties);
				}
				nodeStyle = nodeStyle.join(" ");

				var numChars = getVisibleCharCount($textParent[0]);
				if (numChars > 0){
					_updateCount(unique.fontStyles, nodeStyle, numChars);
					_updateCount(unique.fonts, styleParams.fontFamily.split(",")[0], numChars);
					_updateCount(unique.fontColors, styleParams.color, numChars);
					_updateCount(unique.fontSizes, styleParams.fontSize, numChars);
				}

			});
			return unique;
		}

		var getVisibleCharCount = function(element){
			return _getVisibleTextNodes(element).text().length;
		};

		var getMaxProperty = function (obj){
			var arrayObj =  Object.keys(obj).map(function(key){
				return {key: key, val: obj[key]}
			});

			arrayObj.sort(function(a, b){
				return a.val - b.val;
			}).reverse();

			var maxProp = arrayObj[0];

			if (maxProp && maxProp.key){
				return maxProp.key;
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

		if ($selectedNodes.length == 1){
			var unique = getUniqueFontStyles($selectedNodes[0]);
			return {
				textVisibleCharCount: getVisibleCharCount($selectedNodes[0]),
				textUniqueFontStyleCount: _count(unique.fontStyles),
				textUniqueFontStyles: unique.fontStyles,
				textUniqueFontSizeCount: _count(unique.fontStyles),
				textUniqueFontSizes: unique.fontSizes,
				textUniqueFontCount: _count(unique.fonts),
				textUniqueFonts: unique.fonts,
				textTopFont: getMaxProperty((unique.fonts)),
				textTopFontStyle:getMaxProperty(unique.fontStyles),
				textTopFontColor:getMaxProperty(unique.fontColors),
				textTopFontSize: getMaxProperty(unique.fontSizes),
				textUniqueFontColorCount: _count(unique.fontColors),
				textUniqueFontColors: unique.fontColors,
				version: '0.0.1'
			};
		}

		return jQuery.each($selectedNodes, function(){
			var curElement = this;
			return getVisibleCharCount(curElement);
		});
	}


} )( jQuery, window, document );
