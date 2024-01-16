<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "assembler-v2";
/*$servername = "db562433911.db.1and1.com";
$username = "dbo562433911";
$password = "tHorign#1973";
$dbname = "db562433911";*/
$conn = new mysqli($servername, $username, $password, $dbname);
?>
