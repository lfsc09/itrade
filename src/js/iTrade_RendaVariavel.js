let Renda_variavel = (function(){
	/*------------------------------------ VARS --------------------------------------*/
	//Contem a lista atual de cenarios do arcabouço selecionado
	let _cenarios_arcabouco = {};
	//Contem a lista atual de ativos cadastrados
	let	_ativos = [];
	//Contem a lista atual de operações do arcabouço selecionado
	let	_operacoes_arcabouco = [];
	//Informa qual seção do Section Arcabouço está sendo mostrado (dashboard_ops|lista_ops)
	let	_selected_arcabouco_section = 'dashboard_ops';
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
	/*----------------------------------- FUNCOES ------------------------------------*/
	/*----------------------------- Section Arcabouço --------------------------------*/
	/*
		Atualiza a lista interna de operações do arcabouco, usada para reconstroir a interface.
	*/
	function updateOperacoes_Arcabouco(data){
		//Atualiza o array
		_operacoes_arcabouco = data;
		//Atualiza a contagem de operacoes na lista de arcabouco
		$("a.arcabouco-selected", document.getElementById("table_arcaboucos")).find("small").html(`${$.fn.dataTable.render.number( '.', '', 0, '').display(data.length)} ops.`);
	}
	/*
		Salva localmente os cenarios e ativos, para uso na parte de adição de operações. (recarrega toda vez que o modal for aberto)
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
	function updateAtivos(data){
		//Atualiza o array
		_ativos = data;
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
				let dashboard_data = RV_Statistics.generate(_operacoes_arcabouco, {ignora_erro: 0}, {rr: "1", usa_custo: 1, R: 26, valor_inicial: 5000.00});
				//Submenu de Filtros do Dashboard
				html += `<div class="card mb-2 rounded-3 shadow-sm">`+
						`<div class="card-body p-2">`+
						`<div class="container-fluid d-flex justify-content-end px-0" id="dashboard_ops__filter">`+
						`<form class="row m-0 flex-fill">`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Filtrar Data</label><input type="text" name="data" class="form-control form-control-sm" placeholder="Data"></div>`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Filtrar Hora</label><div class="slider-styled filter-hora" name="hora"></div></div>`+
						`<div class="col-auto" name="ativo"><label class="form-label m-0 text-muted fw-bold">Filtrar Ativo</label><select name="ativo" multiple></select></div>`+
						`<div class="col-auto" name="cenario"><label class="form-label m-0 text-muted fw-bold">Filtrar Cenário</label><select name="cenario" multiple></select></div>`+
						`<div class="col-auto" name="premissas"><label class="form-label m-0 text-muted fw-bold">Filtrar Premissas</label><select name="premissas" multiple></select></div>`+
						`<div class="col-auto" name="observacoes"><label class="form-label m-0 text-muted fw-bold">Filtrar Observações</label><select name="observacoes" multiple></select></div>`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Ignorar Erros</label><select name="ignora_erro" class="form-select form-select-sm ms-auto">`+
						`<option value="0">Não</option>`+
						`<option value="1">Sim</option>`+
						`</select></div>`+
						`</form>`+
						`</div></div></div>`;
				//Submenu de Simulação do Dashboard
				html += `<div class="card mb-4 rounded-3 shadow-sm">`+
						`<div class="card-body p-2">`+
						`<div class="container-fluid d-flex justify-content-end px-0" id="dashboard_ops__simulate">`+
						`<form class="row m-0 flex-fill">`+
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
						`<select class="form-select form-select-sm">`+
						`<option value="">Padrão</option>`+
						`<option value="1">Quantidade Fixa</option>`+
						`<option value="2">Quantidade Máx por R</option>`+
						`</select>`+
						`<input type="text" name="cts" class="form-control form-control-sm" onclick="this.select()" placeholder="Cts" disabled></div></div>`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Custos</label><select name="usa_custo" class="form-select form-select-sm ms-auto">`+
						`<option value="1">Incluir</option>`+
						`<option value="0">Não Incluir</option>`+
						`</select></div>`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Simular Capital</label><input type="text" name="valor_inicial" class="form-control form-control-sm" onclick="this.select()" placeholder="Capital"></div>`+
						`<div class="col-auto"><label class="form-label m-0 text-muted fw-bold">Simular R</label><input type="text" name="R" class="form-control form-control-sm" onclick="this.select()" placeholder="R"></div>`+
						`</form>`+
						`</div></div></div>`;
				//Info Estatistica + (Grafico Horário + Grafico Resultado no Tempo)
				html += `<div class="row">`+
						`<div class="col-4">`+
						`<div class="card mb-2 rounded-3 shadow-sm">`+
						`<div class="card-body">`+
						`<table class="table table-sm table-borderless m-0" id="dashboard_ops__table_stats">`+
						`<thead>${rebuildDashboardOps__Table_Stats('thead')}</thead>`+
						`<tbody>${rebuildDashboardOps__Table_Stats('tbody', dashboard_data.dashboard_ops__table_stats)}</tbody>`+
						`</table></div></div>`+
						`</div>`+
						`<div class="col-8">`+
						`<div class="row"><div class="col">`+
						`<div class="card mb-2 rounded-3 shadow-sm">`+
						`<div class="card-body" id="dashboard_ops__chart_porHorario">`+
						`</div></div>`+
						`</div></div>`+
						`<div class="row"><div class="col">`+
						`<div class="card mb-2 rounded-3 shadow-sm">`+
						`<div class="card-body" id="dashboard_ops__chart_resultTempo">`+
						`</div></div>`+
						`</div></div>`+
						`</div>`+
						`</div>`;
				$(document.getElementById("renda_variavel__section")).empty().append(html).promise().then(function (){
					//Inicia a seção de Filtros
					let filters = $(document.getElementById("dashboard_ops__filter"));
					//Filtro da Data
					let	data_inicial = Global.convertDate(_operacoes_arcabouco[0].data),
						data_final = Global.convertDate(_operacoes_arcabouco[_operacoes_arcabouco.length-1].data);
					filters.find("input[name='data']").daterangepicker({
						"showDropdowns": true,
						"minDate": data_inicial,
						"startDate": data_inicial,
						"endDate": data_final,
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
					//Filtro da Hora
					noUiSlider.create(filters.find("div[name='hora']")[0], {
						connect: true,
						range: {
							'min': new Date('2000-01-01 09:00:00').getTime(),
							'max': new Date('2000-01-01 18:00:00').getTime()
						},
						step: 60 * 60 * 1000,
						start: [new Date('2000-01-01 09:00:00').getTime(), new Date('2000-01-01 18:00:00').getTime()],
						tooltips: {
							to: ((value) => moment(value).format("HH:mm"))
						}
					});
					//Filtro do Ativo
					let select_options_html = _ativos.reduce((p, c) => (p.nome ? `<option value="${p.nome}">${p.nome}</option>` : p) + `<option value="${c.nome}">${c.nome}</option>` );
					filters.find("select[name='ativo']").append(select_options_html).promise().then(function (){
						filters.find("select[name='ativo']").selectpicker({
							title: 'Ativo',
							selectedTextFormat: 'count > 1',
							style: '',
							styleBase: 'form-control form-control-sm'
						}).on("loaded.bs.select", function (){
							filters.find("select[name='ativo']").parent().addClass("form-control");
						});
					});
					//Filtro de Cenario
					select_options_html = Object.values(_cenarios_arcabouco).reduce((p, c) => (p.nome ? `<option value="${p.id}">${p.nome}</option>` : p) + `<option value="${c.id}">${c.nome}</option>` );
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
							let selected_cenarios = $(this).val(),
								premissas_options = ``,
								observacoes_options = ``;
							for (let i in selected_cenarios){
								if (_cenarios_arcabouco[selected_cenarios[i]]["premissas"].length){
									premissas_options += `<optgroup label="${_cenarios_arcabouco[selected_cenarios[i]].nome}">`;
									for (let p in _cenarios_arcabouco[selected_cenarios[i]]["premissas"])
										premissas_options += `<option value="${_cenarios_arcabouco[selected_cenarios[i]]["premissas"][p].ref}" cenario="${_cenarios_arcabouco[selected_cenarios[i]].id}" data-content="<i class='fas fa-square me-2' style='color: ${_cenarios_arcabouco[selected_cenarios[i]]["premissas"][p].cor}'></i>${_cenarios_arcabouco[selected_cenarios[i]]["premissas"][p].nome}">${_cenarios_arcabouco[selected_cenarios[i]]["premissas"][p].nome}</option>`;
									premissas_options += `</optgroup>`;
								}
								if (_cenarios_arcabouco[selected_cenarios[i]]["observacoes"].length){
									observacoes_options += `<optgroup label="${_cenarios_arcabouco[selected_cenarios[i]].nome}">`;
									for (let o in _cenarios_arcabouco[selected_cenarios[i]]["observacoes"])
										observacoes_options += `<option value="${_cenarios_arcabouco[selected_cenarios[i]]["observacoes"][o].ref}" cenario="${_cenarios_arcabouco[selected_cenarios[i]].id}" data-content="<i class='fas fa-square me-2' style='color: ${_cenarios_arcabouco[selected_cenarios[i]]["observacoes"][o].cor}'></i>${_cenarios_arcabouco[selected_cenarios[i]]["observacoes"][o].nome}">${_cenarios_arcabouco[selected_cenarios[i]]["observacoes"][o].nome}</option>`;
									observacoes_options += `</optgroup>`;
								}
							}
							filters.find("select[name='premissas']").empty().append(premissas_options).selectpicker('refresh');
							filters.find("select[name='observacoes']").empty().append(observacoes_options).selectpicker('refresh');
						});
					});
					//Filtro de Premissas
					filters.find("select[name='premissas']").selectpicker({
						title: 'Premissas',
						sanitize: false,
						selectedTextFormat: 'count',
						size: 15,
						actionsBox: true,
						deselectAllText: 'Nenhum',
						selectAllText: 'Todos',
						liveSearch: true,
						liveSearchNormalize: true,
						style: '',
						styleBase: 'form-control form-control-sm'
					}).on("loaded.bs.select", function (){
						filters.find("select[name='premissas']").parent().addClass("form-control");
					});
					//Filtro de Observacoes
					filters.find("select[name='observacoes']").selectpicker({
						title: 'Observações',
						sanitize: false,
						selectedTextFormat: 'count',
						size: 15,
						actionsBox: true,
						deselectAllText: 'Nenhum',
						selectAllText: 'Todos',
						liveSearch: true,
						liveSearchNormalize: true,
						style: '',
						styleBase: 'form-control form-control-sm'
					}).on("loaded.bs.select", function (){
						filters.find("select[name='observacoes']").parent().addClass("form-control");
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
	/*------------------------------ Lista Arcabouços --------------------------------*/
	/*
		Constroi a tabela de ativos. (Dados que recebe do BD)
	*/
	function buildTableArcaboucos(data){
		let arcaboucos = $(document.getElementById("table_arcaboucos")),
			html = ``,
			first = 0;
		//Constroi tabela de informacoes dos ativos
		for (let ar in data){
			html += `<a href="javascript:void(0)" class="list-group-item list-group-item-action py-2 lh-tight" arcabouco="${data[ar].id}">`+
					`<div class="d-flex w-100 justify-content-between mt-1">`+
					`<h5 class="mb-1">${data[ar].nome}</h5>`+
					`<small class="text-muted">${$.fn.dataTable.render.number( '.', '', 0, '').display(data[ar].qtd_ops)} ops.</small>`+
					`</div>`+
					`<div class="col mb-0 mt-4 small d-flex align-items-center">`+
					`${((data[ar].qtd_usuarios > 1 && data[ar].criador)?"<i class='fas fa-user-shield me-3 arcabouco-badge'></i>":"")}${((data[ar].qtd_usuarios > 1)?"<i class='fas fa-share-alt me-3 arcabouco-badge'></i>":"")}`+
					`<button class="btn btn-sm btn-light ms-auto" type="button" editar><i class="fas fa-edit"></i></button>`+
					`<button class="btn btn-sm btn-light ms-2" type="button" remover><i class="fas fa-trash text-danger"></i></button>`+
					`</div>`+
					`</a>`;
		}
		arcaboucos.empty().append(html).promise().then(function (){
			$(document.getElementById("table_arcaboucos")).children().first().trigger("click");
		});
	}
	/*--------------------------------- Lista Ops ------------------------------------*/
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
	/*-------------------------------- Dashboard Ops ---------------------------------*/
	/*
		Retorna o html da lista de operacoes. (Head ou Body)
	*/
	function rebuildDashboardOps__Table_Stats(section = '', stats = {}){
		let html = ``;
		if (section === 'thead')
			html += `<tr></tr>`;
		else if (section === 'tbody'){
			//Dias
			html += `<tr class="align-middle"><td class="fw-bold text-center">Dias</td><td class="text-center"><span name="dias__total" class="fs-6 fw-bold">${stats.dias__total}</span></td><td><span name="dias__trades_por_dia" class="text-muted">${stats.dias__trades_por_dia.toFixed(1)} Trades por Dia<span></td></tr>`;
			//N° Trades
			html += `<tr class="align-middle"><td rowspan="4" class="fw-bold text-center pt-3">Trades</td><td rowspan="4" class="text-center pt-3"><span name="trades__total" class="fs-6 fw-bold">${stats.trades__total}</span></td><td class="pt-3"><span name="trades__positivo" class="text-muted">${stats.trades__positivo} Positivos</span><span name="trades__positivo_perc" class="text-center text-muted ms-2">(${stats.trades__positivo_perc.toFixed(2)}%)</span></td></tr>`+
					`<tr><td><span name="trades__negativo" class="text-muted">${stats.trades__negativo} Negativos</span><span name="trades__negativo_perc" class="text-center text-muted ms-2">(${stats.trades__negativo_perc.toFixed(2)}%)</span></td></tr>`+
					`<tr><td><span name="trades__empate" class="text-muted">${stats.trades__empate} Empatados</span><span name="trades__empate_perc" class="text-center text-muted ms-2">(${stats.trades__empate_perc.toFixed(2)}%)</span></td></tr>`+
					`<tr><td><span name="trades__erro" class="text-muted">${stats.trades__erro} Errados</span><span name="trades__erro_perc" class="text-center text-muted ms-2">(${((stats.trades__erro_perc !== "--") ? stats.trades__erro_perc.toFixed(2) : stats.trades__erro_perc )}%)</span></td></tr>`;
			//Result.
			html += `<tr class="align-middle"><td rowspan="3" class="fw-bold text-center pt-3">Result.</td><td rowspan="3" class="text-center pt-3"><span name="result__lucro_brl" class="fs-6 fw-bold">R$ ${stats.result__lucro_brl.toFixed(2)}</span></td><td class="pt-3"><span name="result__lucro_R" class="text-muted">${stats.result__lucro_R.toFixed(3)}R</span></td></tr>`+
					`<tr><td><span name="result__lucro_pts" class="text-muted">${stats.result__lucro_pts.toFixed(0)} pts</span></td></tr>`+
					`<tr><td><span name="result__lucro_perc" class="text-muted">${stats.result__lucro_perc.toFixed(2)}%</span></td></tr>`;
			//Edge
			html += `<tr class="align-middle"><td rowspan="2" class="fw-bold text-center pt-3">Edge</td><td rowspan="2" class="text-center pt-3"><span name="stats__edge" class="fs-6 fw-bold">${stats.stats__edge.toFixed(2)}%</span></td><td class="pt-3"><span name="stats__breakeven" class="text-muted">${stats.stats__breakeven.toFixed(2)}% Breakeven</span></td></tr>`+
					`<tr><td><span name="stats__fatorLucro" class="text-muted">${stats.stats__fatorLucro.toFixed(2)} Fator de Lucro</span></td></tr>`;
			//SQN
			html += `<tr class="align-middle"><td class="fw-bold text-center pt-3">SQN</td><td class="text-center pt-3"><span name="stats__sqn" class="fs-6 fw-bold">${stats.stats__sqn.toFixed(2)}</span></td><td class="pt-3"><span name="stats__dp" class="text-muted">${stats.stats__dp.toFixed(2)} Desvio Padrão</span></td></tr>`;
			//R.G
			html += `<tr class="align-middle"><td rowspan="3" class="fw-bold text-center pt-3">R.G</td><td rowspan="3" class="text-center pt-3"><span name="stats__rrMedio" class="fs-6 fw-bold">${stats.stats__rrMedio.toFixed(2)}</span></td><td class="pt-3"><span name="result__mediaGain_R" class="text-muted">${stats.result__mediaGain_R.toFixed(3)} Gain (R)</span><span name="result__mediaGain_brl" class="text-muted ms-2">R$ ${stats.result__mediaGain_brl.toFixed(2)}</span><span name="result__mediaGain_perc" class="text-muted ms-2">${stats.result__mediaGain_perc.toFixed(2)}%</span></td></tr>`+
					`<tr><td><span name="result__mediaLoss_R" class="text-muted">${stats.result__mediaLoss_R.toFixed(3)} Loss (R)</span><span name="result__mediaLoss_brl" class="text-muted ms-2">R$ ${stats.result__mediaLoss_brl.toFixed(2)}</span><span name="result__mediaLoss_perc" class="text-muted ms-2">${stats.result__mediaLoss_perc.toFixed(2)}%</span></tr>`+
					`<tr><td><span name="stats__expect" class="text-muted">${stats.stats__expect.toFixed(2)} Expect.</span></td></tr>`;
			//Drawndown
			html += `<tr class="align-middle"><td rowspan="3" class="fw-bold text-center pt-3">Drawndown</td><td rowspan="3" class="text-center pt-3"><span name="stats__drawdown" class="fs-6 fw-bold">R$ ${stats.stats__drawdown}</span></td><td class="pt-3"><span name="stats__drawdown_topoHistorico" class="text-muted">R$ ${stats.stats__drawdown_topoHistorico} Topo Histórico</span></td></tr>`+
					`<tr><td><span name="stats__drawdown_max" class="text-muted">R$ ${stats.stats__drawdown_max} Máx. DD</span></tr>`+
					`<tr><td><span name="stats__ruinaAtual" class="text-muted">R$ ${stats.stats__ruinaAtual} Limite Ruína</span></td></tr>`;
		}
		return html;
	}
	/*------------------------------ Section Cenarios --------------------------------*/
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
	function buildCenariosModal(data){
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
		let id_arcabouco = $("a.arcabouco-selected", document.getElementById("table_arcaboucos")).attr("arcabouco"),
			data = {};
		//Cenarios novos
		if (cenario[0].hasAttribute("new_cenario")){
			data.nome = cenario.find("input[name='cenario_nome']").val();
			if (data.nome === "")
				return {};
			data.id_arcabouco = id_arcabouco;
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
				id_arcabouco: id_arcabouco,
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
	/*--------------------------- Section Operações Add ------------------------------*/
	/*
		Constroi o modal de Cadastro de Operações.
	*/
	function buildOperacoesModal(data){
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
	/*---------------------------- EXECUCAO DAS FUNCOES ------------------------------*/
	/*----------------------------- Section Arcabouço --------------------------------*/
	/*------------------------------ Lista Arcabouços --------------------------------*/
	/*
		Adição de arcabouços na 'tabela' de arcabouços.
	*/
	$(document.getElementById("table_arcaboucos_adicionar")).click(function (){
		Global.insertModal({
			size: "modal-sm",
			title: "Novo Arcabouço",
			build_body: function (modal_body){
				let html = ``;
				html += `<div id="insert_modal_toasts"></div>`+
						`<form class="row g-2 m-0" id="insert_modal_form">`+
						`<div class="col-md-12 text-start"><label class="form-label">Nome</label><input type="text" name="nome" class="form-control form-control-sm" onclick="this.select()"></div>`+
						`</form>`;
				modal_body.append(html);
			},
			send: function (){
				let error = false,
					form = $(document.getElementById("insert_modal_form")),
					data = {};
				form.find("input").each(function (i, input){
					if (input.value !== "")
						data[input.name] = input.value;
					else
						error = true;
				});
				if (error)
					Global.toast.create({location: document.getElementById("insert_modal_toasts"), color: "warning", body: "Preencha todos os campos", delay: 1500});
				else{
					Global.connect({
						data: {module: "renda_variavel", action: "insert_arcaboucos", params: data},
						success: function (result){
							if (result.status){
								$(document.getElementById("insert_modal")).modal("hide");
								Global.connect({
									data: {module: "renda_variavel", action: "get_arcaboucos"},
									success: function (result){
										if (result.status)
											buildTableArcaboucos(result.data);
										else
											Global.toast.create({location: document.getElementById("master_toasts"), title: "Erro", time: "Now", body: result.error, delay: 4000});
									}
								});
							}
							else
								Global.toast.create({location: document.getElementById("insert_modal_toasts"), color: "danger", body: result.error, delay: 4000});
						}
					});		
				}
			}
		}).modal("show");
	});
	/*
		Processa a Seleção / Edição e Remoção de um arcabouço.
	*/
	$(document.getElementById("table_arcaboucos")).on("click", "a[arcabouco]", function (event){
		if (event.target.tagName === "BUTTON" || event.target.tagName === "I"){
			let target = $(event.target),
				action = "";
			if (event.target.tagName === "BUTTON"){
				if (event.target.hasAttribute("editar"))
					action = "editar";
				else if (event.target.hasAttribute("remover"))
					action = "remover";
			}
			else if (event.target.tagName === "I"){
				if (event.target.parentElement.hasAttribute("editar"))
					action = "editar";
				else if (event.target.parentElement.hasAttribute("remover"))
					action = "remover";	
			}
			//Edita o Arcabouço
			if (action === "editar"){
				let me = $(this),
					data = {
						id: me.attr("arcabouco"),
						nome: me.find("h5").text()
					};
				Global.updateModal({
					size: "modal-sm",
					title: "Atualizar Arcabouço",
					build_body: function (modal_body){
						let html = ``;
						html += `<div id="update_modal_toasts"></div>`+
								`<form class="row g-2 m-0" id="update_modal_form" arcabouco="${data.id}">`+
								`<div class="col-md-12 text-start"><label class="form-label">Nome</label><input type="text" name="nome" class="form-control form-control-sm" value="${data.nome}" onclick="this.select()"></div>`+
								`</form>`;
						modal_body.append(html).promise().then(function (){
							let form = modal_body.find("form");
							form.find("input").on("change", function (){
								this.setAttribute("changed", "");
							});
						});
					},
					send: function (){
						let error = false,
							form = $(document.getElementById("update_modal_form")),
							data = {};
						form.find("input[changed]").each(function (i, input){
							if (input.value !== "")
								data[input.name] = input.value;
							else
								error = true;
						});
						if (error)
							Global.toast.create({location: document.getElementById("update_modal_toasts"), color: "warning", body: "Preencha todos os campos", delay: 1500});
						else if (Global.isObjectEmpty(data))
							$(document.getElementById("update_modal")).modal("hide");
						else {
							data.id = form.attr("arcabouco");
							Global.connect({
								data: {module: "renda_variavel", action: "update_arcaboucos", params: data},
								success: function (result){
									if (result.status){
										$(document.getElementById("update_modal")).modal("hide");
										Global.connect({
											data: {module: "renda_variavel", action: "get_arcaboucos"},
											success: function (result){
												if (result.status)
													buildTableArcaboucos(result.data);
												else
													Global.toast.create({location: document.getElementById("master_toasts"), title: "Erro", time: "Now", body: result.error, delay: 4000});
											}
										});
									}
									else
										Global.toast.create({location: document.getElementById("update_modal_toasts"), color: "danger", body: result.error, delay: 4000});
								}
							});		
						}
					}
				}).modal("show");
			}
			//Apagar um arcabouço
			else if (action === "remover")
				Global.removeModal({

				}).modal("show");
		}
		//Seleção do arcabouço
		else{
			let me = this;
			Global.connect({
				data: {module: "renda_variavel", action: "get_arcabouco_data", params: {id_arcabouco: this.getAttribute("arcabouco")}},
				success: function (result){
					if (result.status){
						$(document.getElementById("table_arcaboucos")).find("a.arcabouco-selected").removeClass("arcabouco-selected");
						$(me).addClass("arcabouco-selected");
						updateOperacoes_Arcabouco(result.data["operacoes"]);
						updateCenarios_Arcabouco.create(result.data["cenarios"]);
						updateAtivos(result.data["ativos"]);
						rebuildArcaboucoSection();
					}
					else
						Global.toast.create({location: document.getElementById("master_toasts"), title: "Erro", time: "Now", body: result.error, delay: 4000});
				}
			});
		}
	});
	/*------------------------------ Table Operações ---------------------------------*/
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
			remove_data = {id_arcabouco: $("a.arcabouco-selected", document.getElementById("table_arcaboucos")).attr("arcabouco"), operacoes: []};
		else if (this.name === "remove_sel"){
			remove_data = {id_arcabouco: $("a.arcabouco-selected", document.getElementById("table_arcaboucos")).attr("arcabouco"), operacoes: []};
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
	/*---------------------------- Dashboard Operações -------------------------------*/
	/*
		Processa a aplicacao dos filtros.
	*/
	$(document.getElementById("renda_variavel__section")).find("#dashboard_ops__filter input[name='ativo']");
	/*------------------------------ Section Cenarios --------------------------------*/
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
	/*--------------------------- Section Operações Add ------------------------------*/
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
			insert_data = {id_arcabouco: $("a.arcabouco-selected", document.getElementById("table_arcaboucos")).attr("arcabouco"), operacoes: []},
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
	/*----------------------------------- Menu Top -----------------------------------*/
	/*
		Comanda cliques no menu de renda variavel.
	*/
	$("button", document.getElementById("renda_variavel__menu")).click(function (){
		if (this.name === "cenarios")
			buildCenariosModal();
		else if (this.name === "adicionar_operacoes")
			buildOperacoesModal();
		else if (this.name === "dashboard_ops" || this.name === "lista_ops"){
			_selected_arcabouco_section = this.name;
			rebuildArcaboucoSection();
		}
	});
	/*------------------------------- INIT DO SISTEMA --------------------------------*/
	Global.connect({
		data: {module: "renda_variavel", action: "get_arcaboucos"},
		success: function (result){
			if (result.status)
				buildTableArcaboucos(result.data);
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