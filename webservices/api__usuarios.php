<?php
	require_once "db_config.php";
	class Usuarios {
		/*
			Retorna a lista de usuários no sistema.
		*/
		public static function get_usuarios($params = []){
			$result = [];
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			$mysqli->set_charset('utf8');
			if ($mysqli->connect_errno)
				return ["status" => 0, "error" => "Failed to connect to MySQL: " . $mysqli->connect_errno];
			$result_raw = $mysqli->query("SELECT u.* FROM usuario u ORDER BY u.usuario");
			while($row = $result_raw->fetch_assoc()){
				$result[] = [
					"id" => $row["id"],
					"usuario" => $row["usuario"],
					"nome" => $row["nome"]
				];
			}
			$result_raw->free();
			$mysqli->close();
			return ["status" => 1, "data" => $result];
		}
	}
?>