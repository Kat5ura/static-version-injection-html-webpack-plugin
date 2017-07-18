'use strict';
var fs = require('fs');
var md5 = require('md5');

function StaticVersionInjectionWebpackPlugin(options) {
    // Configure your plugin with options...
    var options = options || {};
    // md5 mode,when true,all files` hash will generated by md5
    this.md5 = options.md5 || false;

    // when you want to use a dist file as a template, when you want to modify a template file directly, set this option to true， then old assets tags will be cleaned
    this.clean = options.clean || false;

    // when clean option is true, you can set a hold option to decide which assets will be hold in the clean processing
    // By default, inline script or style will always remain
    this.hold = options.hold || {};
    this.holdLinks = this.hold.link || [];
    this.holdScripts = this.hold.script || [];
}

StaticVersionInjectionWebpackPlugin.prototype.apply = function (compiler) {
    var _this = this;
    // save hash of each file into a map
    var outputPath = compiler.options.output.path;

    var hashMap = {};
    var pathMap = {};

    compiler.plugin('done', function (compilation) {
        for (var oldPath in pathMap) {
            fs.rename(oldPath, pathMap[oldPath], function (err) {
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
                    var hash = hashMap[fileName];
                    if (nameArr.length >= 3) {
                        var name = nameArr[0];
                        var exts = 'js';
                        var oldPath = outputPath + '/' + cur;
                        arr[len - 1] = name + '.' + exts;
                        var newPath = outputPath + '/' + arr.join('/');
                        arr[len - 1] = name + '.' + exts + '?v=' + hash;
                        pathMap[oldPath] = newPath;
                        pathMap[oldPath + '.map'] = newPath + '.map';
                    } else if (nameArr.length === 2) {
                        arr[len - 1] = fileName + '?v=' + hash;
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
                    var hash = hashMap[fileName];
                    var nameArr = fileName.split('.');
                    if (nameArr.length >= 3) {
                        var name = nameArr[0];
                        var exts = 'css';
                        var oldPath = outputPath + '/' + cur;
                        arr[len - 1] = name + '.' + exts;
                        var newPath = outputPath + '/' + arr.join('/');
                        arr[len - 1] = name + '.' + exts + '?v=' + hash;
                        pathMap[oldPath] = newPath;
                        pathMap[oldPath + '.map'] = newPath + '.map';
                    } else if (nameArr.length === 2) {
                        arr[len - 1] = fileName + '?v=' + hash;
                    }
                    cur = arr.join('/');
                }
                return cur;
            });

            assets.js = jsArr;
            assets.css = cssArr;

            callback(null, htmlPluginData);
        });

        if (this.sameOrigin) {
            compilation.plugin('html-webpack-plugin-before-html-processing', function (htmlPluginData, callback) {
                // console.log(htmlPluginData.html);
                var html = htmlPluginData.html;

                var links = /(<link[^>]*>)/ig;
                var scripts = /(<script[^>]*><\/script>)/ig;
                var comments = /(<!-- .* -->)/ig;

                html = html.replace(comments, '');
                html = html.replace(links, function (match) {
                    var res = '';
                    if (_this.filterLinks.length) {
                        _this.filterLinks.forEach(function (link) {
                            if (match.indexOf(link) > -1) {
                                res = match;
                            }
                        });
                    }
                    return res;
                });

                html = html.replace(scripts, function (match) {
                    var res = '';
                    if (_this.filterScripts.length) {
                        _this.filterScripts.forEach(function (script) {
                            if (match.indexOf(script) > -1) {
                                res = match;
                            }
                        });
                    }
                    return res;
                });

                htmlPluginData.html = html;
                callback(null, htmlPluginData);
            });
        }
    });

};

module.exports = StaticVersionInjectionWebpackPlugin;