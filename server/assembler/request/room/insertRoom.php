<?php
$data = json_decode(file_get_contents("php://input"));
include "../database.php";
$sql = "insert into room (parent, status, accessing, content) values ('$data->parent', '$data->accessing', '$data->status', '$data->content')";
$qry = $conn->query($sql);
echo $conn->insert_id;
$conn->close();
?>
