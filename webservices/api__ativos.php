<?php
	require_once 'db_config.php';
	class Ativos {
		/*
			Retorna a lista de ativos do usuario.
		*/
		public static function get_ativos($params = [], $id_usuario = ''){
			$result = [];
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			$mysqli->set_charset('utf8');
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$result_raw = $mysqli->query("SELECT a.* FROM ativos a WHERE a.id_usuario='{$id_usuario}' ORDER BY a.nome");
			while($row = $result_raw->fetch_assoc()){
				$result[] = [
					'id' => $row['id'],
					'nome' => $row['nome'],
					'custo' => $row['custo'],
					'valor_tick' => $row['valor_tick'],
					'pts_tick' => $row['pts_tick']
				];
			}
			$result_raw->free();
			$mysqli->close();
			return ['status' => 1, 'data' => $result];
		}
		/*
			Insere um novo ativo para o usuario.
		*/
		public static function insert_ativos($params = [], $id_usuario = ''){
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$stmt = $mysqli->prepare("INSERT INTO ativos (id_usuario,nome,custo,valor_tick,pts_tick) VALUES (?,UPPER(?),?,?,?)");
		 	$stmt->bind_param('isddd', $id_usuario, $params['nome'], $params['custo'], $params['valor_tick'], $params['pts_tick']);
		 	if ($stmt->execute()){
		 		$mysqli->close();
		 		return ['status' => 1];
		 	}
		 	else{
		 		if ($mysqli->errno === 1062){
		 			$mysqli->close();
		 			return ['status' => 0, 'error' => 'Ativo já cadastrado.'];
		 		}
		 		$mysqli->close();
		 		return ['status' => 0, 'error' => 'Erro ao cadastrar esse Ativo.'];
		 	}
		}
		/*
			Atualiza um ativo para do usuario.
		*/
		public static function update_ativos($params = [], $id_ativo = '', $id_usuario = ''){
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$update_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
			//Prepara apenas os dados a serem atualizados
			foreach ($params as $data_name => $new_data_value){
				//Pula o ID do Ativo
				if ($data_name === 'id')
					continue;
				$update_data['wildcards'] .= (($update_data['wildcards'] !== '') ? ',' : '') . "{$data_name}=?";
				$update_data['bind'] .= ($data_name === 'nome') ? 's' : 'd';
				$update_data['values'][] = $new_data_value;
			}
			$update_data['bind'] .= 'i';
			$update_data['values'][] = $id_ativo;
			$stmt = $mysqli->prepare("UPDATE ativos SET {$update_data['wildcards']} WHERE id=? AND id_usuario='{$id_usuario}'");
			$stmt->bind_param($update_data['bind'], ...$update_data['values']);
		 	if ($stmt->execute()){
		 		$mysqli->close();
		 		return ['status' => 1];
		 	}
		 	else{
		 		if ($mysqli->errno == 1062){
		 			$mysqli->close();
		 			return ['status' => 0, 'error' => 'Esse Ativo já existe.'];
		 		}
		 		$mysqli->close();
		 		return ['status' => 0, 'error' => 'Erro ao atualizar esse Ativo.'];
		 	}
		}
	}
?>