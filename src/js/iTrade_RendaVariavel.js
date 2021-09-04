let Renda_variavel = (function(){
	/*------------------------------------ VARS --------------------------------------*/
	let _cenarios__operacoes_add = {},
		_ativos__operacoes_add = [];
	/*
		Realiza a abertura e leitura do arquivo csv.
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
						let operacao = obj[line][dataMap.indexOf("Op")].toLowerCase();
						newData.push({
							"ativo": obj[line][dataMap.indexOf("Ativo")],
							"op": ((operacao === "c")?1:2),
							"rr": obj[line][dataMap.indexOf("R:R")],
							"vol": (obj[line][dataMap.indexOf("Vol")].replace(/\.+/g, "")).replace(/\,+/g, "."),
							"cts": obj[line][dataMap.indexOf("Cts")],
							"cenario": obj[line][dataMap.indexOf("Padrao")],
							"premissas": ((dataMap.indexOf("Premissas") !== -1)?obj[line][dataMap.indexOf("Premissas")].split(","):[]),
							"observacoes": ((dataMap.indexOf("Observacoes") !== -1)?obj[line][dataMap.indexOf("Observacoes")].split(","):[]),
							"data": obj[line][dataMap.indexOf("Data")],
							"hora": obj[line][dataMap.indexOf("Hora")],
							"entrada": (obj[line][dataMap.indexOf("Entrada")].replace(/\.+/g, "")).replace(/\,+/g, "."),
							"stop": (obj[line][dataMap.indexOf("Stop")].replace(/\.+/g, "")).replace(/\,+/g, "."),
							"alvo": (obj[line][dataMap.indexOf("Alvo")].replace(/\.+/g, "")).replace(/\,+/g, "."),
							"men": (obj[line][dataMap.indexOf("Men")].replace(/\.+/g, "")).replace(/\,+/g, "."),
							"mep": (obj[line][dataMap.indexOf("Mep")].replace(/\.+/g, "")).replace(/\,+/g, "."),
							"saida": (obj[line][dataMap.indexOf("Saida")].replace(/\.+/g, "")).replace(/\,+/g, ".")
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
								"data": obj[line][dataMap.indexOf("Abertura")].split(" ")[0],
								"hora": obj[line][dataMap.indexOf("Abertura")].split(" ")[1],
								"entrada": ((operacao === "C")?preco_compra:preco_venda),
								"stop": "",
								"alvo": "",
								"men": ((operacao === "C")?(preco_compra - Math.abs(men)):(preco_venda + Math.abs(men))),
								"mep": ((operacao === "C")?(preco_compra + Math.abs(men)):(preco_venda - Math.abs(men))),
								"saida": ((operacao === "C")?preco_venda:preco_compra)
								// "duracao": obj[line][dataMap.findIndex(el => el.match(/^Tempo Opera.*/))]
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
		Constroi a tabela de ativos. (Dados que recebe do BD)
	*/
	function buildTableArcaboucos(data){
		let arcaboucos = $(document.getElementById("table_arcaboucos")),
			html = ``,
			first = 0;
		//Constroi tabela de informacoes dos ativos
		for (let ar in data){
			html += `<a href="javascript:void(0)" class="list-group-item list-group-item-action py-3 lh-tight" arcabouco="${data[ar].id}">`+
					`<div class="d-flex w-100 justify-content-between">`+
					`<h5 class="mb-1">${data[ar].nome}</h5>`+
					`<small>100 ops.</small>`+
					`</div>`+
					`<div class="col mb-0 mt-3 small d-flex align-items-center">`+
					`${((data[ar].qtd_usuarios > 1 && data[ar].criador)?"<i class='fas fa-user-shield me-3'></i>":"")}${((data[ar].qtd_usuarios > 1)?"<i class='fas fa-share-alt me-3'></i>":"")}`+
					`<button class="btn btn-sm btn-light ms-auto" type="button" editar><i class="fas fa-edit"></i></button>`+
					`<button class="btn btn-sm btn-light ms-2" type="button" remover><i class="fas fa-trash text-danger"></i></button>`+
					`</div>`+
					`</a>`;
		}
		arcaboucos.empty().append(html).promise().then(function (){
			$(document.getElementById("table_arcaboucos")).children().first().trigger("click");
		});
	}
	/*------------------------------ Section Cenarios --------------------------------*/
	/*
		Faz a reordenacao das linhas da tabela com base nas prioridades.
	*/
	function reorder_premissas_e_observacoes(tbody){
		[].slice.call(tbody.children).sort(function(a, b) {
			let a_v = a.querySelector("input[name='nome']").value,
				b_v = b.querySelector("input[name='nome']").value;
			return a_v.localeCompare(b_v);
		}).forEach(function(ele) {
			tbody.appendChild(ele);
		});
	}
	/*
		Constroi o modal de gerenciamento de cenarios.
	*/
	function buildCenariosModal(data){
		let modal = $(document.getElementById("cenarios_modal"));
		$(document.getElementById("table_cenarios")).empty().append(buildCenariosTable(data));
		$(document.getElementById("cenarios_modal_copiar")).empty().append(buildCenariosCopySelect(data));
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
						`<td name="cor"><div class="d-flex justify-content-center"><input type="color" name="cor" class="form-control form-control-sm form-control-color" value="${data[p].cor}"></div></td>`+
						`<td name="obrigatoria"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="obrigatoria" class="form-check-input" ${((data[p].obrigatoria == 1)?"checked":"")}></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input" ${((data[p].inativo == 1)?"checked":"")}></div></td>`+
						`</tr>`;
			}
			if (html === '')
				html += `<tr empty><td colspan="4" class="text-muted text-center fw-bold p-4">Nenhuma Premissa</td></tr>`;
		}
		else if (type === 2){
			for (let p in data){
				html += `<tr ${((new_data)?`new_observacao`:`observacao="${data[p].id}"`)}>`+
						`<td name="nome"><div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value="${data[p].nome}"><button class="btn btn-sm btn-outline-danger" type="button" remover_observacao>Excluir</button></div></td>`+
						`<td name="cor"><div class="d-flex justify-content-center"><input type="color" name="cor" class="form-control form-control-sm form-control-color" value="${data[p].cor}"></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input" ${((data[p].inativo == 1)?"checked":"")}></div></td>`+
						`</tr>`;
			}
			if (html === '')
				html += `<tr empty><td colspan="4" class="text-muted text-center fw-bold p-4">Nenhuma Observação</td></tr>`;
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
				`<th class="border-0">Nome</th><th class="border-0 text-center">Cor</th><th class="border-0 text-center">Obrigatória</th><th class="border-0 text-center">Desativar</th>`+
				`</tr>`+
				`<tbody>${(("premissas" in data)?buildListaPremissas_Observacoes(data["premissas"], 1, new_cenario):buildListaPremissas_Observacoes({}, 1, new_cenario))}</tbody>`+
				`</table>`+
				`</div>`+
				`<div class="d-flex d-none" target="observacoes">`+
				`<table class="table m-0 me-3">`+
				`<thead>`+
				`<tr>`+
				`<th class="border-0">Nome</th><th class="border-0 text-center">Cor</th><th class="border-0 text-center">Desativar</th>`+
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
				let nome = row.querySelector("input[name='nome']").value;
				if (nome !== ""){
					data.premissas.push({
						nome: nome,
						cor: row.querySelector("input[name='cor']").value,
						obrigatoria: ((row.querySelector("input[name='obrigatoria']").checked)?1:0),
						inativo: ((row.querySelector("input[name='inativo']").checked)?1:0)
					});
				}
			});
			data.observacoes = [];
			cenario.find("tr[new_observacao]").each(function (r, row){
				let nome = row.querySelector("input[name='nome']").value;
				if (nome !== ""){
					data.observacoes.push({
						nome: nome,
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
				let nome = row.querySelector("input[name='nome']").value;
				if (nome !== ""){
					data["insert"]["premissas"].push({
						nome: nome,
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
				let nome = row.querySelector("input[name='nome']").value;
				if (nome !== ""){
					data["insert"]["observacoes"].push({
						nome: nome,
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
		Salva localmente os cenarios e ativos, para uso na parte de adição de operações. (recarrega toda vez que o modal for aberto)
	*/
	function updateOffData_forOperacoesAdd(data){
		_ativos__operacoes_add = [];
		_cenarios__operacoes_add = {};
		if ("ativos" in data){
			for (let at in data["ativos"])
				_ativos__operacoes_add.push(data["ativos"][at]);
		}
		if ("cenarios" in data){
			for (let cn in data["cenarios"])
				_cenarios__operacoes_add[data["cenarios"][cn].id] = data["cenarios"][cn];
		}
	}
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
		table.find("tbody").empty().append(`<tr class="text-center text-muted fw-bold fs-6"><td class="border-0">Nada para Mostrar</td></tr>`);
	}
	/*
		Constroi o html do select de ativos em 'table_operacoes_add'.
	*/
	function buildAtivosSelect_OperacaoAddTable(){
		let html = ``;
		for (let at in _ativos__operacoes_add)
			html += `<option value="${_ativos__operacoes_add[at].id}">${_ativos__operacoes_add[at].nome}</option>`;
		return html;
	}
	/*
		Constroi o html do select de cenarios em 'table_operacoes_add'.
	*/
	function buildCenariosSelect_OperacaoAddTable(){
		let html = ``;
		for (let cn in _cenarios__operacoes_add)
			html += `<option value="${_cenarios__operacoes_add[cn].id}">${_cenarios__operacoes_add[cn].nome}</option>`;
		return html;
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
			if ("cenario" in data[t])
				tr.find("select[name='cenario']").val("").find("option").filter((i, el) => data[t].cenario === el.innerHTML).prop("selected", true);
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
						  `<th>#</th>`+
						  `<th>Ativo</th>`+
						  `<th>Op.</th>`+
						  `<th>R:R</th>`+
						  `<th>Vol</th>`+
						  `<th>Cts</th>`+
						  `<th>Cenário</th>`+
						  `<th>Premissas</th>`+
						  `<th>Observações</th>`+
						  `<th>Data</th>`+
						  `<th>Hora</th>`+
						  `<th>Entrada</th>`+
						  `<th>Stop</th>`+
						  `<th>Alvo</th>`+
						  `<th>MEN</th>`+
						  `<th>MEP</th>`+
						  `<th>Saída</th>`+
						  `</tr>`;
		}
		//Constroi o TBODY
		for (let i=0; i<data.length; i++){
			//Layout de Scalp
			if (table_layout === "scalp"){
				tbody_html += `<tr>`+
						`<td name="sequencia"><input type="text" name="sequencia" class="form-control form-control-sm" value="${i+1}" readonly></td>`+
						`<td name="ativo"><select class="form-select form-select-sm" name="ativo">${select_ativos_html}</select></td>`+
						`<td name="op"><select name='op' class="form-select form-select-sm"><option value="1">Compra</option><option value="2">Venda</option></select></td>`+
						`<td name="rr"><select name='rr' class="form-select form-select-sm"><option value="">Sem</option><optgroup label="R:R Negativo"><option value="2:1">2:1</option><option value="3:1">3:1</option></optgroup></select></td>`+
						`<td name="vol"><input type="text" name="vol" class="form-control form-control-sm" onclick="this.select()" value="${data[i].vol}"></td>`+
						`<td name="cts"><input type="text" name="cts" class="form-control form-control-sm" onclick="this.select()" value="${data[i].cts}"></td>`+
						`<td name="cenario"><select class="form-select form-select-sm" name="cenario">${select_cenarios_html}</select></td>`+
						`<td name="premissas"><select class="form-select form-select-sm" name="premissas" multiple></select></td>`+
						`<td name="observacoes"><select class="form-select form-select-sm" name="observacoes" multiple></select></td>`+
						`<td name="data"><input type="text" name="data" class="form-control form-control-sm" onclick="this.select()" value="${data[i].data}"></td>`+
						`<td name="hora"><input type="text" name="hora" class="form-control form-control-sm" onclick="this.select()" value="${data[i].hora}"></td>`+
						`<td name="entrada"><input type="text" name="entrada" class="form-control form-control-sm" onclick="this.select()" value="${data[i].entrada}"></td>`+
						`<td name="stop"><input type="text" name="stop" class="form-control form-control-sm" value="${data[i].stop}"></td>`+
						`<td name="alvo"><input type="text" name="alvo" class="form-control form-control-sm" value="${data[i].alvo}"></td>`+
						`<td name="men"><input type="text" name="men" class="form-control form-control-sm" onclick="this.select()" value="${data[i].men}"></td>`+
						`<td name="mep"><input type="text" name="mep" class="form-control form-control-sm" onclick="this.select()" value="${data[i].mep}"></td>`+
						`<td name="saida"><input type="text" name="saida" class="form-control form-control-sm" onclick="this.select()" value="${data[i].saida}"></td>`+
						`</tr>`;
			}
		}
		table.find("thead").empty().append(thead_html);
		table.find("tbody").empty().append(tbody_html).promise().then(function (){
			setSelectValues_OperacaoAddTable(data);
		});
	}
	/*---------------------------- EXECUCAO DAS FUNCOES ------------------------------*/
	/*----------------------------- Section Arcabouço --------------------------------*/
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
			else if (action === "remover")
				Global.removeModal({

				}).modal("show");
		}
		else{
			$(document.getElementById("table_arcaboucos")).find("a.arcabouco-selected").removeClass("arcabouco-selected");
			$(this).addClass("arcabouco-selected");
		}
	});
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
	$(document.getElementById("table_cenarios")).on("dblclick", "button", function (e){
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
		if (this.name !== "cenario_nome")
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
				if (csvData.length){
					Global.toast.create({location: document.getElementById("operacoes_modal_toasts"), color: "success", body: "Arquivo interpretado com sucesso.", delay: 4000});
					buildOperacaoAddTable(csvData);
				}
				else
					Global.toast.create({location: document.getElementById("operacoes_modal_toasts"), color: "danger", body: "Falha ao ler o arquivo. (Número de colunas muda em certas linhas)", delay: 4000});
			}
			else
				Global.toast.create({location: document.getElementById("operacoes_modal_toasts"), color: "danger", body: "Falha ao ler o arquivo. (Arquivo Vazio)", delay: 4000});
			file_import.value = "";
		};
		_csv_reader.reader.readAsText(this.files[0], "ISO-8859-2");
	});
	/*----------------------------------- Menu Top -----------------------------------*/
	/*
		Comanda cliques no menu de renda variavel.
	*/
	$("button", document.getElementById("renda_variavel__menu")).click(function (){
		if (this.name === "cenarios"){
			Global.connect({
				data: {module: "renda_variavel", action: "get_cenarios", params: {id_arcabouco: $("a.arcabouco-selected", document.getElementById("table_arcaboucos")).attr("arcabouco")}},
				success: function (result){
					if (result.status)
						buildCenariosModal(result.data);
					else
						Global.toast.create({location: document.getElementById("master_toasts"), title: "Erro", time: "Now", body: result.error, delay: 4000});
				}
			});
		}
		else if (this.name === "adicionar_operacoes"){
			Global.connect({
				data: {module: "renda_variavel", action: "get_operacoesAdd", params: {id_arcabouco: $("a.arcabouco-selected", document.getElementById("table_arcaboucos")).attr("arcabouco")}},
				success: function (result){
					if (result.status){
						updateOffData_forOperacoesAdd(result.data);
						buildOperacoesModal();
					}
					else
						Global.toast.create({location: document.getElementById("master_toasts"), title: "Erro", time: "Now", body: result.error, delay: 4000});
				}
			});
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
	return {}
})();