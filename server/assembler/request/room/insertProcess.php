<?php
$data = json_decode(file_get_contents("php://input"));
include "../database.php";
$sql = "insert into process (parent, content) values ('$data->parent', '$data->content')";
$qry = $conn->query($sql);
echo $conn->insert_id;
$conn->close();
?>
