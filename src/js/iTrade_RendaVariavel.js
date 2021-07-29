let Renda_variavel = (function(){
	/*------------------------------------ VARS --------------------------------------*/
	/*----------------------------------- FUNCOES ------------------------------------*/
	/*----------------------------- Section Arcabouço --------------------------------*/
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
				modal_body.append(html).promise().then(function (){
					let form = modal_body.find("form");
					// form.find("input[name='custo']").inputmask({alias: "numeric", digitsOptional: false, digits: 2, placeholder: "0"});
					// form.find("input[name='valor_pt']").inputmask({alias: "numeric", digitsOptional: false, digits: 2, placeholder: "0"});
					// form.find("input[name='tick']").inputmask({alias: "numeric", digitsOptional: false, digits: 2, placeholder: "0"});
				});
			},
			send: function (){
				// let error = false,
				// 	form = $(document.getElementById("insert_modal_form")),
				// 	data = {};
				// form.find("input").each(function (i, input){
				// 	if (input.value !== "")
				// 		data[input.name] = input.value;
				// 	else
				// 		error = true;
				// });
				// if (error)
				// 	Global.toast.create({location: document.getElementById("insert_modal_toasts"), color: "bg-warning", body: "Preencha todos os campos", width: "w-100", delay: 1500});
				// else{
				// 	Global.connect({
				// 		data: {module: "ativos", action: "insert_ativos", params: data},
				// 		success: function (result){
				// 			if (result.status){
				// 				Global.connect({
				// 					data: {module: "ativos", action: "get_ativos"},
				// 					success: function (result){
				// 						if (result.status){
				// 							$(document.getElementById("insert_modal")).modal("hide");
				// 							buildTableAtivos(result.data);
				// 						}
				// 					}
				// 				});
				// 			}
				// 			else
				// 				Global.toast.create({location: document.getElementById("insert_modal_toasts"), color: "bg-danger", body: result.error, width: "w-100", delay: 4000});
				// 		}
				// 	});		
				// }
			}
		}).modal("show");
		return false;
	});
	/*------------------------------- INIT DO SISTEMA --------------------------------*/
	/*--------------------------------------------------------------------------------*/
	return {}
})();