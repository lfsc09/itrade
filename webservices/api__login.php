<?php
	require "db_config.php";
	class Login {
		/*
			Retorna a lista de ativos do usuario.
		*/
		public static function autorize($user, $pass){
			$result = [];
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			$mysqli->set_charset('utf8');
			if ($mysqli->connect_errno)
				return [];
			$stmt = $mysqli->prepare("SELECT u.* FROM usuario u WHERE u.usuario=? AND u.senha=?");
		 	$stmt->bind_param("ss", $user, $pass);
		 	$stmt->execute();
		 	$result_raw = $stmt->get_result();
		 	$result = $result_raw->fetch_assoc();
		 	$stmt->free_result();
			$mysqli->close();
			return $result;
		}
		/*
			Destroi a sessao do usuario.
		*/
		public static function logout(){
			session_destroy();
			return true;
		}
	}
?>