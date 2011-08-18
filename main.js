var kittenizer = require('./handlers/kittenizer'),
    kittenizerRedirector = kittenizer.redirector('tmp'),
    staticRedirector = require('./handlers/static-redirector'),
    redirector = staticRedirector.redirector('static', 'http://www.fooarchive.com/gpb/qinterview07_2.jpg'),
    flv = require('./handlers/flv'),
    leechy = require('./handlers/leechy'),
    leecher = leechy.create('music', '.mp3');
    proxy = require('./proxy'),
    proxy = new proxy.Proxy();

proxy.addHandler('image/png', kittenizerRedirector);
proxy.addHandler('image/jpeg', redirector);
proxy.addHandler('image/gif', kittenizerRedirector);
proxy.addHandler('video/x-flv', flv);
proxy.addHandler('audio/mpeg', leecher);

proxy.listen(8080);
