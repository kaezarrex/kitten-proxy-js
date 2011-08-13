var proxy = require('./proxy'),
    kittenize = require('./handlers/kittenize'),
    flv = require('./handlers/flv'),
    proxy = new proxy.Proxy();

proxy.addHandler('image/jpeg', kittenize);
proxy.addHandler('image/png', kittenize);
proxy.addHandler('image/gif', kittenize);
proxy.addHandler('video/x-flv', flv);

proxy.listen(8080);
