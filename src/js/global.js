let Global = (function(){
	/*------------------------------------ VARS --------------------------------------*/
	/*----------------------------------- FUNCOES ------------------------------------*/
	/*
		Requisita scripts js.
	*/
	let request = function (filename){
		$.getScript(location.href+filename);
	}
	/*
		Gera conexoes com a interface de webservices.
	*/
	let connect = function (options){
		$.ajax({
			type: "POST",
			url: "webservices/interface.php",
			data: options.data,
			dataType: "json",
			success: options.success,
			error: function (jqXHR, textStatus, errorThrown){
				console.log(`${textStatus}: ${errorThrown}`);
			}
		});
	}
	/*
		Cria Toasts.
	*/
	let toast = {
		create: function (obj){
			if (!("width" in obj))
				obj.width = "";
			if (!("color" in obj))
				obj.color = "";
			obj.text_color = ((obj.color === "bg-danger")?"text-white":"");
			let html = `<div class='toast align-items-center border-0 mb-2 ${obj.width} ${obj.color}' role='alert' aria-live='assertive' aria-atomic='true' data-bs-delay='${obj.delay}'>`;
			if (("title" in obj)){
				html += `<div class='toast-header'>`+
						`<strong class='mr-auto'>${obj.title}</strong>`+
						`<small class='text-muted'>${obj.time}</small>`+
						`<button type='button' class='ml-2 mb-1 close' data-dismiss='toast' aria-label='Close'><span aria-hidden='true'>&times;</span></button>`+
						`</div>`+
						`<div class='toast-body ${obj.text_color}'>${obj.body}</div></div>`;
			}
			else{
				html += `<div class="d-flex">`+
						`<div class="toast-body p-2 ${obj.text_color}">${obj.body}</div>`+
						`<button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>`+
						`</div></div>`;
			}
			$(obj.location).append(html).promise().done(function (){
				$("div.toast:last", obj.location).toast("show").on("hidden.bs.toast", function (){
					$(this).remove();
				});
			});
		}
	}
	/*
		Comanda a modificacao do modal de Update de dados.
		Inputs do Config: {
			#Tamanho do Modal
			size: '(modal-sm | modal-lg | modal-xl | modal-fullscreen)' || default: 'modal-sm',
			#Titulo do Modal 
			title: 'string' || default: 'Atualizar',
			#Conteúdo do Modal
			build_body: 'function' || default: ''
			#Funcao a ser executada no envio dos dados
			send: 'function' || default: ''
		}
	*/
	let updateModal = function (config){
		let modalUpdate = $(document.getElementById("update_modal"));
		//Atualiza o tamanho
		modalUpdate.find("div.modal-dialog").attr("class", `modal-dialog modal-dialog-centered modal-dialog-scrollable ${config.size}`);
		//Atualiza o titulo
		modalUpdate.find("div.modal-header h5").html(config.title || "Atualizar");
		//Atualiza o conteudo
		if ("build_body" in config)
			config.build_body(modalUpdate.find("div.modal-body"));
		//Atualiza o envio de dados
		if ("send" in config)
			modalUpdate.find("#update_modal_enviar").on("click", config.send);
		return modalUpdate;
	}
	/*
		Comanda a modificacao do modal de Remoção de dados.
		Inputs do Config: {
			#Funcao a ser executada no envio dos dados
			send: 'function' || default: ''
		}
	*/
	let removeModal = function (config){
		let removeUpdate = $(document.getElementById("remove_modal"));
		//Atualiza o envio de dados
		if ("send" in config)
			removeUpdate.find("#remove_modal_enviar").on("click", config.send);
		return removeUpdate;
	}
	/*---------------------------- EXECUCAO DAS FUNCOES ------------------------------*/
	/*
		Evento para no fechamento do modal de update, fazer a limpeza necessaria nele.
	*/
	$(document.getElementById("update_modal")).on("hidden.bs.modal", function (){
		let me = $(this);
		//Limpa o titulo 
		me.find("div.modal-body").html("Atualizar");
		//Limpa o Body
		me.find("div.modal-body").empty();
		//Limpa a funcao atrelada para o envio de dados
		me.find("#update_modal_enviar").off("click");
	});
	/*
		Evento para no fechamento do modal de remove, fazer a limpeza necessaria nele.
	*/
	$(document.getElementById("remove_modal")).on("hidden.bs.modal", function (){
		let me = $(this);
		//Limpa a funcao atrelada para o envio de dados
		me.find("#remove_modal_enviar").off("click");
	});
	/*--------------------------------------------------------------------------------*/
	return {
		connect: connect,
		request: request,
		toast: toast,
		updateModal: updateModal,
		removeModal: removeModal
	}
})();