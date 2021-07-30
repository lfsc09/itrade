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
		Constroi o modal de gerenciamento de cenarios.
	*/
	function buildCenariosModal(data){
		let modal = $(document.getElementById("cenarios_modal"));
		modal.modal("show");
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
		Processa o envio de Adicionar / Alterar cenarios e (Premissas / Observacoes).
	*/
	$(document.getElementById("cenarios_modal_enviar")).click(function (){
		let form = $("div.modal-body", document.getElementById("cenarios_modal")).find("div.row[target]:visible form"),
			data = {};
		if (form.length){
			let cenario = form.find("input[name='cenario_nome']").val();
			if (cenario === ""){
				Global.toast.create({location: document.getElementById("cenarios_modal_toasts"), color: "bg-warning", body: "Informe um nome.", width: "w-100", delay: 2000});
				return;
			}
			data.arcabouco = $("a.arcabouco-selected", document.getElementById("table_arcaboucos")).attr("arcabouco");
			data.cenario = {nome: cenario};
			//Le as premissas
			data.premissas = [];
			form.find("table[name='premissas'] tbody tr").each(function (i, elem){
				let nome = elem.querySelector("input[name='nome']").value,
					obrigatoria = elem.querySelector("input[name='obrigatoria']").checked,
					prioridade = elem.querySelector("input[name='prioridade']").value;
				if (nome !== "")
					data.premissas.push({nome: nome, obrigatoria: ((obrigatoria)?1:0), prioridade: ((prioridade === "")?9999:prioridade)});
				else
					$(elem).remove();
			});
			//Le as observacoes
			data.observacoes = [];
			form.find("table[name='observacoes'] tbody tr").each(function (i, elem){
				let nome = elem.querySelector("input[name='nome']").value,
					importante = elem.querySelector("input[name='importante']").checked,
					prioridade = elem.querySelector("input[name='prioridade']").value;
				if (nome !== "")
					data.observacoes.push({nome: nome, importante: ((importante)?1:0), prioridade: ((prioridade === "")?9999:prioridade)});
				else
					$(elem).remove();
			});
			Global.connect({
				data: {module: "renda_variavel", action: "insert_cenarios", params: data},
				success: function (result){
					if (result.status){
						resetAdicionarCenarios();
						Global.toast.create({location: document.getElementById("cenarios_modal_toasts"), color: "bg-success", body: "Cenário adicionado.", width: "w-100", delay: 2000});
					}
					else
						Global.toast.create({location: document.getElementById("cenarios_modal_toasts"), color: "bg-danger", body: result.error, width: "w-100", delay: 4000});
				}
			});
			console.log(data);
		}
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