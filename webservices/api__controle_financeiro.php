<?php
	require_once 'db_config.php';
	class ControleFinanceiro {
		/*------------------------------------------- CONTAS --------------------------------------------*/
		/*
			Retorna a lista de contas do usuario.
		*/
		public static function get_contas($params = [], $id_usuario = ''){
			$result = [];
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			$mysqli->set_charset('utf8');
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$result_raw = $mysqli->query("SELECT cfc.* FROM cf__conta cfc WHERE cfc.id_usuario='{$id_usuario}' ORDER BY cfc.banco,cfc.numero,cfc.local");
			while($row = $result_raw->fetch_assoc()){
				$result[] = [
					'id' => $row['id'],
					'banco' => $row['banco'],
					'numero' => $row['numero'],
					'local' => $row['local'],
					'cor' => $row['cor']
				];
			}
			$result_raw->free();
			$mysqli->close();
			return ['status' => 1, 'data' => $result];
		}
		/*
			Insere uma nova conta para o usuario.
		*/
		public static function insert_contas($params = [], $id_usuario = ''){
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$stmt = $mysqli->prepare("INSERT INTO cf__conta (id_usuario,banco,numero,local,cor) VALUES (?,?,?,?,?)");
		 	$stmt->bind_param('issss', $id_usuario, $params['banco'], $params['numero'], $params['local'], $params['cor']);
		 	if ($stmt->execute()){
		 		$mysqli->close();
		 		return ['status' => 1];
		 	}
		 	else{
		 		if ($mysqli->errno === 1062){
		 			$mysqli->close();
		 			return ['status' => 0, 'error' => 'Conta já cadastrada.'];
		 		}
		 		$mysqli->close();
		 		return ['status' => 0, 'error' => 'Erro ao cadastrar essa Conta.'];
		 	}
		}
		/*
			Atualiza uma conta do usuario.
		*/
		public static function update_contas($params = [], $id_conta = '', $id_usuario = ''){
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$update_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
			//Prepara apenas os dados a serem atualizados
			foreach ($params as $data_name => $new_data_value){
				//Pula o ID da Conta
				if ($data_name === 'id')
					continue;
				$update_data['wildcards'] .= (($update_data['wildcards'] !== '') ? ',' : '') . "{$data_name}=?";
				$update_data['bind'] .= 's';
				$update_data['values'][] = $new_data_value;
			}
			$update_data['bind'] .= 'i';
			$update_data['values'][] = $id_conta;
			$stmt = $mysqli->prepare("UPDATE cf__conta SET {$update_data['wildcards']} WHERE id=? AND id_usuario='{$id_usuario}'");
			$stmt->bind_param($update_data['bind'], ...$update_data['values']);
		 	if ($stmt->execute()){
		 		$mysqli->close();
		 		return ['status' => 1];
		 	}
		 	else{
		 		if ($mysqli->errno == 1062){
		 			$mysqli->close();
		 			return ['status' => 0, 'error' => 'Essa Conta já existe.'];
		 		}
		 		$mysqli->close();
		 		return ['status' => 0, 'error' => 'Erro ao atualizar essa Conta.'];
		 	}
		}
		/*
			Remove uma conta e todos os lançamentos atrelados a ela do usuario.
		*/
		// public static function remove_contas($params = [], $id_usuario = ''){
		// 	mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
		// 	$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
		// 	if ($mysqli->connect_errno)
		// 		return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
		// 	$mysqli->begin_transaction();
		// 	try {
		// 		//Remove o ativo
		// 		$stmt = $mysqli->prepare("DELETE FROM cf__conta WHERE id=?");
		//  		$stmt->bind_param('i', $params['id']);
		// 		$stmt->execute();
		// 		$mysqli->commit();
		//  		$mysqli->close();
		//  		return ['status' => 1];
		// 	}
		// 	catch (mysqli_sql_exception $exception){
		// 		$mysqli->rollback();
		//  		$mysqli->close();
	 // 			return ['status' => 0, 'error' => 'Erro ao remover esta Conta.'];
		// 	}
		// }
		/*-------------------------------------- CARTÕES DE CRÉDITO -------------------------------------*/
		/*
			Retorna a lista de cartoes do usuario.
		*/
		public static function get_cartoes_credito($params = [], $id_usuario = ''){
			$result = [];
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			$mysqli->set_charset('utf8');
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$result_raw = $mysqli->query("SELECT cfcc.* FROM cf__cartao_credito cfcc WHERE cfcc.id_usuario='{$id_usuario}' ORDER BY cfcc.banco,cfcc.numero");
			while($row = $result_raw->fetch_assoc()){
				$result[] = [
					'id' => $row['id'],
					'banco' => $row['banco'],
					'numero' => $row['numero']
				];
			}
			$result_raw->free();
			$mysqli->close();
			return ['status' => 1, 'data' => $result];
		}
		/*
			Insere um novo cartão para o usuario.
		*/
		public static function insert_cartoes_credito($params = [], $id_usuario = ''){
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$stmt = $mysqli->prepare("INSERT INTO cf__cartao_credito (id_usuario,banco,numero) VALUES (?,?,?)");
		 	$stmt->bind_param('iss', $id_usuario, $params['banco'], $params['numero']);
		 	if ($stmt->execute()){
		 		$mysqli->close();
		 		return ['status' => 1];
		 	}
		 	else{
		 		if ($mysqli->errno === 1062){
		 			$mysqli->close();
		 			return ['status' => 0, 'error' => 'Cartão já cadastrado.'];
		 		}
		 		$mysqli->close();
		 		return ['status' => 0, 'error' => 'Erro ao cadastrar esse Cartão.'];
		 	}
		}
		/*
			Atualiza um cartão do usuario.
		*/
		public static function update_cartoes_credito($params = [], $id_conta = '', $id_usuario = ''){
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$update_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
			//Prepara apenas os dados a serem atualizados
			foreach ($params as $data_name => $new_data_value){
				//Pula o ID do Cartão
				if ($data_name === 'id')
					continue;
				$update_data['wildcards'] .= (($update_data['wildcards'] !== '') ? ',' : '') . "{$data_name}=?";
				$update_data['bind'] .= 's';
				$update_data['values'][] = $new_data_value;
			}
			$update_data['bind'] .= 'i';
			$update_data['values'][] = $id_conta;
			$stmt = $mysqli->prepare("UPDATE cf__cartao_credito SET {$update_data['wildcards']} WHERE id=? AND id_usuario='{$id_usuario}'");
			$stmt->bind_param($update_data['bind'], ...$update_data['values']);
		 	if ($stmt->execute()){
		 		$mysqli->close();
		 		return ['status' => 1];
		 	}
		 	else{
		 		if ($mysqli->errno == 1062){
		 			$mysqli->close();
		 			return ['status' => 0, 'error' => 'Esse Cartão já existe.'];
		 		}
		 		$mysqli->close();
		 		return ['status' => 0, 'error' => 'Erro ao atualizar esse Cartão.'];
		 	}
		}
		/*
			Remove uma conta e todos os lançamentos atrelados a ela do usuario.
		*/
		// public static function remove_contas($params = [], $id_usuario = ''){
		// 	mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
		// 	$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
		// 	if ($mysqli->connect_errno)
		// 		return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
		// 	$mysqli->begin_transaction();
		// 	try {
		// 		//Remove o ativo
		// 		$stmt = $mysqli->prepare("DELETE FROM cf__conta WHERE id=?");
		//  		$stmt->bind_param('i', $params['id']);
		// 		$stmt->execute();
		// 		$mysqli->commit();
		//  		$mysqli->close();
		//  		return ['status' => 1];
		// 	}
		// 	catch (mysqli_sql_exception $exception){
		// 		$mysqli->rollback();
		//  		$mysqli->close();
	 // 			return ['status' => 0, 'error' => 'Erro ao remover esta Conta.'];
		// 	}
		// }
	}
?>