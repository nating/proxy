// curl -k https://localhost:8000/
const https = require('https');


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



https.createServer(options, (b_req, b_res) => {



  res.writeHead(200);
  res.end('hello world\n');




}).listen(8000);


