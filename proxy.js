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

//Returns index.html
function getIndex(res){
	fs.readFile("index.html", function (err, data) {
		if(err){
			res.writeHead(404,"text/plain");
			res.end("404: File not found:");
		}
		else{
		    res.writeHead(200, {'Content-Type': 'text/html'});
		    res.end(data);
		}
   	});
}

//Returns bobs_style.css
function getCSS(res){
	fs.readFile("bobs_style.css", function (err, data) {
		if(err){
			res.writeHead(404,"text/plain");
			res.end("404: File not found:");
		}
		else{
		    res.writeHead(200, {'Content-Type': 'text/css'});
		    res.end(data);
		}
	});
}



var server = http.createServer(function(b_req,b_res){
	console.log("Recieved a request for: "+b_req.url);


	//Handle calls for management console data
	if(b_req.url === "/index" || b_req.url === "/" | b_req.url === ""){ return getIndex(b_res); }
	if(b_req.url === "/bobs_style.css"){ return getCSS(b_res); }


	//Parse the requested URL
	var b_url = url.parse(b_req.url,true);


	console.log("b_req.port:"+b_req.port);
	console.log("b_req.host:"+b_req.host);
	console.log("b_req.url:"+b_req.url);
	console.log("b_req.path:"+b_req.path);
	console.log("b_url.port:"+b_url.port);
	console.log("b_url.host:"+b_url.host);
	console.log("b_url.type:"+b_url.type);
	console.log("b_url.path:"+b_url.path);
	//Read and parse the query parameter
	var p_url = url.parse(b_url.query.url);
	console.log("p_url.port:"+p_url.port);
	console.log("p_url.host:"+p_url.host);
	console.log("p_url.type:"+p_url.type);
	console.log("p_url.path:"+p_url.path);
	console.log("p_url.url:"+p_url.url);
	console.log("b_url.query.url:"+b_url.query.url);
	console.log("b_req.url:"+b_req.url);
	console.log("p_url:"+p_url);
	console.log("b_url:"+b_url);
	console.log("b_req:"+b_req);


	//return 404 if there is no query in the url, or if the query does not contain a url parameter
	if(!b_url.query || !b_url.query.url){ return notFound(b_res); }


	//Here is a bit of caching code
	var file = fs.readFile("cache/"+p_url, function(error,data){

		//If not cached
		if(error){
			console.log("Not cached");
			//Make http request
			var options = {
				port     : p_url.port   || 80,
			   	host     : p_url.host   || 'localhost',
			   	method   : p_url.type   || 'GET',
			   	path     : p_url.url   	|| '/'
			}
			console.log("options.port:"+options.port);
			console.log("options.host:"+options.host);
			console.log("options.method:"+options.method);
			console.log("options.path:"+options.path);
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


})

server.listen(port,host, function(){
	console.log("Listening on:"+host+":"+port);
});

//Dynamically change the host and port if they are changed in the config file
fs.watchFile("config.json",function(){
	config = JSON.parse(fs.readFileSync("config.json"));
	host = config.host;
	port = config.port;
	server.close();
	server.listen(port,host, function(){
		console.log("Now listening on:"+host+":"+port);
	});
})