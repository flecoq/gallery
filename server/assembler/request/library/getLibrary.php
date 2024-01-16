<?php
include "../database.php";
$response = "{
   \"ProcessGroup\" : {
      \"Process\" : [ $1 
   ]},
   \"CreationGroup\" : [ $2 ]
}";
$result = $conn->query("SELECT * FROM library WHERE 1");
$processGroup = '';
$processCount = 0;
$creationGroup = '';
$creationCount = 0;
while($row = $result->fetch_assoc()) {
	$type = $row['type'];
	if( $type == "picture" || $type == "texture" ) {
		if( $creationCount > 0 ) {
			$creationGroup = $creationGroup.',';
		}
		$creationGroup = $creationGroup.$row['content'];
		$creationCount++;
	} else {
		if( $processCount > 0 ) {
			$processGroup = $processGroup.',';
		}
		$processGroup = $processGroup.$row['content'];
		$processCount++;
	}
}
$response = str_replace('$1', $processGroup, $response);
$response = str_replace('$2', $creationGroup, $response);
echo $response;
$conn->close();
?>
