<?php
$data = json_decode(file_get_contents("php://input"));
include "database.php";
$id = "3";
$parent = "3";
$content = "content";
$sql = "UPDATE process SET
id ='$id',  parent ='$parent',
content ='$content'
WHERE id = '$id' AND parent = '$parent'";
$qry = $conn->query($sql);
$conn->close();
?>
