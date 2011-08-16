var redirectorBase = require('./redirector-base'),
    url = require('url');

exports.redirector = function(cachePath, staticUrl) {
    var staticHost = url.parse(staticUrl).hostname;
    
    return new redirectorBase.RedirectorBase(
        cachePath,
        function(callback, fileName) {
            callback(staticUrl);
        },
        function(host) {
            return host === staticHost;
        }
    );
};
