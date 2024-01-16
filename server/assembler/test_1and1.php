<?php
  $host_name = 'db562433911.db.1and1.com';
  $database = 'db562433911';
  $user_name = 'dbo562433911';
  $password = 'tHorign#1973';

  $link = new mysqli($host_name, $user_name, $password, $database);

  if ($link->connect_error) {
    die('<p>La connexion au serveur MySQL a échoué: '. $link->connect_error .'</p>');
  } else {
    echo '<p>Connexion au serveur MySQL établie avec succès.</p>';
  }
?>