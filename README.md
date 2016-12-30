# jQuery Layoutstats

A jQuery plugin to gather layout and typography related statistics from the current web page.

## Measured Layout Metrics
### Sample Output
This is an abbreviated sample output of jQuery.layoutstats analyzing https://web.archive.org/web/20100630035713/http://www.guardian.co.uk/. Please check the detailed explanation of each metric below.
```javascript
{
    "textVisibleCharCount": 10157,
    "textUniqueFontStyleCount": 39,
    "textUniqueFontStyles": {
        "arial 12px #005689": 2372,
        "arial 12px #333333": 4844,
        "arial 12px #d61d00": 86,
        "arial 12px #333333 bold": 94,
       // ...
    },
    "textUniqueFontSizeCount": 8,
    "textUniqueFontSizes": {
        "12px": 8057,
        "15px": 371,
        "16px": 517,
        "24px": 48,
        "14px": 101,
        "18px": 967,
        "11px": 486
    },
    "textUniqueFontCount": 2,
    "textUniqueFonts": {
        "arial": 8644,
        "georgia": 1903
    },
    "textTopFont": "arial",
    "textTopFontStyle": "arial 12px #333333",
    "textTopFontColor": "#333333",
    "textTopFontSize": "12px",
    "textUniqueFontColorCount": 16,
    "textUniqueFontColors": {
        "#005689": 4054,
        "#333333": 5474,
        "#d61d00": 145,
        "#bebebe": 6,
        //... 
    },
    "textFirst1000Chars": "Mobile siteSign inRegisterText larger·smaller\n\t\t\n\t        About Us\n    Webfeed\n\t\t\n\t        Today's paper\n    \n\t\t\n\t        Zeitgeist\n    Consumer publisher of the year | 30 June 2010\n\t\t\t\t    \n\t                        | Last updated three minutes ago \n            \n\t\t\tWeather | Cape Town | 15°C7°CWimbledon26°C15°CNewsWorld CupCommentCultureBusinessMoneyLife & styleTravelEnvironmentTVVideoCommunityJobsNewsPoliticsUKWorldUSMediaEducationSocietyScienceTechnologyLawSportGuardianObserverBlogsBreaki....",
    "url": "https://web.archive.org/web/20100630035713/http://www.guardian.co.uk/",
    "ISOTimeStamp": "2016-12-30T20:58:49.237Z"
}
```

### Text-related metrics
At the moment, jQuery.layoutstats only collects text-related metrics, because they are easy to gather and still reveal important information about the layout and styling of a web page. When calculating these metrics, jQuery.layoutstats only considers the visible text nodes of a web page. Hidden text (which might be caused by the usage of menu systems or Infinite Scroll) is ignored.

- `textVisibleCharCount`: is the number of visible characters on the web page. The metric shows how much text content is available on a page. The number roughly corresponds to the copied text length from a web page (i.e. select all text on the page and then paste it to a text editor)
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
- `url`: url of the analyzed webpage
- `ISOTimeStamp`: when the page has been analyzed. 
