let Renda_variavel = (function(){
	/*------------------------------------ VARS --------------------------------------*/
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
			let a_v = parseInt(a.querySelector("input[name='prioridade']").value),
				b_v = parseInt(b.querySelector("input[name='prioridade']").value);
			if (a_v < b_v)
				return -1;
			else if (a_v > b_v)
				return 1;
			else{
				a_v = a.querySelector("input[name='nome']").value;
				b_v = b.querySelector("input[name='nome']").value;
				return a_v.localeCompare(b_v);
			}
		}).forEach(function(ele) {
			tbody.appendChild(ele);
		});
	}
	/*
		Constroi o modal de gerenciamento de cenarios.
	*/
	function buildCenariosModal(data){
		let modal = $(document.getElementById("cenarios_modal"));
		buildListaCenarios(data);
		modal.modal("show");
	}
	function buildListaPremissas_Observacoes(data, type=0){
		let html = ``;
		if (type === 1){
			for (let p in data){
				html += `<tr premissa="${data[p].id}">`+
						`<td name="nome"><div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value="${data[p].nome}"><button class="btn btn-sm btn-danger" type="button" remover_premissa>Excluir</button></div></td>`+
						`<td name="prioridade"><input type="text" name="prioridade" class="form-control form-control-sm" value="${((data[p].prioridade == 9999)?"":data[p].prioridade)}" onclick="this.select()"></td>`+
						`<td name="obrigatoria"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="obrigatoria" class="form-check-input" ${((data[p].obrigatoria == 1)?"checked":"")}></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input" ${((data[p].inativo == 1)?"checked":"")}></div></td>`+
						`</tr>`;
			}
		}
		else if (type === 2){
			for (let p in data){
				html += `<tr observacao="${data[p].id}">`+
						`<td name="nome"><div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value="${data[p].nome}"><button class="btn btn-sm btn-danger" type="button" remover_observacao>Excluir</button></div></td>`+
						`<td name="prioridade"><input type="text" name="prioridade" class="form-control form-control-sm" value="${((data[p].prioridade == 9999)?"":data[p].prioridade)}" onclick="this.select()"></td>`+
						`<td name="cor"><div class="d-flex justify-content-center"><input type="color" name="cor" class="form-control form-control-sm form-control-color" value="${data[p].cor}"></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input" ${((data[p].inativo == 1)?"checked":"")}></div></td>`+
						`</tr>`;
			}
		}
		return html;
	}
	/*
		Constroi a lista de cenarios e (premissas + observacoes).
	*/
	function buildListaCenarios(data){
		let html = ``;
		for (let c in data){
			let div_id = Global._random.str("cenario");
			html += `<div class="accordion-item" cenario="${data[c].id}">`+
					`<h2 class="accordion-header"><div class="accordion-button collapsed accordion-button-with-input" type="button" data-bs-toggle="collapse" data-bs-target="#${div_id}"><div class="input-group"><input type="text" name="cenario_nome" class="form-control form-control-sm" value="${data[c].nome}"><button class="btn btn-sm btn-danger" type="button" remover_cenario>Excluir</button></div></div></h2>`+
					`<div id="${div_id}" class="accordion-collapse collapse" data-bs-parent="#table_cenarios">`+
					`<div class="accordion-body p-0">`+
					`<div class="accordion">`+
					//Lista de Premissas
					`<div class="accordion-item border-top-0 border-start-0 border-end-0">`+
					`<h2 class="accordion-header"><button class="accordion-button ps-5 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${div_id}_premissas">Premissas<span class="badge bg-secondary ms-2" style="margin-top: 2px">${data[c]["premissas"].length}</span></button></h2>`+
					`<div id="${div_id}_premissas" class="accordion-collapse collapse">`+
					`<div class="accordion-body py-1 px-3">`+
					`<button type="button" class="btn btn-sm btn-primary ms-2 mt-2" adicionar_premissa><i class="fas fa-plus me-2"></i>Premissa</button>`+
					`<table class="table table-hover m-0">`+
					`<thead>`+
					`<tr>`+
					`<th class="border-0">Nome</th><th class="border-0">Prioridade</th><th class="border-0 text-center">Obrigatória</th><th class="border-0 text-center">Desativar</th>`+
					`</tr>`+
					`</thead>`+
					`<tbody>${buildListaPremissas_Observacoes(data[c]["premissas"], 1)}</tbody>`+
					`</table>`+
					`</div></div></div>`+
					//Lista de Observações
					`<div class="accordion-item border-top-0 border-start-0 border-end-0">`+
					`<h2 class="accordion-header"><button class="accordion-button ps-5 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${div_id}_observacoes">Observações<span class="badge bg-secondary ms-2" style="margin-top: 2px">${data[c]["observacoes"].length}</span></button></h2>`+
					`<div id="${div_id}_observacoes" class="accordion-collapse collapse">`+
					`<div class="accordion-body py-1 px-3">`+
					`<button type="button" class="btn btn-sm btn-primary ms-2 mt-2" adicionar_observacao><i class="fas fa-plus me-2"></i>Observação</button>`+
					`<table class="table table-hover m-0">`+
					`<thead>`+
					`<tr>`+
					`<th class="border-0">Nome</th><th class="border-0">Ordem</th><th class="border-0 text-center">Cor</th><th class="border-0 text-center">Desativar</th>`+
					`</tr>`+
					`</thead>`+
					`<tbody>${buildListaPremissas_Observacoes(data[c]["observacoes"], 2)}</tbody>`+
					`</table>`+
					`</div></div></div>`+
					`</div></div></div></div>`;
		}
		$(document.getElementById("table_cenarios")).empty().append(html);
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
					Global.toast.create({location: document.getElementById("insert_modal_toasts"), color: "bg-warning", body: "Preencha todos os campos", width: "w-100", delay: 1500});
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
								Global.toast.create({location: document.getElementById("insert_modal_toasts"), color: "bg-danger", body: result.error, width: "w-100", delay: 4000});
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
							Global.toast.create({location: document.getElementById("update_modal_toasts"), color: "bg-warning", body: "Preencha todos os campos", width: "w-100", delay: 1500});
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
										Global.toast.create({location: document.getElementById("update_modal_toasts"), color: "bg-danger", body: result.error, width: "w-100", delay: 4000});
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
		let html = ``,
			div_id = Global._random.str("new_cenario");
		html += `<div class="accordion-item" new_cenario>`+
				`<h2 class="accordion-header"><div class="accordion-button collapsed accordion-button-with-input" data-bs-toggle="collapse" data-bs-target="#${div_id}"><div class="input-group"><input type="text" name="cenario_nome" class="form-control form-control-sm" value=""><button class="btn btn-sm btn-danger" type="button" remover_cenario>Excluir</button></div></div></h2>`+
				`<div id="${div_id}" class="accordion-collapse collapse" data-bs-parent="#table_cenarios">`+
				`<div class="accordion-body p-0">`+
				`<div class="accordion">`+
				//Lista de Premissas
				`<div class="accordion-item border-top-0 border-start-0 border-end-0">`+
				`<h2 class="accordion-header"><button class="accordion-button ps-5 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${div_id}_premissas">Premissas</button></h2>`+
				`<div id="${div_id}_premissas" class="accordion-collapse collapse">`+
				`<div class="accordion-body py-1 px-3">`+
				`<button type="button" class="btn btn-sm btn-primary ms-2 mt-2" adicionar_premissa><i class="fas fa-plus me-2"></i>Premissa</button>`+
				`<table class="table table-hover m-0">`+
				`<thead>`+
				`<tr>`+
				`<th class="border-0">Nome</th><th class="border-0">Prioridade</th><th class="border-0 text-center">Obrigatória</th><th class="border-0 text-center">Desativar</th>`+
				`</tr>`+
				`</thead>`+
				`<tbody></tbody>`+
				`</table>`+
				`</div></div></div>`+
				//Lista de Observações
				`<div class="accordion-item border-top-0 border-start-0 border-end-0">`+
				`<h2 class="accordion-header"><button class="accordion-button ps-5 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${div_id}_observacoes">Observações</button></h2>`+
				`<div id="${div_id}_observacoes" class="accordion-collapse collapse">`+
				`<div class="accordion-body py-1 px-3">`+
				`<button type="button" class="btn btn-sm btn-primary ms-2 mt-2" adicionar_observacao><i class="fas fa-plus me-2"></i>Observação</button>`+
				`<table class="table table-hover m-0">`+
				`<thead>`+
				`<tr>`+
				`<th class="border-0">Nome</th><th class="border-0">Ordem</th><th class="border-0 text-center">Cor</th><th class="border-0 text-center">Desativar</th>`+
				`</tr>`+
				`</thead>`+
				`<tbody></tbody>`+
				`</table>`+
				`</div></div></div>`+
				`</div></div></div></div>`;
		$(document.getElementById("table_cenarios")).prepend(html);
	});
	/*
		Processa a remocao de cenarios e a adicao / remocao de linhas de premissas e observacoes.
	*/
	$(document.getElementById("table_cenarios")).on("click", "button", function (e){
		//Remove um cenario
		if (this.hasAttribute("remover_cenario")){
			let cenario_div = $(this).parentsUntil("#table_cenarios").last();
			//Se é um novo cenario, apenas remove
			if (cenario_div[0].hasAttribute("new_cenario"))
				cenario_div.remove();
			else{
				$(this).prop("disabled", true).removeClass("btn-danger").addClass("btn-secondary");
				cenario_div.attr("remover", "").find(".accordion-button-with-input").addClass("collapsed").removeAttr("data-bs-target").find("input[name='cenario_nome']").prop("disabled", true);
				setTimeout(function (){
					cenario_div.find(".accordion-collapse[data-bs-parent]").collapse("hide");
				}, 500);
			}
		}
		//Apenas insere uma nova premissa
		if (this.hasAttribute("adicionar_premissa")){
			let me = this,
				html = 	`<tr new_premissa>`+
						`<td name="nome"><div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value=""><button class="btn btn-sm btn-danger" type="button" remover_premissa>Excluir</button></div></td>`+
						`<td name="prioridade"><input type="text" name="prioridade" class="form-control form-control-sm" value="" onclick="this.select()"></td>`+
						`<td name="obrigatoria"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="obrigatoria" class="form-check-input"></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input"></div></td>`+
						`</tr>`;
			$(this).parent().find("tbody").prepend(html).promise().then(function (){
				//Adiciona um badge mostrando a quantidade de premissas adicionadas
				let qtd_new = this.find("[new_premissa]").length,
					buttom_premissas = $(me).parentsUntil("div.accordion").last().find("h2.accordion-header button");
				buttom_premissas.find("span.badge[new]").remove();
				buttom_premissas.append(`<span class="badge bg-primary ms-2 px-1" style="margin-top: 2px" new>+${qtd_new}</span>`);
			});
		}
		//Remove uma premissa
		if (this.hasAttribute("remover_premissa")){
			let premissa_row = $(this).parentsUntil("tbody").last();
			//Se é uma nova premissa, apenas remove
			if (premissa_row[0].hasAttribute("new_premissa")){
				let tbody = $(this).parentsUntil("table").last(),
					buttom_premissas = $(this).parentsUntil("div.accordion").last().find("h2.accordion-header button");
				premissa_row.remove().promise().then(function (){
					let qtd_new = tbody.find("[new_premissa]").length;
					//Recontagem do badge mostrando a quantidade de premissas adicionadas
					buttom_premissas.find("span.badge[new]").remove();
					if (qtd_new)
						buttom_premissas.append(`<span class="badge bg-primary ms-2 px-1" style="margin-top: 2px" new>+${qtd_new}</span>`);
				});
			}
			//Se é uma remocao de premissa, marca ela para remocao no BD
			else{
				$(this).prop("disabled", true).removeClass("btn-danger").addClass("btn-secondary");
				premissa_row.attr("remover", "").find("input").prop("disabled", true);
			}
		}
		//Apenas insere uma nova observacao
		if (this.hasAttribute("adicionar_observacao")){
			let me = this,
				html = 	`<tr new_observacao>`+
						`<td name="nome"><div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value=""><button class="btn btn-sm btn-danger" type="button" remover_observacao>Excluir</button></div></td>`+
						`<td name="prioridade"><input type="text" name="prioridade" class="form-control form-control-sm" value="" onclick="this.select()"></td>`+
						`<td name="cor"><div class="d-flex justify-content-center"><input type="color" name="cor" class="form-control form-control-sm form-control-color" value="#ffffff"></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input"></div></td>`+
						`</tr>`;
			$(this).parent().find("tbody").prepend(html).promise().then(function (){
				//Adiciona um badge mostrando a quantidade de observacoes adicionadas
				let qtd_new = this.find("[new_observacao]").length,
					buttom_observacoes = $(me).parentsUntil("div.accordion").last().find("h2.accordion-header button");
				buttom_observacoes.find("span.badge[new]").remove();
				buttom_observacoes.append(`<span class="badge bg-primary ms-2 px-1" style="margin-top: 2px" new>+${qtd_new}</span>`);
			});
		}
		//Remove uma observacao
		if (this.hasAttribute("remover_observacao")){
			let me = this,
				observacao_row = $(this).parentsUntil("tbody").last();
			//Se é uma nova observacao, apenas remove
			if (observacao_row[0].hasAttribute("new_observacao")){
				let tbody = $(this).parentsUntil("table").last(),
					buttom_observacoes = $(this).parentsUntil("div.accordion").last().find("h2.accordion-header button");
				observacao_row.remove().promise().then(function (){
					let qtd_new = tbody.find("[new_observacao]").length;
					//Recontagem do badge mostrando a quantidade de premissas adicionadas
					buttom_observacoes.find("span.badge[new]").remove();
					if (qtd_new)
						buttom_observacoes.append(`<span class="badge bg-primary ms-2 px-1" style="margin-top: 2px" new>+${qtd_new}</span>`);
				});
			}
			//Se é uma remocao de observacao, marca ela para remocao no BD
			else{
				$(this).prop("disabled", true).removeClass("btn-danger").addClass("btn-secondary");
				observacao_row.attr("remover", "").find("input").prop("disabled", true);
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
			input.checked = !input.checked;
	});
	/*
		Marca tudo oque tiver mudança.
	*/
	$(document.getElementById("table_cenarios")).on("change", "input[name]", function (){
		this.setAttribute("changed", "");
		if (this.name !== "cenario_nome")
			reorder_premissas_e_observacoes($(this).parentsUntil("table").last()[0]);
	});
	/*
		Faz a reordenacao visual, com base nos valores de prioridade.
	*/
	$(document.getElementById("table_cenarios")).on("keyup", "input[name='prioridade']", Global.delay(function (){
		reorder_premissas_e_observacoes($(this).parentsUntil("table").last()[0]);
	}, 500));
	/*
		Processa o envio de Adicionar / Alterar / Remover cenarios e (Premissas / Observacoes).
	*/
	$(document.getElementById("cenarios_modal_enviar")).click(function (){
		let id_arcabouco = $("a.arcabouco-selected", document.getElementById("table_arcaboucos")).attr("arcabouco"),
			data = {
				insert: {
					//Cenarios novos
					cenarios: [],
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
					//Cenarios inteiros
					cenarios: [],
					//Premissas de cenarios
					premissas: [],
					//Observações de cenarios
					observacoes: []
				}
			};
		$(document.getElementById("table_cenarios")).children().each(function (i, elem){
			let cenario = $(elem);
			//Cenarios novos
			if (cenario[0].hasAttribute("new_cenario")){
				let info = {};
				info.nome = cenario.find("input[name='cenario_nome']").val();
				info.id_arcabouco = id_arcabouco;
				info.premissas = [];
				cenario.find("tr[new_premissa]").each(function (r, row){
					let nome = row.querySelector("input[name='nome']").value;
					if (nome !== ""){
						info.premissas.push({
							nome: nome,
							prioridade: ((row.querySelector("input[name='prioridade']").value !== "")?row.querySelector("input[name='prioridade']").value:9999),
							obrigatoria: ((row.querySelector("input[name='obrigatoria']").checked)?1:0),
							inativo: ((row.querySelector("input[name='inativo']").checked)?1:0)
						});
					}
				});
				info.observacoes = [];
				cenario.find("tr[new_observacao]").each(function (r, row){
					let nome = row.querySelector("input[name='nome']").value;
					if (nome !== ""){
						info.observacoes.push({
							nome: nome,
							prioridade: ((row.querySelector("input[name='prioridade']").value !== "")?row.querySelector("input[name='prioridade']").value:9999),
							cor: row.querySelector("input[name='cor']").value,
							inativo: ((row.querySelector("input[name='inativo']").checked)?1:0)
						});
					}
				});
				data["insert"]["cenarios"].push(info);
			}
			//Cenario ja existe
			else if (cenario[0].hasAttribute("cenario")){
				//Trata a remocao completa do cenario
				if (cenario[0].hasAttribute("remover"))
					data["remove"]["cenarios"].push({id: cenario.attr("cenario")});
				else{
					//Verifica mudancas no nome do cenario
					let cenario_nome_input = cenario.find("input[name='cenario_nome']");
					if (cenario_nome_input[0].hasAttribute("changed") && cenario_nome_input.val() !== "")
						data["update"]["cenarios"].push({id: cenario.attr("cenario"), nome: cenario_nome_input.val()});
					//Verifica novas premissas
					cenario.find("tr[new_premissa]").each(function (r, row){
						let nome = row.querySelector("input[name='nome']").value;
						if (nome !== ""){
							data["insert"]["premissas"].push({
								id_cenario: cenario.attr("cenario"),
								nome: nome,
								prioridade: ((row.querySelector("input[name='prioridade']").value !== "")?row.querySelector("input[name='prioridade']").value:9999),
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
								if (this.name === "prioridade" && this.value === "")
									info[this.name] = 9999;
								else if (this.getAttribute("type") === "checkbox")
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
								id_cenario: cenario.attr("cenario"),
								nome: nome,
								prioridade: ((row.querySelector("input[name='prioridade']").value !== "")?row.querySelector("input[name='prioridade']").value:9999),
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
								if (this.name === "prioridade" && this.value === "")
									info[this.name] = 9999;
								else if (this.getAttribute("type") === "checkbox")
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
			}
		});
		if (data["insert"]["cenarios"].length || data["insert"]["premissas"].length || data["insert"]["observacoes"].length || data["update"]["cenarios"].length || data["update"]["premissas"].length || data["update"]["observacoes"].length || data["remove"]["cenarios"].length || data["remove"]["premissas"].length || data["remove"]["observacoes"].length){
			Global.connect({
				data: {module: "renda_variavel", action: "control_cenarios", params: data},
				success: function (result){
					if (result.status){
						Global.toast.create({location: document.getElementById("cenarios_modal_toasts"), color: "bg-light", body: "Cenários atualizados.", width: "w-100", delay: 4000});
						Global.connect({
							data: {module: "renda_variavel", action: "get_cenarios", params: {id_arcabouco: id_arcabouco}},
							success: function (result){
								if (result.status)
									buildListaCenarios(result.data);
								else
									Global.toast.create({location: document.getElementById("cenarios_modal_toasts"), color: "bg-danger", body: result.error, width: "w-100", delay: 4000});
							}
						});
					}
					else
						Global.toast.create({location: document.getElementById("cenarios_modal_toasts"), color: "bg-danger", body: result.error, width: "w-100", delay: 4000});
				}
			});
		}
		else
			Global.toast.create({location: document.getElementById("cenarios_modal_toasts"), color: "bg-warning", body: "Nada a fazer.", width: "w-100", delay: 2000});
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