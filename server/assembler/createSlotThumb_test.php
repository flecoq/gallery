<?php
$source = realpath("snapshot.png");
$dest = realpath("thumb");
$cmd = '"C:/Program Files/ImageMagick-7.0.10-Q16-HDRI/magick.exe" -size 300x300 xc:rgba(255,255,255,0.5) ( '.$source.' -crop 300x300+615+140 ) -composite '.$dest.'\\output.png';
$result = exec($cmd, $output, $return_var);
//exec("C:/Program Files/VideoLAN/VLC/vlc.exe");
echo $cmd."<br>";
echo $return_var."<br>";
echo $result."<br>";
print_r($output);
?>
