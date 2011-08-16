var kittenizer = require('./handlers/kittenizer'),
    kittenizerRedirector = kittenizer.redirector('tmp'),
    flv = require('./handlers/flv'),
    proxy = require('./proxy'),
    proxy = new proxy.Proxy();



proxy.addHandler('image/jpeg', kittenizerRedirector);
proxy.addHandler('image/png', kittenizerRedirector);
proxy.addHandler('image/gif', kittenizerRedirector);
//proxy.addHandler('video/x-flv', flv);

proxy.listen(8080);
