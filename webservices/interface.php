<?php
	session_start();
	if (isset($_SESSION['username'])){
		if (!array_key_exists('module', $_POST) || $_POST['module'] === '')
			die(json_encode(['status' => 0, 'error' => 'No Module']));
		if (!array_key_exists('action', $_POST) || $_POST['action'] === '')
			die(json_encode(['status' => 0, 'error' => 'No action']));
		$module = $_POST['module'];
		$action = $_POST['action'];
		$params_data = (array_key_exists('params', $_POST))?$_POST['params']:[];
		switch ($module){
			/*-------------------------------- RENDA VARIAVEL ---------------------------------*/
			case 'renda_variavel':
				include_once 'api__renda_variavel.php';
				/*---------------------------------- Arcabouços -----------------------------------*/
				if ($action === 'get_arcabouco_data'){
					$return_data = [];
					if (empty($params_data)){
						include_once 'api__usuarios.php';
						$status = Usuarios::get_usuarios(null, $_SESSION['id']);
						if ($status['status'])
							$return_data['usuarios'] = $status['data'];
						$status = RendaVariavel::get_ativos(null, $_SESSION['id']);
						if ($status['status'])
							$return_data['ativos'] = $status['data'];
						$status = RendaVariavel::get_gerenciamentos(null, $_SESSION['id']);
						if ($status['status'])
							$return_data['gerenciamentos'] = $status['data'];
						$status = RendaVariavel::get_arcaboucos([], $_SESSION['id']);
						if ($status['status']){
							$return_data['arcaboucos'] = $status['data'];
							if (!empty($return_data['arcaboucos']))
								$params_data['id_arcabouco'] = $return_data['arcaboucos'][0]['id'];
						}
					}
					if (!empty($params_data)){
						$status = RendaVariavel::get_cenarios($params_data, $_SESSION['id']);
						if ($status['status'])
							$return_data['cenarios'] = $status['data'];
						$status = RendaVariavel::get_operacoes($params_data, $_SESSION['id']);
						if ($status['status'])
							$return_data['operacoes'] = $status['data'];
					}
					echo json_encode(['status' => 1, 'data' => $return_data]);
				}
				else if ($action === 'insert_arcaboucos'){
					if (!empty($params_data)){
						$status = RendaVariavel::insert_arcaboucos($params_data, $_SESSION['id']);
						if ($status['status'])
							$status = RendaVariavel::get_arcaboucos([], $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else if ($action === 'update_arcaboucos'){
					if (!empty($params_data)){
						$status = RendaVariavel::update_arcaboucos($params_data, $params_data['id'], $_SESSION['id']);
						if ($status['status'])
							$status = RendaVariavel::get_arcaboucos($status['data'], $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else if ($action === 'remove_arcaboucos'){
					if (!empty($params_data))
						echo json_encode(RendaVariavel::remove_arcaboucos($params_data, $_SESSION['id']));
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				/*------------------------------------ Ativos -------------------------------------*/
				else if ($action === 'insert_ativos'){
					if (!empty($params_data)){
						$status = RendaVariavel::insert_ativos($params_data, $_SESSION['id']);
						if ($status['status'])
							$status = RendaVariavel::get_ativos(null, $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else if ($action === 'update_ativos'){
					if (!empty($params_data)){
						$status = RendaVariavel::update_ativos($params_data, $params_data['id'], $_SESSION['id']);
						if ($status['status'])
							$status = RendaVariavel::get_ativos(null, $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else if ($action === 'remove_ativos'){
					if (!empty($params_data)){
						$status = RendaVariavel::remove_ativos($params_data, $_SESSION['id']);
						if ($status['status'])
							$status = RendaVariavel::get_ativos(null, $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				/*--------------------------------- Gerenciamentos --------------------------------*/
				else if ($action === 'insert_gerenciamentos'){
					if (!empty($params_data)){
						$status = RendaVariavel::insert_gerenciamentos($params_data, $_SESSION['id']);
						if ($status['status'])
							$status = RendaVariavel::get_gerenciamentos(null, $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else if ($action === 'update_gerenciamentos'){
					if (!empty($params_data)){
						$status = RendaVariavel::update_gerenciamentos($params_data, $params_data['id'], $_SESSION['id']);
						if ($status['status'])
							$status = RendaVariavel::get_gerenciamentos(null, $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else if ($action === 'remove_gerenciamentos'){
					if (!empty($params_data)){
						$status = RendaVariavel::remove_gerenciamentos($params_data, $_SESSION['id']);
						if ($status['status'])
							$status = RendaVariavel::get_gerenciamentos(null, $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				/*----------------------------------- Cenários ------------------------------------*/
				else if ($action === 'get_cenarios'){
					if (!empty($params_data))
						echo json_encode(RendaVariavel::get_cenarios($params_data, $_SESSION['id']));
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else if ($action === 'insert_update_cenarios'){
					if (!empty($params_data)){
						$status = RendaVariavel::insert_update_cenarios($params_data, $_SESSION['id']);
						if ($status['status']){
							$operacoes_data = RendaVariavel::get_operacoes(['id_arcabouco' => $status['data']['id_arcabouco']], $_SESSION['id']);
							$cenarios_data = RendaVariavel::get_cenarios(['id_arcabouco' => $status['data']['id_arcabouco']], $_SESSION['id']);
							if ($cenarios_data['status'])
								$status['data']['cenarios'] = $cenarios_data['data'];
							if ($operacoes_data['status'])
								$status['data']['operacoes'] = $operacoes_data['data'];
						}
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else if ($action === 'remove_cenarios'){
					if (!empty($params_data))
						echo json_encode(RendaVariavel::remove_cenarios($params_data, $_SESSION['id']));
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				/*------------------------------------ Operação -----------------------------------*/
				else if ($action === 'insert_operacoes'){
					if ($params_data === '')
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
					$unserial_params_data = json_decode($params_data, true);
					if (!empty($unserial_params_data)){
						$status = RendaVariavel::insert_operacoes($unserial_params_data, $_SESSION['id']);
						if ($status['status']){
							$operacoes_data = RendaVariavel::get_operacoes(['id_arcabouco' => $unserial_params_data['id_arcabouco']], $_SESSION['id']);
							$arcabouco_data = RendaVariavel::get_arcaboucos(['id' => $unserial_params_data['id_arcabouco']], $_SESSION['id']);
							if ($operacoes_data['status'])
								$status['data']['operacoes'] = $operacoes_data['data'];
							if ($arcabouco_data['status'])
								$status['data']['arcabouco'] = $arcabouco_data['data'];
						}
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else if ($action === 'remove_operacoes'){
					if (!empty($params_data)){
						$status = RendaVariavel::remove_operacoes($params_data, $_SESSION['id']);
						if ($status['status']){
							$operacoes_data = RendaVariavel::get_operacoes(['id_arcabouco' => $params_data['id_arcabouco']], $_SESSION['id']);
							$arcabouco_data = RendaVariavel::get_arcaboucos(['id' => $params_data['id_arcabouco']], $_SESSION['id']);
							if ($operacoes_data['status'])
								$status['data']['operacoes'] = $operacoes_data['data'];
							if ($arcabouco_data['status'])
								$status['data']['arcabouco'] = $arcabouco_data['data'];
						}
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else
					die(json_encode(['status' => 0, 'error' => 'Action not found']));
				break;
			/*------------------------------ CONTROLE FINANCEIRO ------------------------------*/
			case 'controle_financeiro':
				include_once 'api__controle_financeiro.php';
				if ($action === 'get_data'){
					$return_data = [];
					$status = ControleFinanceiro::get_contas(null, $_SESSION['id']);
					if ($status['status'])
						$return_data['contas'] = $status['data'];
					$status = ControleFinanceiro::get_cartoes_credito(null, $_SESSION['id']);
					if ($status['status'])
						$return_data['cartoes_credito'] = $status['data'];
					// $status = ControleFinanceiro::get_gerenciamentos(null, $_SESSION['id']);
					// if ($status['status'])
					// 	$return_data['gerenciamentos'] = $status['data'];
					// $status = ControleFinanceiro::get_arcaboucos([], $_SESSION['id']);
					// if ($status['status']){
					// 	$return_data['arcaboucos'] = $status['data'];
					// 	if (!empty($return_data['arcaboucos']))
					// 		$params_data['id_arcabouco'] = $return_data['arcaboucos'][0]['id'];
					// }
					// $status = RendaVariavel::get_cenarios($params_data, $_SESSION['id']);
					// if ($status['status'])
					// 	$return_data['cenarios'] = $status['data'];
					// $status = RendaVariavel::get_operacoes($params_data, $_SESSION['id']);
					// if ($status['status'])
					// 	$return_data['operacoes'] = $status['data'];
					echo json_encode(['status' => 1, 'data' => $return_data]);
				}
				/*------------------------------------ Contas -------------------------------------*/
				else if ($action === 'insert_contas'){
					if (!empty($params_data)){
						$status = ControleFinanceiro::insert_contas($params_data, $_SESSION['id']);
						if ($status['status'])
							$status = ControleFinanceiro::get_contas(null, $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else if ($action === 'update_contas'){
					if (!empty($params_data)){
						$status = ControleFinanceiro::update_contas($params_data, $params_data['id'], $_SESSION['id']);
						if ($status['status'])
							$status = ControleFinanceiro::get_contas(null, $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else if ($action === 'remove_contas'){
					if (!empty($params_data)){
						$status = ControleFinanceiro::remove_contas($params_data, $_SESSION['id']);
						if ($status['status'])
							$status = ControleFinanceiro::get_contas(null, $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				/*------------------------------- Cartões de Crédito ------------------------------*/
				else if ($action === 'insert_cartoes_credito'){
					if (!empty($params_data)){
						$status = ControleFinanceiro::insert_cartoes_credito($params_data, $_SESSION['id']);
						if ($status['status'])
							$status = ControleFinanceiro::get_cartoes_credito(null, $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else if ($action === 'update_cartoes_credito'){
					if (!empty($params_data)){
						$status = ControleFinanceiro::update_cartoes_credito($params_data, $params_data['id'], $_SESSION['id']);
						if ($status['status'])
							$status = ControleFinanceiro::get_cartoes_credito(null, $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				else if ($action === 'remove_cartoes_credito'){
					if (!empty($params_data)){
						$status = ControleFinanceiro::remove_cartoes_credito($params_data, $_SESSION['id']);
						if ($status['status'])
							$status = ControleFinanceiro::get_cartoes_credito(null, $_SESSION['id']);
						echo json_encode($status);
					}
					else
						die(json_encode(['status' => 0, 'error' => 'No data passed']));
				}
				break;
			/*------------------------------------ LOGOUT -------------------------------------*/
			case 'login':
				include 'api__login.php';
				if ($action === 'logout'){
					Login::logout();
					echo json_encode(['status' => 1]);
				}
				else
					die(json_encode(['status' => 0, 'error' => 'Action not found']));
				break;
			default:
				die(json_encode(['status' => 0, 'error' => 'Module not found']));
		}
	}
	else
		die(json_encode(['status' => 0, 'error' => 'Not logged']));
?>