//Require libraries
var http = require("http");
var url = require("url");
var net = require('net');
var fs = require('fs');
var readline = require('readline');
var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

//Get configurations from "config.json"
var config = JSON.parse(fs.readFileSync("config.json"));
var host = config.host,
    port = config.port,
    blacklist = config.blacklist;

/*---------------------------------------------WATCH CONFIG------------------------------------------------*/

//Dynamically change the host, port, and blacklist if they are changed in the config file
fs.watchFile("config.json",function(){
	updateConfig();
});

function updateConfig(){
  	config = JSON.parse(fs.readFileSync("config.json"));
  	host = config.host;
  	port = config.port;
  	blacklist = config.blacklist;
  	server.close();
  	server.listen(port,host);
  	return readCommand();
}


/*---------------------------------------------HTTP SERVER------------------------------------------------*/

//Create the proxy
var server = http.createServer(function(b_req, b_res) {
  	p_url = url.parse(b_req.url,true);

  	//Check if host is in Blacklist
  	for (i in blacklist) {
    	if (blacklist[i]===p_url.host) {
      		console.log("\x1b[32m","DENIED ("+blacklist[i]+") " + b_req.method + " " + b_req.url);
      		b_res.writeHead(403);
      		return b_res.end("<h1>This domain has been blacklisted.<h1>");
    	}
  	}

  	//Print out recieved request
  	var s_domain = b_req.url.split(':')[0];
  	var s_port = b_req.url.split(':')[1]
  	console.log("\x1b[32m","Request recieved for:"+s_domain+":"+s_port); readCommand();

  	//Create Request
  	var p_req = http.request({
      	port: 80,
      	host: p_url.host,
      	method: b_req.headers['method'],
      	path: p_url.path
  	});
  	p_req.end();
  	p_req.on('error',console.log)

  	//Proxy Response handler
  	p_req.on('response', function (p_res) {
    	p_res.on('data', function(chunk) {
     	 b_res.write(chunk, 'binary');
    	});
    	p_res.on('end', function() {
      	b_res.end();
    	});
    	b_res.writeHead(p_res.statusCode, p_res.headers);
  	});

  	//Proxy Request handler
  	b_req.on('data', function(chunk) {
    	p_req.write(chunk, 'binary');
  	});
  	b_req.on('end', function() {
    	p_req.end();
  	});
}).listen(port, host, function(){ 
	console.log("\x1b[32m","Now listening on: "+host+":"+port);
	readCommand();
});


/*---------------------------------------------HTTPS LISTENER-----------------------------------------------*/

//Listen for connection requests from the browser
server.addListener('connect', function (b_req, b_socket, bodyhead) {

  	//Check if host is in Blacklist
  	p_url = url.parse('https://'+b_req.url,true);
  	for (i in blacklist) {
    	if (p_url.hostname.search(blacklist[i])!=-1) {
      		console.log("\x1b[31m","DENIED ("+blacklist[i]+") " + b_req.method + " " + b_req.url); 

      		//HERE IS CODE THAT NEEDS TO BE FIXED UP
	    	b_socket.write("HTTP/" + b_req.httpVersion + " 403 Forbidden\r\n\r\n");
	    	b_socket.end("<h1>This domain has been blacklisted<h1>");
	    	//

      		return readCommand();
    	}
  	}

  	var s_domain = b_req.url.split(':')[0];
  	var s_port = b_req.url.split(':')[1]
  	console.log("\x1b[32m","Request recieved for:"+s_domain+":"+s_port); readCommand();

  	//Create proxy-server socket and establish a connection with the server
  	var p_socket = new net.Socket();
  	p_socket.connect(s_port, s_domain, function () {
      		p_socket.write(bodyhead);
      		b_socket.write("HTTP/" + b_req.httpVersion + " 200 Connection established\r\n\r\n");
    	}
  	);

  	//Finish browser-proxy socket when proxy-server socket is finished or breaks
  	p_socket.on('end', function () {
    	b_socket.end();
  	});
  	p_socket.on('error', function () {
    	b_socket.write("HTTP/" + b_req.httpVersion + " 500 Connection error\r\n\r\n");
    	b_socket.end();
  	});

  	//Tunnel data from each socket out the other
  	b_socket.on('data', function (chunk) {
    	p_socket.write(chunk);
  	});
  	p_socket.on('data', function (chunk) {
    	b_socket.write(chunk);
  	});

  	//Finish proxy-server socket when browser-proxy socket is finished or breaks
  	b_socket.on('end', function () {
    	p_socket.end();
  	});
  	b_socket.on('error', function () {
    	p_socket.end();
  	});

});

