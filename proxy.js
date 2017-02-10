var http = require('http'),
	url = require('url');

//	b == browser
//	p == proxy

//Returns a 404 error in the response object
function notFound(res){
	res.writeHead(404,"text/plain");
	res.end("404: File not found:");
}

http.createServer(function(b_req,b_res){

	//Parse the requested URL
	var b_url = url.parse(b_req.url,true);

	//return 404 if there is no query in the url, or if the query does not contain a url parameter
	if(!b_url.query || !b_url.query.url){ return notFound(b_res); }

	//Read and parse the query parameter
	var p_url = url.parse(b_url.query.url);

	//Initialize HTTP client
	//var p_client = http.createClient(p_url.port || 80, p_url.hostname);

	 //, request = http.createClient( port, host ) // .request( type, path, headers );
	var options = {
	    port     : p_url.port     || 80
	,   host     : p_url.host     || 'localhost'
	,   method   : p_url.type     || 'GET'
	,   path     : p_url.path     || '/'
	}
	var p_req = http.request(options);
	p_req.end();

	//Send request
	//var p_req = p_client.request('GET',p_url.pathname || "/", { host: p_url.hostname });
	//p_req.end();

	//Listen for response
	p_req.addListener('response', function(p_res){

		//Pass headers through to browser
		b_res.writeHead(p_res.statusCode, p_res.headers);

		//Pass data through to browser
		p_res.addListener('data',function(chunk){
			b_res.write(chunk);
		});

		p_res.addListener('end', function(){
			b_res.end();
		});

	});

}).listen(3000,'127.0.0.1');

console.log("Server running at http://127.0.0.1:3000/");

