<?php
	require_once 'db_config.php';
	class RendaVariavel {
		/*----------------------------------------- ARCABOUCOS ------------------------------------------*/
		/*
			Retorna a lista de arcabouços do usuario.
		*/
		public static function get_arcaboucos($params = [], $id_usuario = ''){
			$result = [];
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			$mysqli->set_charset('utf8');
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			if (array_key_exists('id', $params)){
				$stmt = $mysqli->prepare("SELECT rva.*,DATE(rva.data_criacao) AS data_criacao,crvo.qtd_ops FROM rv__arcabouco rva INNER JOIN rv__arcabouco__usuario rva_u ON rva.id=rva_u.id_arcabouco LEFT JOIN (SELECT COUNT(_rvo.id) AS qtd_ops,_rvo.id_arcabouco FROM rv__operacoes _rvo GROUP BY _rvo.id_arcabouco) crvo ON rva.id=crvo.id_arcabouco WHERE rva.id=? AND rva_u.id_usuario='{$id_usuario}'");
			 	$stmt->bind_param('i', $params['id']);
			 	$stmt->execute();
		 		$result_raw = $stmt->get_result();
			}
			else
				$result_raw = $mysqli->query("SELECT rva.*,DATE(rva.data_criacao) AS data_criacao,crvo.qtd_ops FROM rv__arcabouco rva INNER JOIN rv__arcabouco__usuario rva_u ON rva.id=rva_u.id_arcabouco LEFT JOIN (SELECT COUNT(_rvo.id) AS qtd_ops,_rvo.id_arcabouco FROM rv__operacoes _rvo GROUP BY _rvo.id_arcabouco) crvo ON rva.id=crvo.id_arcabouco WHERE rva_u.id_usuario='{$id_usuario}' ORDER BY rva.data_atualizacao DESC, rva.id DESC");
			while($row = $result_raw->fetch_assoc()){
				$result_usuarios = $mysqli->query("SELECT u.id,u.usuario,u.nome FROM rv__arcabouco__usuario rva_u INNER JOIN usuario u ON rva_u.id_usuario=u.id WHERE rva_u.id_arcabouco='{$row['id']}'");
				$usuarios_arcabouco = [];
				while($row_u = $result_usuarios->fetch_assoc()){
					$usuarios_arcabouco[] = [
						'usuario' => $row_u['usuario'],
						'nome' => $row_u['nome'],
						'criador' => ($row['id_usuario_criador'] == $row_u['id']) ? 1 : 0
					];
				}
				$result_usuarios->free();
				$result[] = [
					'id' => $row['id'],
					'sou_criador' => ($row['id_usuario_criador'] == $id_usuario) ? 1 : 0,
					'nome' => $row['nome'],
					'data_criacao' => $row['data_criacao'],
					'data_atualizacao' => $row['data_atualizacao'],
					'situacao' => (int) $row['situacao'],
					'tipo' => (int) $row['tipo'],
					'usuarios' => $usuarios_arcabouco,
					'qtd_ops' => !is_null($row['qtd_ops']) ? (int) $row['qtd_ops'] : 0,
					'observacao' => $row['observacao']
				];
			}
			$result_raw->free();
			$mysqli->close();
			return ['status' => 1, 'data' => $result];
		}
		/*
			Insere um novo arcabouço para o usuario.
		*/
		public static function insert_arcaboucos($params = [], $id_usuario = ''){
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try {
				$params['observacao'] = (array_key_exists('observacao', $params) ? $params['observacao'] : '');
				//Cria o arcabouço
				$stmt = $mysqli->prepare("INSERT INTO rv__arcabouco (id_usuario_criador,nome,situacao,tipo,observacao) VALUES (?,?,?,?,?)");
			 	$stmt->bind_param('isiis', $id_usuario, $params['nome'], $params['situacao'], $params['tipo'], $params['observacao']);
				$stmt->execute();
				$id_arcabouco = $mysqli->insert_id;
				//Adiciona os usuarios com acesso ao arcabouço (Próprio usuario incluso)
				//Coloca por padrão o id do usuario criador
				$ids_usuarios = [$id_usuario];
				if (array_key_exists('usuarios', $params)){
					//Busca os ids dos usuarios pelo login
					$select_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
					foreach ($params['usuarios'] as $login){
						$select_data['wildcards'] .= (($select_data['wildcards'] !== '') ? ' OR ' : '') . 'usuario=?';
						$select_data['bind'] .= 's';
						$select_data['values'][] = $login;
					}
					$stmt = $mysqli->prepare("SELECT id FROM usuario WHERE {$select_data['wildcards']}");
					$stmt->bind_param($select_data['bind'], ...$select_data['values']);
					$stmt->execute();
				 	$result_raw = $stmt->get_result();
					while($row = $result_raw->fetch_assoc())
						$ids_usuarios[] = $row['id'];
					$stmt->free_result();
				}
				//Insere todos os usuarios para acesso no arcabouço
				$insert_data = preg_replace('/^,/', '', array_reduce($ids_usuarios, function($result, $item) use ($id_arcabouco){
    				return $result . ",('{$id_arcabouco}','{$item}')";
    			}));
				//Me adiciona como usuario do arcabouço
				$mysqli->query("INSERT INTO rv__arcabouco__usuario (id_arcabouco,id_usuario) VALUES {$insert_data}");
				$mysqli->commit();
		 		$mysqli->close();
		 		return ['status' => 1];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
				if ($exception->getCode() === 1062)
					$error = 'Arcabouço já cadastrado.';
				else
					$error = 'Erro ao cadastrar este Arcabouço.';
		 		$mysqli->close();
	 			return ['status' => 0, 'error' => $error];
			}
		}
		/*
			Atualiza um arcabouco para do usuario.
		*/
		public static function update_arcaboucos($params = [], $id_arcabouco = '', $id_usuario = ''){
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try{
				//Checa para ver se o usuario tem acesso ao arcabouço
				$stmt = $mysqli->prepare("SELECT rvau.id_arcabouco FROM rv__arcabouco__usuario rvau WHERE rvau.id_arcabouco=? AND rvau.id_usuario='{$id_usuario}'");
			 	$stmt->bind_param('i', $id_arcabouco);
			 	$stmt->execute();
		 		$result_raw = $stmt->get_result();
		 		if ($result_raw->num_rows > 0){
					$update_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
					//Prepara apenas os dados a serem atualizados
					foreach ($params as $data_name => $new_data_value){
						//Pula o ID do Arcabouco e lista de Usuarios com acesso
						if ($data_name === 'id' || $data_name === 'usuarios')
							continue;
						$update_data['wildcards'] .= ",{$data_name}=?";
						$update_data['bind'] .= ($data_name === 'nome' || $data_name === 'observacao') ? 's' : 'd';
						$update_data['values'][] = $new_data_value;
					}
					$update_data['bind'] .= 'i';
					$update_data['values'][] = $id_arcabouco;
					$stmt = $mysqli->prepare("UPDATE rv__arcabouco SET data_atualizacao=(NOW() - INTERVAL 3 HOUR){$update_data['wildcards']} WHERE id=? AND id_usuario_criador='{$id_usuario}'");
					$stmt->bind_param($update_data['bind'], ...$update_data['values']);
					$stmt->execute();
					//Remove todos os usuarios com acesso ao arcabouço
					$stmt = $mysqli->prepare("DELETE FROM rv__arcabouco__usuario WHERE id_arcabouco=?");
			 		$stmt->bind_param('i', $id_arcabouco);
					$stmt->execute();
					//Coloca por padrão o id do usuario criador
					$ids_usuarios = [$id_usuario];
			 		//Atualiza os usuarios com acesso ao arcabouço (Próprio usuario incluso)
					if (array_key_exists('usuarios', $params)){
						//Busca os ids dos usuarios pelo login
						$select_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
						foreach ($params['usuarios'] as $login){
							$select_data['wildcards'] .= (($select_data['wildcards'] !== '') ? ' OR ' : '') . 'usuario=?';
							$select_data['bind'] .= 's';
							$select_data['values'][] = $login;
						}
						$stmt = $mysqli->prepare("SELECT id FROM usuario WHERE {$select_data['wildcards']}");
						$stmt->bind_param($select_data['bind'], ...$select_data['values']);
						$stmt->execute();
					 	$result_raw = $stmt->get_result();
						while($row = $result_raw->fetch_assoc())
							$ids_usuarios[] = $row['id'];
						$stmt->free_result();
					}
					//Insere todos os usuarios para acesso no arcabouço
					$insert_data = preg_replace('/^,/', '', array_reduce($ids_usuarios, function($result, $item) use ($id_arcabouco){
	    				return $result . ",('{$id_arcabouco}','{$item}')";
	    			}));
					//Me adiciona como usuario do arcabouço
					$mysqli->query("INSERT INTO rv__arcabouco__usuario (id_arcabouco,id_usuario) VALUES {$insert_data}");
			 	}
				$mysqli->commit();
		 		$mysqli->close();
		 		return ['status' => 1, 'data' => ['id' => $id_arcabouco]];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
				if ($exception->getCode() === 1062)
					$error = 'Um arcabouço com esse nome já existe.';
				else
					$error = 'Erro ao atualizar este Arcabouço.';
		 		$mysqli->close();
	 			return ['status' => 0, 'error' => $error];
			}
		}
		/*
			Remove um arcabouço, seus cenarários e operações cadastradas.
		*/
		public static function remove_arcaboucos($params = [], $id_usuario = ''){
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try {
				//Checa para ver se o usuario tem acesso ao arcabouço
				$stmt = $mysqli->prepare("SELECT rvau.id_arcabouco FROM rv__arcabouco__usuario rvau WHERE rvau.id_arcabouco=? AND rvau.id_usuario='{$id_usuario}'");
			 	$stmt->bind_param('i', $params['id']);
			 	$stmt->execute();
		 		$result_raw = $stmt->get_result();
		 		if ($result_raw->num_rows > 0){
					//Remove o arcabouço
					$stmt = $mysqli->prepare("DELETE rva,rvau FROM rv__arcabouco rva LEFT JOIN rv__arcabouco__usuario rvau ON rva.id=rvau.id_arcabouco WHERE rva.id=?");
			 		$stmt->bind_param('i', $params['id']);
					$stmt->execute();
					//Remove os cenarios
					$stmt = $mysqli->prepare("DELETE rvc,rvco FROM rv__cenario rvc LEFT JOIN rv__cenario_obs rvco ON rvc.id=rvco.id_cenario WHERE rvc.id_arcabouco=?");
			 		$stmt->bind_param('i', $params['id']);
					$stmt->execute();
					//Remove as operações
					$stmt = $mysqli->prepare("DELETE FROM rv__operacoes WHERE id_arcabouco=?");
			 		$stmt->bind_param('i', $params['id']);
					$stmt->execute();
				}
				$mysqli->commit();
		 		$mysqli->close();
		 		return ['status' => 1];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
		 		$mysqli->close();
	 			return ['status' => 0, 'error' => 'Erro ao remover este arcabouço.'];
			}
		}
		/*------------------------------------------- ATIVOS --------------------------------------------*/
		/*
			Retorna a lista de ativos do usuario.
		*/
		public static function get_ativos($params = [], $id_usuario = ''){
			$result = [];
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			$mysqli->set_charset('utf8');
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$result_raw = $mysqli->query("SELECT rva.* FROM rv__ativo rva WHERE rva.id_usuario='{$id_usuario}' ORDER BY rva.nome");
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
			$stmt = $mysqli->prepare("INSERT INTO rv__ativo (id_usuario,nome,custo,valor_tick,pts_tick) VALUES (?,UPPER(?),?,?,?)");
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
			Atualiza um ativo do usuario.
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
			$stmt = $mysqli->prepare("UPDATE rv__ativo SET {$update_data['wildcards']} WHERE id=? AND id_usuario='{$id_usuario}'");
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
		/*
			Remove um ativo do usuario.
		*/
		public static function remove_ativos($params = [], $id_usuario = ''){
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try {
				//Remove o ativo
				$stmt = $mysqli->prepare("DELETE FROM rv__ativo WHERE id=?");
		 		$stmt->bind_param('i', $params['id']);
				$stmt->execute();
				$mysqli->commit();
		 		$mysqli->close();
		 		return ['status' => 1];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
		 		$mysqli->close();
	 			return ['status' => 0, 'error' => 'Erro ao remover este ativo.'];
			}
		}
		/*--------------------------------------- GERENCIAMENTOS ----------------------------------------*/
		/*
			Retorna a lista de gerenciamentos do usuario.
		*/
		public static function get_gerenciamentos($params = [], $id_usuario = ''){
			$result = [];
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			$mysqli->set_charset('utf8');
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$result_raw = $mysqli->query("SELECT rvg.* FROM rv__gerenciamento rvg WHERE rvg.id_usuario='{$id_usuario}' ORDER BY rvg.nome");
			while($row = $result_raw->fetch_assoc()){
				$result[] = [
					'id' => $row['id'],
					'nome' => $row['nome'],
					'acoes' => json_decode($row['acoes'], true),
					'escaladas' => json_decode($row['escaladas'], true)
				];
			}
			$result_raw->free();
			$mysqli->close();
			return ['status' => 1, 'data' => $result];
		}
		/*
			Insere um novo gerenciamento para o usuario.
		*/
		public static function insert_gerenciamentos($params = [], $id_usuario = ''){
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$stmt = $mysqli->prepare("INSERT INTO rv__gerenciamento (id_usuario,nome,acoes,escaladas) VALUES (?,?,?,?)");
		 	$stmt->bind_param('isss', $id_usuario, $params['nome'], $params['acoes'], $params['escaladas']);
		 	if ($stmt->execute()){
		 		$mysqli->close();
		 		return ['status' => 1];
		 	}
		 	else{
		 		if ($mysqli->errno === 1062){
		 			$mysqli->close();
		 			return ['status' => 0, 'error' => 'Gerenciamento já cadastrado.'];
		 		}
		 		$mysqli->close();
		 		return ['status' => 0, 'error' => 'Erro ao cadastrar esse Gerenciamento.'];
		 	}
		}
		/*
			Atualiza um gerenciamento do usuario.
		*/
		public static function update_gerenciamentos($params = [], $id_gerenciamento = '', $id_usuario = ''){
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$update_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
			//Prepara apenas os dados a serem atualizados
			foreach ($params as $data_name => $new_data_value){
				//Pula o ID do gerenciamento
				if ($data_name === 'id')
					continue;
				$update_data['wildcards'] .= (($update_data['wildcards'] !== '') ? ',' : '') . "{$data_name}=?";
				$update_data['bind'] .= ($data_name === 'nome' || $data_name === 'acoes' || $data_name === 'escaladas') ? 's' : 'd';
				$update_data['values'][] = $new_data_value;
			}
			$update_data['bind'] .= 'i';
			$update_data['values'][] = $id_gerenciamento;
			$stmt = $mysqli->prepare("UPDATE rv__gerenciamento SET {$update_data['wildcards']} WHERE id=? AND id_usuario='{$id_usuario}'");
			$stmt->bind_param($update_data['bind'], ...$update_data['values']);
		 	if ($stmt->execute()){
		 		$mysqli->close();
		 		return ['status' => 1];
		 	}
		 	else{
		 		if ($mysqli->errno == 1062){
		 			$mysqli->close();
		 			return ['status' => 0, 'error' => 'Esse Gerenciamento já existe.'];
		 		}
		 		$mysqli->close();
		 		return ['status' => 0, 'error' => 'Erro ao atualizar esse Gerenciamento.'];
		 	}
		}
		/*
			Remove um gerenciamento do usuario.
		*/
		public static function remove_gerenciamentos($params = [], $id_usuario = ''){
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try {
				//Remove o gerenciamento
				$stmt = $mysqli->prepare("DELETE FROM rv__gerenciamento WHERE id=?");
		 		$stmt->bind_param('i', $params['id']);
				$stmt->execute();
				$mysqli->commit();
		 		$mysqli->close();
		 		return ['status' => 1];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
		 		$mysqli->close();
	 			return ['status' => 0, 'error' => 'Erro ao remover este gerenciamento.'];
			}
		}
		/*------------------------------------------ CENÁRIOS -------------------------------------------*/
		/*
			Retorna a lista de cenarios do usuario.
		*/
		public static function get_cenarios($params = [], $id_usuario = ''){
			$result = [];
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			$mysqli->set_charset('utf8');
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			if (array_key_exists('id', $params)){
				$stmt = $mysqli->prepare("SELECT rvc.* FROM rv__cenario rvc INNER JOIN rv__arcabouco__usuario rva_u ON rvc.id_arcabouco=rva_u.id_arcabouco WHERE rva_u.id_usuario='{$id_usuario}' AND rvc.id=? AND rvc.id_arcabouco=? ORDER BY rvc.nome");
			 	$stmt->bind_param('ii', $params['id'], $params['id_arcabouco']);
			}
			else{
				$stmt = $mysqli->prepare("SELECT rvc.* FROM rv__cenario rvc INNER JOIN rv__arcabouco__usuario rva_u ON rvc.id_arcabouco=rva_u.id_arcabouco WHERE rva_u.id_usuario='{$id_usuario}' AND rvc.id_arcabouco=? ORDER BY rvc.nome");
			 	$stmt->bind_param('i', $params['id_arcabouco']);
			 }
		 	$stmt->execute();
		 	$result_raw = $stmt->get_result();
			while($row = $result_raw->fetch_assoc()){
				$result[] = [
					'id' => $row['id'],
					'nome' => $row['nome']
				];
			}
			$stmt->free_result();
			foreach ($result as $i => $cenario){
				$result[$i]['observacoes'] = [];
				$result_raw = $mysqli->query("SELECT rvco.* FROM rv__cenario_obs rvco WHERE rvco.id_cenario='{$cenario['id']}' ORDER BY rvco.ref ASC");
				while($row = $result_raw->fetch_assoc()){
					$result[$i]['observacoes'][] = [
						'id' => $row['id'],
						'inativo' => $row['inativo'],
						'ref' => $row['ref'],
						'nome' => $row['nome']
					];
				}
				$result_raw->free();
			}
			$mysqli->close();
			return ['status' => 1, 'data' => $result];
		}
		/*
			Cria ou Altera um Cenario (Adicionando/Alterando/Removendo) (Observacoes), do arcabouco de um usuario.
		*/
		public static function insert_update_cenarios($params = [], $id_usuario = ''){
			$set_error_msg = 'Erro desconhecido';
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			//Checa para ver se o usuario tem acesso ao arcabouço (E se é o criador)
			$stmt = $mysqli->prepare("SELECT rva.id_usuario_criador FROM rv__arcabouco__usuario rvau INNER JOIN rv__arcabouco rva ON rvau.id_arcabouco=rva.id WHERE rvau.id_arcabouco=? AND rvau.id_usuario='{$id_usuario}'");
		 	$stmt->bind_param('i', $params['id_arcabouco']);
		 	$stmt->execute();
	 		$result_raw = $stmt->get_result();
	 		$sou_criador = $result_raw->fetch_row()[0] ?? FALSE;
	 		if (!$sou_criador)
	 			return ['status' => 0, 'error' => 'Apenas o criador pode fazer mudanças nos Cenários.'];
			foreach ($params['cenarios'] as $cenario){
				if (!array_key_exists('id', $cenario) && !array_key_exists('nome', $cenario))
					continue;
				if (array_key_exists('id', $cenario) && $cenario['id'] == '')
					continue;
				if (array_key_exists('nome', $cenario) && $cenario['nome'] == '')
					continue;
				$mysqli->begin_transaction();
				try {
					//Busca info do cenario
					if (array_key_exists('id', $cenario)){
						$set_error_msg = "Erro ao buscar info do cenário [{$cenario['id']}]";
						$stmt = $mysqli->prepare("SELECT id,nome FROM rv__cenario WHERE id=? AND id_arcabouco=?");
					 	$stmt->bind_param('ii', $cenario['id'], $params['id_arcabouco']);
					 	$stmt->execute();
					 	$result_raw = $stmt->get_result();
				 		$cenario_info = $result_raw->fetch_assoc();
		 				$stmt->free_result();
				 	}
				 	else
				 		$cenario_info = ['id' => null, 'nome' => ''];
				 	//É um novo cenário
				 	if (is_null($cenario_info['id'])){
				 		if (array_key_exists('nome', $cenario) && $cenario['nome'] !== ''){
							//Cria o cenário
							$stmt = $mysqli->prepare("INSERT INTO rv__cenario (id_arcabouco,nome) VALUES (?,?)");
						 	$stmt->bind_param('is', $params['id_arcabouco'], $cenario['nome']);
							$stmt->execute();
							$id_cenario = $mysqli->insert_id;
							//Adicionar as observacoes se houver
							if (array_key_exists('obs_insert', $cenario) && !empty($cenario['obs_insert'])){
								$insert_data = preg_replace('/^,/', '', array_reduce($cenario['obs_insert'], function($result, $item) use ($id_cenario, $mysqli){
				    				return $result . ",('{$id_cenario}'," . "'".$mysqli->real_escape_string($item['ref'])."'," . "'".$mysqli->real_escape_string($item['nome'])."'," . "'".$mysqli->real_escape_string($item['inativo'])."'" . ")";
				    			}));
				    			$mysqli->query("INSERT INTO rv__cenario_obs (id_cenario,ref,nome,inativo) VALUES {$insert_data}");
							}
				 		}
				 	}
				 	//Cenário ja existe, processa a atualização dele
				 	else{
						//Atualiza o nome do cenário passado
						$cenarios_change__nome = [];
						if (array_key_exists('nome', $cenario) && $cenario['nome'] !== $cenario_info['nome']){
							$set_error_msg = "Erro ao atualizar nome de '{$cenario_info['nome']}' para '{$cenario['nome']}'";
							$cenarios_change__nome[$cenario_info['nome']] = $cenario['nome'];
					 		//Atualiza o nome
							$stmt = $mysqli->prepare("UPDATE rv__cenario SET nome=? WHERE id=?");
							$stmt->bind_param('si', $cenario['nome'], $cenario['id']);
							$stmt->execute();
						}
						//Remove as observações
						$cenarios_obs_remove__ref = [];
						if (array_key_exists('obs_remove', $cenario) && !empty($cenario['obs_remove'])){
							$set_error_msg = "Erro ao remover observações de '{$cenario_info['nome']}'";
							$where = preg_replace('/^ OR /', '', array_reduce($cenario['obs_remove'], function($result, $item) use ($mysqli){
			    				return $result . " OR id='" . $mysqli->real_escape_string($item['id']) . "'";
			    			}));
							//Captura as Refs de todas as observações removidas
			    			$result_raw = $mysqli->query("SELECT ref FROM rv__cenario_obs WHERE {$where}");
							while($row = $result_raw->fetch_assoc())
								$cenarios_obs_remove__ref[] = $row['ref'];
							$result_raw->free();
							//Faz a remoção das observações
			    			$mysqli->query("DELETE FROM rv__cenario_obs WHERE {$where}");
						}
						//Atualiza as observações
						$cenarios_obs_change__ref = [];
						if (array_key_exists('obs_update', $cenario) && !empty($cenario['obs_update'])){
							$set_error_msg = "Erro ao atualizar observações de '{$cenario_info['nome']}'";
							$where = preg_replace('/^ OR /', '', array_reduce($cenario['obs_update'], function($result, $item) use ($mysqli){
			    				return $result . " OR id='" . $mysqli->real_escape_string($item['id']) . "'";
			    			}));
							//Captura as Refs antigas das observações a serem atualizadas
			    			$result_raw = $mysqli->query("SELECT id,ref FROM rv__cenario_obs WHERE {$where}");
							while($row = $result_raw->fetch_assoc()){
								$index_novo_ref__id = null;
								//Busca qual a nova Ref, para parear os dois (Se esta sendo alterado de fato o Ref)
								foreach ($cenario['obs_update'] as $index_ob => $observacao){
									if ($observacao['id'] == $row['id'] && (array_key_exists('ref', $observacao) && $observacao['ref'] !== $row['ref']))
										$index_novo_ref__id = $index_ob;
								}
								if (!is_null($index_novo_ref__id))
									$cenarios_obs_change__ref[$row['ref']] = $mysqli->real_escape_string($cenario['obs_update'][$index_novo_ref__id]['ref']);
							}
							$result_raw->free();
							//Atualiza as observações
							foreach ($cenario['obs_update'] as $observacao){
								$update_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
								//Prepara apenas os dados a serem atualizados
								foreach ($observacao as $data_name => $new_data_value){
									//Pula o ID da Observacao
									if ($data_name === 'id')
										continue;
									$update_data['wildcards'] .= (($update_data['wildcards'] !== '') ? ',' : '') . "{$data_name}=?";
									$update_data['bind'] .= ($data_name === 'nome') ? 's' : 'i';
									$update_data['values'][] = $new_data_value;
								}
								$update_data['bind'] .= 'i';
								$update_data['values'][] = $observacao['id'];
								$stmt = $mysqli->prepare("UPDATE rv__cenario_obs SET {$update_data['wildcards']} WHERE id=?");
								$stmt->bind_param($update_data['bind'], ...$update_data['values']);
								$stmt->execute();
							}
						}
						if (array_key_exists('obs_insert', $cenario) && !empty($cenario['obs_insert'])){
							$set_error_msg = "Erro ao inserir novas observações de '{$cenario_info['nome']}'";
							foreach ($cenario['obs_insert'] as $observacao){
								$stmt = $mysqli->prepare("INSERT INTO rv__cenario_obs (id_cenario,ref,nome,inativo) VALUES (?,?,?,?)");
						 		$stmt->bind_param('iisi', $cenario_info['id'], $observacao['ref'], $observacao['nome'], $observacao['inativo']);
								$stmt->execute();
							}
						}
						//Arruma o Cenario e Refs de Observações nas operações do arcabouço
						if (!empty($cenarios_change__nome) || !empty($cenarios_obs_remove__ref) || !empty($cenarios_obs_change__ref)){
							$set_error_msg = "Erro corrigir as operações ao mudar '{$cenario_info['nome']}'";
							//Pega todas as operações do arcabouço
							$stmt = $mysqli->prepare("SELECT id,cenario,observacoes FROM rv__operacoes WHERE id_arcabouco=? AND cenario=?");
						 	$stmt->bind_param('is', $params['id_arcabouco'], $cenario_info['nome']);
						 	$stmt->execute();
						 	$result_raw = $stmt->get_result();
						 	$arcabouco_operacoes = [];
						 	while($row = $result_raw->fetch_assoc()){
						 		$arcabouco_operacoes[] = [
						 			'id' => $row['id'],
						 			'cenario' => $row['cenario'],
						 			'observacoes' => $row['observacoes']
						 		];
						 	}
						 	$stmt->free_result();
						 	$insert_duplicate_update = '';
						 	foreach ($arcabouco_operacoes as $operacao){
						 		$cenario_usar = $operacao['cenario'];
						 		$observacoes_usar = $operacao['observacoes'];
						 		//Atualiza o nome do cenario se foi alterado
						 		if (array_key_exists($operacao['cenario'], $cenarios_change__nome))
						 			$cenario_usar = $cenarios_change__nome[$operacao['cenario']];
						 		if ($observacoes_usar !== '' && (!empty($cenarios_obs_remove__ref) || !empty($cenarios_obs_change__ref))){
						 			$observacoes_usar = explode(',', $observacoes_usar);
					 				//Remove as Ref antes
						 			foreach ($observacoes_usar as $i => $observacao){
						 				if (in_array($observacao, $cenarios_obs_remove__ref))
						 					unset($observacoes_usar[$i]);
						 			}
					 				//Altera as Refs
					 				foreach ($observacoes_usar as $i => $observacao){
					 					if (array_key_exists($observacao, $cenarios_obs_change__ref))
					 						$observacoes_usar[$i] = $cenarios_obs_change__ref[$observacao];
					 				}
					 				sort($observacoes_usar);
					 				$observacoes_usar = implode(',', $observacoes_usar);
						 		}
						 		//Se teve alguma mudanca inclui na lista para atualizar
						 		if ($cenario_usar !== $operacao['cenario'] || $observacoes_usar !== $operacao['observacoes'])
						 			$insert_duplicate_update .= (($insert_duplicate_update === '') ? '' : ',') . "('{$operacao['id']}', '{$cenario_usar}', '{$observacoes_usar}')";
						 	}
						 	//Xunxo para fazer os UPDATES em batch
						 	if ($insert_duplicate_update !== '')
						 		$mysqli->query("INSERT INTO rv__operacoes (id, cenario, observacoes) VALUES {$insert_duplicate_update} ON DUPLICATE KEY UPDATE cenario=VALUES(cenario), observacoes=VALUES(observacoes)");
						}
				 	}
					$mysqli->commit();
				}
				catch (mysqli_sql_exception $exception){
					$mysqli->rollback();
					// $error = $exception->getMessage();
					if ($exception->getCode() === 1062)
						$error = "{$set_error_msg}, já existe.";
					else
						$error = "{$set_error_msg}.";
			 		$mysqli->close();
		 			return ['status' => 0, 'error' => $error];
				}
			}
	 		$mysqli->close();
	 		return ['status' => 1, 'data' => ['id_arcabouco' => $params['id_arcabouco']]];
		}
		/*
			Remove um Cenario e suas (Observacoes) no arcabouco de um usuario.
		*/
		public static function remove_cenarios($params = [], $id_usuario = ''){
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			//Checa para ver se o usuario tem acesso ao arcabouço (E se é o criador)
			$stmt = $mysqli->prepare("SELECT rva.id_usuario_criador FROM rv__arcabouco__usuario rvau INNER JOIN rv__arcabouco rva ON rvau.id_arcabouco=rva.id WHERE rvau.id_arcabouco=? AND rvau.id_usuario='{$id_usuario}'");
		 	$stmt->bind_param('i', $params['id_arcabouco']);
		 	$stmt->execute();
	 		$result_raw = $stmt->get_result();
	 		$sou_criador = $result_raw->fetch_row()[0] ?? FALSE;
	 		if (!$sou_criador)
	 			return ['status' => 0, 'error' => 'Apenas o criador pode fazer mudanças nos Cenários.'];
			$mysqli->begin_transaction();
			try {
				//Remove o cenario e suas observações
				$stmt = $mysqli->prepare("DELETE rvc,rvco FROM rv__cenario rvc LEFT JOIN rv__cenario_obs rvco ON rvc.id=rvco.id_cenario WHERE rvc.id=?");
		 		$stmt->bind_param('i', $params['id']);
				$stmt->execute();
				$mysqli->commit();
		 		$mysqli->close();
		 		return ['status' => 1];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
		 		$mysqli->close();
	 			return ['status' => 0, 'error' => 'Erro ao remover este cenário.'];
			}
		}
		/*------------------------------------------ OPERAÇÕES ------------------------------------------*/
		/*
			Retorna a lista de operações de um arcabouço do usuario.
		*/
		public static function get_operacoes($params = [], $id_usuario = ''){
			$result = [];
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			$mysqli->set_charset('utf8');
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$stmt = $mysqli->prepare("SELECT rvo.* FROM rv__operacoes rvo INNER JOIN rv__arcabouco__usuario rva_u ON rvo.id_arcabouco=rva_u.id_arcabouco WHERE rva_u.id_usuario='{$id_usuario}' AND rvo.id_arcabouco=? ORDER BY rvo.data ASC,rvo.hora ASC");
		 	$stmt->bind_param('i', $params['id_arcabouco']);
			$stmt->execute();
		 	$result_raw = $stmt->get_result();
			while($row = $result_raw->fetch_assoc()){
				$result[] = [
					'id' => $row['id'],
					'sequencia' => $row['sequencia'],
					'gerenciamento' => $row['gerenciamento'],
					'data' => $row['data'],
					'ativo' => $row['ativo'],
					'op' => (int) $row['op'],
					'vol' => (float) $row['vol'],
					'cts' => (int) $row['cts'],
					'hora' => $row['hora'],
					'escalada' => (int) $row['escalada'],
					'resultado' => (float) $row['resultado'],
					'cenario' => $row['cenario'],
					'observacoes' => $row['observacoes'],
					'erro' => (int) $row['erro'],
					'ativo_custo' => (float) $row['ativo_custo'],
					'ativo_valor_tick' => (float) $row['ativo_valor_tick'],
					'ativo_pts_tick' => (float) $row['ativo_pts_tick'],
					'gerenciamento_acoes' => json_decode($row['gerenciamento_acoes'], true)
				];
			}
			$result_raw->free();
			$mysqli->close();
			return ['status' => 1, 'data' => $result];
		}
		/*
			Insere novas operações no arcabouco de um usuario.
		*/
		public static function insert_operacoes($params = [], $id_usuario = ''){
			$hold_ops = [];
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try {
				//Checa para ver se o usuario tem acesso ao arcabouço e pegar a ultima 'sequencia'
				$stmt = $mysqli->prepare("SELECT IFNULL(rvo.ult_seq+1,1) AS ult_seq FROM rv__arcabouco__usuario rvau LEFT JOIN (SELECT id_arcabouco,MAX(sequencia) AS ult_seq FROM rv__operacoes WHERE id_arcabouco=?) rvo ON rvau.id_arcabouco=rvo.id_arcabouco WHERE rvau.id_arcabouco=? AND rvau.id_usuario='{$id_usuario}'");
			 	$stmt->bind_param('ii', $params['id_arcabouco'], $params['id_arcabouco']);
			 	$stmt->execute();
		 		$result_raw = $stmt->get_result();
		 		//O usuario tem acesso
		 		if ($result_raw->num_rows > 0){
		 			//Adiciona automaticamente os ativos (Vindos do Upload de Arquivo)
		 			if (array_key_exists('ativos', $params) && !empty($params['ativos'])){
		 				foreach ($params['ativos'] as $ativo){
		 					$stmt = $mysqli->prepare("INSERT INTO rv__ativos (id_usuario,nome,custo,valor_tick,pts_tick) VALUES (?,?,?,?,?)");
							$stmt->bind_param('isddd', $id_usuario, $ativo['nome'], $ativo['custo'], $ativo['valor_tick'], $ativo['pts_tick']);
							$stmt->execute();
		 				}
		 			}
		 			$ult_seq = $result_raw->fetch_assoc()['ult_seq'];
		 			$operacoes_ja_cadastradas = [];
		 			//Busca operacoes ja cadastradas para evitar duplicatas (id_arcabouco, data, ativo, op, hora, resultado, cenario, observacoes)
	 				$stmt = $mysqli->prepare("SELECT gerenciamento,data,ativo,op,hora,resultado,cenario,observacoes FROM rv__operacoes WHERE id_arcabouco=?");
			 		$stmt->bind_param('i', $params['id_arcabouco']);
			 		$stmt->execute();
	 				$result_raw = $stmt->get_result();
	 				while($row = $result_raw->fetch_assoc()){
	 					$key = "{$row['gerenciamento']}{$row['data']}{$row['ativo']}{$row['op']}{$row['hora']}" . rtrim((strpos($row['resultado'], '.') !== false ? rtrim($row['resultado'], '0') : $row['resultado']), '.') . "{$row['cenario']}{$row['observacoes']}";
						$operacoes_ja_cadastradas[$key] = NULL;
					}
					$block_size = 50;
					$block_i = 0;
					$insert_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
		 			foreach ($params['operacoes'] as $operacao){
		 				//Se fechou o bloco
		 				if ($block_i === $block_size){
		 					//Faz a inserção do Bloco
		 					$stmt = $mysqli->prepare("INSERT INTO rv__operacoes (id_arcabouco,id_usuario,sequencia,gerenciamento,escalada,data,ativo,op,vol,cts,hora,erro,resultado,cenario,observacoes,ativo_custo,ativo_valor_tick,ativo_pts_tick,gerenciamento_acoes) VALUES {$insert_data['wildcards']}");
							$stmt->bind_param($insert_data['bind'], ...$insert_data['values']);
							$stmt->execute();
							//Reseta o Bloco de inserção
							$block_i = 0;
							$insert_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
		 				}
		 				$find_by_key = "{$operacao['gerenciamento']}{$operacao['data']}{$operacao['ativo']}{$operacao['op']}{$operacao['hora']}" . rtrim((strpos($operacao['resultado'], '.') !== false ? rtrim($operacao['resultado'], '0') : $operacao['resultado']), '.') . "{$operacao['cenario']}{$operacao['observacoes']}";
				 		if (!array_key_exists($find_by_key, $operacoes_ja_cadastradas)){
				 			$insert_data['wildcards'] .= (($insert_data['wildcards'] !== '') ? ',' : '').'(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
					 		$insert_data['bind'] .= 'iiisissisisisssssss';
					 		$insert_data['values'] = array_merge($insert_data['values'], [
					 			$params['id_arcabouco'],
					 			$id_usuario,
					 			$ult_seq,
					 			$operacao['gerenciamento'],
					 			$operacao['escalada'],
					 			$operacao['data'],
					 			$operacao['ativo'],
					 			$operacao['op'],
					 			$operacao['vol'],
					 			$operacao['cts'],
					 			$operacao['hora'],
					 			$operacao['erro'],
					 			$operacao['resultado'],
					 			$operacao['cenario'],
					 			$operacao['observacoes'],
					 			$operacao['ativo_custo'],
					 			$operacao['ativo_valor_tick'],
					 			$operacao['ativo_pts_tick'],
					 			$operacao['gerenciamento_acoes']
					 		]);
							$ult_seq++;
							$block_i++;
				 		}
				 		else
				 			$hold_ops[] = $operacao['sequencia'];
		 			}
			 		//Insere caso não tenha fechado o bloco
			 		if ($block_i > 0){
			 			$stmt = $mysqli->prepare("INSERT INTO rv__operacoes (id_arcabouco,id_usuario,sequencia,gerenciamento,escalada,data,ativo,op,vol,cts,hora,erro,resultado,cenario,observacoes,ativo_custo,ativo_valor_tick,ativo_pts_tick,gerenciamento_acoes) VALUES {$insert_data['wildcards']}");
						$stmt->bind_param($insert_data['bind'], ...$insert_data['values']);
						$stmt->execute();
			 		}
			 		//Atualiza a data de atualização no arcabouço
			 		$stmt = $mysqli->prepare("UPDATE rv__arcabouco SET data_atualizacao=(NOW() - INTERVAL 3 HOUR) WHERE id=?");
					$stmt->bind_param('i', $params['id_arcabouco']);
					$stmt->execute();
		 		}
				$mysqli->commit();
		 		$mysqli->close();
		 		return ['status' => 1, 'hold_ops' => $hold_ops];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
		 		$mysqli->close();
	 			return ['status' => 0, 'error' => 'Erro no cadastro de operações, nada foi feito.'];
			}
		}
		/*
			Remove uma ou mais operacoes do arcabouco de um usuario.
		*/
		public static function remove_operacoes($params = [], $id_usuario = ''){
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try {
				//Checa para ver se o usuario tem acesso ao arcabouço
				$stmt = $mysqli->prepare("SELECT id_arcabouco FROM rv__arcabouco__usuario WHERE id_arcabouco=? AND id_usuario='{$id_usuario}'");
			 	$stmt->bind_param('i', $params['id_arcabouco']);
			 	$stmt->execute();
		 		$result_raw = $stmt->get_result();
		 		if ($result_raw->num_rows > 0){
					$where = 'id_arcabouco=?';
					if (array_key_exists('operacoes', $params) && !empty($params['operacoes'])){
						$where .= ' AND ('.preg_replace('/^ OR /', '', array_reduce($params['operacoes'], function($result, $item) use ($mysqli){
		    				return $result . " OR id='" . $mysqli->real_escape_string($item) . "'";
		    			})).')';
					}
					//Remove as operacoes
					$stmt = $mysqli->prepare("DELETE FROM rv__operacoes WHERE {$where}");
			 		$stmt->bind_param('i', $params['id_arcabouco']);
					$stmt->execute();
					//Refaz a contagem de sequencia, para deixar sempre em ordem de inserção
					$stmt = $mysqli->prepare("UPDATE rv__operacoes JOIN (SELECT @seq := 0) s SET sequencia=@seq:=@seq+1 WHERE id_arcabouco=? ORDER BY id");
					$stmt->bind_param('i', $params['id_arcabouco']);
			 		$stmt->execute();
			 		//Atualiza a data de atualização no arcabouço
			 		$stmt = $mysqli->prepare("UPDATE rv__arcabouco SET data_atualizacao=(NOW() - INTERVAL 3 HOUR) WHERE id=?");
					$stmt->bind_param('i', $params['id_arcabouco']);
					$stmt->execute();
					$mysqli->commit();
			 		$mysqli->close();
		 			return ['status' => 1];
		 		}
	 			return ['status' => 0, 'error' => 'Arcabouço não existe.'];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
		 		$mysqli->close();
	 			return ['status' => 0, 'error' => 'Erro ao remover operações.'];
			}
		}
	}
?>