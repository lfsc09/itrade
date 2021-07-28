<?php
	session_start();
	if (isset($_SESSION["username"])){
		if (!array_key_exists("module", $_POST) || $_POST["module"] === "")
			die("No Module");
		if (!array_key_exists("action", $_POST) || $_POST["action"] === "")
			die("No action");
		$module = $_POST["module"];
		$action = $_POST["action"];
		$params_data = (array_key_exists("params", $_POST))?$_POST["params"]:[];
		switch ($module){
			case "ativos":
				include 'api__ativos.php';
				if ($action === "get_ativos")
					echo json_encode(Ativos::get_ativos(null, $_SESSION["id"]));
				else if ($action === "insert_ativos"){
					if (!empty($params_data)){
						$params_data["id_usuario"] = $_SESSION["id"];
						echo json_encode(Ativos::insert_ativos($params_data));
					}
					else
						die("No data passed");
				}
				else if ($action === "update_ativos"){
					if (!empty($params_data))
						echo json_encode(Ativos::update_ativos($params_data, $params_data["id"]));
					else
						die("No data passed");
				}
				else
					die("Action not found");
				break;
			case "login":
				include 'api__login.php';
				if ($action === "logout"){
					Login::logout();
					echo json_encode(["status" => 1]);
				}
				else
					die("Action not found");
				break;
			default:
				die("Module not found");
		}
	}
	else
		die("Not logged");
?>