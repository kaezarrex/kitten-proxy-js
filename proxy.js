var http = require('http'),
    fs = require('fs'),
    url = require('url'),
    exec = require('child_process').exec;

var i = 0,
    MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif'
];

function kittenize(request, proxyRequest, proxyResponse, response) {
    var filename = 'tmp/img' + (new Date().getTime()) + i++,
        file = fs.createWriteStream(filename);

    proxyResponse.addListener('data', function(chunk) {
        file.write(chunk);
    });
    
    proxyResponse.addListener('end', function() {
        file.end();
        exec('identify' + ' ' + filename, function(error, stdout, stderr){
            if(error !== null) return response.end();
            
            response.writeHead(303, {
                Location : 'http://placekitten.com' + '/' + stdout.split(' ')[2].replace('x', '/')
            });
            response.end();
//            var options = {
//                host: 'placekitten.com',
//                port: 80,
//                path: '/' + stdout.split(' ')[2].replace('x', '/'),
//            };

//            http.get(options, function(proxyResponse2){
//                proxyResponse2.addListener('data', function(chunk) {
//                    response.write(chunk, 'binary');
//                });
//                proxyResponse2.addListener('end', function() {
//                    response.end();                     
//                });
//            });
        });
    });
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

function setupProxy(request, proxyRequest, proxyResponse, response) {
    /* Takes in a request, and determines if an image is being requested. If
       this is the case, then a new request is generated. This request will
       point to an image at placekitten.com. If the request for anything
       else, it is simply returned.*/
    if (request.headers.host != 'placekitten.com' && MIME_TYPES.indexOf(proxyResponse.headers['content-type']) > -1) {
        // This response is an image, so replace it
        kittenize(request, proxyRequest, proxyResponse, response);
    } 
    else if(proxyResponse.headers['content-type'] == 'video/x-flv'){
        fs.readFile('video.flv', function (err, data) {
            if(err == null){
                response.end(data);
            }
            else{
                forward(request, proxyRequest, proxyResponse, response);
                return;    
            }
        });
        response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    }        
    else {
        forward(request, proxyRequest, proxyResponse, response);
    }
}

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
        setupProxy(request, proxyRequest, proxyResponse, response);
    });
    
    request.addListener('data', function(chunk) {
        proxyRequest.write(chunk, 'binary');
    });

    request.addListener('end', function() {
        proxyRequest.end();
    });

}).listen(8080);
