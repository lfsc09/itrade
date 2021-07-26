<?php
	require "db_config.php";
	class Ativos {
		public static function get_ativos($params = []){
			$result = [];
			$mysqli = mysqli_connect(DB_Config::$PATH, DB_Config::$USER, DB_Config::$PASS, DB_Config::$DB);
			mysqli_set_charset($mysqli, 'utf8');
			if (mysqli_connect_errno())
				return ["status" => 0, "error" => "Failed to connect to MySQL: " . mysqli_connect_error()];
			$result_raw = mysqli_query($mysqli, "SELECT a.* FROM ativos a ORDER BY a.nome");
			while($row = $result_raw->fetch_assoc())
				$result[] = $row;
			mysqli_free_result($result_raw);
			mysqli_close($mysqli);
			return ["status" => 1, "data" => $result];
		}
	}
?>