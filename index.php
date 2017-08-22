<?php

$ip = $_SERVER['REMOTE_ADDR']; 
$f = fopen("ip.html", "a"); 
fwrite ($f, 'IP: [<b><font color="#005700">'.$ip.'</font></b>]<br>');
fclose($f);

header("Location: index2.html");
?>
