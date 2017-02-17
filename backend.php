<?php
echo $_POST["method"]();

/*Updates the server's host ip*/
function updateHost(h_ip){
	$jsonString = file_get_contents('config.json');
	$data = json_decode($jsonString, true);
	
	$data['host'] = h_ip;

	$newJsonString = json_encode($data);
	file_put_contents('jsonFile.json', $newJsonString);
}

/*Updates the server's port*/
function updatePort(p){
	echo 'hello babhabh';
	$jsonString = file_get_contents('config.json');
	$data = json_decode($jsonString, true);
	
	$data['port'] = p;

	$newJsonString = json_encode($data);
	echo '<script>console.log('+$newJsonString+')</script>';
	file_put_contents('jsonFile.json', $newJsonString);
	return 1;
}

/*Adds urls to the server's blacklist*/
function addToBlacklist(){

	$b_urls = $POST['b_urls'];

	$jsonString = file_get_contents('config.json');
	$data = json_decode($jsonString, true);

	foreach( $b_urls as $b ) {
		$data['blacklist'] += b;
    }

	$newJsonString = json_encode($data);
	file_put_contents('jsonFile.json', $newJsonString);

	$return = new stdClass;
	$return->success =true;
	$return->errorMessage = "";
	$return->data['blacklist'] = $data['blacklist'];
	$json = json_encode($return);
	echo $json;
}
?>