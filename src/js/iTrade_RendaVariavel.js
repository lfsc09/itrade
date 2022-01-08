let Renda_variavel = (function(){
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------------ VARS --------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*-------------------------------- Renda Variavel --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	//Controla qual section esta sendo mostrada: 'dashboard_ops__section', 'analise_obs__section'
	let _renda_variavel__section = 'dashboard_ops__section';
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
	//Gerenciamentos
	//////////////////////////////////
	//Controla a lista de gerenciamentos cadastrados
	let	_lista__gerenciamentos = {
		//Lista de gerenciamentos cadastrados do usuario
		gerenciamentos: [],
		update: function (data){
			//Atualiza o Array
			this.gerenciamentos = data;
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
			class: ['--bs-blue', '--bs-indigo', '--bs-green', '--bs-orange', '--bs-yellow'],
			code: ['#0d6efd', '#6610f2', '#198754', '#fd7e14', '#ffc107'],
			code_transparent: ['rgba(13, 110, 253, 0.1)', 'rgba(102, 16, 242, 0.2)', 'rgba(25, 135, 84, 0.2)', 'rgba(253, 126, 20, 0.2)', 'rgba(255, 193, 7, 0.2)']
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
						//Inicia o 'renda_variavel__search' com os 'filters' e 'simulations'
						if (_renda_variavel__search.init()){
							//Constroi o dashboard_ops section
							if (_renda_variavel__section === 'dashboard_ops__section')
								rebuildDashboard_ops();
							//Ou constroi o analise_ops section
							else if (_renda_variavel__section === 'analise_obs__section')
								rebuildAnalise_obs();
						}
					}
					else{
						Global.connect({
							data: {module: 'renda_variavel', action: 'get_arcabouco_data', params: {id_arcabouco: this.instancias[instancia_selected_index].id}},
							success: function (result){
								if (result.status){
									//Inicia o arcabouço section com os cenarios e operações que vieram.
									_lista__cenarios.create(result.data['cenarios']);
									_lista__operacoes.update(result.data['operacoes']);
									//Inicia o 'renda_variavel__search' com os 'filters' e 'simulations'
									if (_renda_variavel__search.init()){
										//Constroi o dashboard_ops section
										if (_renda_variavel__section === 'dashboard_ops__section')
											rebuildDashboard_ops();
										//Ou constroi o analise_ops section
										else if (_renda_variavel__section === 'analise_obs__section')
											rebuildAnalise_obs();
									}
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
					chartColor_Transparent: this.colors.code_transparent[0],
					selected: true,
					filters: {},
					simulations: {}
				});
				rebuild__instanciasArcabouco_HTML();
				Global.browserStorage__Sync.set('instancias', this.instancias, 'localStorage');
				//Inicia o arcabouço section com os cenarios e operações desse arcabouço.
				_lista__cenarios.create(allData['cenarios']);
				_lista__operacoes.update(allData['operacoes']);
				//Inicia o 'renda_variavel__search' com os 'filters' e 'simulations'
				if (_renda_variavel__search.init()){
					//Constroi o dashboard_ops section
					if (_renda_variavel__section === 'dashboard_ops__section')
						rebuildDashboard_ops();
					//Ou constroi o analise_ops section
					else if (_renda_variavel__section === 'analise_obs__section')
						rebuildAnalise_obs();
				}
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
				chartColor_Transparent: this.colors.code_transparent[this.instancias.length],
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
		updateInstancia_Filters: function (key, value, rebuildSection = true){
			for (let i in this.instancias){
				if (this.instancias[i].selected){
					if (value !== '')
						this.instancias[i]['filters'][key] = value;
					else
						delete this.instancias[i]['filters'][key];
				}
			}
			if (rebuildSection){
				//Constroi o dashboard_ops section
				if (_renda_variavel__section === 'dashboard_ops__section')
					rebuildDashboard_ops();
				//Ou constroi o analise_ops section
				else if (_renda_variavel__section === 'analise_obs__section')
					rebuildAnalise_obs();
			}
			Global.browserStorage__Sync.set('instancias', this.instancias, 'localStorage');
		},
		//Atualiza os 'simulations' da instancia selecionada
		updateInstancia_Simulations: function (key, value, rebuildSection = true){
			for (let i in this.instancias){
				if (this.instancias[i].selected){
					if (value !== '')
						this.instancias[i]['simulations'][key] = value;
					else
						delete this.instancias[i]['simulations'][key];
					break;
				}
			}
			if (rebuildSection){
				//Constroi o dashboard_ops section
				if (_renda_variavel__section === 'dashboard_ops__section')
					rebuildDashboard_ops();
				//Ou constroi o analise_ops section
				else if (_renda_variavel__section === 'analise_obs__section')
					rebuildAnalise_obs();
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
			for (let i in this.instancias){
				this.instancias[i].color = this.colors.class[i];
				this.instancias[i].chartColor = this.colors.code[i];
				this.instancias[i].chartColor_Transparent = this.colors.code_transparent[i];
			}
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
	//Possui os 'filters' e 'simulation' usados em 'renda_variavel__search'
	let _renda_variavel__search = {
		filters: {
			data: null,
			hora: null,
			ativo: null,
			gerenciamento: null,
			cenario: null,
			observacoes: null
		},
		simulations: {
			periodo_calc: null,
			tipo_cts: null,
			cts: null,
			usa_custo: null,
			ignora_erro: null,
			tipo_parada: null,
			valor_parada: null,
			valor_inicial: null,
			R: null
		},
		init: function (){
			let me = this,
				renda_variavel__search = $(document.getElementById('renda_variavel__search')),
				selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
				dashboard_filters = _lista__instancias_arcabouco.getSelected('filters'),
				dashboard_simulations = _lista__instancias_arcabouco.getSelected('simulations'),
				ativos_in_operacoes = {},
				gerenciamento_in_operacoes = {},
				cenarios_in_operacoes = {},
				cenarios_by_nome = {},
				select_options_html = '';
			//Monta uma lista de cenarios usando o nome como chave
			for (let cn in _lista__cenarios.cenarios[selected_inst_arcabouco])
				cenarios_by_nome[_lista__cenarios.cenarios[selected_inst_arcabouco][cn].nome] = _lista__cenarios.cenarios[selected_inst_arcabouco][cn].id;
			//Captura dados das operações para montar os filtros
			for (let op in _lista__operacoes.operacoes[selected_inst_arcabouco]){
				ativos_in_operacoes[_lista__operacoes.operacoes[selected_inst_arcabouco][op].ativo] = null;
				gerenciamento_in_operacoes[_lista__operacoes.operacoes[selected_inst_arcabouco][op].gerenciamento] = null;
				cenarios_in_operacoes[_lista__operacoes.operacoes[selected_inst_arcabouco][op].cenario] = null;
			}
			//////////////////////////////////
			//Filtro da Data
			//////////////////////////////////
			let	data_inicial = (_lista__operacoes.operacoes[selected_inst_arcabouco].length) ? Global.convertDate(_lista__operacoes.operacoes[selected_inst_arcabouco][0].data) : moment().format('DD/MM/YYYY'),
				data_final = (_lista__operacoes.operacoes[selected_inst_arcabouco].length) ? Global.convertDate(_lista__operacoes.operacoes[selected_inst_arcabouco][_lista__operacoes.operacoes[selected_inst_arcabouco].length-1].data) : data_inicial;
			me.filters.data = renda_variavel__search.find('input[name="data"]');
			me.filters.data.on('apply.daterangepicker', function (ev, picker){
				//Apaga o filter de Data se a data for todo o periodo
				if (picker.startDate.isSame(picker.minDate) && picker.endDate.isSame(picker.maxDate)){
					_lista__instancias_arcabouco.updateInstancia_Filters('data_inicial', '');
					_lista__instancias_arcabouco.updateInstancia_Filters('data_final', '');
				}
				else{
					_lista__instancias_arcabouco.updateInstancia_Filters('data_inicial', picker.startDate.format('DD/MM/YYYY'));
					_lista__instancias_arcabouco.updateInstancia_Filters('data_final', picker.endDate.format('DD/MM/YYYY'));
				}
			});
			me.filters.data.daterangepicker({
				showDropdowns: true,
				minDate: data_inicial,
				startDate: ('data_inicial' in dashboard_filters) ? dashboard_filters['data_inicial'] : data_inicial,
				endDate: ('data_final' in dashboard_filters) ? dashboard_filters['data_final'] : data_final,
				maxDate: data_final,
				isInvalidDate: function(date) {
					//Desabilita os FDS
					return (date.day() == 0 || date.day() == 6);
				},
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
			me.filters.hora = renda_variavel__search.find('div[name="hora"]');
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
			select_options_html = (Object.keys(ativos_in_operacoes)).reduce((p, c) => p + `<option value="${c}" ${(('ativo' in dashboard_filters && dashboard_filters['ativo'].includes(c)) ? 'selected' : '' )}>${c}</option>`, '');
			me.filters.ativo = renda_variavel__search.find('select[name="ativo"]');
			me.filters.ativo.append(select_options_html).promise().then(function (){
				me.filters.ativo.selectpicker({
					title: 'Ativo',
					selectedTextFormat: 'count > 1',
					actionsBox: true,
					deselectAllText: 'Nenhum',
					selectAllText: 'Todos',
					style: '',
					styleBase: 'form-control form-control-sm'
				}).on('loaded.bs.select', function (){
					me.filters.ativo.parent().addClass('form-control');
				}).on('changed.bs.select', function (){
					_lista__instancias_arcabouco.updateInstancia_Filters('ativo', $(this).val());
				});
			});
			//////////////////////////////////
			//Filtro do Gerenciamento
			//////////////////////////////////
			let gerenciamento_in_operacoes__lista = Object.keys(gerenciamento_in_operacoes);
			select_options_html = gerenciamento_in_operacoes__lista.reduce((p, c) => p + `<option value="${c}">${c}</option>`, '');
			me.filters.gerenciamento = renda_variavel__search.find('select[name="gerenciamento"]');
			if (!('gerenciamento' in dashboard_filters) && gerenciamento_in_operacoes__lista.length)
				_lista__instancias_arcabouco.updateInstancia_Filters('gerenciamento', gerenciamento_in_operacoes__lista[0], rebuildSection = false);
			me.filters.gerenciamento.append(select_options_html).promise().then(function (){
				if ('gerenciamento' in dashboard_filters)
					me.filters.gerenciamento.val(dashboard_filters['gerenciamento']);
			});
			me.filters.gerenciamento.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Filters('gerenciamento', $(this).val());
			});
			//////////////////////////////////
			//Filtro de Cenario
			//////////////////////////////////
			let cenarios_in_operacoes__lista = Object.keys(cenarios_in_operacoes);
			select_options_html = Object.values(_lista__cenarios.cenarios[selected_inst_arcabouco]).reduce((p, c) => p + ((cenarios_in_operacoes__lista.includes(c.nome)) ? `<option value="${c.id}" ${((((!('cenario' in dashboard_filters) || Global.isObjectEmpty(dashboard_filters['cenario'])) && cenarios_in_operacoes__lista.length === 1 && p === '') || ('cenario' in dashboard_filters && c.nome in dashboard_filters['cenario'])) ? 'selected' : '' )}>${c.nome}</option>` : ``), '');
			me.filters.cenario = renda_variavel__search.find('select[name="cenario"]');
			if ((!('cenario' in dashboard_filters) || Global.isObjectEmpty(dashboard_filters['cenario'])) && cenarios_in_operacoes__lista.length === 1){
				let localStorage_data = {
					[cenarios_in_operacoes__lista[0]]: {
						id: cenarios_by_nome[cenarios_in_operacoes__lista[0]],
						observacoes: {}
					}
				}
				_lista__instancias_arcabouco.updateInstancia_Filters('cenario', localStorage_data, rebuildSection = false);
			}
			me.filters.cenario.append(select_options_html).promise().then(function (){
				me.filters.cenario.selectpicker({
					title: 'Cenários',
					selectedTextFormat: 'count > 2',
					actionsBox: true,
					deselectAllText: 'Nenhum',
					selectAllText: 'Todos',
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
							observacoes: ('cenario' in dashboard_filters && el.innerText in dashboard_filters['cenario']) ? dashboard_filters['cenario'][el.innerText]['observacoes'] : {}
						}
					});
					_lista__instancias_arcabouco.updateInstancia_Filters('cenario', localStorage_data);
					rebuildSelect_Observacoes__content(_lista__instancias_arcabouco.getSelected('id'));
				});
			});
			//////////////////////////////////
			//Filtro de Observacoes
			//////////////////////////////////
			me.filters.observacoes = renda_variavel__search.find('div[name="observacoes"]');
			rebuildSelect_Observacoes__content(selected_inst_arcabouco);
			//////////////////////////////////
			//Simulação de Periodo de Calculo
			//////////////////////////////////
			me.simulations.periodo_calc = renda_variavel__search.find('select[name="periodo_calc"]');
			me.simulations.periodo_calc.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, $(this).val());
			});
			if ('periodo_calc' in dashboard_simulations)
				me.simulations.periodo_calc.val(dashboard_simulations['periodo_calc']);
			//////////////////////////////////
			//Simulação de Tipo Cts e Cts
			//////////////////////////////////
			me.simulations.tipo_cts = renda_variavel__search.find('select[name="tipo_cts"]');
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
			me.simulations.cts = renda_variavel__search.find('input[name="cts"]');
			me.simulations.cts.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, $(this).val());
			});
			if ('tipo_cts' in dashboard_simulations)
				me.simulations.tipo_cts.val(dashboard_simulations['tipo_cts']);
			if ('cts' in dashboard_simulations)
				me.simulations.cts.val(dashboard_simulations['cts']).prop('disabled', false);
			me.simulations.cts.inputmask({alias: 'numeric', digitsOptional: false, digits: 0, rightAlign: false, placeholder: '0'});
			//////////////////////////////////
			//Simulação de Usa Custos
			//////////////////////////////////
			me.simulations.usa_custo = renda_variavel__search.find('select[name="usa_custo"]');
			me.simulations.usa_custo.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, $(this).val());
			});
			if ('usa_custo' in dashboard_simulations)
				me.simulations.usa_custo.val(dashboard_simulations['usa_custo']);
			//////////////////////////////////
			//Simulação de Ignora Erros
			//////////////////////////////////
			me.simulations.ignora_erro = renda_variavel__search.find('select[name="ignora_erro"]');
			me.simulations.ignora_erro.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, $(this).val());
			});
			if ('ignora_erro' in dashboard_simulations)
				me.simulations.ignora_erro.val(dashboard_simulations['ignora_erro']);
			/////////////////////////////////////////////
			//Simulação de Tipo Parada e Valor Parada
			/////////////////////////////////////////////
			me.simulations.tipo_parada = renda_variavel__search.find('select[name="tipo_parada"]');
			me.simulations.tipo_parada.change(function (){
				let value = $(this).val();
				if (value === '0'){
					me.simulations.valor_parada.val('').prop('disabled', true);
					_lista__instancias_arcabouco.updateInstancia_Simulations('valor_parada', '');
				}
				else
					me.simulations.valor_parada.prop('disabled', false);
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, value);
			});
			me.simulations.valor_parada = renda_variavel__search.find('input[name="valor_parada"]');
			me.simulations.valor_parada.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, $(this).val());
			});
			if ('tipo_parada' in dashboard_simulations)
				me.simulations.tipo_parada.val(dashboard_simulations['tipo_parada']);
			if ('valor_parada' in dashboard_simulations)
				me.simulations.valor_parada.val(dashboard_simulations['valor_parada']).prop('disabled', false);
			me.simulations.valor_parada.inputmask({alias: 'numeric', digitsOptional: false, digits: 2, rightAlign: false, placeholder: '0'});
			//////////////////////////////////
			//Simulação de Simular Capital
			//////////////////////////////////
			me.simulations.valor_inicial = renda_variavel__search.find('input[name="valor_inicial"]');
			me.simulations.valor_inicial.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, $(this).val());
			});
			if ('valor_inicial' in dashboard_simulations)
				me.simulations.valor_inicial.val(dashboard_simulations['valor_inicial']);
			me.simulations.valor_inicial.inputmask({alias: 'numeric', digitsOptional: false, digits: 2, rightAlign: false, placeholder: '0'});
			//////////////////////////////////
			//Simulação de Simular R
			//////////////////////////////////
			me.simulations.R = renda_variavel__search.find('input[name="R"]');
			me.simulations.R.change(function (){
				_lista__instancias_arcabouco.updateInstancia_Simulations(this.name, $(this).val());
			});
			if ('R' in dashboard_simulations)
				me.simulations.R.val(dashboard_simulations['R']);
			me.simulations.R.inputmask({alias: 'numeric', digitsOptional: false, digits: 2, rightAlign: false, placeholder: '0'});
			return true;
		},
		update: function (){
			let me = this,
				selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
				dashboard_filters = _lista__instancias_arcabouco.getSelected('filters'),
				dashboard_simulations = _lista__instancias_arcabouco.getSelected('simulations'),
				ativos_in_operacoes = {},
				gerenciamento_in_operacoes = {},
				cenarios_in_operacoes = {},
				cenarios_by_nome = {},
				select_options_html = '';
			//Monta uma lista de cenarios usando o nome como chave
			for (let cn in _lista__cenarios.cenarios[selected_inst_arcabouco])
				cenarios_by_nome[_lista__cenarios.cenarios[selected_inst_arcabouco][cn].nome] = _lista__cenarios.cenarios[selected_inst_arcabouco][cn].id;
			for (let op in _lista__operacoes.operacoes[selected_inst_arcabouco]){
				ativos_in_operacoes[_lista__operacoes.operacoes[selected_inst_arcabouco][op].ativo] = null;
				gerenciamento_in_operacoes[_lista__operacoes.operacoes[selected_inst_arcabouco][op].gerenciamento] = null;
				cenarios_in_operacoes[_lista__operacoes.operacoes[selected_inst_arcabouco][op].cenario] = null;
			}
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
			select_options_html = (Object.keys(ativos_in_operacoes)).reduce((p, c) => p + `<option value="${c}" ${(('ativo' in dashboard_filters && dashboard_filters['ativo'].includes(c)) ? 'selected' : '' )}>${c}</option>`, '');
			me.filters.ativo.empty().append(select_options_html).promise().then(function (){
				me.filters.ativo.selectpicker('refresh');
			});
			//////////////////////////////////
			//Filtro do Gerenciamento
			//////////////////////////////////
			let gerenciamento_in_operacoes__lista = Object.keys(gerenciamento_in_operacoes);
			select_options_html = gerenciamento_in_operacoes__lista.reduce((p, c) => p + `<option value="${c}">${c}</option>`, '');
			if (!('gerenciamento' in dashboard_filters) && gerenciamento_in_operacoes__lista.length)
				_lista__instancias_arcabouco.updateInstancia_Filters('gerenciamento', gerenciamento_in_operacoes__lista[0], rebuildSection = false);
			me.filters.gerenciamento.empty().append(select_options_html).promise().then(function (){
				if ('gerenciamento' in dashboard_filters)
					me.filters.gerenciamento.val(dashboard_filters['gerenciamento']);
			});
			//////////////////////////////////
			//Filtro de Cenario
			//////////////////////////////////
			let cenarios_in_operacoes__lista = Object.keys(cenarios_in_operacoes);
			select_options_html = Object.values(_lista__cenarios.cenarios[selected_inst_arcabouco]).reduce((p, c) => p + ((cenarios_in_operacoes__lista.includes(c.nome)) ? `<option value="${c.id}" ${((((!('cenario' in dashboard_filters) || Global.isObjectEmpty(dashboard_filters['cenario'])) && cenarios_in_operacoes__lista.length === 1 && p === '') || ('cenario' in dashboard_filters && c.nome in dashboard_filters['cenario'])) ? 'selected' : '' )}>${c.nome}</option>` : ``), '');
			if ((!('cenario' in dashboard_filters) || Global.isObjectEmpty(dashboard_filters['cenario'])) && cenarios_in_operacoes__lista.length === 1){
				let localStorage_data = {
					[cenarios_in_operacoes__lista[0]]: {
						id: cenarios_by_nome[cenarios_in_operacoes__lista[0]],
						observacoes: {}
					}
				}
				_lista__instancias_arcabouco.updateInstancia_Filters('cenario', localStorage_data, rebuildSection = false);
			}
			me.filters.cenario.empty().append(select_options_html).promise().then(function (){
				me.filters.cenario.selectpicker('refresh');
			});
			//////////////////////////////////
			//Filtro de Observacoes
			//////////////////////////////////
			rebuildSelect_Observacoes__content(selected_inst_arcabouco);
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
			/////////////////////////////////////////////
			//Simulação de Tipo Parada e Valor Parada
			/////////////////////////////////////////////
			if ('tipo_parada' in dashboard_simulations)
				me.simulations.tipo_parada.val(dashboard_simulations['tipo_parada']);
			else
				me.simulations.tipo_parada[0].selectedIndex = 0;
			if ('valor_parada' in dashboard_simulations)
				me.simulations.valor_parada.val(dashboard_simulations['valor_parada']).prop('disabled', false);
			else
				me.simulations.valor_parada.val('').prop('disabled', true);
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
			{name: 'data_atualizacao', orderable: true, type: 'br-datetime'},
			{name: 'qtd_ops', orderable: true},
			{name: 'usuarios', orderable: false},
			{name: 'editar', orderable: false},
			{name: 'remover', orderable: false}
		],
		lengthChange: false,
		order: [[ 4, 'desc' ]],
		pageLength: 10,
		pagingType: 'input'
	}
	//Editor da Observação do arcabouço (Plugin CKEditor5)
	let _arcabouco__ckeditor = null,
		_arcabouco__ckeditor__changed = false;
	let _arcabouco__ckeditor_config = {
		language: 'pt-br',
		licenseKey: ''
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------- Arcabouco Info ---------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	//Informa se o 'arcabouco_info' precisa ser reconstruido
	let _arcabouco_info__needRebuild = false;
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
			cenario: null,
			gerenciamento: null
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
					isInvalidDate: function(date) {
						//Desabilita os FDS
						return (date.day() == 0 || date.day() == 6);
					},
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
			let ativos_in_operacoes = {},
				gerenciamento_in_operacoes = {},
				select_options_html = '';
			for (let op in _lista__operacoes.operacoes[selected_inst_arcabouco]){
				ativos_in_operacoes[_lista__operacoes.operacoes[selected_inst_arcabouco][op].ativo] = null;
				gerenciamento_in_operacoes[_lista__operacoes.operacoes[selected_inst_arcabouco][op].gerenciamento] = null;
			}
			//////////////////////////////////
			//Filtro do Ativo
			//////////////////////////////////
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
			//////////////////////////////////
			//Filtro do Gerenciamento
			//////////////////////////////////
			select_options_html = (Object.keys(gerenciamento_in_operacoes)).reduce((p, c) => p + `<option value="${c}">${c}</option>`, '');
			if (me.filters.gerenciamento === null){
				me.filters.gerenciamento = lista_ops__search.find('select[name="gerenciamento"]');
				me.filters.gerenciamento.append(select_options_html).promise().then(function (){
					me.filters.gerenciamento.selectpicker({
						title: 'Gerenciamento',
						selectedTextFormat: 'count > 1',
						actionsBox: true,
						deselectAllText: 'Nenhum',
						selectAllText: 'Todos',
						style: '',
						styleBase: 'form-control form-control-sm'
					}).on('loaded.bs.select', function (){
						me.filters.gerenciamento.parent().addClass('form-control');
					}).on('changed.bs.select', function (){
						$(document.getElementById("lista_ops__table")).DataTable().draw();
					});
				});
			}
			else{
				me.filters.gerenciamento.empty().append(select_options_html).promise().then(function (){
					me.filters.gerenciamento.selectpicker('refresh');
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
			{name: 'gerenciamento', orderable: true},
			{name: 'op', orderable: false},
			{name: 'resultado', orderable: true},
			{name: 'vol', orderable: true, render: _lista_ops__table_DT_ext.vol_render},
			{name: 'cenario', orderable: true},
			{name: 'observacoes', orderable: false},
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
	/*------------------------------- Operações Upload -------------------------------*/
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
							gerenciamento: obj[line][dataMap.indexOf('R:R')],
							vol: ((dataMap.indexOf('Vol') !== -1) ? (obj[line][dataMap.indexOf('Vol')].replace(/\.+/g, '')).replace(/\,+/g, '.') : ''),
							cts: obj[line][dataMap.indexOf('Cts')],
							cenario: obj[line][dataMap.indexOf('Padrao')],
							observacoes: ((dataMap.indexOf("Observacoes") !== -1)?obj[line][dataMap.indexOf("Observacoes")].split(',') : []),
							erro: ((dataMap.indexOf('Erro') !== -1) ? obj[line][dataMap.indexOf('Erro')] : ''),
							data: obj[line][dataMap.indexOf('Data')],
							hora: obj[line][dataMap.indexOf('Hora')],
							resultado: ((dataMap.indexOf('Resultado') !== -1) ? (obj[line][dataMap.indexOf('Resultado')].replace(/\.+/g, '')).replace(/\,+/g, '.') : ''),
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
							preco_venda = parseFloat((obj[line][dataMap.indexOf('Preço Venda')].replace(/\.+/g, '')).replace(/\,+/g, '.'));
						if (options.table_layout === 'scalp'){
							newData.push({
								ativo: obj[line][dataMap.indexOf('Ativo')],
								op: ((operacao === 'C') ? 1 : 2),
								gerenciamento: '',
								vol: '',
								//Profit mostra Qtd Compra e Qtd Venda. Em uma Compra eu quero saber quando eu vendi (qtd. de saída). Em uma Venda o contrário.
								cts: ((operacao === 'C') ? obj[line][dataMap.indexOf('Qtd Venda')] : obj[line][dataMap.indexOf('Qtd Compra')]),
								cenario: '',
								observacoes: [],
								erro: '',
								data: obj[line][dataMap.indexOf('Abertura')].split(' ')[0],
								hora: obj[line][dataMap.indexOf('Abertura')].split(' ')[1],
								resultado: ((operacao === 'C') ? preco_compra : preco_venda)
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
								gerenciamento: '',
								vol: '',
								cts: obj[line][dataMap.indexOf('Qtd')],
								cenario: '',
								observacoes: [],
								erro: '',
								data: obj[line][dataMap.indexOf('Data')],
								hora: obj[line][dataMap.indexOf('Abertura')],
								resultado: ((operacao === 'C') ? preco_compra : preco_venda)
							});
						}
					}
				}
			}
			return newData;
		}
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------ Operações Adicionar -----------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	//Informa qual tipo de bloco deve construir seguindo o inicial: (Com ações do gerenciamento) | (Sem ações do gerenciamento)
	let _new_bloco__type__com_acoes = null;
	////////////////////////////////////////////////////////////////////////////////////
	/*---------------------------- Section Dashboard Ops -----------------------------*/
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
				return (ctx) => { return ('parsed' in ctx && ctx.parsed.y > 0) ? '#198754' : (('parsed' in ctx && ctx.parsed.y < 0) ? '#dc3545' : '#ced4da'); }
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
		}
	}
	//Configuração da tabela de operações em 'lista_ops'
	let _dashboard_ops__table_trades_DT = {
		columns: [
			{name: 'trade__seq', orderable: true},
			{name: 'trade__data', orderable: true, type: 'br-date'},
			{name: 'trade__cenario', orderable: true},
			{name: 'trade__cts', orderable: true},
			{name: 'result_bruto__brl', orderable: true, render: _dashboard_ops__table_trades_DT_ext.result__brl},
			{name: 'result_bruto__R', orderable: true, render: _dashboard_ops__table_trades_DT_ext.result__R},
			{name: 'trade__custo', orderable: true, render: _dashboard_ops__table_trades_DT_ext.trade__custo},
			{name: 'result__brl', orderable: true, render: _dashboard_ops__table_trades_DT_ext.result__brl},
			{name: 'result__R', orderable: true, render: _dashboard_ops__table_trades_DT_ext.result__R}
		],
		createdRow: function (row, data, index){
			let classes = ['text-muted fw-bold', 'text-muted fw-bold', 'fw-bold', 'fw-bold', 'fw-bold', 'fw-bold', 'fw-bold text-danger', 'fw-bold', 'fw-bold'];
			for (var i=0; i<_dashboard_ops__table_trades_DT["columns"].length; i++){
				row.children[i].setAttribute("name", _dashboard_ops__table_trades_DT["columns"][i]["name"]);
				row.children[i].setAttribute("class", classes[i]);
			}
		},
		lengthChange: false,
		info: false,
		dom: '<"container-fluid p-0"<"row"<"col-12"<"card rounded-3 shadow-sm"<"card-body py-2 d-flex justify-content-between align-items-center head"fp>>>><"row mt-2"<"col-12"<"card rounded-3 shadow-sm"<"card-body body"t>>>>>',
		order: [[ 0, 'desc' ]],
		pageLength: 12,
		pagingType: 'input'
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------- Section Analise Obs ------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	//Informa se o 'analise_obs' precisa ser reconstruido
	let _analise_obs__needRebuild = false;
	//Controla qual seção do analise_obs mostrar 'data', 'empty' ou 'building'
	let _analise_obs__section = {
		sections: {'data': 2, 'empty': 0, 'building': 0},
		show: function (section_target, step = 0){
			if (step === this.sections[section_target]){
				$(document.getElementById('analise_obs__section')).find('> div[target]').each(function (){
					$(this).toggleClass('d-none', this.getAttribute('target') !== section_target);
				});
			}
		}
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------------- FUNCOES ------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------- Renda Variavel ---------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Altera a seção visivel entre 'dashboard_ops__section', 'analise_obs__section'
	*/
	function changeSection__Renda_variavel(section){
		let renda_variavel = $(document.getElementById('renda_variavel'));
		_renda_variavel__section = section;
		if (_renda_variavel__section === 'dashboard_ops__section'){
			renda_variavel.find('#analise_obs__section').addClass('d-none');
			renda_variavel.find('#dashboard_ops__section').removeClass('d-none');
			if (_analise_obs__needRebuild){
				_analise_obs__needRebuild = false;
				rebuildAnalise_obs();
			}
		}
		else if (_renda_variavel__section === 'analise_obs__section'){
			renda_variavel.find('#dashboard_ops__section').addClass('d-none');
			renda_variavel.find('#analise_obs__section').removeClass('d-none');
			if (_dashboard_ops__needRebuild){
				_dashboard_ops__needRebuild = false;
				rebuildDashboard_ops();
			}
		}
	}
	/*
		Reconstroi a lista de instacia em 'renda_variavel__instancias'.
	*/
	function rebuild__instanciasArcabouco_HTML(){
		let html = ``;
		for (let i in _lista__instancias_arcabouco.instancias)
			html += `<span class="badge badge-primary rounded-pill p-2 ${((i > 0) ? 'ms-2' : '')}" style="background-color: var(${_lista__instancias_arcabouco.instancias[i].color}) !important" instancia="${_lista__instancias_arcabouco.instancias[i].instancia}">${((_lista__instancias_arcabouco.instancias[i].selected) ? `<i class="fas fa-crown me-2"></i>` : '')}${_lista__instancias_arcabouco.instancias[i].nome}</span>`;
		$(document.getElementById('renda_variavel__instancias')).empty().append(html);
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
		form.find('select[name!="usuarios"]').prop('selectedIndex', 0).removeAttr('changed');
		form.find('select[name="usuarios"]').selectpicker('deselectAll');
		_arcabouco__ckeditor.setData('');
		_arcabouco__ckeditor__changed = false;
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
			ClassicEditor.create(document.getElementById('arcabouco_modal__observacao'), _arcabouco__ckeditor_config).then(editor => {
				_arcabouco__ckeditor = editor;
				_arcabouco__ckeditor.model.document.on('change', () => {
					_arcabouco__ckeditor__changed = true;
				});
			}).catch(error => {console.error(error);});
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
			html = ``;
		table.DataTable().destroy();
		//Constroi tabela de informacoes dos arcabouços
		for (let ar in _lista__arcaboucos.arcaboucos){
			let usuarios_html = ``;
			for (let usu in _lista__arcaboucos.arcaboucos[ar]['usuarios'])
				usuarios_html += `<span class="badge ${((_lista__arcaboucos.arcaboucos[ar]['usuarios'][usu].criador == 1) ? 'bg-primary' : 'bg-secondary')} ${((usu !== 0) ? 'ms-1' : '')} my-1">${_lista__arcaboucos.arcaboucos[ar]['usuarios'][usu].usuario}</span>`;
			html += `<tr arcabouco="${_lista__arcaboucos.arcaboucos[ar].id}">`+
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
	/*--------------------------------- Lista Ativos ---------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Reseta o formulário 'arcaboucos_modal_form'.
	*/
	function resetFormAtivosModal(){
		let form = $(document.getElementById('ativos_modal_form'));
		form.removeAttr('id_ativo');
		form.find('input[name]').val('').removeAttr('changed');
	}
	/*
		Constroi o modal de gerenciamento de arcabouços.
	*/
	function buildAtivosModal(firstBuild = false, show = false){
		if (firstBuild){
			let form = $(document.getElementById('ativos_modal_form')),
				ano = (new Date()).getFullYear();
			form.find('input[name="nome"]').inputmask({mask: '*{*}', definitions: {'*': {casing: 'upper'}}, placeholder: ''});
			form.find('input[name="custo"]').inputmask({alias: 'numeric', digitsOptional: false, digits: 2, rightAlign: false, placeholder: '0'});
			form.find('input[name="valor_tick"]').inputmask({alias: 'numeric', digitsOptional: false, digits: 2, rightAlign: false, placeholder: '0'});
			form.find('input[name="pts_tick"]').inputmask({alias: 'numeric', digitsOptional: false, digits: 2, rightAlign: false, placeholder: '0'});
			buildAtivosTable();
			//Constroi a tabela de serie de contratos do WIN
			buildTableWinSeries(ano);
			//Constroi a tabela de serie de contratos do WDO
			buildTableWdoSeries(ano);
			$(document.getElementById('ativos_modal__vencimentos_search')).find('input[name="ano"]').val(ano);
		}
		if (show){
			//Reseta o formulario de cadastro e edição
			resetFormAtivosModal();
			$(document.getElementById('ativos_modal')).modal('show');
		}
	}
	/*
		Constroi a tabela de ativos.
	*/
	function buildAtivosTable(){
		let table = $(document.getElementById('table_ativos')),
			html = ``;
		//Constroi tabela de ativos
		for (let a in _lista__ativos.ativos){
			html += `<tr ativo="${_lista__ativos.ativos[a].id}">`+
					`<td name="nome" class="fw-bold">${_lista__ativos.ativos[a].nome}</td>`+
					`<td name="custo" class="fw-bold">${_lista__ativos.ativos[a].custo}</td>`+
					`<td name="valor_tick" class="fw-bold">${_lista__ativos.ativos[a].valor_tick}</td>`+
					`<td name="pts_tick" class="fw-bold">${_lista__ativos.ativos[a].pts_tick}</td>`+
					`<td name="editar" class="text-center"><button class="btn btn-sm btn-light" type="button" name="editar"><i class="fas fa-edit"></i></button></td>`+
					`<td name="remover" class="text-center"><button class="btn btn-sm btn-light" type="button" name="remover"><i class="fas fa-trash text-danger"></i></button></td>`+
					`</tr>`;
		}
		table.find('tbody').empty().append(html);
	}
	/*
		Retorna a quarta-feira do mes mais próxima do dia 15.
	*/
	function buildTableWinSeries__getQuartas15(ano, mes){
		let d = new Date(ano, mes, 1),
			wednesdays = [],
			choosen_wed = null;
		// Get the first Wednesday in the month
		while (d.getDay() !== 3)
			d.setDate(d.getDate() + 1);
		// Get all the other Wednesdays in the month
		while (d.getMonth() === mes){
			let day = (new Date(d.getTime())).getDate();
			wednesdays.push({
				'day': day,
				'diff': Math.abs(day - 15)
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
	}
	/*
		Constroi a tabela de vencimentos do WIN.
	*/
	function buildTableWinSeries(ano){
		let tbody_win_series = $('tbody', document.getElementById('ativos_modal__vencimentos_table_win_series')),
			html = ``,
			today = new Date(),
			first_day = null,
			last_day = null,
			data = '',
			serie_class = '';
		//Dez - Fev
		first_day = buildTableWinSeries__getQuartas15(ano - 1, 11);
		last_day = buildTableWinSeries__getQuartas15(ano, 1) - 1;
		data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano-1, 11, 1))} <span class="daylish">${first_day}</span><span class="mx-2">-</span>${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 1, 1))} <span class="daylish">${last_day}</span>`;
		if (today.getFullYear() == ano){
			serie_class = '';
			//Para segunda parte de Dezembro
			if (today.getMonth() == 11 && today.getDate() >= buildTableWinSeries__getQuartas15(ano, 11))
				serie_class = ' class="table-success"';
			//Para Janeiro
			else if (today.getMonth() == 0)
				serie_class = ' class="table-success"';
			//Para primeira parte de Fevereiro
			else if (today.getMonth() == 1 && today.getDate() <= last_day)
				serie_class = ' class="table-success"';
		}
		html += `<tr><td name="data">${data}</td><td name="serie"${serie_class}>G</td></tr>`;
		//Fev - Abr
		first_day = buildTableWinSeries__getQuartas15(ano, 1);
		last_day = buildTableWinSeries__getQuartas15(ano, 3) - 1;
		data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 1, 1))} <span class="daylish">${first_day}</span><span class="mx-2">-</span>${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 3, 1))} <span class="daylish">${last_day}</span>`;
		if (today.getFullYear() == ano){
			serie_class = '';
			//Para segunda parte de Fevereiro
			if (today.getMonth() == 1 && today.getDate() >= first_day)
				serie_class = ' class="table-success"';
			//Para Março
			else if (today.getMonth() == 2)
				serie_class = ' class="table-success"';
			//Para primeira parte de Abril
			else if (today.getMonth() == 3 && today.getDate() <= last_day)
				serie_class = ' class="table-success"';
		}
		html += `<tr><td name="data">${data}</td><td name="serie"${serie_class}>J</td></tr>`;
		//Abr - Jun
		first_day = buildTableWinSeries__getQuartas15(ano, 3);
		last_day = buildTableWinSeries__getQuartas15(ano, 5) - 1;
		data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 3, 1))} <span class="daylish">${first_day}</span><span class="mx-2">-</span>${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 5, 1))} <span class="daylish">${last_day}</span>`;
		if (today.getFullYear() == ano){
			serie_class = '';
			//Para segunda parte de Abril
			if (today.getMonth() == 3 && today.getDate() >= first_day)
				serie_class = ' class="table-success"';
			//Para Maio
			else if (today.getMonth() == 4)
				serie_class = ' class="table-success"';
			//Para primeira parte de Junho
			else if (today.getMonth() == 5 && today.getDate() <= last_day)
				serie_class = ' class="table-success"';
		}
		html += `<tr><td name="data">${data}</td><td name="serie"${serie_class}>M</td></tr>`;
		//Jun - Ago
		first_day = buildTableWinSeries__getQuartas15(ano, 5);
		last_day = buildTableWinSeries__getQuartas15(ano, 7) - 1;
		data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 5, 1))} <span class="daylish">${first_day}</span><span class="mx-2">-</span>${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 7, 1))} <span class="daylish">${last_day}</span>`;
		if (today.getFullYear() == ano){
			serie_class = '';
			//Para segunda parte de Junho
			if (today.getMonth() == 5 && today.getDate() >= first_day)
				serie_class = ' class="table-success"';
			//Para Julho
			else if (today.getMonth() == 6)
				serie_class = ' class="table-success"';
			//Para primeira parte de Agosto
			else if (today.getMonth() == 7 && today.getDate() <= last_day)
				serie_class = ' class="table-success"';
		}
		html += `<tr><td name="data">${data}</td><td name="serie"${serie_class}>Q</td></tr>`;
		//Ago - Out
		first_day = buildTableWinSeries__getQuartas15(ano, 7);
		last_day = buildTableWinSeries__getQuartas15(ano, 9) - 1;
		data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 7, 1))} <span class="daylish">${first_day}</span><span class="mx-2">-</span>${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 9, 1))} <span class="daylish">${last_day}</span>`;
		if (today.getFullYear() == ano){
			serie_class = '';
			//Para segunda parte de Agosto
			if (today.getMonth() == 7 && today.getDate() >= first_day)
				serie_class = ' class="table-success"';
			//Para Stembro
			else if (today.getMonth() == 8)
				serie_class = ' class="table-success"';
			//Para primeira parte de Outubro
			else if (today.getMonth() == 9 && today.getDate() <= last_day)
				serie_class = ' class="table-success"';
		}
		html += `<tr><td name="data">${data}</td><td name="serie"${serie_class}>V</td></tr>`;
		//Out - Dez
		first_day = buildTableWinSeries__getQuartas15(ano, 9);
		last_day = buildTableWinSeries__getQuartas15(ano, 11) - 1;
		data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 9, 1))} <span class="daylish">${first_day}</span><span class="mx-2">-</span>${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, 11, 1))} <span class="daylish">${last_day}</span>`;
		if (today.getFullYear() == ano){
			serie_class = '';
			//Para segunda parte de Outubro
			if (today.getMonth() == 9 && today.getDate() >= first_day)
				serie_class = ' class="table-success"';
			//Para Novembro
			else if (today.getMonth() == 10)
				serie_class = ' class="table-success"';
			//Para primeira parte de Dezembro
			else if (today.getMonth() == 11 && today.getDate() <= last_day)
				serie_class = ' class="table-success"';
		}
		html += `<tr><td name="data">${data}</td><td name="serie"${serie_class}>Z</td></tr>`;
		tbody_win_series.empty().append(html);
	}
	/*
		Constroi a tabela de vencimentos do WDO.
	*/
	function buildTableWdoSeries(ano){
		let tbody_wdo_series = $('tbody', document.getElementById('ativos_modal__vencimentos_table_wdo_series')),
			html = ``,
			series = ['G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z', 'F'],
			today = new Date();
		for (let m=0; m<12; m++){
			let first_day = (new Date(ano, m, 1)).getDate(),
				last_day = new Date(ano, m+1, 0).getDate(),
				data = `<span class="badge bg-light text-capitalize text-dark">${new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(new Date(ano, m, 1))} <span class="daylish">${first_day}</span> - <span class="daylish">${last_day}</span></span>`,
				serie_class = '';
			if (today.getFullYear() == ano && today.getMonth() == m)
				serie_class = ' class="table-success"';
			html += `<tr><td name="data">${data}</td><td name="serie"${serie_class}>${series[m]}</td></tr>`;
		}
		tbody_wdo_series.empty().append(html);
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*---------------------------- Lista Gerenciamentos ------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Reseta o formulário 'arcaboucos_modal_form'.
	*/
	function resetFormGerenciamentoModal(){
		let form = $(document.getElementById('gerenciamentos_modal_form'));
		form.removeAttr('id_gerenciamento');
		form.find('input[name]').val('').removeAttr('changed');
		form.find('#gerenciamentos_modal_form__acoes').empty();
	}
	/*
		Constroi o modal de gerenciamento de arcabouços.
	*/
	function buildGerenciamentosModal(forceRebuild = false, show = false){
		if (forceRebuild)
			buildGerenciamentosTable();
		if (show){
			//Reseta o formulario de cadastro e edição
			resetFormGerenciamentoModal();
			$(document.getElementById('gerenciamentos_modal')).modal('show');
		}
	}
	/*
		Constroi a tabela de gerenciamentos.
	*/
	function buildGerenciamentosTable(){
		let table = $(document.getElementById('table_gerenciamentos')),
			html = ``;
		//Constroi tabela de gerenciamentos
		for (let g in _lista__gerenciamentos.gerenciamentos){
			let acoes = ``;
			for (let ac=0; ac < _lista__gerenciamentos.gerenciamentos[g]['acoes'].length; ac++)
				acoes += `<button type="button" class="btn btn-sm ${((parseFloat(_lista__gerenciamentos.gerenciamentos[g]['acoes'][ac]) < 0) ? 'btn-danger' : 'btn-success')} flex-fill">${Math.abs(parseFloat(_lista__gerenciamentos.gerenciamentos[g]['acoes'][ac]))}S${((_lista__gerenciamentos.gerenciamentos[g]['escaladas'][ac] != 0) ? ` E${_lista__gerenciamentos.gerenciamentos[g]['escaladas'][ac]}` : ``)}</button>`;
			if (acoes !== '')
				acoes = `<div class="input-group d-flex">${acoes}</div>`;
			html += `<tr gerenciamento="${_lista__gerenciamentos.gerenciamentos[g].id}">`+
					`<td name="nome" class="fw-bold">${_lista__gerenciamentos.gerenciamentos[g].nome}</td>`+
					`<td name="acoes" class="fw-bold">${acoes}</td>`+
					`<td name="editar" class="text-center"><button class="btn btn-sm btn-light" type="button" name="editar"><i class="fas fa-edit"></i></button></td>`+
					`<td name="remover" class="text-center"><button class="btn btn-sm btn-light" type="button" name="remover"><i class="fas fa-trash text-danger"></i></button></td>`+
					`</tr>`;
		}
		table.find('tbody').empty().append(html);
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------- Arcabouco Info ---------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Gera as observações e cenários para o offcanvas 'arcabouco_info'.
	*/
	function buildArcaboucoInfo__CenariosEObs(id_arcabouco){
		let html = { table: ``, select: `<option value="">Todos</option>`};
		for (let c in _lista__cenarios.cenarios[id_arcabouco]){
			//Constroi o Select de filtro
			html['select'] += `<option value="${_lista__cenarios.cenarios[id_arcabouco][c].id}">${_lista__cenarios.cenarios[id_arcabouco][c].nome}</option>`;
			for (let o = 0; o < _lista__cenarios.cenarios[id_arcabouco][c]['observacoes'].length; o++){
				html['table'] += `<tr cenario="${_lista__cenarios.cenarios[id_arcabouco][c].id}" ${((o === 0 && html['table'] !== '') ? `class="divider"` : ``)}>`+
								 ((o === 0) ? `<td name="cenario" rowspan="${_lista__cenarios.cenarios[id_arcabouco][c]['observacoes'].length}"><span class="text-small"><code>${_lista__cenarios.cenarios[id_arcabouco][c].nome}</code></span></td>` : ``)+
								 `<td name="ref"><span class="text-small"><code>${_lista__cenarios.cenarios[id_arcabouco][c]['observacoes'][o].ref}</code></span></td>`+
								 `<td name="observacao"><span class="text-small"><code>${_lista__cenarios.cenarios[id_arcabouco][c]['observacoes'][o].nome}</code></span></td>`+
								 `</tr>`;
			}
		}
		return html;
	}
	/*
		Gera as estatisticas para o offcanvas 'arcabouco_info'.
	*/
	function buildArcaboucoInfo__Stats(id_arcabouco){
		let stats = {
			total: 0,
			dias: 0,
			por_gerenciamento: {},
			por_ativo: {}
		}
		let temp = { data_unica: {} }
		for (let o = 0; o < _lista__operacoes.operacoes[id_arcabouco].length; o++){
			stats.total++;
			temp.data_unica[_lista__operacoes.operacoes[id_arcabouco][o].data] = null;
			//Por Gerenciamento
			if (!(_lista__operacoes.operacoes[id_arcabouco][o].gerenciamento in stats.por_gerenciamento))
				stats.por_gerenciamento[_lista__operacoes.operacoes[id_arcabouco][o].gerenciamento] = { total: 0, cenario: {}};
			stats.por_gerenciamento[_lista__operacoes.operacoes[id_arcabouco][o].gerenciamento].total++;
			//Por Cenario no Gerenciamento
			if (!(_lista__operacoes.operacoes[id_arcabouco][o].cenario in stats.por_gerenciamento[_lista__operacoes.operacoes[id_arcabouco][o].gerenciamento]['cenario']))
				stats.por_gerenciamento[_lista__operacoes.operacoes[id_arcabouco][o].gerenciamento]['cenario'][_lista__operacoes.operacoes[id_arcabouco][o].cenario] = { total: 0, por_dia: 0 };
			stats.por_gerenciamento[_lista__operacoes.operacoes[id_arcabouco][o].gerenciamento]['cenario'][_lista__operacoes.operacoes[id_arcabouco][o].cenario].total++;
			//Por Ativo
			if (!(_lista__operacoes.operacoes[id_arcabouco][o].ativo in stats.por_ativo))
				stats.por_ativo[_lista__operacoes.operacoes[id_arcabouco][o].ativo] = 0;
			stats.por_ativo[_lista__operacoes.operacoes[id_arcabouco][o].ativo]++;
		}
		stats.dias = Object.keys(temp.data_unica).length;
		for (let g in stats.por_gerenciamento)
			for (let c in stats.por_gerenciamento[g]['cenario'])
				stats.por_gerenciamento[g]['cenario'][c].por_dia = stats.por_gerenciamento[g]['cenario'][c].total / stats.dias;
		return stats;
	}
	/*
		Constroi o offcanvas de 'arcabouco_info'.
	*/
	function buildArcaboucoInfoOffcanvas(){
		if (_arcabouco_info__needRebuild){
			_arcabouco_info__needRebuild = false;
			let id_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
				stats_data = buildArcaboucoInfo__Stats(id_arcabouco),
				cenarios_obs__html = buildArcaboucoInfo__CenariosEObs(id_arcabouco),
				first_tr_block = 0,
				html = ``;
			//Constroi a seção com as observações do arcabouço
			html += `<div class="card rounded-3 shadow-sm arcabouco_info__observacao">`+
					`<div class="card-body">${_lista__arcaboucos.arcaboucos[id_arcabouco].observacao}</div>`+
					`</div>`;
			//Constroi o filtro de cenários do arcabouço
			html += `<div class="card rounded-3 shadow-sm mt-2 arcabouco_info__cenarios__filter">`+
					`<div class="card-body p-0">`+
					`<select name="cenario" class="form-select form-select-sm">${cenarios_obs__html.select}</select>`+
					`</div>`+
					`</div>`;
			//Constroi a lista de observações por cenário do arcabouço
			html += `<div class="card rounded-3 shadow-sm mt-2 arcabouco_info__cenarios_obs">`+
					`<div class="card-body">`+
					`<table class="table table-sm table-borderless m-0">`+
					`<tbody>${cenarios_obs__html.table}</tbody>`+
					`</table>`+
					`</div>`+
					`</div>`;
			//Constroi a seção com informações adicionais
			html += `<div class="card rounded-3 shadow-sm mt-2 arcabouco_info__stats">`+
					`<div class="card-body">`+
					`<div class="row">`+
					`<div class="col">`+
					`<table class="table table-sm table-borderless m-0">`+
					`<tbody>`+
					//Quantidade de dias operados
					`<tr><td class="fw-bold"><span class="text-small"><code>Dias Operados</code></span></td><td class="text-end fw-bold"><span class="text-small"><code>${stats_data.dias}</code></span></td></tr>`+
					//Total de operações cadastradas no Arcabouço
					`<tr><td class="fw-bold"><span class="text-small"><code>Trades Total</code></span></td><td class="text-end fw-bold"><span class="text-small"><code>${stats_data.total}</code></span></td></tr>`;
			//Quantidade de operações por Gerenciamento
			for (let gerenciamento in stats_data.por_gerenciamento){
				html += `<tr ${((first_tr_block++ === 0) ? `class="divider"` : ``)}><td class="fw-bold"><span class="text-small"><code>${gerenciamento}</code></span></td><td class="text-end fw-bold"><span class="text-small"><code>${stats_data.por_gerenciamento[gerenciamento].total}</code></span></td></tr>`;
				for (let cenario in stats_data['por_gerenciamento'][gerenciamento]['cenario'])
					html += `<tr><td><span class="text-small"><code>&nbsp;&nbsp;&nbsp;${cenario}</code></span></td><td class="text-end"><span class="text-small media_por_dia fst-italic me-1"><code>(~${stats_data.por_gerenciamento[gerenciamento]['cenario'][cenario].por_dia.toFixed(2)})</code></span><span class="text-small"><code>${stats_data.por_gerenciamento[gerenciamento]['cenario'][cenario].total}</code></span></td></tr>`;
			}
			//Quantidade de operações por Ativo
			first_tr_block = 0;
			for (let ativo in stats_data.por_ativo)
				html += `<tr ${((first_tr_block++ === 0) ? `class="divider"` : ``)}><td class="fw-bold"><span class="text-small"><code>${ativo}</code></span></td><td class="text-end fw-bold"><span class="text-small"><code>${stats_data.por_ativo[ativo]}</code></span></td></tr>`;
			html += `</tbody>`+
					`</table>`+
					`</div>`+
					`</div>`+
					`</div>`+
					`</div>`;
			$(document.getElementById('arcabouco_info_place')).empty().append(html);
		}
		$(document.getElementById('arcabouco_info')).offcanvas('show');
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*-------------------------------- Lista Cenarios --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Faz a reordenacao das linhas da tabela com base nas prioridades.
	*/
	function reorder_observacoes(tbody){
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
		let id_arcabouco = _lista__instancias_arcabouco.getSelected('id');
		if (_lista__arcaboucos.arcaboucos[id_arcabouco].sou_criador == 1)
			$(document.getElementById('cenarios_modal_copiar')).empty().append(buildCenariosCopySelect());
		else
			$(document.getElementById('cenarios_modal_copiar')).empty();
	}
	/*
		Constroi o modal de gerenciamento de cenarios.
	*/
	function buildCenariosModal(){
		let id_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
			modal = $(document.getElementById('cenarios_modal'));
		//Se sou criador do arcabouço
		if (_lista__arcaboucos.arcaboucos[id_arcabouco].sou_criador == 1){
			modal.find('#cenarios_modal_espelhar, #cenarios_modal_adicionar').removeClass('disabled');
			modal.find('#cenarios_modal_espelhar__arcaboucos').empty().append(buildCenariosEspelhaSelect());
		}
		else{
			modal.find('#cenarios_modal_espelhar, #cenarios_modal_adicionar').addClass('disabled');
			modal.find('#cenarios_modal_espelhar__arcaboucos').empty();
		}
		rebuildCenarios_modal_copiar();
		modal.find('#cenarios_modal__cenarios').empty().append(buildCenariosPlace(_lista__cenarios.cenarios[_lista__instancias_arcabouco.getSelected('id')]));
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
		Constroi as secoes de observacoes de um cenario.
	*/
	function buildListaObservacoes(data, new_data = false){
		if (Global.isObjectEmpty(data))
			return { thead: ``, tbody: `<tr empty><td colspan="3" class="text-muted text-center fw-bold p-3"><i class="fas fa-cookie-bite me-2"></i>Nenhuma Observação.</td></tr>` }
		let edit_data = (_lista__arcaboucos.arcaboucos[_lista__instancias_arcabouco.getSelected('id')].sou_criador == 1),
			html = { thead: `<tr><th class="border-0 text-center">Ref</th><th class="border-0">Nome</th><th class="border-0 text-center">Desativar</th></tr>`, tbody: `` };
		for (let p in data){
			let input_group = ``;
			//Apenas o criador pode Remover Observações
			if (edit_data)
				input_group = `<div class="input-group"><input type="text" name="nome" class="form-control form-control-sm" value="${(('nome' in data[p]) ? data[p].nome : '')}"><button class="btn btn-sm btn-outline-danger" type="button" remover_observacao>Excluir</button></div>`;
			else
				input_group = `<input type="text" name="nome" class="form-control form-control-sm" value="${(('nome' in data[p]) ? data[p].nome : '')}" disabled>`;
			html['tbody'] += `<tr ${((new_data)?`new_observacao`:`observacao="${data[p].id}"`)}>`+
							 `<td name="ref"><input type="text" name="ref" class="form-control form-control-sm text-center" value="${(('ref' in data[p]) ? data[p].ref : '')}" ${((edit_data) ? '' : 'disabled')}></td>`+
							 `<td name="nome">${input_group}</td>`+
							 `<td name="inativo"><div class="form-check form-switch d-flex justify-content-center align-items-center"><input type="checkbox" name="inativo" class="form-check-input" ${((edit_data) ? '' : 'disabled')} ${(('inativo' in data[p] && data[p].inativo == 1) ? 'checked' : '')}></div></td>`+
							 `</tr>`;
		}
		return html;
	}
	/*
		Constroi um cenarios com observacoes.
	*/
	function buildCenario(data = {}, new_cenario = false){
		let id_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
			html = ('observacoes' in data) ? buildListaObservacoes(data['observacoes'], new_cenario) : buildListaObservacoes({}, new_cenario),
			input_group = ``,
			excluir_cenario = ``,
			salvar_cenario = ``;
		//Apenas o criador pode Adicionar / Alterar / Remover informações
		if (_lista__arcaboucos.arcaboucos[id_arcabouco].sou_criador == 1){
			input_group = `<div class="input-group"><input type="text" name="cenario_nome" class="form-control form-control-sm" value="${(('nome' in data) ? data.nome : '')}"><button type="button" class="btn btn-sm btn-outline-primary" adicionar_observacao><i class="fas fa-plus me-2"></i>Observação</button></div>`;
			excluir_cenario = `<button type="button" class="btn btn-sm btn-danger ms-auto" title="Duplo Clique" remover_cenario><i class="fas fa-trash-alt me-2"></i>Excluir Cenário</button>`;
			salvar_cenario = (new_cenario) ? `<button type="button" class="btn btn-sm btn-success ms-2" salvar_novo_cenario>Adicionar Cenário</button>` : (('id' in data) ? `<button type="button" class="btn btn-sm btn-success ms-2 disabled" salvar_cenario>Salvar</button>` : ``);
		}
		else
			input_group = `<input type="text" name="cenario_nome" class="form-control form-control-sm" value="${(('nome' in data) ? data.nome : '')}" disabled>`;
		return  `<div class="card text-center mt-3" ${((new_cenario) ? `new_cenario` : (('id' in data) ? `cenario="${data.id}"` : ``))}>`+
				`<div class="card-header d-flex">`+
				`<div class="col-md-5">`+
				`${input_group}`+
				`</div>`+
				`${(('observacoes' in data) ? ((new_cenario) ? ((data['observacoes'].length) ? `<button class="btn btn-sm btn-outline-primary disabled ms-2 fw-bold" num_obs__new>+${data['observacoes'].length}</button>` : ``) : `<button class="btn btn-sm btn-outline-secondary disabled ms-2 fw-bold" num_obs>${data['observacoes'].length}</button>`) : ``)}`+
				`${excluir_cenario}`+
				`${salvar_cenario}`+
				`</div>`+
				`<div class="card-body py-1 ${((!new_cenario) ? 'd-none' : '')}">`+
				`<table class="table m-0 me-3">`+
				`<thead>${html.thead}</thead>`+
				`<tbody>${html.tbody}</tbody>`+
				`</table>`+
				`</div>`+
				`</div>`;
	}
	/*
		Constroi a 'place' de cenários.
	*/
	function buildCenariosPlace(data = {}){
		let html = ``;
		for (let c in data)
			html += buildCenario(data[c], false);
		if (html === '')
			html = `<div class="container-fluid mt-3 p-4 text-center text-muted fw-bold" empty><i class="fas fa-cookie-bite me-2"></i>Nenhum Cenário.</div>`;
		return html;
	}
	/*
		Constrói os cenários de passados, que são de outro arcabouço. (Se o o nome do cenário já existir pula)
	*/
	function buildCenarios_Espelhados(data){
		let place = $(document.getElementById('cenarios_modal__cenarios')),
			cenarios_ja_existentes = [];
		if (data.length){
			//Remove label inicial de 'Nenhum Cenário'
			place.find('div[empty]').remove();
			//Busca os cenarios ja existentes
			place.find('input[name="cenario_nome"]').each(function (){
				cenarios_ja_existentes.push(this.value);
			});
			for (let c in data){
				if (!cenarios_ja_existentes.includes(data[c].nome))
					place.prepend(buildCenario(data[c], true));
			}
		}
	}
	/*
		Coleta os dados para envio em Adicionar / Alterar / Remover cenarios e (Observacoes).
	*/
	function cenarioGetData(cenario){
		let data = {};
		//Cenarios novos
		if (cenario[0].hasAttribute('new_cenario')){
			data.nome = cenario.find('input[name="cenario_nome"]').val();
			if (data.nome === '')
				return {};
			data.id_arcabouco = _lista__instancias_arcabouco.getSelected('id');
			data.observacoes = [];
			cenario.find('tr[new_observacao]').each(function (r, row){
				let nome = row.querySelector('input[name="nome"]').value,
					ref = row.querySelector('input[name="ref"]').value;
				if (nome !== '' && ref !== ''){
					data.observacoes.push({
						nome: nome,
						ref: ref,
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
					//Observacoes de cenarios ja exitentes
					observacoes: []
				},
				update: {
					//Dados do cenario
					cenarios: [],
					//Dados de observações de cenarios
					observacoes: []
				},
				remove: {
					//Observações de cenarios
					observacoes: []
				}
			};
			//Verifica mudancas no nome do cenario
			let cenario_nome_input = cenario.find('input[name="cenario_nome"]');
			if (cenario_nome_input[0].hasAttribute('changed') && cenario_nome_input.val() !== '')
				data['update']['cenarios'].push({nome: cenario_nome_input.val()});
			//Verifica novas observacoes
			cenario.find('tr[new_observacao]').each(function (r, row){
				let nome = row.querySelector('input[name="nome"]').value,
					ref = row.querySelector('input[name="ref"]').value;
				if (nome !== '' && ref !== ''){
					data['insert']['observacoes'].push({
						nome: nome,
						ref: ref,
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
	/*--------------------------------- Lista Ops ------------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Constroi o offcanvas de 'lista_ops'.
	*/
	function buildOperacoesOffcanvas(forceRebuild = false){
		if (_list_ops__needRebuild || forceRebuild){
			_list_ops__needRebuild = false;
			let lista_ops__table = $(document.getElementById('lista_ops__table'));
			lista_ops__table.DataTable().destroy();
			lista_ops__table.find('tbody').empty().append(rebuildListaOps__Table()).promise().then(function (){
				_lista_ops__search.update();
				lista_ops__table.DataTable(_lista_ops__table_DT);
			});
			$(document.getElementById('lista_ops__actions')).find('button[name="remove_sel"]').addClass('d-none');
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
					`<td class="fw-bold text-muted" name="gerenciamento">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].gerenciamento}</td>`+
					`<td name="op"><span class="badge ${op_dic['color'][_lista__operacoes.operacoes[selected_inst_arcabouco][o].op]}">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].cts}${op_dic['text'][_lista__operacoes.operacoes[selected_inst_arcabouco][o].op]}</span></td>`+
					`<td class="fw-bold text-muted" name="vol">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].vol}</td>`+
					`<td class="fw-bold text-muted" name="resultado">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].resultado}</td>`+
					`<td class="fw-bold text-muted" name="cenario">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].cenario}</td>`+
					`<td class="fw-bold text-muted" name="observacoes">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].observacoes}</td>`+
					`<td name="erro">${_lista__operacoes.operacoes[selected_inst_arcabouco][o].erro}</td>`+
					`</tr>`;
		}
		return html;
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------- Operações Upload -------------------------------*/
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
			gerenciamentos_dic = {'': {nome: '', acoes: ''}},
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
		for (let ge in _lista__gerenciamentos.gerenciamentos){
			gerenciamentos_dic[_lista__gerenciamentos.gerenciamentos[ge].nome] = {
				nome: _lista__gerenciamentos.gerenciamentos[ge].nome,
				acoes_text: JSON.stringify(_lista__gerenciamentos.gerenciamentos[ge].acoes)
			}
		}
		//Constroi o THEAD
		if (table_layout === 'scalp'){
			thead_html += `<tr>`+
						  `<th name="sequencia">#</th>`+
						  `<th name="data">Data</th>`+
						  `<th name="ativo">Ativo</th>`+
						  `<th name="op">Op.</th>`+
						  `<th name="gerenciamento">Gerencimento</th>`+
						  `<th name="vol">Vol</th>`+
						  `<th name="cts">Cts</th>`+
						  `<th name="hora">Hora</th>`+
						  `<th name="resultado">Resultado</th>`+
						  `<th name="cenario">Cenário</th>`+
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
					op_gerenciamento_index = (data[i].gerenciamento in gerenciamentos_dic) ? data[i].gerenciamento : '',
					op_cenario = (cenarios_dic.includes(data[i].cenario)) ? data[i].cenario : '',
					op_observacoes = (op_cenario !== '') ? data[i].observacoes.map(s => s.trim()).join(',') : '';
				if (data[i].data === '' || op_ativo_index === '' || op_gerenciamento_index === '' || data[i].op === '' || data[i].cts === '' || data[i].resultado === '' || data[i].saida === ''){
					if (data[i].data === '')
						error_line.push('data');
					if (op_ativo_index === '')
						error_line.push('ativo');
					if (op_gerenciamento_index === '')
						error_line.push('gerenciamento');
					if (data[i].op === '')
						error_line.push('op');
					if (data[i].cts === '')
						error_line.push('cts');
					if (data[i].resultado === '')
						error_line.push('resultado');
					if (data[i].saida === '')
						error_line.push('saida');
					error = true;
				}
				tbody_html += `<tr ${((error_line) ? `class="error"` : ``)}>`+
							`<td name="sequencia" value="${i+1}">${i+1}</td>`+
							`<td name="data" value="${Global.convertDate(data[i].data)}" ${((error_line.includes('data')) ? `class="error"` : ``)}>${data[i].data}</td>`+
							`<td name="ativo" value="${ativos_dic[op_ativo_index].nome}" custo="${ativos_dic[op_ativo_index].custo}" valor_tick="${ativos_dic[op_ativo_index].valor_tick}" pts_tick="${ativos_dic[op_ativo_index].pts_tick}" ${((error_line.includes('ativo')) ? `class="error"` : ``)}>${ativos_dic[op_ativo_index].nome}</td>`+
							`<td name="op" value="${data[i].op}" ${((error_line.includes('op')) ? `class="error"` : ``)}>${op_dic[data[i].op]}</td>`+
							`<td name="gerenciamento" value="${gerenciamentos_dic[op_gerenciamento_index].nome}" acoes='${gerenciamentos_dic[op_gerenciamento_index].acoes_text}' ${((error_line.includes('gerenciamento')) ? `class="error"` : ``)}>${gerenciamentos_dic[op_gerenciamento_index].nome}</td>`+
							`<td name="vol" value="${data[i].vol}">${data[i].vol}</td>`+
							`<td name="cts" value="${data[i].cts}" ${((error_line.includes('cts')) ? `class="error"` : ``)}>${data[i].cts}</td>`+
							`<td name="hora" value="${data[i].hora}">${data[i].hora}</td>`+
							`<td name="resultado" value="${data[i].resultado}" ${((error_line.includes('resultado')) ? `class="error"` : ``)}>${data[i].resultado}</td>`+
							`<td name="cenario" value="${op_cenario}">${op_cenario}</td>`+
							`<td name="observacoes" value="${op_observacoes}">${op_observacoes}</td>`+
							`<td name="erro" value="${data[i].erro}">${(data[i].erro == 1) ? `<i class="fas fa-exclamation-triangle text-warning"></i>` : ''}</td>`+
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
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------ Operações Adicionar -----------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Reseta a table 'table_adicionar_operacoes'.
	*/
	function resetAdicionarOperacaoTable(){
		let table = $(document.getElementById('table_adicionar_operacoes'));
		table.find('thead').empty();
		table.find('tbody').empty().append(`<tr class="text-center text-muted fw-bold fs-6" empty><td class="border-0 p-4"><i class="fas fa-cookie-bite me-2"></i>Nada a mostrar</td></tr>`);
		_new_bloco__type__com_acoes = null;
		fixTDBlocos__Table();
	}
	/*
		Zera a contagem de Tendencia e Pernada em 'adicionar_operacoes_offcanvas__contagem'.
	*/
	function resetAdicionarOperacao__ContagemForm(){
		let form_contagem = $(document.getElementById('adicionar_operacoes_offcanvas__contagem'));
		form_contagem.find('input').attr('not_ok', 0).attr('raw_value', 0).val('');
		form_contagem.find('button[name="up_c_tendencia"], button[name="down_c_tendencia"], button[name="restart_c_tendencia"]').removeClass('disabled');
		form_contagem.find('button[name="up_c_pernada"], button[name="down_c_pernada"], button[name="restart_c_pernada"]').addClass('disabled');
	}
	/*
		Constroi o offcanvas de adicionar operações.
	*/
	function buildAdicionarOperacoesOffcanvas(firstBuild = false, forceRebuild = false, show = false){
		if (firstBuild){
			let form = $(document.getElementById('adicionar_operacoes_offcanvas__form_default')),
				select_gerenciamentos = form.find('select[name="gerenciamento"]'),
				select_options_html = '';
			select_options_html = _lista__gerenciamentos['gerenciamentos'].reduce((p, c) => p + `<option value="${c.id}" selected>${c.nome}</option>`, '');
			select_gerenciamentos.append(select_options_html).promise().then(function (){
				select_gerenciamentos.selectpicker({
					title: 'R:R',
					selectedTextFormat: 'count > 2',
					actionsBox: true,
					deselectAllText: 'Nenhum',
					selectAllText: 'Todos',
					style: '',
					styleBase: 'form-control form-control-sm'
				}).on('loaded.bs.select', function (){
					select_gerenciamentos.parent().addClass('form-control');
				});
			});
			form.find('select[name="hoje"]').selectpicker({
				title: 'Data',
				selectedTextFormat: 'count > 2',
				style: '',
				styleBase: 'form-control form-control-sm'
			}).on('loaded.bs.select', function (){
				form.find('select[name="hoje"]').parent().addClass('form-control');
			});
		}
		if (forceRebuild){
			resetAdicionarOperacaoTable();
			resetAdicionarOperacao__ContagemForm();
		}
		if (show)
			$(document.getElementById('adicionar_operacoes_offcanvas')).offcanvas('show');
	}
	/*
		Sempre manter o primeiro TR do bloco com o TD('#') e manter a ultima TR do bloco com a classe 'tr_separator', após uma remoção de TR.
	*/
	function fixTDBlocos__Table(bloco = null){
		let blocos_to_fix = [],
			bloco_vazio = false;
		if (bloco === null){
			$(document.getElementById('table_adicionar_operacoes')).find('tbody').find(`tr[bloco]`).each(function (){
				if (!blocos_to_fix.includes(this.getAttribute('bloco')))
					blocos_to_fix.push(this.getAttribute('bloco'));
			});
		}
		else
			blocos_to_fix.push(bloco);
		for (let bl in blocos_to_fix){
			let trs = $(document.getElementById('table_adicionar_operacoes')).find('tbody').find(`tr[bloco="${blocos_to_fix[bl]}"]`);
			if (trs.length){
				let td_bloco = trs.first().find('td[name="bloco"]');
				if (td_bloco.length)
					td_bloco.attr('rowspan', trs.length);
				else
					trs.first().prepend(`<td rowspan="${trs.length}" name="bloco" class="fw-bold text-center">${blocos_to_fix[bl]}</td>`);
				trs.last().addClass('tr_separator');
			}
			else
				bloco_vazio = true;
		}
		let default_cenario = $(document.getElementById('adicionar_operacoes_offcanvas__form_default')).find('input[name="cenario"]').val();
		if ((bloco === null && default_cenario === '') || (bloco !== null && bloco_vazio && default_cenario === ''))
			buildAdicionarOperacoes__ExtraDados(null, -1);
	}
	/*
		Constroi o setor de Extra Dados, com as informações de Observações do cenário escolhido em 'adicionar_operacoes__extraDados'.
	*/
	function buildAdicionarOperacoes__ExtraDados(id_arcabouco, id_cenario){
		let html = ``;
		if (id_cenario !== -1){
			html += `<table class="table table-sm table-borderless m-0">`+
					`<thead><tr>`+
					`<th colspan="2" class="pb-3">Observações</th>`+
					`</tr></thead><tbody>`;
			for (let o in _lista__cenarios['cenarios'][id_arcabouco][id_cenario]['observacoes']){
				if (_lista__cenarios['cenarios'][id_arcabouco][id_cenario]['observacoes'][o].inativo == 0){
					html += `<tr>`+
							`<td name="ref">${_lista__cenarios['cenarios'][id_arcabouco][id_cenario]['observacoes'][o].ref}</td>`+
							`<td name="nome">${_lista__cenarios['cenarios'][id_arcabouco][id_cenario]['observacoes'][o].nome}</td>`+
							`</tr>`;
				}
			}
			html += `</tbody></table>`;
		}
		if (html === ``)
			html = `<div class="container-fluid p-4 text-center text-muted fw-bold"><i class="fas fa-cookie-bite me-2" aria-hidden="true"></i>Nada a mostrar</div>`;
		$(document.getElementById('adicionar_operacoes__extraDados')).empty().append(html);
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*--------------------------- Section Dashboard Ops ------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Inicia ou reinicia a seção de 'dashboard_ops' da instancia de arcabouço selecionada.
	*/
	function rebuildDashboard_ops(){
		let selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
			html = ``;
		_dashboard_ops__section.show('building');
		if (selected_inst_arcabouco in _lista__operacoes.operacoes && _lista__operacoes.operacoes[selected_inst_arcabouco].length > 0){
			let finish_building = 0,
				dashboard_data = RV_Statistics.generate__DashboardOps(_lista__operacoes.operacoes[selected_inst_arcabouco], _lista__instancias_arcabouco.getSelected('filters'), _lista__instancias_arcabouco.getSelected('simulations'));
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
				_dashboard_ops__elements['tables']['dashboard_ops__table_trades'].DataTable().clear().rows.add(rebuildDashboardOps__Table_Trades('dataOnly', dashboard_data.dashboard_ops__table_trades)).draw();
				_dashboard_ops__section.show('data', ++finish_building);
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
									backgroundColor: '#212529',
	      							borderColor: '#212529',
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
								tooltip: {
									callbacks: {
										title: function (tooltipItems){
											return `${dashboard_data['dashboard_ops__chart_data']['resultados_normalizado']['date'][tooltipItems[0].dataIndex]}  (${tooltipItems[0].label})`;
										}
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
							backgroundColor: '#212529',
  							borderColor: '#212529',
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
			let linha_zero = [{
				type: 'line',
				scaleID: 'y',
				value: 0,
				borderColor: '#212529',
				borderWidth: 0.5,
				label: { enabled: false }
			}];
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
	      							data: dashboard_data['dashboard_ops__chart_data']['evolucao_patrimonial']['sma20']
								},
								{
									label: 'Desvio Padrão (Sup)',
									backgroundColor: _lista__instancias_arcabouco.getSelected('chartColor_Transparent'),
									borderColor: _lista__instancias_arcabouco.getSelected('chartColor_Transparent'),
									borderWidth: 0,
									data: dashboard_data['dashboard_ops__chart_data']['evolucao_patrimonial']['banda_superior']
								},
								{
									label: 'Desvio Padrão (Inf)',
									backgroundColor: _lista__instancias_arcabouco.getSelected('chartColor_Transparent'),
									borderColor: _lista__instancias_arcabouco.getSelected('chartColor_Transparent'),
									borderWidth: 0,
									fill: '-1',
									data: dashboard_data['dashboard_ops__chart_data']['evolucao_patrimonial']['banda_inferior']
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
								},
								legend: {
									display: true,
									labels: {
										filter: function (item, chart){
											return (!item.text.includes('Desvio Padrão (Sup)') && !item.text.includes('Desvio Padrão (Inf)'));
										}
									},
									onClick: function (e, legendItem){
										let dataset_name = legendItem.text,
											index = legendItem.datasetIndex,
											me = this.chart.getDatasetMeta(index);
										if (dataset_name === _lista__instancias_arcabouco.getSelected('nome')){
											if (me.hidden === null){
												me.hidden = true;
												this.chart.getDatasetMeta(index + 2).hidden = true;
												this.chart.getDatasetMeta(index + 3).hidden = true;
											}
											else{
												me.hidden = null;
												this.chart.getDatasetMeta(index + 2).hidden = null;
												this.chart.getDatasetMeta(index + 3).hidden = null;
											}
										}
										else
											me.hidden = (me.hidden === null) ? true : null;
										this.chart.update();
									}
								},
								tooltip: {
									callbacks: {
										title: function (tooltipItems){
											return `${dashboard_data['dashboard_ops__chart_data']['evolucao_patrimonial']['date'][tooltipItems[0].dataIndex]}  (${tooltipItems[0].label})`;
										}
									}
								},
								annotation: {
									annotations: linha_zero
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
							data: dashboard_data['dashboard_ops__chart_data']['evolucao_patrimonial']['sma20']
						},
						{
							label: 'Desvio Padrão (Sup)',
							backgroundColor: _lista__instancias_arcabouco.getSelected('chartColor_Transparent'),
							borderColor: _lista__instancias_arcabouco.getSelected('chartColor_Transparent'),
							borderWidth: 0,
							data: dashboard_data['dashboard_ops__chart_data']['evolucao_patrimonial']['banda_superior']
						},
						{
							label: 'Desvio Padrão (Inf)',
							backgroundColor: _lista__instancias_arcabouco.getSelected('chartColor_Transparent'),
							borderColor: _lista__instancias_arcabouco.getSelected('chartColor_Transparent'),
							borderWidth: 0,
							fill: '-1',
							data: dashboard_data['dashboard_ops__chart_data']['evolucao_patrimonial']['banda_inferior']
						}
					]
				};
				_dashboard_ops__elements['charts']['dashboard_ops__chart_evolucaoPatrimonial'].update();
			}
		}
		else
			_dashboard_ops__section.show('empty');
	}
	/*
		Reconstroi a lista de 'observações', usada nos selects dos mesmos em 'filters'.
	*/
	function rebuildSelect_Observacoes__content(id_arcabouco){
		let dashboard_filters = _lista__instancias_arcabouco.getSelected('filters'),
			selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
			el_name = _renda_variavel__search.filters.observacoes.attr('name'),
			placeholder = {'observacoes': 'Observações'},
			qtd_selected = 0,
			options_html = '';
		//Se existe filtros de cenário selecionados
		if ('cenario' in dashboard_filters){
			let ordered_cenarios = (Object.keys(dashboard_filters['cenario'])).sort();
			//Percorre todos os cenários selecionadas no filtro
			for (let cn=0; cn<ordered_cenarios.length; cn++){
				//Se esse cenário possui observações cadastradas
				if (_lista__cenarios.cenarios[selected_inst_arcabouco][dashboard_filters['cenario'][ordered_cenarios[cn]].id][el_name].length){
					//Inicia o select com o subfiltro de 'OR' e 'AND'
					if (options_html === ''){
						let select_query_union_name = `${el_name}_query_union`,
							or_selected = (select_query_union_name in dashboard_filters && dashboard_filters[select_query_union_name] === 'OR'),
							and_selected = !(select_query_union_name in dashboard_filters) || (select_query_union_name in dashboard_filters && dashboard_filters[select_query_union_name] === 'AND');
						options_html += `<li><div class="input-group px-2"><select class="iSelectKami form-select form-select-sm" name="${el_name}_query_union"><option value="AND" ${((and_selected) ? 'selected' : '')}>AND</option><option value="OR" ${((or_selected) ? 'selected' : '')}>OR</option></select><button type="button" class="iSelectKami btn btn-sm btn-outline-secondary" name="tira_tudo">Nenhum</button></div></li>`;
					}
					else
						options_html += `<li><hr class="dropdown-divider"></li>`;
					options_html += `<li><h6 class="dropdown-header">${ordered_cenarios[cn]}</h6></li>`;
					//Insere as observações do cenário sendo verificado
					for (let o in _lista__cenarios.cenarios[selected_inst_arcabouco][dashboard_filters['cenario'][ordered_cenarios[cn]].id][el_name]){
						let is_selected = _lista__cenarios.cenarios[selected_inst_arcabouco][dashboard_filters['cenario'][ordered_cenarios[cn]].id][el_name][o].ref in dashboard_filters['cenario'][ordered_cenarios[cn]][el_name],
							negar_checked = (is_selected) ? dashboard_filters['cenario'][ordered_cenarios[cn]][el_name][_lista__cenarios.cenarios[selected_inst_arcabouco][dashboard_filters['cenario'][ordered_cenarios[cn]].id][el_name][o].ref] === 1 : false;
						options_html += `<li><button class="dropdown-item" type="button" value="${_lista__cenarios.cenarios[selected_inst_arcabouco][dashboard_filters['cenario'][ordered_cenarios[cn]].id][el_name][o].ref}" cenario="${dashboard_filters['cenario'][ordered_cenarios[cn]].id}" pertence="${ordered_cenarios[cn]}" ${((is_selected) ? 'selected' : '' )}><input class="form-check-input me-3" type="checkbox" name="negar_valor" ${((negar_checked) ? 'checked' : '' )}>${_lista__cenarios.cenarios[selected_inst_arcabouco][dashboard_filters['cenario'][ordered_cenarios[cn]].id][el_name][o].nome}</button>`;
						if (is_selected)
							qtd_selected++;
					}
				}
			}
		}
		_renda_variavel__search.filters.observacoes.find('button.dropdown-toggle').html(((qtd_selected > 1) ? `${qtd_selected} items selected` : ((qtd_selected === 1) ? `1 item selected` : `${placeholder[el_name]}`)));
		_renda_variavel__search.filters.observacoes.find('ul.dropdown-menu').empty().append(options_html);
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
					`<td class="text-center divider"><span name="stats__rrMedio" class="data-tiny">${line_data.stats__rrMedio.toFixed(2)}</span></td>`+
					`<td class="text-center"><span name="result__mediaGain_R" class="data-tiny text-success">${((line_data.result__mediaGain_R !== '--') ? `${line_data.result__mediaGain_R.toFixed(3)}R` : line_data.result__mediaGain_R )}</span><span name="result__mediaGain_brl" class="data-tiny text-success ms-2">R$ ${line_data.result__mediaGain_brl.toFixed(2)}</span><span name="result__mediaGain_perc" class="data-tiny text-success ms-2">${((line_data.result__mediaGain_perc !== '--') ? `${line_data.result__mediaGain_perc.toFixed(2)}%` : line_data.result__mediaGain_perc )}</span></td>`+
					`<td class="text-center"><span name="result__mediaLoss_R" class="data-tiny text-danger">${((line_data.result__mediaLoss_R !== '--') ? `${line_data.result__mediaLoss_R.toFixed(3)}R` : line_data.result__mediaLoss_R )}</span><span name="result__mediaLoss_brl" class="data-tiny text-danger ms-2">R$ ${line_data.result__mediaLoss_brl.toFixed(2)}</span><span name="result__mediaLoss_perc" class="data-tiny text-danger ms-2">${((line_data.result__mediaLoss_perc !== '--') ? `${line_data.result__mediaLoss_perc.toFixed(2)}%` : line_data.result__mediaLoss_perc )}</span></td>`+
					//Expect.
					`<td class="text-center divider"><span name="stats__expect_R" class="data-tiny">${((line_data.stats__expect_R !== '--') ? `${line_data.stats__expect_R.toFixed(3)}R` : line_data.stats__expect_R )}</span><span name="stats__expect_brl" class="data-tiny ms-2">R$ ${line_data.stats__expect_brl.toFixed(2)}</span><span name="stats__expect_perc" class="data-tiny ms-2">${((line_data.stats__expect_perc !== '--') ? `${line_data.stats__expect_perc.toFixed(2)}%` : line_data.stats__expect_perc )}</span></td>`+
					//DP
					`<td class="text-center"><span name="stats__dp_R" class="data-tiny">${((line_data.stats__dp_R !== '--') ? `${line_data.stats__dp_R.toFixed(3)}R` : line_data.stats__dp_R )}</span><span name="stats__dp_brl" class="data-tiny ms-2">R$ ${line_data.stats__dp_brl.toFixed(2)}</span><span name="stats__dp_perc" class="data-tiny ms-2">${((line_data.stats__dp_perc !== '--') ? `${line_data.stats__dp_perc.toFixed(2)}%` : line_data.stats__dp_perc )}</span></td>`+
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
					`<td class="text-center divider"><span name="stats__rrMedio" class="data-tiny">${line_data.stats__rrMedio.toFixed(2)}</span></td>`+
					`<td class="text-center"><span name="result__mediaGain_R" class="data-tiny text-success">${((line_data.result__mediaGain_R !== '--') ? `${line_data.result__mediaGain_R.toFixed(3)}R` : line_data.result__mediaGain_R )}</span><span name="result__mediaGain_brl" class="data-tiny text-success ms-2">R$ ${line_data.result__mediaGain_brl.toFixed(2)}</span><span name="result__mediaGain_perc" class="data-tiny text-success ms-2">${((line_data.result__mediaGain_perc !== '--') ? `${line_data.result__mediaGain_perc.toFixed(2)}%` : line_data.result__mediaGain_perc )}</span></td>`+
					`<td class="text-center"><span name="result__mediaLoss_R" class="data-tiny text-danger">${((line_data.result__mediaLoss_R !== '--') ? `${line_data.result__mediaLoss_R.toFixed(3)}R` : line_data.result__mediaLoss_R )}</span><span name="result__mediaLoss_brl" class="data-tiny text-danger ms-2">R$ ${line_data.result__mediaLoss_brl.toFixed(2)}</span><span name="result__mediaLoss_perc" class="data-tiny text-danger ms-2">${((line_data.result__mediaLoss_perc !== '--') ? `${line_data.result__mediaLoss_perc.toFixed(2)}%` : line_data.result__mediaLoss_perc )}</span></td>`+
					//Expect.
					`<td class="text-center divider"><span name="stats__expect_R" class="data-tiny">${((line_data.stats__expect_R !== '--') ? `${line_data.stats__expect_R.toFixed(3)}R` : line_data.stats__expect_R )}</span><span name="stats__expect_brl" class="data-tiny ms-2">R$ ${line_data.stats__expect_brl.toFixed(2)}</span><span name="stats__expect_perc" class="data-tiny ms-2">${((line_data.stats__expect_perc !== '--') ? `${line_data.stats__expect_perc.toFixed(2)}%` : line_data.stats__expect_perc )}</span></td>`+
					//DP
					`<td class="text-center"><span name="stats__dp_R" class="data-tiny">${((line_data.stats__dp_R !== '--') ? `${line_data.stats__dp_R.toFixed(3)}R` : line_data.stats__dp_R )}</span><span name="stats__dp_brl" class="data-tiny ms-2">R$ ${line_data.stats__dp_brl.toFixed(2)}</span><span name="stats__dp_perc" class="data-tiny ms-2">${((line_data.stats__dp_perc !== '--') ? `${line_data.stats__dp_perc.toFixed(2)}%` : line_data.stats__dp_perc )}</span></td>`+
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
			let ordered_cenarios = (Object.keys(stats)).sort();
			for (let cn=0; cn<ordered_cenarios.length; cn++)
				html += dashboardOps__Table_Stats__byCenario__newLine(ordered_cenarios[cn], stats[ordered_cenarios[cn]], section);
		}
		else if (section === 'tfoot')
			html += dashboardOps__Table_Stats__byCenario__newLine('Total', stats, section);
		return html;
	}
	/*
		Retorna o html da seção de 'thead' ou 'tbody' da 'dashboard_ops__table_trades'.
	*/
	function rebuildDashboardOps__Table_Trades(section = '', trades = {}){
		if (section === 'thead'){
			let html = ``;
			html += `<tr>`+
					`<th>#</th>`+
					`<th>Data</th>`+
					`<th>Cenário</th>`+
					`<th>Cts</th>`+
					`<th>Bruto BRL</th>`+
					`<th>Bruto R</th>`+
					`<th>Custo</th>`+
					`<th>Líquido BRL</th>`+
					`<th>Líquido R</th>`+
					`</tr>`;
			return html;
		}
		else if (section === 'tbody'){
			let html = ``;
			for (let o in trades){
				html += `<tr>`+
						`<td name="trade__seq">${trades[o].trade__seq}</td>`+
						`<td name="trade__data">${Global.convertDate(trades[o].trade__data)}</td>`+
						`<td name="trade__cenario">${trades[o].trade__cenario}</td>`+
						`<td name="trade__cts">${trades[o].trade__cts}</td>`+
						`<td name="result_bruto__brl">${trades[o].result_bruto__brl}</td>`+
						`<td name="result_bruto__R">${trades[o].result_bruto__R}</td>`+
						`<td name="trade__custo">${trades[o].trade__custo}</td>`+
						`<td name="result__brl">${trades[o].result__brl}</td>`+
						`<td name="result__R">${trades[o].result__R}</td>`+
						`</tr>`;
			}
			return html;
		}
		else if (section === 'dataOnly'){
			let data = [];
			for (let o in trades){
				data.push([
					trades[o].trade__seq,
					Global.convertDate(trades[o].trade__data),
					trades[o].trade__cenario,
					trades[o].trade__cts,
					trades[o].result_bruto__brl,
					trades[o].result_bruto__R,
					trades[o].trade__custo,
					trades[o].result__brl,
					trades[o].result__R
				]);
			}
			return data;
		}
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------- Section Analise Obs ------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Inicia ou reinicia a seção de 'analise_obs' da instancia de arcabouço selecionada.
		** (Apenas se houver 1 cenário selecionado ou filtrado) **
	*/
	function rebuildAnalise_obs(){
		let selected_inst_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
			html = ``;
		_analise_obs__section.show('building');
		if (selected_inst_arcabouco in _lista__operacoes.operacoes && _lista__operacoes.operacoes[selected_inst_arcabouco].length > 0){
			let finish_building = 0,
				analise_por_grupo_data = RV_Statistics.generate(_lista__operacoes.operacoes[selected_inst_arcabouco], _lista__instancias_arcabouco.getSelected('filters'), _lista__instancias_arcabouco.getSelected('simulations'));
			//////////////////////////////////
			//Info Melhores e Piores Estatisticas (Por Grupo)
			//////////////////////////////////

			//////////////////////////////////
			//Tabela de Resultados de todos os grupos gerados
			//////////////////////////////////

			//////////////////////////////////
			//Gráfico de Resultados disperso (Por Grupo)
			//////////////////////////////////
		}
		else
			_analise_obs__section.show('empty');
	}
	////////////////////////////////////////////////////////////////////////////////////
	/*---------------------------- EXECUCAO DAS FUNCOES ------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------ Lista Arcabouços --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Processa o fechamento do modal 'arcaboucos_modal', para reconstrucao do arcabouço section.
	*/
	$(document.getElementById('arcaboucos_modal')).on('hidden.bs.modal', function (){
		if (_renda_variavel__section === 'dashboard_ops__section'){
			if (_dashboard_ops__needRebuild){
				_dashboard_ops__needRebuild = false;
				//Reconstroi o 'filters' e 'simulation' em 'renda_variavel__search' com a instancia de arcabouço selecionada
				_renda_variavel__search.update();
				rebuildDashboard_ops();
			}
		}
		else if (_renda_variavel__section === 'analise_obs__section'){
			if (_analise_obs__needRebuild){
				_analise_obs__needRebuild = false;
				//Reconstroi o 'filters' e 'simulation' em 'renda_variavel__search' com a instancia de arcabouço selecionada
				_renda_variavel__search.update();
				rebuildAnalise_obs();
			}
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
					_analise_obs__needRebuild = true;
					_list_ops__needRebuild = true;
					_arcabouco_info__needRebuild = true;
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
		form.find('input[name="nome"]').val(_lista__arcaboucos.arcaboucos[id_arcabouco].nome).removeAttr('changed');
		form.find('select[name="situacao"]').val(_lista__arcaboucos.arcaboucos[id_arcabouco].situacao).removeAttr('changed');
		form.find('select[name="tipo"]').val(_lista__arcaboucos.arcaboucos[id_arcabouco].tipo).removeAttr('changed');
		form.find('select[name="usuarios"]').selectpicker('val', usuarios_select);
		_arcabouco__ckeditor.setData(_lista__arcaboucos.arcaboucos[id_arcabouco].observacao);
		_arcabouco__ckeditor__changed = false;
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
						_analise_obs__needRebuild = true;
						_list_ops__needRebuild = true;
						_arcabouco_info__needRebuild = true;
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
		let form = $(document.getElementById('arcaboucos_modal_form')),
			id_arcabouco = form.attr('id_arcabouco'),
			data = {};
		//Se for edição
		if (id_arcabouco){
			form.find('input[name][changed],select[name!="usuarios"][changed],select[name="usuarios"]').each(function (){
				data[this.name] = $(this).val();
			});
			if (_arcabouco__ckeditor__changed)
				data['observacao'] = _arcabouco__ckeditor.getData();
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
			form.find('input[name],select[name]').each(function (){
				data[this.name] = $(this).val();
			});
			data['observacao'] = _arcabouco__ckeditor.getData();
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
	/*-------------------------------- Lista Ativos ----------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Marca os inputs que forem alterados.
	*/
	$(document.getElementById('ativos_modal_form')).on('change', 'input[name]', function (){
		this.setAttribute('changed', '');
	});
	/*
		Processa click em 'table_ativos' (Para Edição dos ativos)
			 - (Criador Apenas) Clicar em alterar ativo: Joga os dados para o formulario.
	*/
	$(document.getElementById('table_ativos')).on('click', 'tbody tr td button[name="editar"]', function (){
		let id_ativo = $(this).parentsUntil('tbody').last().attr('ativo'),
			form = $(document.getElementById('ativos_modal_form'));
		for (let a in _lista__ativos.ativos){
			if (_lista__ativos.ativos[a].id == id_ativo){
				form.find('input[name="nome"]').val(_lista__ativos.ativos[a].nome).removeAttr('changed');
				form.find('input[name="custo"]').val(_lista__ativos.ativos[a].custo).removeAttr('changed');
				form.find('input[name="valor_tick"]').val(_lista__ativos.ativos[a].valor_tick).removeAttr('changed');
				form.find('input[name="pts_tick"]').val(_lista__ativos.ativos[a].pts_tick).removeAttr('changed');
				form.attr('id_ativo', id_ativo);
			}
		}
	});
	/*
		Processa os duplos cliques em 'table_ativos'.
			 - (Criador Apenas) Duplo clique em remover ativo: Excluir esse ativo.
	*/
	$(document.getElementById('table_ativos')).on('dblclick', 'tbody tr td button[name="remover"]', function (){
		let id_ativo = $(this).parentsUntil('tbody').last().attr('ativo');
		Global.connect({
			data: {module: 'renda_variavel', action: 'remove_ativos', params: {id: id_ativo}},
			success: function (result){
				if (result.status){
					_lista__ativos.update(result.data);
					buildAtivosTable();
				}
				else
					Global.toast.create({location: document.getElementById('ativos_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
			}
		});
	});
	/*
		Cancela envio de adição ou edição de ativos, removendo os dados do formulário e resetando ele.
	*/
	$(document.getElementById('ativos_modal_cancelar')).click(function (){
		resetFormAtivosModal();
	});
	/*
		Envia info do formulario de ativos para adicionar ou editar um ativo.
	*/
	$(document.getElementById('ativos_modal_enviar')).click(function (){
		let form = $(document.getElementById('ativos_modal_form')),
			id_ativo = form.attr('id_ativo'),
			data = {};
		form.find('input[name][changed]').each(function (){
			data[this.name] = $(this).val();
		});
		//Se for edição
		if (id_ativo){
			if (!Global.isObjectEmpty(data)){
				data['id'] = id_ativo;
				Global.connect({
					data: {module: 'renda_variavel', action: 'update_ativos', params: data},
					success: function (result){
						if (result.status){
							Global.toast.create({location: document.getElementById('ativos_modal_toasts'), color: 'success', body: 'Ativo Atualizado.', delay: 4000});
							resetFormAtivosModal();
							_lista__ativos.update(result.data);
							buildAtivosTable();
						}
						else
							Global.toast.create({location: document.getElementById('ativos_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
					}
				});
			}
		}
		//Se for adição
		else{
			if (!('nome' in data) || data['nome'] === '' || !('custo' in data) || data['custo'] === '' || !('valor_tick' in data) || data['valor_tick'] === '' || !('pts_tick' in data) || data['pts_tick'] === ''){
				Global.toast.create({location: document.getElementById('ativos_modal_toasts'), color: 'warning', body: 'Todos os campos devem ser preenchidos.', delay: 4000});
				return;
			}
			Global.connect({
				data: {module: 'renda_variavel', action: 'insert_ativos', params: data},
				success: function (result){
					if (result.status){
						resetFormAtivosModal();
						_lista__ativos.update(result.data);
						buildAtivosTable();
					}
					else
						Global.toast.create({location: document.getElementById('ativos_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
				}
			});
		}
	});
	/*
		Alterar ano dos contratos de vencimento do WIN e WDO.
	*/
	$(document.getElementById('ativos_modal__vencimentos_search')).find('input[name="ano"]').on('click', function (){
		this.focus();
		this.select();
	}).on('keyup', function (){
		if (/^[0-9]+$/.test(this.value) && this.value.length === 4){
			buildTableWinSeries(this.value);
			buildTableWdoSeries(this.value);
			this.focus();
			this.select();
		}
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*---------------------------- Lista Gerenciamentos ------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Processa a adição de ações de scalps de Gain e Loss, para o gerenciamento.
	*/
	$(document.getElementById('gerenciamentos_modal_form')).find('button[name]').on('click', function (){
		let html = ``,
			parent = $(this).parent(),
			scalp_value = parent.find('input[name][scalp_value]').val(),
			scalp_escalada = parent.find('input[name][scalp_escalada]').val();
		if (scalp_value !== '' && !isNaN(scalp_value)){
			let form__acoes = document.getElementById('gerenciamentos_modal_form__acoes');
			if (scalp_escalada !== '' && !isNaN(scalp_escalada))
				scalp_escalada = Math.abs(parseFloat(scalp_escalada));
			else
				scalp_escalada = 0;
			scalp_value = Math.abs(parseFloat(scalp_value));
			if (this.name === 's_gain'){
				html = `<button type="button" class="btn btn-sm btn-success flex-fill" value="${scalp_value}" escalada="${scalp_escalada}">${scalp_value}S${((scalp_escalada !== 0) ? ` E${scalp_escalada}` : ``)}</button>`;
				parent.find('input[name][scalp_value]').focus();
			}
			else if (this.name === 's_loss'){
				html = `<button type="button" class="btn btn-sm btn-danger flex-fill" value="${scalp_value * -1.0}" escalada="${scalp_escalada}">${scalp_value}S${((scalp_escalada !== 0) ? ` E${scalp_escalada}` : ``)}</button>`;
				parent.find('input[name][scalp_value]').focus();
			}
			$(form__acoes).append(html).promise().then(function (){
				[].slice.call(form__acoes.children).sort(function(a, b) {
					let a_v = a.getAttribute('value'),
						b_v = b.getAttribute('value');
					return parseFloat(b_v) - parseFloat(a_v);
				}).forEach(function(ele) {
					form__acoes.appendChild(ele);
				});
			});
		}
		parent.find('input[name]').val('');
	});
	/*
		Processa a remoção de ações de scalp de Gain e Loss.
	*/
	$(document.getElementById('gerenciamentos_modal_form__acoes')).on('dblclick', 'button[value]', function (){
		$(this).remove();
	});
	/*
		Processa click em 'table_gerenciamentos' (Para Edição dos gerenciamentos)
			 - (Criador Apenas) Clicar em alterar gerenciamento: Joga os dados para o formulario.
	*/
	$(document.getElementById('table_gerenciamentos')).on('click', 'tbody tr td button[name="editar"]', function (){
		let id_gerenciamento = $(this).parentsUntil('tbody').last().attr('gerenciamento'),
			acoes_btn = ``,
			form = $(document.getElementById('gerenciamentos_modal_form'));
		for (let g in _lista__gerenciamentos.gerenciamentos){
			if (_lista__gerenciamentos.gerenciamentos[g].id == id_gerenciamento){
				for (let ac=0; ac < _lista__gerenciamentos.gerenciamentos[g]['acoes'].length; ac++)
					acoes_btn += `<button type="button" class="btn btn-sm ${((parseFloat(_lista__gerenciamentos.gerenciamentos[g]['acoes'][ac]) < 0) ? 'btn-danger' : 'btn-success')} flex-fill" value="${_lista__gerenciamentos.gerenciamentos[g]['acoes'][ac]}" escalada="${_lista__gerenciamentos.gerenciamentos[g]['escaladas'][ac]}">${Math.abs(parseFloat(_lista__gerenciamentos.gerenciamentos[g]['acoes'][ac]))}S${((_lista__gerenciamentos.gerenciamentos[g]['escaladas'][ac] != 0) ? ` E${_lista__gerenciamentos.gerenciamentos[g]['escaladas'][ac]}` : ``)}</button>`;
				form.find('input[name="nome"]').val(_lista__gerenciamentos.gerenciamentos[g].nome);
				form.find('#gerenciamentos_modal_form__acoes').empty().append(acoes_btn);
				form.attr('id_gerenciamento', id_gerenciamento);
			}
		}
	});
	/*
		Processa os duplos cliques em 'table_gerenciamentos'.
			 - (Criador Apenas) Duplo clique em remover gerenciamento: Excluir esse gerenciamento.
	*/
	$(document.getElementById('table_gerenciamentos')).on('dblclick', 'tbody tr td button[name="remover"]', function (){
		let id_gerenciamento = $(this).parentsUntil('tbody').last().attr('gerenciamento');
		Global.connect({
			data: {module: 'renda_variavel', action: 'remove_gerenciamentos', params: {id: id_gerenciamento}},
			success: function (result){
				if (result.status){
					_lista__gerenciamentos.update(result.data);
					buildGerenciamentosTable();
				}
				else
					Global.toast.create({location: document.getElementById('gerenciamentos_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
			}
		});
	});
	/*
		Cancela envio de adição ou edição de gerenciamentos, removendo os dados do formulário e resetando ele.
	*/
	$(document.getElementById('gerenciamentos_modal_cancelar')).click(function (){
		resetFormGerenciamentoModal();
	});
	/*
		Envia info do formulario de gerenciamentos para adicionar ou editar um gerenciamento.
	*/
	$(document.getElementById('gerenciamentos_modal_enviar')).click(function (){
		let form = $(document.getElementById('gerenciamentos_modal_form')),
			id_gerenciamento = form.attr('id_gerenciamento'),
			data = {
				nome: form.find('input[name="nome"]').val(),
				acoes: [],
				escaladas: []
			};
		form.find('#gerenciamentos_modal_form__acoes button[value]').each(function (i, elem){
			data['acoes'].push(elem.getAttribute('value'));
			data['escaladas'].push(elem.getAttribute('escalada'));
		});
		data['acoes'] = JSON.stringify(data['acoes']);
		data['escaladas'] = JSON.stringify(data['escaladas']);
		if (!('nome' in data) || data['nome'] === ''){
			Global.toast.create({location: document.getElementById('gerenciamentos_modal_toasts'), color: 'warning', body: 'Nome inválido.', delay: 4000});
			return;
		}
		//Se for edição
		if (id_gerenciamento){
			data['id'] = id_gerenciamento;
			Global.connect({
				data: {module: 'renda_variavel', action: 'update_gerenciamentos', params: data},
				success: function (result){
					if (result.status){
						Global.toast.create({location: document.getElementById('gerenciamentos_modal_toasts'), color: 'success', body: 'Gerenciamento Atualizado.', delay: 4000});
						resetFormGerenciamentoModal();
						_lista__gerenciamentos.update(result.data);
						buildGerenciamentosTable();
					}
					else
						Global.toast.create({location: document.getElementById('gerenciamentos_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
				}
			});
		}
		//Se for adição
		else{
			Global.connect({
				data: {module: 'renda_variavel', action: 'insert_gerenciamentos', params: data},
				success: function (result){
					if (result.status){
						resetFormGerenciamentoModal();
						_lista__gerenciamentos.update(result.data);
						buildGerenciamentosTable();
					}
					else
						Global.toast.create({location: document.getElementById('gerenciamentos_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
				}
			});
		}
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------- Arcabouco Info ---------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Corrige bug no bootstrap que não mostra o offcanvas na 1 vez que abre.	
	*/
	$(document.getElementById('arcabouco_info')).on('shown.bs.offcanvas', function (){
		$(this).show();
	});
	/*
		Filtra os cenários e observações em 'arcabouco_info'.
	*/
	$(document.getElementById("arcabouco_info_place")).on('change', '.arcabouco_info__cenarios__filter select', function (){
		let cenario = $(this).val();
		$(document.getElementById('arcabouco_info_place')).find('.arcabouco_info__cenarios_obs table tr').each(function (){
			$(this).toggleClass('d-none', (cenario !== '' && this.getAttribute('cenario') != cenario));
		});
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*-------------------------------- Lista Cenarios --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Processa o fechamento do modal 'cenarios_modal', para reconstrucao do arcabouço section.
	*/
	$(document.getElementById('cenarios_modal')).on('hidden.bs.modal', function (){
		if (_renda_variavel__section === 'dashboard_ops__section'){
			if (_dashboard_ops__needRebuild){
				_dashboard_ops__needRebuild = false;
				//Reconstroi o 'filters' e 'simulation' em 'renda_variavel__search' com a instancia de arcabouço selecionada
				_renda_variavel__search.update();
				rebuildDashboard_ops();
			}
		}
		else if (_renda_variavel__section === 'analise_obs__section'){
			if (_analise_obs__needRebuild){
				_analise_obs__needRebuild = false;
				//Reconstroi o 'filters' e 'simulation' em 'renda_variavel__search' com a instancia de arcabouço selecionada
				_renda_variavel__search.update();
				rebuildAnalise_obs();
			}
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
			$(document.getElementById('cenarios_modal__cenarios')).find('div[empty]').remove().end().prepend(buildCenario({}, true));
		else{
			let copy_data = {nome: '', observacoes: []},
				cenario = $(document.getElementById('cenarios_modal__cenarios')).find('input[name="cenario_nome"]').filter(function (){ return this.value === copiar_cenario; }).parentsUntil('#cenarios_modal__cenarios').last();
			//Pega as observacoes
			cenario.find('table tbody tr').each(function (i, tr){
				if (tr.hasAttribute('empty'))
					return;
				tr = $(tr);
				copy_data.observacoes.push({
					nome: tr.find('input[name="nome"]').val(),
					ref: tr.find('input[name="ref"]').val(),
					inativo: tr.find('input[name="inativo"]').prop('checked')
				});
			});
			$(document.getElementById('cenarios_modal__cenarios')).find('div[empty]').remove().end().prepend(buildCenario(copy_data, true));
		}
	});
	/*
		Processa o clique na barra header do cenário, para mostrar ou esconder suas observações.
	*/
	$(document.getElementById('cenarios_modal__cenarios')).on('click', 'div.card-header', function (e){
		if (Global.hasClass(e.target, 'card-header')){
			let current_card_body = $(this).parent().find('div.card-body');
			if (current_card_body.hasClass('d-none')){
				//Fecha cenarios que estão abertos (Novos para criar não)
				$(document.getElementById('cenarios_modal__cenarios')).find('div.card-body').filter(function (){ return !this.parentElement.hasAttribute('new_cenario'); }).addClass('d-none');
				current_card_body.removeClass('d-none');
				if ($(document.getElementById('cenarios_modal')).find('div.modal-body').scrollTop() != 0)
					this.scrollIntoView();
			}
			else
				$(document.getElementById('cenarios_modal__cenarios')).find('div.card-body').filter(function (){ return !this.parentElement.hasAttribute('new_cenario'); }).addClass('d-none');
		}
	});
	/*
		Processa a remocao de cenarios com double click.
	*/
	$(document.getElementById('cenarios_modal__cenarios')).on('dblclick', 'button', function (){
		//Remove um cenario
		if (this.hasAttribute('remover_cenario')){
			let cenario_div = $(this).parentsUntil('#cenarios_modal__cenarios').last(),
				cenarios_modal__cenarios = cenario_div.parent();
			//Se é um novo cenario, apenas remove
			if (cenario_div[0].hasAttribute('new_cenario')){
				cenario_div.remove();
				if (cenarios_modal__cenarios.children().length === 0)
					cenarios_modal__cenarios.append(buildCenariosPlace());
			}
			else{
				let remove_data = {id: cenario_div.attr('cenario')};
				Global.connect({
					data: {module: 'renda_variavel', action: 'remove_cenarios', params: remove_data},
					success: function (result){
						if (result.status){
							_dashboard_ops__needRebuild = true;
							_analise_obs__needRebuild = true;
							_list_ops__needRebuild = true;
							_arcabouco_info__needRebuild = true;
							Global.toast.create({location: document.getElementById('cenarios_modal_toasts'), color: 'success', body: 'Cenário Removido.', delay: 4000});
							_lista__cenarios.remove(remove_data.id);
							rebuildCenarios_modal_copiar();
							cenario_div.remove();
							if (cenarios_modal__cenarios.children().length === 0)
								cenarios_modal__cenarios.append(buildCenariosPlace());
						}
						else
							Global.toast.create({location: document.getElementById('cenarios_modal_toasts'), color: 'danger', body: result.error, delay: 4000});
					}
				});
			}
		}
	});
	/*
		Processa a adicao / remocao de linhas de observacoes.
	*/
	$(document.getElementById('cenarios_modal__cenarios')).on('click', 'button', function (e){
		//Apenas insere uma nova observacao
		if (this.hasAttribute('adicionar_observacao')){
			let cenario = $(this).parentsUntil('#cenarios_modal__cenarios').last(),
				empty_line = cenario.find('tbody tr[empty]');
			//Captura a ultima Ref preencida
			let last_ref = cenario.find('tbody tr:not([empty])');
			if (last_ref.length){
				last_ref = last_ref.last().find('input[name="ref"]').val();
				if (last_ref === '' || isNaN(last_ref))
					last_ref = '';
				else
					last_ref = parseInt(last_ref) + 1;
			}
			else
				last_ref = 1;
			let place_html = buildListaObservacoes([{ ref: last_ref }], true);
			//Remove o tag 'Sem Observações'
			if (empty_line.length){
				empty_line.remove();
				//Adicionar o cabeçalho
				cenario.find('thead').append(place_html.thead);
			}
			cenario.find('tbody').append(place_html.tbody).promise().then(function (){
				//Ajusta o scroll do cenário
				let card_body = $(this).parentsUntil('div.card').last();
				card_body[0].scrollTop = card_body[0].scrollHeight;
				//Adiciona um badge mostrando a quantidade de observacoes adicionadas
				let qtd_new = this.find('[new_observacao]').length,
					num_obs__new = cenario.find('button[num_obs__new]');
				if (num_obs__new.length)
					num_obs__new.html(`+${qtd_new}`);
				else
					cenario.find('button[remover_cenario]').before(`<button class="btn btn-sm btn-outline-primary disabled ms-2 fw-bold" num_obs__new>+${qtd_new}</button>`);
			});
		}
		//Remove uma observacao
		if (this.hasAttribute('remover_observacao')){
			let me = $(this),
				observacao_row = me.parentsUntil('tbody').last();
			//Se é uma nova observacao, apenas remove
			if (observacao_row[0].hasAttribute('new_observacao')){
				let tbody = me.parentsUntil('table').last(),
					num_obs__new = me.parentsUntil('#cenarios_modal__cenarios').last().find('button[num_obs__new]');
				observacao_row.remove().promise().then(function (){
					let qtd_new = tbody.find('[new_observacao]').length,
						qtd_total = tbody.find('tr').length;
					//Recontagem do badge mostrando a quantidade de observações adicionadas
					if (qtd_new)
						num_obs__new.html(`+${qtd_new}`);
					else
						num_obs__new.remove();
					if (qtd_total === 0){
						let table_html = buildListaObservacoes({});
						tbody.parent().find('thead').empty().append(table_html.thead);
						tbody.append(table_html.tbody);
					}
				});
			}
			//Se é uma remocao de observacao, marca ela para remocao no BD
			else{
				me.prop('disabled', true).removeClass('btn-danger').addClass('btn-secondary');
				observacao_row.attr('remover', '').find('input').prop('disabled', true);
				$(this).parentsUntil('#cenarios_modal__cenarios').last().find('button[salvar_cenario]').removeClass('disabled');
			}
		}
		//Processa a adição de um cenário no BD
		if (this.hasAttribute('salvar_novo_cenario')){
			let cenario_div = $(this).parentsUntil('#cenarios_modal__cenarios').last(),
				insert_data = cenarioGetData(cenario_div);
			if (!Global.isObjectEmpty(insert_data)){
				Global.connect({
					data: {module: 'renda_variavel', action: 'insert_cenarios', params: insert_data},
					success: function (result){
						if (result.status){
							_dashboard_ops__needRebuild = true;
							_analise_obs__needRebuild = true;
							_list_ops__needRebuild = true;
							_arcabouco_info__needRebuild = true;
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
			let cenario_div = $(this).parentsUntil('#cenarios_modal__cenarios').last(),
				update_data = cenarioGetData(cenario_div);
			if (update_data['insert']['observacoes'].length || update_data['update']['cenarios'].length || update_data['update']['observacoes'].length || update_data['remove']['observacoes'].length){
				Global.connect({
					data: {module: 'renda_variavel', action: 'update_cenarios', params: update_data},
					success: function (result){
						if (result.status){
							_dashboard_ops__needRebuild = true;
							_analise_obs__needRebuild = true;
							_list_ops__needRebuild = true;
							_arcabouco_info__needRebuild = true;
							Global.toast.create({location: document.getElementById('cenarios_modal_toasts'), color: 'success', body: 'Cenário Atualizado.', delay: 4000});
							cenario_div.replaceWith(buildCenario(result['data']['cenario'], false));
							_lista__cenarios.update(result['data']['cenario']);
							_lista__operacoes.update(result['data']['operacoes']);
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
	$(document.getElementById('cenarios_modal__cenarios')).on('click', 'td[name="inativo"]', function (e){
		if (e.target.tagName === 'INPUT')
			return true;
		let input = this.querySelector('input[type="checkbox"]');
		if (!input.hasAttribute('disabled'))
			$(input).trigger('click');
	});
	/*
		Marca tudo oque tiver mudança.
	*/
	$(document.getElementById('cenarios_modal__cenarios')).on('change', 'input[name]', function (){
		this.setAttribute('changed', '');
		if (this.name === 'ref')
			reorder_observacoes($(this).parentsUntil('table').last()[0]);
		let cenario_div = $(this).parentsUntil('#cenarios_modal__cenarios').last();
		if (cenario_div[0].hasAttribute('cenario'))
			cenario_div.find('button[salvar_cenario]').removeClass('disabled');
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
						//Reconstroi o 'filters' e 'simulation' em 'renda_variavel__search' com a instancia de arcabouço selecionada
						_renda_variavel__search.update();
						if (_renda_variavel__section === 'dashboard_ops__section')
							rebuildDashboard_ops();
						else if (_renda_variavel__section === 'analise_obs__section')
							rebuildAnalise_obs();
					}
					else
						Global.toast.create({location: document.getElementById('lista_ops_toasts'), color: 'danger', body: result.error, delay: 4000});
				}
			});
		}
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*-------------------------------- Operações Upload ------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Processa o fechamento do modal 'upload_operacoes_modal', para reconstrucao do arcabouço section.
	*/
	$(document.getElementById('upload_operacoes_modal')).on('hidden.bs.modal', function (){
		if (_renda_variavel__section === 'dashboard_ops__section'){
			if (_dashboard_ops__needRebuild){
				_dashboard_ops__needRebuild = false;
				//Reconstroi o 'filters' e 'simulation' em 'renda_variavel__search' com a instancia de arcabouço selecionada
				_renda_variavel__search.update();
				rebuildDashboard_ops();
				buildArcaboucosModal(firstBuild = false, forceRebuild = true, show = false);
			}
		}
		else if (_renda_variavel__section === 'analise_obs__section'){
			if (_analise_obs__needRebuild){
				_analise_obs__needRebuild = false;
				//Reconstroi o 'filters' e 'simulation' em 'renda_variavel__search' com a instancia de arcabouço selecionada
				_renda_variavel__search.update();
				rebuildAnalise_obs();
				buildArcaboucosModal(firstBuild = false, forceRebuild = true, show = false);
			}
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
				gerenciamento = tr.find('td[name="gerenciamento"]').attr('value'),
				vol = tr.find('td[name="vol"]').attr('value'),
				cts = tr.find('td[name="cts"]').attr('value'),
				hora = tr.find('td[name="hora"]').attr('value'),
				erro = tr.find('td[name="erro"]').attr('value'),
				resultado = tr.find('td[name="resultado"]').attr('value'),
				cenario = tr.find('td[name="cenario"]').attr('value'),
				observacoes = tr.find('td[name="observacoes"]').attr('value'),
				ativo_custo = tr.find('td[name="ativo"]').attr('custo'),
				ativo_valor_tick = tr.find('td[name="ativo"]').attr('valor_tick'),
				ativo_pts_tick = tr.find('td[name="ativo"]').attr('pts_tick'),
				gerenciamento_acoes = tr.find('td[name="gerenciamento"]').attr('acoes');
			insert_data['operacoes'].push({
				sequencia: sequencia,
				data: data,
				ativo: ativo,
				op: op,
				gerenciamento: gerenciamento,
				vol: vol,
				cts: cts,
				hora: hora,
				erro: erro,
				resultado: resultado,
				cenario: cenario,
				observacoes: observacoes,
				ativo_custo: ativo_custo,
				ativo_valor_tick: ativo_valor_tick,
				ativo_pts_tick: ativo_pts_tick,
				gerenciamento_acoes: gerenciamento_acoes
			});
		});
		if (insert_data['operacoes'].length){
			Global.connect({
				data: {module: 'renda_variavel', action: 'insert_operacoes', params: JSON.stringify(insert_data)},
				success: function (result){
					if (result.status){
						_dashboard_ops__needRebuild = true;
						_analise_obs__needRebuild = true;
						_list_ops__needRebuild = true;
						_arcabouco_info__needRebuild = true;
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
	/*------------------------------- Operações Adicionar ----------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Corrige bug no bootstrap que não mostra o offcanvas na 1 vez que abre.	
		Processa o fechamento do offcanvas 'adicionar_operacoes_offcanvas', para reconstrucao do arcabouço section.
	*/
	$(document.getElementById('adicionar_operacoes_offcanvas')).on('shown.bs.offcanvas', function (){
		$(this).show();
	}).on('hidden.bs.offcanvas', function (){
		if (_renda_variavel__section === 'dashboard_ops__section'){
			if (_dashboard_ops__needRebuild){
				_dashboard_ops__needRebuild = false;
				//Reconstroi o 'filters' e 'simulation' em 'renda_variavel__search' com a instancia de arcabouço selecionada
				_renda_variavel__search.update();
				rebuildDashboard_ops();
				buildArcaboucosModal(firstBuild = false, forceRebuild = true, show = false);
			}
		}
		else if (_renda_variavel__section === 'analise_obs__section'){
			if (_analise_obs__needRebuild){
				_analise_obs__needRebuild = false;
				//Reconstroi o 'filters' e 'simulation' em 'renda_variavel__search' com a instancia de arcabouço selecionada
				_renda_variavel__search.update();
				rebuildAnalise_obs();
				buildArcaboucosModal(firstBuild = false, forceRebuild = true, show = false);
			}
		}
	});
	/*
		Gerencia a contagem de Pernada e Tendencia em 'adicionar_operacoes_offcanvas__contagem'.
	*/
	$(document.getElementById('adicionar_operacoes_offcanvas__contagem')).find('button[name]').on('click', function (){
		let form = $(document.getElementById('adicionar_operacoes_offcanvas__contagem')),
			c_tendencia = form.find('input[name="c_tendencia"]'),
			c_pernada = form.find('input[name="c_pernada"]'),
			raw_value_c_tendencia = parseInt(c_tendencia.attr('raw_value')),
			raw_value_c_pernada = parseInt(c_pernada.attr('raw_value')),
			show_value_c_tendencia = '',
			show_value_c_pernada = '',
			not_ok_c_tendencia = false,
			not_ok_c_pernada = false;
		//Contagem de Tendencia
		if (this.getAttribute('name') === 'up_c_tendencia'){
			if (raw_value_c_tendencia === 0)
				form.find('button[name="down_c_tendencia"], button[name="up_c_pernada"]').addClass('disabled');
			form.find('button[name="up_c_tendencia"], button[name="restart_c_pernada"]').addClass('disabled');
			form.find('button[name="down_c_pernada"], button[name="restart_c_tendencia"]').removeClass('disabled');
			raw_value_c_tendencia++;
			//Atualiza texto tendencia
			show_value_c_tendencia = `A${Math.abs(raw_value_c_tendencia)}`;
			if (Math.abs(raw_value_c_tendencia) === 2 || Math.abs(raw_value_c_tendencia) === 4)
				not_ok_c_tendencia = true;
			//Atualiza texto pernada
			if (Math.abs(raw_value_c_pernada) > 0){
				show_value_c_pernada = `F B${Math.abs(raw_value_c_pernada)}`;
				if (Math.abs(raw_value_c_pernada) === 1 || Math.abs(raw_value_c_pernada) === 3)
					not_ok_c_pernada = true;
			}
		}
		else if (this.getAttribute('name') === 'down_c_tendencia'){
			if (raw_value_c_tendencia === 0)
				form.find('button[name="up_c_tendencia"], button[name="down_c_pernada"]').addClass('disabled');
			form.find('button[name="down_c_tendencia"], button[name="restart_c_pernada"]').addClass('disabled');
			form.find('button[name="up_c_pernada"], button[name="restart_c_tendencia"]').removeClass('disabled');
			raw_value_c_tendencia--;
			//Atualiza texto tendencia
			show_value_c_tendencia = `B${Math.abs(raw_value_c_tendencia)}`;
			if (Math.abs(raw_value_c_tendencia) === 2 || Math.abs(raw_value_c_tendencia) === 4)
				not_ok_c_tendencia = true;
			//Atualiza texto pernada
			if (Math.abs(raw_value_c_pernada) > 0){
				show_value_c_pernada = `F A${Math.abs(raw_value_c_pernada)}`;
				if (Math.abs(raw_value_c_pernada) === 1 || Math.abs(raw_value_c_pernada) === 3)
					not_ok_c_pernada = true;
			}
		}
		else if (this.getAttribute('name') === 'restart_c_tendencia'){
			form.find('button[name="up_c_tendencia"], button[name="down_c_tendencia"], button[name="restart_c_tendencia"]').removeClass('disabled');
			form.find('button[name="up_c_pernada"], button[name="down_c_pernada"], button[name="restart_c_pernada"]').addClass('disabled');
			raw_value_c_tendencia = 0;
			raw_value_c_pernada = 0;
		}
		//Contagem de Pernada
		else if (this.getAttribute('name') === 'up_c_pernada'){
			form.find('button[name="up_c_pernada"], button[name="restart_c_tendencia"]').addClass('disabled');
			form.find('button[name="down_c_tendencia"], button[name="restart_c_pernada"]').removeClass('disabled');
			raw_value_c_pernada++;
			//Atualiza texto pernada
			show_value_c_pernada = `A${Math.abs(raw_value_c_pernada)}`;
			if (Math.abs(raw_value_c_pernada) === 2 || Math.abs(raw_value_c_pernada) === 4)
				not_ok_c_pernada = true;
			//Atualiza texto tendencia
			show_value_c_tendencia = `F B${Math.abs(raw_value_c_tendencia)}`;
			if (Math.abs(raw_value_c_tendencia) === 1 || Math.abs(raw_value_c_tendencia) === 3)
				not_ok_c_tendencia = true;
		}
		else if (this.getAttribute('name') === 'down_c_pernada'){
			form.find('button[name="down_c_pernada"], button[name="restart_c_tendencia"]').addClass('disabled');
			form.find('button[name="up_c_tendencia"], button[name="restart_c_pernada"]').removeClass('disabled');
			raw_value_c_pernada--;
			//Atualiza texto pernada
			show_value_c_pernada = `B${Math.abs(raw_value_c_pernada)}`;
			if (Math.abs(raw_value_c_pernada) === 2 || Math.abs(raw_value_c_pernada) === 4)
				not_ok_c_pernada = true;
			//Atualiza texto tendencia
			show_value_c_tendencia = `F A${Math.abs(raw_value_c_tendencia)}`;
			if (Math.abs(raw_value_c_tendencia) === 1 || Math.abs(raw_value_c_tendencia) === 3)
				not_ok_c_tendencia = true;
		}
		else if (this.getAttribute('name') === 'restart_c_pernada'){
			form.find('button[name="restart_c_restart"]').addClass('disabled');
			raw_value_c_pernada = 0;
			show_value_c_tendencia = c_tendencia.val();
			not_ok_c_tendencia = parseInt(c_tendencia.attr('not_ok')) === 1;
		}
		form.find('input[name="c_tendencia"]').attr('not_ok', ((not_ok_c_tendencia) ? 1 : 0)).attr('raw_value', raw_value_c_tendencia).toggleClass('not_ok', not_ok_c_tendencia).val(show_value_c_tendencia);
		form.find('input[name="c_pernada"]').attr('not_ok', ((not_ok_c_pernada) ? 1 : 0)).attr('raw_value', raw_value_c_pernada).toggleClass('not_ok', not_ok_c_pernada).val(show_value_c_pernada);
	});
	/*
		Insere um novo bloco de operações.
	*/
	$(document.getElementById('adicionar_operacoes_offcanvas__new_bloco')).on('click', function (){
		let form = $(document.getElementById('adicionar_operacoes_offcanvas__form_default')),
			tbody = $(document.getElementById('table_adicionar_operacoes')).find('tbody'),
			default_data = ((form.find('select[name="hoje"]').val().length) ? moment().format('DD/MM/YYYY') : ''),
			default_ativo = form.find('input[name="ativo"]').val(),
			ativo_index = -1,
			default_cts = form.find('input[name="cts"]').val(),
			default_cenario = form.find('input[name="cenario"]').val(),
			id_cenario = -1,
			id_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
			gerenciamentos_a_criar = [],
			default_gerenciamentos = form.find('select[name="gerenciamento"]').val(),
			ult_seq = (parseInt(tbody.find('tr').last().attr('sequencia')) || 0) + 1,
			ult_bloco = (parseInt(tbody.find('tr').last().attr('bloco')) || 0) + 1,
			html_body = ``,
			html_head = ``;
		if (!default_gerenciamentos.length)
			return true;
		//Seta o tipo de bloco a criar
		if (_new_bloco__type__com_acoes === null)
			_new_bloco__type__com_acoes = default_data === ''; 
		for (let g in _lista__gerenciamentos['gerenciamentos']){
			if (default_gerenciamentos.includes(_lista__gerenciamentos['gerenciamentos'][g]['id'])){
				gerenciamentos_a_criar.push({
					nome: _lista__gerenciamentos['gerenciamentos'][g]['nome'],
					acoes: _lista__gerenciamentos['gerenciamentos'][g]['acoes'],
					escaladas: _lista__gerenciamentos['gerenciamentos'][g]['escaladas'],
					acoes_text: JSON.stringify(_lista__gerenciamentos['gerenciamentos'][g]['acoes'])
				});
			}
		}
		//Verifica se o ativo está cadastrado
		for (let a in _lista__ativos['ativos']){
			if (default_ativo.localeCompare(_lista__ativos['ativos'][a]['nome'], undefined, {sensitivity: 'base'}) === 0)
				ativo_index = a;
		}
		//Verifica se o cenario está cadastrado
		for (let cn in _lista__cenarios['cenarios'][id_arcabouco]){
			if (default_cenario.localeCompare(_lista__cenarios['cenarios'][id_arcabouco][cn]['nome'], undefined, {sensitivity: 'base'}) === 0){
				id_cenario = cn;
				default_cenario = _lista__cenarios['cenarios'][id_arcabouco][cn]['nome'];
			}
		}
		//Tabela não foi iniciada ainda
		if (ult_bloco === 1){
			html_head += `<tr>`+
						`<th>#</th>`+
						`<th>Data</th>`+
						`<th>Ativo</th>`+
						`<th>Gerenc.</th>`+
						`<th>Op</th>`+
						`<th>Barra</th>`+
						`<th>Vol</th>`+
						`<th>Cts</th>`+
						((_new_bloco__type__com_acoes) ? `<th>Res. Ações</th>` : ``)+
						`<th>Esc.</th>`+
						`<th>Resultado</th>`+
						`<th>Cenário</th>`+
						`<th>Observações</th>`+
						`<th>Erro</th>`+
						`</tr>`;
		}
		for (let q=0; q<3; q++){
			for (let i=0; i<gerenciamentos_a_criar.length; i++){
				let acoes = ``;
				if (_new_bloco__type__com_acoes){
					for (let ac=0; ac < gerenciamentos_a_criar[i]['acoes'].length; ac++)
						acoes += `<button type="button" class="btn btn-sm ${((parseFloat(gerenciamentos_a_criar[i]['acoes'][ac]) < 0) ? 'btn-danger' : 'btn-success')} flex-fill" value="${gerenciamentos_a_criar[i]['acoes'][ac]}" escalada="${gerenciamentos_a_criar[i]['escaladas'][ac]}">${Math.abs(parseFloat(gerenciamentos_a_criar[i]['acoes'][ac]))}S${((gerenciamentos_a_criar[i]['escaladas'][ac] != 0) ? ` E${gerenciamentos_a_criar[i]['escaladas'][ac]}` : ``)}</button>`;
				}
				html_body += `<tr sequencia="${ult_seq++}" bloco="${ult_bloco}" ${((i === gerenciamentos_a_criar.length-1) ? `class="tr_separator"` : ``)}>`+
						((i === 0) ? `<td rowspan="${gerenciamentos_a_criar.length}" name="bloco" class="fw-bold text-center">${ult_bloco}</td>` : ``)+
						`<td name="data"><input type="text" name="data" class="form-control form-control-sm text-center" value="${default_data}" onclick="this.select()" ${((default_data !== '') ? 'disabled' : '')}></td>`+
						`<td name="ativo"><input type="text" name="ativo" class="form-control form-control-sm text-center" value="${((ativo_index !== -1) ? _lista__ativos['ativos'][ativo_index].nome : '')}" pts_tick="${((ativo_index !== -1) ? _lista__ativos['ativos'][ativo_index].pts_tick : '')}" valor_tick="${((ativo_index !== -1) ? _lista__ativos['ativos'][ativo_index].valor_tick : '')}" custo="${((ativo_index !== -1) ? _lista__ativos['ativos'][ativo_index].custo : '')}" onclick="this.select()" ${((ativo_index !== -1) ? 'disabled' : '')}></td>`+
						`<td name="gerenciamento"><input type="text" name="gerenciamento" class="form-control form-control-sm text-center" value="${gerenciamentos_a_criar[i].nome}" acoes='${gerenciamentos_a_criar[i].acoes_text}' disabled></td>`+
						`<td name="op"><input type="text" name="op" class="form-control form-control-sm text-center" onclick="this.select()"></td>`+
						`<td name="barra"><input type="text" name="barra" hora="" class="form-control form-control-sm text-center" onclick="this.select()"></td>`+
						`<td name="vol"><input type="text" name="vol" class="form-control form-control-sm text-center" onclick="this.select()"></td>`+
						`<td name="cts"><input type="text" name="cts" class="form-control form-control-sm text-center" onclick="this.select()" value="${default_cts}" mao="${default_cts}" ${((default_cts !== '') ? 'disabled' : '')}></td>`+
						((_new_bloco__type__com_acoes) ? `<td name="ger_acoes"><div class="input-group d-flex">${acoes}</div></td>` : ``)+
						`<td name="escalada"><input type="text" name="escalada" class="form-control form-control-sm text-center" ${((_new_bloco__type__com_acoes) ? 'disabled' : '')}></td>`+
						`<td name="resultado"><input type="text" name="resultado" class="form-control form-control-sm text-center"></td>`+
						`<td name="cenario"><input type="text" name="cenario" class="form-control form-control-sm text-center" onclick="this.select()" value="${default_cenario}" ${((default_cenario !== '') ? 'disabled' : '')}></td>`+
						`<td name="observacoes"><input type="text" name="observacoes" class="form-control form-control-sm text-center"></td>`+
						`<td name="erro"><input type="text" name="erro" class="form-control form-control-sm text-center" onclick="this.select()"></td>`+
						`</tr>`;
			}
			ult_bloco++;
		}
		if (html_head !== '')
			$(document.getElementById('table_adicionar_operacoes')).find('thead').append(html_head);
		tbody.find('tr[empty]').remove().end().append(html_body).promise().then(function (){
			//Para manter a table_adicionar_operacoes dentro da altura da Viewport
			let table_size = window.innerHeight - 160;
			tbody.parent().parent().parent().css('height', `${table_size}px`);
		});
		if (id_cenario !== -1)
			buildAdicionarOperacoes__ExtraDados(id_arcabouco, id_cenario);
	});
	/*
		Ao focar na data, se o campo não estiver ja preenchido, copia do de cima em 'table_adicionar_operacoes'.
	*/
	$(document.getElementById('table_adicionar_operacoes')).on('focus', 'input[name="data"]', function (){
		if (this.value === ''){
			let tr = $(this).parentsUntil('tbody').last(),
				tr_ant__data = tr.prev().find('input[name="data"]').val() || '';
			tr.parent().find(`tr[bloco="${tr.attr('bloco')}"] input[name="data"]`).removeClass('border-danger').val(tr_ant__data);
		}
	});
	/*
		Ao focar no cenario, se o campo estiver preenchido, gera as observações em 'adicionar_operacoes__extraDados'.
	*/
	$(document.getElementById('table_adicionar_operacoes')).on('focus', 'input[name="cenario"]', function (){
		if (this.value !== ''){
			let id_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
				id_cenario = -1;
			for (let cn in _lista__cenarios['cenarios'][id_arcabouco]){
				if (this.value.localeCompare(_lista__cenarios['cenarios'][id_arcabouco][cn]['nome'], undefined, {sensitivity: 'base'}) === 0)
					id_cenario = cn;
			}
			buildAdicionarOperacoes__ExtraDados(id_arcabouco, id_cenario);
		}
	});
	/*
		Processa alterações nos inputs em 'table_adicionar_operacoes'.
	*/
	$(document.getElementById('table_adicionar_operacoes')).on('change', 'input[name]', function (){
		if (this.hasAttribute('disabled'))
			return true;
		let inputs_validate = ['data', 'ativo', 'op', 'barra', 'vol', 'cts', 'escalada', 'resultado', 'cenario', 'observacoes', 'erro'],
			inputs_copy = ['data', 'ativo', 'op', 'barra', 'vol', 'cts', 'cenario', 'observacoes', 'erro'],
			inputs_check_riscoMax = ['ativo', 'vol', 'cts'],
			tr = $(this).parentsUntil('tbody').last(),
			sequencia = tr.attr('sequencia'),
			bloco = tr.attr('bloco');
		//Valida inputs
		if (inputs_validate.includes(this.name)){
			//Valida a Data
			if (this.name === 'data' && Global.convertDate(this.value) === '')
				this.value = '';
			//Valida o Ativo
			if (this.name === 'ativo'){
				let ativo_index = -1;
				for (let a in _lista__ativos['ativos']){
					if (this.value.localeCompare(_lista__ativos['ativos'][a]['nome'], undefined, {sensitivity: 'base'}) === 0)
						ativo_index = a;
				}
				if (ativo_index !== -1){
					this.value = _lista__ativos['ativos'][ativo_index].nome;
					this.setAttribute('custo', _lista__ativos['ativos'][ativo_index].custo);
					this.setAttribute('pts_tick', _lista__ativos['ativos'][ativo_index].pts_tick);
					this.setAttribute('valor_tick', _lista__ativos['ativos'][ativo_index].valor_tick);
				}
				else{
					this.value = '';
					this.setAttribute('custo', '');
					this.setAttribute('pts_tick', '');
					this.setAttribute('valor_tick', '');
				}
			}
			//Valida a Op
			if (this.name === 'op' && (this.value !== 'c' && this.value !== 'v'))
				this.value = '';
			//Valida a Barra
			if (this.name === 'barra'){
				if (isNaN(this.value) || this.value == 0 || parseInt(this.value) > 120){
					this.value = '';
					this.setAttribute('hora', '');
				}
				else{
					let default_tempo_grafico = $(document.getElementById('adicionar_operacoes_offcanvas__form_default')).find('select[name="tempo_grafico"]').val(),
						hora = moment('09:00:00', 'HH:mm:ss').add((parseInt(default_tempo_grafico) * (parseInt(this.value) - 1)), 'minutes').format('HH:mm:ss');
					this.setAttribute('hora', hora);
				}
			}
			//Valida a Vol
			if (this.name === 'vol' && (isNaN(this.value) || this.value == 0))
				this.value = '';
			//Valida o Cts
			if (this.name === 'cts'){
				if (isNaN(this.value) || this.value == 0){
					this.value = '';
					this.setAttribute('mao', '');
				}
				else
					this.setAttribute('mao', this.value);
			}
			//Valida a Escalada
			if (this.name === 'escalada'){
				let gerenciamento_value = tr.find('input[name="gerenciamento"]').val(),
					gerenciamento_index = -1;
				for (let g in _lista__gerenciamentos['gerenciamentos']){
					if (gerenciamento_value.localeCompare(_lista__gerenciamentos['gerenciamentos'][g]['nome'], undefined, {sensitivity: 'base'}) === 0)
						gerenciamento_index = g;
				}
				if (gerenciamento_index !== -1 && _lista__gerenciamentos['gerenciamentos'][gerenciamento_index]['escaladas'].indexOf(this.value) !== -1){
					let cts_input = tr.find('input[name="cts"]');
					cts_input.val(parseFloat(cts_input.val()) * (parseInt(this.value)) + 1);
				}
				else
					this.value = '';
			}
			//Valida o Resultado
			if (this.name === 'resultado'){
				if ((isNaN(this.value) || this.value == 0))
					this.value = '';
				else
					$(this).removeClass('border-danger');
			}
			//Trata o cenário, para mostrar suas observações ao lado
			if (this.name === 'cenario'){
				let id_arcabouco = _lista__instancias_arcabouco.getSelected('id'),
					id_cenario = -1;
				for (let cn in _lista__cenarios['cenarios'][id_arcabouco]){
					if (this.value.localeCompare(_lista__cenarios['cenarios'][id_arcabouco][cn]['nome'], undefined, {sensitivity: 'base'}) === 0)
						id_cenario = cn;
				}
				if (id_cenario !== -1)
					this.value = _lista__cenarios['cenarios'][id_arcabouco][id_cenario].nome;
				buildAdicionarOperacoes__ExtraDados(id_arcabouco, id_cenario);
			}
			//Trata as observações para remover ',' sobrando
			if (this.name === 'observacoes' && this.value !== '')
				this.value = this.value.split(',').filter(n => n);
			//Valida o Erro
			if (this.name === 'erro' && (isNaN(this.value) || this.value != 1))
				this.value = '';
		}
		//Copia o valor para outras operações do mesmo bloco
		if (inputs_copy.includes(this.name)){
			//Copia o custo, pts_tick e valor_tick
			if (this.name === 'ativo'){
				let custo = tr.find('input[name="ativo"]').attr('custo'),
					pts_tick = tr.find('input[name="ativo"]').attr('pts_tick'),
					valor_tick = tr.find('input[name="ativo"]').attr('valor_tick');
				tr.parent().find(`tr[bloco="${bloco}"] input[name="${this.name}"]`).removeClass('border-danger').val(this.value).attr('custo', custo).attr('pts_tick', pts_tick).attr('valor_tick', valor_tick);
			}
			//Copia a hora
			else if (this.name === 'barra'){
				let hora = tr.find('input[name="barra"]').attr('hora');
				tr.parent().find(`tr[bloco="${bloco}"] input[name="${this.name}"]`).removeClass('border-danger').val(this.value).attr('hora', hora);
			}
			else if (this.name === 'cts'){
				let mao = tr.find('input[name="cts"]').attr('mao');
				tr.parent().find(`tr[bloco="${bloco}"] input[name="${this.name}"]`).removeClass('border-danger').val(this.value).attr('mao', mao);
			}
			else
				tr.parent().find(`tr[bloco="${bloco}"] input[name="${this.name}"]`).removeClass('border-danger').val(this.value);
		}
		//Calcula Risco Máx com base nos dados para ver se a operação pode existir
		if (inputs_check_riscoMax.includes(this.name)){
			let simulations = _lista__instancias_arcabouco.getSelected('simulations'),
				R = ('R' in simulations) ? parseFloat(simulations.R) : null;
			//Para cada gerenciamento do bloco
			tr.parent().find(`tr[bloco="${bloco}"]`).each(function (i, e_tr){
				e_tr = $(e_tr);
				let valor_tick = e_tr.find('input[name="ativo"]').attr('valor_tick'),
					gerenciamento = e_tr.find('input[name="gerenciamento"]').attr('value'),
					gerenciamento_index = -1,
					vol = e_tr.find('input[name="vol"]').val(),
					cts = e_tr.find('input[name="cts"]').val();
				if (R !== null && valor_tick !== '' && gerenciamento !== '' && vol !== '' && cts !== ''){
					for (let g in _lista__gerenciamentos['gerenciamentos']){
						if (gerenciamento.localeCompare(_lista__gerenciamentos['gerenciamentos'][g]['nome'], undefined, {sensitivity: 'base'}) === 0)
							gerenciamento_index = g;
					}
					if (gerenciamento_index !== -1){
						//Verifica se algum Stop do gerenciamento passa do R máximo
						for (let r in _lista__gerenciamentos['gerenciamentos'][gerenciamento_index]['acoes']){
							let acao_value = parseFloat(_lista__gerenciamentos['gerenciamentos'][gerenciamento_index]['acoes'][r]);
							if (acao_value < 0){
								let stop = parseFloat(vol) * parseFloat(valor_tick) * parseInt(cts) * acao_value;
								if (Math.abs(stop) > R){
									e_tr.addClass('risk_block');
									if (i === 0)
										e_tr.find('input[name="resultado"]').prop('disabled', true);
									else
										e_tr.addClass('hide');
									return true;
								}
							}
						}
					}
				}
				//Todos os stops deste gerenciamento estao dentro do R
				e_tr.removeClass('risk_block');
				if (i === 0)
					e_tr.find('input[name="resultado"]').prop('disabled', false);
				else
					e_tr.removeClass('hide');
			});
		}
	});
	/*
		Processa o preenchimento automatico do resultado com base na ação executada do gerenciamento.
	*/
	$(document.getElementById('table_adicionar_operacoes')).on('click', 'tbody button[value]', function (){
		let tr = $(this).parentsUntil('tbody').last(),
			valor_tick = tr.find('input[name="ativo"]').attr('valor_tick'),
			vol = tr.find('input[name="vol"]').val(),
			mao = tr.find('input[name="cts"]').attr('mao'),
			novo_cts = mao,
			gerenciamento_value = this.getAttribute('value'),
			gerenciamento_escalada = this.getAttribute('escalada'),
			resultado = '';
		if (valor_tick !== '' && vol !== '' && mao !== ''){
			novo_cts = parseInt(novo_cts) * (parseFloat(gerenciamento_escalada) + 1);
			resultado = parseFloat(vol) * parseFloat(valor_tick) * parseInt(mao) * parseFloat(gerenciamento_value);
		}
		tr.find('input[name="escalada"]').val(gerenciamento_escalada);
		tr.find('input[name="resultado"]').removeClass('border-danger').val(resultado);
		tr.find('input[name="cts"]').removeClass('border-danger').val(novo_cts);
	});
	/*
		Processa a remoção de linhas ou blocos em 'table_adicionar_operacoes'
	*/
	$(document.getElementById('table_adicionar_operacoes')).on('click', 'tbody tr[sequencia]', function (e){
		if (e.ctrlKey && !Global.hasClass(this, 'risk_block')){
			let bloco = this.getAttribute('bloco'),
				table = $(this).parent().parent();
			//Remove o bloco todo
			if (e.target.nodeName === 'TD' && e.target.hasAttribute('name') && e.target.getAttribute('name') === 'bloco')
				$(this).parent().find(`tr[bloco="${bloco}"]`).remove();
			else
				$(this).remove();
			if (table.find('tbody tr').length === 0)
				resetAdicionarOperacaoTable();
			fixTDBlocos__Table(bloco);
		}
	});
	/*
		Limpa as operações removendo tudo do offcanvas.
	*/
	$(document.getElementById('adicionar_operacoes_offcanvas__erase_all')).on('dblclick', function (){
		resetAdicionarOperacaoTable();
		resetAdicionarOperacao__ContagemForm();
	});
	/*
		Envia as operações para serem adicionadas ao arcabouço em 'adicionar_operacoes_offcanvas'.
	*/
	$(document.getElementById('adicionar_operacoes_offcanvas__enviar')).on('click', function (){
		let tbody = $(document.getElementById('table_adicionar_operacoes')).find('tbody'),
			insert_data = {id_arcabouco: _lista__instancias_arcabouco.getSelected('id'), operacoes: []},
			error = false;
		//Exclui as linhas com 'risk_block'
		tbody.find('tr.risk_block').remove();
		if (tbody.find('input[name].border-danger').length)
			return true;
		tbody.find('tr[sequencia]').each(function (i, tr){
			tr = $(tr);
			let sequencia = tr.attr('sequencia'),
				data = tr.find('input[name="data"]'),
				ativo = tr.find('input[name="ativo"]'),
				gerenciamento = tr.find('input[name="gerenciamento"]'),
				op = tr.find('input[name="op"]'),
				barra = tr.find('input[name="barra"]'),
				vol = tr.find('input[name="vol"]'),
				cts = tr.find('input[name="cts"]'),
				escalada = tr.find('input[name="escalada"]'),
				resultado = tr.find('input[name="resultado"]'),
				cenario = tr.find('input[name="cenario"]'),
				observacoes = tr.find('input[name="observacoes"]'),
				erro = tr.find('input[name="erro"]');
			//Se for linha em branco remove
			if ((data.val() === '' || data.is(':disabled')) && (ativo.val() === '' || ativo.is(':disabled')) && (gerenciamento.val() === '' || gerenciamento.is(':disabled')) && (op.val() === '' || op.is(':disabled')) && (vol.val() === '' || vol.is(':disabled')) && (cts.val() === '' || cts.is(':disabled')) && (resultado.val() === '' || resultado.is(':disabled'))){
				tr.remove();
				return true;
			}
			if (data.val() === ''){
				data.addClass('border-danger');
				error = true;
			}
			if (ativo.val() === ''){
				ativo.addClass('border-danger');
				error = true;
			}
			if (gerenciamento.val() === ''){
				gerenciamento.addClass('border-danger');
				error = true;
			}
			if (op.val() === ''){
				op.addClass('border-danger');
				error = true;
			}
			if (vol.val() === ''){
				vol.addClass('border-danger');
				error = true;
			}
			if (cts.val() === ''){
				cts.addClass('border-danger');
				error = true;
			}
			if (resultado.val() === ''){
				resultado.addClass('border-danger');
				error = true;
			}
			if (!error){
				insert_data['operacoes'].push({
					sequencia: sequencia,
					data: Global.convertDate(data.val()),
					ativo: ativo.val(),
					gerenciamento: gerenciamento.val(),
					escalada: escalada.val(),
					op: ((op.val() === 'c') ? 1 : 2),
					hora: barra.attr('hora'),
					vol: vol.val(),
					cts: cts.val(),
					resultado: resultado.val(),
					cenario: cenario.val(),
					observacoes: observacoes.val(),
					erro: erro.val(),
					ativo_custo: ativo.attr('custo'),
					ativo_valor_tick: ativo.attr('valor_tick'),
					ativo_pts_tick: ativo.attr('pts_tick'),
					gerenciamento_acoes: gerenciamento.attr('acoes')
				});
			}
		});
		if (!error){
			if (insert_data['operacoes'].length){
				Global.connect({
					data: {module: 'renda_variavel', action: 'insert_operacoes', params: JSON.stringify(insert_data)},
					success: function (result){
						if (result.status){
							_dashboard_ops__needRebuild = true;
							_analise_obs__needRebuild = true;
							_list_ops__needRebuild = true;
							_arcabouco_info__needRebuild = true;
							_lista__operacoes.update(result['data']['operacoes']);
							_lista__arcaboucos.update(result['data']['arcabouco'][0]);
							if (result.hold_ops.length === 0){
								Global.toast.create({location: document.getElementById('adicionar_operacoes_offcanvas_toasts'), color: 'success', body: 'Operações Adicionadas.', delay: 4000});
								resetAdicionarOperacaoTable();
							}
							else{
								Global.toast.create({location: document.getElementById('adicionar_operacoes_offcanvas_toasts'), color: 'warning', body: 'Essas operações já foram adicionadas.', delay: 4000});
								$(document.getElementById('table_adicionar_operacoes')).find('tbody tr[sequencia]').each(function (t, tr){
									tr = $(tr);
									let seq = tr.attr('sequencia');
									if (!result.hold_ops.includes(seq))
										tr.remove();
								});
								fixTDBlocos__Table();
							}
						}
						else
							Global.toast.create({location: document.getElementById('adicionar_operacoes_offcanvas_toasts'), color: 'danger', body: result.error, delay: 4000});
					}
				});
			}
			else
				resetAdicionarOperacaoTable();
		}
		else
			fixTDBlocos__Table();
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------- Section Dashboard Ops ----------------------------*/
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
				_arcabouco_info__needRebuild = true;
				//Inicia o offcanvas de Adicionar Operações
				buildAdicionarOperacoesOffcanvas(firstBuild = false, forceRebuild = true, show = false);
				if (!(_lista__instancias_arcabouco.getSelected('id') in _lista__operacoes.operacoes)){
					Global.connect({
						data: {module: 'renda_variavel', action: 'get_arcabouco_data', params: {id_arcabouco: _lista__instancias_arcabouco.getSelected('id')}},
						success: function (result){
							if (result.status){
								_lista__cenarios.create(result.data['cenarios']);
								_lista__operacoes.update(result.data['operacoes']);
								//Reconstroi o 'filters' e 'simulation' em 'renda_variavel__search' com a instancia de arcabouço selecionada
								_renda_variavel__search.update();
								if (_renda_variavel__section === 'dashboard_ops__section')
									rebuildDashboard_ops();
								else if (_renda_variavel__section === 'analise_obs__section')
									rebuildAnalise_obs();
							}
							else
								Global.toast.create({location: document.getElementById('master_toasts'), title: 'Erro', time: 'Now', body: result.error, delay: 4000});
						}
					});
				}
				else{
					//Reconstroi o 'filters' e 'simulation' em 'renda_variavel__search' com a instancia de arcabouço selecionada
					_renda_variavel__search.update();
					if (_renda_variavel__section === 'dashboard_ops__section')
						rebuildDashboard_ops();
					else if (_renda_variavel__section === 'analise_obs__section')
						rebuildAnalise_obs();
				}
			}
		}
	});
	/*
		Processa as seleções de observações em 'filters'.
	*/
	$(document.getElementById('renda_variavel__search')).on('click', 'div.iSelectKami[name] ul li button.dropdown-item', function (e){
		let me = $(this),
			cenario_nome = me.attr('pertence'),
			div_holder = me.parent().parent().parent(),
			select_name = div_holder.attr('name'),
			placeholder = {'observacoes': 'Observações'},
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
				me.attr('selected', '');
			dashboard_filters['cenario'][cenario_nome][select_name][me.attr('value')] = (me.find('input[name="negar_valor"]').prop('checked')) ? 1 : 0;	
		}
		//Atualiza no localStorage
		_lista__instancias_arcabouco.updateInstancia_Filters('cenario', dashboard_filters['cenario']);
		//Atualiza o placeholder
		qtd_selected = div_holder.find('ul button.dropdown-item[selected]').length;
		div_holder.find('button.dropdown-toggle').html(((qtd_selected > 1) ? `${qtd_selected} items selected` : ((qtd_selected === 1) ? `1 item selected` : `${placeholder[select_name]}`)));
	});
	/*
		Processa a de-seleção de todos os valores no select de observações.
	*/
	$(document.getElementById('renda_variavel__search')).on('click', 'div.iSelectKami[name] ul li button[name="tira_tudo"]', function (){
		let div_holder = $(this).parent().parent().parent().parent(),
			select_name = div_holder.attr('name'),
			placeholder = {'observacoes': 'Observações'},
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
		Processa no select de observações, mudança no tipo de query a ser formatada na filtragem. (OR ou AND)
	*/
	$(document.getElementById('renda_variavel__search')).on('change', 'div.iSelectKami[name] ul li select.iSelectKami', function (){
		_lista__instancias_arcabouco.updateInstancia_Filters(this.name, $(this).val());
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------- Section Analise Obs ------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////////////
	/*----------------------------------- Menu Top -----------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	/*
		Comanda cliques no menu de renda variavel.
	*/
	$('[name]', document.getElementById('renda_variavel__menu')).click(function (e){
		e.preventDefault();
		if (this.name === 'arcaboucos')
			buildArcaboucosModal(firstBuild = false, forceRebuild = false, show = true);
		else if (this.name === 'ativos')
			buildAtivosModal(firstBuild = false, show = true);
		else if (this.name === 'gerenciamentos')
			buildGerenciamentosModal(forceRebuild = false, show = true);
		else if (this.name === 'arcabouco_info')
			buildArcaboucoInfoOffcanvas();
		else if (this.name === 'cenarios')
			buildCenariosModal();
		else if (this.name === 'lista_ops')
			buildOperacoesOffcanvas(forceRebuild = false);
		else if (this.name === 'upload_operacoes')
			buildUploadOperacoesModal();
		else if (this.name === 'adicionar_operacoes')
			buildAdicionarOperacoesOffcanvas(firstBuild = false, forceRebuild = false, show = true);
		else if (this.name === 'section_dashboard_ops'){
			$(this).parentsUntil('#renda_variavel__menu').last().find('button').html(this.innerHTML);
			changeSection__Renda_variavel('dashboard_ops__section');
		}
		else if (this.name === 'section_analise_obs'){
			$(this).parentsUntil('#renda_variavel__menu').last().find('button').html(this.innerHTML);
			changeSection__Renda_variavel('analise_obs__section');
		}
	});
	////////////////////////////////////////////////////////////////////////////////////
	/*------------------------------- INIT DO SISTEMA --------------------------------*/
	////////////////////////////////////////////////////////////////////////////////////
	Global.connect({
		data: {module: 'renda_variavel', action: 'get_arcabouco_data'},
		success: function (result){
			if (result.status){
				//Constroi a lista de Usuarios, Ativos, Arcabouços e Gerenciamentos
				_lista__usuarios.update(result.data['usuarios']);
				_lista__ativos.update(result.data['ativos']);
				_lista__gerenciamentos.update(result.data['gerenciamentos']);
				_lista__arcaboucos.create(result.data['arcaboucos']);
				//Inicia o modal de Ativos
				buildAtivosModal(firstBuild = true, show = false);
				//Inicia o modal de Gerenciamentos
				buildGerenciamentosModal(forceRebuild = true, show = false);
				//Inicia o modal de arcabouços
				buildArcaboucosModal(firstBuild = true, forceRebuild = true, show = false);
				//Inicia o offcanvas de Adicionar Operações
				buildAdicionarOperacoesOffcanvas(firstBuild = true, forceRebuild = true, show = false);
				//Inicia a lista de instancias (Com uma já salva ou uma nova) e termina de construir o arcabouço Section
				_lista__instancias_arcabouco.start(result.data);
				_list_ops__needRebuild = true;
				_arcabouco_info__needRebuild = true;
			}
			else
				Global.toast.create({location: document.getElementById('master_toasts'), title: 'Erro', time: 'Now', body: result.error, delay: 4000});
		}
	});
	/*--------------------------------------------------------------------------------*/
	return {}
})();