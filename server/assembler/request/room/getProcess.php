<?php
$data = json_decode(file_get_contents("php://input"));
include "../database.php";
$sql = "SELECT * FROM process WHERE id = '$data->id'";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
 		echo $row['content'];
    }
} else {
    echo "null";
}
$conn->close();
?>
