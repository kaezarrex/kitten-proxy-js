var fs = require('fs'),
    path = require('path');

function RedirectorBase(cachePath, redirectFn, blacklistFn) {
    this.cachePath = cachePath;
    this.redirectFn = redirectFn;
    this.blacklistFn = blacklistFn || function(host) { return false; };
    this.count = 0;

    if (!path.existsSync(this.cachePath)) {
        fs.mkdirSync(this.cachePath, '0755');
    }
}

RedirectorBase.prototype.proxy = function(request, proxyRequest, proxyResponse, response) {
    var fileName = path.join(this.cachePath, '' + new Date().getTime() + '[' + this.count++ + ']'),
        fileStream,
        that = this;
   
    fileStream = fs.createWriteStream(fileName);

    proxyResponse.addListener('data', function(chunk) {
        fileStream.write(chunk);
    });
    
    proxyResponse.addListener('end', function() {
        fileStream.end();
        that.redirectFn(function(url) {
            if (url !== null) {
                response.writeHead(303, {
                    Location : url    
                });
            } else {
                response.writeHead(404);
            }
            response.end();
        }, fileName);
    });
}

RedirectorBase.prototype.blacklist = function(host) {
    return this.blacklistFn(host);
}

exports.RedirectorBase = RedirectorBase;
