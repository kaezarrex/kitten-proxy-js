var http = require('http'),
    fs = require('fs'),
    url = require('url');

function Proxy() {
    this.handlers = {};
}

Proxy.prototype.addHandler = function(mimetype, handler) {
    this.handlers[mimetype] = handler;
}

Proxy.prototype.listen = function(port) {
    var that = this;
    http.createServer(function(request, response) {

        var proxyRequest,
            urlParts = url.parse(request.url),
            options = {
                host: urlParts.host,
                port: 80,
                method: request.method,
                path: urlParts.pathname + (typeof urlParts.search === 'undefined' ? '' : urlParts.search),
                headers: request.headers
            };

        proxyRequest = http.request(options);

        proxyRequest.addListener('response', function(proxyResponse) {
            that.assignProxy(request, proxyRequest, proxyResponse, response);
        });
        
        request.addListener('data', function(chunk) {
            proxyRequest.write(chunk, 'binary');
        });

        request.addListener('end', function() {
            proxyRequest.end();
        });

    }).listen(port);
}

Proxy.prototype.assignProxy = function(request, proxyRequest, proxyResponse, response) {
    var mimetype = proxyResponse.headers['content-type'],
        handler = this.handlers[mimetype];

    if (undefined !== handler && !handler.blacklist(request.headers.host)) {
        handler.proxy(request, proxyRequest, proxyResponse, response);
    } else {
        forward(request, proxyRequest, proxyResponse, response);
    }
    
}

function forward(request, proxyRequest, proxyResponse, response) {
    proxyResponse.addListener('data', function(chunk) {
        response.write(chunk);
    });
    proxyResponse.addListener('end', function() {
        response.end();
    });
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
}

exports.Proxy = Proxy

