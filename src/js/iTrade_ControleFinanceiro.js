let Controle_financeiro = (function(){
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------------ VARS --------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////
	//Contas
	//////////////////////////////////
	//Controla a lista de contas cadastradas
	let	_lista__contas = {
		//Lista de contas cadastradas do usuario
		contas: [],
		update: function (data){
			//Atualiza o Array
			this.contas = data;
		}
	}
	//////////////////////////////////
	//Categorias
	//////////////////////////////////
	//Controla a lista de categorias cadastradas
	let	_lista__categorias = {
		//Lista de categorias cadastradas do usuario
		categorias: [],
		update: function (data){
			//Atualiza o Array
			this.categorias = data;
		}
	}
	//////////////////////////////////
	//Cartões de Crédito
	//////////////////////////////////
	//Controla a lista de cartões de crédito cadastrados
	let	_lista__cartoes_credito = {
		//Lista de cartões de crédito cadastrados do usuario
		cartoes_credito: [],
		update: function (data){
			//Atualiza o Array
			this.cartoes_credito = data;
		}
	}
	//////////////////////////////////
	//Despesas Fixas
	//////////////////////////////////
	//Controla a lista de despesas fixas cadastradas
	let	_lista__despesas_fixas = {
		//Lista de despesas fixas cadastradas do usuario
		despesas_fixas: [],
		update: function (data){
			//Atualiza o Array
			this.despesas_fixas = data;
		}
	}
	//////////////////////////////////
	//Lançamentos
	//////////////////////////////////
	//Controla a lista de lançamentos baixados
	let	_lista__lançamentos = {
		//Lista de lançamentos
		lancamentos: [],
		update: function (data){
			//Atualiza o Array
			this.lancamentos = data;
		}
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*--------------------------------- Lista Contas ---------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	//Configuração da tabela de contas em 'contas_modal'
	let _conta__table_DT = {
		columns: [
			{name: 'cor', orderable: false},
			{name: 'banco', orderable: true},
			{name: 'numero', orderable: true},
			{name: 'local', orderable: true},
			{name: 'editar', orderable: false},
			{name: 'remover', orderable: false}
		],
		lengthChange: false,
		order: [[ 1, 'asc' ]],
		pageLength: 10,
		pagingType: 'input'
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*---------------------------- Lista Cartões Crédito -----------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	//Configuração da tabela de cartões em 'cartoes_credito_modal'
	let _cartoes_credito__table_DT = {
		columns: [
			{name: 'banco', orderable: true},
			{name: 'numero', orderable: true},
			{name: 'editar', orderable: false},
			{name: 'remover', orderable: false}
		],
		lengthChange: false,
		order: [[ 0, 'asc' ]],
		pageLength: 10,
		pagingType: 'input'
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------------- FUNCOES ------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*--------------------------------- Lista Contas ---------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Reseta o formulário 'contas_modal_form'.
	*/
	function resetFormContasModal(){
		let form = $(document.getElementById('contas_modal_form'));
		form.removeAttr('id_conta');
		form.find('input[name]').val('').removeAttr('changed');
	}
	/*
		Constroi o modal de gerenciamento de contas.
	*/
	function buildContasModal(forceRebuild = false, show = false){
		if (forceRebuild)
			buildContasTable();
		if (show){
			//Reseta o formulario de cadastro e edição
			resetFormContasModal();
			$(document.getElementById('contas_modal')).modal('show');
		}
	}
	/*
		Constroi a tabela de contas.
	*/
	function buildContasTable(){
		let table = $(document.getElementById('table_contas')),
			html = ``;
		table.DataTable().destroy();
		//Constroi tabela de informacoes das contas
		for (let co in _lista__contas.contas){
			html += `<tr conta="${_lista__contas.contas[co].id}">`+
					`<td name="cor" class="text-center"><i class="fas fa-square" style="color: ${_lista__contas.contas[co].cor}"></i></td>`+
					`<td name="banco" class="fw-bold">${_lista__contas.contas[co].banco}</td>`+
					`<td name="numero" class="fw-bold">${_lista__contas.contas[co].numero}</td>`+
					`<td name="local" class="fw-bold">${_lista__contas.contas[co].local}</td>`+
					`<td name="editar" class="text-center"><button class="btn btn-sm btn-light" type="button" name="editar"><i class="fas fa-edit"></i></button></td>`+
					`<td name="remover" class="text-center"><button class="btn btn-sm btn-light" type="button" name="remover"><i class="fas fa-trash text-danger"></i></button></td>`+
					`</tr>`;
		}
		table.find('tbody').empty().append(html).promise().then(function (){
			table.DataTable(_conta__table_DT);
		});
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*---------------------------- Lista Cartões Crédito -----------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Reseta o formulário 'cartoes_credito_modal_form'.
	*/
	function resetFormCartoesCreditoModal(){
		let form = $(document.getElementById('cartoes_credito_modal_form'));
		form.removeAttr('id_cartao_credito');
		form.find('input[name]').val('').removeAttr('changed');
	}
	/*
		Constroi o modal de gerenciamento de cartões de crédito.
	*/
	function buildCartoesCreditoModal(forceRebuild = false, show = false){
		if (forceRebuild)
			buildCartoesCreditoTable();
		if (show){
			//Reseta o formulario de cadastro e edição
			resetFormCartoesCreditoModal();
			$(document.getElementById('cartoes_credito_modal')).modal('show');
		}
	}
	/*
		Constroi a tabela de cartões de crédito.
	*/
	function buildCartoesCreditoTable(){
		let table = $(document.getElementById('table_cartoes_credito')),
			html = ``;
		table.DataTable().destroy();
		//Constroi tabela de informacoes dos cartões de crédito
		for (let cc in _lista__cartoes_credito.cartoes_credito){
			html += `<tr cartao_credito="${_lista__cartoes_credito.cartoes_credito[cc].id}">`+
					`<td name="banco" class="fw-bold">${_lista__cartoes_credito.cartoes_credito[cc].banco}</td>`+
					`<td name="numero" class="fw-bold">${_lista__cartoes_credito.cartoes_credito[cc].numero}</td>`+
					`<td name="editar" class="text-center"><button class="btn btn-sm btn-light" type="button" name="editar"><i class="fas fa-edit"></i></button></td>`+
					`<td name="remover" class="text-center"><button class="btn btn-sm btn-light" type="button" name="remover"><i class="fas fa-trash text-danger"></i></button></td>`+
					`</tr>`;
		}
		table.find('tbody').empty().append(html).promise().then(function (){
			table.DataTable(_cartoes_credito__table_DT);
		});
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*---------------------------- EXECUCAO DAS FUNCOES ------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*--------------------------------- Lista Contas ---------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Marca os inputs que forem alterados.
	*/
	$(document.getElementById('contas_modal_form')).on('change', 'input[name]', function (){
		this.setAttribute('changed', '');
	});
	/*
		Processa click em 'table_contas' (Para Edição das contas)
	*/
	$(document.getElementById('table_contas')).on('click', 'tbody tr td button[name="editar"]', function (){
		let id_conta = $(this).parentsUntil('tbody').last().attr('conta'),
			form = $(document.getElementById('contas_modal_form'));
		for (let co in _lista__contas.contas){
			if (_lista__contas.contas[co].id == id_conta){
				form.find('input[name="cor"]').val(_lista__contas.contas[co].cor).removeAttr('changed');
				form.find('input[name="banco"]').val(_lista__contas.contas[co].banco).removeAttr('changed');
				form.find('input[name="numero"]').val(_lista__contas.contas[co].numero).removeAttr('changed');
				form.find('input[name="local"]').val(_lista__contas.contas[co].local).removeAttr('changed');
				form.attr('id_conta', id_conta);
			}
		}
	});
	/*
		Processa os duplos cliques em 'table_contas'.
	*/
	$(document.getElementById('table_contas')).on('dblclick', 'tbody tr td button[name="remover"]', function (){
		let id_conta = $(this).parentsUntil('tbody').last().attr('conta');
		Global.connect({
			data: {module: 'controle_financeiro', action: 'remove_contas', params: {id: id_conta}},
			success: function (result){
				if (result.status){
					_lista__contas.update(result.data);
					buildContasTable();
				}
				else
					Global.toast.create({location: document.getElementById('contas_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
			}
		});
	});
	/*
		Cancela envio de adição ou edição de contas, removendo os dados do formulário e resetando ele.
	*/
	$(document.getElementById('contas_modal_cancelar')).click(function (){
		resetFormContasModal();
	});
	/*
		Envia info do formulario de contas para adicionar ou editar uma conta.
	*/
	$(document.getElementById('contas_modal_enviar')).click(function (){
		let form = $(document.getElementById('contas_modal_form')),
			id_conta = form.attr('id_conta'),
			data = {};
		form.find('input[name][changed]').each(function (){
			data[this.name] = $(this).val();
		});
		//Se for edição
		if (id_conta){
			if (!Global.isObjectEmpty(data)){
				data['id'] = id_conta;
				Global.connect({
					data: {module: 'controle_financeiro', action: 'update_contas', params: data},
					success: function (result){
						if (result.status){
							Global.toast.create({location: document.getElementById('contas_modal_toasts'), color: 'success', body: 'Conta Atualizada.', delay: 4000});
							resetFormContasModal();
							_lista__contas.update(result.data);
							buildContasTable();
						}
						else
							Global.toast.create({location: document.getElementById('contas_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
					}
				});
			}
		}
		//Se for adição
		else{
			if (!('banco' in data) || data['banco'] === '' || !('numero' in data) || data['numero'] === '' || !('local' in data) || data['local'] === ''){
				Global.toast.create({location: document.getElementById('contas_modal_toasts'), color: 'warning', body: 'Todos os campos devem ser preenchidos.', delay: 4000});
				return;
			}
			Global.connect({
				data: {module: 'controle_financeiro', action: 'insert_contas', params: data},
				success: function (result){
					if (result.status){
						resetFormContasModal();
						_lista__contas.update(result.data);
						buildContasTable();
					}
					else
						Global.toast.create({location: document.getElementById('contas_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
				}
			});
		}
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*---------------------------- Lista Cartões Crédito -----------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Marca os inputs que forem alterados.
	*/
	$(document.getElementById('cartoes_credito_modal_form')).on('change', 'input[name]', function (){
		this.setAttribute('changed', '');
	});
	/*
		Processa click em 'table_cartoes_credito' (Para Edição dos cartões)
	*/
	$(document.getElementById('table_cartoes_credito')).on('click', 'tbody tr td button[name="editar"]', function (){
		let id_cartao_credito = $(this).parentsUntil('tbody').last().attr('cartao_credito'),
			form = $(document.getElementById('cartoes_credito_modal_form'));
		for (let cc in _lista__cartoes_credito.cartoes_credito){
			if (_lista__cartoes_credito.cartoes_credito[cc].id == id_cartao_credito){
				form.find('input[name="banco"]').val(_lista__cartoes_credito.cartoes_credito[cc].banco).removeAttr('changed');
				form.find('input[name="numero"]').val(_lista__cartoes_credito.cartoes_credito[cc].numero).removeAttr('changed');
				form.attr('id_cartao_credito', id_cartao_credito);
			}
		}
	});
	/*
		Processa os duplos cliques em 'table_cartoes_credito'.
	*/
	$(document.getElementById('table_cartoes_credito')).on('dblclick', 'tbody tr td button[name="remover"]', function (){
		let id_cartao_credito = $(this).parentsUntil('tbody').last().attr('cartao_credito');
		Global.connect({
			data: {module: 'controle_financeiro', action: 'remove_cartoes_credito', params: {id: id_cartao_credito}},
			success: function (result){
				if (result.status){
					_lista__cartoes_credito.update(result.data);
					buildCartoesCreditoTable();
				}
				else
					Global.toast.create({location: document.getElementById('cartoes_credito_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
			}
		});
	});
	/*
		Cancela envio de adição ou edição de cartões, removendo os dados do formulário e resetando ele.
	*/
	$(document.getElementById('cartoes_credito_modal_cancelar')).click(function (){
		resetFormCartoesCreditoModal();
	});
	/*
		Envia info do formulario de cartões para adicionar ou editar um cartão.
	*/
	$(document.getElementById('cartoes_credito_modal_enviar')).click(function (){
		let form = $(document.getElementById('cartoes_credito_modal_form')),
			id_cartao_credito = form.attr('id_cartao_credito'),
			data = {};
		form.find('input[name][changed]').each(function (){
			data[this.name] = $(this).val();
		});
		//Se for edição
		if (id_cartao_credito){
			if (!Global.isObjectEmpty(data)){
				data['id'] = id_cartao_credito;
				Global.connect({
					data: {module: 'controle_financeiro', action: 'update_cartoes_credito', params: data},
					success: function (result){
						if (result.status){
							Global.toast.create({location: document.getElementById('cartoes_credito_modal_toasts'), color: 'success', body: 'Cartão Atualizado.', delay: 4000});
							resetFormCartoesCreditoModal();
							_lista__cartoes_credito.update(result.data);
							buildCartoesCreditoTable();
						}
						else
							Global.toast.create({location: document.getElementById('cartoes_credito_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
					}
				});
			}
		}
		//Se for adição
		else{
			if (!('banco' in data) || data['banco'] === '' || !('numero' in data) || data['numero'] === ''){
				Global.toast.create({location: document.getElementById('cartoes_credito_modal_toasts'), color: 'warning', body: 'Todos os campos devem ser preenchidos.', delay: 4000});
				return;
			}
			Global.connect({
				data: {module: 'controle_financeiro', action: 'insert_cartoes_credito', params: data},
				success: function (result){
					if (result.status){
						resetFormCartoesCreditoModal();
						_lista__cartoes_credito.update(result.data);
						buildCartoesCreditoTable();
					}
					else
						Global.toast.create({location: document.getElementById('cartoes_credito_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
				}
			});
		}
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------------- Menu Top -----------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Comanda cliques no menu de controle financeiro.
	*/
	$('[name]', document.getElementById('controle_financeiro__menu')).click(function (e){
		e.preventDefault();
		if (this.name === 'contas')
			buildContasModal(forceRebuild = false, show = true);
		else if (this.name === 'categorias')
			buildCategoriasModal(firstBuild = false, show = true);
		else if (this.name === 'cartoes_credito')
			buildCartoesCreditoModal(forceRebuild = false, show = true);
		else if (this.name === 'despesas_fixas')
			buildDespesasFixasModal();
		else if (this.name === 'adicionar_lancamentos')
			buildAdicionarLancamentosOffcanvas(firstBuild = false, forceRebuild = false, show = true);
		else if (this.name === 'lista_lanc')
			buildLancamentosOffcanvas(forceRebuild = false);
		else if (this.name === 'upload_lancamentos')
			buildUploadLancamentosModal();
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------- INIT DO SISTEMA --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	Global.connect({
		data: {module: 'controle_financeiro', action: 'get_data'},
		success: function (result){
			if (result.status){
				//Constroi a lista de Contas, Categorias, Cartões Crédito e Despesas Fixas
				_lista__contas.update(result.data['contas']);
				// _lista__categorias.update(result.data['categorias']);
				_lista__cartoes_credito.update(result.data['cartoes_credito']);
				// _lista__despesas_fixas.update(result.data['despesas_fixas']);
				//Inicia o modal de Contas
				buildContasModal(forceRebuild = true, show = false);
				//Inicia o modal de Categorias
				// buildCategoriasModal(forceRebuild = true, show = false);
				//Inicia o modal de Cartões Crédito
				buildCartoesCreditoModal(firstBuild = true, show = false);
				//Inicia o modal de Despesas Fixas
				// buildDespesasFixasModal(firstBuild = true, show = false);
				//Inicia o offcanvas de Adicionar Lançamentos
				// buildAdicionarLançamentosOffcanvas(firstBuild = true, forceRebuild = true, show = false);
				// _lista_lanc__needRebuild = true;
			}
			else
				Global.toast.create({location: document.getElementById('master_toasts'), title: 'Erro', time: 'Now', body: result.error, delay: 4000});
		}
	});
	/*--------------------------------------------------------------------------------*/
	return {
	}
})();