<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: multipart/form-data; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, GET, POST, FILES");
header("Allow: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$filename = "snapshot/support.png"; 
$width = 1536;
$height = 525;
$size = $height."x".$height;
$offset = ($width - $height)/2;
$crop = $size."+".$offset."+0";

$source = realpath($filename);
$dest = realpath("user/thumb/support");
$cmd = '"C:/Program Files/ImageMagick-7.0.10-Q16-HDRI/magick.exe" -size '.$size.' xc:rgba(255,255,255,0.25) ( '.$source.' -crop '.$crop.' ) -composite '.$dest.'\\dest.png';
echo $cmd;
//exec($cmd);

?>
