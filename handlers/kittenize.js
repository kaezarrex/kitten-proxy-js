var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    i = 0;

exports.proxy = function(request, proxyRequest, proxyResponse, response) {
    var pathName = 'tmp',
        fileName = pathName + '/img' + (new Date().getTime()) + i++,
        fileStream;

    if (!path.existsSync(pathName)) {
        fs.mkdirSync(pathName, '0755');
    }
    
    fileStream = fs.createWriteStream(fileName);

    proxyResponse.addListener('data', function(chunk) {
        fileStream.write(chunk);
    });
    
    proxyResponse.addListener('end', function() {
        fileStream.end();
        exec('identify' + ' ' + fileName, function(error, stdout, stderr){
            if (error !== null) return response.end();
            
            response.writeHead(303, {
                Location : 'http://placekitten.com' + '/' + stdout.split(' ')[2].replace('x', '/')
            });
            response.end();
        });
    });
}

exports.blacklist = function(host) {
    return 'placekitten.com' === host;
}
