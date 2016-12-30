# ~~jQuery~~ Layoutstats

A ~~jQuery~~ plugin to gather layout and typography related statistics from the current web page. ~~jQuery~~ Layoutstats can be used to efficiently track layout/styling changes in web pages over time (much faster than taking and comparing screenshots). Designed to be run with [PhantomJS](http://phantomjs.org/), [Scrapy/Splash](https://github.com/scrapy-plugins/scrapy-splash) or any other [headless browser](https://en.wikipedia.org/wiki/Headless_browser) - see Installation/Usage for details.

~~jQuery~~ is striked-through for a reason: we don't recommend using this plugin with jQuery any more, but rather with the jQuery clone [zepto.JS](http://zeptojs.com/). Many of our analyzed web pages already include their own (often older) version of jQuery. Thus, we ran into a lot of `jQuery.fn.layoutstats is undefined` errors when we injected jQuery.layoutstats together with a brand-new jQuery version to these pages.  The [zepto.JS enabled version of our plugin](https://github.com/fbuchinger/jquery.layoutstats/blob/zepto-js/src/jquery.layoutstats.js) doesn't show this behaviour. Nevertheless we want to get rid of 3rd party dependencies and make jQuery layoutstats a pure JS/DOM based library.

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

## Installation/Usage

### Scrapy/Splash

1. Follow the [scrapy/splash setup tutorial](https://github.com/scrapy-plugins/scrapy-splash) on their project page - you should have a complete scrapy/splash-compatible spider by the end of the tutorial.
2. Include the following lua script into your scrapy/splash spider class and hand it over to splash via the  `splash_args/lua_source` parameter
```
lua_script = """
    function main(splash)
	    -- load required includes
        splash:autoload("https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js")
        splash:autoload("https://raw.githubusercontent.com/fbuchinger/jquery.layoutstats/zepto-js/src/jquery.layoutstats.js")
        splash:wait(0.5)
        splash:go(splash.args.url)
        splash:wait(0.5)
		
        -- utility function to check whether Zepto/layoutstats are available on the page
        ready_for_measurement = splash:jsfunc("function() { return window.Zepto !== undefined && Zepto.fn.layoutstats !== undefined }")

        -- test whether the measurement can start
        function wait_for(condition)
            local max_retries = 10
            while not condition() do
                splash:wait(0.1)
                max_retries = max_retries - 1
                if max_retries == 0 then break end
            end
        end
        
		-- measure function - either returns measurement or error to splash
        local measure_layout = splash:jsfunc([[
            function measureLayout() {
                try {
                    var measurements = Zepto('body').layoutstats();

                    if (measurements.textVisibleCharCount && measurements.textVisibleCharCount > 0) {
                        return measurements;
                    }
                    else {
                        window.setTimeout(measureLayout, 500);
                    }
                }
                catch (err){
                    return {snapshotURL: location.href, error: err.message }
                }
            }
        ]])

        wait_for(ready_for_measurement)
        return measure_layout()
    end
"""
```
