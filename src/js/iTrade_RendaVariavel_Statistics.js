let RV_Statistics = (function(){
	/*---------------------------------- FUNCTIONS -----------------------------------*/
	/*
		Calcula a quantidade de Cts, baseado no 'tipo_cts' passado.
	*/
	let findCts_toUse = function (opCts, stopBrl, simulate){
		//Usar Cts da operação
		if (simulate.tipo_cts === "1" || (simulate.tipo_cts === "2" && simulate.cts === null) || (simulate.tipo_cts === "3" && simulate.R === null))
			return opCts;
		//Força uma quantidade fixa passada em 'simulate.cts'
		else if (simulate.tipo_cts === "2" && simulate.cts !== null)
			return simulate.cts;
		//Calcula o numero maximo de Cts a partir do 'R' e do 'stop' da operacao
		else if (simulate.tipo_cts === "3")
			return Math.floor(simulate.R / stopBrl);
	}
	/*
		Aplica os 'filters' na operacao passada.
	*/
	let okToUse_filterOp = function (op, filters){
		//Filtra operações com Erro
		if (op.erro == 1 && filters.ignora_erro)
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
		if (simulate.periodo_calc === "1"){
			for (let e in list){
				//Roda os 'filters' na operação
				if (okToUse_filterOp(list[e], filters)){
					//Calcula o resultado bruto da operação
					let op_resultBruto = calculate_op_result(list[e], simulate);
					//Usa o custo da operação a ser aplicada no resultado 'Resultado Líquido'
					let custo_operacao = ((simulate.usa_custo) ? (findCts_toUse(list[e]["cts"], op_resultBruto["result"]["brl"], simulate) * list[e]["ativo_custo"]) : 0.0 );
					new_list.push({
						erro: list[e].erro,
						data: list[e].data,
						result_liquido: {
							brl: op_resultBruto["result"]["brl"] - custo_operacao,
							pts: op_resultBruto["result"]["pts"] - (custo_operacao * list[e].ativo_pts_tick)
						},
						stop_liquido: {
							brl: op_resultBruto["stop"]["brl"] - custo_operacao,
							pts: op_resultBruto["stop"]["pts"] - (custo_operacao * list[e].ativo_pts_tick)	
						},
						alvo_liquido: {
							brl: op_resultBruto["alvo"]["brl"] - custo_operacao,
							pts: op_resultBruto["alvo"]["pts"] - (custo_operacao * list[e].ativo_pts_tick)	
						},
						men_liquido: {
							brl: op_resultBruto["men"]["brl"] - custo_operacao,
							pts: op_resultBruto["men"]["pts"] - (custo_operacao * list[e].ativo_pts_tick)	
						},
						mep_liquido: {
							brl: op_resultBruto["mep"]["brl"] - custo_operacao,
							pts: op_resultBruto["mep"]["pts"] - (custo_operacao * list[e].ativo_pts_tick)	
						}
					});
					let curr_i = new_list.length-1;
					if (new_list[curr_i].result_liquido["brl"] > custo_operacao)
						new_list[curr_i]["resultado_op"] = 1;
					else if (new_list[curr_i].result_liquido["brl"] < custo_operacao * (-1.0))
						new_list[curr_i]["resultado_op"] = -1;
					else
						new_list[curr_i]["resultado_op"] = 0;
				}
			}
		}
		//Agrupa 'por Dia'
		else if (simulate.periodo_calc === "1"){
			let dia_stats = {}
		}
		return new_list;
	}
	/*
		Gera Saida, Stop e Alvo, baseados na simulação de RR passada.
			- "1": Gera usando os valores originais da operação.
	*/
	let getData_byRR = function (op, simulate){
		if (simulate.rr === "1"){
			return {
				saida: op.saida,
				stop: op.stop,
				alvo: op.alvo
			}
		}
	}
	/*
		Calcula em 'Pontos', 'Brl' e 'R' o Resultado, Alvo, Stop, MEN e MEP de uma operação, dada as infos de 'simulate'.
	*/
	let calculate_op_result = function (op, simulate){
		let simuData = getData_byRR(op, simulate);
		//Se for uma compra
		if (op.op == 1){
			return {
				result: {
					brl: (simuData.saida - op.entrada) * op.ativo_valor_tick * op.cts,
					pts: simuData.saida - op.entrada
				},
				stop: {
					brl: (op.entrada - simuData.stop) * op.ativo_valor_tick * op.cts,
					pts: op.entrada - simuData.stop
				},
				alvo: {
					brl: (simuData.alvo - op.entrada) * op.ativo_valor_tick * op.cts,
					pts: simuData.alvo - op.entrada
				},
				men: {
					brl: (op.entrada - op.men) * op.ativo_valor_tick * op.cts,
					pts: op.entrada - op.men
				},
				mep: {
					brl: (op.mep - op.entrada) * op.ativo_valor_tick * op.cts,
					pts: op.mep - op.entrada
				}
			}
		}
		//Se for uma venda
		else if (op.op == 2){
			return {
				result: {
					brl: (op.entrada - simuData.saida) * op.ativo_valor_tick * op.cts,
					pts: op.entrada - simuData.saida
				},
				stop: {
					brl: (simuData.stop - op.entrada) * op.ativo_valor_tick * op.cts,
					pts: simuData.stop - op.entrada
				},
				alvo: {
					brl: (op.entrada - simuData.alvo) * op.ativo_valor_tick * op.cts,
					pts: op.entrada - simuData.alvo
				},
				men: {
					brl: (op.men - op.entrada) * op.ativo_valor_tick * op.cts,
					pts: op.men - op.entrada
				},
				mep: {
					brl: (op.entrada - op.mep) * op.ativo_valor_tick * op.cts,
					pts: op.entrada - op.mep
				}
			}	
		}
	}
	/*
		Função para calculo do Desvio Padrão, a partir de uma lista de numeros.
	*/
	let desvpad = function (r_list){
		let media = r_list.reduce((total, valor) => total + valor / r_list.length, 0);
		let variancia = r_list.reduce((total, valor) => total + Math.pow(media - valor, 2)/ r_list.length, 0);
		return Math.sqrt(variancia);
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
			data_inicial: ("data_inicial" in filters) ? filters.data_inicial : null, 
			data_final: ("data_final" in filters) ? filters.data_final : null, 
			hora_inicial: ("hora_inicial" in filters) ? filters.hora_inicial : null, 
			hora_final: ("hora_final" in filters) ? filters.hora_final : null, 
			ativo: ("ativo" in filters) ? filters.ativo : [], 
			cenario: ("cenario" in filters) ? filters.cenario : {}, 
			ignora_erro: ("ignora_erro" in filters) ? filters.ignora_erro == 1 : false
		};
		_simulate = {
			periodo_calc: ("periodo_calc" in simulate) ? simulate.periodo_calc : "1",
			rr: ("rr" in simulate) ? simulate.rr : "1",
			vol: ("vol" in simulate) ? simulate.vol : null,
			tipo_cts: ("tipo_cts" in simulate) ? simulate.tipo_cts : "1",
			cts: ("cts" in simulate) ? simulate.cts : null,
			usa_custo: ("usa_custo" in simulate) ? simulate.usa_custo == 1 : true,
			valor_inicial: ("valor_inicial" in simulate) ? simulate.valor_inicial : null,
			R: ("R" in simulate) ? simulate.R : null
		};
		//Variaveis para a tabela de estatistica
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
			//Lucro total em pontos das operações
			result__lucro_pts: 0.0,
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
		//Variaveis temporarias usadas em '_dashboard_ops__table_stats'
		let _temp__table_stats = {
			dias__unicos: {},
			lucro_corrente: {brl: 0.0, pts: 0.0},
			mediaGain: 0.0,
			mediaLoss: 0.0
		}
		let _temp_listas = {
			resultados: [],
			resultados_R: [],
			lucro_no_tempo: []
		}
		let _ops = groupData_byPeriodo(ops, _filters, _simulate);
		/*----------------------------- Percorre as operações ----------------------------*/
		for (let o in _ops){
			_temp__table_stats["dias__unicos"][_ops[o].data] = null;
			//Se for uma operação 'Positiva'
			if (_ops[o].resultado_op === 1){
				_dashboard_ops__table_stats["trades__positivo"]++;
				_temp__table_stats["mediaGain"] += _ops[o].result_liquido["brl"];
			}
			//Se for uma operação 'Negativa'
			else if (_ops[o].resultado_op === -1){
				_dashboard_ops__table_stats["trades__negativo"]++;
				_temp__table_stats["mediaLoss"] += _ops[o].result_liquido["brl"];
			}
			//Se for uma operação 'Empate (0x0)'
			else if (_ops[o].resultado_op === 0){
				_dashboard_ops__table_stats["trades__empate"]++;
				_temp__table_stats["mediaGain"] += _ops[o].result_liquido["brl"];
			}
			//Se for uma operação com Erro
			if (_ops[o].erro == 1)
				_dashboard_ops__table_stats["trades__erro"]++;
			//Calcula o lucro corrente após cada operação
			_temp__table_stats["lucro_corrente"]["brl"] += _ops[o].result_liquido["brl"];
			_temp__table_stats["lucro_corrente"]["pts"] += _ops[o].result_liquido["pts"];
			_temp_listas["resultados"].push(_ops[o].result_liquido["brl"]);
			if (_simulate["R"] !== null)
				_temp_listas["resultados_R"].push(_ops[o].result_liquido["brl"] / _simulate["R"]);
			_temp_listas["lucro_no_tempo"].push(_temp__table_stats["lucro_corrente"]["brl"]);
		}
		/*------------------------ Termina processamento dos Dados -----------------------*/
		//Termina de processar estatisticas de '_temp__table_stats'
		_temp__table_stats["mediaGain"] = (_temp__table_stats["mediaGain"] / (_dashboard_ops__table_stats["trades__positivo"] + _dashboard_ops__table_stats["trades__empate"]));
		_temp__table_stats["mediaLoss"] = (_temp__table_stats["mediaLoss"] / _dashboard_ops__table_stats["trades__negativo"]);

		//Termina de processar estatisticas do '_dashboard_ops__table_stats'
		_dashboard_ops__table_stats["dias__total"]            = Object.keys(_temp__table_stats["dias__unicos"]).length;

		_dashboard_ops__table_stats["dias__trades_por_dia"]   = (_ops.length / _dashboard_ops__table_stats["dias__total"]);
		_dashboard_ops__table_stats["trades__total"]          = _ops.length;
		_dashboard_ops__table_stats["trades__positivo_perc"]  = ((_dashboard_ops__table_stats["trades__positivo"] / _dashboard_ops__table_stats["trades__total"]) * 100);
		_dashboard_ops__table_stats["trades__negativo_perc"]  = ((_dashboard_ops__table_stats["trades__negativo"] / _dashboard_ops__table_stats["trades__total"]) * 100);
		_dashboard_ops__table_stats["trades__empate_perc"]    = ((_dashboard_ops__table_stats["trades__empate"] / _dashboard_ops__table_stats["trades__total"]) * 100);

		_dashboard_ops__table_stats["result__lucro_brl"]      = _temp__table_stats["lucro_corrente"]["brl"];
		_dashboard_ops__table_stats["result__lucro_R"]        = (_simulate["R"] !== null) ? (_temp__table_stats["lucro_corrente"]["brl"] / _simulate["R"]) : "--";
		_dashboard_ops__table_stats["result__lucro_pts"]      = _temp__table_stats["lucro_corrente"]["pts"];
		_dashboard_ops__table_stats["result__lucro_perc"]     = (_simulate["valor_inicial"] !== null) ? ((_temp__table_stats["lucro_corrente"]["brl"] / _simulate["valor_inicial"]) * 100) : "--";
		_dashboard_ops__table_stats["result__mediaGain_brl"]  = _temp__table_stats["mediaGain"];
		_dashboard_ops__table_stats["result__mediaGain_R"] 	  = (_simulate["R"] !== null) ? (_temp__table_stats["mediaGain"] / _simulate["R"]) : "--";
		_dashboard_ops__table_stats["result__mediaGain_perc"] = (_simulate["valor_inicial"] !== null) ? ((_temp__table_stats["mediaGain"] / _simulate["valor_inicial"]) * 100) : "--";
		_dashboard_ops__table_stats["result__mediaLoss_brl"]  = _temp__table_stats["mediaLoss"];
		_dashboard_ops__table_stats["result__mediaLoss_R"]    = (_simulate["R"] !== null) ? (_temp__table_stats["mediaLoss"] / _simulate["R"]) : "--";
		_dashboard_ops__table_stats["result__mediaLoss_perc"] = (_simulate["valor_inicial"] !== null) ? ((_temp__table_stats["mediaLoss"] / _simulate["valor_inicial"]) * 100) : "--";

		_dashboard_ops__table_stats["stats__rrMedio"]         = _temp__table_stats["mediaGain"] / Math.abs(_temp__table_stats["mediaLoss"]);
		_dashboard_ops__table_stats["stats__breakeven"]       = ((Math.abs(_temp__table_stats["mediaLoss"]) / (_temp__table_stats["mediaGain"] + Math.abs(_temp__table_stats["mediaLoss"]))) * 100);
		_dashboard_ops__table_stats["stats__edge"]            = _dashboard_ops__table_stats["trades__positivo_perc"] - _dashboard_ops__table_stats["stats__breakeven"];
		_dashboard_ops__table_stats["stats__fatorLucro"]      = (_dashboard_ops__table_stats["trades__positivo_perc"] * _temp__table_stats["mediaGain"]) / (_dashboard_ops__table_stats["trades__negativo_perc"] * _temp__table_stats["mediaLoss"]);
		_dashboard_ops__table_stats["stats__expect"]          = (_simulate["R"] !== null) ? ((_temp__table_stats["lucro_corrente"]["brl"] / _dashboard_ops__table_stats["trades__total"]) / _simulate["R"]) : "--";
		_dashboard_ops__table_stats["stats__dp"]              = (_simulate["R"] !== null) ? desvpad(_temp_listas["resultados_R"]) : "--";
		_dashboard_ops__table_stats["stats__sqn"]             = (_simulate["R"] !== null) ? ((_dashboard_ops__table_stats["stats__expect"] / (_dashboard_ops__table_stats["stats__dp"]) * Math.sqrt(_dashboard_ops__table_stats["trades__total"]))) : "--";
		
		_dashboard_ops__table_stats["trades__erro"]           = ((!_filters.ignora_erro)?_dashboard_ops__table_stats["trades__erro"]:"--");
		_dashboard_ops__table_stats["trades__erro_perc"]      = ((!_filters.ignora_erro)?((_dashboard_ops__table_stats["trades__erro"] / _dashboard_ops__table_stats["trades__total"]) * 100):"--");
		
		/*------------------------------- Retorno dos Dados ------------------------------*/
		return {
			dashboard_ops__table_stats: _dashboard_ops__table_stats
		}
	}
	/*--------------------------------------------------------------------------------*/
	return {
		generate: generate
	}
})();