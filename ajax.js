
/*Updates the server's url blacklist.*/
function updateBlacklist(b_urls){
	ajax = $.ajax({
		url: 'backend.php',
		type: 'POST',
		data: {method: 'updateBlacklist', b_urls: b_urls}
	});
	ajax.done(processData);
	ajax.fail(function (){alert('Ajax failure when updating the blacklist'); });
}

/*Updates the server's host ip address.*/
function updateHost(host){
	h = JSON.stringify(host);
	ajax = $.ajax({
		url: '/backend.php',
		type: 'POST',
		data: {method: 'updateHost', host: h}
	});
	ajax.done(processData);
	ajax.fail(function (){alert('Ajax failure when updating the host'); });
}

/*Updates the server's port number.*/
function updatePort(port){
	window.alert("We're here now anyway...");
	ajax = $.ajax({
		url: 'backend.php',
		type: 'POST',
		data: {method: 'updatePort', port: port}
	});
	ajax.done(printPort(ajax.data));
	ajax.fail(function (){alert('Ajax failure when updating the port'); });
}

/*Prints the server's url blacklist to the management console.*/
function printBlacklist(response){
	var response = JSON.parse(response);
	outputToConsole("The blacklist has been updated to include: ");
	b_urls = response.data['b_urls'];
	for(var i=0;i<b_urls.length;i++){
		outputToConsole("\t  --"+b_urls[i]);
	}
}

/*Prints the server's host ip address to the management console.*/
function printHost(response){
	var response = JSON.parse(response);
	outputToConsole("The host has been updated to be: "+response.data['host']);
}

/*Prints the server's port to the management console.*/
function printPort(response){
	var response = JSON.parse(response);
	outputToConsole("The port has been updated to be: "+response.data['port']);
}
