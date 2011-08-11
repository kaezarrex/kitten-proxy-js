var fs = require('fs'),
    exec = require('child_process').exec,
    i = 0;

exports.proxy = function(request, proxyRequest, proxyResponse, response) {
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
        });
    });
}

exports.blacklist = function(host) {
    return 'placekitten.com' === host;
}
