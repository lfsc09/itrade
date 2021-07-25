let iTrade = (function(){
	/*------------------------------------ VARS --------------------------------------*/
	const __ativos = [
		{id: 1, nome: 'WIN', custo: 0.5, valor_pt: 0.2, tick: 5},
		{id: 2, nome: 'WDO', custo: 1.15, valor_pt: 10, tick: 0.5}
	];
	let _active_section = "";
	/*----------------------------------- FUNCOES ------------------------------------*/
	/*------------------------------- Section Ativos ---------------------------------*/
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
		data = `<span class="badge bg-secondary text-capitalize">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano-1, 11, 1))}</span> <span class="badge bg-dark">${first_day}</span> até <span class="badge bg-secondary text-capitalize">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 1, 1))}</span> <span class="badge bg-dark">${last_day}</span>`;
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
		data = `<span class="badge bg-secondary text-capitalize">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 1, 1))}</span> <span class="badge bg-dark">${first_day}</span> até <span class="badge bg-secondary text-capitalize">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 3, 1))}</span> <span class="badge bg-dark">${last_day}</span>`;
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
		data = `<span class="badge bg-secondary text-capitalize">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 3, 1))}</span> <span class="badge bg-dark">${first_day}</span> até <span class="badge bg-secondary text-capitalize">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 5, 1))}</span> <span class="badge bg-dark">${last_day}</span>`;
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
		data = `<span class="badge bg-secondary text-capitalize">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 5, 1))}</span> <span class="badge bg-dark">${first_day}</span> até <span class="badge bg-secondary text-capitalize">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 7, 1))}</span> <span class="badge bg-dark">${last_day}</span>`;
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
		data = `<span class="badge bg-secondary text-capitalize">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 7, 1))}</span> <span class="badge bg-dark">${first_day}</span> até <span class="badge bg-secondary text-capitalize">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 9, 1))}</span> <span class="badge bg-dark">${last_day}</span>`;
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
		data = `<span class="badge bg-secondary text-capitalize">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 9, 1))}</span> <span class="badge bg-dark">${first_day}</span> até <span class="badge bg-secondary text-capitalize">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 11, 1))}</span> <span class="badge bg-dark">${last_day}</span>`;
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
	function buildTableWdoSeries(ano){
		let tbody_wdo_series = $("tbody", document.getElementById("table_wdo_series")),
			html = ``,
			series = ['G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z', 'F'],
			today = new Date();
		for (let m=0; m<12; m++){
			let first_day = (new Date(ano, m, 1)).getDate(),
				last_day = new Date(ano, m+1, 0).getDate(),
				data = `<span class="badge bg-secondary text-capitalize">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, m, 1))}</span> <span class="badge bg-dark">${first_day} - ${last_day}</span>`,
				serie_class = '';
			if (today.getFullYear() == ano && today.getMonth() == m)
				serie_class = " class='table-success'";
			html += `<tr><td name='data'>${data}</td><td name='serie'${serie_class}>${series[m]}</td></tr>`;
		}
		tbody_wdo_series.empty().append(html);
	}
	function buildSectionAtivos(){
		let tbody_ativos = $("tbody", document.getElementById("table_ativos")),
			html = ``,
			year = (new Date()).getFullYear();
		//Constroi tabela de informacoes dos ativos
		for (let at in __ativos){
			html += `<tr>`+
					`<td name='nome'>${__ativos[at].nome}</td>`+
					`<td name='custo'>${__ativos[at].custo}</td>`+
					`<td name='valor_pt'>${__ativos[at].valor_pt}</td>`+
					`<td name='tick'>${__ativos[at].tick}</td>`+
					`</tr>`;
		}
		tbody_ativos.append(html);
		//Constroi a tabela de serie de contratos do WIN
		buildTableWinSeries(year);
		$("input[name='ano']", document.getElementById("table_win_series")).val(year);
		//Constroi a tabela de serie de contratos do WDO
		buildTableWdoSeries(year);
		$("input[name='ano']", document.getElementById("table_wdo_series")).val(year);
	}
	/*------------------------------ Section Operacoes -------------------------------*/
	function buildSectionOperacoes(){
		let inputs = $(document.getElementById("table_adicionar_operacoes")),
			html = ``;
		inputs.find("input[name='data']").inputmask({mask: "99/99/9999", placeholder: ""});
		inputs.find("input[name='hora']").inputmask({mask: "99:99", placeholder: ""});
		inputs.find("input[name='cts']").inputmask({mask: "9[99]", placeholder: ""});
		for (let a in __ativos)
			html += `<option>${__ativos[a].nome}</option>`;
		inputs.find("select[name='ativo']").append(html).trigger("change");
		return "operacoes";
	}
	/*---------------------------- EXECUCAO DAS FUNCOES ------------------------------*/
	/*------------------------------ Section Operacoes -------------------------------*/
	$("select[name='ativo']", document.getElementById("table_adicionar_operacoes")).change(function (){
		if (this.options[this.selectedIndex].text === "WIN")
			$(document.getElementById("table_adicionar_operacoes")).find("input[name='entrada'],input[name='stop'],input[name='men'],input[name='saida'],input[name='mep']").inputmask({mask: "999.999", placeholder: ''});
		else if (this.options[this.selectedIndex].text === "WDO")
			$(document.getElementById("table_adicionar_operacoes")).find("input[name='entrada'],input[name='stop'],input[name='men'],input[name='saida'],input[name='mep']").inputmask({mask: "9.999", placeholder: ''});
	});
	/*------------------------------- Section Ativos ---------------------------------*/
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
	/*------------------------------------ Menu --------------------------------------*/
	$("button", document.getElementById("menu_bottom")).click(function (){
		let me = this.name;
		$(this).parent().find("button.btn-primary").removeClass("btn-primary").addClass("btn-secondary");
		$(this).removeClass("btn-secondary").addClass("btn-primary");
		$("body > div[id]").each(function (i, elem){
			if (elem.id === me){
				if (elem.id === "operacoes")
					buildSectionOperacoes();
				$(elem).show();
				_active_section = elem.id;
			}
			else
				$(elem).hide();
		});
	});
	/*------------------------------- INIT DO SISTEMA --------------------------------*/
	$("button[name='operacoes']", document.getElementById("menu_bottom")).click();
	buildSectionAtivos();
	/*--------------------------------------------------------------------------------*/
	return {}
})();