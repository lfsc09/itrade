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
					$stmt = $mysqli->prepare("DELETE rvc,rvcp,rvco FROM rv__cenario rvc LEFT JOIN rv__cenario_premissa rvcp ON rvc.id=rvcp.id_cenario LEFT JOIN rv__cenario_obs rvco ON rvc.id=rvco.id_cenario WHERE rvc.id_arcabouco=?");
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
					'acoes' => json_decode($row['acoes'], true)
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
			$stmt = $mysqli->prepare("INSERT INTO rv__gerenciamento (id_usuario,nome,acoes) VALUES (?,?,?)");
		 	$stmt->bind_param('iss', $id_usuario, $params['nome'], $params['acoes']);
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
				$update_data['bind'] .= ($data_name === 'nome' || $data_name === 'acoes') ? 's' : 'd';
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
				$result[$i]['premissas'] = [];
				$result_raw = $mysqli->query("SELECT rvcp.* FROM rv__cenario_premissa rvcp WHERE rvcp.id_cenario='{$cenario['id']}' ORDER BY rvcp.ref ASC");
				while($row = $result_raw->fetch_assoc()){
					$result[$i]['premissas'][] = [
						'id' => $row['id'],
						'inativo' => $row['inativo'],
						'ref' => $row['ref'],
						'obrigatoria' => $row['obrigatoria'],
						'cor' => $row['cor'],
						'nome' => $row['nome']
					];
				}
				$result_raw->free();
				$result[$i]['observacoes'] = [];
				$result_raw = $mysqli->query("SELECT rvco.* FROM rv__cenario_obs rvco WHERE rvco.id_cenario='{$cenario['id']}' ORDER BY rvco.ref ASC");
				while($row = $result_raw->fetch_assoc()){
					$result[$i]['observacoes'][] = [
						'id' => $row['id'],
						'inativo' => $row['inativo'],
						'ref' => $row['ref'],
						'cor' => $row['cor'],
						'nome' => $row['nome']
					];
				}
				$result_raw->free();
			}
			$mysqli->close();
			return ['status' => 1, 'data' => $result];
		}
		/*
			Insere um novo Cenario com suas (Premissas / Observacoes) no arcabouco de um usuario.
		*/
		public static function insert_cenarios($params = [], $id_usuario = ''){
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try {
				//Cria o arcabouço
				$stmt = $mysqli->prepare("INSERT INTO rv__cenario (id_arcabouco,nome) VALUES (?,?)");
			 	$stmt->bind_param('is', $params['id_arcabouco'], $params['nome']);
				$stmt->execute();
				$id_cenario = $mysqli->insert_id;
				//Adicionar agora as premissas se houver
				if (array_key_exists('premissas', $params)){
					foreach ($params['premissas'] as $premissa){
						$stmt = $mysqli->prepare("INSERT INTO rv__cenario_premissa (id_cenario,ref,obrigatoria,cor,nome,inativo) VALUES ({$id_cenario}',?,?,?,?,?)");
				 		$stmt->bind_param('iissi', $premissa['ref'], $premissa['obrigatoria'], $premissa['cor'], $premissa['nome'], $premissa['inativo']);
						$stmt->execute();
					}
				}
				if (array_key_exists('observacoes', $params)){
					//Adicionar agora as observacoes se houver
					foreach ($params['observacoes'] as $obs){
						$stmt = $mysqli->prepare("INSERT INTO rv__cenario_obs (id_cenario,ref,cor,nome,inativo) VALUES ('{$id_cenario}',?,?,?,?)");
				 		$stmt->bind_param('issi', $obs['ref'], $obs['cor'], $obs['nome'], $obs['inativo']);
						$stmt->execute();
					}
				}
				$mysqli->commit();
		 		$mysqli->close();
		 		return ['status' => 1, 'data' => ['id' => $id_cenario, 'id_arcabouco' => $params['id_arcabouco']]];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
				if ($exception->getCode() === 1062)
					$error = 'Cenário já cadastrado ou existem Premissas/Observações duplicadas.';
				else
					$error = 'Erro ao cadastrar este cenário.';
		 		$mysqli->close();
	 			return ['status' => 0, 'error' => $error];
			}
		}
		/*
			Altera um Cenario e/ou Adiciona/Altera/Remove (Premissas / Observacoes) do arcabouco de um usuario.
		*/
		public static function update_cenarios($params = [], $id_usuario = ''){
			$place = 0;
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try {
				if (!empty($params['insert']['premissas'])){
					$place = 1;
					foreach ($params['insert']['premissas'] as $premissa){
						$stmt = $mysqli->prepare("INSERT INTO rv__cenario_premissa (id_cenario,ref,obrigatoria,cor,nome,inativo) VALUES (?,?,?,?,?,?)");
				 		$stmt->bind_param('iiissi', $params['id_cenario'], $premissa['ref'], $premissa['obrigatoria'], $premissa['cor'], $premissa['nome'], $premissa['inativo']);
						$stmt->execute();
					}
				}
				if (!empty($params['insert']['observacoes'])){
					$place = 2;
					foreach ($params['insert']['observacoes'] as $obs){
						$stmt = $mysqli->prepare("INSERT INTO rv__cenario_obs (id_cenario,ref,cor,nome,inativo) VALUES (?,?,?,?,?)");
				 		$stmt->bind_param('iissi', $params['id_cenario'], $obs['ref'], $obs['cor'], $obs['nome'], $obs['inativo']);
						$stmt->execute();
					}
				}
				if (!empty($params['update']['cenarios'])){
					$place = 3;
					foreach ($params['update']['cenarios'] as $cenario){
						$update_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
						//Prepara apenas os dados a serem atualizados
						foreach ($cenario as $data_name => $new_data_value){
							//Pula o ID do Cenario
							if ($data_name === 'id')
								continue;
							$update_data['wildcards'] .= (($update_data['wildcards'] !== '') ? ',' : '') . "{$data_name}=?";
							$update_data['bind'] .= ($data_name === 'nome') ? 's' : 'i';
							$update_data['values'][] = $new_data_value;
						}
						$update_data['bind'] .= 'i';
						$update_data['values'][] = $params['id_cenario'];
						$stmt = $mysqli->prepare("UPDATE rv__cenario SET {$update_data['wildcards']} WHERE id=?");
						$stmt->bind_param($update_data['bind'], ...$update_data['values']);
						$stmt->execute();
					}
				}
				if (!empty($params['update']['premissas'])){
					$place = 4;
					foreach ($params['update']['premissas'] as $premissa){
						$update_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
						//Prepara apenas os dados a serem atualizados
						foreach ($premissa as $data_name => $new_data_value){
							//Pula o ID da Premissa
							if ($data_name === 'id')
								continue;
							$update_data['wildcards'] .= (($update_data['wildcards'] !== '') ? ',' : '') . "{$data_name}=?";
							$update_data['bind'] .= ($data_name === 'nome' || $data_name === 'cor') ? 's' : 'i';
							$update_data['values'][] = $new_data_value;
						}
						$update_data['bind'] .= 'i';
						$update_data['values'][] = $premissa['id'];
						$stmt = $mysqli->prepare("UPDATE rv__cenario_premissa SET {$update_data['wildcards']} WHERE id=?");
						$stmt->bind_param($update_data['bind'], ...$update_data['values']);
						$stmt->execute();
					}
				}
				if (!empty($params['update']['observacoes'])){
					$place = 5;
					foreach ($params['update']['observacoes'] as $observacao){
						$update_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
						//Prepara apenas os dados a serem atualizados
						foreach ($observacao as $data_name => $new_data_value){
							//Pula o ID da Observacao
							if ($data_name === 'id')
								continue;
							$update_data['wildcards'] .= (($update_data['wildcards'] !== '') ? ',' : '') . "{$data_name}=?";
							$update_data['bind'] .= ($data_name === 'nome' || $data_name === 'cor') ? 's' : 'i';
							$update_data['values'][] = $new_data_value;
						}
						$update_data['bind'] .= 'i';
						$update_data['values'][] = $observacao['id'];
						$stmt = $mysqli->prepare("UPDATE rv__cenario_obs SET {$update_data['wildcards']} WHERE id=?");
						$stmt->bind_param($update_data['bind'], ...$update_data['values']);
						$stmt->execute();
					}
				}
				if (!empty($params['remove']['premissas'])){
					$place = 6;
					foreach ($params['remove']['premissas'] as $premissa){
						//Remove a premissa
						$stmt = $mysqli->prepare("DELETE FROM rv__cenario_premissa WHERE id=?");
				 		$stmt->bind_param('i', $premissa['id']);
						$stmt->execute();
					}
				}
				if (!empty($params['remove']['observacoes'])){
					$place = 7;
					foreach ($params['remove']['observacoes'] as $observacao){
						//Remove a observacao
						$stmt = $mysqli->prepare("DELETE FROM rv__cenario_obs WHERE id=?");
				 		$stmt->bind_param('i', $observacao['id']);
						$stmt->execute();
					}
				}
				$mysqli->commit();
		 		$mysqli->close();
		 		return ['status' => 1, 'data' => ['id' => $params['id_cenario'], 'id_arcabouco' => $params['id_arcabouco']]];
			}
			catch (mysqli_sql_exception $exception){
				$mysqli->rollback();
				if ($exception->getCode() === 1062){
					if ($place === 1 || $place === 4)
						$error = 'Essa premissa já está cadastrada neste cenário.';
					else if ($place === 2 || $place === 5)
						$error = 'Essa observação já está cadastrada neste cenário.';
					else if ($place === 3)
						$error = 'Já existe um cenário com esse nome neste arcabouço.';
				}
				else{
					if ($place === 1)
						$error = 'Erro no cadastro de novas premissas.';
					else if ($place === 2)
						$error = 'Erro no cadastro de novas observações.';
					else if ($place === 3)
						$error = 'Erro na atualização de cenários.';
					else if ($place === 4)
						$error = 'Erro na atualização de premissas.';
					else if ($place === 5)
						$error = 'Erro na atualização de observações.';
					else if ($place === 6)
						$error = 'Erro na remoção de premissas.';
					else if ($place === 7)
						$error = 'Erro na remoção de observações.';
				}
		 		$mysqli->close();
	 			return ['status' => 0, 'error' => $error];
			}
		}
		/*
			Remove um Cenario e suas (Premissas / Observacoes) no arcabouco de um usuario.
		*/
		public static function remove_cenarios($params = [], $id_usuario = ''){
			mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
			$mysqli = new mysqli(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			if ($mysqli->connect_errno)
				return ['status' => 0, 'error' => 'Failed to connect to MySQL: ' . $mysqli->connect_errno];
			$mysqli->begin_transaction();
			try {
				//Remove o cenario, premissas e observações
				$stmt = $mysqli->prepare("DELETE rvc,rvcp,rvco FROM rv__cenario rvc LEFT JOIN rv__cenario_premissa rvcp ON rvc.id=rvcp.id_cenario LEFT JOIN rv__cenario_obs rvco ON rvc.id=rvco.id_cenario WHERE rvc.id=?");
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
					'op' => $row['op'],
					'vol' => (float) $row['vol'],
					'cts' => (int) $row['cts'],
					'hora' => $row['hora'],
					'resultado' => (float) $row['resultado'],
					'cenario' => $row['cenario'],
					'premissas' => $row['premissas'],
					'observacoes' => $row['observacoes'],
					'erro' => (int) $row['erro'],
					'ativo_custo' => (float) $row['ativo_custo'],
					'ativo_valor_tick' => (float) $row['ativo_valor_tick'],
					'ativo_pts_tick' => (float) $row['ativo_pts_tick']
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
		 		if ($result_raw->num_rows > 0){
		 			$ult_seq = $result_raw->fetch_assoc()['ult_seq'];
		 			$operacoes_ja_cadastradas = [];
		 			//Busca operacoes ja cadastradas para evitar duplicatas (id_arcabouco, data, ativo, op, hora, resultado, cenario, premissas, observacoes)
	 				$stmt = $mysqli->prepare("SELECT gerenciamento,data,ativo,op,hora,resultado,cenario,premissas,observacoes FROM rv__operacoes WHERE id_arcabouco=?");
			 		$stmt->bind_param('i', $params['id_arcabouco']);
			 		$stmt->execute();
	 				$result_raw = $stmt->get_result();
	 				while($row = $result_raw->fetch_assoc()){
	 					$key = "{$row['gerenciamento']}{$row['data']}{$row['ativo']}{$row['op']}{$row['hora']}" . rtrim((strpos($row['resultado'], '.') !== false ? rtrim($row['resultado'], '0') : $row['resultado']), '.') . "{$row['cenario']}{$row['premissas']}{$row['observacoes']}";
						$operacoes_ja_cadastradas[$key] = NULL;
					}
					$block_size = 50;
					$block_i = 0;
					$insert_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
		 			foreach ($params['operacoes'] as $operacao){
		 				//Se fechou o bloco
		 				if ($block_i === $block_size){
		 					//Faz a inserção do Bloco
		 					$stmt = $mysqli->prepare("INSERT INTO rv__operacoes (id_arcabouco,id_usuario,sequencia,gerenciamento,data,ativo,op,vol,cts,hora,erro,resultado,cenario,premissas,observacoes,ativo_custo,ativo_valor_tick,ativo_pts_tick) VALUES {$insert_data['wildcards']}");
							$stmt->bind_param($insert_data['bind'], ...$insert_data['values']);
							$stmt->execute();
							//Reseta o Bloco de inserção
							$block_i = 0;
							$insert_data = ['wildcards' => '', 'values' => [], 'bind' => ''];
		 				}
		 				$find_by_key = "{$operacao['gerenciamento']}{$operacao['data']}{$operacao['ativo']}{$operacao['op']}{$operacao['hora']}" . rtrim((strpos($operacao['resultado'], '.') !== false ? rtrim($operacao['resultado'], '0') : $operacao['resultado']), '.') . "{$operacao['cenario']}{$operacao['premissas']}{$operacao['observacoes']}";
				 		if (!array_key_exists($find_by_key, $operacoes_ja_cadastradas)){
				 			$insert_data['wildcards'] .= (($insert_data['wildcards'] !== '') ? ',' : '').'(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
					 		$insert_data['bind'] .= 'iiisssisisisssssss';
					 		$insert_data['values'] = array_merge($insert_data['values'], [
					 			$params['id_arcabouco'],
					 			$id_usuario,
					 			$ult_seq,
					 			$operacao['gerenciamento'],
					 			$operacao['data'],
					 			$operacao['ativo'],
					 			$operacao['op'],
					 			$operacao['vol'],
					 			$operacao['cts'],
					 			$operacao['hora'],
					 			$operacao['erro'],
					 			$operacao['resultado'],
					 			$operacao['cenario'],
					 			$operacao['premissas'],
					 			$operacao['observacoes'],
					 			$operacao['ativo_custo'],
					 			$operacao['ativo_valor_tick'],
					 			$operacao['ativo_pts_tick']
					 		]);
							$ult_seq++;
							$block_i++;
				 		}
				 		else
				 			$hold_ops[] = $operacao['sequencia'];
		 			}
			 		//Insere caso não tenha fechado o bloco
			 		if ($block_i > 0){
			 			$stmt = $mysqli->prepare("INSERT INTO rv__operacoes (id_arcabouco,id_usuario,sequencia,gerenciamento,data,ativo,op,vol,cts,hora,erro,resultado,cenario,premissas,observacoes,ativo_custo,ativo_valor_tick,ativo_pts_tick) VALUES {$insert_data['wildcards']}");
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