var redirectorBase = require('./redirector-base'),
    exec = require('child_process').exec;

function redirectFn(callback, fileName) {
    exec('identify' + ' ' + fileName, function(error, stdout, stderr){
        if (error === null) { 
            callback('http://placekitten.com' + '/' + stdout.split(' ')[2].replace('x', '/'));     
        } else {
            callback(null);
        }
    });
}

function blacklistFn(host) {
    return 'placekitten.com' === host;
}

exports.redirector = function(cachePath) {
    return new redirectorBase.RedirectorBase(cachePath, redirectFn, blacklistFn);
}
