<?php
$data = json_decode(file_get_contents("php://input"));
include "database.php";
$sql = "UPDATE creationgroup SET
id ='$data->id',  parent ='$data->parent',
content ='$data->content'
WHERE id = '$data->id' AND parent = '$data->parent'";
$qry = $conn->query($sql);
echo $qry;
$conn->close();
?>