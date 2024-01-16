<?php
include "../database.php";
$data = json_decode(file_get_contents("php://input"));
$response = "{
   \"id\" : \"$1\",
   \"login\" : \"$2\",
   \"password\" : \"$3\",
   \"email\" : \"$4\",
   \"profil\" : \"$5\",
   \"content\" : $6,
   \"Room\" : [ $7 
   ],
   \"CreationGroup\" : $8
}";

$result = $conn->query("SELECT * FROM account WHERE id = $data->id");
if ($result->num_rows == 1) {
    $row = $result->fetch_assoc();
 	$response = str_replace('$1', $row['id'], $response);
 	$response = str_replace('$2', $row['login'], $response);
 	$response = str_replace('$3', $row['password'], $response);
 	$response = str_replace('$4', $row['email'], $response);
 	$response = str_replace('$5', $row['profil'], $response);
 	$response = str_replace('$6', $row['content'], $response);
	$result = $conn->query("SELECT * FROM creationgroup WHERE parent = $data->id");
	if ($result->num_rows == 1) {
		$row = $result->fetch_assoc();
		$response = str_replace('$8', $row['content'], $response);
		$result = $conn->query("SELECT * FROM room WHERE parent = $data->id");
		$roomList = '';
		$count = 0;
		while($row = $result->fetch_assoc()) {
			if( $count > 0 ) {
				$roomList = $roomList.',';
			}
			$roomResponse = "{
   \"id\" : \"$1\",
   \"parent\" : \"$2\",
   \"status\" : \"$3\",
   \"accessing\" : \"$4\",
   \"content\" : $5
}";
			$roomResponse = str_replace('$1', $row['id'], $roomResponse);
			$roomResponse = str_replace('$2', $row['parent'], $roomResponse);
			$roomResponse = str_replace('$3', $row['status'], $roomResponse);
			$roomResponse = str_replace('$4', $row['accessing'], $roomResponse);
			$roomResponse = str_replace('$5', $row['content'], $roomResponse);
			$roomList = $roomList.$roomResponse;
			$count++;
		}
		$response = str_replace('$7', $roomList, $response);
		echo $response;
	}
} else {
    echo "null";
}
$conn->close();
?>
