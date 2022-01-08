# BD
Para desfragmentar a contagem de ID em RV__OPERAÇÕES:
> SET @a:=0; UPDATE rv__operacoes SET id=@a:=@a+1 ORDER BY id
