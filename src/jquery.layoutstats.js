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
				var styleParams = $textParent.css(['fontFamily','fontSize','fontWeight','color']);
				var nodeStyle = JSON.stringify(styleParams);
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
