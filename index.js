'use strict';
var fs = require('fs');
var md5 = require('md5');

function StaticVersionInjectionWebpackPlugin(options) {
    // Configure your plugin with options...
    var options = options || {};
    this.md5 = options.md5 || false;
}

StaticVersionInjectionWebpackPlugin.prototype.apply = function (compiler) {
    var _this = this;
    // save hash of each file into a map
    var outputPath = compiler.options.output.path;

    var hashMap = {};
    var pathMap = {};

    compiler.plugin('done', function(compilation) {
        for (var oldPath in pathMap) {
            fs.rename(oldPath, pathMap[oldPath], function(err) {
                if (err) console.log(err);
            });
        }
    });

    compiler.plugin('compilation', function (compilation) {

        compilation.plugin('html-webpack-plugin-alter-chunks', function (thunks) {
            // By default, js files will use the chunk hash, css file use a md5 hash
            if (!_this.md5) {
                thunks.map(function (item) {
                    if (item.files && item.files.length) {
                        var files = item.files;

                        files.forEach(function (filePath) {
                            if (/\.js$/.test(filePath)) {
                                var fileNameArr = filePath.split('/');
                                var len = fileNameArr.length;
                                var fileName = fileNameArr[len - 1];
                                hashMap[fileName] = item.hash;
                            }
                        });
                    }
                });
            }

            var stats = compilation.getStats().toJson();
            stats.assets.forEach(function (item) {
                var name = item.name;
                var nameArr = name.split('/');
                var fileName = nameArr[nameArr.length - 1];
                // when under md5 mode, all files use md5 hash
                if (/\.css$/.test(fileName) || (_this.md5 && /\.js$/.test(fileName))) {
                    var source = compilation.assets[name];
                    var content = source.source();
                    var hash = md5(content);
                    hashMap[fileName] = hash;
                }
            });

            return thunks;
        });

        compilation.plugin('html-webpack-plugin-before-html-generation', function (htmlPluginData, callback) {
            var assets = htmlPluginData.assets;
            var jsArr = assets.js;
            var cssArr = assets.css;

            jsArr = jsArr.map(function (js) {
                var cur = js;
                var arr = cur.split('/'),
                    len = arr.length;
                if (len && arr[len - 1]) {
                    var fileName = arr[len - 1];
                    var nameArr = fileName.split('.');
                    if (nameArr.length >= 3) {
                        var name = nameArr[0];
                        var exts = 'js';
                        var hash = nameArr[1];
                        var oldPath = outputPath + '/' + cur;
                        arr[len - 1] = name + '.' + exts;
                        var newPath = outputPath + '/' + arr.join('/');
                        arr[len - 1] = name + '.' + exts + '?v=' + hash;
                        pathMap[oldPath] = newPath;
                        pathMap[oldPath + '.map'] = newPath + '.map';
                    } else if (nameArr.length === 2) {
                        arr[len - 1] = fileName + '?v=' + hashMap[fileName];
                    }
                    cur = arr.join('/');
                }
                return cur;
            });

            cssArr = cssArr.map(function (css) {
                var cur = css;
                var arr = cur.split('/'),
                    len = arr.length;
                if (len && arr[len - 1]) {
                    var fileName = arr[len - 1];
                    var nameArr = fileName.split('.');
                    if (nameArr.length >= 3) {
                        var name = nameArr[0];
                        var exts = 'css';
                        var hash = nameArr[1];
                        var oldPath = outputPath + '/' + cur;
                        arr[len - 1] = name + '.' + exts;
                        var newPath = outputPath + '/' + arr.join('/');
                        arr[len - 1] = name + '.' + exts + '?v=' + hash;
                        pathMap[oldPath] = newPath;
                        pathMap[oldPath + '.map'] = newPath + '.map';
                    } else if (nameArr.length === 2) {
                        arr[len - 1] = fileName + '?v=' + hashMap[fileName];
                    }
                    cur = arr.join('/');
                }
                return cur;
            });

            assets.js = jsArr;
            assets.css = cssArr;

            callback(null, htmlPluginData);
        });
    });

};

module.exports = StaticVersionInjectionWebpackPlugin;
