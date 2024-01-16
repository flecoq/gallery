<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: multipart/form-data; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, GET, POST, FILES");
header("Allow: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = json_decode(file_get_contents("php://input"));
$type = $data->type;
if( $type == "jpg" || $type == "jpeg" ) {
	$type = "image/jpeg";
} else if( $type == "png" ) {
	$type = "image/png";
} else if( $type == "json" ) {
	$type = "application/json";
} else if( $type == "xml" ) {
	$type = "text/xml";
} else if( $type == "gltf" || $type == "bin" || $type == "obj" || $type == "mlt" ) {
	$type = "application/octet-stream";
}
	
$content = str_replace('data:'.$type.';base64,', '', $data->content);   
$content = str_replace(' ', '+', $content);   
$content = base64_decode($content);
$filename = $data->path.$data->filename;  
 
$success = file_put_contents($filename, $content);

$size = $data->size;
if( strlen($size) > 0) {
	$size = $size."x".$size;
	$source = realpath($filename);
	$dest = realpath($data->path."thumb/");
	$cmd = '"C:/Program Files/ImageMagick-7.0.10-Q16-HDRI/magick.exe" '.$source." -resize ".$size." ".$dest."/".$data->filename;
	exec($cmd);
}

// print $success ? $data->filename : 'Unable to save the file.';
?>
