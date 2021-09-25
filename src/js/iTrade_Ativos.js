let Ativos = (function(){
	/*------------------------------------ VARS --------------------------------------*/
	let _observerConfig = {
		attributes: true, 
		childList: true, 
		characterData: true
	}
	/*----------------------------------- FUNCOES ------------------------------------*/
	/*------------------------------- Section Ativos ---------------------------------*/
	/*
		Constroi a tabela de vencimentos do WIN.
	*/
	function buildTableWinSeries(ano){
		let tbody_win_series = $("tbody", document.getElementById("table_win_series")),
			html = ``,
			getQuartas15 = function (ano, mes){
				let d = new Date(ano, mes, 1),
					wednesdays = [],
					choosen_wed = null;
				// Get the first Wednesday in the month
				while (d.getDay() !== 3)
					d.setDate(d.getDate()+1);
				// Get all the other Wednesdays in the month
				while (d.getMonth() === mes){
					let day = (new Date(d.getTime())).getDate();
					wednesdays.push({
						'day': day,
						'diff': Math.abs(day-15)
					});
					d.setDate(d.getDate() + 7);
				}
				for (let q in wednesdays){
					if (choosen_wed === null)
						choosen_wed = wednesdays[q];
					else if (wednesdays[q].diff < choosen_wed.diff)
						choosen_wed = wednesdays[q];
				}
				return choosen_wed.day;
			},
			today = new Date(),
			first_day = null,
			last_day = null,
			data = '',
			serie_class = '';
		//Dez - Fev
		first_day = getQuartas15(ano-1, 11);
		last_day = getQuartas15(ano, 1)-1;
		data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano-1, 11, 1))} <span class="daylish">${first_day}</span><span class="mx-2">-</span>${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 1, 1))} <span class="daylish">${last_day}</span>`;
		if (today.getFullYear() == ano){
			serie_class = "";
			//Para segunda parte de Dezembro
			if (today.getMonth() == 11 && today.getDate() >= getQuartas15(ano, 11))
				serie_class = " class='table-success'";
			//Para Janeiro
			else if (today.getMonth() == 0)
				serie_class = " class='table-success'";
			//Para primeira parte de Fevereiro
			else if (today.getMonth() == 1 && today.getDate() <= last_day)
				serie_class = " class='table-success'";
		}
		html += `<tr><td name='data'>${data}</td><td name='serie'${serie_class}>G</td></tr>`;
		//Fev - Abr
		first_day = getQuartas15(ano, 1);
		last_day = getQuartas15(ano, 3)-1;
		data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 1, 1))} <span class="daylish">${first_day}</span><span class="mx-2">-</span>${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 3, 1))} <span class="daylish">${last_day}</span>`;
		if (today.getFullYear() == ano){
			serie_class = "";
			//Para segunda parte de Fevereiro
			if (today.getMonth() == 1 && today.getDate() >= first_day)
				serie_class = " class='table-success'";
			//Para Março
			else if (today.getMonth() == 2)
				serie_class = " class='table-success'";
			//Para primeira parte de Abril
			else if (today.getMonth() == 3 && today.getDate() <= last_day)
				serie_class = " class='table-success'";
		}
		html += `<tr><td name='data'>${data}</td><td name='serie'${serie_class}>J</td></tr>`;
		//Abr - Jun
		first_day = getQuartas15(ano, 3);
		last_day = getQuartas15(ano, 5)-1;
		data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 3, 1))} <span class="daylish">${first_day}</span><span class="mx-2">-</span>${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 5, 1))} <span class="daylish">${last_day}</span>`;
		if (today.getFullYear() == ano){
			serie_class = "";
			//Para segunda parte de Abril
			if (today.getMonth() == 3 && today.getDate() >= first_day)
				serie_class = " class='table-success'";
			//Para Maio
			else if (today.getMonth() == 4)
				serie_class = " class='table-success'";
			//Para primeira parte de Junho
			else if (today.getMonth() == 5 && today.getDate() <= last_day)
				serie_class = " class='table-success'";
		}
		html += `<tr><td name='data'>${data}</td><td name='serie'${serie_class}>M</td></tr>`;
		//Jun - Ago
		first_day = getQuartas15(ano, 5);
		last_day = getQuartas15(ano, 7)-1;
		data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 5, 1))} <span class="daylish">${first_day}</span><span class="mx-2">-</span>${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 7, 1))} <span class="daylish">${last_day}</span>`;
		if (today.getFullYear() == ano){
			serie_class = "";
			//Para segunda parte de Junho
			if (today.getMonth() == 5 && today.getDate() >= first_day)
				serie_class = " class='table-success'";
			//Para Julho
			else if (today.getMonth() == 6)
				serie_class = " class='table-success'";
			//Para primeira parte de Agosto
			else if (today.getMonth() == 7 && today.getDate() <= last_day)
				serie_class = " class='table-success'";
		}
		html += `<tr><td name='data'>${data}</td><td name='serie'${serie_class}>Q</td></tr>`;
		//Ago - Out
		first_day = getQuartas15(ano, 7);
		last_day = getQuartas15(ano, 9)-1;
		data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 7, 1))} <span class="daylish">${first_day}</span><span class="mx-2">-</span>${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 9, 1))} <span class="daylish">${last_day}</span>`;
		if (today.getFullYear() == ano){
			serie_class = "";
			//Para segunda parte de Agosto
			if (today.getMonth() == 7 && today.getDate() >= first_day)
				serie_class = " class='table-success'";
			//Para Stembro
			else if (today.getMonth() == 8)
				serie_class = " class='table-success'";
			//Para primeira parte de Outubro
			else if (today.getMonth() == 9 && today.getDate() <= last_day)
				serie_class = " class='table-success'";
		}
		html += `<tr><td name='data'>${data}</td><td name='serie'${serie_class}>V</td></tr>`;
		//Out - Dez
		first_day = getQuartas15(ano, 9);
		last_day = getQuartas15(ano, 11)-1;
		data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 9, 1))} <span class="daylish">${first_day}</span><span class="mx-2">-</span>${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 11, 1))} <span class="daylish">${last_day}</span>`;
		if (today.getFullYear() == ano){
			serie_class = "";
			//Para segunda parte de Outubro
			if (today.getMonth() == 9 && today.getDate() >= first_day)
				serie_class = " class='table-success'";
			//Para Novembro
			else if (today.getMonth() == 10)
				serie_class = " class='table-success'";
			//Para primeira parte de Dezembro
			else if (today.getMonth() == 11 && today.getDate() <= last_day)
				serie_class = " class='table-success'";
		}
		html += `<tr><td name='data'>${data}</td><td name='serie'${serie_class}>Z</td></tr>`;
		tbody_win_series.empty().append(html);
	}
	/*
		Constroi a tabela de vencimentos do WDO.
	*/
	function buildTableWdoSeries(ano){
		let tbody_wdo_series = $("tbody", document.getElementById("table_wdo_series")),
			html = ``,
			series = ['G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z', 'F'],
			today = new Date();
		for (let m=0; m<12; m++){
			let first_day = (new Date(ano, m, 1)).getDate(),
				last_day = new Date(ano, m+1, 0).getDate(),
				data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, m, 1))} <span class="daylish">${first_day}</span> - <span class="daylish">${last_day}</span></span>`,
				serie_class = '';
			if (today.getFullYear() == ano && today.getMonth() == m)
				serie_class = " class='table-success'";
			html += `<tr><td name='data'>${data}</td><td name='serie'${serie_class}>${series[m]}</td></tr>`;
		}
		tbody_wdo_series.empty().append(html);
	}
	/*
		Constroi a tabela de ativos. (Dados que recebe do BD)
	*/
	function buildTableAtivos(data){
		let tbody_ativos = $("tbody", document.getElementById("table_ativos")),
			html = ``;
		//Constroi tabela de informacoes dos ativos
		for (let at in data){
			html += `<tr ativo='${data[at].id}'>`+
					`<td name='nome'>${data[at].nome}</td>`+
					`<td name='custo'>${data[at].custo}</td>`+
					`<td name='valor_tick'>${data[at].valor_tick}</td>`+
					`<td name='pts_tick'>${data[at].pts_tick}</td>`+
					`<td name='action'><button type='button' class='btn btn-sm btn-light' editar><i class='fas fa-edit'></i></button><button type='button' class='btn btn-sm btn-light ms-2' remover><i class='fas fa-trash-alt'></i></button></td>`+
					`</tr>`;
		}
		tbody_ativos.empty().append(html);
	}
	/*
		Constroi a sessao de ativos. (Basicamente apenas as tabelas de vencimento de WIN e WDO)
	*/
	function buildSectionAtivos(){
		let year = (new Date()).getFullYear();
		//Constroi a tabela de serie de contratos do WIN
		buildTableWinSeries(year);
		$("input[name='ano']", document.getElementById("table_win_series")).val(year);
		//Constroi a tabela de serie de contratos do WDO
		buildTableWdoSeries(year);
		$("input[name='ano']", document.getElementById("table_wdo_series")).val(year);
	}
	/*---------------------------- EXECUCAO DAS FUNCOES ------------------------------*/
	/*------------------------------- Section Ativos ---------------------------------*/
	/*
		Alterar ano dos contratos de vencimento do WIN e WDO.
	*/
	$("input[name='ano']", document.getElementById("table_wdo_series")).click(function (){
		this.focus();
		this.select();
	});
	$("input[name='ano']", document.getElementById("table_wdo_series")).keyup(function (){
		if (/^[0-9]+$/.test(this.value) && this.value.length === 4){
			buildTableWdoSeries(this.value);
			this.focus();
			this.select();
		}
	});
	$("input[name='ano']", document.getElementById("table_win_series")).click(function (){
		this.focus();
		this.select();
	});
	$("input[name='ano']", document.getElementById("table_win_series")).keyup(function (){
		if (/^[0-9]+$/.test(this.value) && this.value.length === 4){
			buildTableWinSeries(this.value);
			this.focus();
			this.select();
		}
	});
	/*
		Adição de ativos na tabela de ativos.
	*/
	$(document.getElementById("table_ativos_adicionar")).click(function (){
		Global.updateModal({
			size: "modal-sm",
			title: "Adicionar Ativo",
			build_body: function (modal_body){
				let html = ``;
				html += `<div id="insert_modal_toasts"></div>`+
						`<form class="m-0" id="insert_modal_form">`+
						`<div class="text-start"><label class="form-label fw-bold mb-1">Nome</label><input type="text" name="nome" class="form-control form-control-sm" onclick="this.select()"></div>`+
						`<div class="mt-3 text-start"><label class="form-label fw-bold mb-1">Custo (Abert. + Fech.)</label><input type="text" name="custo" class="form-control form-control-sm" onclick="this.select()"></div>`+
						`<div class="mt-3 text-start"><label class="form-label fw-bold mb-1">Valor por Tick</label><input type="text" name="valor_tick" class="form-control form-control-sm" onclick="this.select()"></div>`+
						`<div class="mt-3 text-start"><label class="form-label fw-bold mb-1">Pts por Tick</label><input type="text" name="pts_tick" class="form-control form-control-sm" onclick="this.select()"></div>`+
						`</form>`;
				modal_body.append(html).promise().then(function (){
					let form = modal_body.find("form");
					form.find("input[name='nome']").inputmask({mask: "*{*}", definitions: {'*': {casing: 'upper'}}, placeholder: ""});
					form.find("input[name='custo']").inputmask({alias: "numeric", digitsOptional: false, digits: 2, rightAlign: false, placeholder: "0"});
					form.find("input[name='valor_tick']").inputmask({alias: "numeric", digitsOptional: false, digits: 2, rightAlign: false, placeholder: "0"});
					form.find("input[name='pts_tick']").inputmask({alias: "numeric", digitsOptional: false, digits: 2, rightAlign: false, placeholder: "0"});
				});
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
						data: {module: "ativos", action: "insert_ativos", params: data},
						success: function (result){
							if (result.status){
								$(document.getElementById("insert_modal")).modal("hide");
								buildTableAtivos(result.data);
								if (typeof Renda_variavel !== 'undefined')
									Renda_variavel.updateAtivos(result.data);
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
		Atualização / Remoção de ativos na tabela de ativos.
	*/
	$(document.getElementById("table_ativos")).on("click", "td[name='action'] button", function (){
		if (this.hasAttribute("editar")){
			if ($(document.getElementById("table_ativos")).find("button[popup-editar]").length === 0){
				let row = $(this).parent().parent(),
					data = {
						id: row.attr("ativo"),
						nome: row.find("td[name='nome']").text(),
						custo: row.find("td[name='custo']").text(),
						valor_tick: row.find("td[name='valor_tick']").text(),
						pts_tick: row.find("td[name='pts_tick']").text()
					};
				this.setAttribute("popup-editar", "");
				$(document.getElementById("table_ativos")).find("button[popup-editar]").popover({
					html: true,
					sanitize: false,
					trigger: 'manual',
					placement: 'left',
					template: `<div class="popover" role="tooltip" style="max-width: 100%"><div class="popover-arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>`,
					content: function (){
						let html = ``;
						html += `<div class="container-fluid p-0">`+
								`<div id="update_popup_toasts"></div>`+
								`<form class="m-0" id="update_popup_form" ativo="${data.id}">`+
								`<div class="mb-2 d-flex align-items-center"><div class="flex-fill text-end fw-bold">Nome: </div><div class="ms-2"><input type="text" name="nome" class="form-control form-control-sm text-end" value="${data.nome}" onclick="this.select()"></div></div>`+
								`<div class="mb-2 d-flex align-items-center"><div class="flex-fill text-end fw-bold">Cutos: </div><div class="ms-2"><input type="text" name="custo" class="form-control form-control-sm" value="${data.custo}" onclick="this.select()"></div></div>`+
								`<div class="mb-2 d-flex align-items-center"><div class="flex-fill text-end fw-bold">Valor por Tick: </div><div class="ms-2"><input type="text" name="valor_tick" class="form-control form-control-sm" value="${data.valor_tick}" onclick="this.select()"></div></div>`+
								`<div class="mb-2 d-flex align-items-center"><div class="flex-fill text-end fw-bold">Pontos por Tick: </div><div class="ms-2"><input type="text" name="pts_tick" class="form-control form-control-sm" value="${data.pts_tick}" onclick="this.select()"></div></div>`+
								`</form>`+
								`<div class="row mt-4"><div class="col"><button type="button" class="w-100 btn btn-sm btn-success" popup-enviar>Alterar</button></div></div>`+
								`</div>`;
						return html;
					}
				}).popover("show").on("shown.bs.popover", function (){
					let form = $(document.getElementById("update_popup_form"));
					form.find("input[name='nome']").inputmask({mask: "*{*}", definitions: {'*': {casing: 'upper'}}, placeholder: ""});
					form.find("input[name='custo']").inputmask({alias: "numeric", digitsOptional: false, digits: 2, placeholder: "0"});
					form.find("input[name='valor_tick']").inputmask({alias: "numeric", digitsOptional: false, digits: 2, placeholder: "0"});
					form.find("input[name='pts_tick']").inputmask({alias: "numeric", digitsOptional: false, digits: 2, placeholder: "0"});
					form.find("input").on("change", function (){
						this.setAttribute("changed", "");
					});
				});
			}
		}
		else if (this.hasAttribute("remover")){
			Global.removeModal({

			}).modal("show");
		}
	});
	/*
		Atualização de ativos da tabela de ativos.
	*/
	$("body").on("click", "button[popup-enviar]", function (){
		let error = false,
		form = $(document.getElementById("update_popup_form")),
		data = {};
		form.find("input[changed]").each(function (i, input){
			if (input.value !== "")
				data[input.name] = input.value;
			else
				error = true;
		});
		if (error)
			Global.toast.create({location: document.getElementById("update_popup_toasts"), color: "warning", body: "Preencha todos os campos", delay: 1500});
		else if (Global.isObjectEmpty(data))
			$(document.getElementById("table_ativos")).find("button[popup-editar]").removeAttr("popup-editar").popover("dispose");
		else{
			data.id = form.attr("ativo");
			Global.connect({
				data: {module: "ativos", action: "update_ativos", params: data},
				success: function (result){
					if (result.status){
						$(document.getElementById("table_ativos")).find("button[popup-editar]").popover("dispose");
						buildTableAtivos(result.data);
						if (typeof Renda_variavel !== 'undefined')
							Renda_variavel.updateAtivos(result.data);
					}
					else
						Global.toast.create({location: document.getElementById("update_popup_toasts"), color: "danger", body: result.error, delay: 4000});
				}
			});		
		}
	});
	/*
		Trada o fechamento do Popup de update de ativos.
	*/
	$("body").on("click", function (e){
		$("button[popup-editar]").each(function () {
			if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0)
				$(this).removeAttr("popup-editar").popover("dispose");
		});
	});
	/*------------------------------- INIT DO SISTEMA --------------------------------*/
	buildSectionAtivos();
	Global.connect({
		data: {module: "ativos", action: "get_ativos"},
		success: function (result){
			if (result.status)
				buildTableAtivos(result.data);
			else
				Global.toast.create({location: document.getElementById("master_toasts"), title: "Erro", time: "Now", body: result.error, delay: 4000});

		}
	});
	/*--------------------------------------------------------------------------------*/
	return {}
})();