/*---------------------------------------------MANAGEMENT CONSOLE-----------------------------------------------*/

//Read in commands from the management console
function readCommand(){
	rl.setPrompt("\x1b[32m",'>');
	rl.prompt();
}
rl.on('line',function(c){
	var args = c.split(' ');
	switch(args[0]){
		case "help": 		help(); break;
		case "blacklistrm": blacklistRm(args); break;
		case "blacklist": 
			if(args.length>1){
				blacklistFunc(args); break;
			}
			else{
				console.log("\x1b[32m","The current blacklist is:\n["+blacklist+"]"); readCommand(); break;
			}
		case "clearcache": 	clearCache(); break;
		case "quit": 		quit(); break;
		case "status": 		status(); break;
		case "port": 		changeport(args); break;
		case "host": 		changepost(args); break;
		default: 			help(); break;
	}
});


/*-----------------------HELP----------------------*/
function help(){
	console.log("\x1b[32m","\n\thelp: displays proxy commands\n\n\tblacklist: displays blacklist\n\n\tblacklist <domain>: blacklists x domains\n\n\tclearcache: clears the cache\n\n\tquit: terminates the proxy\n\n\tport <port number>: updates the port number of the proxy\n\n\thost <host address>: updates the host address of the proxy\n");
	readCommand();
}


/*---------------------STATUS----------------------*/
function status(){
	console.log("\x1b[32m","host:\t\t"+host+"\nport:\t\t"+port+"\nblacklist:\t"+blacklist);
	readCommand();
}


/*-----------------------QUIT----------------------*/
function quit(){
	server.close();abort();
}


/*--------------------BLACKLIST--------------------*/
//BlackLists a url from the proxy, unless it is already blacklisted
function blacklistFunc(args){

	for(var j=1;j<args.length;j++){
		var added = false;
		for(i in blacklist){
		    if(blacklist[i]===args[j]){
		    	console.log("\x1b[31m",'The domain '+args[j]+' was already blacklisted.'); readCommand(); added = true; break;
		    }
		}
		if(!added){
			blacklist.push(args[j]);
		}
	}

  	var c = JSON.parse(fs.readFileSync("config.json"));

  	c.blacklist = blacklist

  	fs.writeFile('config.json', JSON.stringify(c), (err) => {
    	if (err) throw err;
    	readCommand();
  	});
}

/*-----------------BLACKLISTRM----------------------*/
//Removes domains from the proxy's blacklist if they are present
function blacklistRm(args){

	for(var j=1;j<args.length;j++){
		var removed = false;
		for(i in blacklist){
		    if(blacklist[i]===args[j]){
				blacklist.splice(i,1);
		    	console.log("\x1b[32m",'The domain '+args[j]+' was removed from the blacklist.'); readCommand(); removed = true; break;
		    }
		}
		if(!removed){
		    console.log("\x1b[31m",'The domain '+args[j]+' was not in the blacklist.'); readCommand();
		}
	}

  	var c = JSON.parse(fs.readFileSync("config.json"));

  	c.blacklist = blacklist;

  	fs.writeFile('config.json', JSON.stringify(c), (err) => {
    	if (err) throw err;
    	readCommand();
  	});
}

/*-------------------CHANGEPORT--------------------*/
//Changes the port of the proxy
function changeport(args){

  var c = JSON.parse(fs.readFileSync("config.json"));

  c.port = args[1];

  fs.writeFile('config.json', JSON.stringify(c), (err) => {
    if (err) throw err;
    console.log("\x1b[31m",'The port number was updated to:'+ args[1]);
    readCommand();
  });
}

/*-------------------CHANGEHOST-------------------*/
//Changes the host address of the proxy
function changehost(args){

  var c = JSON.parse(fs.readFileSync("config.json"));

  c.host = args[1];

  fs.writeFile('config.json', JSON.stringify(c), (err) => {
    if (err) throw err;
    console.log("\x1b[31m",'The host address was updated to:'+ args[1]);
    readCommand();
  });
}
