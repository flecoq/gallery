<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: multipart/form-data; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, GET, POST, FILES");
header("Allow: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$filename = "../../snapshot/slot.png";   

$source = realpath($filename);
$dest = realpath("../../library/material");
$cmd = '"C:/Program Files/ImageMagick-7.0.10-Q16-HDRI/magick.exe" -size 300x300 xc:rgba(255,255,255,0.5) ( '.$source.' -crop 300x300+615+140 ) -composite '.$dest.'\\pbr.png';
//exec($cmd);
print $cmd;
?>
