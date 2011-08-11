var proxy = require('./proxy'),
    kittenize = require('./handlers/kittenize'),
    proxy = new proxy.Proxy();

proxy.addHandler('image/jpeg', kittenize);
proxy.addHandler('image/png', kittenize);
proxy.addHandler('image/gif', kittenize);

proxy.listen(8080);
