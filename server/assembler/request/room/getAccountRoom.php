<?php
include "../database.php";
$data = json_decode(file_get_contents("php://input"));
$response = "{
   \"ProcessGroup\" : {
      \"Process\" : [ $1 
   ]}
}";
$result = $conn->query("SELECT * FROM process WHERE parent = $data->id");
$processGroup = '';
$count = 0;
while($row = $result->fetch_assoc()) {
	if( $count > 0 ) {
		$processGroup = $processGroup.',';
	}
	$processGroup = $processGroup.$row['content'];
	$count++;
}
$response = str_replace('$1', $processGroup, $response);
echo $response;
$conn->close();
?>
