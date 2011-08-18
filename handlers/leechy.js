var fs = require('fs'),
    path = require('path');

function Leechy(cachePath, fileExtension, blacklistFn) {
    this.cachePath = cachePath;
    this.fileExtension = fileExtension;
    this.blacklistFn = blacklistFn || function(host) { return false; };
    this.count = 0;

    if (!path.existsSync(this.cachePath)) {
        fs.mkdirSync(this.cachePath, '0755');
    }
}

Leechy.prototype.proxy = function(request, proxyRequest, proxyResponse, response) {
    var fileName = path.join(this.cachePath, '' + new Date().getTime() + '[' + this.count++ + ']' + this.fileExtension),
        fileStream = fs.createWriteStream(fileName);

    proxyResponse.addListener('data', function(chunk) {
        fileStream.write(chunk);
        response.write(chunk);
    });
    
    proxyResponse.addListener('end', function() {
        fileStream.end();
        response.end();
    });
};

Leechy.prototype.blacklist = function(host) {
    return this.blacklistFn(host);
};

exports.create = function(cachePath, fileExtension, blacklistFn){
    return new Leechy(cachePath, fileExtension, blacklistFn);
};
