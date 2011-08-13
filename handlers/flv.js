var fs = require('fs'),
    path = require('path');

exports.proxy = function(request, proxyRequest, proxyResponse, response) {
    var flvPath = 'media/video.flv';

    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);

    if (path.existsSync(flvPath)) {
        fs.readFile(flvPath, function (err, data) {
            if (err === null) {
                response.end(data);
            } else {
                response.end();
            }
        });
    } else {
        console.log('video.flv not found');
        proxyResponse.addListener('data', function(chunk) {
            response.write(chunk);
        });
        proxyResponse.addListener('end', function() {
            response.end();
        });
    }

}

exports.blacklist = function(host) {
    return false;
}
