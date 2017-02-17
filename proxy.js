var http = require('http'),
    url = require('url'),
    fs = require('fs');

var config = JSON.parse(fs.readFileSync("config.json"));

var host = config.host,
    port = config.port,
    blacklist = [];

    blacklist = config.blacklist;
    console.log(blacklist);


//Dynamically change the host and port if they are changed in the config file
fs.watchFile("config.json",function(){
  config = JSON.parse(fs.readFileSync("config.json"));
  host = config.host;
  port = config.port;
  blacklist = config.blacklist;
  server.close();
  server.listen(port,host, function(){
    console.log("Now listening on:"+host+":"+port);
  });
});


//Create server
var server = http.createServer(function(b_req, b_res) {

  p_url = url.parse(b_req.url,true);

  //Check if host is in Blacklist
  for (i in blacklist) {
    if (blacklist[i]===p_url.host) {
      console.log("Denied: " + b_req.method + " " + b_req.url);
      return b_res.end('Whoops that is denied mate!!');
    }
  }

  //Print out recieved request
  console.log(b_req.connection.remoteAddress + ": " + b_req.method + " " + b_req.url+" host:"+p_url.host);

  
  console.log("b_req.url:"+b_req.url);
  console.log("b_req.host:"+b_req.host);
  console.log("b_req.method:"+b_req.method);
  console.log("b_req.path:"+b_req.path);
  console.log("b_req.pathname:"+b_req.pathname);
  console.log("p_req.url:"+p_url.url);
  console.log("p_req.host:"+p_url.host);
  console.log("p_req.method:"+p_url.method);
  console.log("p_req.path:"+p_url.path);
  console.log("p_req.pathname:"+p_url.pathname);
  console.log("b_req.headers:"+b_req.headers['accept'].split(',')[0]);
  console.log("b_req.method"+b_req.method);
  if(p_url.host === host+":"+port)
  {
    if(b_req.method=='GET'){
      return getLocal(b_req,b_res);
    }
    else if(b_req.method=='POST'){
      return postLocal(b_req,b_res);
    }
  }

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
});

//Start up the Server
server.listen(port,host, function(){
  console.log("Listening on:"+host+":"+port);
});

//Serves the pages that are local on the server
function getLocal(b_req,b_res){

  p_url = url.parse(b_req.url,true);

  //Serve the index page
  if(p_url.host === "127.0.0.1:4000" && p_url.path==="/"){
    fs.readFile("index.html", function (err, data) {
      if(err){
        b_res.writeHead(404,"text/plain");
        b_res.end("404: File not found:");
      }
      else{
          b_res.writeHead(200, {'Content-Type': 'text/html'});
          b_res.end(data);
      }
    });
  }
  //Serve other pages
  else{
    var filename = p_url.path.substring(1);
    var expectedFileType = b_req.headers['accept'].split(',')[0];
    console.log("Reading the file:"+filename);
    fs.readFile(filename, function (err, data) {
      if(err){
        b_res.writeHead(404,"text/plain");
        b_res.end("404: File not found:");
      }
      else{
          b_res.writeHead(200, {'Content-Type': expectedFileType });
          b_res.end(data);
      }
    });
  }
}

//Updates a file local to the server
function postLocal(b_req,b_res){

  console.log(b_req.connection.remoteAddress + ": " + b_req.method + " " + b_req.url+" host:"+p_url.host);

  p_url = url.parse(b_req.url,true);
  var method = p_url.path.split('/')[1];
  var data = p_url.path.split('/')[2];

  //Call updating method
  if(method === "blacklist"){
    blacklistUrl(data);
    b_res.end();
  }
  else if(method === "changeport"){
    changeport(data);
    b_res.end();
  }
  else if(method === "changehost"){
    changehost(data);
    b_res.end();
  }
}

//BlackLists a url from the proxy, unless it is already blacklisted
function blacklistUrl(url){

  for(i in blacklist){
    if(blacklist[i]===url){
      return console.log('The url '+url+' was already blacklisted.');
    }
  }

  blacklist += url;
  console.log("hetyn, now the blackist is:"+blacklist);

  var c = JSON.parse(fs.readFileSync("config.json"));

  c.blacklist = JSON.stringify(blacklist);

  fs.writeFile('config.json', JSON.stringify(c), (err) => {
    if (err) throw err;
    return console.log('The Blacklist has been updated to:'+ blacklist);
  });
}

//Changes the port of the proxy
function changeport(new_p){

  var c = JSON.parse(fs.readFileSync("config.json"));

  c.port = new_p;

  fs.writeFile('config.json', JSON.stringify(c), (err) => {
    if (err) throw err;
    return console.log('The port number was updated to:'+ new_p);
  });
}

//Changes the host address of the proxy
function changehost(new_h){

  var c = JSON.parse(fs.readFileSync("config.json"));

  c.host = new_h;

  fs.writeFile('config.json', JSON.stringify(c), (err) => {
    if (err) throw err;
    return console.log('The host address was updated to:'+ new_h);
  });
}



