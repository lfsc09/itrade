# BD
Para desfragmentar a contagem de ID em RV__OPERAÇÕES:
> SET @a:=0; UPDATE rv__operacoes SET id=@a:=@a+1 ORDER BY id; SET @lastID = (SELECT MAX(id)+1 FROM rv__operacoes); SET @query = CONCAT('ALTER TABLE rv__operacoes AUTO_INCREMENT=', @lastID); PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;
