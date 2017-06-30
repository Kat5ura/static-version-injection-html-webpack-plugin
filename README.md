Add file version after the assets` src for the HTML Webpack Plugin
========================================

[![npm version](https://badge.fury.io/js/static-version-injection-html-webpack-plugin.svg)](https://badge.fury.io/js/static-version-injection-html-webpack-plugin)

This plugin allows you to add a version string for each static asset in the output from html-webpack-plugin.

Installation
------------
You must be running webpack on node 4.x or higher

Install the plugin with npm:
```shell
$ npm install --save-dev static-version-injection-html-webpack-plugin
```


Basic Usage
-----------
Require the plugin in your webpack config:

```javascript
var StaticVersionInjectionPlugin = require('static-version-injection-html-webpack-plugin');
```

Add the plugin to your webpack config as follows:

```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new StaticVersionInjectionPlugin({md5: true })
]  
```

Options
-------
The available options are:

- `md5`: `boolean`

  Specifying whether to use md5 version for all static assets or not.


Example
-------
Using `HtmlWebpackIncludeAssetsPlugin` and `CopyWebpackPlugin` to include assets to `html-webpack-plugin` template :

```javascript
{
// ...
output: {
        filename: utils.assetsPath('js/[name].[chunkhash].js'),
        // or
        // filename: utils.assetsPath('js/[name].js')

    }
// ...
plugins: [
    // extract css into its own file
    new ExtractTextPlugin({
        filename: utils.assetsPath('css/[name].[contenthash].css')
        // or
        // filename: utils.assetsPath('css/[name].[contenthash].css')

    }),
    new HtmlWebpackPlugin(),
    new StaticVersionInjectionPlugin()
]  
}
```

User md5 mode :

```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new StaticVersionInjectionPlugin({
    md5: true
  })
]
```
Then you will get html like this

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset=utf-8>
    <title>test1</title>
    <link href="/static/css/app.css?v=ce027eb1c4fdfea5bce4f5e466a381dd" rel=stylesheet>
</head>

<body>
    <div id=app></div>
    <script type=text/javascript src="/static/js/manifest.js?v=8072eace45064bc08e5f"></script>
    <script type=text/javascript src="/static/js/vendor.js?v=5953645b5f4b4a670ad7"></script>
    <script type=text/javascript src="/static/js/app.js?v=6b6c95749ad1049c0c72"></script>
</body>
</html>
```