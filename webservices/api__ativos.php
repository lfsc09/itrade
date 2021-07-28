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
		 	if ($stmt->execute()){
		 		$mysqli->close();
		 		return ["status" => 1];
		 	}
		 	else{
		 		if ($mysqli->errno == 1062){
		 			$mysqli->close();
		 			return ["status" => 0, "error" => "Ativo já cadastrado."];
		 		}
		 		$mysqli->close();
		 		return ["status" => 0, "error" => "Erro ao cadastrar esse Ativo."];
		 	}
		}
		/*
			Atualiza um novo ativo para do usuario.
		*/
		public static function update_ativos($params = [], $id_ativo = ""){
			$mysqli = mysqli_connect(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ["status" => 0, "error" => "Failed to connect to MySQL: " . $mysqli->connect_errno];
			$update_data = ["wildcards" => "", "values" => [], "bind" => ""];
			//Prepara apenas os dados a serem atualizados
			foreach ($params as $data_name => $new_data_value){
				//Pula o ID do Ativo
				if ($data_name === "id")
					continue;
				$update_data["wildcards"] .= (($update_data["wildcards"] !== "")?",":"")."{$data_name}=?";
				$update_data["bind"] .= ($data_name === "nome")?"s":"d";
				$update_data["values"][] = &$params[$data_name];
			}
			$update_data["bind"] .= "i";
			$update_data["values"][] = &$id_ativo;
			$stmt = $mysqli->prepare("UPDATE ativos SET {$update_data["wildcards"]} WHERE id=?");
			call_user_func_array(array($stmt, "bind_param"), array_merge([$update_data["bind"]], $update_data["values"]));
		 	// $stmt->bind_param($update_data["bind"], $update_data["values"]);
		 	if ($stmt->execute()){
		 		$mysqli->close();
		 		return ["status" => 1];
		 	}
		 	else{
		 		if ($mysqli->errno == 1062){
		 			$mysqli->close();
		 			return ["status" => 0, "error" => "Esse ativo já existe."];
		 		}
		 		$mysqli->close();
		 		return ["status" => 0, "error" => "Erro ao atualizar esse Ativo."];
		 	}
		}
	}
?>