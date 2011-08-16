var kittenizer = require('./handlers/kittenizer'),
    kittenizerRedirector = kittenizer.redirector('tmp'),
    staticRedirector = require('./handlers/static-redirector'),
    redirector = staticRedirector.redirector('static', 'http://www.fooarchive.com/gpb/qinterview07_2.jpg'),
    flv = require('./handlers/flv'),
    proxy = require('./proxy'),
    proxy = new proxy.Proxy();

proxy.addHandler('image/png', kittenizerRedirector);
proxy.addHandler('image/jpeg', redirector);
proxy.addHandler('image/gif', kittenizerRedirector);
proxy.addHandler('video/x-flv', flv);

proxy.listen(8080);
