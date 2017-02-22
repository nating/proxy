# proxy
An HTTP/HTTPS web proxy written in Node.js.

## Requirements
This web proxy needs Node to run:
```
$npm install node
```
or
```
$brew install node
```

## Usage

### Running the Proxy
To run the proxy on the specified port and host ip from the config file:
```
$node proxy.js
```

### Management Console Commands

To list the avaialable commands:
```
$help
```
To list the contents of the blacklist:
```
$blacklist
```
To add domains to the blacklist:
```
$blacklist <domain> {<domain>}
```
To remove domains from the blacklist:
```
$blacklistrm <domain> {<domain>}
```
To clear the cache:
```
$clearcache
```
To print the current port, host ip, and blacklist of the proxy:
```
$status
```
To change the port of the proxy:
```
changeport <portnumber>
```
To change the host ip of the proxy:
```
$changehost <hostip>
```
To terminate the proxy:
```
$quit
```

Changes can be made to the config.json file while the proxy is running, and it will automatically reconfigure. This is not recommended though, as making changes via the management console ensures that the config.json remains in valid JSON format.

## Function
When the proxy recieves an HTTP request, it creates a request of its own for the data and responds to the client's request with the response to its own request.

On a 'connect' event, the proxy opens sockets to message the client and server, and pipes all communication from one socket to the other.

If the domain of the URL in a request is in the blacklist (the blacklist can be found in the config file), the requested data is not delivered.

When a HTTP response without the 'no-cache' cache-control header is delivered to the client from the proxy, it is also cached in the cache.json, so that it can be delivered straight from the cache if asked for again.

The cache.json is full of URL objects that have headers, status codes, and data. These attributes can be applied to a response to the client when a request is made for that URL.

Caching information is printed to the management console in yellow. Denied requests are printed to the management console in red.
