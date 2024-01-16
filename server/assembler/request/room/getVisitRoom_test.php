<?php
include "../database.php";
$data = json_decode(file_get_contents("php://input"));
$response = "{
   \"id\" : \"$1\",
   \"parent\" : \"$2\",
   \"status\" : \"$3\",
   \"accessing\" : \"$4\",
   \"content\" : $5,
   \"ProcessGroup\" : {
      \"Process\" : [ $6 
   ]},
   \"CreationGroup\" : $7
}";
$id = 1;
$result = $conn->query("SELECT * FROM room WHERE id = $id");
if ($result->num_rows == 1) {
    $row = $result->fetch_assoc();
	$parent = $row['parent'];
 	$response = str_replace('$1', $row['id'], $response);
 	$response = str_replace('$2', $parent, $response);
 	$response = str_replace('$3', $row['status'], $response);
 	$response = str_replace('$4', $row['accessing'], $response);
 	$response = str_replace('$5', $row['content'], $response);
	$result = $conn->query("SELECT * FROM creationgroup WHERE parent = $parent");
	if ($result->num_rows == 1) {
		$row = $result->fetch_assoc();
		$response = str_replace('$7', $row['content'], $response);
		$result = $conn->query("SELECT * FROM process WHERE parent = $id");
		$processGroup = '';
		$count = 0;
		while($row = $result->fetch_assoc()) {
			if( $count > 0 ) {
				$processGroup = $processGroup.',';
			}
			$processGroup = $processGroup.$row['content'];
			$count++;
		}
		$response = str_replace('$6', $processGroup, $response);
		echo $response;
	}
} else {
    echo "null";
}
$conn->close();
?>
