<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: multipart/form-data; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, GET, POST, FILES");
header("Allow: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$data = json_decode(file_get_contents("php://input"));
$img = str_replace('data:image/png;base64,', '', $data->content);   
$img = str_replace(' ', '+', $img);   
$content = base64_decode($img);
$filename = "../../snapshot/support.png";   
$success = file_put_contents($filename, $content);

$source = realpath($filename);
$dest = realpath("../../user/thumb/support");
$width = $data->width;
$height = $data->height;
$size = $height."x".$height;
$offset = ($width - $height)/2;
$crop = $size."+".$offset."+0";
$cmd = '"C:/Program Files/ImageMagick-7.0.10-Q16-HDRI/magick.exe" -size '.$size.' xc:rgba(255,255,255,0.25) ( '.$source.' -crop '.$crop.' ) -composite '.$dest.'\\'.$data->filename.'.png';
exec($cmd);

print $success ? $data->filename : 'Unable to save the file.';
?>
