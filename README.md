# jQuery Layoutstats

A jQuery plugin to gather layout and typography related statistics from the current web page.

## Measured Layout Metrics
### Sample Output
### Text-related metrics
- `textVisibleCharCount`: is the number of visible characters on the web page. The metric shows how much text content is available on a page. To determine this metric, all text nodes of the webpage are visited and their visibility is checked. Then their character count is added up. Nodes that only contain whitespace or are invisible (e.g. because their parent element is hidden via CSS or Javascript) are ignored. The number roughly corresponds to the copied text length from a web page (i.e. select all text on the page and then paste it to a text editor)
- `textTopFont`: the name of the most frequently used font on the page (the one that most text characters are rendered with)
- `textUniqueFonts`: an object containing all different fonts used on the page. The keys of the object are the font names, the values are the number of characters that are rendered in that font.
- `textUniqueFontCount`: the number of different fonts used on the page
- `textUniqueFontStyles`: contains all unique font styles used on a page. A unique font style is defined as a combination of the CSS properties font-family, font-size, color, font-weight, font-variant that hasn't been used on the page yet. `textUniqueFontStyles` is a JSON object that contains the font style as a key and the number of characters rendered in the style as values.
- `textUniqueFontStyleCount`: the number of different font styles used on the page.
- `textUniqueFontSizes`: an object containing all font sizes used on the page an the number of characters that have been rendered in them
- `textUniqueFontSizeCount`: the number of different font sizes used on the page.
- `textTopFontStyle`: the font style in which most characters of the page are rendered in.
- `textTopFontColor`: the font color in which most characters of the page are rendered in.
- `textTopFontSize`: the font size in which most characters of the page are rendered in.
- `textUniqueFontColorCount`: the number of different font colors used on the page.
- `textUniqueFontColors`: an object containing all font colors used on the page.
- `textFirst1000Chars`: the first 1000 characters of the web page (can be used to check whether the correct page has been analyzed or some redirect to an error page/nag screen has happened)
