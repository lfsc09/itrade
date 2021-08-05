/*
	jQuery alterClass plugin.
*/
(function ($) {
	$.fn.alterClass = function (removals, additions){
		var self = this;
		if ( removals.indexOf( '*' ) === -1 ) {
			// Use native jQuery methods if there is no wildcard matching
			self.removeClass( removals );
			return !additions ? self : self.addClass( additions );
		}
		var patt = new RegExp( '\\s' + 
			removals.
			replace( /\*/g, '[A-Za-z0-9-_]+' ).
			split( ' ' ).
			join( '\\s|\\s' ) + 
			'\\s', 'g' );
		self.each( function ( i, it ) {
			var cn = ' ' + it.className + ' ';
			while ( patt.test( cn ) ) {
				cn = cn.replace( patt, ' ' );
			}
			it.className = $.trim( cn );
		});
		return !additions ? self : self.addClass( additions );
	};
})( jQuery );

let Global = (function(){
	/*------------------------------------ VARS --------------------------------------*/
	let _loading_div = $(document.getElementById("loading_div")),
		_whiteListPopOvers = bootstrap.Tooltip.Default.allowList;
	/*----------------------------------- FUNCOES ------------------------------------*/
	let hasClass = function (target, className) {
		return new RegExp('(\\s|^)'+className+'(\\s|$)').test(target.className);
	}
	let isObjectEmpty = function(obj){
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop))
				return false;
		}
		return true;
	}
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
		_loading_div.show();
		$.ajax({
			type: "POST",
			url: "webservices/interface.php",
			data: options.data,
			dataType: "json",
			success: function (result){
				options.success(result);
				_loading_div.hide();
			},
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
						`<strong class='me-auto'>${obj.title}</strong>`+
						`<small class='text-muted'>${obj.time}</small>`+
						`<button type='button' class='btn-close' data-bs-dismiss='toast' aria-label='Close'></button>`+
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
	let updatePopover = function (config){
		$("body").popover({
			html: true,
			container: 'body',
			trigger: 'manual',
			placement: config.placement,
			selector: config.selector,
			title: config.title,
			content: config.body
		}).show();
		// config.elem.addEventListener('hidden.bs.tooltip', function () {
		// 	tooltip.dispose();
		// });
	}
	/*
		Comanda a modificacao do modal de Adição de dados.
		Inputs do Config: {
			#Tamanho do Modal
			size: '(modal-sm | modal-lg | modal-xl | modal-fullscreen)' || default: 'modal-sm',
			#Titulo do Modal 
			title: 'string' || default: 'Adicionar',
			#Conteúdo do Modal
			build_body: 'function' || default: ''
			#Funcao a ser executada no envio dos dados
			send: 'function' || default: ''
		}
	*/
	let insertModal = function (config){
		let modalInsert = $(document.getElementById("insert_modal"));
		//Atualiza o tamanho
		modalInsert.find("div.modal-dialog").attr("class", `modal-dialog modal-dialog-centered modal-dialog-scrollable ${config.size || "modal-sm"}`);
		if (!("size" in config) || config.size === "modal-sm")
			modalInsert.find("div.modal-footer button").alterClass("col-*", "col-5");
		else if (config.size === "modal-fullscreen")
			modalInsert.find("div.modal-footer button").alterClass("col-*", "col-1");
		else
			modalInsert.find("div.modal-footer button").alterClass("col-*", "col-2");
		//Atualiza o titulo
		modalInsert.find("div.modal-header h5").html(config.title || "Adicionar");
		//Atualiza o conteudo
		if ("build_body" in config)
			config.build_body(modalInsert.find("div.modal-body"));
		//Atualiza o envio de dados
		if ("send" in config)
			modalInsert.find("#insert_modal_enviar").on("click", config.send);
		return modalInsert;
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
		modalUpdate.find("div.modal-dialog").attr("class", `modal-dialog modal-dialog-centered modal-dialog-scrollable ${config.size || "modal-sm"}`);
		if (!("size" in config) || config.size === "modal-sm")
			modalUpdate.find("div.modal-footer button").alterClass("col-*", "col-5");
		else if (config.size === "modal-fullscreen")
			modalUpdate.find("div.modal-footer button").alterClass("col-*", "col-1");
		else
			modalUpdate.find("div.modal-footer button").alterClass("col-*", "col-2");
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
		Configura o popover para aceitar os elementos e html tags
	*/
	_whiteListPopOvers.table = [];
	_whiteListPopOvers.figure = ['style', 'class', 'form', 'id'];
	_whiteListPopOvers['*'].push('style');
	/*
		Evento para no fechamento do modal de update, fazer a limpeza necessaria nele.
	*/
	$(document.getElementById("insert_modal")).on("hidden.bs.modal", function (){
		let me = $(this);
		//Limpa o titulo 
		me.find("div.modal-body").html("Adicionar");
		//Limpa o Body
		me.find("div.modal-body").empty();
		//Limpa a funcao atrelada para o envio de dados
		me.find("#insert_modal_enviar").off("click");
	});
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
		hasClass: hasClass,
		isObjectEmpty: isObjectEmpty,
		connect: connect,
		request: request,
		toast: toast,
		updatePopover: updatePopover,
		insertModal: insertModal,
		updateModal: updateModal,
		removeModal: removeModal
	}
})();