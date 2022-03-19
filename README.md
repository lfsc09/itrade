### BD
Para desfragmentar a contagem de _ID_ em **_rv_operacoes_**:
```
SET @a:=0; UPDATE rv__operacoes SET id=@a:=@a+1 ORDER BY id;
SET @lastID = (SELECT MAX(id)+1 FROM rv__operacoes); 
SET @query = CONCAT('ALTER TABLE rv__operacoes AUTO_INCREMENT=', @lastID); 
PREPARE stmt FROM @query; 
EXECUTE stmt; 
DEALLOCATE PREPARE stmt;
```

### Para gerar ambientes locais
1 - Configurar no Apache **_httpd.conf_**:
```
<VirtualHost *:80>
    ServerName lucas.itrade-dongs.net
    DocumentRoot "C:\xampp\htdocs\itrade"
</VirtualHost>
```
<br>

2 - Jogar no **_host_** do windows
```
127.0.0.1 lucas.itrade-dongs.net
```
<br>

3 - Configurar o usuario de acesso no BD
<br>

4 - Importar o BD:
**_Powershell_**
```
cmd.exe /c "mysql.exe -u root -pitrade@124 u631028490_iTrade < C:\local_do_arquivo\nome_do_arquivo.sql"
```
<br>

5 - Gerar o arquivo **_db_config.php_**:
```
<?php
	class DB_Config {
		public static $PATH = "localhost";
		public static $USER = "root";
		public static $PASS = "itrade@124";
		public static $DB = "u631028490_iTrade";
	}
?>
```
