// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
/*;( function( $, window, document, undefined ) {

	"use strict";

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "layoutstats",
			defaults = {
				visibleChars: true,
				uniqueFontStyles: true
			};

		// The actual plugin constructor
		function LayoutStats ( element, options ) {
			this.element = element;

			// jQuery has an extend method which merges the contents of two or
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this.settings = $.extend( {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;
			this.init();
		}

		// Avoid Plugin.prototype conflicts
		$.extend( LayoutStats.prototype, {
			init: function() {

				// Place initialization logic here
				// You already have access to the DOM element and
				// the options via the instance, e.g. this.element
				// and this.settings
				// you can add more functions like the one below and
				// call them like the example bellow
				var output = {};
				var self = this;
				if (this.settings.visibleChars){
					$.extend(output, {visibleCharCount: self.getVisibleCharCount()});
				}
				if (this.settings.uniqueFontStyles){
					$.extend(output, {uniqueFontStyles: self.getUniqueFontStyles()} );
				}
				return output;
			},
			_getVisibleTextNodes: function( ) {
				// taken from http://stackoverflow.com/questions/1846177/how-do-i-get-just-the-visible-text-with-jquery-or-javascript
				return $(this.element).find('*:not(:has(*)):visible');
			},
			_getVisibleTextNodes: function (){
				var walker = document.createTreeWalker(
					this.element,
					NodeFilter.SHOW_TEXT,
					null,
					false
				);

				var node;
				var textNodes = [];

				while(node = walker.nextNode()) {
					textNodes.push(node);
				}
				return $(textNodes);
			},
			getVisibleCharCount: function(){
				return this._getVisibleTextNodes().text().length;
			},
			getUniqueFontStyles: function(){
				var uniqueFontStyles = {},
					$visibleTextNodes = this._getVisibleTextNodes();

				var fontStyles = $visibleTextNodes.each(function(){
					var nodeStyle = $(this).css(['fontFamily','fontSize','fontWeight','color']);
					nodeStyle = JSON.stringify(nodeStyle);
					var numChars = $(this).text().length;
					if (numChars > 0){
						if (!uniqueFontStyles[nodeStyle]) {
							uniqueFontStyles[nodeStyle] = numChars;
						} else {
							uniqueFontStyles[nodeStyle] += numChars;
						}
					}

				});
				return fontStyles;
			}
		} );

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function( options ) {
			return this.each( function() {
				if ( !$.data( this, "plugin_" + pluginName ) ) {
					$.data( this, "plugin_" +
						pluginName, new LayoutStats( this, options ) );
				}
			} );
		};

} )( jQuery, window, document );*/

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
