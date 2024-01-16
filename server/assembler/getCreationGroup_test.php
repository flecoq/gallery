<?php
include "database.php";
//$sql = "SELECT * FROM creationgroup WHERE 1";
$sql = "SELECT * FROM creationgroup WHERE id = '1'";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
 		echo $row['content'];
    }
} else {
    echo "null";
}
$conn->close();
?>
