<?php
	require "db_config.php";
	class Ativos {
		/*
			Retorna a lista de ativos do usuario.
		*/
		public static function get_ativos($params = [], $id_usuario){
			$result = [];
			$mysqli = mysqli_connect(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			$mysqli->set_charset('utf8');
			if ($mysqli->connect_errno)
				return ["status" => 0, "error" => "Failed to connect to MySQL: " . $mysqli->connect_errno];
			$result_raw = $mysqli->query("SELECT a.* FROM ativos a WHERE a.id_usuario='{$id_usuario}' ORDER BY a.nome");
			while($row = $result_raw->fetch_assoc())
				$result[] = $row;
			$result_raw->free();
			$mysqli->close();
			return ["status" => 1, "data" => $result];
		}
		/*
			Insere um novo ativo para o usuario.
		*/
		public static function insert_ativos($params = []){
			$mysqli = mysqli_connect(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ["status" => 0, "error" => "Failed to connect to MySQL: " . $mysqli->connect_errno];
			$stmt = $mysqli->prepare("INSERT INTO ativos (id_usuario,nome,custo,valor_pt,tick) VALUES (?,UPPER(?),?,?,?)");
		 	$stmt->bind_param("isddd", $params["id_usuario"], $params["nome"], $params["custo"], $params["valor_pt"], $params["tick"]);
		 	if ($stmt->execute())
		 		return ["status" => 1];
		 	else{
		 		if ($mysqli->errno == 1062)
		 			return ["status" => 0, "error" => "Ativo já cadastrado."];
		 		return ["status" => 0, "error" => "Erro ao cadastrar esse Ativo."];
		 	}
		}
	}
?>