<?php
	session_start();
	if (!isset($_SESSION["username"])){
		require "api__login.php";
		$aut_user = (array_key_exists("user", $_POST))?$_POST["user"]:"";
		$aut_pass = (array_key_exists("pass", $_POST))?$_POST["pass"]:"";
		$userdata = Login::autorize($aut_user, $aut_pass);
		if (!empty($userdata)){
			$_SESSION["id"] = $userdata["id"];
			$_SESSION["name"] = $userdata["nome"];
			$_SESSION["username"] = $userdata["usuario"];
		}
	}
	echo "";
?>