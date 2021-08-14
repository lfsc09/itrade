<?php
	require_once "db_config.php";
	class RendaVariavel {
		/*----------------------------------------- ARCABOUCOS ------------------------------------------*/
		/*
			Retorna a lista de arcabouços do usuario.
		*/
		public static function get_arcaboucos($params = [], $id_usuario = ""){
			$result = [];
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			$mysqli->set_charset('utf8');
			if ($mysqli->connect_errno)
				return ["status" => 0, "error" => "Failed to connect to MySQL: " . $mysqli->connect_errno];
			$result_raw = $mysqli->query("SELECT rva.*,crva_u.qtd_usuarios FROM rv__arcabouco rva INNER JOIN rv__arcabouco__usuario rva_u ON rva.id=rva_u.id_arcabouco INNER JOIN (SELECT COUNT(_rva_u.id_arcabouco) AS qtd_usuarios,_rva_u.id_arcabouco FROM rv__arcabouco__usuario _rva_u GROUP BY _rva_u.id_arcabouco) crva_u ON rva.id=crva_u.id_arcabouco WHERE rva_u.id_usuario='{$id_usuario}' ORDER BY rva.id DESC");
			while($row = $result_raw->fetch_assoc()){
				$result[] = [
					"id" => $row["id"],
					"nome" => $row["nome"],
					"criador" => ($row["id_usuario_criador"] == $id_usuario)?1:0,
					"qtd_usuarios" => $row["qtd_usuarios"]
				];
			}
			$result_raw->free();
			$mysqli->close();
			return ["status" => 1, "data" => $result];
		}
		/*
			Insere um novo arcabouço para o usuario.
		*/
		public static function insert_arcaboucos($params = [], $id_usuario = ""){
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ["status" => 0, "error" => "Failed to connect to MySQL: " . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try {
				//Cria o arcabouço
				$stmt = $mysqli->prepare("INSERT INTO rv__arcabouco (id_usuario_criador,nome) VALUES (?,?)");
			 	$stmt->bind_param("is", $id_usuario, $params["nome"]);
				$stmt->execute();
				$id_arcabouco = $mysqli->insert_id;
				//Me adiciona como usuario do arcabouço
				$mysqli->query("INSERT INTO rv__arcabouco__usuario (id_arcabouco,id_usuario) VALUES ('{$id_arcabouco}','{$id_usuario}')");
				$mysqli->commit();
		 		$mysqli->close();
		 		return ["status" => 1];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
				if ($exception->getCode() === 1062)
					$error = "Arcabouço já cadastrado.";
				else
					$error = "Erro ao cadastrar este Arcabouço.";
		 		$mysqli->close();
	 			return ["status" => 0, "error" => $error];
			}
		}
		/*
			Atualiza um arcabouco para do usuario.
		*/
		public static function update_arcaboucos($params = [], $id_arcaboucos = "", $id_usuario = ""){
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ["status" => 0, "error" => "Failed to connect to MySQL: " . $mysqli->connect_errno];
			$update_data = ["wildcards" => "", "values" => [], "bind" => ""];
			//Prepara apenas os dados a serem atualizados
			foreach ($params as $data_name => $new_data_value){
				//Pula o ID do Arcabouco
				if ($data_name === "id")
					continue;
				$update_data["wildcards"] .= (($update_data["wildcards"] !== "")?",":"")."{$data_name}=?";
				$update_data["bind"] .= ($data_name === "nome")?"s":"d";
				$update_data["values"][] = &$params[$data_name];
			}
			$update_data["bind"] .= "i";
			$update_data["values"][] = &$id_arcaboucos;
			$stmt = $mysqli->prepare("UPDATE rv__arcabouco SET {$update_data["wildcards"]} WHERE id=? AND id_usuario_criador='{$id_usuario}'");
			call_user_func_array(array($stmt, "bind_param"), array_merge([$update_data["bind"]], $update_data["values"]));
		 	if ($stmt->execute()){
		 		$mysqli->close();
		 		return ["status" => 1];
		 	}
		 	else{
		 		if ($mysqli->errno == 1062){
		 			$mysqli->close();
		 			return ["status" => 0, "error" => "Esse Arcabouço já existe."];
		 		}
		 		$mysqli->close();
		 		return ["status" => 0, "error" => "Erro ao atualizar esse Arcabouço."];
		 	}
		}
		/*------------------------------------------ CENÁRIOS -------------------------------------------*/
		/*
			Retorna a lista de cenarios do usuario.
		*/
		public static function get_cenarios($params = [], $id_usuario = ""){
			$result = [];
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			$mysqli->set_charset('utf8');
			if ($mysqli->connect_errno)
				return ["status" => 0, "error" => "Failed to connect to MySQL: " . $mysqli->connect_errno];
			if (array_key_exists("id", $params)){
				$stmt = $mysqli->prepare("SELECT rvc.* FROM rv__cenario rvc INNER JOIN rv__arcabouco__usuario rva_u ON rvc.id_arcabouco=rva_u.id_arcabouco WHERE rva_u.id_usuario='{$id_usuario}' AND rvc.id=? AND rvc.id_arcabouco=? ORDER BY rvc.nome");
			 	$stmt->bind_param("ii", $params["id"], $params["id_arcabouco"]);
			}
			else{
				$stmt = $mysqli->prepare("SELECT rvc.* FROM rv__cenario rvc INNER JOIN rv__arcabouco__usuario rva_u ON rvc.id_arcabouco=rva_u.id_arcabouco WHERE rva_u.id_usuario='{$id_usuario}' AND rvc.id_arcabouco=? ORDER BY rvc.nome");
			 	$stmt->bind_param("i", $params["id_arcabouco"]);
			 }
		 	$stmt->execute();
		 	$result_raw = $stmt->get_result();
			while($row = $result_raw->fetch_assoc()){
				$result[] = [
					"id" => $row["id"],
					"nome" => $row["nome"]
				];
			}
			$stmt->free_result();
			foreach ($result as $i => $cenario){
				$result[$i]["premissas"] = [];
				$result_raw = $mysqli->query("SELECT rvcp.* FROM rv__cenario_premissa rvcp WHERE rvcp.id_cenario='{$cenario["id"]}' ORDER BY rvcp.nome ASC");
				while($row = $result_raw->fetch_assoc()){
					$result[$i]["premissas"][] = [
						"id" => $row["id"],
						"inativo" => $row["inativo"],
						"obrigatoria" => $row["obrigatoria"],
						"cor" => $row["cor"],
						"nome" => $row["nome"]
					];
				}
				$result_raw->free();
				$result[$i]["observacoes"] = [];
				$result_raw = $mysqli->query("SELECT rvco.* FROM rv__cenario_obs rvco WHERE rvco.id_cenario='{$cenario["id"]}' ORDER BY rvco.nome ASC");
				while($row = $result_raw->fetch_assoc()){
					$result[$i]["observacoes"][] = [
						"id" => $row["id"],
						"inativo" => $row["inativo"],
						"cor" => $row["cor"],
						"nome" => $row["nome"]
					];
				}
				$result_raw->free();
			}
			$mysqli->close();
			return ["status" => 1, "data" => $result];
		}
		/*
			Insere um novo Cenario com suas (Premissas / Observacoes) no arcabouco de um usuario.
		*/
		public static function insert_cenarios($params = [], $id_usuario = ""){
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ["status" => 0, "error" => "Failed to connect to MySQL: " . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try {
				//Cria o arcabouço
				$stmt = $mysqli->prepare("INSERT INTO rv__cenario (id_arcabouco,nome) VALUES (?,?)");
			 	$stmt->bind_param("is", $params["id_arcabouco"], $params["nome"]);
				$stmt->execute();
				$id_cenario = $mysqli->insert_id;
				//Adicionar agora as premissas se houver
				if (array_key_exists("premissas", $params)){
					foreach ($params["premissas"] as $premissa){
						$stmt = $mysqli->prepare("INSERT INTO rv__cenario_premissa (id_cenario,obrigatoria,cor,nome,inativo) VALUES ('{$id_cenario}',?,?,?,?)");
				 		$stmt->bind_param("issi", $premissa["obrigatoria"], $premissa["cor"], $premissa["nome"], $premissa["inativo"]);
						$stmt->execute();
					}
				}
				if (array_key_exists("observacoes", $params)){
					//Adicionar agora as observacoes se houver
					foreach ($params["observacoes"] as $obs){
						$stmt = $mysqli->prepare("INSERT INTO rv__cenario_obs (id_cenario,cor,nome,inativo) VALUES ('{$id_cenario}',?,?,?)");
				 		$stmt->bind_param("ssi", $obs["cor"], $obs["nome"], $obs["inativo"]);
						$stmt->execute();
					}
				}
				$mysqli->commit();
		 		$mysqli->close();
		 		return ["status" => 1, "data" => ["id" => $id_cenario, "id_arcabouco" => $params["id_arcabouco"]]];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
				if ($exception->getCode() === 1062)
					$error = "Cenário já cadastrado ou existem Premissas/Observações duplicadas.";
				else
					$error = "Erro ao cadastrar este cenário.";
		 		$mysqli->close();
	 			return ["status" => 0, "error" => $error];
			}
		}
		/*
			Altera um Cenario e/ou Adiciona/Altera/Remove (Premissas / Observacoes) do arcabouco de um usuario.
		*/
		public static function update_cenarios($params = [], $id_usuario = ""){
			$place = 0;
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ["status" => 0, "error" => "Failed to connect to MySQL: " . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try {
				if (!empty($params["insert"]["premissas"])){
					$place = 1;
					foreach ($params["insert"]["premissas"] as $premissa){
						$stmt = $mysqli->prepare("INSERT INTO rv__cenario_premissa (id_cenario,obrigatoria,cor,nome,inativo) VALUES (?,?,?,?,?)");
				 		$stmt->bind_param("iissi", $params["id_cenario"], $premissa["obrigatoria"], $premissa["cor"], $premissa["nome"], $premissa["inativo"]);
						$stmt->execute();
					}
				}
				if (!empty($params["insert"]["observacoes"])){
					$place = 2;
					foreach ($params["insert"]["observacoes"] as $obs){
						$stmt = $mysqli->prepare("INSERT INTO rv__cenario_obs (id_cenario,cor,nome,inativo) VALUES (?,?,?,?)");
				 		$stmt->bind_param("issi", $params["id_cenario"], $obs["cor"], $obs["nome"], $obs["inativo"]);
						$stmt->execute();
					}
				}
				if (!empty($params["update"]["cenarios"])){
					$place = 3;
					foreach ($params["update"]["cenarios"] as $cenario){
						$update_data = ["wildcards" => "", "values" => [], "bind" => ""];
						//Prepara apenas os dados a serem atualizados
						foreach ($cenario as $data_name => $new_data_value){
							//Pula o ID do Cenario
							if ($data_name === "id")
								continue;
							$update_data["wildcards"] .= (($update_data["wildcards"] !== "")?",":"")."{$data_name}=?";
							$update_data["bind"] .= ($data_name === "nome")?"s":"i";
							$update_data["values"][] = &$cenario[$data_name];
						}
						$update_data["bind"] .= "i";
						$update_data["values"][] = &$params["id_cenario"];
						$stmt = $mysqli->prepare("UPDATE rv__cenario SET {$update_data["wildcards"]} WHERE id=?");
						call_user_func_array(array($stmt, "bind_param"), array_merge([$update_data["bind"]], $update_data["values"]));
						$stmt->execute();
					}
				}
				if (!empty($params["update"]["premissas"])){
					$place = 4;
					foreach ($params["update"]["premissas"] as $premissa){
						$update_data = ["wildcards" => "", "values" => [], "bind" => ""];
						//Prepara apenas os dados a serem atualizados
						foreach ($premissa as $data_name => $new_data_value){
							//Pula o ID da Premissa
							if ($data_name === "id")
								continue;
							$update_data["wildcards"] .= (($update_data["wildcards"] !== "")?",":"")."{$data_name}=?";
							$update_data["bind"] .= ($data_name === "nome" || $data_name === "cor")?"s":"i";
							$update_data["values"][] = &$premissa[$data_name];
						}
						$update_data["bind"] .= "i";
						$update_data["values"][] = &$premissa["id"];
						$stmt = $mysqli->prepare("UPDATE rv__cenario_premissa SET {$update_data["wildcards"]} WHERE id=?");
						call_user_func_array(array($stmt, "bind_param"), array_merge([$update_data["bind"]], $update_data["values"]));
						$stmt->execute();
					}
				}
				if (!empty($params["update"]["observacoes"])){
					$place = 5;
					foreach ($params["update"]["observacoes"] as $observacao){
						$update_data = ["wildcards" => "", "values" => [], "bind" => ""];
						//Prepara apenas os dados a serem atualizados
						foreach ($observacao as $data_name => $new_data_value){
							//Pula o ID da Observacao
							if ($data_name === "id")
								continue;
							$update_data["wildcards"] .= (($update_data["wildcards"] !== "")?",":"")."{$data_name}=?";
							$update_data["bind"] .= ($data_name === "nome" || $data_name === "cor")?"s":"i";
							$update_data["values"][] = &$observacao[$data_name];
						}
						$update_data["bind"] .= "i";
						$update_data["values"][] = &$observacao["id"];
						$stmt = $mysqli->prepare("UPDATE rv__cenario_obs SET {$update_data["wildcards"]} WHERE id=?");
						call_user_func_array(array($stmt, "bind_param"), array_merge([$update_data["bind"]], $update_data["values"]));
						$stmt->execute();
					}
				}
				if (!empty($params["remove"]["premissas"])){
					$place = 6;
					foreach ($params["remove"]["premissas"] as $premissa){
						//Remove a premissa
						$stmt = $mysqli->prepare("DELETE FROM rv__cenario_premissa WHERE id=?");
				 		$stmt->bind_param("i", $premissa["id"]);
						$stmt->execute();
					}
				}
				if (!empty($params["remove"]["observacoes"])){
					$place = 7;
					foreach ($params["remove"]["observacoes"] as $observacao){
						//Remove a observacao
						$stmt = $mysqli->prepare("DELETE FROM rv__cenario_obs WHERE id=?");
				 		$stmt->bind_param("i", $observacao["id"]);
						$stmt->execute();
					}
				}
				$mysqli->commit();
		 		$mysqli->close();
		 		return ["status" => 1, "data" => ["id" => $params["id_cenario"], "id_arcabouco" => $params["id_arcabouco"]]];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
				if ($exception->getCode() === 1062){
					if ($place === 1 || $place === 4)
						$error = "Essa premissa já está cadastrada neste cenário.";
					else if ($place === 2 || $place === 5)
						$error = "Essa observação já está cadastrada neste cenário.";
					else if ($place === 3)
						$error = "Já existe um cenário com esse nome neste arcabouço.";
				}
				else{
					if ($place === 1)
						$error = "Erro no cadastro de novas premissas.";
					else if ($place === 2)
						$error = "Erro no cadastro de novas observações.";
					else if ($place === 3)
						$error = "Erro na atualização de cenários.";
					else if ($place === 4)
						$error = "Erro na atualização de premissas.";
					else if ($place === 5)
						$error = "Erro na atualização de observações.";
					else if ($place === 6)
						$error = "Erro na remoção de premissas.";
					else if ($place === 7)
						$error = "Erro na remoção de observações.";
				}
		 		$mysqli->close();
	 			return ["status" => 0, "error" => $error];
			}
		}
		/*
			Remove um Cenario e suas (Premissas / Observacoes) no arcabouco de um usuario.
		*/
		public static function remove_cenarios($params = [], $id_usuario = ""){
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ["status" => 0, "error" => "Failed to connect to MySQL: " . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try {
				//Remove o cenario
				$stmt = $mysqli->prepare("DELETE FROM rv__cenario WHERE id=?");
		 		$stmt->bind_param("i", $params["id"]);
				$stmt->execute();
				//Remove as premissas
				$stmt = $mysqli->prepare("DELETE FROM rv__cenario_premissa WHERE id_cenario=?");
		 		$stmt->bind_param("i", $params["id"]);
				$stmt->execute();
				//Remove as observacoes
				$stmt = $mysqli->prepare("DELETE FROM rv__cenario_obs WHERE id_cenario=?");
		 		$stmt->bind_param("i", $params["id"]);
				$stmt->execute();
				$mysqli->commit();
		 		$mysqli->close();
		 		return ["status" => 1];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
		 		$mysqli->close();
	 			return ["status" => 0, "error" => "Erro ao remover este cenário."];
			}
		}
	}
?>