<?php

  $file = $_GET["src"];
  
  $ext = pathinfo($file, PATHINFO_EXTENSION);
  $type = "";
  $doReadFile = false;
  
  if( $ext == "gltf" || $ext == "json") {
	$type = "application/json";  
  } else if( $ext == "bin" ) {
	$type = "application/octet-stream";  
  } else if( $ext == "png" ) {
	$type = "image/png"; 
	$doReadFile = true;
  } else if( $ext == "jpg" || $ext == "jpeg") {
	$type = "image/jpeg"; 
	$doReadFile = true;
  }
  /*
  echo "ext:".$ext."<br/>";
  echo "type:".$type."<br/>";
  echo "doReadFile:".is_bool($doReadFile);
  */
  header('Content-Type: '.$type);
  header('Content-Length: ' . filesize($file));
  header("Access-Control-Allow-Origin: *");
  header("Access-Control-Expose-Headers: Etag");
  
  if( is_bool($doReadFile) ) {
	readfile($file);
  } else {  
	echo file_get_contents($file);
  }
?>