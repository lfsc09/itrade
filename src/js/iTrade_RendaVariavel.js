let Renda_variavel = (function(){
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------------ VARS --------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------- Section Arcabouço --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////
	//Usuários
	//////////////////////////////////
	//Controla a lista de usuarios cadastrados
	let	_lista__usuarios = {
		//Lista dos usuários cadastrados
		usuarios: [],
		update: function (data){
			//Atualiza o Array
			this.usuarios = data;
		}
	}
	//////////////////////////////////
	//Ativos
	//////////////////////////////////
	//Controla a lista de ativos cadastrados
	let	_lista__ativos = {
		//Lista de ativos cadastrados do usuario
		ativos: [],
		update: function (data){
			//Atualiza o Array
			this.ativos = data;
		}
	}
	//////////////////////////////////
	//Arcabouços
	//////////////////////////////////
	//Controla a lista de arcabouços cadastrados
	let	_lista__arcaboucos = {
		//Lista de arcabouços cadastrados do usuário
		arcaboucos: {},
		create: function (data){
			//Atualiza o objeto
			this.arcaboucos = {};
			for (let a in data){
				//Reordena a lista de usuarios
				data[a]['usuarios'].sort((a,b) => (a.criador < b.criador) ? 1 : a.usuario.localeCompare(b.usuario));
				this.arcaboucos[data[a].id] = data[a];
			}
		},
		update: function (data){
			//Atualiza o objeto
			data['usuarios'].sort((a,b) => (a.criador < b.criador) ? 1 : a.usuario.localeCompare(b.usuario));
			this.arcaboucos[data.id] = data;
			_lista__instancias_arcabouco.updateArcabouco_Info(data.id);
		},
		remove: function (id){
			//Atualiza o objeto
			delete this.arcaboucos[id];
			//Atualiza na lista de instancias
			return _lista__instancias_arcabouco.removeAll_by_idArcabouco(id);
		}
	}
	//////////////////////////////////
	//Cenários
	//////////////////////////////////
	//Controla a lista de cenários por arcabouço baixados
	let _lista__cenarios = {
		//Lista de cenarios por arcabouço
		cenarios: {},
		create: function (data){
			let selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id');
			//Atualiza o objeto
			this.cenarios[selected_inst_arcabouco] = {};
			for (let cn in data)
				this.cenarios[selected_inst_arcabouco][data[cn].id] = data[cn];
		},
		update: function (data){
			//Atualiza o objeto
			this.cenarios[_lista__instancias_arcabouco.getSelected('id')][data.id] = data;
		},
		remove: function (id){
			//Atualiza o objeto
			delete this.cenarios[_lista__instancias_arcabouco.getSelected('id')][id];
		}
	}
	//////////////////////////////////
	//Operações
	//////////////////////////////////
	//Controla a lista de operações por arcabouço baixados
	let	_lista__operacoes = {
		//Lista de operações por arcabouço
		operacoes: {},
		update: function (data){
			//Atualiza o Array
			this.operacoes[_lista__instancias_arcabouco.getSelected('id')] = data;
		}
	}
	//////////////////////////////////
	//Instancias de Arcabouços
	//////////////////////////////////
	//Controla a lista de instancias de arcabouços selecionadas
	let	_lista__instancias_arcabouco = {
		//Lista de instancias de arcabouços selecionadas
		instancias: [],
		//Lista de cores para cada instancia na lista
		colors: {
			class: ['--bs-blue', '--bs-red', '--bs-green', '--bs-orange', '--bs-indigo'],
			code: ['#0d6efd', '#dc3545', '#198754', '#fd7e14', '#6610f2']
		},
		/*
			Inicia a lista de instancias:
				- Inicia do zero se não haver nada no localStorage.
					- Pega o primeiro arcabouço e joga na lista.
					- Inicia o arcabouço section com os cenarios e operações desse arcabouço.
					- Atualiza o _lista__operacoes.operacoes e _lista__cenarios.cenarios.
				- Se houver algo no localStorage pega oque tem la.
					- Verifica quais instancias devem ser removidas, caso seus arcabouços não existam mais.
						- Se nao sobrou nenhuma na lista, inicia como se fosse do zero.
						- Senão inicia com a instancia selecionada.
							 - Se os dados trazidos são do arcabouço da instancia, inicia com eles.
							 	- E Atualiza o _lista__operacoes.operacoes e _lista__cenarios.cenarios.
						 	- Senão dai baixa eles, inicia dai do arcabouço section e adiciona eles em _lista__operacoes.operacoes e _lista__cenarios.cenarios.
		*/
		start: function (allData){
			this.instancias = Global.browserStorage__Sync.get('instancias', 'localStorage', 'Array');
			//Se ha instancias no localStorage
			if (this.instancias.length){
				//Verifica quais instancias devem ser removidas
				for (let i in this.instancias){
					if (!(this.instancias[i].id) in _lista__arcaboucos.arcaboucos)
						this.instancias.splice(i, 1);
				}
				//Se há ainda alguma instancia
				if (this.instancias.length){
					//Verifica se há alguma instancia selecionada depois da remoção, se não há seleciona a primeira
					let instancia_selected_index = null;
					for (let i in this.instancias){
						if (this.instancias[i].selected)
							instancia_selected_index = i;
					}
					if (instancia_selected_index === null){
						this.instancias[0].selected = true;
						instancia_selected_index = 0;
					}
					rebuild__instanciasArcabouco_HTML();
					Global.browserStorage__Sync.set('instancias', this.instancias, 'localStorage');
					//Verifica se os dados (cenarios + operacoes) são do arcabouço da instancia selecionada
					if (this.instancias[instancia_selected_index].id === allData['arcaboucos'][0].id){
						//Inicia o arcabouço section com os cenarios e operações que vieram.
						_lista__cenarios.create(allData['cenarios']);
						_lista__operacoes.update(allData['operacoes']);
						//Inicia o 'dashboard_ops__search' com os 'filters' e 'simulations'
						_dashboard_ops__search.init();
						//Constroi o arcabouço section
						rebuildArcaboucoSection(rebuildSearch = false);
					}
					else{
						Global.connect({
							data: {module: 'renda_variavel', action: 'get_arcabouco_data', params: {id_arcabouco: this.instancias[instancia_selected_index].id}},
							success: function (result){
								if (result.status){
									//Inicia o arcabouço section com os cenarios e operações que vieram.
									_lista__cenarios.create(result.data['cenarios']);
									_lista__operacoes.update(result.data['operacoes']);
									//Inicia o 'dashboard_ops__search' com os 'filters' e 'simulations'
									_dashboard_ops__search.init();
									//Constroi o arcabouço section
									rebuildArcaboucoSection(rebuildSearch = false);
								}
								else
									Global.toast.create({location: document.getElementById('master_toasts'), title: 'Erro', time: 'Now', body: result.error, delay: 4000});
							}
						});
					}
				}
			}
			//Se a lista de instancias ta vazia, inicia do Zero
			if (this.instancias.length === 0){
				//Pega o primeiro arcabouço e joga na lista.
				this.instancias.push({
					instancia: Global._random.str('i'),
					id: allData['arcaboucos'][0].id,
					nome: allData['arcaboucos'][0].nome,
					color: this.colors.class[0],
					chartColor: this.colors.code[0],
					selected: true,
					filters: {},
					simulations: {}
				});
				rebuild__instanciasArcabouco_HTML();
				Global.browserStorage__Sync.set('instancias', this.instancias, 'localStorage');
				//Inicia o arcabouço section com os cenarios e operações desse arcabouço.
				_lista__cenarios.create(allData['cenarios']);
				_lista__operacoes.update(allData['operacoes']);
				//Inicia o 'dashboard_ops__search' com os 'filters' e 'simulations'
				_dashboard_ops__search.init();
				//Constroi a seção (Filtros + Dashboard)
				rebuildArcaboucoSection(rebuildSearch = false);
			}
		},
		//Retorna a instancia selecionada ou um atributo da instancia selecionada
		getSelected: function (key = ''){
			for (let i in this.instancias){
				if (this.instancias[i].selected){
					if (key !== '')
						return this.instancias[i][key];
					return this.instancias[i];
				}
			}
			return null;
		},
		//Muda o estado de uma instancia para selecionado
		setSelected: function (id_inst){
			for (let i in this.instancias)
				this.instancias[i].selected = (this.instancias[i].instancia === id_inst);
			rebuild__instanciasArcabouco_HTML();
			Global.browserStorage__Sync.set('instancias', this.instancias, 'localStorage');
		},
		//Adiciona uma nova instancia na lista
		add: function (inst){
			//Não cria mais depois do limite especificado
			if ((this.instancias.length !== 0 && this.instancias.length === this.colors.class.length) || !('id' in inst))
				return false;
			//De-seleciona quem estiver selecionado
			if (('selected' in inst) && inst.selected){
				for (let i in this.instancias)
					this.instancias[i].selected = false;
			}
			//Nova instancia com os dados passados
			let new_inst = {
				instancia: Global._random.str('i'),
				id: inst.id,
				nome: inst.nome || '----',
				color: this.colors.class[this.instancias.length],
				chartColor: this.colors.code[this.instancias.length],
				selected: inst.selected || false,
				filters: {},
				simulations: {}
			}
			//Adiciona na lista em memória
			this.instancias.push(new_inst);
			//Reconstroi o HTML
			rebuild__instanciasArcabouco_HTML();
			Global.browserStorage__Sync.set('instancias', this.instancias, 'localStorage');
			return true;
		},
		//Atualiza os 'filters' da instancia selecionada
		updateInstancia_Filters: function (key, value){
			for (let i in this.instancias){
				if (this.instancias[i].selected){
					if (value !== '')
						this.instancias[i]['filters'][key] = value;
					else
						delete this.instancias[i]['filters'][key];
				}
			}
			Global.browserStorage__Sync.set('instancias', this.instancias, 'localStorage');
		},
		//Atualiza os 'simulations' da instancia selecionada
		updateInstancia_Simulations: function (key, value){
			for (let i in this.instancias){
				if (this.instancias[i].selected){
					if (value !== '')
						this.instancias[i]['simulations'][key] = value;
					else
						delete this.instancias[i]['simulations'][key];
					break;
				}
			}
			Global.browserStorage__Sync.set('instancias', this.instancias, 'localStorage');
		},
		//Atualiza todas as instancias de um arcabouço da lista
		updateArcabouco_Info: function (id_arcabouco){
			let was_updated = false;
			for (let i in this.instancias){
				if (this.instancias[i].id == id_arcabouco){
					this.instancias[i].nome = _lista__arcaboucos.arcaboucos[id_arcabouco].nome;
					was_updated = true;
				}
			}
			if (was_updated){
				rebuild__instanciasArcabouco_HTML();
				Global.browserStorage__Sync.set('instancias', this.instancias, 'localStorage');
			}
		},
		//Remove uma instancia espeficica da lista
		remove: function (id_inst){
			for (let i in this.instancias){
				if (this.instancias[i].instancia == id_inst){
					//Não remover instancias selecionadas
					if (this.instancias[i].selected)
						return true;
					this.instancias.splice(i, 1);
				}
			}
			//Atualiza as cores
			for (let i in this.instancias)
				this.instancias[i].color = this.colors.class[i];
			rebuild__instanciasArcabouco_HTML();
			Global.browserStorage__Sync.set('instancias', this.instancias, 'localStorage');
		},
		//Remove todas as instancias de um arcabouço da lista (Seleciona a próxima 1° da lista)
		removeAll_by_idArcabouco: function (id_arcabouco){
			let was_removed = false;
			for (let i in this.instancias){
				if (this.instancias[i].id == id_arcabouco){
					this.instancias.splice(i, 1);
					was_removed = true;
				}
			}
			if (was_removed){
				//Seleciona a nova primeira da lista se houver
				if (this.instancias.length)
					this.instancias[0].selected = true;
				rebuild__instanciasArcabouco_HTML();
				Global.browserStorage__Sync.set('instancias', this.instancias, 'localStorage');
				return true;
			}
			return false;
		}
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------ Lista Arcabouços --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	//Funcoes usadas em '_arcabouco__table_DT'
	let _arcabouco__table_DT_ext = {
		situacao_render: function (data, type, row){
			let iData = ``;
			//Fechado
			if (data == 1)
				iData = `<i class="fas fa-circle fechado"></i>`;
			//Pendente
			else if (data == 2)
				iData = `<i class="fas fa-circle pendente"></i>`;
			//Fazendo
			else if (data == 3)
				iData = `<i class="fas fa-circle fazendo"></i>`;
			return (type === 'display') ? iData : data;
		},
		tipo_render: function (data, type, row){
			let iData = ``;
			//Live
			if (data == 1)
				iData = `<i class="fas fa-microphone"></i>`;
			//Replay
			else if (data == 2)
				iData = `<i class="fas fa-video"></i>`;
			//Paper Trade
			else if (data == 3)
				iData = `<i class="fas fa-sticky-note"></i>`;
			return (type === 'display') ? iData : data;
		}
	}
	//Configuração da tabela de arcabouços em 'arcabouco_modal'
	let _arcabouco__table_DT = {
		columns: [
			{name: 'situacao', orderable: false, render: _arcabouco__table_DT_ext.situacao_render},
			{name: 'tipo', orderable: false, render: _arcabouco__table_DT_ext.tipo_render},
			{name: 'nome', orderable: true},
			{name: 'data_criacao', orderable: true, type: 'br-date'},
			{name: 'data_atualizacao', orderable: true, type: 'br-date'},
			{name: 'qtd_ops', orderable: true},
			{name: 'usuarios', orderable: false},
			{name: 'editar', orderable: false},
			{name: 'remover', orderable: false}
		],
		lengthChange: false,
		order: [[ 2, 'desc' ]],
		pageLength: 25,
		pagingType: 'input'
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*-------------------------- Section Operações Upload ----------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Realiza a abertura e leitura do arquivo csv. (Importar operações)
	*/
	let _csv_reader = {
		reader: new FileReader(),
		processData: function (allText, options){
		 	let allTextLines = allText.split(/\r\n|\n/),
		 		lines = [];
		    if (options.file_format === 'excel' || options.file_format === 'profit'){
			    for (let i=0; i<allTextLines.length; i++)
		            lines.push(allTextLines[i].split(';'));
		    }
		    else if (options.file_format === 'tryd'){
		    	for (let i=0; i<allTextLines.length; i++){
		    		let broken_lines = allTextLines[i].split("\",\"");
		    		if (broken_lines.length > 1){
			    		broken_lines[0] = broken_lines[0].replace(/^\"/, '');
			    		broken_lines[broken_lines.length-1] = broken_lines[broken_lines.length-1].replace(/\",?/, '');
			            lines.push(broken_lines);
		    		}
		    	}
		    }
	        return lines;
		},
		cleanData: function (obj, options){
			let newData = [],
				dataMap = [],
				data_limit = -1;
			for (let line=0; line<obj.length; line++){
				if (options.file_format === 'excel'){
					//Primeira linha Header do arquivo (Deve ser Data, para identificacao do Header)
					if (obj[line][0] === 'Data'){
						data_limit = obj[line].length;
						for (let a=0; a<obj[line].length; a++)
							dataMap[a] = obj[line][a];
					}
					else if (obj[line].length === data_limit){
						let operacao = ((dataMap.indexOf('Op') !== -1) ? obj[line][dataMap.indexOf('Op')].toLowerCase() : '');
						newData.push({
							ativo: obj[line][dataMap.indexOf('Ativo')],
							op: ((operacao === '') ? 0 : (operacao === 'c') ? 1 : 2),
							rr: obj[line][dataMap.indexOf('R:R')],
							vol: ((dataMap.indexOf('Vol') !== -1) ? (obj[line][dataMap.indexOf('Vol')].replace(/\.+/g, '')).replace(/\,+/g, '.') : ''),
							cts: obj[line][dataMap.indexOf('Cts')],
							cenario: obj[line][dataMap.indexOf('Padrao')],
							premissas: ((dataMap.indexOf('Premissas') !== -1) ? obj[line][dataMap.indexOf('Premissas')].split(',') : []),
							observacoes: ((dataMap.indexOf("Observacoes") !== -1)?obj[line][dataMap.indexOf("Observacoes")].split(',') : []),
							erro: ((dataMap.indexOf('Erro') !== -1) ? obj[line][dataMap.indexOf('Erro')] : ''),
							data: obj[line][dataMap.indexOf('Data')],
							hora: obj[line][dataMap.indexOf('Hora')],
							entrada: ((dataMap.indexOf('Entrada') !== -1) ? (obj[line][dataMap.indexOf('Entrada')].replace(/\.+/g, '')).replace(/\,+/g, '.') : ''),
							stop: ((dataMap.indexOf('Stop') !== -1) ? (obj[line][dataMap.indexOf('Stop')].replace(/\.+/g, '')).replace(/\,+/g, '.') : ''),
							alvo: ((dataMap.indexOf('') !== -1) ? (obj[line][dataMap.indexOf('Alvo')].replace(/\.+/g, '')).replace(/\,+/g, '.') : ''),
							men: ((dataMap.indexOf('Men') !== -1) ? (obj[line][dataMap.indexOf('Men')].replace(/\.+/g, '')).replace(/\,+/g, '.') : ''),
							mep: ((dataMap.indexOf('Mep') !== -1) ? (obj[line][dataMap.indexOf('Mep')].replace(/\.+/g, '')).replace(/\,+/g, '.') : ''),
							saida: ((dataMap.indexOf('Saida') !== -1) ? (obj[line][dataMap.indexOf('Saida')].replace(/\.+/g, '')).replace(/\,+/g, '.') : '')
						});
					}
				}
				else if (options.file_format === 'profit'){
					//Primeira coluna do cabecalho (Subconta) ou (Ativo)
					if (obj[line][0] === 'Ativo'){
						data_limit = obj[line].length;
						for (let a=0; a<obj[line].length; a++)
							dataMap[a] = obj[line][a];
					}
					else if (obj[line].length === data_limit){
						let operacao = obj[line][dataMap.indexOf('Lado')],
							preco_compra = parseFloat((obj[line][dataMap.indexOf('Preço Compra')].replace(/\.+/g, '')).replace(/\,+/g, '.')),
							preco_venda = parseFloat((obj[line][dataMap.indexOf('Preço Venda')].replace(/\.+/g, '')).replace(/\,+/g, '.')),
							mep = parseFloat((obj[line][dataMap.indexOf('MEP')].replace(/\.+/g, '')).replace(/\,+/g, '.')),
							men = parseFloat((obj[line][dataMap.indexOf('MEN')].replace(/\.+/g, '')).replace(/\,+/g, '.'));
						if (options.table_layout === 'scalp'){
							newData.push({
								ativo: obj[line][dataMap.indexOf('Ativo')],
								op: ((operacao === 'C') ? 1 : 2),
								rr: '',
								vol: '',
								//Profit mostra Qtd Compra e Qtd Venda. Em uma Compra eu quero saber quando eu vendi (qtd. de saída). Em uma Venda o contrário.
								cts: ((operacao === 'C') ? obj[line][dataMap.indexOf('Qtd Venda')] : obj[line][dataMap.indexOf('Qtd Compra')]),
								cenario: '',
								premissas: [],
								observacoes: [],
								erro: '',
								data: obj[line][dataMap.indexOf('Abertura')].split(' ')[0],
								hora: obj[line][dataMap.indexOf('Abertura')].split(' ')[1],
								entrada: ((operacao === 'C') ? preco_compra : preco_venda),
								stop: '',
								alvo: '',
								men: ((operacao === 'C') ? (preco_compra - Math.abs(men)) : (preco_venda + Math.abs(men))),
								mep: ((operacao === 'C') ? (preco_compra + Math.abs(men)) : (preco_venda - Math.abs(men))),
								saida: ((operacao === 'C') ? preco_venda : preco_compra)
							});
						}
					}
				}
				else if (options.file_format === 'tryd'){
					//Primeira coluna do cabecalho (Papel)
					if (obj[line][0] === 'Papel'){
						data_limit = obj[line].length;
						for (let a=0; a<obj[line].length; a++)
							dataMap[a] = obj[line][a];
					}
					else if (obj[line].length === data_limit){
						let operacao = obj[line][dataMap.indexOf('C/V')],
							preco_compra = (obj[line][dataMap.indexOf('Prc Médio Cpa')].replace(/\.+/g, '')).replace(/\,+/g, '.'),
							preco_venda = (obj[line][dataMap.indexOf('Prc Médio Vda')].replace(/\.+/g, '')).replace(/\,+/g, '.');
						if (options.table_layout === 'scalp'){
							newData.push({
								ativo: obj[line][dataMap.indexOf('Papel')],
								op: ((operacao === 'C') ? 1 : 2),
								rr: '',
								vol: '',
								cts: obj[line][dataMap.indexOf('Qtd')],
								cenario: '',
								premissas: [],
								observacoes: [],
								erro: '',
								data: obj[line][dataMap.indexOf('Data')],
								hora: obj[line][dataMap.indexOf('Abertura')],
								entrada: ((operacao === 'C') ? preco_compra : preco_venda),
								stop: '',
								alvo: '',
								men: obj[line][dataMap.indexOf('MEN')],
								mep: obj[line][dataMap.indexOf('MEP')],
								saida: ((operacao === 'C') ? preco_venda : preco_compra)
							});
						}
					}
				}
			}
			return newData;
		}
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*--------------------------------- Lista Ops ------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	//Informa se o 'list_ops' precisa ser reconstruido
	let _list_ops__needRebuild = false;
	//Variavel usada no controle de click, para saber se está pressionado o click ou não
	let _lista_ops__table_DT_clickState = 0;
	//Possui os filtros usados em 'lista_ops__search'
	let _lista_ops__search = {
		filters: {
			data: null,
			ativo: null,
			cenario: null
		},
		update: function (){
			let me = this,
				lista_ops__search = $(document.getElementById('lista_ops__search')),
				selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id');
			//////////////////////////////////
			//Filtro da Data
			//////////////////////////////////
			let	data_inicial = (_lista__operacoes.operacoes[selected_inst_arcabouco].length) ? Global.convertDate(_lista__operacoes.operacoes[selected_inst_arcabouco][0].data) : moment().format('DD/MM/YYYY'),
				data_final = (_lista__operacoes.operacoes[selected_inst_arcabouco].length) ? Global.convertDate(_lista__operacoes.operacoes[selected_inst_arcabouco][_lista__operacoes.operacoes[selected_inst_arcabouco].length-1].data) : data_inicial;
			if (me.filters.data === null){
				me.filters.data = lista_ops__search.find('input[name="data"]');
				me.filters.data.on('apply.daterangepicker', function (ev, picker){
					$(document.getElementById("lista_ops__table")).DataTable().draw();
				});
				me.filters.data.daterangepicker({
					showDropdowns: true,
					minDate: data_inicial,
					startDate: data_inicial,
					endDate: data_final,
					maxDate: data_final,
					locale: {
						format: 'DD/MM/YYYY',
						separator: ' - ',
						applyLabel: 'Aplicar',
						cancelLabel: 'Cancelar',
						fromLabel: 'De',
						toLabel: 'Até',
						customRangeLabel: 'Custom',
						weekLabel: 'S',
						daysOfWeek: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
						monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
					}
				});
			}
			else{
				me.filters.data.data('daterangepicker').minDate = moment(data_inicial, 'DD/MM/YYYY');
				me.filters.data.data('daterangepicker').maxDate = moment(data_final, 'DD/MM/YYYY');
				me.filters.data.data('daterangepicker').setStartDate(data_inicial);
				me.filters.data.data('daterangepicker').setEndDate(data_final);
			}
			//////////////////////////////////
			//Filtro do Ativo
			//////////////////////////////////
			let ativos_in_operacoes = {},
				select_options_html = '';
			for (let op in _lista__operacoes.operacoes[selected_inst_arcabouco])
				ativos_in_operacoes[_lista__operacoes.operacoes[selected_inst_arcabouco][op].ativo] = null;
			select_options_html = (Object.keys(ativos_in_operacoes)).reduce((p, c) => p + `<option value="${c}">${c}</option>`, '');
			if (me.filters.ativo === null){
				me.filters.ativo = lista_ops__search.find('select[name="ativo"]');
				me.filters.ativo.append(select_options_html).promise().then(function (){
					me.filters.ativo.selectpicker({
						title: 'Ativo',
						selectedTextFormat: 'count > 1',
						actionsBox: true,
						deselectAllText: 'Nenhum',
						selectAllText: 'Todos',
						liveSearch: true,
						liveSearchNormalize: true,
						style: '',
						styleBase: 'form-control form-control-sm'
					}).on('loaded.bs.select', function (){
						me.filters.ativo.parent().addClass('form-control');
					}).on('changed.bs.select', function (){
						$(document.getElementById("lista_ops__table")).DataTable().draw();
					});
				});
			}
			else{
				me.filters.ativo.empty().append(select_options_html).promise().then(function (){
					me.filters.ativo.selectpicker('refresh');
				});
			}
			//////////////////////////////////
			//Filtro de Cenario
			//////////////////////////////////
			select_options_html = Object.values(_lista__cenarios.cenarios[selected_inst_arcabouco]).reduce((p, c) => p + `<option value="${c.nome}">${c.nome}</option>`, '');
			if (me.filters.cenario === null){
				me.filters.cenario = lista_ops__search.find('select[name="cenario"]');
				me.filters.cenario.append(select_options_html).promise().then(function (){
					me.filters.cenario.selectpicker({
						title: 'Cenários',
						selectedTextFormat: 'count > 2',
						actionsBox: true,
						deselectAllText: 'Nenhum',
						selectAllText: 'Todos',
						liveSearch: true,
						liveSearchNormalize: true,
						style: '',
						styleBase: 'form-control form-control-sm'
					}).on('loaded.bs.select', function (){
						me.filters.cenario.parent().addClass('form-control');
					}).on('changed.bs.select', function (){
						$(document.getElementById("lista_ops__table")).DataTable().draw();
					});
				});
			}
			else{
				me.filters.cenario.empty().append(select_options_html).promise().then(function (){
					me.filters.cenario.selectpicker('refresh');
				});
			}
		}
	}
	//Funcoes usadas em '_lista_ops__table_DT'
	let _lista_ops__table_DT_ext = {
		vol_render: function (data, type, row){
			return (type === 'display') ? ((data == 0) ? '' : $.fn.dataTable.render.number( '.', '', 0, '').display(data)) : data;
		},
		error_render: function (data, type, row){
			return (type === 'display') ? ((data == 1) ? `<i class="fas fa-exclamation-triangle text-warning"></i>` : ``) : data;
		}
	}
	//Configuração da tabela de operações em 'lista_ops'
	let _lista_ops__table_DT = {
		columns: [
			{name: 'id', orderable: true},
			{name: 'data', orderable: true, type: 'br-date'},
			{name: 'hora', orderable: true},
			{name: 'ativo', orderable: true},
			{name: 'op', orderable: false},
			{name: 'vol', orderable: true, render: _lista_ops__table_DT_ext.vol_render},
			{name: 'cenario', orderable: true},
			{name: 'erro', orderable: true, render: _lista_ops__table_DT_ext.error_render}
		],
		lengthChange: false,
		columnDefs: [{
			targets: [1],
			orderData: [1, 2]
		}],
		order: [[ 0, 'desc' ]],
		pageLength: 25,
		pagingType: 'input'
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*-------------------------------- Dashboard Ops ---------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	//Informa se o 'dashboard_ops' precisa ser reconstruido
	let _dashboard_ops__needRebuild = false;
	//Controla qual seção do dashboard_opst mostrar 'data', 'empty' ou 'building'
	let _dashboard_ops__section = {
		sections: {'data': 2, 'empty': 0, 'building': 0},
		show: function (section_target, step = 0){
			if (step === this.sections[section_target]){
				$(document.getElementById('dashboard_ops__section')).find('> div[target]').each(function (){
					$(this).toggleClass('d-none', this.getAttribute('target') !== section_target);
				});
			}
		}
	}
	//Possui os 'filters' e 'simulation' usados em 'dashboard_ops__search'
	let _dashboard_ops__search = {
		filters: {
			data: null,
			hora: null,
			ativo: null,
			cenario: null,
			premissas: null,
			observacoes: null
		},
		simulations: {
			periodo_calc: null,
			tipo_cts: null,
			cts: null,
			usa_custo: null,
			ignora_erro: null,
			valor_inicial: null,
			R: null
		},
		init: function (){
			let me = this,
				dashboard_ops__search = $(document.getElementById('dashboard_ops__search')),
				selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
				dashboard_filters = _lista__instancias_arcabouco.getSelected('filters'),
				dashboard_simulations = _lista__instancias_arcabouco.getSelected('simulations');
			//////////////////////////////////
			//Filtro da Data
			//////////////////////////////////
			let	data_inicial = (_lista__operacoes.operacoes[selected_inst_arcabouco].length) ? Global.convertDate(_lista__operacoes.operacoes[selected_inst_arcabouco][0].data) : moment().format('DD/MM/YYYY'),
				data_final = (_lista__operacoes.operacoes[selected_inst_arcabouco].length) ? Global.convertDate(_lista__operacoes.operacoes[selected_inst_arcabouco][_lista__operacoes.operacoes[selected_inst_arcabouco].length-1].data) : data_inicial;
			me.filters.data = dashboard_ops__search.find('input[name="data"]');
			me.filters.data.on('apply.daterangepicker', function (ev, picker){
				_lista__instancias_arcabouco.updateInstancia_Filters('data_inicial', picker.startDate.format('DD/MM/YYYY'));
				_lista__instancias_arcabouco.updateInstancia_Filters('data_final', picker.endDate.format('DD/MM/YYYY'));
			});
			me.filters.data.daterangepicker({
				showDropdowns: true,
				minDate: data_inicial,
				startDate: ('data_inicial' in dashboard_filters) ? dashboard_filters['data_inicial'] : data_inicial,
				endDate: ('data_final' in dashboard_filters) ? dashboard_filters['data_final'] : data_final,
				maxDate: data_final,
				locale: {
					format: 'DD/MM/YYYY',
					separator: ' - ',
					applyLabel: 'Aplicar',
					cancelLabel: 'Cancelar',
					fromLabel: 'De',
					toLabel: 'Até',
					customRangeLabel: 'Custom',
					weekLabel: 'S',
					daysOfWeek: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
					monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
				}
			});
			//////////////////////////////////
			//Filtro da Hora
			//////////////////////////////////
			me.filters.hora = dashboard_ops__search.find('div[name="hora"]');
			noUiSlider.create(me.filters.hora[0], {
				connect: true,
				range: {
					'min': new Date('2000-01-01 09:00:00').getTime(),
					'max': new Date('2000-01-01 18:00:00').getTime()
				},
				step: 60 * 60 * 1000,
				start: [
					('hora_inicial' in dashboard_filters) ? new Date(`2000-01-01 ${dashboard_filters['hora_inicial']}`).getTime() : new Date('2000-01-01 09:00:00').getTime(),
					('hora_final' in dashboard_filters) ? new Date(`2000-01-01 ${dashboard_filters['hora_final']}`).getTime() : new Date('2000-01-01 18:00:00').getTime()
				],
				tooltips: {
					to: ((value) => moment(value).format('HH:mm'))
				}
			});
			me.filters.hora[0].noUiSlider.on('change', function (values, handle, unencoded, isTap, positions){
				let handle_dic = ['hora_inicial', 'hora_final'];
				_lista__instancias_arcabouco.updateInstancia_Filters(handle_dic[handle], moment(parseInt(values[handle])).format('HH:mm'));
			});
			//////////////////////////////////
			//Filtro do Ativo
			//////////////////////////////////
			let ativos_in_operacoes = {},
				select_options_html = '';
			for (let op in _lista__operacoes.operacoes[selected_inst_arcabouco])
				ativos_in_operacoes[_lista__operacoes.operacoes[selected_inst_arcabouco][op].ativo] = null;
			select_options_html = (Object.keys(ativos_in_operacoes)).reduce((p, c) => p + `<option value="${c}" ${(('ativo' in dashboard_filters && dashboard_filters['ativo'].includes(c)) ? 'selected' : '' )}>${c}</option>`, '');
			me.filters.ativo = dashboard_ops__search.find('select[name="ativo"]');
			me.filters.ativo.append(select_options_html).promise().then(function (){
				me.filters.ativo.selectpicker({
					title: 'Ativo',
					selectedTextFormat: 'count > 1',
					actionsBox: true,
					deselectAllText: 'Nenhum',
					selectAllText: 'Todos',
					liveSearch: true,
					liveSearchNormalize: true,
					style: '',
					styleBase: 'form-control form-control-sm'
				}).on('loaded.bs.select', function (){
					me.filters.ativo.parent().addClass('form-control');
				}).on('changed.bs.select', function (){
					_lista__instancias_arcabouco.updateInstancia_Filters('ativo', $(this).val());
				});
			});
			//////////////////////////////////
			//Filtro de Cenario
			//////////////////////////////////
			select_options_html = Object.values(_lista__cenarios.cenarios[selected_inst_arcabouco]).reduce((p, c) => p + `<option value="${c.id}" ${(('cenario' in dashboard_filters && c.nome in dashboard_filters['cenario']) ? 'selected' : '' )}>${c.nome}</option>`, '');
			me.filters.cenario = dashboard_ops__search.find('select[name="cenario"]');
			me.filters.cenario.append(select_options_html).promise().then(function (){
				me.filters.cenario.selectpicker({
					title: 'Cenários',
					selectedTextFormat: 'count > 2',
					actionsBox: true,
					deselectAllText: 'Nenhum',
					selectAllText: 'Todos',
					liveSearch: true,
					liveSearchNormalize: true,
					style: '',
					styleBase: 'form-control form-control-sm'
				}).on('loaded.bs.select', function (){
					me.filters.cenario.parent().addClass('form-control');
				}).on('changed.bs.select', function (){
					let dashboard_filters = _lista__instancias_arcabouco.getSelected('filters'),
						localStorage_data = {};
					$(this).find('option:selected').each(function (i, el){
						localStorage_data[el.innerText] = {
							id: this.value,
							premissas: ('cenario' in dashboard_filters && el.innerText in dashboard_filters['cenario']) ? dashboard_filters['cenario'][el.innerText]['premissas'] : {},
							observacoes: ('cenario' in dashboard_filters && el.innerText in dashboard_filters['cenario']) ? dashboard_filters['cenario'][el.innerText]['observacoes'] : {}
						}
					});
					_lista__instancias_arcabouco.updateInstancia_Filters('cenario', localStorage_data);
					rebuildSelect_PremissasOuObservacoes__content(_dashboard_ops__search.filters.premissas, _lista__instancias_arcabouco.getSelected('id'));
					rebuildSelect_PremissasOuObservacoes__content(_dashboard_ops__search.filters.observacoes, _lista__instancias_arcabouco.getSelected('id'));
				});
			});
			//////////////////////////////////
			//Filtro de Observacoes
			//////////////////////////////////
			me.filters.premissas = dashboard_ops__search.find('div[name="premissas"]');
			rebuildSelect_PremissasOuObservacoes__content(me.filters.premissas, selected_inst_arcabouco);
			//////////////////////////////////
			//Filtro de Observacoes
			//////////////////////////////////
			me.filters.observacoes = dashboard_ops__search.find('div[name="observacoes"]');
			rebuildSelect_PremissasOuObservacoes__content(me.filters.observacoes, selected_inst_arcabouco);
			//////////////////////////////////
			//Simulação de Periodo de Calculo
			//////////////////////////////////
			me.simulations.periodo_calc = dashboard_ops__search.find('select[name="periodo_calc"]');
			me.simulations.periodo_calc.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, $(this).val());
			});
			if ('periodo_calc' in dashboard_simulations)
				me.simulations.periodo_calc.val(dashboard_simulations['periodo_calc']);
			//////////////////////////////////
			//Simulação de Tipo Cts e Cts
			//////////////////////////////////
			me.simulations.tipo_cts = dashboard_ops__search.find('select[name="tipo_cts"]');
			me.simulations.tipo_cts.change(function (){
				let value = $(this).val();
				if (value === '1' || value === '3'){
					me.simulations.cts.val('').prop('disabled', true);
					_lista__instancias_arcabouco.updateInstancia_Simulations('cts', '');
				}
				else
					me.simulations.cts.prop('disabled', false);
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, value);
			});
			me.simulations.cts = dashboard_ops__search.find('input[name="cts"]');
			me.simulations.cts.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, $(this).val());
			});
			if ('tipo_cts' in dashboard_simulations)
				me.simulations.tipo_cts.val(dashboard_simulations['tipo_cts']);
			if ('cts' in dashboard_simulations)
				me.simulations.cts.val(dashboard_simulations['cts']);
			me.simulations.cts.inputmask({alias: 'numeric', digitsOptional: false, digits: 0, rightAlign: false, placeholder: '0'});
			//////////////////////////////////
			//Simulação de Usa Custos
			//////////////////////////////////
			me.simulations.usa_custo = dashboard_ops__search.find('select[name="usa_custo"]');
			me.simulations.usa_custo.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, $(this).val());
			});
			if ('usa_custo' in dashboard_simulations)
				me.simulations.usa_custo.val(dashboard_simulations['usa_custo']);
			//////////////////////////////////
			//Simulação de Ignora Erros
			//////////////////////////////////
			me.simulations.ignora_erro = dashboard_ops__search.find('select[name="ignora_erro"]');
			me.simulations.ignora_erro.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, $(this).val());
			});
			if ('ignora_erro' in dashboard_simulations)
				me.simulations.ignora_erro.val(dashboard_simulations['ignora_erro']);
			//////////////////////////////////
			//Simulação de Simular Capital
			//////////////////////////////////
			me.simulations.valor_inicial = dashboard_ops__search.find('input[name="valor_inicial"]');
			me.simulations.valor_inicial.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, $(this).val());
			});
			if ('valor_inicial' in dashboard_simulations)
				me.simulations.valor_inicial.val(dashboard_simulations['valor_inicial']);
			me.simulations.valor_inicial.inputmask({alias: 'numeric', digitsOptional: false, digits: 2, rightAlign: false, placeholder: '0'});
			//////////////////////////////////
			//Simulação de Simular R
			//////////////////////////////////
			me.simulations.R = dashboard_ops__search.find('input[name="R"]');
			me.simulations.R.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, $(this).val());
			});
			if ('R' in dashboard_simulations)
				me.simulations.R.val(dashboard_simulations['R']);
			me.simulations.R.inputmask({alias: 'numeric', digitsOptional: false, digits: 2, rightAlign: false, placeholder: '0'});
		},
		update: function (){
			let me = this,
				selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
				dashboard_filters = _lista__instancias_arcabouco.getSelected('filters'),
				dashboard_simulations = _lista__instancias_arcabouco.getSelected('simulations');
			//////////////////////////////////
			//Filtro da Data
			//////////////////////////////////
			let	data_inicial = ('data_inicial' in dashboard_filters) ? dashboard_filters['data_inicial'] : ((_lista__operacoes.operacoes[selected_inst_arcabouco].length) ? Global.convertDate(_lista__operacoes.operacoes[selected_inst_arcabouco][0].data) : moment().format('DD/MM/YYYY')),
				data_final = ('data_final' in dashboard_filters) ? dashboard_filters['data_final'] : ((_lista__operacoes.operacoes[selected_inst_arcabouco].length) ? Global.convertDate(_lista__operacoes.operacoes[selected_inst_arcabouco][_lista__operacoes.operacoes[selected_inst_arcabouco].length-1].data) : data_inicial);
			me.filters.data.data('daterangepicker').minDate = moment(data_inicial, 'DD/MM/YYYY');
			me.filters.data.data('daterangepicker').maxDate = moment(data_final, 'DD/MM/YYYY');
			me.filters.data.data('daterangepicker').setStartDate(data_inicial);
			me.filters.data.data('daterangepicker').setEndDate(data_final);
			//////////////////////////////////
			//Filtro da Hora
			//////////////////////////////////
			let hora_inicial = ('hora_inicial' in dashboard_filters) ? new Date(`2000-01-01 ${dashboard_filters['hora_inicial']}`).getTime() : new Date('2000-01-01 09:00:00').getTime(),
				hora_final = ('hora_final' in dashboard_filters) ? new Date(`2000-01-01 ${dashboard_filters['hora_final']}`).getTime() : new Date('2000-01-01 18:00:00').getTime();
			me.filters.hora[0].noUiSlider.set([hora_inicial, hora_final]);
			//////////////////////////////////
			//Filtro do Ativo
			//////////////////////////////////
			let ativos_in_operacoes = {},
				select_options_html = '';
			for (let op in _lista__operacoes.operacoes[selected_inst_arcabouco])
				ativos_in_operacoes[_lista__operacoes.operacoes[selected_inst_arcabouco][op].ativo] = null;
			select_options_html = (Object.keys(ativos_in_operacoes)).reduce((p, c) => p + `<option value="${c}" ${(('ativo' in dashboard_filters && dashboard_filters['ativo'].includes(c)) ? 'selected' : '' )}>${c}</option>`, '');
			me.filters.ativo.empty().append(select_options_html).promise().then(function (){
				me.filters.ativo.selectpicker('refresh');
			});
			//////////////////////////////////
			//Filtro de Cenario
			//////////////////////////////////
			select_options_html = Object.values(_lista__cenarios.cenarios[selected_inst_arcabouco]).reduce((p, c) => p + `<option value="${c.id}" ${(('cenario' in dashboard_filters && c.nome in dashboard_filters['cenario']) ? 'selected' : '' )}>${c.nome}</option>`, '');
			me.filters.cenario.empty().append(select_options_html).promise().then(function (){
				me.filters.cenario.selectpicker('refresh');
			});
			//////////////////////////////////
			//Filtro de Observacoes
			//////////////////////////////////
			rebuildSelect_PremissasOuObservacoes__content(me.filters.premissas, selected_inst_arcabouco);
			//////////////////////////////////
			//Filtro de Observacoes
			//////////////////////////////////
			rebuildSelect_PremissasOuObservacoes__content(me.filters.observacoes, selected_inst_arcabouco);
			//////////////////////////////////
			//Simulação de Periodo de Calculo
			//////////////////////////////////
			if ('periodo_calc' in dashboard_simulations)
				me.simulations.periodo_calc.val(dashboard_simulations['periodo_calc']);
			else
				me.simulations.periodo_calc[0].selectedIndex = 0;
			//////////////////////////////////
			//Simulação de Tipo Cts e Cts
			//////////////////////////////////
			if ('tipo_cts' in dashboard_simulations)
				me.simulations.tipo_cts.val(dashboard_simulations['tipo_cts']);
			else
				me.simulations.tipo_cts[0].selectedIndex = 0;
			if ('cts' in dashboard_simulations)
				me.simulations.cts.val(dashboard_simulations['cts']).prop('disabled', false);
			else
				me.simulations.cts.val('').prop('disabled', true);
			//////////////////////////////////
			//Simulação de Usa Custos
			//////////////////////////////////
			if ('usa_custo' in dashboard_simulations)
				me.simulations.usa_custo.val(dashboard_simulations['usa_custo']);
			else
				me.simulations.usa_custo[0].selectedIndex = 0;
			//////////////////////////////////
			//Simulação de Ignora Erros
			//////////////////////////////////
			if ('ignora_erro' in dashboard_simulations)
				me.simulations.ignora_erro.val(dashboard_simulations['ignora_erro']);
			else
				me.simulations.ignora_erro[0].selectedIndex = 0;
			//////////////////////////////////
			//Simulação de Simular Capital
			//////////////////////////////////
			me.simulations.valor_inicial.val((('valor_inicial' in dashboard_simulations) ? dashboard_simulations['valor_inicial'] : ''));
			//////////////////////////////////
			//Simulação de Simular R
			//////////////////////////////////
			me.simulations.R.val((('R' in dashboard_simulations) ? dashboard_simulations['R'] : ''));
		}
	}
	let _dashboard_ops__elements = {
		tables: {
			dashboard_ops__table_stats__byCenario: null,
			dashboard_ops__table_trades: null
		},
		charts: {
			dashboard_ops__chart_resultadoNormalizado: null,
			dashboard_ops__chart_resultadoPorHorario: null,
			dashboard_ops__chart_evolucaoPatrimonial: null
		},
		ext: {
			color: function (){
				return (ctx) => { return (ctx.parsed.y > 0) ? '#198754' : ((ctx.parsed.y < 0) ? '#dc3545' : '#ced4da'); }
			}
		}
	}
	//Funcoes usadas em '_dashboard_ops__table_trades_DT'
	let _dashboard_ops__table_trades_DT_ext = {
		trade__custo: function (data, type, row){
			return (type === 'display') ? $.fn.dataTable.render.number( '', '.', 2, 'R$ ').display(data) : data;
		},
		result__R: function (data, type, row){
			let rendered_num = $.fn.dataTable.render.number( '', '.', 3, '', 'R').display(data),
				color = ((data !== '--' && data > 0) ? 'text-success' : ((data !== '--' && data < 0) ? 'text-danger' : ''));
			return (type === 'display') ? ((data !== '--') ? `<span class="${color}">${rendered_num}</span>` : data) : data;
		},
		result__brl: function (data, type, row){
			let rendered_num = $.fn.dataTable.render.number( '', '.', 2, 'R$ ').display(data),
				color = ((data > 0) ? 'text-success' : ((data < 0) ? 'text-danger' : ''));
			return (type === 'display') ? `<span class="${color}">${rendered_num}</span>` : data;
		},
		men__porc_render: function (data, type, row){
			return (type === 'display') ? `<progress class="mx-3" value="${data}" max="100"></progress>` : data;
		},
		mep__porc_render: function (data, type, row){
			return (type === 'display') ? `<progress class="mx-3" value="${data}" max="100"></progress>` : data;
		}
	}
	//Configuração da tabela de operações em 'lista_ops'
	let _dashboard_ops__table_trades_DT = {
		columns: [
			{name: 'trade__seq', orderable: true},
			{name: 'trade__data', orderable: true, type: 'br-date'},
			{name: 'trade__cenario', orderable: true},
			{name: 'trade__custo', orderable: true, render: _dashboard_ops__table_trades_DT_ext.trade__custo},
			{name: 'result__brl', orderable: true, render: _dashboard_ops__table_trades_DT_ext.result__brl},
			{name: 'result__R', orderable: true, render: _dashboard_ops__table_trades_DT_ext.result__R},
			{name: 'men__porc', orderable: true, render: _dashboard_ops__table_trades_DT_ext.men__porc_render},
			{name: 'mep__porc', orderable: true, render: _dashboard_ops__table_trades_DT_ext.mep__porc_render}
		],
		lengthChange: false,
		info: false,
		dom: '<"container-fluid p-0"<"row"<"col-12"<"card rounded-3 shadow-sm"<"card-body py-2 d-flex justify-content-between align-items-center head"fp>>>><"row mt-2"<"col-12"<"card rounded-3 shadow-sm"<"card-body body"t>>>>>',
		order: [[ 0, 'desc' ]],
		pageLength: 12,
		pagingType: 'input'
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------------- FUNCOES ------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------- Section Arcabouço --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Reconstroi a lista de instacia em 'renda_variavel__instancias'.
	*/
	function rebuild__instanciasArcabouco_HTML(){
		let html = ``;
		for (let i in _lista__instancias_arcabouco.instancias)
			html += `<span class="badge badge-primary rounded-pill p-2 ${((i > 0) ? 'ms-2' : '')}" style="background-color: var(${_lista__instancias_arcabouco.instancias[i].color}) !important" instancia="${_lista__instancias_arcabouco.instancias[i].instancia}">${((_lista__instancias_arcabouco.instancias[i].selected) ? `<i class="fas fa-crown me-2"></i>` : '')}${_lista__instancias_arcabouco.instancias[i].nome}</span>`;
		$(document.getElementById('renda_variavel__instancias')).empty().append(html);
	}
	/*
		Inicia ou reinicia a seção de 'filters' e 'simulation' em 'dashboard_ops__search' de acordo com a instancia de arcabouço selecionada.
		Inicia ou reinicia a seção de 'dashboard_ops' ou 'lista_ops' da instancia de arcabouço selecionada.
	*/
	function rebuildArcaboucoSection(rebuildSearch = false){
		let selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
			html = ``;
		//////////////////////////////////
		//Seção de 'filters' e 'simulations'
		//////////////////////////////////
		if (rebuildSearch)
			_dashboard_ops__search.update();
		//////////////////////////////////
		//Seção de 'dashboard_ops'
		//////////////////////////////////
		_dashboard_ops__section.show('building');
		if (selected_inst_arcabouco in _lista__operacoes.operacoes && _lista__operacoes.operacoes[selected_inst_arcabouco].length > 0){
			let finish_building = 0,
				dashboard_data = RV_Statistics.generate(_lista__operacoes.operacoes[selected_inst_arcabouco], _lista__instancias_arcabouco.getSelected('filters'), _lista__instancias_arcabouco.getSelected('simulations'));
			console.log(dashboard_data);
			//////////////////////////////////
			//Info Estatistica (Total + Por Cenário)
			//////////////////////////////////
			if (_dashboard_ops__elements['tables']['dashboard_ops__table_stats__byCenario'] === null){
				html = `<table class="table m-0" id="dashboard_ops__table_stats__byCenario">`+
						`<thead>${rebuildDashboardOps__Table_Stats__byCenario('thead')}</thead>`+
						`<tbody>${rebuildDashboardOps__Table_Stats__byCenario('tbody', dashboard_data.dashboard_ops__table_stats__byCenario)}</tbody>`+
						`<tfoot>${rebuildDashboardOps__Table_Stats__byCenario('tfoot', dashboard_data.dashboard_ops__table_stats)}</tfoot>`+
						`</table>`;
				$(document.getElementById('dashboard_ops__table_stats__byCenario__place')).append(html).promise().then(function (){
					_dashboard_ops__elements['tables']['dashboard_ops__table_stats__byCenario'] = $(document.getElementById('dashboard_ops__table_stats__byCenario'));
					_dashboard_ops__section.show('data', ++finish_building);
				});
			}
			else{
				html = `<thead>${rebuildDashboardOps__Table_Stats__byCenario('thead')}</thead>`+
						`<tbody>${rebuildDashboardOps__Table_Stats__byCenario('tbody', dashboard_data.dashboard_ops__table_stats__byCenario)}</tbody>`+
						`<tfoot>${rebuildDashboardOps__Table_Stats__byCenario('tfoot', dashboard_data.dashboard_ops__table_stats)}</tfoot>`;
				_dashboard_ops__elements['tables']['dashboard_ops__table_stats__byCenario'].empty().append(html).promise().then(function (){
					_dashboard_ops__section.show('data', ++finish_building);
				});
			}
			//////////////////////////////////
			//Tabela de Resultados dos Trades
			//////////////////////////////////
			if (_dashboard_ops__elements['tables']['dashboard_ops__table_trades'] === null){
				html = `<table class="table m-0" id="dashboard_ops__table_trades">`+
						`<thead>${rebuildDashboardOps__Table_Trades('thead')}</thead>`+
						`<tbody>${rebuildDashboardOps__Table_Trades('tbody', dashboard_data.dashboard_ops__table_trades)}</tbody>`+
						`</table>`;
				$(document.getElementById('dashboard_ops__table_trades__place')).append(html).promise().then(function (){
					_dashboard_ops__elements['tables']['dashboard_ops__table_trades'] = $(document.getElementById('dashboard_ops__table_trades'));
					_dashboard_ops__elements['tables']['dashboard_ops__table_trades'].DataTable(_dashboard_ops__table_trades_DT);
					_dashboard_ops__section.show('data', ++finish_building);
				});
			}
			else{
				html = `<thead>${rebuildDashboardOps__Table_Trades('thead')}</thead>`+
						`<tbody>${rebuildDashboardOps__Table_Trades('tbody', dashboard_data.dashboard_ops__table_trades)}</tbody>`;
				_dashboard_ops__elements['tables']['dashboard_ops__table_trades'].DataTable().destroy();
				_dashboard_ops__elements['tables']['dashboard_ops__table_trades'].empty().append(html).promise().then(function (){
					_dashboard_ops__elements['tables']['dashboard_ops__table_trades'].DataTable(_dashboard_ops__table_trades_DT);
					_dashboard_ops__section.show('data', ++finish_building);
				});
			}
			//////////////////////////////////
			//Gráfico de Resultados Normalizados
			//////////////////////////////////
			let linha_risco = {};
			if (dashboard_data['dashboard_ops__chart_data']['resultados_normalizado']['risco'] !== null){
				linha_risco = [{
					type: 'line',
					scaleID: 'y',
					value: dashboard_data['dashboard_ops__chart_data']['resultados_normalizado']['risco'],
					borderColor: '#dc3545',
					borderWidth: 1,
					label: {
						backgroundColor: '#dc3545',
						font: {size: 10},
						content: `R`,
						enabled: true
					}
				}];
			}
			if (_dashboard_ops__elements['charts']['dashboard_ops__chart_resultadoNormalizado'] === null){
				$(document.getElementById('dashboard_ops__chart_resultadoNormalizado')).append(`<canvas style="width:100%; height:100%"></canvas>`).promise().then(function (){
					_dashboard_ops__elements['charts']['dashboard_ops__chart_resultadoNormalizado'] = new Chart(document.getElementById('dashboard_ops__chart_resultadoNormalizado').querySelector('canvas'), {
						type: 'line',
						data: {
							labels: dashboard_data['dashboard_ops__chart_data']['resultados_normalizado']['labels'],
							datasets: [
								{
									label: 'Desvio Padrão (Sup)',
									backgroundColor: '#212529',
	      							borderColor: '#212529',
	      							borderWidth: 1,
	      							borderDash: [5, 5],
	      							data: dashboard_data['dashboard_ops__chart_data']['resultados_normalizado']['banda_superior']
								},
								{
									label: 'Média',
									backgroundColor: '#6610f2',
	      							borderColor: '#6610f2',
	      							borderWidth: 1,
	      							borderDash: [5, 5],
	      							data: dashboard_data['dashboard_ops__chart_data']['resultados_normalizado']['banda_media']
								},
								{
									label: 'Desvio Padrão (Inf)',
									backgroundColor: '#212529',
	      							borderColor: '#212529',
	      							borderWidth: 1,
	      							borderDash: [5, 5],
	      							data: dashboard_data['dashboard_ops__chart_data']['resultados_normalizado']['banda_inferior']
								},
								{
									label: _lista__instancias_arcabouco.getSelected('nome'),
	      							data: dashboard_data['dashboard_ops__chart_data']['resultados_normalizado']['data'],
	      							stack: 'combined',
	      							type: 'bar'
								}
							]
						},
						options: {
							elements: {
								point: {
									radius: 0
								},
								bar: {
									backgroundColor: _dashboard_ops__elements['ext'].color(),
									borderColor: _dashboard_ops__elements['ext'].color()
								}
							},
							interaction: {
								mode: 'index',
								intersect: false
							},
							plugins: {
								title: {
									display: true,
									text: 'Resultados por Trade'
								},
								legend: {
									display: true,
									labels: {
										filter: function (item, chart){
											if (item.text === _lista__instancias_arcabouco.getSelected('nome'))
												item.fillStyle = _lista__instancias_arcabouco.getSelected('chartColor');
											return (!item.text.includes('Desvio Padrão (Sup)') && !item.text.includes('Desvio Padrão (Inf)'));
										}
									},
									onClick: function (e, legendItem){
										let dataset_name = legendItem.text,
											index = legendItem.datasetIndex,
											me = this.chart.getDatasetMeta(index);
										if (dataset_name === _lista__instancias_arcabouco.getSelected('nome'))
											me.hidden = (me.hidden === null) ? true : null;
										else if (dataset_name === 'Média'){
											if (me.hidden === null){
												this.chart.getDatasetMeta(index - 1).hidden = true;
												me.hidden = true;
												this.chart.getDatasetMeta(index + 1).hidden = true;
											}
											else{
												this.chart.getDatasetMeta(index - 1).hidden = null;
												me.hidden = null;
												this.chart.getDatasetMeta(index + 1).hidden = null;
											}
										}
										this.chart.update();
									}
								},
								annotation: {
									annotations: linha_risco
								}
							},
							scales: {
								y: { beginAtZero: true }
							}
						}
					});
				});
			}
			else{
				_dashboard_ops__elements['charts']['dashboard_ops__chart_resultadoNormalizado'].data = {
					labels: dashboard_data['dashboard_ops__chart_data']['resultados_normalizado']['labels'],
					datasets: [
						{
							label: 'Desvio Padrão (Sup)',
							backgroundColor: '#212529',
  							borderColor: '#212529',
  							borderWidth: 1,
  							borderDash: [5, 5],
  							data: dashboard_data['dashboard_ops__chart_data']['resultados_normalizado']['banda_superior']
						},
						{
							label: 'Média',
							backgroundColor: '#6610f2',
  							borderColor: '#6610f2',
  							borderWidth: 1,
  							borderDash: [5, 5],
  							data: dashboard_data['dashboard_ops__chart_data']['resultados_normalizado']['banda_media']
						},
						{
							label: 'Desvio Padrão (Inf)',
							backgroundColor: '#212529',
  							borderColor: '#212529',
  							borderWidth: 1,
  							borderDash: [5, 5],
  							data: dashboard_data['dashboard_ops__chart_data']['resultados_normalizado']['banda_inferior']
						},
						{
							label: _lista__instancias_arcabouco.getSelected('nome'),
  							data: dashboard_data['dashboard_ops__chart_data']['resultados_normalizado']['data'],
  							stack: 'combined',
  							type: 'bar'
						}
					]
				}
				_dashboard_ops__elements['charts']['dashboard_ops__chart_resultadoNormalizado'].options.plugins.annotation.annotations = linha_risco;
				_dashboard_ops__elements['charts']['dashboard_ops__chart_resultadoNormalizado'].update();
			}
			//////////////////////////////////
			//Gráfico de Resultados por Hora
			//////////////////////////////////
			if (_dashboard_ops__elements['charts']['dashboard_ops__chart_resultadoPorHorario'] === null){
				$(document.getElementById('dashboard_ops__chart_resultadoPorHorario')).append(`<canvas style="width:100%; height:100%"></canvas>`).promise().then(function (){
					_dashboard_ops__elements['charts']['dashboard_ops__chart_resultadoPorHorario'] = new Chart(document.getElementById('dashboard_ops__chart_resultadoPorHorario').querySelector('canvas'), {
						type: 'bar',
						data: {
							labels: dashboard_data['dashboard_ops__chart_data']['resultado_por_hora']['labels'],
							datasets: [
								{
									label: `${_lista__instancias_arcabouco.getSelected('nome')} Qtd`,
									backgroundColor: '#6c757d',
	      							borderColor: '#6c757d',
	      							data: dashboard_data['dashboard_ops__chart_data']['resultado_por_hora']['data_qtd'],
	      							stack: _lista__instancias_arcabouco.getSelected('nome')
								},
								{
									label: `${_lista__instancias_arcabouco.getSelected('nome')}`,
									backgroundColor: _lista__instancias_arcabouco.getSelected('chartColor'),
	      							borderColor: _lista__instancias_arcabouco.getSelected('chartColor'),
	      							data: dashboard_data['dashboard_ops__chart_data']['resultado_por_hora']['data_result'],
	      							stack: _lista__instancias_arcabouco.getSelected('nome')
								}
							]
						},
						options: {
							interaction: {
								mode: 'index',
								intersect: false
							},
							plugins: {
								title: {
									display: true,
									text: 'Resultados por Hora'
								},
								legend: {
									display: true,
									labels: {
										filter: function (item, chart){
											return item.datasetIndex % 2 === 1;
										}
									},
									onClick: function (e, legendItem){
										let index = legendItem.datasetIndex,
											me = this.chart.getDatasetMeta(index);
										if (me.hidden === null){
											me.hidden = true;
											this.chart.getDatasetMeta(index - 1).hidden = true;
										}
										else{
											me.hidden = null;
											this.chart.getDatasetMeta(index - 1).hidden = null;
										}
										this.chart.update();
									}
								}
							},
							scales: {
								x: {
									stacked: true
								},
								y: {
									stacked: false
								}
							}
						}
					});
				});
			}
			else{
				_dashboard_ops__elements['charts']['dashboard_ops__chart_resultadoPorHorario'].data = {
					labels: dashboard_data['dashboard_ops__chart_data']['resultado_por_hora']['labels'],
					datasets: [
						{
							label: `${_lista__instancias_arcabouco.getSelected('nome')} Qtd`,
							backgroundColor: '#6c757d',
  							borderColor: '#6c757d',
  							data: dashboard_data['dashboard_ops__chart_data']['resultado_por_hora']['data_qtd'],
  							stack: _lista__instancias_arcabouco.getSelected('nome')
						},
						{
							label: `${_lista__instancias_arcabouco.getSelected('nome')}`,
							backgroundColor: _lista__instancias_arcabouco.getSelected('chartColor'),
  							borderColor: _lista__instancias_arcabouco.getSelected('chartColor'),
  							data: dashboard_data['dashboard_ops__chart_data']['resultado_por_hora']['data_result'],
  							stack: _lista__instancias_arcabouco.getSelected('nome')
						}
					]
				}
				_dashboard_ops__elements['charts']['dashboard_ops__chart_resultadoPorHorario'].update();
			}
			//////////////////////////////////
			//Gráfico de Evolução Patrimonial
			//////////////////////////////////
			if (_dashboard_ops__elements['charts']['dashboard_ops__chart_evolucaoPatrimonial'] === null){
				$(document.getElementById('dashboard_ops__chart_evolucaoPatrimonial')).append(`<canvas style="width:100%; height:100%"></canvas>`).promise().then(function (){
					_dashboard_ops__elements['charts']['dashboard_ops__chart_evolucaoPatrimonial'] = new Chart(document.getElementById('dashboard_ops__chart_evolucaoPatrimonial').querySelector('canvas'), {
						type: 'line',
						data: {
							labels: dashboard_data['dashboard_ops__chart_data']['evolucao_patrimonial']['labels'],
							datasets: [
								{
									label: _lista__instancias_arcabouco.getSelected('nome'),
									backgroundColor: _lista__instancias_arcabouco.getSelected('chartColor'),
	      							borderColor: _lista__instancias_arcabouco.getSelected('chartColor'),
	      							borderWidth: 1,
	      							data: dashboard_data['dashboard_ops__chart_data']['evolucao_patrimonial']['data']
								},
								{
									label: 'SMA20',
									backgroundColor: _lista__instancias_arcabouco.getSelected('chartColor'),
	      							borderColor: _lista__instancias_arcabouco.getSelected('chartColor'),
	      							borderWidth: 1,
	      							borderDash: [5, 5],
	      							data: dashboard_data['dashboard_ops__chart_data']['evolucao_patrimonial__mm20']['data']
								}
							]
						},
						options: {
							elements: {
								point: {
									radius: 0
								}
							},
							interaction: {
								mode: 'index',
								intersect: false
							},
							plugins: {
								title: {
									display: true,
									text: 'Evolução Patrimonial'
								}
							},
							scales: {
								y: { beginAtZero: true }
							}
						}
					});
				});
			}
			else{
				_dashboard_ops__elements['charts']['dashboard_ops__chart_evolucaoPatrimonial'].data = {
					labels: dashboard_data['dashboard_ops__chart_data']['evolucao_patrimonial']['labels'],
					datasets: [
						{
							label: _lista__instancias_arcabouco.getSelected('nome'),
							backgroundColor: _lista__instancias_arcabouco.getSelected('chartColor'),
  							borderColor: _lista__instancias_arcabouco.getSelected('chartColor'),
  							borderWidth: 1,
  							data: dashboard_data['dashboard_ops__chart_data']['evolucao_patrimonial']['data']
						},
						{
							label: 'SMA20',
							backgroundColor: _lista__instancias_arcabouco.getSelected('chartColor'),
  							borderColor: _lista__instancias_arcabouco.getSelected('chartColor'),
  							borderWidth: 1,
  							borderDash: [5, 5],
  							data: dashboard_data['dashboard_ops__chart_data']['evolucao_patrimonial__mm20']['data']
						}
					]
				};
				_dashboard_ops__elements['charts']['dashboard_ops__chart_evolucaoPatrimonial'].update();
			}
		}
		else
			_dashboard_ops__section.show('empty');
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------ Lista Arcabouços --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Reseta o formulário 'arcaboucos_modal_form'.
	*/
	function resetFormArcaboucoModal(){
		let form = $(document.getElementById('arcaboucos_modal_form'));
		form.removeAttr('id_arcabouco');
		form.find('input[name]').val('').removeAttr('changed');
		form.find('textarea[name]').val('').removeAttr('changed');
		form.find('select[name!="usuarios"]').prop('selectedIndex', 0).removeAttr('changed');
		form.find('select[name="usuarios"]').selectpicker('deselectAll');
	}
	/*
		Constroi o modal de gerenciamento de arcabouços.
	*/
	function buildArcaboucosModal(firstBuild = false, forceRebuild = false, show = false){
		if (firstBuild){
			let form = $(document.getElementById('arcaboucos_modal_form'));
			//Inicia o select de usuarios
			select_options_html = '';
			for (let usu in _lista__usuarios.usuarios){
				if (_lista__usuarios.usuarios[usu].is_me === 0)
					select_options_html += `<option value="${_lista__usuarios.usuarios[usu].usuario}">${_lista__usuarios.usuarios[usu].usuario}</option>`;
			}
			form.find('select[name="usuarios"]').append(select_options_html).promise().then(function (){
				form.find('select[name="usuarios"]').selectpicker({
					title: 'Usuários',
					selectedTextFormat: 'count > 2',
					actionsBox: true,
					deselectAllText: 'Nenhum',
					selectAllText: 'Todos',
					liveSearch: true,
					liveSearchNormalize: true,
					style: '',
					styleBase: 'form-control form-control-sm'
				}).on('loaded.bs.select', function (){
					form.find('select[name="usuarios"]').parent().addClass('form-control');
				});
			});
		}
		if (forceRebuild)
			buildArcaboucosTable();
		if (show){
			//Reseta o formulario de cadastro e edição
			resetFormArcaboucoModal();
			$(document.getElementById('arcaboucos_modal')).modal('show');
		}
	}
	/*
		Constroi a tabela de arcabouços.
	*/
	function buildArcaboucosTable(){
		let table = $(document.getElementById('table_arcaboucos')),
			html = ``,
			first = 0;
		table.DataTable().destroy();
		//Constroi tabela de informacoes dos arcabouços
		for (let ar in _lista__arcaboucos.arcaboucos){
			let usuarios_html = ``;
			for (let usu in _lista__arcaboucos.arcaboucos[ar]['usuarios'])
				usuarios_html += `<span class="badge ${((_lista__arcaboucos.arcaboucos[ar]['usuarios'][usu].criador == 1) ? 'bg-primary' : 'bg-secondary')} ${((usu !== 0) ? 'ms-1' : '')} my-1">${_lista__arcaboucos.arcaboucos[ar]['usuarios'][usu].usuario}</span>`;
			html += `<tr arcabouco="${_lista__arcaboucos.arcaboucos[ar].id}" ${((_lista__arcaboucos.arcaboucos[ar].id == _lista__instancias_arcabouco.getSelected('id')) ? 'selected' : '')}>`+
					`<td name="situacao" class="fw-bold">${_lista__arcaboucos.arcaboucos[ar].situacao}</td>`+
					`<td name="tipo" class="fw-bold">${_lista__arcaboucos.arcaboucos[ar].tipo}</td>`+
					`<td name="nome" class="fw-bold">${_lista__arcaboucos.arcaboucos[ar].nome}</td>`+
					`<td name="data_criacao" class="fw-bold text-muted">${Global.convertDate(_lista__arcaboucos.arcaboucos[ar].data_criacao)}</td>`+
					`<td name="data_atualizacao" class="fw-bold text-muted">${((_lista__arcaboucos.arcaboucos[ar].data_atualizacao !== '0000-00-00 00:00:00') ? Global.convertDatetime(_lista__arcaboucos.arcaboucos[ar].data_atualizacao) : '')}</td>`+
					`<td name="qtd_ops" class="fw-bold text-center">${_lista__arcaboucos.arcaboucos[ar].qtd_ops}</td>`+
					`<td name="usuarios">${usuarios_html}</td>`+
					((_lista__arcaboucos.arcaboucos[ar].sou_criador == 1) ? `<td name="editar" class="text-center"><button class="btn btn-sm btn-light" type="button" name="editar"><i class="fas fa-edit"></i></button></td>` : `<td></td>`)+
					((_lista__arcaboucos.arcaboucos[ar].sou_criador == 1) ? `<td name="remover" class="text-center"><button class="btn btn-sm btn-light" type="button" name="remover"><i class="fas fa-trash text-danger"></i></button></td>` : `<td></td>`)+
					`</tr>`;
		}
		table.find('tbody').empty().append(html).promise().then(function (){
			table.DataTable(_arcabouco__table_DT);
		});
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------ Section Cenarios --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Faz a reordenacao das linhas da tabela com base nas prioridades.
	*/
	function reorder_premissas_e_observacoes(tbody){
		[].slice.call(tbody.children).sort(function(a, b) {
			let a_v = a.querySelector('input[name="ref"]').value,
				b_v = b.querySelector('input[name="ref"]').value;
			return parseInt(a_v) - parseInt(b_v);
		}).forEach(function(ele) {
			tbody.appendChild(ele);
		});
	}
	/*
		Reconstroi o select de Cenarios, para copiar ao criar um novo cenario.
	*/
	function rebuildCenarios_modal_copiar(){
		$(document.getElementById('cenarios_modal_copiar')).empty().append(buildCenariosCopySelect());
	}
	/*
		Constroi o modal de gerenciamento de cenarios.
	*/
	function buildCenariosModal(){
		let modal = $(document.getElementById('cenarios_modal'));
		$(document.getElementById('table_cenarios')).empty().append(buildCenariosTable(_lista__cenarios.cenarios[_lista__instancias_arcabouco.getSelected('id')]));
		$(document.getElementById('cenarios_modal_espelhar__arcaboucos')).empty().append(buildCenariosEspelhaSelect());
		rebuildCenarios_modal_copiar();
		modal.modal('show');
	}
	/*
		Constroi o select com os arcabouços, para espelhar seus cenários.
	*/
	function buildCenariosEspelhaSelect(){
		let selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
			select_options = `<option value="">---</option>`;
		for (let a in _lista__arcaboucos.arcaboucos){
			if (_lista__arcaboucos.arcaboucos[a].id !== selected_inst_arcabouco)
				select_options += `<option value="${_lista__arcaboucos.arcaboucos[a].id}">${_lista__arcaboucos.arcaboucos[a].nome}</option>`;
		}
		return select_options;
	}
	/*
		Constroi o select com os cenarios, para cópia.
	*/
	function buildCenariosCopySelect(data){
		let selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
			select_options = `<option value="">---</option>`;
		for (let c in _lista__cenarios.cenarios[selected_inst_arcabouco])
			select_options += `<option value="${_lista__cenarios.cenarios[selected_inst_arcabouco][c]['nome']}">${_lista__cenarios.cenarios[selected_inst_arcabouco][c]['nome']}</option>`;
		return select_options;
	}
	/*
		Constroi as secoes de premissas ou observacoes de um cenario.
	*/
	function buildListaPremissas_Observacoes(data, type = 0, new_data = false){
		let html = ``;
		if (type === 1){
			for (let p in data){
				html += `<tr ${((new_data)?`new_premissa`:`premissa="${data[p].id}"`)}>`+
						`<td name="nome"><div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value="${data[p].nome}"><button class="btn btn-sm btn-outline-danger" type="button" remover_premissa>Excluir</button></div></td>`+
						`<td name="ref"><input type="text" name="ref" class="form-control form-control-sm text-center" value="${data[p].ref}"></td>`+
						`<td name="cor"><div class="d-flex justify-content-center"><input type="color" name="cor" class="form-control form-control-sm form-control-color" value="${data[p].cor}"></div></td>`+
						`<td name="obrigatoria"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="obrigatoria" class="form-check-input" ${((data[p].obrigatoria == 1) ? 'checked' : '')}></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input" ${((data[p].inativo == 1) ? 'checked' : '')}></div></td>`+
						`</tr>`;
			}
			if (html === '')
				html += `<tr empty><td colspan="5" class="text-muted text-center fw-bold p-4">Nenhuma Premissa</td></tr>`;
		}
		else if (type === 2){
			for (let p in data){
				html += `<tr ${((new_data)?`new_observacao`:`observacao="${data[p].id}"`)}>`+
						`<td name="nome"><div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value="${data[p].nome}"><button class="btn btn-sm btn-outline-danger" type="button" remover_observacao>Excluir</button></div></td>`+
						`<td name="ref"><input type="text" name="ref" class="form-control form-control-sm text-center" value="${data[p].ref}"></td>`+
						`<td name="cor"><div class="d-flex justify-content-center"><input type="color" name="cor" class="form-control form-control-sm form-control-color" value="${data[p].cor}"></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input" ${((data[p].inativo == 1) ? 'checked' : '')}></div></td>`+
						`</tr>`;
			}
			if (html === '')
				html += `<tr empty><td colspan="5" class="text-muted text-center fw-bold p-4">Nenhuma Observação</td></tr>`;
		}
		return html;
	}
	/*
		Constroi um cenarios com (premissas + observacoes).
	*/
	function buildCenario(data = {}, new_cenario = false){
		return  `<div class="card text-center mt-3" ${((new_cenario) ? `new_cenario` : (('id' in data) ? `cenario="${data.id}"` : ``))}>`+
				`<div class="card-header d-flex">`+
				`<div class="col-md-6"><input type="text" name="cenario_nome" class="form-control form-control-sm" value="${(('nome' in data) ? data.nome : '')}"></div>`+
				`<ul class="nav nav-tabs card-header-tabs ms-auto" >`+
				`<li class="nav-item"><a class="nav-link active" href="#" target="premissas">Premissas${(('premissas' in data) ? ((new_cenario) ? ((data['premissas'].length) ? `<span class="badge bg-primary ms-1">+${data['premissas'].length}</span>` : ``) : `<span class="badge bg-secondary ms-1">${data['premissas'].length}</span>`) : ``)}</a></li>`+
				`<li class="nav-item"><a class="nav-link" href="#" target="observacoes">Observações${(('observacoes' in data) ? ((new_cenario) ? ((data['observacoes'].length) ? `<span class="badge bg-primary ms-1">+${data['observacoes'].length}</span>` : ``) : `<span class="badge bg-secondary ms-1">${data['observacoes'].length}</span>`) : ``)}</a></li>`+
				`</ul>`+
				`</div>`+
				`<div class="card-body">`+
				`<div class="d-flex" target="premissas">`+
				`<table class="table m-0 me-3">`+
				`<thead>`+
				`<tr>`+
				`<th class="border-0">Nome</th><th class="border-0 text-center">Ref</th><th class="border-0 text-center">Cor</th><th class="border-0 text-center">Obrigatória</th><th class="border-0 text-center">Desativar</th>`+
				`</tr>`+
				`<tbody>${(('premissas' in data) ? buildListaPremissas_Observacoes(data['premissas'], 1, new_cenario) : buildListaPremissas_Observacoes({}, 1, new_cenario))}</tbody>`+
				`</table>`+
				`</div>`+
				`<div class="d-flex d-none" target="observacoes">`+
				`<table class="table m-0 me-3">`+
				`<thead>`+
				`<tr>`+
				`<th class="border-0">Nome</th><th class="border-0 text-center">Ref</th><th class="border-0 text-center">Cor</th><th class="border-0 text-center">Desativar</th>`+
				`</tr>`+
				`<tbody>${(('observacoes' in data) ? buildListaPremissas_Observacoes(data['observacoes'], 2, new_cenario) : buildListaPremissas_Observacoes({}, 2, new_cenario))}</tbody>`+
				`</table>`+
				`</div>`+
				`</div>`+
				`<div class="card-footer bg-transparent d-flex"><button type="button" class="btn btn-sm btn-danger" title="Duplo Clique" remover_cenario><i class="fas fa-trash-alt me-2"></i>Excluir Cenário</button><button type="button" class="btn btn-sm btn-outline-primary ms-2" adicionar_premissa><i class="fas fa-plus me-2"></i>Adicionar Premissa</button>${((new_cenario) ? `<button type="button" class="btn btn-sm btn-success ms-auto" salvar_novo_cenario>Adicionar Cenário</button>` : (('id' in data) ? `<button type="button" class="btn btn-sm btn-success ms-auto disabled" salvar_cenario>Salvar</button>` : ``))}</div>`+
				`</div>`;
	}
	/*
		Constroi a 'table' de cenários.
	*/
	function buildCenariosTable(data = {}){
		let html = ``;
		for (let c in data)
			html += buildCenario(data[c], false);
		if (html === '')
			html = `<div class="container-fluid mt-3 p-4 text-center text-muted fw-bold" empty>Nenhum Cenário Cadastrado.</div>`;
		return html;
	}
	/*
		Constrói os cenários de passados, que são de outro arcabouço. (Se o o nome do cenário já existir pula)
	*/
	function buildCenarios_Espelhados(data){
		let table = $(document.getElementById('table_cenarios')),
			cenarios_ja_existentes = [];
		if (data.length){
			//Remove label inicial de 'Nenhum Cenário'
			table.find('div[empty]').remove();
			//Busca os cenarios ja existentes
			table.find('input[name="cenario_nome"]').each(function (){
				cenarios_ja_existentes.push(this.value);
			});
			for (let c in data){
				if (!cenarios_ja_existentes.includes(data[c].nome))
					table.prepend(buildCenario(data[c], true));
			}
		}
	}
	/*
		Coleta os dados para envio em Adicionar / Alterar / Remover cenarios e (Premissas / Observacoes).
	*/
	function cenarioGetData(cenario){
		let data = {};
		//Cenarios novos
		if (cenario[0].hasAttribute('new_cenario')){
			data.nome = cenario.find('input[name="cenario_nome"]').val();
			if (data.nome === '')
				return {};
			data.id_arcabouco = _lista__instancias_arcabouco.getSelected('id');
			data.premissas = [];
			cenario.find('tr[new_premissa]').each(function (r, row){
				let nome = row.querySelector('input[name="nome"]').value,
					ref = row.querySelector('input[name="ref"]').value;
				if (nome !== '' && ref !== ''){
					data.premissas.push({
						nome: nome,
						ref: ref,
						cor: row.querySelector('input[name="cor"]').value,
						obrigatoria: ((row.querySelector('input[name="obrigatoria"]').checked)?1:0),
						inativo: ((row.querySelector('input[name="inativo"]').checked)?1:0)
					});
				}
			});
			data.observacoes = [];
			cenario.find('tr[new_observacao]').each(function (r, row){
				let nome = row.querySelector('input[name="nome"]').value,
					ref = row.querySelector('input[name="ref"]').value;
				if (nome !== '' && ref !== ''){
					data.observacoes.push({
						nome: nome,
						ref: ref,
						cor: row.querySelector('input[name="cor"]').value,
						inativo: ((row.querySelector('input[name="inativo"]').checked)?1:0)
					});
				}
			});
		}
		//Cenario ja existe
		else if (cenario[0].hasAttribute('cenario')){
			data = {
				id_arcabouco: _lista__instancias_arcabouco.getSelected('id'),
				id_cenario: cenario.attr('cenario'),
				insert: {
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
					//Premissas de cenarios
					premissas: [],
					//Observações de cenarios
					observacoes: []
				}
			};
			//Verifica mudancas no nome do cenario
			let cenario_nome_input = cenario.find('input[name="cenario_nome"]');
			if (cenario_nome_input[0].hasAttribute('changed') && cenario_nome_input.val() !== '')
				data['update']['cenarios'].push({nome: cenario_nome_input.val()});
			//Verifica novas premissas
			cenario.find('tr[new_premissa]').each(function (r, row){
				let nome = row.querySelector('input[name="nome"]').value,
					ref = row.querySelector('input[name="ref"]').value;
				if (nome !== '' && ref !== ''){
					data['insert']['premissas'].push({
						nome: nome,
						ref: ref,
						cor: row.querySelector('input[name="cor"]').value,
						obrigatoria: ((row.querySelector('input[name="obrigatoria"]').checked)?1:0),
						inativo: ((row.querySelector('input[name="inativo"]').checked)?1:0)
					});
				}
			});
			//Verifica mudancas/remocoes nas premissas
			cenario.find('tr[premissa]').each(function (r, row){
				//Trata remocoes de premissas
				if (row.hasAttribute('remover'))
					data['remove']['premissas'].push({id: row.getAttribute('premissa')});
				//Trata alteracoes em premissas
				else{
					let info = {};
					$(row).find('input[changed]').each(function (ip, input){
						if (this.name === 'nome' && this.value === '')
							return;
						if (this.getAttribute('type') === 'checkbox')
							info[this.name] = ((this.checked)?1:0);
						else
							info[this.name] = this.value;
					});
					if (!Global.isObjectEmpty(info)){
						info['id'] = row.getAttribute('premissa');
						data['update']['premissas'].push(info);
					}
				}
			});
			//Verifica novas observacoes
			cenario.find('tr[new_observacao]').each(function (r, row){
				let nome = row.querySelector('input[name="nome"]').value,
					ref = row.querySelector('input[name="ref"]').value;
				if (nome !== '' && ref !== ''){
					data['insert']['observacoes'].push({
						nome: nome,
						ref: ref,
						cor: row.querySelector('input[name="cor"]').value,
						inativo: ((row.querySelector('input[name="inativo"]').checked)?1:0)
					});
				}
			});
			//Verifica mudancas/remocoes nas observacoes
			cenario.find('tr[observacao]').each(function (r, row){
				//Trata remocoes de observacoes
				if (row.hasAttribute('remover'))
					data['remove']['observacoes'].push({id: row.getAttribute('observacao')});
				//Trata alteracoes em observacoes
				else{
					let info = {};
					$(row).find('input[changed]').each(function (ip, input){
						if (this.name === 'nome' && this.value === '')
							return;
						if (this.getAttribute('type') === 'checkbox')
							info[this.name] = ((this.checked)?1:0);
						else
							info[this.name] = this.value;
					});
					if (!Global.isObjectEmpty(info)){
						info['id'] = row.getAttribute('observacao');
						data['update']['observacoes'].push(info);
					}
				}
			});
		}
		return data;
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*-------------------------- Section Operações Upload ----------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Constroi o modal de Upload de Operações.
	*/
	function buildUploadOperacoesModal(){
		let modal = $(document.getElementById('upload_operacoes_modal'));
		document.getElementById('upload_operacoes_modal_file').value = '';
		document.getElementById('file_format').selectedIndex = 0;
		document.getElementById('table_layout').selectedIndex = 0;
		resetUploadOperacaoTable();
		modal.modal('show');
	}
	/*
		Apaga tudo em 'table_upload_operacoes'.
	*/
	function resetUploadOperacaoTable(){
		let table = $(document.getElementById('table_upload_operacoes'));
		table.find('thead').empty();
		table.find('tbody').empty().append(`<tr class="text-center text-muted fw-bold fs-6"><td class="border-0"><i class="fas fa-cookie-bite me-2"></i>Nada a mostrar</td></tr>`);
	}
	/*
		Adiciona uma linha na tabela de upload de operações.
	*/
	function buildUploadOperacaoTable(data = []){
		let tbody_html = ``,
			thead_html = ``,
			table = $(document.getElementById('table_upload_operacoes')),
			table_layout = $(document.getElementById('table_layout')).val(),
			selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
			op_dic = ['', 'C', 'V'],
			cenarios_dic = [],
			ativos_dic = {'': {nome: '', custo: '', valor_tick: '', pts_tick: ''}},
			error = false;
		for (let cn in _lista__cenarios.cenarios[selected_inst_arcabouco])
			cenarios_dic.push(_lista__cenarios.cenarios[selected_inst_arcabouco][cn].nome);
		for (let at in _lista__ativos.ativos){
			ativos_dic[_lista__ativos.ativos[at].nome] = {
				nome: _lista__ativos.ativos[at].nome,
				custo: _lista__ativos.ativos[at].custo,
				valor_tick: _lista__ativos.ativos[at].valor_tick,
				pts_tick: _lista__ativos.ativos[at].pts_tick
			}
		}
		//Constroi o THEAD
		if (table_layout === 'scalp'){
			thead_html += `<tr>`+
						  `<th name="sequencia">#</th>`+
						  `<th name="data">Data</th>`+
						  `<th name="ativo">Ativo</th>`+
						  `<th name="op">Op.</th>`+
						  `<th name="rr">R:R</th>`+
						  `<th name="vol">Vol</th>`+
						  `<th name="cts">Cts</th>`+
						  `<th name="hora">Hora</th>`+
						  `<th name="entrada">Entrada</th>`+
						  `<th name="stop">Stop</th>`+
						  `<th name="alvo">Alvo</th>`+
						  `<th name="men">MEN</th>`+
						  `<th name="mep">MEP</th>`+
						  `<th name="saida">Saída</th>`+
						  `<th name="cenario">Cenário</th>`+
						  `<th name="premissas">Premissas</th>`+
						  `<th name="observacoes">Observações</th>`+
						  `<th name="erro">Erro</th>`+
						  `</tr>`;
		}
		//Constroi o TBODY
		for (let i=0; i<data.length; i++){
			//Layout de Scalp
			if (table_layout === 'scalp'){
				let error_line = [],
					op_ativo_index = (data[i].ativo in ativos_dic) ? data[i].ativo : '',
					op_cenario = (cenarios_dic.includes(data[i].cenario)) ? data[i].cenario : '',
					op_premissas = (op_cenario !== '') ? data[i].premissas.map(s => s.trim()).join(',') : '',
					op_observacoes = (op_cenario !== '') ? data[i].observacoes.map(s => s.trim()).join(',') : '';
				if (data[i].data === '' || op_ativo_index === '' || data[i].op === '' || data[i].cts === '' || data[i].entrada === '' || data[i].saida === ''){
					if (data[i].data === '')
						error_line.push('data');
					if (op_ativo_index === '')
						error_line.push('ativo');
					if (data[i].op === '')
						error_line.push('op');
					if (data[i].cts === '')
						error_line.push('cts');
					if (data[i].entrada === '')
						error_line.push('entrada');
					if (data[i].saida === '')
						error_line.push('saida');
					error = true;
				}
				tbody_html += `<tr ${((error_line) ? `class="error"` : ``)}>`+
							`<td name="sequencia" value="${i+1}">${i+1}</td>`+
							`<td name="data" value="${Global.convertDate(data[i].data)}" ${((error_line.includes('data')) ? `class="error"` : ``)}>${data[i].data}</td>`+
							`<td name="ativo" value="${ativos_dic[op_ativo_index].nome}" custo="${ativos_dic[op_ativo_index].custo}" valor_tick="${ativos_dic[op_ativo_index].valor_tick}" pts_tick="${ativos_dic[op_ativo_index].pts_tick}" ${((error_line.includes('ativo')) ? `class="error"` : ``)}>${ativos_dic[op_ativo_index].nome}</td>`+
							`<td name="op" value="${data[i].op}" ${((error_line.includes('op')) ? `class="error"` : ``)}>${op_dic[data[i].op]}</td>`+
							`<td name="rr" value="${data[i].rr}">${data[i].rr}</td>`+
							`<td name="vol" value="${data[i].vol}">${data[i].vol}</td>`+
							`<td name="cts" value="${data[i].cts}" ${((error_line.includes('cts')) ? `class="error"` : ``)}>${data[i].cts}</td>`+
							`<td name="hora" value="${data[i].hora}">${data[i].hora}</td>`+
							`<td name="entrada" value="${data[i].entrada}" ${((error_line.includes('entrada')) ? `class="error"` : ``)}>${data[i].entrada}</td>`+
							`<td name="stop" value="${data[i].stop}">${data[i].stop}</td>`+
							`<td name="alvo" value="${data[i].alvo}">${data[i].alvo}</td>`+
							`<td name="men" value="${data[i].men}">${data[i].men}</td>`+
							`<td name="mep" value="${data[i].mep}">${data[i].mep}</td>`+
							`<td name="saida" value="${data[i].saida}" ${((error_line.includes('saida')) ? `class="error"` : ``)}>${data[i].saida}</td>`+
							`<td name="cenario" value="${op_cenario}">${op_cenario}</td>`+
							`<td name="premissas" value="${op_premissas}">${op_premissas}</td>`+
							`<td name="observacoes" value="${op_observacoes}">${op_observacoes}</td>`+
							`<td name="erro" value="${data[i].erro}">${(data[i].erro == 1) ? `<i class="fas fa-check"></i>` : ''}</td>`+
							`</tr>`;
			}
		}
		table.find('thead').empty().append(thead_html);
		table.find('tbody').empty().append(tbody_html).promise().then(function (){
			if (error){
				Global.toast.create({location: document.getElementById('upload_operacoes_modal_toasts'), color: 'danger', body: 'Alguns campos devem serem preenchidos.', delay: 4000});
				$(document.getElementById('upload_operacoes_modal_enviar')).prop('disabled', true);
			}
			else
				$(document.getElementById('upload_operacoes_modal_enviar')).prop('disabled', false);
		});
	}
	/*
		Recalcula o Stop e Alvo, baseado nos dados preenchidos em um linha da 'table_upload_operacoes'.
	*/
	// function recalcStopeAlvo_OperacoesAddTable(tr_data){
	// 	let novo_alvo = '',
	// 		novo_stop = '';
	// 	if (tr_data.vol == 0 || tr_data.pts_tick == 0 || (tr_data.risco == 0 && tr_data.retorno == 0))
	// 		return;
	// 	//Se for compra
	// 	if (tr_data.op == '1'){
	// 		if (tr_data.retorno != 0)
	// 			novo_alvo = tr_data.entrada + (tr_data.pts_tick * tr_data.vol * tr_data.retorno);
	// 		if (tr_data.risco != 0)
	// 			novo_stop = tr_data.entrada - (tr_data.pts_tick * tr_data.vol * tr_data.risco);
	// 	}
	// 	else if (tr_data.op == '2'){
	// 		if (tr_data.retorno != 0)
	// 			novo_alvo = tr_data.entrada - (tr_data.pts_tick * tr_data.vol * tr_data.retorno);
	// 		if (tr_data.risco != 0)
	// 			novo_stop = tr_data.entrada + (tr_data.pts_tick * tr_data.vol * tr_data.risco);	
	// 	}
	// 	tr_data.tr.find('input[name="alvo"]').val(novo_alvo);
	// 	tr_data.tr.find('input[name="stop"]').val(novo_stop);
	// }
	////////////////////////////////////////////////////////////////////////////////////
	/*--------------------------------- Lista Ops ------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	function buildOperacoesOffcanvas(forceRebuild = false){
		if (_list_ops__needRebuild || forceRebuild){
			_list_ops__needRebuild = false;
			let lista_ops__table = $(document.getElementById('lista_ops__table'));
			lista_ops__table.DataTable().destroy();
			lista_ops__table.find('tbody').empty().append(rebuildListaOps__Table()).promise().then(function (){
				_lista_ops__search.update();
				lista_ops__table.DataTable(_lista_ops__table_DT);
			});
		}
		if (!forceRebuild)
			$(document.getElementById('lista_ops')).offcanvas('show');
	}
	/*
		Retorna o html da lista de operacoes. (Head ou Body)
	*/
	function rebuildListaOps__Table(){
		let selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
			op_dic = {
				text: ['', 'C', 'V'],
				color: ['', 'bg-success', 'bg-danger']
			},
			html = ``;
		for (let o in _lista__operacoes.operacoes[selected_inst_arcabouco]){
			html += `<tr operacao="${_lista__operacoes.operacoes[selected_inst_arcabouco][o].id}">`+
					`<td class="fw-bold text-muted" name="sequencia">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].sequencia}</td>`+
					`<td class="fw-bold text-muted" name="data">${Global.convertDate(_lista__operacoes.operacoes[selected_inst_arcabouco][o].data)}</td>`+
					`<td class="fw-bold text-muted" name="hora">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].hora}</td>`+
					`<td class="fw-bold text-muted" name="ativo">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].ativo}</td>`+
					`<td name="op"><span class="badge ${op_dic['color'][_lista__operacoes.operacoes[selected_inst_arcabouco][o].op]}">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].cts}${op_dic['text'][_lista__operacoes.operacoes[selected_inst_arcabouco][o].op]}</span></td>`+
					`<td class="fw-bold text-muted" name="vol">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].vol}</td>`+
					`<td class="fw-bold text-muted" name="cenario">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].cenario}</td>`+
					`<td name="erro">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].erro}</td>`+
					`</tr>`;
		}
		return html;
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*-------------------------------- Dashboard Ops ---------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Reconstroi a lista de 'premissas' ou 'observações', usada nos selects dos mesmos em 'filters'.
	*/
	function rebuildSelect_PremissasOuObservacoes__content(el, id_arcabouco){
		let dashboard_filters = _lista__instancias_arcabouco.getSelected('filters'),
			selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
			el_name = el.attr('name'),
			placeholder = {'premissas': 'Premissas', 'observacoes': 'Observações'},
			qtd_selected = 0,
			options_html = '';
		if ('cenario' in dashboard_filters){
			for (let cenario_nome in dashboard_filters['cenario']){
				if (_lista__cenarios.cenarios[selected_inst_arcabouco][dashboard_filters['cenario'][cenario_nome].id][el_name].length){
					if (options_html === ''){
						let select_query_union_name = `${el_name}_query_union`,
							or_selected = !(select_query_union_name in dashboard_filters) || (select_query_union_name in dashboard_filters && dashboard_filters[select_query_union_name] === 'OR'),
							and_selected = (select_query_union_name in dashboard_filters && dashboard_filters[select_query_union_name] === 'AND');
						options_html += `<li><div class="input-group px-2"><select class="iSelectKami form-select form-select-sm" name="${el_name}_query_union"><option value="OR" ${((or_selected) ? 'selected' : '')}>OR</option><option value="AND" ${((and_selected) ? 'selected' : '')}>AND</option></select><button type="button" class="iSelectKami btn btn-sm btn-outline-secondary" name="tira_tudo">Nenhum</button></div></li>`;
					}
					else
						options_html += `<li><hr class="dropdown-divider"></li>`;
					options_html += `<li><h6 class="dropdown-header">${cenario_nome}</h6></li>`;
					for (let o in _lista__cenarios.cenarios[selected_inst_arcabouco][dashboard_filters['cenario'][cenario_nome].id][el_name]){
						let is_selected = _lista__cenarios.cenarios[selected_inst_arcabouco][dashboard_filters['cenario'][cenario_nome].id][el_name][o].ref in dashboard_filters['cenario'][cenario_nome][el_name],
							negar_checked = (is_selected) ? dashboard_filters['cenario'][cenario_nome][el_name][_lista__cenarios.cenarios[selected_inst_arcabouco][dashboard_filters['cenario'][cenario_nome].id][el_name][o].ref] === 1 : false;
						options_html += `<li><button class="dropdown-item" type="button" value="${_lista__cenarios.cenarios[selected_inst_arcabouco][dashboard_filters['cenario'][cenario_nome].id][el_name][o].ref}" cenario="${dashboard_filters['cenario'][cenario_nome].id}" pertence="${cenario_nome}" ${((is_selected) ? 'selected' : '' )}><input class="form-check-input me-3" type="checkbox" name="negar_valor" ${((negar_checked) ? 'checked' : '' )}><i class="fas fa-square me-2" style="color: ${_lista__cenarios.cenarios[selected_inst_arcabouco][dashboard_filters['cenario'][cenario_nome].id][el_name][o].cor}"></i>${_lista__cenarios.cenarios[selected_inst_arcabouco][dashboard_filters['cenario'][cenario_nome].id][el_name][o].nome}</button>`;
						if (is_selected)
							qtd_selected++;
					}
				}
			}
		}
		el.find('button.dropdown-toggle').html(((qtd_selected > 1) ? `${qtd_selected} items selected` : ((qtd_selected === 1) ? `1 item selected` : `${placeholder[el_name]}`)));
		el.find('ul.dropdown-menu').empty().append(options_html);
	}
	/*
		Retorna o html de uma linha usada em 'dashboard_ops__table_stats__byCenario', separando se é para o 'tbody' ou 'tfoot'.
	*/
	function dashboardOps__Table_Stats__byCenario__newLine(cenario, line_data, method){
		if (method === 'tbody'){
			return `<tr class="align-middle">`+
					`<td><span name="trades__total_perc" class="data-tiny text-muted">(${line_data.trades__total_perc.toFixed(2)}%)</span></td>`+
					`<td><span name="cenario" class="fw-bold">${cenario}</span></td>`+
					//Dias
					//N° Trades
					`<td class="text-center divider"><span name="trades__total" class="data-small">${line_data.trades__total}</span></td>`+
					`<td class="text-center"><span name="trades__positivo" class="data-small text-success">${line_data.trades__positivo}</span><span name="trades__positivo_perc" class="data-tiny text-success ms-2">(${line_data.trades__positivo_perc.toFixed(2)}%)</span></td>`+
					`<td class="text-center"><span name="trades__negativo" class="data-small text-danger">${line_data.trades__negativo}</span><span name="trades__negativo_perc" class="data-tiny text-danger ms-2">(${line_data.trades__negativo_perc.toFixed(2)}%)</span></td>`+
					`<td class="text-center"><span name="trades__empate" class="data-small text-muted">${line_data.trades__empate}</span><span name="trades__empate_perc" class="data-tiny text-muted ms-2">(${line_data.trades__empate_perc.toFixed(2)}%)</span></td>`+
					`<td class="text-center"><span name="trades__erro" class="data-small text-primary">${line_data.trades__erro}</span><span name="trades__erro_perc" class="data-tiny text-primary ms-2">(${((line_data.trades__erro_perc !== '--') ? `${line_data.trades__erro_perc.toFixed(2)}%` : line_data.trades__erro_perc)})</span></td>`+
					//Result.
					`<td class="text-center divider"><span name="result__lucro_brl" class="data-small">R$ ${line_data.result__lucro_brl.toFixed(2)}</span></td>`+
					`<td class="text-center"><span name="result__lucro_R" class="data-small">${((line_data.result__lucro_R !== '--') ? `${line_data.result__lucro_R.toFixed(3)}R` : line_data.result__lucro_R )}</span></td>`+
					`<td class="text-center"><span name="result__lucro_perc" class="data-small">${((line_data.result__lucro_perc !== '--') ? `${line_data.result__lucro_perc.toFixed(2)}%` : line_data.result__lucro_perc)}</span></td>`+
					//R:G
					`<td class="text-center divider"><span name="stats__rrMedio" class="data-small">${line_data.stats__rrMedio.toFixed(2)}</span></td>`+
					`<td class="text-center"><span name="result__mediaGain_R" class="data-small text-success">${((line_data.result__mediaGain_R !== '--') ? `${line_data.result__mediaGain_R.toFixed(3)}R` : line_data.result__mediaGain_R )}</span><span name="result__mediaGain_brl" class="data-tiny text-success ms-2">R$ ${line_data.result__mediaGain_brl.toFixed(2)}</span><span name="result__mediaGain_perc" class="data-tiny text-success ms-2">${((line_data.result__mediaGain_perc !== '--') ? `${line_data.result__mediaGain_perc.toFixed(2)}%` : line_data.result__mediaGain_perc )}</span></td>`+
					`<td class="text-center"><span name="result__mediaLoss_R" class="data-small text-danger">${((line_data.result__mediaLoss_R !== '--') ? `${line_data.result__mediaLoss_R.toFixed(3)}R` : line_data.result__mediaLoss_R )}</span><span name="result__mediaLoss_brl" class="data-tiny text-danger ms-2">R$ ${line_data.result__mediaLoss_brl.toFixed(2)}</span><span name="result__mediaLoss_perc" class="data-tiny text-danger ms-2">${((line_data.result__mediaLoss_perc !== '--') ? `${line_data.result__mediaLoss_perc.toFixed(2)}%` : line_data.result__mediaLoss_perc )}</span></td>`+
					//Expect.
					`<td class="text-center divider"><span name="stats__expect" class="data-small">${((line_data.stats__expect !== '--') ? line_data.stats__expect.toFixed(2) : line_data.stats__expect )}</span></td>`+
					//DP
					`<td class="text-center"><span name="stats__dp" class="data-small">${((line_data.stats__dp !== '--') ? line_data.stats__dp.toFixed(2) : line_data.stats__dp )}</span></td>`+
					//SQN
					`<td class="text-center"><span name="stats__sqn" class="data-small">${((line_data.stats__sqn !== '--') ? line_data.stats__sqn.toFixed(2) : line_data.stats__sqn )}</span></td>`+
					//Edge
					`<td class="text-center"><span name="stats__breakeven" class="data-tiny text-muted">${line_data.stats__breakeven.toFixed(2)}%</span></td>`+
					`<td class="text-center"><span name="stats__edge" class="data-small">${line_data.stats__edge.toFixed(2)}%</span></td>`+
					`</tr>`;
		}
		else if (method === 'tfoot'){
			return `<tr class="align-middle">`+
					`<td></td>`+
					`<td><span name="cenario" class="fw-bold">${cenario}</span></td>`+
					//Dias
					//N° Trades
					`<td class="text-center divider"><span name="trades__total" class="fw-bold">${line_data.trades__total}</span></td>`+
					`<td class="text-center"><span name="trades__positivo" class="data-small text-success">${line_data.trades__positivo}</span><span name="trades__positivo_perc" class="data-tiny text-success ms-2">(${line_data.trades__positivo_perc.toFixed(2)}%)</span></td>`+
					`<td class="text-center"><span name="trades__negativo" class="data-small text-danger">${line_data.trades__negativo}</span><span name="trades__negativo_perc" class="data-tiny text-danger ms-2">(${line_data.trades__negativo_perc.toFixed(2)}%)</span></td>`+
					`<td class="text-center"><span name="trades__empate" class="data-small text-muted">${line_data.trades__empate}</span><span name="trades__empate_perc" class="data-tiny text-muted ms-2">(${line_data.trades__empate_perc.toFixed(2)}%)</span></td>`+
					`<td class="text-center"><span name="trades__erro" class="data-small text-primary">${line_data.trades__erro}</span><span name="trades__erro_perc" class="data-tiny text-primary ms-2">(${((line_data.trades__erro_perc !== '--') ? `${line_data.trades__erro_perc.toFixed(2)}%` : line_data.trades__erro_perc)})</span></td>`+
					//Result.
					`<td class="text-center divider"><span name="result__lucro_brl" class="data-small">R$ ${line_data.result__lucro_brl.toFixed(2)}</span></td>`+
					`<td class="text-center"><span name="result__lucro_R" class="data-small">${((line_data.result__lucro_R !== '--') ? `${line_data.result__lucro_R.toFixed(3)}R` : line_data.result__lucro_R )}</span></td>`+
					`<td class="text-center"><span name="result__lucro_perc" class="data-small">${((line_data.result__lucro_perc !== '--') ? `${line_data.result__lucro_perc.toFixed(2)}%` : line_data.result__lucro_perc)}</span></td>`+
					//R:G
					`<td class="text-center divider"><span name="stats__rrMedio" class="fw-bold">${line_data.stats__rrMedio.toFixed(2)}</span></td>`+
					`<td class="text-center"><span name="result__mediaGain_R" class="data-small text-success">${((line_data.result__mediaGain_R !== '--') ? `${line_data.result__mediaGain_R.toFixed(3)}R` : line_data.result__mediaGain_R )}</span><span name="result__mediaGain_brl" class="data-tiny text-success ms-2">R$ ${line_data.result__mediaGain_brl.toFixed(2)}</span><span name="result__mediaGain_perc" class="data-tiny text-success ms-2">${((line_data.result__mediaGain_perc !== '--') ? `${line_data.result__mediaGain_perc.toFixed(2)}%` : line_data.result__mediaGain_perc )}</span></td>`+
					`<td class="text-center"><span name="result__mediaLoss_R" class="data-small text-danger">${((line_data.result__mediaLoss_R !== '--') ? `${line_data.result__mediaLoss_R.toFixed(3)}R` : line_data.result__mediaLoss_R )}</span><span name="result__mediaLoss_brl" class="data-tiny text-danger ms-2">R$ ${line_data.result__mediaLoss_brl.toFixed(2)}</span><span name="result__mediaLoss_perc" class="data-tiny text-danger ms-2">${((line_data.result__mediaLoss_perc !== '--') ? `${line_data.result__mediaLoss_perc.toFixed(2)}%` : line_data.result__mediaLoss_perc )}</span></td>`+
					//Expect.
					`<td class="text-center divider"><span name="stats__expect" class="data-small">${((line_data.stats__expect !== '--') ? line_data.stats__expect.toFixed(2) : line_data.stats__expect )}</span></td>`+
					//DP
					`<td class="text-center"><span name="stats__dp" class="data-small">${((line_data.stats__dp !== '--') ? line_data.stats__dp.toFixed(2) : line_data.stats__dp )}</span></td>`+
					//SQN
					`<td class="text-center"><span name="stats__sqn" class="data-small">${((line_data.stats__sqn !== '--') ? line_data.stats__sqn.toFixed(2) : line_data.stats__sqn )}</span></td>`+
					//Edge
					`<td class="text-center"><span name="stats__breakeven" class="data-tiny text-muted">${line_data.stats__breakeven.toFixed(2)}%</span></td>`+
					`<td class="text-center"><span name="stats__edge" class="data-small">${line_data.stats__edge.toFixed(2)}%</span></td>`+
					`</tr>`;
		}
	}
	/*
		Retorna o html da seção de 'thead' ou 'tbody' ou 'tfoot' da 'dashboard_ops__table_stats__byCenario'.
	*/
	function rebuildDashboardOps__Table_Stats__byCenario(section = '', stats = {}){
		let html = ``;
		if (section === 'thead')
			html += `<tr class="align-end">`+
					`<th rowspan="2" colspan="2">Cenário</th>`+
					`<th colspan="5" class="text-center mainheader">Trades</th>`+
					`<th rowspan="2" colspan="3" class="text-center">Result.</th>`+
					`<th colspan="3" class="text-center mainheader">R:G</th>`+
					`<th rowspan="2" class="text-center">Expect.</th>`+
					`<th rowspan="2" class="text-center">DP</th>`+
					`<th rowspan="2" class="text-center">SQN</th>`+
					`<th rowspan="2" colspan="2" class="text-center">Edge</th>`+
					`</tr>`+
					`<tr class="align-middle">`+
					`<th class="text-center subheader">Total</th>`+
					`<th class="text-center subheader">Gain</th>`+
					`<th class="text-center subheader">Loss</th>`+
					`<th class="text-center subheader">0x0</th>`+
					`<th class="text-center subheader">Erro</th>`+
					`<th class="text-center subheader">Total</th>`+
					`<th class="text-center subheader">Gain</th>`+
					`<th class="text-center subheader">Loss</th>`+
					`</tr>`;
		else if (section === 'tbody'){
			for (let cenario in stats)
				html += dashboardOps__Table_Stats__byCenario__newLine(cenario, stats[cenario], section);
		}
		else if (section === 'tfoot')
			html += dashboardOps__Table_Stats__byCenario__newLine('Total', stats, section);
		return html;
	}
	/*
		Retorna o html da seção de 'thead' ou 'tbody' da 'dashboard_ops__table_trades'.
	*/
	function rebuildDashboardOps__Table_Trades(section = '', trades = {}){
		let html = ``;
		if (section === 'thead')
			html += `<tr>`+
					`<th>#</th>`+
					`<th>Data</th>`+
					`<th>Cenário</th>`+
					`<th>Custo</th>`+
					`<th>Result. BRL</th>`+
					`<th>Result. R</th>`+
					`<th>Stop %</th>`+
					`<th>Alvo %</th>`+
					`</tr>`;
		else if (section === 'tbody'){
			for (let o in trades){
				html += `<tr>`+
						`<td name="trade__seq" class="text-muted fw-bold">${trades[o].trade__seq}</td>`+
						`<td name="trade__data" class="text-muted fw-bold">${Global.convertDate(trades[o].trade__data)}</td>`+
						`<td name="trade__cenario" class="fw-bold">${trades[o].trade__cenario}</td>`+
						`<td name="trade__custo" class="fw-bold text-danger">${trades[o].trade__custo}</td>`+
						`<td name="result__brl" class="fw-bold">${trades[o].result__brl}</td>`+
						`<td name="result__R" class="fw-bold">${trades[o].result__R}</td>`+
						`<td name="men__porc">${trades[o].men__porc}</td>`+
						`<td name="mep__porc">${trades[o].mep__porc}</td>`+
						`</tr>`;
			}
		}
		return html;
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*---------------------------- EXECUCAO DAS FUNCOES ------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------- Section Arcabouço --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------ Lista Arcabouços --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Processa o fechamento do modal 'arcaboucos_modal', para reconstrucao do arcabouço section.
	*/
	$(document.getElementById('arcaboucos_modal')).on('hidden.bs.modal', function (){
		if (_dashboard_ops__needRebuild){
			_dashboard_ops__needRebuild = false;
			rebuildArcaboucoSection(rebuildSearch = true);
		}
	});
	/*
		Processa a filtragem de dados em 'table_arcaboucos'.
	*/
	$(document.getElementById('arcaboucos_modal__search')).find('input[name],select[name]').on('change', function (){
		$(document.getElementById('table_arcaboucos')).DataTable().column(`${this.name}:name`).search(this.value).draw();
	});
	/*
		Marca os inputs que forem alterados.
	*/
	$(document.getElementById('arcaboucos_modal_form')).on('change', 'input[name],select[name!="usuarios"]', function (){
		this.setAttribute('changed', '');
	});
	/*
		Processa os cliques em 'table_arcaboucos'.
			 - Clicar na linha: Muda o arcabouço principal/(selecionado) na lista de instancias de arcabouço.
			 - Clicar + (Ctrl): Inclui esse arcabouço na lista de instancias de arcabouço.
	*/
	$(document.getElementById('table_arcaboucos')).on('click', 'tbody tr', function (e){
		if (window.getSelection().toString() || document.getSelection().toString())
			return false;
		if (e.target.nodeName !== 'BUTTON' && e.target.nodeName !== 'I'){
			let id_arcabouco = this.getAttribute('arcabouco');
			if (e.ctrlKey){
				//Se a instancia foi adicionada na lista
				if (_lista__instancias_arcabouco.add({id: id_arcabouco, nome: _lista__arcaboucos.arcaboucos[id_arcabouco].nome, selected: true})){
					_dashboard_ops__needRebuild = true;
					_list_ops__needRebuild = true;
					if (!(id_arcabouco in _lista__operacoes.operacoes)){
						Global.connect({
							data: {module: 'renda_variavel', action: 'get_arcabouco_data', params: {id_arcabouco: id_arcabouco}},
							success: function (result){
								if (result.status){
									_lista__cenarios.create(result.data['cenarios']);
									_lista__operacoes.update(result.data['operacoes']);
								}
								else
									Global.toast.create({location: document.getElementById('arcaboucos_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
							}
						});
					}
				}
			}
		}
	});
	/*
		Processa click em 'table_arcabouco' (Para Edição dos arcabouços)
			 - (Criador Apenas) Clicar em alterar arcabouço: Joga os dados para o formulario.
	*/
	$(document.getElementById('table_arcaboucos')).on('click', 'tbody tr td button[name="editar"]', function (e){
		let id_arcabouco = $(this).parentsUntil('tbody').last().attr('arcabouco'),
			usuarios_select = [],
			form = $(document.getElementById('arcaboucos_modal_form'));
		for (let u in _lista__arcaboucos.arcaboucos[id_arcabouco].usuarios)
			usuarios_select.push(_lista__arcaboucos.arcaboucos[id_arcabouco]['usuarios'][u].usuario);
		form.find('select[name="situacao"]').val(_lista__arcaboucos.arcaboucos[id_arcabouco].situacao).removeAttr('changed');
		form.find('select[name="tipo"]').val(_lista__arcaboucos.arcaboucos[id_arcabouco].tipo).removeAttr('changed');
		form.find('textarea[name="observacao"]').val(_lista__arcaboucos.arcaboucos[id_arcabouco].observacao).removeAttr('changed');
		form.find('input[name="nome"]').val(_lista__arcaboucos.arcaboucos[id_arcabouco].nome).removeAttr('changed');
		form.find('select[name="usuarios"]').selectpicker('val', usuarios_select);
		form.attr('id_arcabouco', id_arcabouco);
	});
	/*
		Processa os duplos cliques em 'table_arcaboucos'.
			 - (Criador Apenas) Duplo clique em remover arcabouço: Excluir esse arcabouço e todas as suas instancias da lista.
	*/
	$(document.getElementById('table_arcaboucos')).on('dblclick', 'tbody tr td button[name="remover"]', function (){
		let id_arcabouco = $(this).parentsUntil('tbody').last().attr('arcabouco');
		Global.connect({
			data: {module: 'renda_variavel', action: 'remove_arcaboucos', params: {id: id_arcabouco}},
			success: function (result){
				if (result.status){
					if (_lista__arcaboucos.remove(id_arcabouco)){
						_dashboard_ops__needRebuild = true;
						_list_ops__needRebuild = true;
					}
					buildArcaboucosTable();
				}
				else
					Global.toast.create({location: document.getElementById('arcaboucos_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
			}
		});
	});
	/*
		Cancela envio de adição ou edição de arcabouços, removendo os dados do formulário e resetando ele.
	*/
	$(document.getElementById('arcaboucos_modal_cancelar')).click(function (){
		resetFormArcaboucoModal();
	});
	/*
		Envia info do formulario de arcabouços para adicionar ou editar um arcabouço.
	*/
	$(document.getElementById('arcaboucos_modal_enviar')).click(function (){
		let form = $(document.getElementById('arcaboucos_modal_form'));
			id_arcabouco = form.attr('id_arcabouco'),
			data = {};
		form.find('input[name][changed],select[name!="usuarios"][changed],select[name="usuarios"]').each(function (){
			data[this.name] = $(this).val();
		});
		//Se for edição
		if (id_arcabouco){
			if (!Global.isObjectEmpty(data)){
				data['id'] = id_arcabouco;
				Global.connect({
					data: {module: 'renda_variavel', action: 'update_arcaboucos', params: data},
					success: function (result){
						if (result.status){
							Global.toast.create({location: document.getElementById('arcaboucos_modal_toasts'), color: 'success', body: 'Arcabouço Atualizado.', delay: 4000});
							resetFormArcaboucoModal();
							_lista__arcaboucos.update(result.data[0]);
							buildArcaboucosTable();
						}
						else
							Global.toast.create({location: document.getElementById('arcaboucos_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
					}
				});
			}
		}
		//Se for adição
		else{
			if (!('nome' in data) || data['nome'] === ''){
				Global.toast.create({location: document.getElementById('arcaboucos_modal_toasts'), color: 'warning', body: 'Nome inválido.', delay: 4000});
				return;
			}
			Global.connect({
				data: {module: 'renda_variavel', action: 'insert_arcaboucos', params: data},
				success: function (result){
					if (result.status){
						resetFormArcaboucoModal();
						_lista__arcaboucos.create(result.data);
						buildArcaboucosTable();
					}
					else
						Global.toast.create({location: document.getElementById('arcaboucos_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
				}
			});
		}
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------ Section Cenarios --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Processa o fechamento do modal 'cenarios_modal', para reconstrucao do arcabouço section.
	*/
	$(document.getElementById('cenarios_modal')).on('hidden.bs.modal', function (){
		if (_dashboard_ops__needRebuild){
			_dashboard_ops__needRebuild = false;
			rebuildArcaboucoSection(rebuildSearch = true);
		}
	});
	/*
		Processa o espelhamento de cenários de u outro arcabouço.
		Adiciona os cenarios de outro arcabouço, menos os que o nome já existir.
	*/
	$(document.getElementById('cenarios_modal_espelhar')).click(function (){
		let arcabouco_espelhar_select = $(document.getElementById('cenarios_modal_espelhar__arcaboucos')),
			id_arcabouco_espelhar = arcabouco_espelhar_select.val();
		if (id_arcabouco_espelhar !== ''){
			//Se as informações do cenario não estiver em memória buscar
			if (id_arcabouco_espelhar in _lista__cenarios.cenarios)
				buildCenarios_Espelhados(Object.values(_lista__cenarios.cenarios[id_arcabouco_espelhar]));
			else{
				Global.connect({
					data: {module: 'renda_variavel', action: 'get_cenarios', params: {id_arcabouco: id_arcabouco_espelhar}},
					success: function (result){
						if (result.status)
							buildCenarios_Espelhados(result.data);
						else
							Global.toast.create({location: document.getElementById('cenarios_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
					}
				});
			}
			arcabouco_espelhar_select.val('');
		}
	});
	/*
		Processa a adição de um novo Cenário.
	*/
	$(document.getElementById('cenarios_modal_adicionar')).click(function (){
		let copiar_cenario = $(document.getElementById('cenarios_modal_copiar')).val();
		if (copiar_cenario === '')
			$(document.getElementById('table_cenarios')).find('div[empty]').remove().end().prepend(buildCenario({}, true));
		else{
			let copy_data = {nome: '', premissas: [], observacoes: []},
				cenario = $(document.getElementById('table_cenarios')).find('input[name="cenario_nome"]').filter(function (){ return this.value === copiar_cenario; }).parentsUntil('#table_cenarios').last();
			//Pega o nome do cenario
			copy_data.nome = cenario.find('input[name="cenario_nome"]').val();
			//Pega as premissas
			cenario.find('div[target="premissas"] table tbody tr').each(function (i, tr){
				if (tr.hasAttribute('empty'))
					return;
				tr = $(tr);
				copy_data.premissas.push({
					nome: tr.find('input[name="nome"]').val(),
					ref: tr.find('input[name="ref"]').val(),
					cor: tr.find('input[name="cor"]').val(),
					obrigatoria: tr.find('input[name="obrigatoria"]').prop('checked'),
					inativo: tr.find('input[name="inativo"]').prop('checked')
				});
			});
			//Pega as observacoes
			cenario.find('div[target="observacoes"] table tbody tr').each(function (i, tr){
				if (tr.hasAttribute('empty'))
					return;
				tr = $(tr);
				copy_data.observacoes.push({
					nome: tr.find('input[name="nome"]').val(),
					ref: tr.find('input[name="ref"]').val(),
					cor: tr.find('input[name="cor"]').val(),
					inativo: tr.find('input[name="inativo"]').prop('checked')
				});
			});
			$(document.getElementById('table_cenarios')).find('div[empty]').remove().end().prepend(buildCenario(copy_data, true));
		}
	});
	/*
		Processa a remocao de cenarios com double click.
	*/
	$(document.getElementById('table_cenarios')).on('dblclick', 'button', function (){
		//Remove um cenario
		if (this.hasAttribute('remover_cenario')){
			let cenario_div = $(this).parentsUntil('#table_cenarios').last(),
				table_cenarios = cenario_div.parent();
			//Se é um novo cenario, apenas remove
			if (cenario_div[0].hasAttribute('new_cenario')){
				cenario_div.remove();
				if (table_cenarios.children().length === 0)
					table_cenarios.append(buildCenariosTable());
			}
			else{
				let remove_data = {id: cenario_div.attr('cenario')};
				Global.connect({
					data: {module: 'renda_variavel', action: 'remove_cenarios', params: remove_data},
					success: function (result){
						if (result.status){
							_dashboard_ops__needRebuild = true;
							_list_ops__needRebuild = true;
							Global.toast.create({location: document.getElementById('cenarios_modal_toasts'), color: 'success', body: 'Cenário Removido.', delay: 4000});
							_lista__cenarios.remove(remove_data.id);
							rebuildCenarios_modal_copiar();
							cenario_div.remove();
							if (table_cenarios.children().length === 0)
								table_cenarios.append(buildCenariosTable());
						}
						else
							Global.toast.create({location: document.getElementById('cenarios_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
					}
				});
			}
		}
	});
	/*
		Processa a adicao / remocao de linhas de premissas e observacoes.
	*/
	$(document.getElementById('table_cenarios')).on('click', 'button', function (e){
		//Apenas insere uma nova premissa
		if (this.hasAttribute('adicionar_premissa')){
			let me = $(this),
				html = 	`<tr new_premissa>`+
						`<td name="nome"><div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value=""><button class="btn btn-sm btn-outline-danger" type="button" remover_premissa>Excluir</button></div></td>`+
						`<td name="ref"><input type="text" name="ref" class="form-control form-control-sm text-center"></td>`+
						`<td name="cor"><div class="d-flex justify-content-center"><input type="color" name="cor" class="form-control form-control-sm form-control-color" value="#ffffff"></div></td>`+
						`<td name="obrigatoria"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="obrigatoria" class="form-check-input"></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input"></div></td>`+
						`</tr>`;
			me.parentsUntil('#table_cenarios').last().find('div[target="premissas"] tbody tr[empty]').remove();
			me.parentsUntil('#table_cenarios').last().find('div[target="premissas"] tbody').prepend(html).promise().then(function (){
				//Adiciona um badge mostrando a quantidade de premissas adicionadas
				let qtd_new = this.find('[new_premissa]').length,
					tab_premissas = me.parentsUntil('#table_cenarios').last().find('a.nav-link[target="premissas"]');
				tab_premissas.find('span.badge[new]').remove();
				tab_premissas.append(`<span class='badge bg-primary ms-1' new>+${qtd_new}</span>`);
			});
		}
		//Remove uma premissa
		if (this.hasAttribute('remover_premissa')){
			let me = $(this),
				premissa_row = me.parentsUntil('tbody').last();
			//Se é uma nova premissa, apenas remove
			if (premissa_row[0].hasAttribute('new_premissa')){
				let tbody = me.parentsUntil('table').last(),
					tab_premissas = me.parentsUntil('#table_cenarios').last().find('a.nav-link[target="premissas"]');
				premissa_row.remove().promise().then(function (){
					let qtd_new = tbody.find('[new_premissa]').length,
						qtd_total = tbody.find('tr').length;
					//Recontagem do badge mostrando a quantidade de premissas adicionadas
					tab_premissas.find('span.badge[new]').remove();
					if (qtd_new)
						tab_premissas.append(`<span class='badge bg-primary ms-1' new>+${qtd_new}</span>`);
					if (qtd_total === 0)
						tbody.append(buildListaPremissas_Observacoes({}, 1));
				});
			}
			//Se é uma remocao de premissa, marca ela para remocao no BD
			else{
				me.prop('disabled', true).removeClass('btn-danger').addClass('btn-secondary');
				premissa_row.attr('remover', '').find('input').prop('disabled', true);
				$(this).parentsUntil('#table_cenarios').last().find('button[salvar_cenario]').removeClass('disabled');
			}
		}
		//Apenas insere uma nova observacao
		if (this.hasAttribute('adicionar_observacao')){
			let me = $(this),
				html = 	`<tr new_observacao>`+
						`<td name="nome"><div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value=""><button class="btn btn-sm btn-outline-danger" type="button" remover_observacao>Excluir</button></div></td>`+
						`<td name="ref"><input type="text" name="ref" class="form-control form-control-sm text-center"></td>`+
						`<td name="cor"><div class="d-flex justify-content-center"><input type="color" name="cor" class="form-control form-control-sm form-control-color" value="#ffffff"></div></td>`+
						`<td name="inativo"><div class="form-check form-switch d-flex justify-content-center"><input type="checkbox" name="inativo" class="form-check-input"></div></td>`+
						`</tr>`;
			me.parentsUntil('#table_cenarios').last().find('div[target="observacoes"] tbody tr[empty]').remove();
			me.parentsUntil('#table_cenarios').last().find('div[target="observacoes"] tbody').prepend(html).promise().then(function (){
				//Adiciona um badge mostrando a quantidade de observacoes adicionadas
				let qtd_new = this.find('[new_observacao]').length,
					tab_observacoes = me.parentsUntil('#table_cenarios').last().find('a.nav-link[target="observacoes"]');
				tab_observacoes.find('span.badge[new]').remove();
				tab_observacoes.append(`<span class='badge bg-primary ms-1' new>+${qtd_new}</span>`);
			});
		}
		//Remove uma observacao
		if (this.hasAttribute('remover_observacao')){
			let me = $(this),
				observacao_row = me.parentsUntil('tbody').last();
			//Se é uma nova observacao, apenas remove
			if (observacao_row[0].hasAttribute('new_observacao')){
				let tbody = me.parentsUntil('table').last(),
					tab_observacoes = me.parentsUntil('#table_cenarios').last().find('a.nav-link[target="observacoes"]');
				observacao_row.remove().promise().then(function (){
					let qtd_new = tbody.find('[new_observacao]').length,
						qtd_total = tbody.find('tr').length;
					//Recontagem do badge mostrando a quantidade de premissas adicionadas
					tab_observacoes.find('span.badge[new]').remove();
					if (qtd_new)
						tab_observacoes.append(`<span class='badge bg-primary ms-1' new>+${qtd_new}</span>`);
					if (qtd_total === 0)
						tbody.append(buildListaPremissas_Observacoes({}, 2));
				});
			}
			//Se é uma remocao de observacao, marca ela para remocao no BD
			else{
				me.prop('disabled', true).removeClass('btn-danger').addClass('btn-secondary');
				observacao_row.attr('remover', '').find('input').prop('disabled', true);
				$(this).parentsUntil('#table_cenarios').last().find('button[salvar_cenario]').removeClass('disabled');
			}
		}
		//Processa a adição de um cenário no BD
		if (this.hasAttribute('salvar_novo_cenario')){
			let cenario_div = $(this).parentsUntil('#table_cenarios').last(),
				insert_data = cenarioGetData(cenario_div);
			if (!Global.isObjectEmpty(insert_data)){
				Global.connect({
					data: {module: 'renda_variavel', action: 'insert_cenarios', params: insert_data},
					success: function (result){
						if (result.status){
							_dashboard_ops__needRebuild = true;
							_list_ops__needRebuild = true;
							Global.toast.create({location: document.getElementById('cenarios_modal_toasts'), color: 'success', body: 'Cenário Adicionado.', delay: 4000});
							cenario_div.replaceWith(buildCenario(result.data[0], false));
							_lista__cenarios.update(result.data[0]);
							rebuildCenarios_modal_copiar();
						}
						else
							Global.toast.create({location: document.getElementById('cenarios_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
					}
				});
			}
		}
		//Processa a alteração de um cenário no BD
		if (this.hasAttribute('salvar_cenario')){
			let cenario_div = $(this).parentsUntil('#table_cenarios').last(),
				update_data = cenarioGetData(cenario_div);
			if (update_data['insert']['premissas'].length || update_data['insert']['observacoes'].length || update_data['update']['cenarios'].length || update_data['update']['premissas'].length || update_data['update']['observacoes'].length || update_data['remove']['premissas'].length || update_data['remove']['observacoes'].length){
				Global.connect({
					data: {module: 'renda_variavel', action: 'update_cenarios', params: update_data},
					success: function (result){
						if (result.status){
							_dashboard_ops__needRebuild = true;
							_list_ops__needRebuild = true;
							Global.toast.create({location: document.getElementById('cenarios_modal_toasts'), color: 'success', body: 'Cenário Atualizado.', delay: 4000});
							cenario_div.replaceWith(buildCenario(result.data[0], false));
							_lista__cenarios.update(result.data[0]);
							rebuildCenarios_modal_copiar();
						}
						else
							Global.toast.create({location: document.getElementById('cenarios_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
					}
				});
			}
		}
	});
	/*
		Facilita o seletor de obrigatoria e inativo, clicando tambem no TD.
	*/
	$(document.getElementById('table_cenarios')).on('click', 'td[name="obrigatoria"], td[name="inativo"]', function (e){
		if (e.target.tagName === 'INPUT')
			return true;
		let input = this.querySelector('input[type="checkbox"]');
		if (!input.hasAttribute('disabled'))
			$(input).trigger('click');
	});
	/*
		Marca tudo oque tiver mudança.
	*/
	$(document.getElementById('table_cenarios')).on('change', 'input[name]', function (){
		this.setAttribute('changed', '');
		if (this.name === 'ref')
			reorder_premissas_e_observacoes($(this).parentsUntil('table').last()[0]);
		let cenario_div = $(this).parentsUntil('#table_cenarios').last();
		if (cenario_div[0].hasAttribute('cenario'))
			cenario_div.find('button[salvar_cenario]').removeClass('disabled');
	});
	/*
		Processa a troca de abas entre 'Premissas' e 'Observações' no cenário.
	*/
	$(document.getElementById('table_cenarios')).on('click', 'a.nav-link', function (){
		if (Global.hasClass(this, 'active'))
			return false;
		let me = $(this);
		me.parentsUntil('div.card-header').last().find('a.active').removeClass('active');
		me.addClass('active');
		me.parentsUntil('#table_cenarios').last().find('div.card-body > div[target]').each(function (i, table){
			$(table).toggleClass('d-none', table.getAttribute('target') !== me.attr('target'));
		});
		//Altera o botao de adicionar entre 'adicionar_premissa' e 'adicionar_observacao'
		me.parentsUntil('#table_cenarios').last().find('button[adicionar_premissa],button[adicionar_observacao]').each(function (i, button){
			if (me.attr('target') === 'premissas')
				$(button).removeAttr('adicionar_observacao').attr('adicionar_premissa', '').html(`<i class="fas fa-plus me-2"></i>Adicionar Premissa`);
			else if (me.attr('target') === 'observacoes')
				$(button).removeAttr('adicionar_premissa').attr('adicionar_observacao', '').html(`<i class="fas fa-plus me-2"></i>Adicionar Observação`);
		});
		return false;
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*-------------------------- Section Operações Upload ----------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Processa o fechamento do modal 'upload_operacoes_modal', para reconstrucao do arcabouço section.
	*/
	$(document.getElementById('upload_operacoes_modal')).on('hidden.bs.modal', function (){
		if (_dashboard_ops__needRebuild){
			_dashboard_ops__needRebuild = false;
			rebuildArcaboucoSection(rebuildSearch = true);
			buildArcaboucosModal(firstBuild = false, forceRebuild = true, show = false);
		}
	});
	/*
		Processa a importação de um arquivo de operações.
	*/
	$(document.getElementById('upload_operacoes_modal_file')).change(function (){
		let file_import = this;
		_csv_reader.reader.onload = function fileReadCompleted(){
			let file_format = $(document.getElementById('file_format')).val(),
				table_layout = $(document.getElementById('table_layout')).val(),
				data_lines = _csv_reader.processData(_csv_reader.reader.result, {file_format: file_format}),
				csvData = null;
			if (data_lines.length){
				csvData = _csv_reader.cleanData(data_lines, {file_format: file_format, table_layout: table_layout});
				if (csvData.length)
					buildUploadOperacaoTable(csvData);
				else
					Global.toast.create({location: document.getElementById('upload_operacoes_modal_toasts'), color: 'danger', body: 'Falha ao ler o arquivo. (Número de colunas muda em certas linhas)', delay: 4000});
			}
			else
				Global.toast.create({location: document.getElementById('upload_operacoes_modal_toasts'), color: 'danger', body: 'Falha ao ler o arquivo. (Arquivo Vazio)', delay: 4000});
			file_import.value = '';
		};
		_csv_reader.reader.readAsText(this.files[0], 'ISO-8859-2');
	});
	/*
		Processa alteracoes no select de R:R, Vol, Entrada, Op e Ativo, para alterar o Stop e Alvo. (Caso o Vol e R:R esteja preenchido)
	*/
	// $(document.getElementById('table_upload_operacoes')).on('change', 'select[name="rr"]', function (){
	// 	let tr = $(this).parentsUntil('tbody').last(),
	// 		op = tr.find('select[name="op"]').val(),
	// 		pts_tick = tr.find('select[name="ativo"] option:selected').attr('pts_tick'),
	// 		rr = $(this).val().split(':'),
	// 		risco = ((rr.length === 2) ? parseInt(rr[0]) : 0),
	// 		retorno = ((rr.length === 2) ? parseInt(rr[1]) : 0),
	// 		vol = tr.find('input[name="vol"]').val(),
	// 		entrada = tr.find('input[name="entrada"]').val();
	// 	vol = ((vol !== '') ? parseFloat(vol) : 0.0);
	// 	pts_tick = ((pts_tick) ? parseFloat(pts_tick) : 0.0);
	// 	entrada = ((entrada !== '') ? parseFloat(entrada) : 0.0);
	// 	recalcStopeAlvo_OperacoesAddTable({op: op, pts_tick: pts_tick, risco: risco, retorno: retorno, vol: vol, entrada: entrada, tr: tr});
	// });
	// $(document.getElementById('table_upload_operacoes')).on('change', 'input[name="vol"]', function (){
	// 	let tr = $(this).parentsUntil('tbody').last(),
	// 		op = tr.find('select[name="op"]').val(),
	// 		pts_tick = tr.find('select[name="ativo"] option:selected').attr('pts_tick'),
	// 		rr = tr.find('select[name="rr"]').val().split(':'),
	// 		risco = ((rr.length === 2) ? parseInt(rr[0]) : 0),
	// 		retorno = ((rr.length === 2) ? parseInt(rr[1]) : 0),
	// 		vol = $(this).val(),
	// 		entrada = tr.find('input[name="entrada"]').val();
	// 	vol = ((vol !== '') ? parseFloat(vol) : 0.0);
	// 	pts_tick = ((pts_tick) ? parseFloat(pts_tick) : 0.0);
	// 	entrada = ((entrada !== '') ? parseFloat(entrada) : 0.0);
	// 	recalcStopeAlvo_OperacoesAddTable({op: op, pts_tick: pts_tick, risco: risco, retorno: retorno, vol: vol, entrada: entrada, tr: tr});
	// });
	// $(document.getElementById('table_upload_operacoes')).on('change', 'input[name="entrada"]', function (){
	// 	let tr = $(this).parentsUntil('tbody').last(),
	// 		op = tr.find('select[name="op"]').val(),
	// 		pts_tick = tr.find('select[name="ativo"] option:selected').attr('pts_tick'),
	// 		rr = tr.find('select[name="rr"]').val().split(':'),
	// 		risco = ((rr.length === 2) ? parseInt(rr[0]) : 0),
	// 		retorno = ((rr.length === 2) ? parseInt(rr[1]) : 0),
	// 		vol = tr.find('input[name="vol"]').val(),
	// 		entrada = $(this).val();
	// 	vol = ((vol !== '') ? parseFloat(vol) : 0.0);
	// 	pts_tick = ((pts_tick) ? parseFloat(pts_tick) : 0.0);
	// 	entrada = ((entrada !== '') ? parseFloat(entrada) : 0.0);
	// 	recalcStopeAlvo_OperacoesAddTable({op: op, pts_tick: pts_tick, risco: risco, retorno: retorno, vol: vol, entrada: entrada, tr: tr});
	// });
	// $(document.getElementById('table_upload_operacoes')).on('change', 'select[name="ativo"]', function (){
	// 	let tr = $(this).parentsUntil('tbody').last(),
	// 		op = tr.find('select[name="op"]').val(),
	// 		pts_tick = $(this).find('option:selected').attr('pts_tick'),
	// 		rr = tr.find('select[name="rr"]').val().split(':'),
	// 		risco = ((rr.length === 2) ? parseInt(rr[0]) : 0),
	// 		retorno = ((rr.length === 2) ? parseInt(rr[1]) : 0),
	// 		vol = tr.find('input[name="vol"]').val(),
	// 		entrada = tr.find('input[name="entrada"]').val();
	// 	vol = ((vol !== '') ? parseFloat(vol) : 0.0);
	// 	pts_tick = ((pts_tick) ? parseFloat(pts_tick) : 0.0);
	// 	entrada = ((entrada !== '') ? parseFloat(entrada) : 0.0);
	// 	recalcStopeAlvo_OperacoesAddTable({op: op, pts_tick: pts_tick, risco: risco, retorno: retorno, vol: vol, entrada: entrada, tr: tr});
	// });
	// $(document.getElementById('table_upload_operacoes')).on('change', 'select[name="op"]', function (){
	// 	let tr = $(this).parentsUntil('tbody').last(),
	// 		op = $(this).val(),
	// 		pts_tick = tr.find('select[name="ativo"] option:selected').attr('pts_tick'),
	// 		rr = tr.find('select[name="rr"]').val().split(':'),
	// 		risco = ((rr.length === 2) ? parseInt(rr[0]) : 0),
	// 		retorno = ((rr.length === 2) ? parseInt(rr[1]) : 0),
	// 		vol = tr.find('input[name="vol"]').val(),
	// 		entrada = tr.find('input[name="entrada"]').val();
	// 	vol = ((vol !== '') ? parseFloat(vol) : 0.0);
	// 	pts_tick = ((pts_tick) ? parseFloat(pts_tick) : 0.0);
	// 	entrada = ((entrada !== '') ? parseFloat(entrada) : 0.0);
	// 	recalcStopeAlvo_OperacoesAddTable({op: op, pts_tick: pts_tick, risco: risco, retorno: retorno, vol: vol, entrada: entrada, tr: tr});
	// });
	/*
		Envia as operações para serem registradas no BD.
	*/
	$(document.getElementById('upload_operacoes_modal_enviar')).click(function (){
		let table = $(document.getElementById('table_upload_operacoes')),
			insert_data = {id_arcabouco: _lista__instancias_arcabouco.getSelected('id'), operacoes: []};
		$(document.getElementById('table_upload_operacoes')).find('tbody tr').each(function (t, tr){
			tr = $(tr);
			let sequencia = tr.find('td[name="sequencia"]').attr('value'),
				data = tr.find('td[name="data"]').attr('value'),
				ativo = tr.find('td[name="ativo"]').attr('value'),
				op = tr.find('td[name="op"]').attr('value'),
				vol = tr.find('td[name="vol"]').attr('value'),
				cts = tr.find('td[name="cts"]').attr('value'),
				hora = tr.find('td[name="hora"]').attr('value'),
				erro = tr.find('td[name="erro"]').attr('value'),
				entrada = tr.find('td[name="entrada"]').attr('value'),
				stop = tr.find('td[name="stop"]').attr('value'),
				alvo = tr.find('td[name="alvo"]').attr('value'),
				men = tr.find('td[name="men"]').attr('value'),
				mep = tr.find('td[name="mep"]').attr('value'),
				saida = tr.find('td[name="saida"]').attr('value'),
				cenario = tr.find('td[name="cenario"]').attr('value'),
				premissas = tr.find('td[name="premissas"]').attr('value'),
				observacoes = tr.find('td[name="observacoes"]').attr('value'),
				ativo_custo = tr.find('td[name="ativo"]').attr('custo'),
				ativo_valor_tick = tr.find('td[name="ativo"]').attr('valor_tick'),
				ativo_pts_tick = tr.find('td[name="ativo"]').attr('pts_tick');
			insert_data['operacoes'].push({
				sequencia: sequencia,
				data: data,
				ativo: ativo,
				op: op,
				vol: vol,
				cts: cts,
				hora: hora,
				erro: erro,
				entrada: entrada,
				stop: stop,
				alvo: alvo,
				men: men,
				mep: mep,
				saida: saida,
				cenario: cenario,
				premissas: premissas,
				observacoes: observacoes,
				ativo_custo: ativo_custo,
				ativo_valor_tick: ativo_valor_tick,
				ativo_pts_tick: ativo_pts_tick
			});
		});
		if (insert_data['operacoes'].length){
			Global.connect({
				data: {module: 'renda_variavel', action: 'insert_operacoes', params: JSON.stringify(insert_data)},
				success: function (result){
					if (result.status){
						_dashboard_ops__needRebuild = true;
						_list_ops__needRebuild = true;
						_lista__operacoes.update(result['data']['operacoes']);
						_lista__arcaboucos.update(result['data']['arcabouco'][0]);
						if (result.hold_ops.length === 0){
							Global.toast.create({location: document.getElementById('upload_operacoes_modal_toasts'), color: 'success', body: 'Operações Adicionadas.', delay: 4000});
							document.getElementById('upload_operacoes_modal_file').value = '';
							document.getElementById('file_format').selectedIndex = 0;
							document.getElementById('table_layout').selectedIndex = 0;
							resetUploadOperacaoTable();
						}
						else{
							Global.toast.create({location: document.getElementById('upload_operacoes_modal_toasts'), color: 'warning', body: 'Essas operações já foram adicionadas.', delay: 4000});
							$(document.getElementById('table_upload_operacoes')).find('tbody tr').each(function (t, tr){
								tr = $(tr);
								let seq = tr.find('td[name="sequencia"]').attr('value');
								if (!result.hold_ops.includes(seq))
									tr.remove();
							});
						}
					}
					else
						Global.toast.create({location: document.getElementById('upload_operacoes_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
				}
			});
		}
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*--------------------------------- Lista Ops ------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Corrige bug no bootstrap que não mostra o offcanvas na 1 vez que abre.	
	*/
	$(document.getElementById('lista_ops')).on('shown.bs.offcanvas', function (){
		$(this).show();
	});
	/*
		Processa os cliques na tabela de operações de um arcabouço.
		Click:
			- (Ctrl): Selecionar 1 row.
	*/
	$(document.getElementById('lista_ops__table')).on('mousedown', 'tbody tr', function (e){
		//Ativa a seleção de linhas (Ctrl pressionado)
		if (e.ctrlKey){
			e.preventDefault();
			//Se ja ta selecionado, desmarca
			if (Global.hasClass(this, 'selected'))
				$(this).removeClass('selected');
			else{
				_lista_ops__table_DT_clickState = 1;
				$(this).addClass('selected');
			}
			let action_submenu = $(document.getElementById('lista_ops__actions'));
			if ($(document.getElementById('lista_ops__table')).find('tbody tr.selected').length === 0)
				action_submenu.find('button[name="remove_sel"]').addClass('d-none');
			else
				action_submenu.find('button[name="remove_sel"]').removeClass('d-none');
		}
		//Deseleciona tudo
		else{
			$(document.getElementById('lista_ops__table')).find('tbody tr.selected').removeClass('selected');
			$(document.getElementById('lista_ops__actions')).find('button[name="remove_sel"]').addClass('d-none');
		}
	}).on('mouseenter', 'tbody tr', function (e){
		//Seleciona linhas caso esteje segurando (Ctrl e Click)
		if (_lista_ops__table_DT_clickState && e.ctrlKey){
			e.preventDefault();
			$(this).addClass('selected');
		}
	}).on('mouseup', 'tbody tr', function (e){
		if (e.ctrlKey)
			_lista_ops__table_DT_clickState = 0;
	});
	/*
		Processa a remocao de tudo ou das operações selecionadas com double click.
	*/
	$(document.getElementById('lista_ops__actions')).on('dblclick', 'button[name]', function (){
		let remove_data = {};
		//Remove todas as operações do arcabouço
		if (this.name === 'remove_all')
			remove_data = {id_arcabouco: _lista__instancias_arcabouco.getSelected('id'), operacoes: []};
		else if (this.name === 'remove_sel'){
			remove_data = {id_arcabouco: _lista__instancias_arcabouco.getSelected('id'), operacoes: []};
			$(document.getElementById('lista_ops__table')).DataTable().rows({search: 'applied'}).nodes().each(function (tr){
				if (Global.hasClass(tr, 'selected'))
					remove_data['operacoes'].push(tr.getAttribute('operacao'));
			});
			if (remove_data['operacoes'].length === 0){
				Global.toast.create({location: document.getElementById('lista_ops_toasts'), color: 'danger', body: 'Nenhuma operação selecionada.', delay: 4000});
				return false;
			}
		}
		if (!Global.isObjectEmpty(remove_data)){
			Global.connect({
				data: {module: 'renda_variavel', action: 'remove_operacoes', params: remove_data},
				success: function (result){
					if (result.status){
						Global.toast.create({location: document.getElementById('lista_ops_toasts'), color: 'success', body: 'Operações Apagadas.', delay: 4000});
						_lista__operacoes.update(result['data']['operacoes']);
						_lista__arcaboucos.update(result['data']['arcabouco'][0]);
						buildArcaboucosModal(firstBuild = false, forceRebuild = true, show = false);
						buildOperacoesOffcanvas(forceRebuild = true);
						rebuildArcaboucoSection(rebuildSearch = true);
					}
					else
						Global.toast.create({location: document.getElementById('lista_ops_toasts'), color: 'danger', body: result.error, delay: 4000});
				}
			});
		}
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------- Dashboard Ops ----------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Processa um clique nas instancias de arcabouço.
			- Clique normal: Muda a instancia selecionada.
			- Clique + Ctrl: Remove a instancia da lista.
	*/
	$(document.getElementById('renda_variavel__instancias')).on('click', 'span.badge', function (e){
		if (e.ctrlKey)
			_lista__instancias_arcabouco.remove(this.getAttribute('instancia'));
		else{
			if (_lista__instancias_arcabouco.getSelected('instancia') !== this.getAttribute('instancia')){
				_lista__instancias_arcabouco.setSelected(this.getAttribute('instancia'));
				_list_ops__needRebuild = true;
				if (!(_lista__instancias_arcabouco.getSelected('id') in _lista__operacoes.operacoes)){
					Global.connect({
						data: {module: 'renda_variavel', action: 'get_arcabouco_data', params: {id_arcabouco: _lista__instancias_arcabouco.getSelected('id')}},
						success: function (result){
							if (result.status){
								_lista__cenarios.create(result.data['cenarios']);
								_lista__operacoes.update(result.data['operacoes']);
								rebuildArcaboucoSection(rebuildSearch = true);
							}
							else
								Global.toast.create({location: document.getElementById('master_toasts'), title: 'Erro', time: 'Now', body: result.error, delay: 4000});
						}
					});
				}
				else
					rebuildArcaboucoSection(rebuildSearch = true);
			}
		}
	});
	/*
		Processa as seleções de premissas e observações em 'filters'.
	*/
	$(document.getElementById('dashboard_ops__search')).on('click', 'div.iSelectKami[name] ul li button.dropdown-item', function (e){
		let me = $(this),
			cenario_nome = me.attr('pertence'),
			div_holder = me.parent().parent().parent(),
			select_name = div_holder.attr('name'),
			placeholder = {'premissas': 'Premissas', 'observacoes': 'Observações'},
			dashboard_filters = _lista__instancias_arcabouco.getSelected('filters'),
			selected_values = {},
			qtd_selected = 0;
		//Se o target não for um clique no input, processa a seleção da observação
		if (e.target.nodeName !== 'INPUT'){
			if (this.hasAttribute('selected')){
				me.removeAttr('selected').find('input[name="negar_valor"]').prop('checked', false);
				delete dashboard_filters['cenario'][cenario_nome][select_name][me.attr('value')];
			}
			else{
				me.attr('selected', '');
				dashboard_filters['cenario'][cenario_nome][select_name][me.attr('value')] = (me.find('input[name="negar_valor"]').prop('checked')) ? 1 : 0;
			}
		}
		//Se for no input, caso não esteja selecionado, des-checa o input
		else{
			if (!this.hasAttribute('selected'))
				me.find('input[name="negar_valor"]').prop('checked', false);
			else
				dashboard_filters['cenario'][cenario_nome][select_name][me.attr('value')] = (me.find('input[name="negar_valor"]').prop('checked')) ? 1 : 0;	
		}
		//Atualiza no localStorage
		_lista__instancias_arcabouco.updateInstancia_Filters('cenario', dashboard_filters['cenario']);
		//Atualiza o placeholder
		qtd_selected = div_holder.find('ul button.dropdown-item[selected]').length;
		div_holder.find('button.dropdown-toggle').html(((qtd_selected > 1) ? `${qtd_selected} items selected` : ((qtd_selected === 1) ? `1 item selected` : `${placeholder[select_name]}`)));
	});
	/*
		Processa a de-seleção de todos os valores no select de observações ou premissas.
	*/
	$(document.getElementById('dashboard_ops__search')).on('click', 'div.iSelectKami[name] ul li button[name="tira_tudo"]', function (){
		let div_holder = $(this).parent().parent().parent().parent(),
			select_name = div_holder.attr('name'),
			placeholder = {'premissas': 'Premissas', 'observacoes': 'Observações'},
			dashboard_filters = _lista__instancias_arcabouco.getSelected('filters');
		div_holder.find('ul button.dropdown-item[selected]').each(function (i, el){
			el.removeAttribute('selected');
			el.querySelector('input[name="negar_valor"]').checked = false;
		});
		for (cenario_nome in dashboard_filters['cenario'])
			dashboard_filters['cenario'][cenario_nome][select_name] = {};
		_lista__instancias_arcabouco.updateInstancia_Filters('cenario', dashboard_filters['cenario']);
		//Atualiza o placeholder
		div_holder.find('button.dropdown-toggle').html(`${placeholder[select_name]}`);
	});
	/*
		Processa no select de observações e premissas, mudança no tipo de query a ser formatada na filtragem. (OR ou AND)
	*/
	$(document.getElementById('dashboard_ops__search')).on('change', 'div.iSelectKami[name] ul li select.iSelectKami', function (){
		_lista__instancias_arcabouco.updateInstancia_Filters(this.name, $(this).val());
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------------- Menu Top -----------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Comanda cliques no menu de renda variavel.
	*/
	$('button', document.getElementById('renda_variavel__menu')).click(function (){
		if (this.name === 'arcaboucos')
			buildArcaboucosModal(firstBuild = false, forceRebuild = false, show = true);
		else if (this.name === 'cenarios')
			buildCenariosModal();
		else if (this.name === 'upload_operacoes')
			buildUploadOperacoesModal();
		else if (this.name === 'lista_ops')
			buildOperacoesOffcanvas(forceRebuild = false);
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------- INIT DO SISTEMA --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	Global.connect({
		data: {module: 'renda_variavel', action: 'get_arcabouco_data'},
		success: function (result){
			if (result.status){
				//Constroi a lista de Usuarios, Ativos e Arcabouços
				_lista__usuarios.update(result.data['usuarios']);
				_lista__ativos.update(result.data['ativos']);
				_lista__arcaboucos.create(result.data['arcaboucos']);
				//Inicia o modal de arcabouços
				buildArcaboucosModal(firstBuild = true, forceRebuild = true, show = false);
				//Inicia a lista de instancias (Com uma já salva ou uma nova) e termina de construir o arcabouço Section
				_lista__instancias_arcabouco.start(result.data);
				_list_ops__needRebuild = true;
			}
			else
				Global.toast.create({location: document.getElementById('master_toasts'), title: 'Erro', time: 'Now', body: result.error, delay: 4000});
		}
	});
	/*--------------------------------------------------------------------------------*/
	return {
		lista__ativos: _lista__ativos,
		rebuildArcaboucoSection: rebuildArcaboucoSection
	}
})();