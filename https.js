//Require libraries
var http = require("http");
var url = require("url");
var net = require('net');
var fs = require('fs');

//Get configurations from "config.json"
var config = JSON.parse(fs.readFileSync("config.json"));
var host = config.host,
    port = config.port,
    blacklist = [];

//Create the proxy
var server = http.createServer().listen(port, function(){ console.log("Now listening on: "+host+":"+port); });

//Listen for connection requests from the browser
server.addListener('connect', function (b_req, b_socket, bodyhead) {
  var s_domain = b_req.url.split(':')[0];
  var s_port = b_req.url.split(':')[1]
  console.log("Proxying a request for:", s_domain, s_port);

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