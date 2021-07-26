<?php
	if (!array_key_exists("module", $_POST) || $_POST["module"] === "")
		die("No Module");
	if (!array_key_exists("action", $_POST) || $_POST["action"] === "")
		die("No action");
	$module = $_POST["module"];
	$action = $_POST["action"];
	$params_data = (array_key_exists("params", $_POST))?$_POST["params"]:[];
	switch ($module){
		case "ativos":
			include 'ativos__api.php';
			if ($action === "get_ativos")
				echo json_encode(Ativos::get_ativos());
			else
				die("Action not found");
			break;
		default:
			die("Module not found");
	}
?>