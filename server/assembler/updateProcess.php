<?php
$data = json_decode(file_get_contents("php://input"));
include "database.php";
$sql = "UPDATE process SET
id ='$data->id',  parent ='$data->parent',
content ='$data->content'
WHERE id = '$data->id' AND parent = '$data->parent'";
//$sql = "INSERT INTO `process` (`id`, `parent`, `content`) VALUES ('4', '4', 'content');"
$qry = $conn->query($sql);
echo $qry;
$conn->close();
?>
