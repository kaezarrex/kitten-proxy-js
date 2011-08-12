var http = require('http'),
    fs = require('fs'),
    url = require('url');

var i = 0,
    MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif'
];

function Proxy() {
    this.handlers = new Object();
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
    /* Takes in a request, and determines if an image is being requested. If
       this is the case, then a new request is generated. This request will
       point to an image at placekitten.com. If the request for anything
       else, it is simply returned.*/
    
    var mimetype = proxyResponse.headers['content-type'],
        handler = this.handlers[mimetype];

    if (null != handler && !handler.blacklist(request.headers.host)) {
        handler.proxy(request, proxyRequest, proxyResponse, response);
    } else {
        forward(request, proxyRequest, proxyResponse, response);
    }
    
//    if (request.headers.host != 'placekitten.com' && MIME_TYPES.indexOf(proxyResponse.headers['content-type']) > -1) {
//        // This response is an image, so replace it
//        kittenize(request, proxyRequest, proxyResponse, response);
//    } 
//    else if(proxyResponse.headers['content-type'] == 'video/x-flv'){
//        fs.readFile('video.flv', function (err, data) {
//            if(err == null){
//                response.end(data);
//            }
//            else{
//                forward(request, proxyRequest, proxyResponse, response);
//                return;    
//            }
//        });
//        response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
//    }        
//    else {
//        forward(request, proxyRequest, proxyResponse, response);
//    }
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

