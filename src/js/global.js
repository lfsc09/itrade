/*
	jQuery alterClass plugin.
*/
(function ($) {
	$.fn.alterClass = function (removals, additions){
		let self = this;
		if (removals.indexOf('*') === -1) {
			// Use native jQuery methods if there is no wildcard matching
			self.removeClass(removals);
			return !additions ? self : self.addClass(additions);
		}
		let patt = new RegExp('\\s' + removals.replace(/\*/g, '[A-Za-z0-9-_]+').split(' ').join('\\s|\\s') + '\\s', 'g');
		self.each(function (i, it){
			let cn = ' ' + it.className + ' ';
			while (patt.test(cn))
				cn = cn.replace(patt, ' ');
			it.className = $.trim(cn);
		});
		return !additions ? self : self.addClass(additions);
	};
})(jQuery);

let Global = (function(){
	/*------------------------------------ VARS --------------------------------------*/
	let _loading_div = $(document.getElementById('loading_div')),
		_whiteListPopOvers = bootstrap.Tooltip.Default.allowList,
		_connectionsOn = 0;
	/*----------------------------------- FUNCOES ------------------------------------*/
	let hasClass = function (target, className) {
		return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
	}
	let isObjectEmpty = function(obj){
		for(let prop in obj) {
			if(obj.hasOwnProperty(prop))
				return false;
		}
		return true;
	}
	let convertDate = function(date){
		//Valida a Data
		if (!(/^(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/.test(date)) && !(/^(19|20)\d{2}\-(0[1-9]|1[0-2])\-(0[1-9]|1\d|2\d|3[01])$/.test(date)) && !(/^(0[1-9]|1[0-2])\/(19|20)\d{2}$/.test(date)) && !(/^(19|20)\d{2}\-(0[1-9]|1[0-2])$/.test(date)))
			return ``;
		let frag_date = date.split('/');
		//Se for com '-'
		if (frag_date.length === 1){
			frag_date = date.split('-');
			//Se for YYYY-mm
			if (frag_date.length === 2)
				return `${frag_date[1]}/${frag_date[0]}`;
			//Se for YYYY-mm-dd
			return `${frag_date[2]}/${frag_date[1]}/${frag_date[0]}`;
		}
		//Se for mm/YYYY 
		else if (frag_date.length === 2)
			return `${frag_date[1]}-${frag_date[0]}`;
		//Se for dd/mm/YYYY
		return `${frag_date[2]}-${frag_date[1]}-${frag_date[0]}`;
	}
	let convertDatetime = function(date){
		//Valida a Data
		if (!(/^(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2} ([0-1]\d|2[0-4])\:[0-5]\d\:[0-5]\d$/.test(date)) && !(/^(19|20)\d{2}\-(0[1-9]|1[0-2])\-(0[1-9]|1\d|2\d|3[01]) ([0-1]\d|2[0-4])\:[0-5]\d\:[0-5]\d$/.test(date)))
			return ``;
		let frag_datetime = date.split(' '),
			frag_date = frag_datetime[0].split('/');
		if (frag_date.length === 1){
			frag_date = frag_datetime[0].split('-');
			return `${frag_date[2]}/${frag_date[1]}/${frag_date[0]} ${frag_datetime[1]}`;
		}
		return `${frag_date[2]}-${frag_date[1]}-${frag_date[0]} ${frag_datetime[1]}`;
	}
	let _random = {
		str: function(prefix){
		    return Math.random().toString(36).replace('0.',prefix || '');
		},
		color: function (){ 
		    return '#' + (Math.random().toString(16) + '0000000').slice(2, 8); 
		}
	}
	/*
		Requisita scripts html e js.
		 - files[]: {
			'filename': String
			'cache': Bool (Default: True)
			'dataType': String
			'target': JQuery Obj
		 }
	*/
	let request = function (files){
		let _files = $.map(files, function(file){
			if (file.dataType === 'html'){
				return $.ajax({
					cache: file.cache,
					url: location.href + file.filename,
					dataType: file.dataType,
					success: function (response){
						file.target.append(response);
					}
				});
			}
			else{
				return $.ajax({
					cache: file.cache,
					url: location.href + file.filename,
					dataType: file.dataType
				});
			}
		});
		_files.push($.Deferred(function(deferred){
			$(deferred.resolve);
		}));
		return $.when.apply($, _files);
	}
	/*
		Sincroniza dados com o localStorage ou sessionStorage.
	*/
	let browserStorage__Sync = {
		set: function (mKey, mData, method){
			if (method === 'localStorage')
				localStorage.setItem(mKey, JSON.stringify(mData));
			else if (method === 'sessionStorage')
				sessionStorage.setItem(mKey, JSON.stringify(mData));
		},
		get: function (mKey, method, parsedType = 'Object'){
			let data = null,
				parsed_data = ((parsedType === 'Array') ? [] : {});
			if (method === 'localStorage')
				data = localStorage.getItem(mKey);
			else if (method === 'sessionStorage')
				data = sessionStorage.getItem(mKey);
			if (data !== null)
				parsed_data = JSON.parse(data);
			return parsed_data;
		},
		remove: function (mKey, method){
			if (method === 'localStorage')
				localStorage.removeItem(mKey);
			else if (method === 'sessionStorage')
				sessionStorage.removeItem(mKey);
		}
	}
	/*
		Gera conexoes com a interface de webservices.
	*/
	let connect = function (options){
		if (_connectionsOn === 0)
			_loading_div.show();
		_connectionsOn++;
		$.ajax({
			type: 'POST',
			url: 'webservices/interface.php',
			data: options.data,
			dataType: 'json',
			success: function (result){
				options.success(result);
				_connectionsOn--;
				if (_connectionsOn === 0)
					_loading_div.hide();
			},
			error: function (jqXHR, textStatus, errorThrown){
				console.log(`${textStatus}: ${errorThrown}`);
			}
		});
	}
	/*

	*/
	let delay = function (callback, ms) {
		let timer = 0;
		return function() {
			let context = this, args = arguments;
			clearTimeout(timer);
			timer = setTimeout(function () { callback.apply(context, args); }, ms || 0);
		};
	}
	/*
		Cria Toasts.
	*/
	let toast = {
		create: function (obj){
			let html = ``;
			//Toast
			if (('title' in obj)){
				if (!('width' in obj))
					obj.width = '';
				obj.color = ('color' in obj) ? `bg-${obj.color}` : ``;
				html += `<div class="toast align-items-center border-0 mb-2 ${obj.width} ${obj.color}" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${obj.delay}">`+
						`<div class="toast-header">`+
						`<strong class="me-auto">${obj.title}</strong>`+
						`<small class="text-muted">${obj.time}</small>`+
						`<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>`+
						`</div>`+
						`<div class="toast-body">${obj.body}</div></div>`;
				$(obj.location).append(html).promise().done(function (){
					$('div.toast:last', obj.location).toast('show').on('hidden.bs.toast', function (){
						$(this).remove();
					});
				});
			}
			//Alert
			else{
				obj.color = ('color' in obj) ? `alert-${obj.color}` : `alert-primary`;
				html += `<div class="alert ${obj.color} ${((!('delay' in obj)) ? 'alert-dismissible' : '')}">`+
						`${obj.body}`+
						((!('delay' in obj)) ? `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>` : ``)+
						`</div>`;
				$(obj.location).append(html).promise().done(function (){
					if (obj.color === 'warning' || obj.color === 'danger')
						obj.location.querySelector('div.alert:last-child').scrollIntoView();
					if ('delay' in obj){
						setTimeout(function (){
							$('div.alert:last', obj.location).alert('close');
						}, obj.delay);
					}
				});
			}
		}
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
		let modalInsert = $(document.getElementById('insert_modal'));
		//Atualiza o tamanho
		modalInsert.find('div.modal-dialog').attr('class', `modal-dialog modal-dialog-centered modal-dialog-scrollable ${config.size || 'modal-sm'}`);
		if (!('size' in config) || config.size === 'modal-sm')
			modalInsert.find('div.modal-footer button').alterClass('col-*', 'col-5');
		else if (config.size === 'modal-fullscreen')
			modalInsert.find('div.modal-footer button').alterClass('col-*', 'col-1');
		else
			modalInsert.find('div.modal-footer button').alterClass('col-*', 'col-2');
		//Atualiza o titulo
		modalInsert.find('div.modal-header h5').html(config.title || 'Adicionar');
		//Atualiza o conteudo
		if ('build_body' in config)
			config.build_body(modalInsert.find('div.modal-body'));
		//Atualiza o envio de dados
		if ('send' in config)
			modalInsert.find('#insert_modal_enviar').on('click', config.send);
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
		let modalUpdate = $(document.getElementById('update_modal'));
		//Atualiza o tamanho
		modalUpdate.find('div.modal-dialog').attr('class', `modal-dialog modal-dialog-centered modal-dialog-scrollable ${config.size || 'modal-sm'}`);
		if (!('size' in config) || config.size === 'modal-sm')
			modalUpdate.find('div.modal-footer button').alterClass('col-*', 'col-5');
		else if (config.size === 'modal-fullscreen')
			modalUpdate.find('div.modal-footer button').alterClass('col-*', 'col-1');
		else
			modalUpdate.find('div.modal-footer button').alterClass('col-*', 'col-2');
		//Atualiza o titulo
		modalUpdate.find('div.modal-header h5').html(config.title || 'Atualizar');
		//Atualiza o conteudo
		if ('build_body' in config)
			config.build_body(modalUpdate.find('div.modal-body'));
		//Atualiza o envio de dados
		if ('send' in config)
			modalUpdate.find('#update_modal_enviar').on('click', config.send);
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
		let removeUpdate = $(document.getElementById('remove_modal'));
		//Atualiza o envio de dados
		if ('send' in config)
			removeUpdate.find('#remove_modal_enviar').on('click', config.send);
		return removeUpdate;
	}
	/*---------------------------- EXECUCAO DAS FUNCOES ------------------------------*/
	/*
		Configura o popover para aceitar os elementos e html tags
	*/
	_whiteListPopOvers.table = [];
	_whiteListPopOvers.figure = ['style', 'class'];
	_whiteListPopOvers['*'].push('style');
	/*
		Extensao do Plug-in DataTables para incluir ordenacao com numeros ex.: 5.000, 450.000 ou 4.500,00
 	*/
 	$.extend($.fn.dataTableExt.oSort, {
 		'dot-thousand-pre': function (a){
 			let _a = a.replace(/<[^<>]*>/g, '');
 			_a = (_a === '') ? 0 : ((_a.indexOf(',') !== -1) ? parseFloat(_a.replace(/\./g, '').replace(/,/, '.')) : parseFloat(_a.replace(/\./g, '')));
 			return _a;
 		},
 		'dot-thousand-asc': function (a, b){
 			return ((a < b) ? -1 : ((a > b) ? 1 : 0));
 		},
 		'dot-thousand-desc': function (a, b){
 			return ((a < b) ? 1 : ((a > b) ? -1 : 0));
 		},
 		'br-date-pre': function (a){
 			let _a = a.replace(/<[^<>]*>/g, '');
 			if (_a === '') return _a;
 			_a = _a.split('/');
 			return `${_a[2]}-${_a[1]}-${_a[0]}`;
 		},
 		'br-datetime-pre': function (dt){
 			let _dt = dt.replace(/<[^<>]*>/g, '');
 			if (_dt === '') return _dt;
 			_dt = _dt.split(' ');
 			let _a = _dt[0].split('/');
 			return `${_a[2]}-${_a[1]}-${_a[0]} ${_dt[1]}`;
 		},
 		'n_viagens-pre': function (a){
 			let _a = a.replace(/<[^<>]*>/g, '');
 			if (_a === '') return 0;
 			_a = _a.replace(/\(.*\)/, '');
 			return parseInt(_a);
 		}
 	});
 	$.fn.dataTable.ext.search.push(
 		function(settings, searchData, index, rowData){
 			//Se for a tabela 'lista_ops__table'
 			if (settings.nTable.id === 'lista_ops__table'){
 				//Verifica os filtros
 				let filters = $(document.getElementById('lista_ops__search')),
 					data_filter = filters.find('input[name="data"]').val().split(' - '),
 					ativo_filter = filters.find('select[name="ativo"]').val(),
 					cenario_filter = filters.find('select[name="cenario"]').val(),
 					gerenciamento_filter = filters.find('select[name="gerenciamento"]').val();
 				//Verifica filtro de Data
 				if (data_filter.length === 2){
 					let fI = data_filter[0].split('/'),
 						fE = data_filter[1].split('/'),
 						dT = searchData[1].split('/');
 					fI = new Date(fI[2], fI[1], fI[0]);
 					fE = new Date(fE[2], fE[1], fE[0]);
 					dT = new Date(dT[2], dT[1], dT[0]);
 					if (dT < fI || dT > fE)
 						return false;
 				}
 				//Verifica filtro de Ativo
 				if (ativo_filter.length && !ativo_filter.includes(searchData[3]))
 					return false;
 				//Verifica filtro de Gerenciamento
 				if (gerenciamento_filter.length && !gerenciamento_filter.includes(searchData[4]))
 					return false;
 				//Verifica filtro de Cenario
 				if (cenario_filter.length && !cenario_filter.includes(searchData[8]))
 					return false;
 				return true;
 			}
 			return true;
 		}
 	);
	/*
		Evento para no fechamento do modal de update, fazer a limpeza necessaria nele.
	*/
	$(document.getElementById('insert_modal')).on('hidden.bs.modal', function (){
		let me = $(this);
		//Limpa o titulo 
		me.find('div.modal-body').html('Adicionar');
		//Limpa o Body
		me.find('div.modal-body').empty();
		//Limpa a funcao atrelada para o envio de dados
		me.find('#insert_modal_enviar').off('click');
	});
	/*
		Evento para no fechamento do modal de update, fazer a limpeza necessaria nele.
	*/
	$(document.getElementById('update_modal')).on('hidden.bs.modal', function (){
		let me = $(this);
		//Limpa o titulo 
		me.find('div.modal-body').html('Atualizar');
		//Limpa o Body
		me.find('div.modal-body').empty();
		//Limpa a funcao atrelada para o envio de dados
		me.find('#update_modal_enviar').off('click');
	});
	/*
		Evento para no fechamento do modal de remove, fazer a limpeza necessaria nele.
	*/
	$(document.getElementById('remove_modal')).on('hidden.bs.modal', function (){
		let me = $(this);
		//Limpa a funcao atrelada para o envio de dados
		me.find('#remove_modal_enviar').off('click');
	});
	/*--------------------------------------------------------------------------------*/
	return {
		hasClass: hasClass,
		isObjectEmpty: isObjectEmpty,
		convertDate: convertDate,
		convertDatetime: convertDatetime,
		_random: _random,
		request: request,
		browserStorage__Sync: browserStorage__Sync,
		connect: connect,
		toast: toast,
		insertModal: insertModal,
		updateModal: updateModal,
		removeModal: removeModal
	}
})();