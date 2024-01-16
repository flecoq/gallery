<?php
$data = json_decode(file_get_contents("php://input"));
include "../database.php";
$sql = "UPDATE process SET content = '$data->content' WHERE id = $data->id AND parent = $data->parent";
$qry = $conn->query($sql);
echo $qry;
$conn->close();
?>
