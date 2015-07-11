# StarterKit

YU ZIJIE's Starter Kit For Creating Websites.

## Inspired By

* [HTML5 Boilerplate][1]
* [normalize.css][2]
* [Bourbon][3]
* [DevTips][7]
* and some of my own collections

## Requirement

* [NodeJS][4]
* [Ruby][5]
  * [SASS][6]

## How to use

Add following lines to your main.scss file

```
@import "<root>/node_modules/yu-starter-kit/css/tools/main" // some dependencies, must be on top
@import "variables" // your custom variables
@import "<root>/node_modules/yu-starter-kit/css/basics/main" // basic styles and helper mixins
@import "<root>/node_modules/yu-starter-kit/css/helpers/main" // helper mixins
@import "<root>/node_modules/yu-starter-kit/css/partials/main" // classes

// rest of your sass
```

## Last Update

2015-July-10th

[1]: https://html5boilerplate.com
[2]: http://necolas.github.io/normalize.css
[3]: http://bourbon.io
[4]: https://nodejs.org
[5]: https://www.ruby-lang.org
[6]: http://sass-lang.com
[7]: http://devtipsstarterkit.com
