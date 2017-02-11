function loadDatabaseList(){
	doAjax();
	return;
}

function theAjax(method, server, username, password){
	return $.ajax({
		url: 'getDatabases.php',
		type: 'POST',
		data: {method: method, server: server, username: username, password: password}
	});
}

function theAjax2(b_urls){
	return $.ajax({
		url: 'bobs_backend.php',
		type: 'POST',
		data: {b_urls: b_urls}
	});
}

/*
function doAjax(){
	var server, username, password;
	server = #server;
	username = #username;
	password = #password;
	ajax = theAjax("getDatabases",server,username,password);
	ajax.done(processData);
	ajax.fail(function (){alert('Failure'); });
}
*/

function updateBlacklist(b_urls){
	ajax = $.ajax({
		url: 'bobs_backend.php',
		type: 'POST',
		data: {method: 'updateBlacklist', b_urls: b_urls}
	});
	ajax.done(processData);
	ajax.fail(function (){alert('Ajax failure when updating the blacklist'); });
}

function updateHost(host){
	h = JSON.stringify(host);
	ajax = $.ajax({
		url: '/bobs_backend.php',
		type: 'POST',
		data: {method: 'updateHost', host: h}
	});
	ajax.done(processData);
	ajax.fail(function (){alert('Ajax failure when updating the host'); });
}

function updatePort(port){
	window.alert("We're here now anyway...");
	ajax = $.ajax({
		url: 'bobs_backend.php',
		type: 'POST',
		data: {method: 'updatePort', port: port}
	});
	ajax.done(printPort(ajax.data));
	ajax.fail(function (){alert('Ajax failure when updating the port'); });
}

function printBlacklist(response){
	var response = JSON.parse(response);
	outputToConsole("The blacklist has been updated to include: ");
	b_urls = response.data['b_urls'];
	for(var i=0;i<b_urls.length;i++){
		outputToConsole("\t  --"+b_urls[i]);
	}
}

function printHost(response){
	var response = JSON.parse(response);
	outputToConsole("The host has been updated to be: "+response.data['host']);
}

function printPort(response){
	var response = JSON.parse(response);
	outputToConsole("The port has been updated to be: "+response.data['port']);
}





