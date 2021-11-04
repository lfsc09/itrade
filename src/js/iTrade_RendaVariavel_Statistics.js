let RV_Statistics = (function(){
	/*---------------------------------- FUNCTIONS -----------------------------------*/
	/*
		Função de divisão, retornando 0 caso o denominador seja 0.
	*/
	function divide(a, b){ return (b) ? a/b : 0; }
	/*
		Compara duas datas ou dois horarios, retornando:
			 1: v1 > v2
			 0: v1 = v2
			-1: v1 < v2
	*/
	let compareDate_Time = function(v1, v2, method = 'date'){
		if (method === 'date'){
			let e_v2 = v2.split('/');
			v1 = new Date(`${v1}`);
			v2 = new Date(`${e_v2[2]}-${e_v2[1]}-${e_v2[0]}`);
		}
		else if (method === 'time'){
			v1 = new Date(`2000-01-01 ${v1}`);
			v2 = new Date(`2000-01-01 ${v2}`);
		}
		if (v1 > v2) return 1;
		else if (v1 < v2) return -1;
		else return 0;
	}
	/*
		Busca premissas do cenario passado na lista de premissas dos filtros.
	*/
	let checkPremissas_Observacoes = function (opCenario, opPrem_Obs, filter_cenarios, key = '', method = 'OR'){
		//Verifica se o cenario está nos filtros
		if (opCenario in filter_cenarios){
			//Verifica se há premissas ou observações escolhidas nos filtros do cenario
			if (!Global.isObjectEmpty(filter_cenarios[opCenario][key])){
				let opPrem_Obs__Array = opPrem_Obs.split(',');
				//Descarta operações sem premissas/observações cadastradas
				if (opPrem_Obs__Array.length === 0)
					return false;
				//A operação deve ter pelo menos um dos filtros escolhidos 
				if (method === 'OR'){
					for (let ref in filter_cenarios[opCenario][key]){
						//Operações que TENHAM a premissa/observação
						if (filter_cenarios[opCenario][key][ref] == 0){
							if (opPrem_Obs__Array.includes(ref))
								return true;
						}
						//Operações que NÃO TENHAM a premissa/observação
						else if (filter_cenarios[opCenario][key][ref] == 1){
							if (!opPrem_Obs__Array.includes(ref))
								return true;
						}
					}
					return false;
				}
				//A operação deve ter todos os filtros escolhidos 
				if (method === 'AND'){
					for (let ref in filter_cenarios[opCenario][key]){
						//Operações que TENHAM a premissa/observação
						if (filter_cenarios[opCenario][key][ref] == 0){
							if (!opPrem_Obs__Array.includes(ref))
								return false;
						}
						//Operações que NÃO TENHAM a premissa/observação
						else if (filter_cenarios[opCenario][key][ref] == 1){
							if (opPrem_Obs__Array.includes(ref))
								return false;
						}
					}
				}
			}
		}
		return true;
	}
	/*
		Calcula a quantidade de Cts, baseado no 'tipo_cts' passado.
	*/
	let findCts_toUse = function (opCts, stopBrl, simulate){
		//Usar Cts da operação
		if (simulate.tipo_cts === '1' || (simulate.tipo_cts === '2' && simulate.cts === null) || (simulate.tipo_cts === '3' && simulate.R === null))
			return opCts;
		//Força uma quantidade fixa passada em 'simulate.cts'
		else if (simulate.tipo_cts === '2' && simulate.cts !== null)
			return simulate.cts;
		//Calcula o numero maximo de Cts a partir do 'R' e do 'Maior Stop' da operacao
		else if (simulate.tipo_cts === '3')
			return Math.floor(divide(simulate.R, stopBrl));
	}
	/*
		Aplica os 'filters' na operacao passada.
	*/
	let okToUse_filterOp = function (op, filters, simulate){
		//Filtra a data com a data inicial
		if (filters.data_inicial !== null && compareDate_Time(op.data, filters.data_inicial, 'date') === -1)
			return false;
		//Filtra a data com a data final
		if (filters.data_final !== null && compareDate_Time(op.data, filters.data_final, 'date') === 1)
			return false;
		//Filtra a hora com a hora inicial
		if (filters.hora_inicial !== null && compareDate_Time(op.hora, filters.hora_inicial, 'time') === -1)
			return false;
		//Filtra a hora com a hora final
		if (filters.hora_final !== null && compareDate_Time(op.hora, filters.hora_final, 'time') === 1)
			return false;
		//Filtra apenas os ativos selecionados
		if (filters.ativo.length > 0 && !filters.ativo.includes(op.ativo))
			return false;
		//Filtra apenas os cenarios selecionados
		if (!Global.isObjectEmpty(filters.cenario) && !(op.cenario in filters.cenario))
			return false;
		//Filtra apenas as premissas selecionadas dos cenarios
		if (!checkPremissas_Observacoes(op.cenario, op.premissas, filters.cenario, 'premissas', filters.premissas_query_union))
			return false;
		//Filtra apenas as observações selecionadas dos cenarios
		if (!checkPremissas_Observacoes(op.cenario, op.observacoes, filters.cenario, 'observacoes', filters.observacoes_query_union))
			return false;
		//Filtra operações com Erro
		if (simulate.ignora_erro && op.erro == 1)
			return false;
		return true;
	}
	/*
		Recebe a lista de operações (Por Trade), e agrupa dependendo do escolhido. (Por Trade 'Default', Por Dia, Por Mes)
		Já calcula as informações de resultado necessárias.
	*/
	let groupData_byPeriodo = function (list, filters, simulate){
		let new_list = [];
		//Mantem 'por Trade'
		if (simulate.periodo_calc === '1'){
			for (let e in list){
				//Roda os 'filters' na operação
				if (okToUse_filterOp(list[e], filters, simulate)){
					//Calcula o resultado bruto da operação com apenas 1 contrato
					let op_resultBruto_Unitario = calculate_op_result(list[e], simulate);
					//Calcula o numero de contratos a ser usado dependendo do 'simulate'
					let cts_usado = findCts_toUse(list[e]['cts'], op_resultBruto_Unitario['stop']['brl'], simulate);
					//Calcula o resultado bruto aplicando o numero de contratos
					let resultBruto_operacao = op_resultBruto_Unitario['result']['brl'] * cts_usado;
					//Usa o custo da operação a ser aplicada no resultado 'Resultado Líquido'
					let custo_operacao = ((simulate.usa_custo) ? (cts_usado * list[e]['ativo_custo']) : 0.0 );
					//Calcula o resultado liquido aplicando os custos
					let resultLiquido_operacao = resultBruto_operacao - custo_operacao;
					new_list.push({
						erro: list[e].erro,
						data: list[e].data,
						hora: list[e].hora,
						cenario: list[e].cenario,
						cts_usado: cts_usado,
						custo: custo_operacao,
						resultado_op: (resultLiquido_operacao > custo_operacao ? 1 : (resultLiquido_operacao < custo_operacao ? -1 : 0)),
						result_bruto: {
							brl: resultBruto_operacao,
							R: (simulate.R !== null) ? divide(resultBruto_operacao, simulate.R) : '--'
						},
						result_liquido: {
							brl: resultLiquido_operacao,
							R: (simulate.R !== null) ? divide(resultLiquido_operacao, simulate.R) : '--'
						},
					});
				}
			}
		}
		//Agrupa 'por Dia'
		else if (simulate.periodo_calc === '1'){
			let dia_stats = {}
		}
		return new_list;
	}
	/*
		Calcula em 'Brl' e 'R' o Resultado, Alvo, Stop de uma operação, dada as infos de 'simulate'.
	*/
	let calculate_op_result = function (op, simulate){
		let maior_stop__gerenciamento = maior_alvo__gerenciamento = 0;
		return {
			//Resultado com apenas 1 contrato
			result: { brl: (op.resultado / op.cts) },
			stop: { brl: op.vol * op.ativo_valor_tick * maior_stop__gerenciamento },
			alvo: { brl: op.vol * op.ativo_valor_tick * maior_alvo__gerenciamento }
		}
	}
	/*
		Função para calculo do Desvio Padrão, a partir de uma lista de numeros.
	*/
	let desvpad = function (r_list, type = 'populacao'){
		let desv_type = ((type === 'populacao') ? 0 : ((type === 'amostra') ? 1 : 0)),
			media = r_list.reduce((total, valor) => total + (valor / r_list.length), 0),
			variancia = r_list.reduce((total, valor) => total + (Math.pow(media - valor, 2) / (r_list.length - desv_type)), 0);
		return {
			desvpad: Math.sqrt(variancia),
			media: media
		};
	}
	/*
		Gera a média móvel simples da lista de entrada 'i_list', para a lista 'mm_list', usando a quantidade de periodos passada.
	*/
	let SMA = function (i_list, mm_list, period = 20, empty_value = NaN){
		//Irá percorrer a lista olhando blocos de tamanho 'period'
		for (let index_I=(0 - (period - 1)), index_F=0; index_F<i_list.length; index_I++, index_F++){
			if (index_I >= 0){
				let bloco_sum = 0.0;
				//Calcula a média de cada bloco
				for (let subIndex_I=index_I; subIndex_I<=index_F; subIndex_I++)
					bloco_sum += i_list[subIndex_I];
				mm_list[index_F] = divide(bloco_sum, period);
			}
			else
				mm_list[index_F] = empty_value;
		}
		return mm_list;
	}
	/*
		Gera uma banda de superior e inferior de Desvio Padrao do objeto passado.
		'Obj' deve ter estes inputs:
			- data: Lista dos dados a fazer os calculos.
			- banda_superior: Lista que conterá a banda de 1 desvio acima da media.
			- banda_inferior: Lista que conterá a banda de 1 desvio abaixo da media.
	*/
	let BBollinger = function (obj, min_period = 1, empty_value = NaN){
		let desv_list = [];
		for (let i_data=0; i_data<obj['data'].length; i_data++){
			desv_list.push(obj['data'][i_data]);
			if (desv_list.length > min_period){
				let dp_calc = desvpad(desv_list, 'amostra');
				obj['banda_media'].push(dp_calc['media']);
				obj['banda_superior'].push(dp_calc['media'] + dp_calc['desvpad']);
				obj['banda_inferior'].push(dp_calc['media'] - dp_calc['desvpad']);
			}
			else{
				obj['banda_media'].push(empty_value);
				obj['banda_superior'].push(empty_value);
				obj['banda_inferior'].push(empty_value);
			}
		}
	}
	/*
		Gera as estatisticas e dados para Gráficos, para toda a seção de Dashboard em Renda Variável.
		Input:
			- ops: Lista de operações. (Seguira a ordem da lista passada)
			- filters: Filtros a serem aplicados na lista de operações.
			- simulate: Dados de simulação para serem substituidos na lista de operações.
	*/
	let generate = function (ops = [], filters = {}, simulate = {}){
		/*------------------------------------ Vars --------------------------------------*/
		//Modifca alguns valores do 'filters' e 'simulate'
		_filters = {
			data_inicial: ('data_inicial' in filters) ? filters.data_inicial : null,
			data_final: ('data_final' in filters) ? filters.data_final : null,
			hora_inicial: ('hora_inicial' in filters) ? filters.hora_inicial : null,
			hora_final: ('hora_final' in filters) ? filters.hora_final : null,
			ativo: ('ativo' in filters) ? filters.ativo : [],
			cenario: ('cenario' in filters) ? filters.cenario : {},
			premissas_query_union: ('premissas_query_union' in filters) ? filters.premissas_query_union : 'OR',
			observacoes_query_union: ('observacoes_query_union' in filters) ? filters.observacoes_query_union : 'OR'
		};
		_simulate = {
			periodo_calc: ('periodo_calc' in simulate) ? simulate.periodo_calc : '1',
			tipo_cts: ('tipo_cts' in simulate) ? simulate.tipo_cts : '1',
			cts: ('cts' in simulate) ? simulate.cts : null,
			usa_custo: ('usa_custo' in simulate) ? simulate.usa_custo == 1 : true,
			ignora_erro: ('ignora_erro' in simulate) ? simulate.ignora_erro == 1 : false,
			valor_inicial: ('valor_inicial' in simulate) ? simulate.valor_inicial : null,
			R: ('R' in simulate) ? simulate.R : null
		};
		//Variaveis para a tabela de estatistica geral
		let _dashboard_ops__table_stats = {
			//Total de dias operados
			dias__total: 0,
			//Média de trades por dia
			dias__trades_por_dia: 0,
			//Quantidade total de trades
			trades__total: 0,
			//Quantidade total de trades positivos
			trades__positivo: 0,
			//Quantidade % de trades positivos
			trades__positivo_perc: 0.0,
			//Quantidade total de trades negativos
			trades__negativo: 0,
			//Quantidade % de trades negativos
			trades__negativo_perc: 0.0,
			//Quantidade total de trades empatados
			trades__empate: 0,
			//Quantidade % de trades empatados
			trades__empate_perc: 0.0,
			//Quantidade total de trades errados
			trades__erro: 0,
			//Quantidade % de trades errados
			trades__erro_perc: 0.0,
			//Lucro total em R$ das operações
			result__lucro_brl: 0.0,
			//Lucro total em R das operações
			result__lucro_R: 0.0,
			//Lucro total % das operações (Com base em um valor Inicial)
			result__lucro_perc: 0.0,
			//Valor médio em R$ das operações positivas (Incluindo os empates)
			result__mediaGain_brl: 0.0,
			//Valor médio em R das operações positivas (Incluindo os empates)
			result__mediaGain_R: 0.0,
			//Valor médio em % das operações positivas (Incluindo os empates)
			result__mediaGain_perc: 0.0,
			//Valor médio em R$ das operações negativas
			result__mediaLoss_brl: 0.0,
			//Valor médio em R das operações negativas
			result__mediaLoss_R: 0.0,
			//Valor médio em % das operações negativas
			result__mediaLoss_perc: 0.0,
			//Edge das operações
			stats__edge: 0.0,
			//Breakeven das operações
			stats__breakeven: 0.0,
			//Fator de Lucro das operações
			stats__fatorLucro: 0.0,
			//SQN das operações
			stats__sqn: 0.0,
			//Desvio Padrão das operações
			stats__dp: 0.0,
			//Risco Retorno médio das operações
			stats__rrMedio: 0.0,
			//Expectativa média a se esperar em futuras operações
			stats__expect: 0.0,
			//Drawndown corrente (Caso haja)
			stats__drawdown: 0.0,
			//Topo histórico alcançado na lista de operações
			stats__drawdown_topoHistorico: 0.0,
			//Maior drawdown na lista de operações
			stats__drawdown_max: 0.0,
			//Valor corrente para chegar à ruína de (X%)
			stats__ruinaAtual: 0.0
		}
		//Variaveis para a tabela de resultados dos trades
		let _dashboard_ops__table_trades = [];
		//Variaveis de listas para os gráficos
		let _dashboard_ops__chart_data = {
			resultados_normalizado: {
				labels: [],
				data: [],
				banda_media: [],
				banda_superior: [],
				banda_inferior: [],
				risco: (_simulate.R !== null) ? _simulate.R * (-1) : null
			},
			evolucao_patrimonial: {
				labels: [],
				data: []
			},
			evolucao_patrimonial__mm20: {
				labels: [],
				data: []
			},
			resultado_por_hora: {
				labels: [],
				data_result: [],
				data_qtd: []
			}
		}
		//Variaveis temporarias usadas em '_dashboard_ops__table_stats'
		let _temp__table_stats = {
			i_seq: 1,
			dias__unicos: {},
			horas__unicas: {},
			lucro_corrente: {brl: 0.0},
			mediaGain: 0.0,
			mediaLoss: 0.0
		}
		//Variaveis para a tabela de estatistica por cenario
		let _dashboard_ops__table_stats__byCenario = {}
		//Variaveis temporarias usadas em '_dashboard_ops__table_stats__byCenario'
		let _temp__table_stats__byCenario = {}
		//Variaveis de listas usadas
		let _temp_listas = {
			resultados_R: []
		}
		let _ops = groupData_byPeriodo(ops, _filters, _simulate);
		/*----------------------------- Percorre as operações ----------------------------*/
		for (let o in _ops){
			//////////////////////////////////
			//Resultados do Trade
			//////////////////////////////////
			_dashboard_ops__table_trades.push({
				//Sequencia do trade, na ordem que vem do BD
				trade__seq: _temp__table_stats['i_seq']++,
				//Data do trade
				trade__data: _ops[o].data,
				//Cenario do trade
				trade__cenario: _ops[o].cenario,
				//Contratos usados
				trade__cts: _ops[o].cts_usados,
				//Resultado bruto do trade em BRL
				result_bruto__brl: _ops[o].result_bruto['brl'],
				//Resultado bruto do trade em R
				result_bruto__R: _ops[o].result_bruto['R'],
				//Custo do trade
				trade__custo: _ops[o].custo,
				//Resultado do trade em BRL
				result__brl: _ops[o].result_liquido['brl'],
				//Resultado do trade em R
				result__R: _ops[o].result_liquido['R']
			});
			//////////////////////////////////
			//Estatisticas Gerais
			//////////////////////////////////
			_temp__table_stats['dias__unicos'][_ops[o].data] = null;
			if (_ops[o].hora !== '00:00:00'){
				let round_time = moment(_ops[o].hora, 'HH:mm:ss').startOf('hour').format('HH:mm');
				if (!(round_time in _temp__table_stats['horas__unicas']))
					_temp__table_stats['horas__unicas'][round_time] = { result: 0.0, qtd: 0 };
				_temp__table_stats['horas__unicas'][round_time]['result'] += _ops[o].result_liquido['brl'];
				_temp__table_stats['horas__unicas'][round_time]['qtd']++;
			}
			//Se for uma operação 'Positiva'
			if (_ops[o].resultado_op === 1){
				_dashboard_ops__table_stats['trades__positivo']++;
				_temp__table_stats['mediaGain'] += _ops[o].result_liquido['brl'];
			}
			//Se for uma operação 'Negativa'
			else if (_ops[o].resultado_op === -1){
				_dashboard_ops__table_stats['trades__negativo']++;
				_temp__table_stats['mediaLoss'] += _ops[o].result_liquido['brl'];
			}
			//Se for uma operação 'Empate (0x0)'
			else if (_ops[o].resultado_op === 0){
				_dashboard_ops__table_stats['trades__empate']++;
				_temp__table_stats['mediaGain'] += _ops[o].result_liquido['brl'];
			}
			//Se for uma operação com Erro
			if (_ops[o].erro == 1)
				_dashboard_ops__table_stats['trades__erro']++;
			//Calcula o lucro corrente após cada operação
			_temp__table_stats['lucro_corrente']['brl'] += _ops[o].result_liquido['brl'];
			_dashboard_ops__chart_data['resultados_normalizado']['labels'].push(parseInt(o) + 1);
			_dashboard_ops__chart_data['resultados_normalizado']['data'].push(_ops[o].result_liquido['brl']);
			//Para o DP
			if (_simulate['R'] !== null)
				_temp_listas['resultados_R'].push(divide(_ops[o].result_liquido['brl'], _simulate['R']));
			//Para o gráfico de Evolução Patrimonial
			_dashboard_ops__chart_data['evolucao_patrimonial']['labels'].push(parseInt(o) + 1);
			_dashboard_ops__chart_data['evolucao_patrimonial']['data'].push(_temp__table_stats['lucro_corrente']['brl']);
			//////////////////////////////////
			//Estatisticas por Cenario
			//////////////////////////////////
			if (!(_ops[o].cenario in _dashboard_ops__table_stats__byCenario)){
				_dashboard_ops__table_stats__byCenario[_ops[o].cenario] = {
					//Total de dias operados
					dias__total: 0,
					dias__trades_por_dia: 0,
					trades__total: 0,
					trades__total_perc: 0,
					trades__positivo: 0,
					trades__positivo_perc: 0.0,
					trades__negativo: 0,
					trades__negativo_perc: 0.0,
					trades__empate: 0,
					trades__empate_perc: 0.0,
					trades__erro: 0,
					trades__erro_perc: 0.0,
					result__lucro_brl: 0.0,
					result__lucro_R: 0.0,
					result__lucro_perc: 0.0,
					result__mediaGain_brl: 0.0,
					result__mediaGain_R: 0.0,
					result__mediaGain_perc: 0.0,
					result__mediaLoss_brl: 0.0,
					result__mediaLoss_R: 0.0,
					result__mediaLoss_perc: 0.0,
					stats__edge: 0.0,
					stats__breakeven: 0.0,
					stats__fatorLucro: 0.0,
					stats__sqn: 0.0,
					stats__dp: 0.0,
					stats__rrMedio: 0.0,
					stats__expect: 0.0,
					stats__drawdown: 0.0,
					stats__drawdown_topoHistorico: 0.0,
					stats__drawdown_max: 0.0,
					stats__ruinaAtual: 0.0,
					lista_resultad_R: []
				};
				_temp__table_stats__byCenario[_ops[o].cenario] = {
					dias__unicos: {},
					lucro_corrente: {brl: 0.0},
					mediaGain: 0.0,
					mediaLoss: 0.0
				}
			}
			_temp__table_stats__byCenario[_ops[o].cenario]['dias__unicos'][_ops[o].data] = null;
			_dashboard_ops__table_stats__byCenario[_ops[o].cenario]['trades__total']++;
			//Se for uma operação 'Positiva'
			if (_ops[o].resultado_op === 1){
				_dashboard_ops__table_stats__byCenario[_ops[o].cenario]['trades__positivo']++;
				_temp__table_stats__byCenario[_ops[o].cenario]['mediaGain'] += _ops[o].result_liquido['brl'];
			}
			//Se for uma operação 'Negativa'
			else if (_ops[o].resultado_op === -1){
				_dashboard_ops__table_stats__byCenario[_ops[o].cenario]['trades__negativo']++;
				_temp__table_stats__byCenario[_ops[o].cenario]['mediaLoss'] += _ops[o].result_liquido['brl'];
			}
			//Se for uma operação 'Empate (0x0)'
			else if (_ops[o].resultado_op === 0){
				_dashboard_ops__table_stats__byCenario[_ops[o].cenario]['trades__empate']++;
				_temp__table_stats__byCenario[_ops[o].cenario]['mediaGain'] += _ops[o].result_liquido['brl'];
			}
			//Se for uma operação com Erro
			if (_ops[o].erro == 1)
				_dashboard_ops__table_stats__byCenario[_ops[o].cenario]['trades__erro']++;
			//Calcula o lucro corrente após cada operação
			_temp__table_stats__byCenario[_ops[o].cenario]['lucro_corrente']['brl'] += _ops[o].result_liquido['brl'];
			//Para o DP
			if (_simulate['R'] !== null)
				_dashboard_ops__table_stats__byCenario[_ops[o].cenario]['lista_resultad_R'].push(divide(_ops[o].result_liquido['brl'], _simulate['R']));
		}
		/*------------------------ Termina processamento dos Dados -----------------------*/
		//////////////////////////////////
		//Estatisticas Gerais
		//////////////////////////////////
		//Termina de processar estatisticas de '_temp__table_stats'
		_temp__table_stats['mediaGain'] = divide(_temp__table_stats['mediaGain'], (_dashboard_ops__table_stats['trades__positivo'] + _dashboard_ops__table_stats['trades__empate']));
		_temp__table_stats['mediaLoss'] = divide(_temp__table_stats['mediaLoss'], _dashboard_ops__table_stats['trades__negativo']);

		//Termina de processar estatisticas do '_dashboard_ops__table_stats'
		_dashboard_ops__table_stats['dias__total']            = Object.keys(_temp__table_stats['dias__unicos']).length;

		_dashboard_ops__table_stats['dias__trades_por_dia']   = divide(_ops.length, _dashboard_ops__table_stats['dias__total']);
		_dashboard_ops__table_stats['trades__total']          = _ops.length;
		_dashboard_ops__table_stats['trades__positivo_perc']  = (divide(_dashboard_ops__table_stats['trades__positivo'], _dashboard_ops__table_stats['trades__total']) * 100);
		_dashboard_ops__table_stats['trades__negativo_perc']  = (divide(_dashboard_ops__table_stats['trades__negativo'], _dashboard_ops__table_stats['trades__total']) * 100);
		_dashboard_ops__table_stats['trades__empate_perc']    = (divide(_dashboard_ops__table_stats['trades__empate'], _dashboard_ops__table_stats['trades__total']) * 100);

		_dashboard_ops__table_stats['result__lucro_brl']      = _temp__table_stats['lucro_corrente']['brl'];
		_dashboard_ops__table_stats['result__lucro_R']        = (_simulate['R'] !== null) ? divide(_temp__table_stats['lucro_corrente']['brl'], _simulate['R']) : '--';
		_dashboard_ops__table_stats['result__lucro_perc']     = (_simulate['valor_inicial'] !== null) ? (divide(_temp__table_stats['lucro_corrente']['brl'], _simulate['valor_inicial']) * 100) : '--';
		_dashboard_ops__table_stats['result__mediaGain_brl']  = _temp__table_stats['mediaGain'];
		_dashboard_ops__table_stats['result__mediaLoss_brl']  = _temp__table_stats['mediaLoss'];
		_dashboard_ops__table_stats['result__mediaGain_R'] 	  = (_simulate['R'] !== null) ? divide(_temp__table_stats['mediaGain'], _simulate['R']) : '--';
		_dashboard_ops__table_stats['result__mediaLoss_R']    = (_simulate['R'] !== null) ? divide(_temp__table_stats['mediaLoss'], _simulate['R']) : '--';
		_dashboard_ops__table_stats['result__mediaGain_perc'] = (_simulate['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaGain'], _simulate['valor_inicial']) * 100) : '--';
		_dashboard_ops__table_stats['result__mediaLoss_perc'] = (_simulate['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaLoss'], _simulate['valor_inicial']) * 100) : '--';

		_dashboard_ops__table_stats['stats__rrMedio']         = divide(_temp__table_stats['mediaGain'], Math.abs(_temp__table_stats['mediaLoss']));
		_dashboard_ops__table_stats['stats__breakeven']       = (divide(Math.abs(_temp__table_stats['mediaLoss']), (_temp__table_stats['mediaGain'] + Math.abs(_temp__table_stats['mediaLoss']))) * 100);
		_dashboard_ops__table_stats['stats__edge']            = _dashboard_ops__table_stats['trades__positivo_perc'] - _dashboard_ops__table_stats['stats__breakeven'];
		_dashboard_ops__table_stats['stats__fatorLucro']      = divide((_dashboard_ops__table_stats['trades__positivo_perc'] * _temp__table_stats['mediaGain']), (_dashboard_ops__table_stats['trades__negativo_perc'] * _temp__table_stats['mediaLoss']));
		_dashboard_ops__table_stats['stats__expect']          = (_simulate['R'] !== null) ? divide(divide(_temp__table_stats['lucro_corrente']['brl'], _dashboard_ops__table_stats['trades__total']), _simulate['R']) : '--';
		_dashboard_ops__table_stats['stats__dp']              = (_simulate['R'] !== null) ? desvpad(_temp_listas['resultados_R'])['desvpad'] : '--';
		_dashboard_ops__table_stats['stats__sqn']             = (_simulate['R'] !== null) ? (divide(_dashboard_ops__table_stats['stats__expect'], _dashboard_ops__table_stats['stats__dp']) * Math.sqrt(_dashboard_ops__table_stats['trades__total'])) : '--';
		
		_dashboard_ops__table_stats['trades__erro']           = ((!_simulate.ignora_erro) ? _dashboard_ops__table_stats['trades__erro'] : '--');
		_dashboard_ops__table_stats['trades__erro_perc']      = ((!_simulate.ignora_erro) ? (divide(_dashboard_ops__table_stats['trades__erro'], _dashboard_ops__table_stats['trades__total']) * 100) : '--');
		//////////////////////////////////
		//Estatisticas por Cenario
		//////////////////////////////////
		for (let cenario in _dashboard_ops__table_stats__byCenario){
			//Termina de processar estatisticas de '_temp__table_stats__byCenario'
			_temp__table_stats__byCenario[cenario]['mediaGain'] = divide(_temp__table_stats__byCenario[cenario]['mediaGain'], (_dashboard_ops__table_stats__byCenario[cenario]['trades__positivo'] + _dashboard_ops__table_stats__byCenario[cenario]['trades__empate']));
			_temp__table_stats__byCenario[cenario]['mediaLoss'] = divide(_temp__table_stats__byCenario[cenario]['mediaLoss'], _dashboard_ops__table_stats__byCenario[cenario]['trades__negativo']);

			//Termina de processar estatisticas do '_dashboard_ops__table_stats__byCenario'
			_dashboard_ops__table_stats__byCenario[cenario]['dias__total']            = Object.keys(_temp__table_stats__byCenario[cenario]['dias__unicos']).length;

			_dashboard_ops__table_stats__byCenario[cenario]['trades__total_perc']     = (divide(_dashboard_ops__table_stats__byCenario[cenario]['trades__total'], _dashboard_ops__table_stats['trades__total']) * 100);
			_dashboard_ops__table_stats__byCenario[cenario]['trades__positivo_perc']  = (divide(_dashboard_ops__table_stats__byCenario[cenario]['trades__positivo'], _dashboard_ops__table_stats__byCenario[cenario]['trades__total']) * 100);
			_dashboard_ops__table_stats__byCenario[cenario]['trades__negativo_perc']  = (divide(_dashboard_ops__table_stats__byCenario[cenario]['trades__negativo'], _dashboard_ops__table_stats__byCenario[cenario]['trades__total']) * 100);
			_dashboard_ops__table_stats__byCenario[cenario]['trades__empate_perc']    = (divide(_dashboard_ops__table_stats__byCenario[cenario]['trades__empate'], _dashboard_ops__table_stats__byCenario[cenario]['trades__total']) * 100);

			_dashboard_ops__table_stats__byCenario[cenario]['result__lucro_brl']      = _temp__table_stats__byCenario[cenario]['lucro_corrente']['brl'];
			_dashboard_ops__table_stats__byCenario[cenario]['result__lucro_R']        = (_simulate['R'] !== null) ? divide(_temp__table_stats__byCenario[cenario]['lucro_corrente']['brl'], _simulate['R']) : '--';
			_dashboard_ops__table_stats__byCenario[cenario]['result__lucro_perc']     = (_simulate['valor_inicial'] !== null) ? (divide(_temp__table_stats__byCenario[cenario]['lucro_corrente']['brl'], _simulate['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats__byCenario[cenario]['result__mediaGain_brl']  = _temp__table_stats__byCenario[cenario]['mediaGain'];
			_dashboard_ops__table_stats__byCenario[cenario]['result__mediaLoss_brl']  = _temp__table_stats__byCenario[cenario]['mediaLoss'];
			_dashboard_ops__table_stats__byCenario[cenario]['result__mediaGain_R'] 	  = (_simulate['R'] !== null) ? divide(_temp__table_stats__byCenario[cenario]['mediaGain'], _simulate['R']) : '--';
			_dashboard_ops__table_stats__byCenario[cenario]['result__mediaLoss_R']    = (_simulate['R'] !== null) ? divide(_temp__table_stats__byCenario[cenario]['mediaLoss'], _simulate['R']) : '--';
			_dashboard_ops__table_stats__byCenario[cenario]['result__mediaGain_perc'] = (_simulate['valor_inicial'] !== null) ? (divide(_temp__table_stats__byCenario[cenario]['mediaGain'], _simulate['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats__byCenario[cenario]['result__mediaLoss_perc'] = (_simulate['valor_inicial'] !== null) ? (divide(_temp__table_stats__byCenario[cenario]['mediaLoss'], _simulate['valor_inicial']) * 100) : '--';

			_dashboard_ops__table_stats__byCenario[cenario]['stats__rrMedio']         = divide(_temp__table_stats__byCenario[cenario]['mediaGain'], Math.abs(_temp__table_stats__byCenario[cenario]['mediaLoss']));
			_dashboard_ops__table_stats__byCenario[cenario]['stats__breakeven']       = (divide(Math.abs(_temp__table_stats__byCenario[cenario]['mediaLoss']), (_temp__table_stats__byCenario[cenario]['mediaGain'] + Math.abs(_temp__table_stats__byCenario[cenario]['mediaLoss']))) * 100);
			_dashboard_ops__table_stats__byCenario[cenario]['stats__edge']            = _dashboard_ops__table_stats__byCenario[cenario]['trades__positivo_perc'] - _dashboard_ops__table_stats__byCenario[cenario]['stats__breakeven'];
			_dashboard_ops__table_stats__byCenario[cenario]['stats__fatorLucro']      = divide((_dashboard_ops__table_stats__byCenario[cenario]['trades__positivo_perc'] * _temp__table_stats__byCenario[cenario]['mediaGain']), (_dashboard_ops__table_stats__byCenario[cenario]['trades__negativo_perc'] * _temp__table_stats__byCenario[cenario]['mediaLoss']));
			_dashboard_ops__table_stats__byCenario[cenario]['stats__expect']          = (_simulate['R'] !== null) ? divide(divide(_temp__table_stats__byCenario[cenario]['lucro_corrente']['brl'], _dashboard_ops__table_stats__byCenario[cenario]['trades__total']), _simulate['R']) : '--';
			_dashboard_ops__table_stats__byCenario[cenario]['stats__dp']              = (_simulate['R'] !== null) ? desvpad(_dashboard_ops__table_stats__byCenario[cenario]['lista_resultad_R'])['desvpad'] : '--';
			_dashboard_ops__table_stats__byCenario[cenario]['stats__sqn']             = (_simulate['R'] !== null) ? (divide(_dashboard_ops__table_stats__byCenario[cenario]['stats__expect'], _dashboard_ops__table_stats__byCenario[cenario]['stats__dp']) * Math.sqrt(_dashboard_ops__table_stats__byCenario[cenario]['trades__total'])) : '--';
			
			_dashboard_ops__table_stats__byCenario[cenario]['trades__erro']           = ((!_simulate.ignora_erro) ? _dashboard_ops__table_stats__byCenario[cenario]['trades__erro'] : '--');
			_dashboard_ops__table_stats__byCenario[cenario]['trades__erro_perc']      = ((!_simulate.ignora_erro) ? (divide(_dashboard_ops__table_stats__byCenario[cenario]['trades__erro'], _dashboard_ops__table_stats__byCenario[cenario]['trades__total']) * 100) : '--');
		}
		//////////////////////////////////
		//Gráfico de Evolução Patrimonial
		//////////////////////////////////
		//Média móvel simples da evolução patrimonial
		SMA(_dashboard_ops__chart_data['evolucao_patrimonial']['data'], _dashboard_ops__chart_data['evolucao_patrimonial__mm20']['data'], 20);
		//////////////////////////////////
		//Gráfico de Resultados Normalizados
		//////////////////////////////////
		//Gráfico de barras dos resultados + bandas superior e inferior do desvio padrao + linha de risco
		BBollinger(_dashboard_ops__chart_data['resultados_normalizado']);
		//////////////////////////////////
		//Gráfico de Resultados por Hora
		//////////////////////////////////
		for (let h in _temp__table_stats['horas__unicas']){
			_dashboard_ops__chart_data['resultado_por_hora']['labels'].push(h);
			_dashboard_ops__chart_data['resultado_por_hora']['data_result'].push(_temp__table_stats['horas__unicas'][h]['result']);
			_dashboard_ops__chart_data['resultado_por_hora']['data_qtd'].push(_temp__table_stats['horas__unicas'][h]['qtd']);
		}
		/*------------------------------- Retorno dos Dados ------------------------------*/
		return {
			dashboard_ops__table_stats: _dashboard_ops__table_stats,
			dashboard_ops__table_stats__byCenario: _dashboard_ops__table_stats__byCenario,
			dashboard_ops__table_trades: _dashboard_ops__table_trades,
			dashboard_ops__chart_data: _dashboard_ops__chart_data
		}
	}
	/*--------------------------------------------------------------------------------*/
	return {
		generate: generate
	}
})();