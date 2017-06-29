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
plugins: [
  new HtmlWebpackPlugin(),
  new StaticVersionInjectionPlugin()
]  
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
```