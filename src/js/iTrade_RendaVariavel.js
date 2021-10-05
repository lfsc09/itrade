let Renda_variavel = (function(){
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------------ VARS --------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	//Contem a lista atual de usuarios cadastrados
	let	_usuarios = [];
	//Contem a lista atual de arcaboucos cadastrados
	let	_arcaboucos = {};
	//Contem a lista de instancias de arcabouços selecionadas
	let	_arcaboucos__instancias = [];
	let	_arcaboucos__instancias_colors = ['--bs-blue', '--bs-red', '--bs-green', '--bs-orange', '--bs-indigo'];
	//Funcoes usadas em '_arcabouco__table_DT'
	let _arcabouco__table_DT_ext = {
		meta_render: function (data, type, row){
			return (type === 'display') ? `<progress class="mx-3" value="${data}" max="100"></progress>` : data;
		}
	}
	//Configuração da tabela de arcabouços em 'arcabouco_modal'
	let _arcabouco__table_DT = {
		"columns": [
			{"name": "nome", "orderable": true},
			{"name": "data_criacao", "orderable": true},
			{"name": "data_atualizacao", "orderable": true},
			{"name": "qtd_ops", "orderable": true},
			{"name": "meta", "orderable": true, render: _arcabouco__table_DT_ext.meta_render},
			{"name": "usuarios", "orderable": false},
			{"name": "editar", "orderable": false},
			{"name": "remover", "orderable": false}
		],
		"order": [[ 2, 'desc' ]],
		"pageLength": 25,
		"pagingType": "input"
	}
	//Informa qual seção do Section Arcabouço está sendo mostrado (dashboard_ops|lista_ops)
	let	_selected_arcabouco_section = 'dashboard_ops';
	//Contem a lista atual de cenarios do arcabouço selecionado
	let _cenarios_arcabouco = {};
	//Contem a lista atual de ativos cadastrados
	let	_ativos = [];
	//Contem a lista atual de operações do arcabouço selecionado
	let	_operacoes_arcabouco = [];
	//Variavel usada no controle de click, para saber se está pressionado o click ou não
	let _lista_ops__table_DT_clickState = 0;
	//Funcoes usadas em '_lista_ops__table_DT'
	let _lista_ops__table_DT_ext = {
		preco_render: function (data, type, row){
			if (data == 0)
				return '';
			if (row[3].toLowerCase().includes("win"))
				return $.fn.dataTable.render.number( '.', '', 0, '').display(data);
			else if (row[3].toLowerCase().includes("wdo"))
				return $.fn.dataTable.render.number( '.', ',', 2, '').display(data);
			else
				return data;
		},
		vol_render: function (data, type, row){
			return $.fn.dataTable.render.number( '.', '', 0, '').display(data);
		}
	}
	//Configuração da tabela de operações em 'lista_ops'
	let _lista_ops__table_DT = {
		"columns": [
			{"name": "id", "orderable": true},
			{"name": "data", "orderable": true, "type": "br-date"},
			{"name": "hora", "orderable": true},
			{"name": "ativo", "orderable": true},
			{"name": "op", "orderable": true},
			{"name": "vol", "orderable": true, render: _lista_ops__table_DT_ext.vol_render},
			{"name": "cts", "orderable": true},
			{"name": "entrada", "orderable": false, render: _lista_ops__table_DT_ext.preco_render},
			{"name": "stop", "orderable": false, render: _lista_ops__table_DT_ext.preco_render},
			{"name": "alvo", "orderable": false, render: _lista_ops__table_DT_ext.preco_render},
			{"name": "men", "orderable": false, render: _lista_ops__table_DT_ext.preco_render},
			{"name": "mep", "orderable": false, render: _lista_ops__table_DT_ext.preco_render},
			{"name": "saida", "orderable": false, render: _lista_ops__table_DT_ext.preco_render},
			{"name": "cenario", "orderable": true},
			{"name": "premissas", "orderable": false},
			{"name": "observacoes", "orderable": false},
			{"name": "erro", "orderable": false}
		],
		columnDefs: [{
			targets: [1],
			orderData: [1, 2]
		}],
		"order": [[ 0, 'desc' ]],
		"pageLength": 25,
		"pagingType": "input"
	}
	/*
		Realiza a abertura e leitura do arquivo csv. (Importar operações)
	*/
	let _csv_reader = {
		reader: new FileReader(),
		processData: function (allText, options){
		 	let allTextLines = allText.split(/\r\n|\n/),
		 		lines = [];
		    if (options.file_format === "excel" || options.file_format === "profit"){
			    for (let i=0; i<allTextLines.length; i++)
		            lines.push(allTextLines[i].split(";"));
		    }
		    else if (options.file_format === "tryd"){
		    	for (let i=0; i<allTextLines.length; i++){
		    		let broken_lines = allTextLines[i].split("\",\"");
		    		if (broken_lines.length > 1){
			    		broken_lines[0] = broken_lines[0].replace(/^\"/, "");
			    		broken_lines[broken_lines.length-1] = broken_lines[broken_lines.length-1].replace(/\",?/, "");
			            lines.push(broken_lines);
		    		}
		    	}
		    }
	        return lines;
		},
		cleanData: function (obj, options){
			let newData = [],
				dataMap = [],
				data_limit = -1;
			for (let line=0; line<obj.length; line++){
				if (options.file_format === "excel"){
					//Primeira linha Header do arquivo (Deve ser Data, para identificacao do Header)
					if (obj[line][0] === "Data"){
						data_limit = obj[line].length;
						for (let a=0; a<obj[line].length; a++)
							dataMap[a] = obj[line][a];
					}
					else if (obj[line].length === data_limit){
						let operacao = ((dataMap.indexOf("Op") !== -1)?obj[line][dataMap.indexOf("Op")].toLowerCase():"");
						newData.push({
							"ativo": obj[line][dataMap.indexOf("Ativo")],
							"op": ((operacao === "")?0:(operacao === "c")?1:2),
							"rr": obj[line][dataMap.indexOf("R:R")],
							"vol": ((dataMap.indexOf("Vol") !== -1)?(obj[line][dataMap.indexOf("Vol")].replace(/\.+/g, "")).replace(/\,+/g, "."):""),
							"cts": obj[line][dataMap.indexOf("Cts")],
							"cenario": obj[line][dataMap.indexOf("Padrao")],
							"premissas": ((dataMap.indexOf("Premissas") !== -1)?obj[line][dataMap.indexOf("Premissas")].split(","):[]),
							"observacoes": ((dataMap.indexOf("Observacoes") !== -1)?obj[line][dataMap.indexOf("Observacoes")].split(","):[]),
							"erro": ((dataMap.indexOf("Erro") !== -1)?obj[line][dataMap.indexOf("Erro")]:""),
							"data": obj[line][dataMap.indexOf("Data")],
							"hora": obj[line][dataMap.indexOf("Hora")],
							"entrada": ((dataMap.indexOf("Entrada") !== -1)?(obj[line][dataMap.indexOf("Entrada")].replace(/\.+/g, "")).replace(/\,+/g, "."):""),
							"stop": ((dataMap.indexOf("Stop") !== -1)?(obj[line][dataMap.indexOf("Stop")].replace(/\.+/g, "")).replace(/\,+/g, "."):""),
							"alvo": ((dataMap.indexOf("Alvo") !== -1)?(obj[line][dataMap.indexOf("Alvo")].replace(/\.+/g, "")).replace(/\,+/g, "."):""),
							"men": ((dataMap.indexOf("Men") !== -1)?(obj[line][dataMap.indexOf("Men")].replace(/\.+/g, "")).replace(/\,+/g, "."):""),
							"mep": ((dataMap.indexOf("Mep") !== -1)?(obj[line][dataMap.indexOf("Mep")].replace(/\.+/g, "")).replace(/\,+/g, "."):""),
							"saida": ((dataMap.indexOf("Saida") !== -1)?(obj[line][dataMap.indexOf("Saida")].replace(/\.+/g, "")).replace(/\,+/g, "."):"")
						});
					}
				}
				else if (options.file_format === "profit"){
					//Primeira coluna do cabecalho (Subconta) ou (Ativo)
					if (obj[line][0] === "Ativo"){
						data_limit = obj[line].length;
						for (let a=0; a<obj[line].length; a++)
							dataMap[a] = obj[line][a];
					}
					else if (obj[line].length === data_limit){
						let operacao = obj[line][dataMap.indexOf("Lado")],
							preco_compra = parseFloat((obj[line][dataMap.indexOf("Preço Compra")].replace(/\.+/g, "")).replace(/\,+/g, ".")),
							preco_venda = parseFloat((obj[line][dataMap.indexOf("Preço Venda")].replace(/\.+/g, "")).replace(/\,+/g, ".")),
							mep = parseFloat((obj[line][dataMap.indexOf("MEP")].replace(/\.+/g, "")).replace(/\,+/g, ".")),
							men = parseFloat((obj[line][dataMap.indexOf("MEN")].replace(/\.+/g, "")).replace(/\,+/g, "."));
						if (options.table_layout === "scalp"){
							newData.push({
								"ativo": obj[line][dataMap.indexOf("Ativo")],
								"op": ((operacao === "C")?1:2),
								"vol": "",
								//Profit mostra Qtd Compra e Qtd Venda. Em uma Compra eu quero saber quando eu vendi (qtd. de saída). Em uma Venda o contrário.
								"cts": ((operacao === "C")?obj[line][dataMap.indexOf("Qtd Venda")]:obj[line][dataMap.indexOf("Qtd Compra")]),
								"cenario": "",
								"premissas": [],
								"observacoes": [],
								"erro": "",
								"data": obj[line][dataMap.indexOf("Abertura")].split(" ")[0],
								"hora": obj[line][dataMap.indexOf("Abertura")].split(" ")[1],
								"entrada": ((operacao === "C")?preco_compra:preco_venda),
								"stop": "",
								"alvo": "",
								"men": ((operacao === "C")?(preco_compra - Math.abs(men)):(preco_venda + Math.abs(men))),
								"mep": ((operacao === "C")?(preco_compra + Math.abs(men)):(preco_venda - Math.abs(men))),
								"saida": ((operacao === "C")?preco_venda:preco_compra)
							});
						}
					}
				}
				else if (options.file_format === "tryd"){
					//Primeira coluna do cabecalho (Papel)
					if (obj[line][0] === "Papel"){
						data_limit = obj[line].length;
						for (let a=0; a<obj[line].length; a++)
							dataMap[a] = obj[line][a];
					}
					else if (obj[line].length === data_limit){
						let operacao = obj[line][dataMap.indexOf("C/V")],
							preco_compra = (obj[line][dataMap.indexOf("Prc Médio Cpa")].replace(/\.+/g, "")).replace(/\,+/g, "."),
							preco_venda = (obj[line][dataMap.indexOf("Prc Médio Vda")].replace(/\.+/g, "")).replace(/\,+/g, ".");
						if (options.table_layout === "scalp"){
							newData.push({
								"ativo": obj[line][dataMap.indexOf("Papel")],
								"op": ((operacao === "C")?1:2),
								"vol": "",
								"cts": obj[line][dataMap.indexOf("Qtd")],
								"cenario": "",
								"premissas": [],
								"observacoes": [],
								"erro": "",
								"data": obj[line][dataMap.indexOf("Data")],
								"hora": obj[line][dataMap.indexOf("Abertura")],
								"entrada": ((operacao === "C")?preco_compra:preco_venda),
								"stop": "",
								"alvo": "",
								"men": obj[line][dataMap.indexOf("MEN")],
								"mep": obj[line][dataMap.indexOf("MEP")],
								"saida": ((operacao === "C")?preco_venda:preco_compra)
							});
						}
					}
				}
			}
			return newData;
		}
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------------- FUNCOES ------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------- Section Arcabouço --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Controla a lista de instancias de arcabouço selecionadas.
	*/
	let ctrl__instancias = {
		get: function (id_inst){
			for (let i in _arcaboucos__instancias){
				if (_arcaboucos__instancias[i].instancia === id_inst)
					return _arcaboucos__instancias[i];
			}
			return null;
		},
		getSelected: function (key = ''){
			for (let i in _arcaboucos__instancias){
				if (_arcaboucos__instancias[i].selected){
					if (key !== '')
						return _arcaboucos__instancias[i][key];
					return _arcaboucos__instancias[i];
				}
			}
			return null;
		},
		size: function (){
			return _arcaboucos__instancias.length;
		},
		setSelected: function (id_inst, refresh = true){
			for (let i in _arcaboucos__instancias)
				_arcaboucos__instancias[i].selected = (_arcaboucos__instancias[i].instancia === id_inst);
			if (refresh)
				rebuildCtrl__instanciasHTML();
		},
		add: function (inst, refresh = true){
			if (_arcaboucos__instancias.length !== 0 && _arcaboucos__instancias.length === _arcaboucos__instancias_colors.length)
				return true;
			_arcaboucos__instancias.push(inst);
			if (refresh)
				rebuildCtrl__instanciasHTML();
		},
		remove: function (id_inst, refresh = true){
			for (let i in _arcaboucos__instancias){
				if (_arcaboucos__instancias[i].instancia === id_inst){
					if (_arcaboucos__instancias[i].selected)
						return true;
					_arcaboucos__instancias.splice(i, 1);
				}
			}
			if (refresh)
				rebuildCtrl__instanciasHTML();
		}
	}
	/*
		Atualiza a lista interna de usuarios.
	*/
	function updateUsuarios(data){
		//Atualiza o array
		_usuarios = data;
	}
	/*
		Atualiza a lista interna de arcabouços.
	*/
	let updateArcaboucos = {
		create: function (data){
			//Atualiza o objeto
			_arcaboucos = {};
			for (let a in data){
				//Reordena a lista de usuarios
				data[a]["usuarios"].sort((a,b) => (a.criador < b.criador) ? 1 : a.usuario.localeCompare(b.usuario));
				_arcaboucos[data[a].id] = data[a];
			}
		},
		update: function (data){
			//Atualiza o objeto
			data["usuarios"].sort((a,b) => (a.criador < b.criador) ? 1 : a.usuario.localeCompare(b.usuario));
			_arcaboucos[data.id] = data;
		},
		remove: function (id){
			//Atualiza o objeto
			delete _arcaboucos[id];
		}
	}
	/*
		Atualiza a lista interna de operações do arcabouco selecionado.
	*/
	function updateOperacoes_Arcabouco(data){
		//Atualiza o array
		_operacoes_arcabouco = data;
		//Atualiza a contagem de operacoes na lista de arcabouco
		// $("a.arcabouco-selected", document.getElementById("table_arcaboucos")).find("small").html(`${$.fn.dataTable.render.number( '.', '', 0, '').display(data.length)} ops.`);
	}
	/*
		Atualiza a lista interna de cenários.
	*/
	let updateCenarios_Arcabouco = {
		create: function (data){
			//Atualiza o objeto
			_cenarios_arcabouco = {};
			for (let cn in data)
				_cenarios_arcabouco[data[cn].id] = data[cn];
		},
		update: function (data){
			//Atualiza o objeto
			_cenarios_arcabouco[data.id] = data;
		},
		remove: function (id){
			//Atualiza o objeto
			delete _cenarios_arcabouco[id];
		}
	}
	/*
		Atualiza a lista interna de ativos.
	*/
	function updateAtivos(data){
		//Atualiza o array
		_ativos = data;
	}
	/*
		Reconstroi a lista de instacia em 'renda_variavel__instancias'.
	*/
	function rebuildCtrl__instanciasHTML(){
		let html = ``;
		for (let i in _arcaboucos__instancias)
			html += `<span class="badge badge-primary rounded-pill p-2 ${((i > 0) ? "ms-2" : "")}" style="background-color: var(${_arcaboucos__instancias[i].color}) !important" instancia="${_arcaboucos__instancias[i].instancia}">${((_arcaboucos__instancias[i].selected) ? `<i class="fas fa-crown me-2"></i>` : "")}${_arcaboucos__instancias[i].nome}</span>`;
		$(document.getElementById("renda_variavel__instancias")).empty().append(html);
	}
	/*
		Reconstrói a seção de Dashboard estatistico ou a seção de lista de operações do arcabouço selecionado.
	*/
	function rebuildArcaboucoSection(){
		let html = ``;
		if (_operacoes_arcabouco.length > 0){
			if (_selected_arcabouco_section === 'lista_ops'){
				//Submenu acima da Tabela
				html += `<div class="card mb-2 rounded-3 shadow-sm">`+
						`<div class="card-body p-2">`+
						`<div class="container-fluid d-flex justify-content-end px-0" id="lista_ops__actions">`+
						`<form class="row m-0 flex-fill">`+
						`<div class="col-auto"><input type="text" name="data" class="form-control form-control-sm" onclick="this.select()" placeholder="Data"></div>`+
						`<div class="col-auto"><input type="text" name="ativo" class="form-control form-control-sm" onclick="this.select()" placeholder="Ativo"></div>`+
						`<div class="col-auto"><input type="text" name="cenario" class="form-control form-control-sm ms-auto" onclick="this.select()" placeholder="Cenário"></div>`+
						`</form>`+
						`<button class="btn btn-sm btn-outline-primary me-2 d-none" type="button" name="alterar_sel"><i class="fas fa-edit me-2"></i>Editar</button>`+
						`<button class="btn btn-sm btn-outline-danger me-2 d-none" type="button" name="remove_sel" title="Duplo Clique"><i class="fas fa-trash me-2"></i>Apagar Selecionado</button>`+
						`<button class="btn btn-sm btn-danger" type="button" name="remove_all" title="Duplo Clique"><i class="fas fa-trash-alt me-2"></i>Apagar Tudo</button>`+
						`</div></div></div>`;
				//Tabela de operações
				html += `<div class="card mb-4 rounded-3 shadow-sm">`+
						`<div class="card-body">`+
						`<table id="lista_ops__table" class="table table-hover">`+
						`<thead>${rebuildListaOps__Table('thead')}<thead>`+
						`<tbody>${rebuildListaOps__Table('tbody')}</tbody>`+
						`</table>`+
						`</div></div>`;
				$(document.getElementById("renda_variavel__section")).empty().append(html).promise().then(function (){
					$(document.getElementById("lista_ops__table")).DataTable(_lista_ops__table_DT);
				});
			}
			else if (_selected_arcabouco_section === 'dashboard_ops'){
				let dashboard_filters = dashboard__filters_LS.getFromArcabouco(ctrl__instancias.getSelected('id')),
					dashboard_simulations = dashboard__simulations_LS.getFromArcabouco(ctrl__instancias.getSelected('id')),
					dashboard_data = RV_Statistics.generate(_operacoes_arcabouco, dashboard_filters, dashboard_simulations);
				console.log(dashboard_data);
				html += `<div class="row">`+
						`<div class="col-1 d-flex pe-0" style="width: 65px">`+
						`<button class="btn btn-sm btn-primary flex-fill" type="button" id="dashboard_ops__refresh"><i class="fas fa-magic"></i></button>`+
						`</div>`;
				//Submenu de Filtros do Dashboard
				html += `<div class="col">`+
						`<div class="card mb-2 rounded-3 shadow-sm">`+
						`<div class="card-body p-2">`+
						`<div class="container-fluid d-flex justify-content-end px-0" id="dashboard_ops__filter">`+
						`<form class="row m-0 flex-fill">`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Filtrar Data</label><input type="text" name="data" class="form-control form-control-sm" placeholder="Data"></div>`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Filtrar Hora</label><div class="slider-styled filter-hora" name="hora"></div></div>`+
						`<div class="col-auto" name="ativo"><label class="form-label m-0 text-muted fw-bold">Filtrar Ativo</label><select name="ativo" multiple></select></div>`+
						`<div class="col-auto" name="cenario"><label class="form-label m-0 text-muted fw-bold">Filtrar Cenário</label><select name="cenario" multiple></select></div>`+
						`<div class="col-auto" name="premissas"><label class="form-label m-0 text-muted fw-bold">Filtrar Premissas</label><div class="iSelectKami dropdown bootstrap-select w-100" name="premissas"><button class="form-control form-control-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside">Premissas</button><ul class="dropdown-menu overflow-auto"></ul></div></div>`+
						`<div class="col-auto" name="observacoes"><label class="form-label m-0 text-muted fw-bold">Filtrar Observações</label><div class="iSelectKami dropdown bootstrap-select w-100" name="observacoes"><button class="form-control form-control-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside">Observações</button><ul class="dropdown-menu overflow-auto"></ul></div></div>`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Ignorar Erros</label><select name="ignora_erro" class="form-select form-select-sm ms-auto">`+
						`<option value="0">Não</option>`+
						`<option value="1">Sim</option>`+
						`</select></div>`+
						`</form>`+
						`</div></div></div>`;
				//Submenu de Simulação do Dashboard
				html += `<div class="card rounded-3 shadow-sm">`+
						`<div class="card-body p-2">`+
						`<div class="container-fluid d-flex justify-content-end px-0" id="dashboard_ops__simulate">`+
						`<form class="row m-0 flex-fill">`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Período</label><select name="periodo_calc" class="form-select form-select-sm ms-auto">`+
						`<option value="1">Por Trade</option>`+
						`<option value="2">Por Dia</option>`+
						`<option value="3">Por Mes</option>`+
						`</select></div>`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Simular R:R</label><select name="rr" class="form-select form-select-sm ms-auto">`+
						`<option value="1">Padrão</option>`+
						`<option value="2" disabled>2:1</option>`+
						`<option value="2_1" disabled>2:1 (Escalado 1x)</option>`+
						`<option value="2_2" disabled>2:1 (Escalado 1x Fixo)</option>`+
						`<option value="3" disabled>3:1</option>`+
						`<option value="3_1" disabled>3:1 (Escalado 1x)</option>`+
						`<option value="3_2" disabled>3:1 (Escalado 1x Fixo)</option>`+
						`<option value="3_3" disabled>3:1 (Escalado 2x)</option>`+
						`</select></div>`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Simular Vol.</label><input type="text" name="vol" class="form-control form-control-sm" onclick="this.select()" placeholder="Vol"></div>`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Simular Cts</label><div class="input-group">`+
						`<select class="form-select form-select-sm" name="tipo_cts">`+
						`<option value="1">Padrão</option>`+
						`<option value="2">Quantidade Fixa</option>`+
						`<option value="3">Quantidade Máx por R</option>`+
						`</select>`+
						`<input type="text" name="cts" class="form-control form-control-sm" onclick="this.select()" placeholder="Cts" disabled></div></div>`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Custos</label><select name="usa_custo" class="form-select form-select-sm ms-auto">`+
						`<option value="1">Incluir</option>`+
						`<option value="0">Não Incluir</option>`+
						`</select></div>`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Simular Capital</label><input type="text" name="valor_inicial" class="form-control form-control-sm" onclick="this.select()" placeholder="Capital"></div>`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Simular R</label><input type="text" name="R" class="form-control form-control-sm" onclick="this.select()" placeholder="R"></div>`+
						`</form>`+
						`</div></div></div></div></div>`;
				//Info Estatistica (Total + Por Cenário)
				html += `<div class="row mt-4">`+
						`<div class="col">`+
						`<div class="card mb-2 rounded-3 shadow-sm">`+
						`<div class="card-body">`+
						`<table class="table m-0" id="dashboard_ops__table_stats__byCenario">`+
						`<thead>${rebuildDashboardOps__Table_Stats__byCenario('thead')}</thead>`+
						`<tbody>${rebuildDashboardOps__Table_Stats__byCenario('tbody', dashboard_data.dashboard_ops__table_stats__byCenario)}</tbody>`+
						`<tfoot>${rebuildDashboardOps__Table_Stats__byCenario('tfoot', dashboard_data.dashboard_ops__table_stats)}</tfoot>`+
						`</table>`+
						`</div></div></div>`+
						`</div>`;
				//Graficos Horario + Grafico Evolução Patrimonial
				html += `<div class="row mt-2">`+
						`<div class="col">`+
						`<div class="card rounded-3 shadow-sm">`+
						`<div class="card-body" id="dashboard_ops__chart_porHorario">`+
						`</div></div></div>`+
						`<div class="col">`+
						`<div class="card rounded-3 shadow-sm">`+
						`<div class="card-body" id="dashboard_ops__chart_resultTempo">`+
						`</div></div></div>`+
						`</div>`;
				html += `</div>`;
				$(document.getElementById("renda_variavel__section")).empty().append(html).promise().then(function (){
					//Inicia a seção de Filtros
					let filters = $(document.getElementById("dashboard_ops__filter"));
					//////////////////////////////////
					//Filtro da Data
					//////////////////////////////////
					let	data_inicial = Global.convertDate(_operacoes_arcabouco[0].data),
						data_final = Global.convertDate(_operacoes_arcabouco[_operacoes_arcabouco.length-1].data);
					filters.find("input[name='data']").daterangepicker({
						"showDropdowns": true,
						"minDate": data_inicial,
						"startDate": ("data_inicial" in dashboard_filters) ? dashboard_filters["data_inicial"] : data_inicial,
						"endDate": ("data_final" in dashboard_filters) ? dashboard_filters["data_final"] : data_final,
						"maxDate": data_final,
						"locale": {
							"format": "DD/MM/YYYY",
							"separator": " - ",
							"applyLabel": "Aplicar",
							"cancelLabel": "Cancelar",
							"fromLabel": "De",
							"toLabel": "Até",
							"customRangeLabel": "Custom",
							"weekLabel": "S",
							"daysOfWeek": ["D", "S", "T", "Q", "Q", "S", "S"],
							"monthNames": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
						}
					});
					//////////////////////////////////
					//Filtro da Hora
					//////////////////////////////////
					dashboard__filter_noUiSlider = noUiSlider.create(filters.find("div[name='hora']")[0], {
						connect: true,
						range: {
							'min': new Date('2000-01-01 09:00:00').getTime(),
							'max': new Date('2000-01-01 18:00:00').getTime()
						},
						step: 60 * 60 * 1000,
						start: [
							("hora_inicial" in dashboard_filters) ? new Date(`2000-01-01 ${dashboard_filters["hora_inicial"]}`).getTime() : new Date('2000-01-01 09:00:00').getTime(),
							("hora_final" in dashboard_filters) ? new Date(`2000-01-01 ${dashboard_filters["hora_final"]}`).getTime() : new Date('2000-01-01 18:00:00').getTime()
						],
						tooltips: {
							to: ((value) => moment(value).format("HH:mm"))
						}
					});
					filters.find("div[name='hora']")[0].noUiSlider.on("change", function (values, handle, unencoded, isTap, positions){
						let handle_dic = ["hora_inicial", "hora_final"];
						dashboard__filters_LS.update(ctrl__instancias.getSelected('id'), handle_dic[handle], moment(parseInt(values[handle])).format("HH:mm"));
					});
					//////////////////////////////////
					//Filtro do Ativo
					//////////////////////////////////
					let select_options_html = _ativos.reduce((p, c) => (p.nome ? `<option value="${p.nome}" ${(("ativo" in dashboard_filters && dashboard_filters["ativo"].includes(p.nome)) ? "selected" : "" )}>${p.nome}</option>` : p) + `<option value="${c.nome}" ${(("ativo" in dashboard_filters && dashboard_filters["ativo"].includes(c.nome)) ? "selected" : "" )}>${c.nome}</option>` );
					filters.find("select[name='ativo']").append(select_options_html).promise().then(function (){
						filters.find("select[name='ativo']").selectpicker({
							title: 'Ativo',
							selectedTextFormat: 'count > 1',
							style: '',
							styleBase: 'form-control form-control-sm'
						}).on("loaded.bs.select", function (){
							filters.find("select[name='ativo']").parent().addClass("form-control");
						}).on("changed.bs.select", function (){
							dashboard__filters_LS.update(ctrl__instancias.getSelected('id'), "ativo", $(this).val());
						});
					});
					//////////////////////////////////
					//Filtro de Cenario
					//////////////////////////////////
					select_options_html = Object.values(_cenarios_arcabouco).reduce((p, c) => (p.nome ? `<option value="${p.id}" ${(("cenario" in dashboard_filters && p.nome in dashboard_filters["cenario"]) ? "selected" : "" )}>${p.nome}</option>` : p) + `<option value="${c.id}" ${(("cenario" in dashboard_filters && c.nome in dashboard_filters["cenario"]) ? "selected" : "" )}>${c.nome}</option>` );
					filters.find("select[name='cenario']").append(select_options_html).promise().then(function (){
						filters.find("select[name='cenario']").selectpicker({
							title: 'Cenários',
							selectedTextFormat: 'count > 2',
							actionsBox: true,
							deselectAllText: 'Nenhum',
							selectAllText: 'Todos',
							liveSearch: true,
							liveSearchNormalize: true,
							style: '',
							styleBase: 'form-control form-control-sm'
						}).on("loaded.bs.select", function (){
							filters.find("select[name='cenario']").parent().addClass("form-control");
						}).on("changed.bs.select", function (){
							let dashboard_filters = dashboard__filters_LS.getFromArcabouco(ctrl__instancias.getSelected('id')),
								localStorage_data = {};
							$(this).find("option:selected").each(function (i, el){
								localStorage_data[el.innerText] = {
									id: this.value,
									premissas: ("cenario" in dashboard_filters && el.innerText in dashboard_filters["cenario"]) ? dashboard_filters["cenario"][el.innerText]["premissas"] : {},
									observacoes: ("cenario" in dashboard_filters && el.innerText in dashboard_filters["cenario"]) ? dashboard_filters["cenario"][el.innerText]["observacoes"] : {}
								}
							});
							dashboard__filters_LS.update(ctrl__instancias.getSelected('id'), "cenario", localStorage_data);
							rebuildSelect_PremissasOuObservacoes__content(filters.find("div[name='premissas']"), ctrl__instancias.getSelected('id'));
							rebuildSelect_PremissasOuObservacoes__content(filters.find("div[name='observacoes']"), ctrl__instancias.getSelected('id'));
						});
					});
					//////////////////////////////////
					//Filtro de Observacoes
					//////////////////////////////////
					rebuildSelect_PremissasOuObservacoes__content(filters.find("div[name='premissas']"), ctrl__instancias.getSelected('id'));
					//////////////////////////////////
					//Filtro de Observacoes
					//////////////////////////////////
					rebuildSelect_PremissasOuObservacoes__content(filters.find("div[name='observacoes']"), ctrl__instancias.getSelected('id'));
					//////////////////////////////////
					//Filtro de Ignora Erros
					//////////////////////////////////
					if ("ignora_erro" in dashboard_filters)
						filters.find("select[name='ignora_erro']").val(dashboard_filters["ignora_erro"]);
					//Inicia a seção de Simulações
					let simulations = $(document.getElementById("dashboard_ops__simulate"));
					simulations.find("input[name],select[name]").each(function (){
						me = $(this);
						if (this.name in dashboard_simulations)
							me.val(dashboard_simulations[this.name]);
						if (this.name === "vol")
							me.inputmask({alias: "numeric", digitsOptional: false, digits: 0, rightAlign: false, placeholder: "0"});
						else if (this.name === "cts")
							me.inputmask({alias: "numeric", digitsOptional: false, digits: 0, rightAlign: false, placeholder: "0"});
						else if (this.name === "valor_inicial")
							me.inputmask({alias: "numeric", digitsOptional: false, digits: 2, rightAlign: false, placeholder: "0"});
						else if (this.name === "R")
							me.inputmask({alias: "numeric", digitsOptional: false, digits: 2, rightAlign: false, placeholder: "0"});
					});
				});
			}
		}
		else{
			html += `<div class="card mb-2 rounded-3 shadow-sm">`+
					`<div class="card-body">`+
					`<div class="container-fluid text-center fw-bold text-muted fs-5"><i class="fas fa-cookie-bite me-2"></i>Nada a mostrar</div>`+
					`</div></div>`;
			$(document.getElementById("renda_variavel__section")).empty().append(html);
		}
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------ Lista Arcabouços --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Reseta o formulário 'arcaboucos_modal_form'.
	*/
	function resetFormArcaboucoModal(){
		let form = $(document.getElementById("arcaboucos_modal_form"));
		form.removeAttr("id_arcabouco");
		form.find("input[name]").val("");
		form.find("select[name='usuarios']").selectpicker('deselectAll');
		form.find("input[name],select[name]").removeAttr("changed");
	}
	/*
		Constroi o modal de gerenciamento de cenarios.
	*/
	function buildArcaboucosModal(method = ''){
		let form = $(document.getElementById("arcaboucos_modal_form"));
		if (method === 'build'){
			//Inicia o select de usuarios
			select_options_html = "";
			for (let usu in _usuarios){
				if (_usuarios[usu].is_me === 0)
					select_options_html += `<option value="${_usuarios[usu].usuario}">${_usuarios[usu].usuario}</option>`;
			}
			form.find("select[name='usuarios']").append(select_options_html).promise().then(function (){
				form.find("select[name='usuarios']").selectpicker({
					title: 'Usuários',
					selectedTextFormat: 'count > 2',
					actionsBox: true,
					deselectAllText: 'Nenhum',
					selectAllText: 'Todos',
					liveSearch: true,
					liveSearchNormalize: true,
					style: '',
					styleBase: 'form-control form-control-sm'
				}).on("loaded.bs.select", function (){
					form.find("select[name='usuarios']").parent().addClass("form-control");
				}).on("changed.bs.select", function (){
					this.setAttribute("changed", "");
				});
			});
			//Inicia a mascara da meta
			form.find("input[name='meta']").inputmask({alias: "numeric", digitsOptional: false, digits: 0, rightAlign: false, placeholder: "0"});
			buildArcaboucosTable();
		}
		else{
			let modal = $(document.getElementById("arcaboucos_modal"));
			form.find("input[name]").val("");
			form.find("select[name='usuarios']").selectpicker('deselectAll');
			modal.modal("show");
		}
	}
	/*
		Constroi a tabela de ativos. (Dados que recebe do BD)
	*/
	function buildArcaboucosTable(){
		let table = $(document.getElementById("table_arcaboucos")),
			html = ``,
			first = 0;
		//Constroi tabela de informacoes dos arcabouços
		for (let ar in _arcaboucos){
			let meta = (_arcaboucos[ar].meta !== 0) ? ((_arcaboucos[ar].qtd_ops / _arcaboucos[ar].meta) * 100).toFixed(2) : 0,
				usuarios_html = ``;
			for (let usu in _arcaboucos[ar]["usuarios"])
				usuarios_html += `<span class="badge ${((_arcaboucos[ar]["usuarios"][usu].criador == 1) ? "bg-primary" : "bg-secondary")} ${((usu !== 0) ? "ms-1" : "")} my-1">${_arcaboucos[ar]["usuarios"][usu].usuario}</span>`;
			html += `<tr arcabouco="${_arcaboucos[ar].id}" ${((_arcaboucos[ar].id == ctrl__instancias.getSelected('id')) ? "selected" : "")}>`+
					`<td name="nome" class="fw-bold">${_arcaboucos[ar].nome}</td>`+
					`<td name="data_criacao" class="fw-bold text-muted">${Global.convertDate(_arcaboucos[ar].data_criacao)}</td>`+
					`<td name="data_atualizacao" class="fw-bold text-muted">${((_arcaboucos[ar].data_atualizacao !== "0000-00-00") ? Global.convertDate(_arcaboucos[ar].data_atualizacao) : "")}</td>`+
					`<td name="qtd_ops" class="fw-bold text-center">${_arcaboucos[ar].qtd_ops}</td>`+
					`<td name="meta">${meta}</td>`+
					`<td name="usuarios">${usuarios_html}</td>`+
					((_arcaboucos[ar].sou_criador == 1) ? `<td name="editar" class="text-center"><button class="btn btn-sm btn-light" type="button" name="editar"><i class="fas fa-edit"></i></button></td>` : `<td></td>`)+
					((_arcaboucos[ar].sou_criador == 1) ? `<td name="remover" class="text-center"><button class="btn btn-sm btn-light" type="button" name="remover"><i class="fas fa-trash text-danger"></i></button></td>` : `<td></td>`)+
					`</tr>`;
		}
		table.find("tbody").empty().append(html).promise().then(function (){
			table.DataTable(_arcabouco__table_DT);
		});
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*--------------------------------- Lista Ops ------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Retorna o html da lista de operacoes. (Head ou Body)
	*/
	function rebuildListaOps__Table(section = ''){
		let html = ``;
		if (section === 'thead'){
			html += `<tr>`+
					`<th>#</th>`+
					`<th>Data</th>`+
					`<th>Hora</th>`+
					`<th>Ativo</th>`+
					`<th>Op.</th>`+
					`<th>Vol</th>`+
					`<th>Cts</th>`+
					`<th>Entrada</th>`+
					`<th>Stop</th>`+
					`<th>Alvo</th>`+
					`<th>MEN</th>`+
					`<th>MEP</th>`+
					`<th>Saída</th>`+
					`<th>Cenário</th>`+
					`<th>Premissas</th>`+
					`<th>Observações</th>`+
					`<th>Erro</th>`+
					`</tr>`;
		}
		else if (section === 'tbody'){
			for (let o in _operacoes_arcabouco){
				html += `<tr operacao="${_operacoes_arcabouco[o].id}">`+
						`<td name='sequencia'>${_operacoes_arcabouco[o].sequencia}</td>`+
						`<td name='data'>${Global.convertDate(_operacoes_arcabouco[o].data)}</td>`+
						`<td name='hora'>${_operacoes_arcabouco[o].hora}</td>`+
						`<td name='ativo'>${_operacoes_arcabouco[o].ativo}</td>`+
						`<td name='op'>${_operacoes_arcabouco[o].op}</td>`+
						`<td name='vol'>${_operacoes_arcabouco[o].vol}</td>`+
						`<td name='cts'>${_operacoes_arcabouco[o].cts}</td>`+
						`<td name='entrada'>${_operacoes_arcabouco[o].entrada}</td>`+
						`<td name='stop'>${_operacoes_arcabouco[o].stop}</td>`+
						`<td name='alvo'>${_operacoes_arcabouco[o].alvo}</td>`+
						`<td name='men'>${_operacoes_arcabouco[o].men}</td>`+
						`<td name='mep'>${_operacoes_arcabouco[o].mep}</td>`+
						`<td name='saida'>${_operacoes_arcabouco[o].saida}</td>`+
						`<td name='cenario'>${_operacoes_arcabouco[o].cenario}</td>`+
						`<td name='premissas'>${_operacoes_arcabouco[o].premissas}</td>`+
						`<td name='observacoes'>${_operacoes_arcabouco[o].observacoes}</td>`+
						`<td name='erro'>${_operacoes_arcabouco[o].erro}</td>`+
						`</tr>`;
			}
		}
		return html;
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*-------------------------------- Dashboard Ops ---------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Adiciona ou altera 'filters' passados no localStorage do arcabouço selecionado.
	*/
	let dashboard__filters_LS = {
		/*
			Retorna os 'filters' de todos os arcabouços.
		*/
		getAll: function () {
			let filters = localStorage.getItem("dashboard_filters");
			if (filters === null)
				return {};
			else
				return JSON.parse(filters);
		},
		/*
			Retorna os 'filters' de um arcabouço.
		*/
		getFromArcabouco: function (id_arcabouco) {
			let filters = localStorage.getItem("dashboard_filters");
			if (filters === null)
				return {};
			else
				filters = JSON.parse(filters);
			if (!(id_arcabouco in filters))
				return {};
			return filters[id_arcabouco];
		},
		/*
			Cadastra ou atualiza 'filters' de um arcabouço.
		*/
		update: function (id_arcabouco, key, value) {
			let filters = localStorage.getItem("dashboard_filters");
			//Nao existe nada relacionado a 'filters' no localStorage
			if (filters === null)
				filters = {};
			//Se existe pega e processa
			else
				filters = JSON.parse(filters);
			if (value !== ""){
				//Se o arcabouco nao tem nenhum filtro ainda iniciado
				if (!(id_arcabouco in filters))
					filters[id_arcabouco] = {};
				//Adiciona ou altera a chave-valor passada
				filters[id_arcabouco][key] = value;
				localStorage.setItem("dashboard_filters", JSON.stringify(filters));
			}
			//Valores vazios sao removidos
			else{
				if (id_arcabouco in filters){
					if (key in filters[id_arcabouco]){
						delete filters[id_arcabouco][key];
						localStorage.setItem("dashboard_filters", JSON.stringify(filters));
					}
				}
			}
		}
	}
	/*
		Adiciona ou altera 'simulations' passados no localStorage do arcabouço selecionado.
	*/
	let dashboard__simulations_LS = {
		/*
			Retorna os 'simulations' de todos os arcabouços.
		*/
		getAll: function () {
			let simulations = localStorage.getItem("dashboard_simulations");
			if (simulations === null)
				return {};
			else
				return JSON.parse(simulations);
		},
		/*
			Retorna os 'simulations' de um arcabouço.
		*/
		getFromArcabouco: function (id_arcabouco) {
			let simulations = localStorage.getItem("dashboard_simulations");
			if (simulations === null)
				return {};
			else
				simulations = JSON.parse(simulations);
			if (!(id_arcabouco in simulations))
				return {};
			return simulations[id_arcabouco];
		},
		/*
			Cadastra ou atualiza 'simulations' de um arcabouço.
		*/
		update: function (id_arcabouco, key, value) {
			let simulations = localStorage.getItem("dashboard_simulations");
			//Nao existe nada relacionado a 'simulations' no localStorage
			if (simulations === null)
				simulations = {};
			//Se existe pega e processa
			else
				simulations = JSON.parse(simulations);
			if (value !== ""){
				//Se o arcabouco nao tem nenhum filtro ainda iniciado
				if (!(id_arcabouco in simulations))
					simulations[id_arcabouco] = {};
				//Adiciona ou altera a chave-valor passada
				simulations[id_arcabouco][key] = value;
				localStorage.setItem("dashboard_simulations", JSON.stringify(simulations));
			}
			//Valores vazios sao removidos
			else{
				if (id_arcabouco in simulations){
					if (key in simulations[id_arcabouco]){
						delete simulations[id_arcabouco][key];
						localStorage.setItem("dashboard_simulations", JSON.stringify(simulations));
					}
				}
			}
		}
	}
	/*
		Reconstroi a lista de 'premissas' ou 'observações', usada nos selects dos mesmos em 'filters'.
	*/
	function rebuildSelect_PremissasOuObservacoes__content(el, id_arcabouco){
		let dashboard_filters = dashboard__filters_LS.getFromArcabouco(id_arcabouco),
			el_name = el.attr("name"),
			placeholder = {'premissas': 'Premissas', 'observacoes': 'Observações'},
			qtd_selected = 0,
			options_html = "";
		if ("cenario" in dashboard_filters){
			for (let cenario_nome in dashboard_filters["cenario"]){
				if (_cenarios_arcabouco[dashboard_filters["cenario"][cenario_nome].id][el_name].length){
					if (options_html === ""){
						let select_query_union_name = `${el_name}_query_union`,
							or_selected = !(select_query_union_name in dashboard_filters) || (select_query_union_name in dashboard_filters && dashboard_filters[select_query_union_name] === 'OR'),
							and_selected = (select_query_union_name in dashboard_filters && dashboard_filters[select_query_union_name] === 'AND');
						options_html += `<li><div class="input-group px-2"><select class="iSelectKami form-select form-select-sm" name="${el_name}_query_union"><option value="OR" ${((or_selected) ? "selected" : "")}>OR</option><option value="AND" ${((and_selected) ? "selected" : "")}>AND</option></select><button type="button" class="iSelectKami btn btn-sm btn-outline-secondary" name="tira_tudo">Nenhum</button></div></li>`;
					}
					else
						options_html += `<li><hr class="dropdown-divider"></li>`;
					options_html += `<li><h6 class="dropdown-header">${cenario_nome}</h6></li>`;
					for (let o in _cenarios_arcabouco[dashboard_filters["cenario"][cenario_nome].id][el_name]){
						let is_selected = _cenarios_arcabouco[dashboard_filters["cenario"][cenario_nome].id][el_name][o].ref in dashboard_filters["cenario"][cenario_nome][el_name],
							negar_checked = (is_selected) ? dashboard_filters["cenario"][cenario_nome][el_name][_cenarios_arcabouco[dashboard_filters["cenario"][cenario_nome].id][el_name][o].ref] === 1 : false;
						options_html += `<li><button class="dropdown-item" type="button" value="${_cenarios_arcabouco[dashboard_filters["cenario"][cenario_nome].id][el_name][o].ref}" cenario="${dashboard_filters["cenario"][cenario_nome].id}" pertence="${cenario_nome}" ${((is_selected) ? "selected" : "" )}><input class="form-check-input me-3" type="checkbox" name="negar_valor" ${((negar_checked) ? "checked" : "" )}><i class="fas fa-square me-2" style="color: ${_cenarios_arcabouco[dashboard_filters["cenario"][cenario_nome].id][el_name][o].cor}"></i>${_cenarios_arcabouco[dashboard_filters["cenario"][cenario_nome].id][el_name][o].nome}</button>`;
						if (is_selected)
							qtd_selected++;
					}
				}
			}
		}
		el.find("button.dropdown-toggle").html(((qtd_selected > 1) ? `${qtd_selected} items selected` : ((qtd_selected === 1) ? `1 item selected` : `${placeholder[el_name]}`)));
		el.find("ul.dropdown-menu").empty().append(options_html);
	}
	/*
		Retorna o html de uma linha usada em 'dashboard_ops__table_stats__byCenario', separando se é para o 'tbody' ou 'tfoot'.
	*/
	function dashboardOps__Table_Stats__byCenario__newLine(cenario, line_data, method){
		if (method === 'tbody'){
			return `<tr class="align-middle">`+
					`<td><span name="trades__total_perc" class="data-tiny text-muted">(${line_data.trades__total_perc.toFixed(2)}%)</span></td>`+
					`<td><span name="cenario" class="fw-bold">${cenario}</span></td>`+
					//Dias
					//N° Trades
					`<td class="text-center"><span name="trades__total" class="data-small">${line_data.trades__total}</span></td>`+
					`<td class="text-center"><span name="trades__positivo" class="data-small text-success">${line_data.trades__positivo}</span><span name="trades__positivo_perc" class="data-tiny text-success ms-2">(${line_data.trades__positivo_perc.toFixed(2)}%)</span></td>`+
					`<td class="text-center"><span name="trades__negativo" class="data-small text-danger">${line_data.trades__negativo}</span><span name="trades__negativo_perc" class="data-tiny text-danger ms-2">(${line_data.trades__negativo_perc.toFixed(2)}%)</span></td>`+
					`<td class="text-center"><span name="trades__empate" class="data-small text-muted">${line_data.trades__empate}</span><span name="trades__empate_perc" class="data-tiny text-muted ms-2">(${line_data.trades__empate_perc.toFixed(2)}%)</span></td>`+
					`<td class="text-center"><span name="trades__erro" class="data-small text-primary">${line_data.trades__erro}</span><span name="trades__erro_perc" class="data-tiny text-primary ms-2">(${((line_data.trades__erro_perc !== "--") ? `${line_data.trades__erro_perc.toFixed(2)}%` : line_data.trades__erro_perc)})</span></td>`+
					//Result.
					`<td class="text-center"><span name="result__lucro_brl" class="data-small">R$ ${line_data.result__lucro_brl.toFixed(2)}</span></td>`+
					`<td class="text-center"><span name="result__lucro_R" class="data-small">${((line_data.result__lucro_R !== "--") ? `${line_data.result__lucro_R.toFixed(3)}R` : line_data.result__lucro_R )}</span></td>`+
					`<td class="text-center"><span name="result__lucro_perc" class="data-small">${((line_data.result__lucro_perc !== "--") ? `${line_data.result__lucro_perc.toFixed(2)}%` : line_data.result__lucro_perc)}</span></td>`+
					//R:G
					`<td class="text-center"><span name="stats__rrMedio" class="data-small">${line_data.stats__rrMedio.toFixed(2)}</span></td>`+
					`<td class="text-center"><span name="result__mediaGain_R" class="data-small text-success">${((line_data.result__mediaGain_R !== "--") ? `${line_data.result__mediaGain_R.toFixed(3)}R` : line_data.result__mediaGain_R )}</span><span name="result__mediaGain_brl" class="data-tiny text-success ms-2">R$ ${line_data.result__mediaGain_brl.toFixed(2)}</span><span name="result__mediaGain_perc" class="data-tiny text-success ms-2">${((line_data.result__mediaGain_perc !== "--") ? `${line_data.result__mediaGain_perc.toFixed(2)}%` : line_data.result__mediaGain_perc )}</span></td>`+
					`<td class="text-center"><span name="result__mediaLoss_R" class="data-small text-danger">${((line_data.result__mediaLoss_R !== "--") ? `${line_data.result__mediaLoss_R.toFixed(3)}R` : line_data.result__mediaLoss_R )}</span><span name="result__mediaLoss_brl" class="data-tiny text-danger ms-2">R$ ${line_data.result__mediaLoss_brl.toFixed(2)}</span><span name="result__mediaLoss_perc" class="data-tiny text-danger ms-2">${((line_data.result__mediaLoss_perc !== "--") ? `${line_data.result__mediaLoss_perc.toFixed(2)}%` : line_data.result__mediaLoss_perc )}</span></td>`+
					//Expect.
					`<td class="text-center"><span name="stats__expect" class="data-small">${((line_data.stats__expect !== "--") ? line_data.stats__expect.toFixed(2) : line_data.stats__expect )}</span></td>`+
					//DP
					`<td class="text-center"><span name="stats__dp" class="data-small">${((line_data.stats__dp !== "--") ? line_data.stats__dp.toFixed(2) : line_data.stats__dp )}</span></td>`+
					//SQN
					`<td class="text-center"><span name="stats__sqn" class="data-small">${((line_data.stats__sqn !== "--") ? line_data.stats__sqn.toFixed(2) : line_data.stats__sqn )}</span></td>`+
					//Edge
					`<td class="text-center"><span name="stats__breakeven" class="data-tiny text-muted">${line_data.stats__breakeven.toFixed(2)}%</span></td>`+
					`<td class="text-center"><span name="stats__edge" class="data-small">${line_data.stats__edge.toFixed(2)}%</span></td>`+
					`</tr>`;
		}
		else if (method === 'tfoot'){
			return `<tr class="align-middle">`+
					`<td></td>`+
					`<td><span name="cenario" class="fw-bold">${cenario}</span></td>`+
					//Dias
					//N° Trades
					`<td class="text-center"><span name="trades__total" class="fw-bold">${line_data.trades__total}</span></td>`+
					`<td class="text-center"><span name="trades__positivo" class="data-small text-success">${line_data.trades__positivo}</span><span name="trades__positivo_perc" class="data-tiny text-success ms-2">(${line_data.trades__positivo_perc.toFixed(2)}%)</span></td>`+
					`<td class="text-center"><span name="trades__negativo" class="data-small text-danger">${line_data.trades__negativo}</span><span name="trades__negativo_perc" class="data-tiny text-danger ms-2">(${line_data.trades__negativo_perc.toFixed(2)}%)</span></td>`+
					`<td class="text-center"><span name="trades__empate" class="data-small text-muted">${line_data.trades__empate}</span><span name="trades__empate_perc" class="data-tiny text-muted ms-2">(${line_data.trades__empate_perc.toFixed(2)}%)</span></td>`+
					`<td class="text-center"><span name="trades__erro" class="data-small text-primary">${line_data.trades__erro}</span><span name="trades__erro_perc" class="data-tiny text-primary ms-2">(${((line_data.trades__erro_perc !== "--") ? `${line_data.trades__erro_perc.toFixed(2)}%` : line_data.trades__erro_perc)})</span></td>`+
					//Result.
					`<td class="text-center"><span name="result__lucro_brl" class="data-small">R$ ${line_data.result__lucro_brl.toFixed(2)}</span></td>`+
					`<td class="text-center"><span name="result__lucro_R" class="data-small">${((line_data.result__lucro_R !== "--") ? `${line_data.result__lucro_R.toFixed(3)}R` : line_data.result__lucro_R )}</span></td>`+
					`<td class="text-center"><span name="result__lucro_perc" class="data-small">${((line_data.result__lucro_perc !== "--") ? `${line_data.result__lucro_perc.toFixed(2)}%` : line_data.result__lucro_perc)}</span></td>`+
					//R:G
					`<td class="text-center"><span name="stats__rrMedio" class="fw-bold">${line_data.stats__rrMedio.toFixed(2)}</span></td>`+
					`<td class="text-center"><span name="result__mediaGain_R" class="data-small text-success">${((line_data.result__mediaGain_R !== "--") ? `${line_data.result__mediaGain_R.toFixed(3)}R` : line_data.result__mediaGain_R )}</span><span name="result__mediaGain_brl" class="data-tiny text-success ms-2">R$ ${line_data.result__mediaGain_brl.toFixed(2)}</span><span name="result__mediaGain_perc" class="data-tiny text-success ms-2">${((line_data.result__mediaGain_perc !== "--") ? `${line_data.result__mediaGain_perc.toFixed(2)}%` : line_data.result__mediaGain_perc )}</span></td>`+
					`<td class="text-center"><span name="result__mediaLoss_R" class="data-small text-danger">${((line_data.result__mediaLoss_R !== "--") ? `${line_data.result__mediaLoss_R.toFixed(3)}R` : line_data.result__mediaLoss_R )}</span><span name="result__mediaLoss_brl" class="data-tiny text-danger ms-2">R$ ${line_data.result__mediaLoss_brl.toFixed(2)}</span><span name="result__mediaLoss_perc" class="data-tiny text-danger ms-2">${((line_data.result__mediaLoss_perc !== "--") ? `${line_data.result__mediaLoss_perc.toFixed(2)}%` : line_data.result__mediaLoss_perc )}</span></td>`+
					//Expect.
					`<td class="text-center"><span name="stats__expect" class="data-small">${((line_data.stats__expect !== "--") ? line_data.stats__expect.toFixed(2) : line_data.stats__expect )}</span></td>`+
					//DP
					`<td class="text-center"><span name="stats__dp" class="data-small">${((line_data.stats__dp !== "--") ? line_data.stats__dp.toFixed(2) : line_data.stats__dp )}</span></td>`+
					//SQN
					`<td class="text-center"><span name="stats__sqn" class="data-small">${((line_data.stats__sqn !== "--") ? line_data.stats__sqn.toFixed(2) : line_data.stats__sqn )}</span></td>`+
					//Edge
					`<td class="text-center"><span name="stats__breakeven" class="data-tiny text-muted">${line_data.stats__breakeven.toFixed(2)}%</span></td>`+
					`<td class="text-center"><span name="stats__edge" class="data-small">${line_data.stats__edge.toFixed(2)}%</span></td>`+
					`</tr>`;
		}
	}
	/*
		Retorna o html da seção de 'thead' ou 'tbody' ou 'tfoot' da 'dashboard_ops__table_stats__byCenario'.
	*/
	function rebuildDashboardOps__Table_Stats__byCenario(section = '', stats = {}){
		let html = ``;
		if (section === 'thead')
			html += `<tr class="align-middle">`+
					`<th colspan="2">Cenário</th>`+
					`<th colspan="5" class="text-center">Trades</th>`+
					`<th colspan="3" class="text-center">Result.</th>`+
					`<th colspan="3" class="text-center">R:G</th>`+
					`<th class="text-center">Expect.</th>`+
					`<th class="text-center">DP</th>`+
					`<th class="text-center">SQN</th>`+
					`<th colspan="2" class="text-center">Edge</th>`+
					`<tr>`+
					`</tr>`;
		else if (section === 'tbody'){
			for (let cenario in stats)
				html += dashboardOps__Table_Stats__byCenario__newLine(cenario, stats[cenario], section);
		}
		else if (section === 'tfoot')
			html += dashboardOps__Table_Stats__byCenario__newLine("Total", stats, section);
		return html;
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------ Section Cenarios --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Faz a reordenacao das linhas da tabela com base nas prioridades.
	*/
	function reorder_premissas_e_observacoes(tbody){
		[].slice.call(tbody.children).sort(function(a, b) {
			let a_v = a.querySelector("input[name='ref']").value,
				b_v = b.querySelector("input[name='ref']").value;
			return parseInt(a_v) - parseInt(b_v);
		}).forEach(function(ele) {
			tbody.appendChild(ele);
		});
	}
	/*
		Reconstroi o select de Cenarios, para copiar ao criar um novo cenario.
	*/
	function rebuildCenarios_modal_copiar(){
		$(document.getElementById("cenarios_modal_copiar")).empty().append(buildCenariosCopySelect(_cenarios_arcabouco));
	}
	/*
		Constroi o modal de gerenciamento de cenarios.
	*/
	function buildCenariosModal(){
		let modal = $(document.getElementById("cenarios_modal"));
		$(document.getElementById("table_cenarios")).empty().append(buildCenariosTable(_cenarios_arcabouco));
		rebuildCenarios_modal_copiar();
		modal.modal("show");
	}
	/*
		Constroi o select com os cenarios, para cópia.
	*/
	function buildCenariosCopySelect(data){
		let select_options = `<option value="">---</option>`;
		for (let c in data)
			select_options += `<option value="${data[c]["nome"]}">${data[c]["nome"]}</option>`;
		return select_options;
	}
	/*
		Constroi as secoes de premissas ou observacoes de um cenario.
	*/
	function buildListaPremissas_Observacoes(data, type = 0, new_data = false){
		let html = ``;
		if (type === 1){
			for (let p in data){
				html += `<tr ${((new_data)?`new_premissa`:`premissa="${data[p].id}"`)}>`+
						`<td name="nome"><div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value="${data[p].nome}"><button class="btn btn-sm btn-outline-danger" type="button" remover_premissa>Excluir</button></div></td>`+
						`<td name="ref"><input type="text" name="ref" class="form-control form-control-sm text-center" value="${data[p].ref}"></td>`+
						`<td name="cor"><div class="d-flex justify-content-center"><input type="color" name="cor" class="form-control form-control-sm form-control-color" value="${data[p].cor}"></div></td>`+
						`<td name="obrigatoria"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="obrigatoria" class="form-check-input" ${((data[p].obrigatoria == 1)?"checked":"")}></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input" ${((data[p].inativo == 1)?"checked":"")}></div></td>`+
						`</tr>`;
			}
			if (html === '')
				html += `<tr empty><td colspan="5" class="text-muted text-center fw-bold p-4">Nenhuma Premissa</td></tr>`;
		}
		else if (type === 2){
			for (let p in data){
				html += `<tr ${((new_data)?`new_observacao`:`observacao="${data[p].id}"`)}>`+
						`<td name="nome"><div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value="${data[p].nome}"><button class="btn btn-sm btn-outline-danger" type="button" remover_observacao>Excluir</button></div></td>`+
						`<td name="ref"><input type="text" name="ref" class="form-control form-control-sm text-center" value="${data[p].ref}"></td>`+
						`<td name="cor"><div class="d-flex justify-content-center"><input type="color" name="cor" class="form-control form-control-sm form-control-color" value="${data[p].cor}"></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input" ${((data[p].inativo == 1)?"checked":"")}></div></td>`+
						`</tr>`;
			}
			if (html === '')
				html += `<tr empty><td colspan="5" class="text-muted text-center fw-bold p-4">Nenhuma Observação</td></tr>`;
		}
		return html;
	}
	/*
		Constroi um cenarios com (premissas + observacoes).
	*/
	function buildCenario(data = {}, new_cenario = false){
		return  `<div class="card text-center mt-3" ${((new_cenario)?`new_cenario`:(("id" in data)?`cenario="${data.id}"`:``))}>`+
				`<div class="card-header d-flex">`+
				`<div class="col-md-6"><input type="text" name="cenario_nome" class="form-control form-control-sm" value="${(("nome" in data)?data.nome:"")}"></div>`+
				`<ul class="nav nav-tabs card-header-tabs ms-auto" >`+
				`<li class="nav-item"><a class="nav-link active" href="#" target="premissas">Premissas${(("premissas" in data)?((new_cenario)?((data["premissas"].length)?`<span class="badge bg-primary ms-1">+${data["premissas"].length}</span>`:``):`<span class="badge bg-secondary ms-1">${data["premissas"].length}</span>`):``)}</a></li>`+
				`<li class="nav-item"><a class="nav-link" href="#" target="observacoes">Observações${(("observacoes" in data)?((new_cenario)?((data["observacoes"].length)?`<span class="badge bg-primary ms-1">+${data["observacoes"].length}</span>`:``):`<span class="badge bg-secondary ms-1">${data["observacoes"].length}</span>`):``)}</a></li>`+
				`</ul>`+
				`</div>`+
				`<div class="card-body">`+
				`<div class="d-flex" target="premissas">`+
				`<table class="table m-0 me-3">`+
				`<thead>`+
				`<tr>`+
				`<th class="border-0">Nome</th><th class="border-0 text-center">Ref</th><th class="border-0 text-center">Cor</th><th class="border-0 text-center">Obrigatória</th><th class="border-0 text-center">Desativar</th>`+
				`</tr>`+
				`<tbody>${(("premissas" in data)?buildListaPremissas_Observacoes(data["premissas"], 1, new_cenario):buildListaPremissas_Observacoes({}, 1, new_cenario))}</tbody>`+
				`</table>`+
				`</div>`+
				`<div class="d-flex d-none" target="observacoes">`+
				`<table class="table m-0 me-3">`+
				`<thead>`+
				`<tr>`+
				`<th class="border-0">Nome</th><th class="border-0 text-center">Ref</th><th class="border-0 text-center">Cor</th><th class="border-0 text-center">Desativar</th>`+
				`</tr>`+
				`<tbody>${(("observacoes" in data)?buildListaPremissas_Observacoes(data["observacoes"], 2, new_cenario):buildListaPremissas_Observacoes({}, 2, new_cenario))}</tbody>`+
				`</table>`+
				`</div>`+
				`</div>`+
				`<div class="card-footer bg-transparent d-flex"><button type="button" class="btn btn-sm btn-danger" title="Duplo Clique" remover_cenario><i class="fas fa-trash-alt me-2"></i>Excluir Cenário</button><button type="button" class="btn btn-sm btn-outline-primary ms-2" adicionar_premissa><i class="fas fa-plus me-2"></i>Adicionar Premissa</button>${(("id" in data)?`<button type="button" class="btn btn-sm btn-success ms-auto disabled" salvar_cenario>Salvar</button>`:`<button type="button" class="btn btn-sm btn-success ms-auto" salvar_novo_cenario>Adicionar Cenário</button>`)}</div>`+
				`</div>`;
	}
	/*
		Constroi a 'table' de cenários.
	*/
	function buildCenariosTable(data = {}){
		let html = ``;
		for (let c in data)
			html += buildCenario(data[c], false);
		if (html === '')
			html = `<div class="container-fluid mt-3 p-4 text-center text-muted fw-bold" empty>Nenhum Cenário Cadastrado.</div>`;
		return html;
	}
	/*
		Coleta os dados para envio em Adicionar / Alterar / Remover cenarios e (Premissas / Observacoes).
	*/
	function cenarioGetData(cenario){
		let data = {};
		//Cenarios novos
		if (cenario[0].hasAttribute("new_cenario")){
			data.nome = cenario.find("input[name='cenario_nome']").val();
			if (data.nome === "")
				return {};
			data.id_arcabouco = ctrl__instancias.getSelected('id');
			data.premissas = [];
			cenario.find("tr[new_premissa]").each(function (r, row){
				let nome = row.querySelector("input[name='nome']").value,
					ref = row.querySelector("input[name='ref']").value;
				if (nome !== "" && ref !== ""){
					data.premissas.push({
						nome: nome,
						ref: ref,
						cor: row.querySelector("input[name='cor']").value,
						obrigatoria: ((row.querySelector("input[name='obrigatoria']").checked)?1:0),
						inativo: ((row.querySelector("input[name='inativo']").checked)?1:0)
					});
				}
			});
			data.observacoes = [];
			cenario.find("tr[new_observacao]").each(function (r, row){
				let nome = row.querySelector("input[name='nome']").value,
					ref = row.querySelector("input[name='ref']").value;
				if (nome !== "" && ref !== ""){
					data.observacoes.push({
						nome: nome,
						ref: ref,
						cor: row.querySelector("input[name='cor']").value,
						inativo: ((row.querySelector("input[name='inativo']").checked)?1:0)
					});
				}
			});
		}
		//Cenario ja existe
		else if (cenario[0].hasAttribute("cenario")){
			data = {
				id_arcabouco: ctrl__instancias.getSelected('id'),
				id_cenario: cenario.attr("cenario"),
				insert: {
					//Premissas de cenarios ja existentes
					premissas: [],
					//Observacoes de cenarios ja exitentes
					observacoes: []
				},
				update: {
					//Dados do cenario
					cenarios: [],
					//Dados de premissas de cenarios
					premissas: [],
					//Dados de observações de cenarios
					observacoes: []
				},
				remove: {
					//Premissas de cenarios
					premissas: [],
					//Observações de cenarios
					observacoes: []
				}
			};
			//Verifica mudancas no nome do cenario
			let cenario_nome_input = cenario.find("input[name='cenario_nome']");
			if (cenario_nome_input[0].hasAttribute("changed") && cenario_nome_input.val() !== "")
				data["update"]["cenarios"].push({nome: cenario_nome_input.val()});
			//Verifica novas premissas
			cenario.find("tr[new_premissa]").each(function (r, row){
				let nome = row.querySelector("input[name='nome']").value,
					ref = row.querySelector("input[name='ref']").value;
				if (nome !== "" && ref !== ""){
					data["insert"]["premissas"].push({
						nome: nome,
						ref: ref,
						cor: row.querySelector("input[name='cor']").value,
						obrigatoria: ((row.querySelector("input[name='obrigatoria']").checked)?1:0),
						inativo: ((row.querySelector("input[name='inativo']").checked)?1:0)
					});
				}
			});
			//Verifica mudancas/remocoes nas premissas
			cenario.find("tr[premissa]").each(function (r, row){
				//Trata remocoes de premissas
				if (row.hasAttribute("remover"))
					data["remove"]["premissas"].push({id: row.getAttribute("premissa")});
				//Trata alteracoes em premissas
				else{
					let info = {};
					$(row).find("input[changed]").each(function (ip, input){
						if (this.name === "nome" && this.value === "")
							return;
						if (this.getAttribute("type") === "checkbox")
							info[this.name] = ((this.checked)?1:0);
						else
							info[this.name] = this.value;
					});
					if (!Global.isObjectEmpty(info)){
						info["id"] = row.getAttribute("premissa");
						data["update"]["premissas"].push(info);
					}
				}
			});
			//Verifica novas observacoes
			cenario.find("tr[new_observacao]").each(function (r, row){
				let nome = row.querySelector("input[name='nome']").value,
					ref = row.querySelector("input[name='ref']").value;
				if (nome !== "" && ref !== ""){
					data["insert"]["observacoes"].push({
						nome: nome,
						ref: ref,
						cor: row.querySelector("input[name='cor']").value,
						inativo: ((row.querySelector("input[name='inativo']").checked)?1:0)
					});
				}
			});
			//Verifica mudancas/remocoes nas observacoes
			cenario.find("tr[observacao]").each(function (r, row){
				//Trata remocoes de observacoes
				if (row.hasAttribute("remover"))
					data["remove"]["observacoes"].push({id: row.getAttribute("observacao")});
				//Trata alteracoes em observacoes
				else{
					let info = {};
					$(row).find("input[changed]").each(function (ip, input){
						if (this.name === "nome" && this.value === "")
							return;
						if (this.getAttribute("type") === "checkbox")
							info[this.name] = ((this.checked)?1:0);
						else
							info[this.name] = this.value;
					});
					if (!Global.isObjectEmpty(info)){
						info["id"] = row.getAttribute("observacao");
						data["update"]["observacoes"].push(info);
					}
				}
			});
		}
		return data;
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*--------------------------- Section Operações Add ------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Constroi o modal de Cadastro de Operações.
	*/
	function buildOperacoesModal(){
		let modal = $(document.getElementById("operacoes_modal"));
		document.getElementById("importa_arquivo_operacoes_modal").value = "";
		document.getElementById("file_format").selectedIndex = 0;
		document.getElementById("table_layout").selectedIndex = 0;
		resetOperacaoAddTable();
		modal.modal("show");
	}
	/*
		Apaga tudo em 'table_operacoes_add'.
	*/
	function resetOperacaoAddTable(){
		let table = $(document.getElementById("table_operacoes_add"));
		table.find("thead").empty();
		table.find("tbody").empty().append(`<tr class="text-center text-muted fw-bold fs-6"><td class="border-0"><i class="fas fa-cookie-bite me-2"></i>Nada a mostrar</td></tr>`);
	}
	/*
		Constroi o html do select de ativos em 'table_operacoes_add'.
	*/
	function buildAtivosSelect_OperacaoAddTable(){
		let html = ``;
		for (let at in _ativos)
			html += `<option value="${_ativos[at].id}" custo="${_ativos[at].custo}" valor_tick="${_ativos[at].valor_tick}" pts_tick="${_ativos[at].pts_tick}">${_ativos[at].nome}</option>`;
		return html;
	}
	/*
		Constroi o html do select de cenarios em 'table_operacoes_add'.
	*/
	function buildCenariosSelect_OperacaoAddTable(){
		let html = ``;
		for (let cn in _cenarios_arcabouco)
			html += `<option value="${_cenarios_arcabouco[cn].id}">${_cenarios_arcabouco[cn].nome}</option>`;
		return html;
	}
	/*
		Constroi o html de options do select de Premissas e Observações, e seleciona algumas opções caso haja.
	*/
	function buildPremissasEObservacoes_OperacaoAddTable(cenario){
		let premissas_html = ``,
			observacoes_html = ``;
		if (cenario in _cenarios_arcabouco){
			for (let p in _cenarios_arcabouco[cenario]["premissas"])
				premissas_html += `<option value="${_cenarios_arcabouco[cenario]["premissas"][p]["id"]}" ref="${_cenarios_arcabouco[cenario]["premissas"][p]["ref"]}">(${_cenarios_arcabouco[cenario]["premissas"][p]["ref"]}) ${_cenarios_arcabouco[cenario]["premissas"][p]["nome"]}</option>`;
			for (let o in _cenarios_arcabouco[cenario]["observacoes"])
				observacoes_html += `<option value="${_cenarios_arcabouco[cenario]["observacoes"][o]["id"]}" ref="${_cenarios_arcabouco[cenario]["observacoes"][o]["ref"]}">(${_cenarios_arcabouco[cenario]["observacoes"][o]["ref"]}) ${_cenarios_arcabouco[cenario]["observacoes"][o]["nome"]}</option>`;
		}
	}
	/*
		Inicia os valores dos selects das linhas de 'table_operacoes_add'.
	*/
	function setSelectValues_OperacaoAddTable(data){
		$(document.getElementById("table_operacoes_add")).find("tbody tr").each(function (t, tr){
			tr = $(tr);
			if ("ativo" in data[t])
				tr.find("select[name='ativo']").val("").find("option").filter((i, el) => data[t].ativo.toLowerCase().includes(el.innerHTML.toLowerCase())).prop("selected", true);
			if ("op" in data[t])
				tr.find("select[name='op']").val(data[t].op);
			if ("rr" in data[t])
				tr.find("select[name='rr']").val(data[t].rr);
			if ("cenario" in data[t]){
				tr.find("select[name='cenario']").val("").find("option").filter((i, el) => data[t].cenario === el.innerHTML).prop("selected", true);
				if (tr.find("select[name='cenario']").val() === null)
					tr.find("input[name='premissas'],input[name='observacoes']").val("");
			}
		});
	}
	/*
		Adiciona uma linha na tabela de adição de operações.
	*/
	function buildOperacaoAddTable(data = []){
		let tbody_html = ``,
			thead_html = ``,
			table = $(document.getElementById("table_operacoes_add")),
			table_layout = $(document.getElementById("table_layout")).val(),
			select_ativos_html = buildAtivosSelect_OperacaoAddTable(),
			select_cenarios_html = buildCenariosSelect_OperacaoAddTable();
		//Constroi o THEAD
		if (table_layout === "scalp"){
			thead_html += `<tr>`+
						  `<th name="sequencia">#</th>`+
						  `<th name="data">Data</th>`+
						  `<th name="ativo">Ativo</th>`+
						  `<th name="op">Op.</th>`+
						  `<th name="rr">R:R</th>`+
						  `<th name="vol">Vol</th>`+
						  `<th name="cts">Cts</th>`+
						  `<th name="hora">Hora</th>`+
						  `<th name="entrada">Entrada</th>`+
						  `<th name="stop">Stop</th>`+
						  `<th name="alvo">Alvo</th>`+
						  `<th name="men">MEN</th>`+
						  `<th name="mep">MEP</th>`+
						  `<th name="saida">Saída</th>`+
						  `<th name="cenario">Cenário</th>`+
						  `<th name="premissas">Premissas</th>`+
						  `<th name="observacoes">Observações</th>`+
						  `<th name="erro">Erro</th>`+
						  `</tr>`;
		}
		//Constroi o TBODY
		for (let i=0; i<data.length; i++){
			//Layout de Scalp
			if (table_layout === "scalp"){
				tbody_html += `<tr>`+
							`<td name="sequencia"><input type="text" name="sequencia" class="form-control form-control-sm" value="${i+1}" readonly></td>`+
							`<td name="data"><input type="text" name="data" class="form-control form-control-sm" onclick="this.select()" value="${data[i].data}"></td>`+
							`<td name="ativo"><select class="form-select form-select-sm" name="ativo">${select_ativos_html}</select></td>`+
							`<td name="op"><select name='op' class="form-select form-select-sm"><option value="1">Compra</option><option value="2">Venda</option></select></td>`+
							`<td name="rr"><select name='rr' class="form-select form-select-sm"><option value="">---</option><optgroup label="R:R Negativo"><option value="2:1">2:1</option><option value="3:1">3:1</option></optgroup></select></td>`+
							`<td name="vol"><input type="text" name="vol" class="form-control form-control-sm" onclick="this.select()" value="${data[i].vol}"></td>`+
							`<td name="cts"><input type="text" name="cts" class="form-control form-control-sm" onclick="this.select()" value="${data[i].cts}"></td>`+
							`<td name="hora"><input type="text" name="hora" class="form-control form-control-sm" onclick="this.select()" value="${data[i].hora}"></td>`+
							`<td name="entrada"><input type="text" name="entrada" class="form-control form-control-sm" onclick="this.select()" value="${data[i].entrada}"></td>`+
							`<td name="stop"><input type="text" name="stop" class="form-control form-control-sm" onclick="this.select()" value="${data[i].stop}"></td>`+
							`<td name="alvo"><input type="text" name="alvo" class="form-control form-control-sm" onclick="this.select()" value="${data[i].alvo}"></td>`+
							`<td name="men"><input type="text" name="men" class="form-control form-control-sm" onclick="this.select()" value="${data[i].men}"></td>`+
							`<td name="mep"><input type="text" name="mep" class="form-control form-control-sm" onclick="this.select()" value="${data[i].mep}"></td>`+
							`<td name="saida"><input type="text" name="saida" class="form-control form-control-sm" onclick="this.select()" value="${data[i].saida}"></td>`+
							`<td name="cenario"><select class="form-select form-select-sm" name="cenario">${select_cenarios_html}</select></td>`+
							`<td name="premissas"><input type="text" name="premissas" class="form-control form-control-sm" onclick="this.select()" value="${data[i].premissas.map(s => s.trim()).join(",")}"></td>`+
							`<td name="observacoes"><input type="text" name="observacoes" class="form-control form-control-sm" onclick="this.select()" value="${data[i].observacoes.map(s => s.trim()).join(",")}"></td>`+
							`<td name="erro"><input type="checkbox" name="erro" class="form-check-input" ${(data[i].erro == 1)?"checked":""}></td>`+
							`</tr>`;
			}
		}
		table.find("thead").empty().append(thead_html);
		table.find("tbody").empty().append(tbody_html).promise().then(function (){
			setSelectValues_OperacaoAddTable(data);
		});
	}
	/*
		Recalcula o Stop e Alvo, baseado nos dados preenchidos em um linha da 'table_operacoes_add'.
	*/
	function recalcStopeAlvo_OperacoesAddTable(tr_data){
		let novo_alvo = '',
			novo_stop = '';
		if (tr_data.vol == 0 || tr_data.pts_tick == 0 || (tr_data.risco == 0 && tr_data.retorno == 0))
			return;
		//Se for compra
		if (tr_data.op == "1"){
			if (tr_data.retorno != 0)
				novo_alvo = tr_data.entrada + (tr_data.pts_tick * tr_data.vol * tr_data.retorno);
			if (tr_data.risco != 0)
				novo_stop = tr_data.entrada - (tr_data.pts_tick * tr_data.vol * tr_data.risco);
		}
		else if (tr_data.op == "2"){
			if (tr_data.retorno != 0)
				novo_alvo = tr_data.entrada - (tr_data.pts_tick * tr_data.vol * tr_data.retorno);
			if (tr_data.risco != 0)
				novo_stop = tr_data.entrada + (tr_data.pts_tick * tr_data.vol * tr_data.risco);	
		}
		tr_data.tr.find("input[name='alvo']").val(novo_alvo);
		tr_data.tr.find("input[name='stop']").val(novo_stop);
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*---------------------------- EXECUCAO DAS FUNCOES ------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------- Section Arcabouço --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------ Lista Arcabouços --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Marca os inputs que forem alterados.
	*/
	$(document.getElementById("arcaboucos_modal_form")).on("change", "input[name]", function (){
		this.setAttribute("changed", "");
	});
	/*
		Processa os cliques em 'table_arcaboucos'.
			 - Clicar na linha: Muda o arcabouço principal/(selecionado) na lista de instancias de arcabouço.
			 - Clicar + (Ctrl): Inclui esse arcabouço na lista de instancias de arcabouço.
	*/
	$(document.getElementById("table_arcaboucos")).on("click", "tbody tr", function (e){
		if (window.getSelection().toString() || document.getSelection().toString())
			return false;
		if (e.target.nodeName !== "BUTTON" && e.target.nodeName !== "I"){
			let id_arcabouco = this.getAttribute("arcabouco");
			if (e.ctrlKey){
				ctrl__instancias.add({
					instancia: Global._random.str("i"),
					id: id_arcabouco,
					nome: _arcaboucos[id_arcabouco].nome,
					color: _arcaboucos__instancias_colors[ctrl__instancias.size()],
					selected: false
				});
			}
		}
	});
	/*
		Processa click em 'table_arcabouco' (Para Edição dos arcabouços)
			 - (Criador Apenas) Clicar em alterar arcabouço: Joga os dados para o formulario.
	*/
	$(document.getElementById("table_arcaboucos")).on("click", "tbody tr td button[name='editar']", function (e){
		let id_arcabouco = $(this).parentsUntil("tbody").last().attr("arcabouco"),
			usuarios_select = [],
			form = $(document.getElementById("arcaboucos_modal_form"));
		for (let u in _arcaboucos[id_arcabouco].usuarios)
			usuarios_select.push(_arcaboucos[id_arcabouco]["usuarios"][u].usuario);
		form.find("input[name='nome']").val(_arcaboucos[id_arcabouco].nome).removeAttr("changed");
		form.find("input[name='meta']").val(_arcaboucos[id_arcabouco].meta).removeAttr("changed");
		form.find("select[name='usuarios']").selectpicker('val', usuarios_select).removeAttr("changed");
		form.attr("id_arcabouco", id_arcabouco);
	});
	/*
		Processa os duplos cliques em 'table_arcaboucos'.
			 - (Criador Apenas) Duplo clique em remover arcabouço: Excluir esse arcabouço e todas as suas instancias da lista.
	*/
	$(document.getElementById("table_arcaboucos")).on("dblclick", "tbody tr td button[name='remover']", function (e){
		console.log("remove");
	});
	/*
		Cancela envio de adição ou edição de arcabouços, removendo os dados do formulário e resetando ele.
	*/
	$(document.getElementById("arcaboucos_modal_cancelar")).click(function (){
		resetFormArcaboucoModal();
	});
	/*
		Envia info do formulario de arcabouços para adicionar ou editar um arcabouço.
	*/
	$(document.getElementById("arcaboucos_modal_enviar")).click(function (){
		let form = $(document.getElementById("arcaboucos_modal_form"));
			id_arcabouco = form.attr("id_arcabouco"),
			data = {};
		form.find("input[name][changed],select[name][changed]").each(function (){
			data[this.name] = $(this).val();
		});
		//Se for edição
		if (id_arcabouco){
			if (!Global.isObjectEmpty(data)){
				Global.connect({
					data: {module: "renda_variavel", action: "update_arcaboucos", params: data},
					success: function (result){
						if (result.status){
							resetFormArcaboucoModal();
							updateArcaboucos.update(data);
							buildArcaboucosTable();
						}
						else
							Global.toast.create({location: document.getElementById("arcaboucos_modal_toasts"), color: "danger", body: result.error, delay: 4000});
					}
				});
			}
		}
		//Se for adição
		else{
			if (!("nome" in data) || data["nome"] === ""){
				Global.toast.create({location: document.getElementById("arcaboucos_modal_toasts"), color: "warning", body: "Nome inválido.", delay: 4000});
				return;
			}
			Global.connect({
				data: {module: "renda_variavel", action: "insert_arcaboucos", params: data},
				success: function (result){
					if (result.status){
						resetFormArcaboucoModal();
						updateArcaboucos.update(data);
						buildArcaboucosTable();
					}
					else
						Global.toast.create({location: document.getElementById("arcaboucos_modal_toasts"), color: "danger", body: result.error, delay: 4000});
				}
			});
		}
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*--------------------------------- Lista Ops ------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Processa o filtro na tabela 'lista_ops__table'.
	*/
	$(document.getElementById("renda_variavel__section")).on("keyup", "#lista_ops__actions form input", function (){
		$(document.getElementById("lista_ops__table")).DataTable().column(`${this.name}:name`).search(this.value).draw();
	});
	/*
		Processa os cliques na tabela de operações de um arcabouço.
		Click:
			- (Ctrl): Selecionar 1 row.
	*/
	$(document.getElementById("renda_variavel__section")).on("mousedown", "#lista_ops__table tbody tr", function (e){
		//Ativa a seleção de linhas (Ctrl pressionado)
		if (e.ctrlKey){
			e.preventDefault();
			//Se ja ta selecionado, desmarca
			if (Global.hasClass(this, "selected"))
				$(this).removeClass("selected");
			else{
				_lista_ops__table_DT_clickState = 1;
				$(this).addClass("selected");
			}
			let action_submenu = $(document.getElementById("lista_ops__actions"));
			if ($(document.getElementById("lista_ops__table")).find("tbody tr.selected").length === 0){
				action_submenu.find("button[name='alterar_sel']").addClass("d-none");
				action_submenu.find("button[name='remove_sel']").addClass("d-none");
			}
			else if ($(document.getElementById("lista_ops__table")).find("tbody tr.selected").length === 1){
				action_submenu.find("button[name='alterar_sel']").removeClass("d-none");
				action_submenu.find("button[name='remove_sel']").removeClass("d-none");
			}
			else
				action_submenu.find("button[name='alterar_sel']").addClass("d-none");
		}
		//Deseleciona tudo
		else{
			$(document.getElementById("lista_ops__table")).find("tbody tr.selected").removeClass("selected");
			$(document.getElementById("lista_ops__actions")).find("button[name='alterar_sel'], button[name='remove_sel']").addClass("d-none");
		}
	}).on("mouseenter", "#lista_ops__table tbody tr", function (e){
		//Seleciona linhas caso esteje segurando (Ctrl e Click)
		if (_lista_ops__table_DT_clickState && e.ctrlKey){
			e.preventDefault();
			$(this).addClass("selected");
			let action_submenu = $(document.getElementById("lista_ops__actions"));
			if ($(document.getElementById("lista_ops__table")).find("tbody tr.selected").length > 1)
				action_submenu.find("button[name='alterar_sel']").addClass("d-none");
		}
	}).on("mouseup", "#lista_ops__table tbody tr", function (e){
		if (e.ctrlKey)
			_lista_ops__table_DT_clickState = 0;
	});
	/*
		Processa a remocao de tudo ou das operações selecionadas com double click.
	*/
	$(document.getElementById("renda_variavel__section")).on("dblclick", "#lista_ops__actions button[name]", function (){
		let remove_data = {};
		//Remove todas as operações do arcabouço
		if (this.name === "remove_all")
			remove_data = {id_arcabouco: ctrl__instancias.getSelected('id'), operacoes: []};
		else if (this.name === "remove_sel"){
			remove_data = {id_arcabouco: ctrl__instancias.getSelected('id'), operacoes: []};
			$(document.getElementById("lista_ops__table")).find("tbody tr.selected").each(function (i, tr){
				remove_data["operacoes"].push(tr.getAttribute("operacao"));
			});
			if (remove_data["operacoes"].length === 0){
				Global.toast.create({location: document.getElementById("master_toasts"), title: "Erro", time: "Now", body: "Nenhuma operação selecionada.", delay: 4000});
				return false;
			}
		}
		if (!Global.isObjectEmpty(remove_data)){
			Global.connect({
				data: {module: "renda_variavel", action: "remove_operacoes", params: remove_data},
				success: function (result){
					if (result.status){
						Global.toast.create({location: document.getElementById("master_toasts"), title: "Sucesso", time: "Now", body: "Operações Apagadas.", delay: 4000});
						updateOperacoes_Arcabouco(result.data);
						rebuildArcaboucoSection();
					}
					else
						Global.toast.create({location: document.getElementById("master_toasts"), title: "Erro", time: "Now", body: result.error, delay: 4000});
				}
			});
		}
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------- Dashboard Ops ----------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Processa um clique nas instancias de arcabouço.
			- Clique normal: Muda a instancia selecionada.
			- Clique + Ctrl: Remove a instancia da lista.
	*/
	$(document.getElementById("renda_variavel__instancias")).on("click", "span.badge", function (e){
		if (e.ctrlKey)
			ctrl__instancias.remove(this.getAttribute("instancia"));
		else{
			if (ctrl__instancias.getSelected("instancia") !== this.getAttribute("instancia")){
				ctrl__instancias.setSelected(this.getAttribute("instancia"));
				Global.connect({
					data: {module: "renda_variavel", action: "get_arcabouco_data", params: {id_arcabouco: ctrl__instancias.getSelected("id")}},
					success: function (result){
						if (result.status){
							updateCenarios_Arcabouco.create(result.data["cenarios"]);
							updateOperacoes_Arcabouco(result.data["operacoes"]);
							rebuildArcaboucoSection();
						}
						else
							Global.toast.create({location: document.getElementById("master_toasts"), title: "Erro", time: "Now", body: result.error, delay: 4000});
					}
				});
			}
		}
	});
	/*
		Processa a mudança em 'filters' do DatePicker.
	*/
	$(document.getElementById("renda_variavel__section")).on("apply.daterangepicker", "#dashboard_ops__filter input[name='data']", function (ev, picker){
		dashboard__filters_LS.update(ctrl__instancias.getSelected('id'), "data_inicial", picker.startDate.format("DD/MM/YYYY"));
		dashboard__filters_LS.update(ctrl__instancias.getSelected('id'), "data_final", picker.endDate.format("DD/MM/YYYY"));
	});
	/*
		Processa a mudança em 'filters' que usam select cru.
	*/
	$(document.getElementById("renda_variavel__section")).on("change", "#dashboard_ops__filter select[name='ignora_erro']", function (){
		dashboard__filters_LS.update(ctrl__instancias.getSelected('id'), this.name, $(this).val());
	});
	/*
		Processa as seleções de premissas e observações em 'filters'.
	*/
	$(document.getElementById("renda_variavel__section")).on("click", "#dashboard_ops__filter div.iSelectKami[name] ul li button.dropdown-item", function (e){
		let me = $(this),
			cenario_nome = me.attr("pertence"),
			div_holder = me.parent().parent().parent(),
			select_name = div_holder.attr("name"),
			placeholder = {'premissas': 'Premissas', 'observacoes': 'Observações'},
			dashboard_filters = dashboard__filters_LS.getFromArcabouco(ctrl__instancias.getSelected('id')),
			selected_values = {},
			qtd_selected = 0;
		//Se o target não for um clique no input, processa a seleção da observação
		if (e.target.nodeName !== "INPUT"){
			if (this.hasAttribute("selected")){
				me.removeAttr("selected").find("input[name='negar_valor']").prop("checked", false);
				delete dashboard_filters["cenario"][cenario_nome][select_name][me.attr("value")];
			}
			else{
				me.attr("selected", "");
				dashboard_filters["cenario"][cenario_nome][select_name][me.attr("value")] = (me.find("input[name='negar_valor']").prop("checked")) ? 1 : 0;
			}
		}
		//Se for no input, caso não esteja selecionado, des-checa o input
		else{
			if (!this.hasAttribute("selected"))
				me.find("input[name='negar_valor']").prop("checked", false);
			else
				dashboard_filters["cenario"][cenario_nome][select_name][me.attr("value")] = (me.find("input[name='negar_valor']").prop("checked")) ? 1 : 0;	
		}
		//Atualiza no localStorage
		dashboard__filters_LS.update(ctrl__instancias.getSelected('id'), "cenario", dashboard_filters["cenario"]);
		//Atualiza o placeholder
		qtd_selected = div_holder.find("ul button.dropdown-item[selected]").length;
		div_holder.find("button.dropdown-toggle").html(((qtd_selected > 1) ? `${qtd_selected} items selected` : ((qtd_selected === 1) ? `1 item selected` : `${placeholder[select_name]}`)));
	});
	/*
		Processa a de-seleção de todos os valores no select de observações ou premissas.
	*/
	$(document.getElementById("renda_variavel__section")).on("click", "#dashboard_ops__filter div.iSelectKami[name] ul li button[name='tira_tudo']", function (){
		let div_holder = $(this).parent().parent().parent().parent(),
			select_name = div_holder.attr("name"),
			placeholder = {'premissas': 'Premissas', 'observacoes': 'Observações'},
			dashboard_filters = dashboard__filters_LS.getFromArcabouco(ctrl__instancias.getSelected('id'));
		div_holder.find("ul button.dropdown-item[selected]").each(function (i, el){
			el.removeAttribute("selected");
			el.querySelector("input[name='negar_valor']").checked = false;
		});
		for (cenario_nome in dashboard_filters["cenario"])
			dashboard_filters["cenario"][cenario_nome][select_name] = {};
		dashboard__filters_LS.update(ctrl__instancias.getSelected('id'), "cenario", dashboard_filters["cenario"]);
		//Atualiza o placeholder
		div_holder.find("button.dropdown-toggle").html(`${placeholder[select_name]}`);
	});
	/*
		Processa no select de observações e premissas, mudança no tipo de query a ser formatada na filtragem. (OR ou AND)
	*/
	$(document.getElementById("renda_variavel__section")).on("change", "#dashboard_ops__filter div.iSelectKami[name] ul li select.iSelectKami", function (){
		dashboard__filters_LS.update(ctrl__instancias.getSelected('id'), this.name, $(this).val());
	});
	/*
		Processa a mudança em 'simulate' que usam select cru.
	*/
	$(document.getElementById("renda_variavel__section")).on("change", "#dashboard_ops__simulate select[name]", function (){
		let value = $(this).val();
		if (this.name === "tipo_cts"){
			if (value === "1" || value === "3"){
				$(document.getElementById("dashboard_ops__simulate")).find("input[name='cts']").val("").prop("disabled", true);
				dashboard__simulations_LS.update(ctrl__instancias.getSelected('id'), "cts", "");
			}
			else
				$(document.getElementById("dashboard_ops__simulate")).find("input[name='cts']").prop("disabled", false);
		}
		dashboard__simulations_LS.update(ctrl__instancias.getSelected('id'), this.name, value);
	});
	/*
		Processa a mudança em 'simulate' que usam input cru.
	*/
	$(document.getElementById("renda_variavel__section")).on("change", "#dashboard_ops__simulate input[name]", function (){
		dashboard__simulations_LS.update(ctrl__instancias.getSelected('id'), this.name, $(this).val());
	}).on("click", "#dashboard_ops__refresh", function (){
		rebuildArcaboucoSection();
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------ Section Cenarios --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Processa a adição de um novo Cenário.
	*/
	$(document.getElementById("cenarios_modal_adicionar")).click(function (){
		let copiar_cenario = $(document.getElementById("cenarios_modal_copiar")).val();
		if (copiar_cenario === "")
			$(document.getElementById("table_cenarios")).find("div[empty]").remove().end().prepend(buildCenario({}, true));
		else{
			let copy_data = {nome: "", premissas: [], observacoes: []},
				cenario = $(document.getElementById("table_cenarios")).find("input[name='cenario_nome']").filter(function (){ return this.value === copiar_cenario; }).parentsUntil("#table_cenarios").last();
			//Pega o nome do cenario
			copy_data.nome = cenario.find("input[name='cenario_nome']").val();
			//Pega as premissas
			cenario.find("div[target='premissas'] table tbody tr").each(function (i, tr){
				if (tr.hasAttribute("empty"))
					return;
				tr = $(tr);
				copy_data.premissas.push({
					nome: tr.find("input[name='nome']").val(),
					cor: tr.find("input[name='cor']").val(),
					obrigatoria: tr.find("input[name='obrigatoria']").prop("checked"),
					inativo: tr.find("input[name='inativo']").prop("checked")
				});
			});
			//Pega as observacoes
			cenario.find("div[target='observacoes'] table tbody tr").each(function (i, tr){
				if (tr.hasAttribute("empty"))
					return;
				tr = $(tr);
				copy_data.observacoes.push({
					nome: tr.find("input[name='nome']").val(),
					cor: tr.find("input[name='cor']").val(),
					inativo: tr.find("input[name='inativo']").prop("checked")
				});
			});
			$(document.getElementById("table_cenarios")).find("div[empty]").remove().end().prepend(buildCenario(copy_data, true));
		}
	});
	/*
		Processa a remocao de cenarios com double click.
	*/
	$(document.getElementById("table_cenarios")).on("dblclick", "button", function (){
		//Remove um cenario
		if (this.hasAttribute("remover_cenario")){
			let cenario_div = $(this).parentsUntil("#table_cenarios").last(),
				table_cenarios = cenario_div.parent();
			//Se é um novo cenario, apenas remove
			if (cenario_div[0].hasAttribute("new_cenario")){
				cenario_div.remove();
				if (table_cenarios.children().length === 0)
					table_cenarios.append(buildCenariosTable());
			}
			else{
				let remove_data = {id: cenario_div.attr("cenario")};
				Global.connect({
					data: {module: "renda_variavel", action: "remove_cenarios", params: remove_data},
					success: function (result){
						if (result.status){
							Global.toast.create({location: document.getElementById("cenarios_modal_toasts"), color: "success", body: "Cenário Removido.", delay: 4000});
							updateCenarios_Arcabouco.remove(remove_data.id);
							rebuildCenarios_modal_copiar();
							cenario_div.remove();
							if (table_cenarios.children().length === 0)
								table_cenarios.append(buildCenariosTable());
						}
						else
							Global.toast.create({location: document.getElementById("cenarios_modal_toasts"), color: "danger", body: result.error, delay: 4000});
					}
				});
			}
		}
	});
	/*
		Processa a adicao / remocao de linhas de premissas e observacoes.
	*/
	$(document.getElementById("table_cenarios")).on("click", "button", function (e){
		//Apenas insere uma nova premissa
		if (this.hasAttribute("adicionar_premissa")){
			let me = $(this),
				html = 	`<tr new_premissa>`+
						`<td name="nome"><div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value=""><button class="btn btn-sm btn-outline-danger" type="button" remover_premissa>Excluir</button></div></td>`+
						`<td name="ref"><input type="text" name="ref" class="form-control form-control-sm text-center"></td>`+
						`<td name="cor"><div class="d-flex justify-content-center"><input type="color" name="cor" class="form-control form-control-sm form-control-color" value="#ffffff"></div></td>`+
						`<td name="obrigatoria"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="obrigatoria" class="form-check-input"></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input"></div></td>`+
						`</tr>`;
			me.parentsUntil("#table_cenarios").last().find("div[target='premissas'] tbody tr[empty]").remove();
			me.parentsUntil("#table_cenarios").last().find("div[target='premissas'] tbody").prepend(html).promise().then(function (){
				//Adiciona um badge mostrando a quantidade de premissas adicionadas
				let qtd_new = this.find("[new_premissa]").length,
					tab_premissas = me.parentsUntil("#table_cenarios").last().find("a.nav-link[target='premissas']");
				tab_premissas.find("span.badge[new]").remove();
				tab_premissas.append(`<span class="badge bg-primary ms-1" new>+${qtd_new}</span>`);
			});
		}
		//Remove uma premissa
		if (this.hasAttribute("remover_premissa")){
			let me = $(this),
				premissa_row = me.parentsUntil("tbody").last();
			//Se é uma nova premissa, apenas remove
			if (premissa_row[0].hasAttribute("new_premissa")){
				let tbody = me.parentsUntil("table").last(),
					tab_premissas = me.parentsUntil("#table_cenarios").last().find("a.nav-link[target='premissas']");
				premissa_row.remove().promise().then(function (){
					let qtd_new = tbody.find("[new_premissa]").length,
						qtd_total = tbody.find("tr").length;
					//Recontagem do badge mostrando a quantidade de premissas adicionadas
					tab_premissas.find("span.badge[new]").remove();
					if (qtd_new)
						tab_premissas.append(`<span class="badge bg-primary ms-1" new>+${qtd_new}</span>`);
					if (qtd_total === 0)
						tbody.append(buildListaPremissas_Observacoes({}, 1));
				});
			}
			//Se é uma remocao de premissa, marca ela para remocao no BD
			else{
				me.prop("disabled", true).removeClass("btn-danger").addClass("btn-secondary");
				premissa_row.attr("remover", "").find("input").prop("disabled", true);
				$(this).parentsUntil("#table_cenarios").last().find("button[salvar_cenario]").removeClass("disabled");
			}
		}
		//Apenas insere uma nova observacao
		if (this.hasAttribute("adicionar_observacao")){
			let me = $(this),
				html = 	`<tr new_observacao>`+
						`<td name="nome"><div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value=""><button class="btn btn-sm btn-outline-danger" type="button" remover_observacao>Excluir</button></div></td>`+
						`<td name="ref"><input type="text" name="ref" class="form-control form-control-sm text-center"></td>`+
						`<td name="cor"><div class="d-flex justify-content-center"><input type="color" name="cor" class="form-control form-control-sm form-control-color" value="#ffffff"></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input"></div></td>`+
						`</tr>`;
			me.parentsUntil("#table_cenarios").last().find("div[target='observacoes'] tbody tr[empty]").remove();
			me.parentsUntil("#table_cenarios").last().find("div[target='observacoes'] tbody").prepend(html).promise().then(function (){
				//Adiciona um badge mostrando a quantidade de observacoes adicionadas
				let qtd_new = this.find("[new_observacao]").length,
					tab_observacoes = me.parentsUntil("#table_cenarios").last().find("a.nav-link[target='observacoes']");
				tab_observacoes.find("span.badge[new]").remove();
				tab_observacoes.append(`<span class="badge bg-primary ms-1" new>+${qtd_new}</span>`);
			});
		}
		//Remove uma observacao
		if (this.hasAttribute("remover_observacao")){
			let me = $(this),
				observacao_row = me.parentsUntil("tbody").last();
			//Se é uma nova observacao, apenas remove
			if (observacao_row[0].hasAttribute("new_observacao")){
				let tbody = me.parentsUntil("table").last(),
					tab_observacoes = me.parentsUntil("#table_cenarios").last().find("a.nav-link[target='observacoes']");
				observacao_row.remove().promise().then(function (){
					let qtd_new = tbody.find("[new_observacao]").length,
						qtd_total = tbody.find("tr").length;
					//Recontagem do badge mostrando a quantidade de premissas adicionadas
					tab_observacoes.find("span.badge[new]").remove();
					if (qtd_new)
						tab_observacoes.append(`<span class="badge bg-primary ms-1" new>+${qtd_new}</span>`);
					if (qtd_total === 0)
						tbody.append(buildListaPremissas_Observacoes({}, 2));
				});
			}
			//Se é uma remocao de observacao, marca ela para remocao no BD
			else{
				me.prop("disabled", true).removeClass("btn-danger").addClass("btn-secondary");
				observacao_row.attr("remover", "").find("input").prop("disabled", true);
				$(this).parentsUntil("#table_cenarios").last().find("button[salvar_cenario]").removeClass("disabled");
			}
		}
		//Processa a adição de um cenário no BD
		if (this.hasAttribute("salvar_novo_cenario")){
			let cenario_div = $(this).parentsUntil("#table_cenarios").last(),
				insert_data = cenarioGetData(cenario_div);
			if (!Global.isObjectEmpty(insert_data)){
				Global.connect({
					data: {module: "renda_variavel", action: "insert_cenarios", params: insert_data},
					success: function (result){
						if (result.status){
							Global.toast.create({location: document.getElementById("cenarios_modal_toasts"), color: "success", body: "Cenário Adicionado.", delay: 4000});
							cenario_div.replaceWith(buildCenario(result.data[0], false));
							updateCenarios_Arcabouco.update(result.data[0]);
							rebuildCenarios_modal_copiar();
						}
						else
							Global.toast.create({location: document.getElementById("cenarios_modal_toasts"), color: "danger", body: result.error, delay: 4000});
					}
				});
			}
		}
		//Processa a alteração de um cenário no BD
		if (this.hasAttribute("salvar_cenario")){
			let cenario_div = $(this).parentsUntil("#table_cenarios").last(),
				update_data = cenarioGetData(cenario_div);
			if (update_data["insert"]["premissas"].length || update_data["insert"]["observacoes"].length || update_data["update"]["cenarios"].length || update_data["update"]["premissas"].length || update_data["update"]["observacoes"].length || update_data["remove"]["premissas"].length || update_data["remove"]["observacoes"].length){
				Global.connect({
					data: {module: "renda_variavel", action: "update_cenarios", params: update_data},
					success: function (result){
						if (result.status){
							Global.toast.create({location: document.getElementById("cenarios_modal_toasts"), color: "success", body: "Cenário Atualizado.", delay: 4000});
							cenario_div.replaceWith(buildCenario(result.data[0], false));
							updateCenarios_Arcabouco.update(result.data[0]);
							rebuildCenarios_modal_copiar();
						}
						else
							Global.toast.create({location: document.getElementById("cenarios_modal_toasts"), color: "danger", body: result.error, delay: 4000});
					}
				});
			}
		}
	});
	/*
		Facilita o seletor de obrigatoria e inativo, clicando tambem no TD.
	*/
	$(document.getElementById("table_cenarios")).on("click", "td[name='obrigatoria'], td[name='inativo']", function (e){
		if (e.target.tagName === "INPUT")
			return true;
		let input = this.querySelector("input[type='checkbox']");
		if (!input.hasAttribute("disabled"))
			$(input).trigger("click");
	});
	/*
		Marca tudo oque tiver mudança.
	*/
	$(document.getElementById("table_cenarios")).on("change", "input[name]", function (){
		this.setAttribute("changed", "");
		if (this.name === "ref")
			reorder_premissas_e_observacoes($(this).parentsUntil("table").last()[0]);
		let cenario_div = $(this).parentsUntil("#table_cenarios").last();
		if (cenario_div[0].hasAttribute("cenario"))
			cenario_div.find("button[salvar_cenario]").removeClass("disabled");
	});
	/*
		Processa a troca de abas entre 'Premissas' e 'Observações' no cenário.
	*/
	$(document.getElementById("table_cenarios")).on("click", "a.nav-link", function (){
		if (Global.hasClass(this, "active"))
			return false;
		let me = $(this);
		me.parentsUntil("div.card-header").last().find("a.active").removeClass("active");
		me.addClass("active");
		me.parentsUntil("#table_cenarios").last().find("div.card-body > div[target]").each(function (i, table){
			$(table).toggleClass("d-none", table.getAttribute("target") !== me.attr("target"));
		});
		//Altera o botao de adicionar entre 'adicionar_premissa' e 'adicionar_observacao'
		me.parentsUntil("#table_cenarios").last().find("button[adicionar_premissa],button[adicionar_observacao]").each(function (i, button){
			if (me.attr("target") === "premissas")
				$(button).removeAttr("adicionar_observacao").attr("adicionar_premissa", "").html(`<i class="fas fa-plus me-2"></i>Adicionar Premissa`);
			else if (me.attr("target") === "observacoes")
				$(button).removeAttr("adicionar_premissa").attr("adicionar_observacao", "").html(`<i class="fas fa-plus me-2"></i>Adicionar Observação`);
		});
		return false;
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*--------------------------- Section Operações Add ------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	$(document.getElementById("operacoes_modal")).on("hidden.bs.modal", function (){
		rebuildArcaboucoSection();
	});
	/*
		Processa a importação de um arquivo de operações.
	*/
	$(document.getElementById("importa_arquivo_operacoes_modal")).change(function (){
		let file_import = this;
		_csv_reader.reader.onload = function fileReadCompleted(){
			let file_format = $(document.getElementById("file_format")).val(),
				table_layout = $(document.getElementById("table_layout")).val(),
				data_lines = _csv_reader.processData(_csv_reader.reader.result, {file_format: file_format}),
				csvData = null;
			if (data_lines.length){
				csvData = _csv_reader.cleanData(data_lines, {file_format: file_format, table_layout: table_layout});
				if (csvData.length)
					buildOperacaoAddTable(csvData);
				else
					Global.toast.create({location: document.getElementById("operacoes_modal_toasts"), color: "danger", body: "Falha ao ler o arquivo. (Número de colunas muda em certas linhas)", delay: 4000});
			}
			else
				Global.toast.create({location: document.getElementById("operacoes_modal_toasts"), color: "danger", body: "Falha ao ler o arquivo. (Arquivo Vazio)", delay: 4000});
			file_import.value = "";
		};
		_csv_reader.reader.readAsText(this.files[0], "ISO-8859-2");
	});
	/*
		Processa alteracoes no select de R:R, Vol, Entrada, Op e Ativo, para alterar o Stop e Alvo. (Caso o Vol e R:R esteja preenchido)
	*/
	$(document.getElementById("table_operacoes_add")).on("change", "select[name='rr']", function (){
		let tr = $(this).parentsUntil("tbody").last(),
			op = tr.find("select[name='op']").val(),
			pts_tick = tr.find("select[name='ativo'] option:selected").attr("pts_tick"),
			rr = $(this).val().split(":"),
			risco = ((rr.length === 2)?parseInt(rr[0]):0),
			retorno = ((rr.length === 2)?parseInt(rr[1]):0),
			vol = tr.find("input[name='vol']").val(),
			entrada = tr.find("input[name='entrada']").val();
		vol = ((vol !== "")?parseFloat(vol):0.0);
		pts_tick = ((pts_tick)?parseFloat(pts_tick):0.0);
		entrada = ((entrada !== "")?parseFloat(entrada):0.0);
		recalcStopeAlvo_OperacoesAddTable({op: op, pts_tick: pts_tick, risco: risco, retorno: retorno, vol: vol, entrada: entrada, tr: tr});
	});
	$(document.getElementById("table_operacoes_add")).on("change", "input[name='vol']", function (){
		let tr = $(this).parentsUntil("tbody").last(),
			op = tr.find("select[name='op']").val(),
			pts_tick = tr.find("select[name='ativo'] option:selected").attr("pts_tick"),
			rr = tr.find("select[name='rr']").val().split(":"),
			risco = ((rr.length === 2)?parseInt(rr[0]):0),
			retorno = ((rr.length === 2)?parseInt(rr[1]):0),
			vol = $(this).val(),
			entrada = tr.find("input[name='entrada']").val();
		vol = ((vol !== "")?parseFloat(vol):0.0);
		pts_tick = ((pts_tick)?parseFloat(pts_tick):0.0);
		entrada = ((entrada !== "")?parseFloat(entrada):0.0);
		recalcStopeAlvo_OperacoesAddTable({op: op, pts_tick: pts_tick, risco: risco, retorno: retorno, vol: vol, entrada: entrada, tr: tr});
	});
	$(document.getElementById("table_operacoes_add")).on("change", "input[name='entrada']", function (){
		let tr = $(this).parentsUntil("tbody").last(),
			op = tr.find("select[name='op']").val(),
			pts_tick = tr.find("select[name='ativo'] option:selected").attr("pts_tick"),
			rr = tr.find("select[name='rr']").val().split(":"),
			risco = ((rr.length === 2)?parseInt(rr[0]):0),
			retorno = ((rr.length === 2)?parseInt(rr[1]):0),
			vol = tr.find("input[name='vol']").val(),
			entrada = $(this).val();
		vol = ((vol !== "")?parseFloat(vol):0.0);
		pts_tick = ((pts_tick)?parseFloat(pts_tick):0.0);
		entrada = ((entrada !== "")?parseFloat(entrada):0.0);
		recalcStopeAlvo_OperacoesAddTable({op: op, pts_tick: pts_tick, risco: risco, retorno: retorno, vol: vol, entrada: entrada, tr: tr});
	});
	$(document.getElementById("table_operacoes_add")).on("change", "select[name='ativo']", function (){
		let tr = $(this).parentsUntil("tbody").last(),
			op = tr.find("select[name='op']").val(),
			pts_tick = $(this).find("option:selected").attr("pts_tick"),
			rr = tr.find("select[name='rr']").val().split(":"),
			risco = ((rr.length === 2)?parseInt(rr[0]):0),
			retorno = ((rr.length === 2)?parseInt(rr[1]):0),
			vol = tr.find("input[name='vol']").val(),
			entrada = tr.find("input[name='entrada']").val();
		vol = ((vol !== "")?parseFloat(vol):0.0);
		pts_tick = ((pts_tick)?parseFloat(pts_tick):0.0);
		entrada = ((entrada !== "")?parseFloat(entrada):0.0);
		recalcStopeAlvo_OperacoesAddTable({op: op, pts_tick: pts_tick, risco: risco, retorno: retorno, vol: vol, entrada: entrada, tr: tr});
	});
	$(document.getElementById("table_operacoes_add")).on("change", "select[name='op']", function (){
		let tr = $(this).parentsUntil("tbody").last(),
			op = $(this).val(),
			pts_tick = tr.find("select[name='ativo'] option:selected").attr("pts_tick"),
			rr = tr.find("select[name='rr']").val().split(":"),
			risco = ((rr.length === 2)?parseInt(rr[0]):0),
			retorno = ((rr.length === 2)?parseInt(rr[1]):0),
			vol = tr.find("input[name='vol']").val(),
			entrada = tr.find("input[name='entrada']").val();
		vol = ((vol !== "")?parseFloat(vol):0.0);
		pts_tick = ((pts_tick)?parseFloat(pts_tick):0.0);
		entrada = ((entrada !== "")?parseFloat(entrada):0.0);
		recalcStopeAlvo_OperacoesAddTable({op: op, pts_tick: pts_tick, risco: risco, retorno: retorno, vol: vol, entrada: entrada, tr: tr});
	});
	/*
		Reconstroi a select de premissas e observacoes ao mudar o cenario.
	*/
	$(document.getElementById("table_operacoes_add")).on("change", "select[name='cenario']", function (){
		$(this).parentsUntil("tbody").last().find("input[name='premissas'],input[name='observacoes']").val("");
	});
	/*
		Envia as operações para serem registradas no BD.
	*/
	$(document.getElementById("operacoes_modal_enviar")).click(function (){
		let table = $(document.getElementById("table_operacoes_add")),
			insert_data = {id_arcabouco: ctrl__instancias.getSelected('id'), operacoes: []},
			error = false;
		$(document.getElementById("table_operacoes_add")).find("tbody tr").each(function (t, tr){
			tr = $(tr);
			let sequencia = tr.find("input[name='sequencia']").val(),
				data = Global.convertDate(tr.find("input[name='data']").val()),
				ativo = tr.find("select[name='ativo'] option:selected").text(),
				op = tr.find("select[name='op']").val(),
				vol = tr.find("input[name='vol']").val(),
				cts = tr.find("input[name='cts']").val(),
				hora = tr.find("input[name='hora']").val(),
				erro = ((tr.find("input[name='erro']").is(":checked"))?1:0),
				entrada = tr.find("input[name='entrada']").val(),
				stop = tr.find("input[name='stop']").val(),
				alvo = tr.find("input[name='alvo']").val(),
				men = tr.find("input[name='men']").val(),
				mep = tr.find("input[name='mep']").val(),
				saida = tr.find("input[name='saida']").val(),
				cenario = tr.find("select[name='cenario'] option:selected").text(),
				premissas = tr.find("input[name='premissas']").val(),
				observacoes = tr.find("input[name='observacoes']").val(),
				ativo_custo = tr.find("select[name='ativo'] option:selected").attr("custo"),
				ativo_valor_tick = tr.find("select[name='ativo'] option:selected").attr("valor_tick"),
				ativo_pts_tick = tr.find("select[name='ativo'] option:selected").attr("pts_tick");
			if (data === "" || ativo === "" || op === "" || cts === "" || entrada === "" || saida === ""){
				if (data === "")
					table.find("thead th[name='data']").addClass("error");
				if (ativo === "")
					table.find("thead th[name='ativo']").addClass("error");
				if (op === "")
					table.find("thead th[name='op']").addClass("error");
				if (cts === "")
					table.find("thead th[name='cts']").addClass("error");
				if (entrada === "")
					table.find("thead th[name='entrada']").addClass("error");
				if (saida === "")
					table.find("thead th[name='saida']").addClass("error");
				tr.addClass("error");
				error = true;
			}
			else{
				tr.removeClass("error");
				insert_data["operacoes"].push({
					sequencia: sequencia,
					data: data,
					ativo: ativo,
					op: op,
					vol: vol,
					cts: cts,
					hora: hora,
					erro: erro,
					entrada: entrada,
					stop: stop,
					alvo: alvo,
					men: men,
					mep: mep,
					saida: saida,
					cenario: cenario,
					premissas: premissas,
					observacoes: observacoes,
					ativo_custo: ativo_custo,
					ativo_valor_tick: ativo_valor_tick,
					ativo_pts_tick: ativo_pts_tick
				});
			}
		});
		if (error)
			Global.toast.create({location: document.getElementById("operacoes_modal_toasts"), color: "danger", body: "Alguns campos devem serem preenchidos.", delay: 4000});
		else{
			table.find("thead th.error").removeClass("error");
			Global.connect({
				data: {module: "renda_variavel", action: "insert_operacoes", params: JSON.stringify(insert_data)},
				success: function (result){
					if (result.status){
						updateOperacoes_Arcabouco(result.data);
						if (result.hold_ops.length === 0){
							Global.toast.create({location: document.getElementById("operacoes_modal_toasts"), color: "success", body: "Operações Adicionadas.", delay: 4000});
							document.getElementById("importa_arquivo_operacoes_modal").value = "";
							document.getElementById("file_format").selectedIndex = 0;
							document.getElementById("table_layout").selectedIndex = 0;
							resetOperacaoAddTable();
						}
						else{
							Global.toast.create({location: document.getElementById("operacoes_modal_toasts"), color: "warning", body: "Essas operações já foram adicionadas.", delay: 4000});
							$(document.getElementById("table_operacoes_add")).find("tbody tr").each(function (t, tr){
								let seq = $(tr).find("input[name='sequencia']").val();
								if (!result.hold_ops.includes(seq))
									$(tr).remove();
							});
						}
					}
					else
						Global.toast.create({location: document.getElementById("operacoes_modal_toasts"), color: "danger", body: result.error, delay: 4000});
				}
			});
		}
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------------- Menu Top -----------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Comanda cliques no menu de renda variavel.
	*/
	$("button", document.getElementById("renda_variavel__menu")).click(function (){
		if (this.name === "arcaboucos")
			buildArcaboucosModal();
		else if (this.name === "cenarios")
			buildCenariosModal();
		else if (this.name === "adicionar_operacoes")
			buildOperacoesModal();
		else if (this.name === "dashboard_ops" || this.name === "lista_ops"){
			_selected_arcabouco_section = this.name;
			rebuildArcaboucoSection();
		}
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------- INIT DO SISTEMA --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	Global.connect({
		data: {module: "renda_variavel", action: "get_arcabouco_data"},
		success: function (result){
			if (result.status){
				updateUsuarios(result.data["usuarios"]);
				updateAtivos(result.data["ativos"]);
				updateArcaboucos.create(result.data["arcaboucos"]);
				//Seleciona o primeiro arcabouço na ordem que veio
				if (result.data["arcaboucos"].length){
					ctrl__instancias.add({
						instancia: Global._random.str("i"),
						id: result.data["arcaboucos"][0].id,
						nome: result.data["arcaboucos"][0].nome,
						color: _arcaboucos__instancias_colors[ctrl__instancias.size()],
						selected: true
					});
				}
				updateCenarios_Arcabouco.create(result.data["cenarios"]);
				updateOperacoes_Arcabouco(result.data["operacoes"]);
				buildArcaboucosModal('build');
				rebuildArcaboucoSection();
			}
			else
				Global.toast.create({location: document.getElementById("master_toasts"), title: "Erro", time: "Now", body: result.error, delay: 4000});
		}
	});
	/*--------------------------------------------------------------------------------*/
	return {
		updateAtivos: updateAtivos,
		rebuildArcaboucoSection: rebuildArcaboucoSection
	}
})();