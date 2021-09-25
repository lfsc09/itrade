let iTrade = (function(){
	/*------------------------------------ VARS --------------------------------------*/
	let _active_section = "";
	/*----------------------------------- FUNCOES ------------------------------------*/
	/*---------------------------- EXECUCAO DAS FUNCOES ------------------------------*/
	/*------------------------------------ Menu --------------------------------------*/
	/*
		Processa toasts no master_toasts, para mostrar ou não a div.
	*/
	$(document.getElementById("master_toasts")).on("DOMSubtreeModified", function (){
		let me = $(this);
		me.toggle(me.html() !== "");
	});
	/*
		Processa a troca de abas no Menu.
	*/
	$("button", document.getElementById("menu_bottom")).click(function (){
		let me = this.name;
		//Logout da plataforma
		if (this.name === "logout"){
			Global.connect({
				data: {module: "login", action: "logout"},
				success: function (result){
					window.location.href = window.location.href;
				}
			});
			return false;
		}
		//Outras opcoes do menu
		$(this).parent().find("button.btn-primary").removeClass("btn-primary").addClass("btn-secondary");
		$(this).removeClass("btn-secondary").addClass("btn-primary");
		$("body > div[id]").each(function (i, elem){
			if (elem.id === me){
				if (elem.id === "renda_variavel"){
					if (typeof Renda_variavel === 'undefined'){
						Global.request("src/js/iTrade_RendaVariavel_Statistics.js");
						Global.request("src/js/iTrade_RendaVariavel.js");
					}
					else
						Renda_variavel.rebuildArcaboucoSection();
				}
				else if (elem.id === "ativos"){
					if (typeof Ativos === 'undefined')
						Global.request("src/js/iTrade_Ativos.js");
				}
				$(elem).show();
				_active_section = elem.id;
			}
			else
				$(elem).hide();
		});
	});
	/*------------------------------- INIT DO SISTEMA --------------------------------*/
	$("button[name='renda_variavel']", document.getElementById("menu_bottom")).click();
	/*--------------------------------------------------------------------------------*/
	return {
	}
})();