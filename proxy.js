var http = require('http'),
	url = require('url'),
	fs = require('fs');

var config = JSON.parse(fs.readFileSync("config.json"));

var host = config.host,
	port = config.port;

//	b == browser
//	p == proxy

//Returns a 404 error in the response object
function notFound(res){
	res.writeHead(404,"text/plain");
	res.end("404: File not found:");
}

http.createServer(function(b_req,b_res){
	console.log("Recieved a request for: "+b_req.url);

	//Parse the requested URL
	var b_url = url.parse(b_req.url,true);

	//return 404 if there is no query in the url, or if the query does not contain a url parameter
	if(!b_url.query || !b_url.query.url){ return notFound(b_res); }

	//Read and parse the query parameter
	var p_url = url.parse(b_url.query.url);

	//Here is a bit of caching code
	var file = fs.readFile("cache/"+p_url, function(error,data){

		//If not cached
		if(error){
			console.log("Not cached");
			//Make http request
			var options = {
			    port     : p_url.port     || 80
			,   host     : p_url.host     || 'localhost'
			,   method   : p_url.type     || 'GET'
			,   path     : p_url.path     || '/'
			}
			var p_req = http.request(options);
			console.log("Made a request for:"+options.path);
			p_req.end();

			//Handle responses
			b_res.on('response', function(p_res){
				console.log("1738");
				//Pass headers through to browser
				b_res.writeHead(p_res.statusCode, p_res.headers);

				//Pass data through to browser
				p_res.on('data',function(chunk){
					b_res.write(chunk);
				});

				p_res.on('end', function(){
					b_res.end();
				});
			});
		}
		//If cached
		else{
			console.log("Cached");
			b_res.writeHead(200,{"Content-type":"text/html"});
			b_res.end(data);
		}
	});


}).listen(port,host, function(){
	console.log("Listening on:"+host+":"+port);
});