<?php
$data = json_decode(file_get_contents("php://input"));
include "database.php";
$response = "{
   \"id\" : \"$1\",
   \"parent\" : \"$2\",
   \"title\" : \"$3\",
   \"description\" : \"$4\",
   \"ProcessGroup\" : {
      \"Process\" : [ $5 
   ]},
   \"CreationGroup\" : $6
}";
$result = $conn->query("SELECT * FROM room WHERE id = '$data->id'");
if ($result->num_rows == 1) {
    $row = $result->fetch_assoc();
 	$response = str_replace('$1', $row['id'], $response);
 	$response = str_replace('$2', $row['parent'], $response);
 	$response = str_replace('$3', $row['title'], $response);
 	$response = str_replace('$4', $row['description'], $response);
	$result = $conn->query("SELECT * FROM creationgroup WHERE parent = '$data->id'");
	if ($result->num_rows == 1) {
		$row = $result->fetch_assoc();
		$response = str_replace('$6', $row['content'], $response);
		$result = $conn->query("SELECT * FROM process WHERE parent = '$data->id'");
		$processGroup = '';
		$count = 0;
		while($row = $result->fetch_assoc()) {
			if( $count > 0 ) {
				$processGroup = $processGroup.',';
			}
			$processGroup = $processGroup.$row['content'];
			$count++;
		}
		$response = str_replace('$5', $processGroup, $response);
		echo $response;
	}
} else {
    echo "null";
}
$conn->close();
?>
