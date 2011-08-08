var http = require('http'),
    fs = require('fs'),
    exec = require('child_process').exec;

var i = 0;

http.createServer(function(request, response) {

    var proxy_request = createProxyRequest(request, response);

    request.addListener('data', function(chunk) {
        proxy_request.write(chunk, 'binary');
    });

    request.addListener('end', function() {
        proxy_request.end();
    });

}).listen(8080);

var createProxyRequest = function(request, response){
    console.log(request.headers);
    console.log(request.url);
    console.log(request.method);

    var proxy = http.createClient(80, request.headers['host']),
        proxy_request = proxy.request(request.method, request.url, request.headers);

    proxy_request.addListener('response', function (proxy_response) {
        var file,
            filename = 'tmp/img' + i++ + '.jpg';

        if(request.headers['host'] != 'placekitten.com' && (proxy_response.headers['content-type'] == 'image/jpeg' || proxy_response.headers['content-type'] == 'image/png')){
            console.log('jpeg detected');
            file = fs.createWriteStream(filename);

            proxy_response.addListener('data', function(chunk) {
                file.write(chunk);
            });
            proxy_response.addListener('end', function() {
                file.end();
                exec('identify ' + filename, function(error, stdout, stderr){

                    var options = {
                        host: 'placekitten.com',
                        port: 80,
                        path: '/' + stdout.split(' ')[2].replace('x', '/'),
                    };

                    http.get(options, function(res){
                        res.addListener('data', function(chunk) {
                            response.write(chunk, 'binary');
                        });
                        res.addListener('end', function() {
                            response.end();
                        });

                    });

                    //req.end();
                    //return createProxyRequest(req, response);

                });
            });
        }
        else{
            proxy_response.addListener('data', function(chunk) {
                response.write(chunk, 'binary');
            });
            proxy_response.addListener('end', function() {
                response.end();
            });
            response.writeHead(proxy_response.statusCode, proxy_response.headers);
        }

    });

    return proxy_request;
};
