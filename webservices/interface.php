<?php
	session_start();
	if (isset($_SESSION["username"])){
		if (!array_key_exists("module", $_POST) || $_POST["module"] === "")
			die(json_encode(["status" => 0, "error" => "No Module"]));
		if (!array_key_exists("action", $_POST) || $_POST["action"] === "")
			die(json_encode(["status" => 0, "error" => "No action"]));
		$module = $_POST["module"];
		$action = $_POST["action"];
		$params_data = (array_key_exists("params", $_POST))?$_POST["params"]:[];
		switch ($module){
			/*------------------------------------ ATIVOS -------------------------------------*/
			case "ativos":
				include_once 'api__ativos.php';
				if ($action === "get_ativos")
					echo json_encode(Ativos::get_ativos(null, $_SESSION["id"]));
				else if ($action === "insert_ativos"){
					if (!empty($params_data))
						echo json_encode(Ativos::insert_ativos($params_data, $_SESSION["id"]));
					else
						die(json_encode(["status" => 0, "error" => "No data passed"]));
				}
				else if ($action === "update_ativos"){
					if (!empty($params_data))
						echo json_encode(Ativos::update_ativos($params_data, $params_data["id"], $_SESSION["id"]));
					else
						die(json_encode(["status" => 0, "error" => "No data passed"]));
				}
				else
					die(json_encode(["status" => 0, "error" => "Action not found"]));
				break;
			/*-------------------------------- RENDA VARIAVEL ---------------------------------*/
			case "renda_variavel":
				include_once 'api__renda_variavel.php';
				/*---------------------------------- Arcabouços -----------------------------------*/
				if ($action === "get_arcaboucos")
					echo json_encode(RendaVariavel::get_arcaboucos(null, $_SESSION["id"]));
				else if ($action === "insert_arcaboucos"){
					if (!empty($params_data))
						echo json_encode(RendaVariavel::insert_arcaboucos($params_data, $_SESSION["id"]));
					else
						die(json_encode(["status" => 0, "error" => "No data passed"]));
				}
				else if ($action === "update_arcaboucos"){
					if (!empty($params_data))
						echo json_encode(RendaVariavel::update_arcaboucos($params_data, $params_data["id"], $_SESSION["id"]));
					else
						die(json_encode(["status" => 0, "error" => "No data passed"]));
				}
				/*----------------------------------- Cenários ------------------------------------*/
				else if ($action === "get_cenarios"){
					if (!empty($params_data))
						echo json_encode(RendaVariavel::get_cenarios($params_data, $_SESSION["id"]));
					else
						die(json_encode(["status" => 0, "error" => "No data passed"]));
				}
				else if ($action === "insert_cenarios"){
					if (!empty($params_data)){
						$status = RendaVariavel::insert_cenarios($params_data, $_SESSION["id"]);
						if ($status["status"])
							$status = RendaVariavel::get_cenarios($status["data"], $_SESSION["id"]);
						echo json_encode($status);
					}
					else
						die(json_encode(["status" => 0, "error" => "No data passed"]));
				}
				else if ($action === "update_cenarios"){
					if (!empty($params_data)){
						$status = RendaVariavel::update_cenarios($params_data, $_SESSION["id"]);
						if ($status["status"])
							$status = RendaVariavel::get_cenarios($status["data"], $_SESSION["id"]);
						echo json_encode($status);
					}
					else
						die(json_encode(["status" => 0, "error" => "No data passed"]));
				}
				else if ($action === "remove_cenarios"){
					if (!empty($params_data))
						echo json_encode(RendaVariavel::remove_cenarios($params_data, $_SESSION["id"]));
					else
						die(json_encode(["status" => 0, "error" => "No data passed"]));
				}
				/*--------------------------------- Operação Add ----------------------------------*/
				else if ($action === "get_operacoesAdd"){
					if (!empty($params_data)){
						include_once 'api__ativos.php';
						$return_data = [];
						$status = RendaVariavel::get_cenarios($params_data, $_SESSION["id"]);
						if ($status["status"])
							$return_data["cenarios"] = $status["data"];
						$status = Ativos::get_ativos(null, $_SESSION["id"]);
						if ($status["status"])
							$return_data["ativos"] = $status["data"];
						echo json_encode(["status" => 1, "data" => $return_data]);
					}
					else
						die(json_encode(["status" => 0, "error" => "No data passed"]));
				}
				break;
			/*------------------------------------ LOGOUT -------------------------------------*/
			case "login":
				include 'api__login.php';
				if ($action === "logout"){
					Login::logout();
					echo json_encode(["status" => 1]);
				}
				else
					die(json_encode(["status" => 0, "error" => "Action not found"]));
				break;
			default:
				die(json_encode(["status" => 0, "error" => "Module not found"]));
		}
	}
	else
		die(json_encode(["status" => 0, "error" => "Not logged"]));
?>