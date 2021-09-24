let RV_Statistics = (function(){
	/*---------------------------------- FUNCTIONS -----------------------------------*/
	/*
		Calcula em 'Pontos' o Resultado, Alvo, Stop, MEN e MEP de uma operação, dada o tipo de R:R passado e outras informações.
		Operações que não passam nos filtros, retornam 'null'.
		R:R:
			- "1": Calcula usando os valores de Alvo e Stop originais da operação.
	*/
	let calculate_op_result = {
		"1": function (op, filters, simulate, custos){
			//Se for uma compra
			if (op.op == 1){
				return {
					result: {
						brl: ((op.saida - op.entrada) * op.ativo_valor_tick * op.cts) - custos,
						pts: (op.saida - op.entrada) - (custos * op.ativo_pts_tick)
					},
					stop: {
						brl: ((op.entrada - op.stop) * op.ativo_valor_tick * op.cts) - custos,
						pts: (op.entrada - op.stop) - (custos * op.ativo_pts_tick)
					},
					alvo: {
						brl: ((op.alvo - op.entrada) * op.ativo_valor_tick * op.cts) - custos,
						pts: (op.alvo - op.entrada) - (custos * op.ativo_pts_tick)
					},
					men: {
						brl: ((op.entrada - op.men) * op.ativo_valor_tick * op.cts) - custos,
						pts: (op.entrada - op.men) - (custos * op.ativo_pts_tick)
					},
					mep: {
						brl: ((op.mep - op.entrada) * op.ativo_valor_tick * op.cts) - custos,
						pts: (op.mep - op.entrada) - (custos * op.ativo_pts_tick)
					}
				}
			}
			//Se for uma venda
			else if (op.op == 2){
				return {
					result: {
						brl: ((op.entrada - op.saida) * op.ativo_valor_tick * op.cts) - custos,
						pts: (op.entrada - op.saida) - (custos * op.ativo_pts_tick)
					},
					stop: {
						brl: ((op.stop - op.entrada) * op.ativo_valor_tick * op.cts) - custos,
						pts: (op.stop - op.entrada) - (custos * op.ativo_pts_tick)
					},
					alvo: {
						brl: ((op.entrada - op.alvo) * op.ativo_valor_tick * op.cts) - custos,
						pts: (op.entrada - op.alvo) - (custos * op.ativo_pts_tick)
					},
					men: {
						brl: ((op.men - op.entrada) * op.ativo_valor_tick * op.cts) - custos,
						pts: (op.men - op.entrada) - (custos * op.ativo_pts_tick)
					},
					mep: {
						brl: ((op.entrada - op.mep) * op.ativo_valor_tick * op.cts) - custos,
						pts: (op.entrada - op.mep) - (custos * op.ativo_pts_tick)
					}
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
			- opt: Dados opcionais, para serem usado nos calculos. (Algumas estatisticas precisam de alguns dados opcionais para serem calculadas)
	*/
	let generate = function (ops = [], filters = {}, simulate = {}, opt = {}){
		/*------------------------------------ Vars --------------------------------------*/
		//Usa o R:R padrão da operação se não foi passado
		let _rr_used = ("rr" in simulate)?simulate["rr"]:"1";
		let _usa_custo = "usa_custo" in opt && opt["usa_custo"] == 1;
		let _usa_custo_offset = "usa_custo_offset" in opt && opt["usa_custo_offset"] == 1;
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
			lucro_no_tempo: []
		}
		/*----------------------------- Percorre as operações ----------------------------*/
		for (let o in ops){
			//Usa o custo da operação a ser aplicada no resultado 'Resultado Líquido'
			let _custo_operacao = ((_usa_custo) ? (ops[o]["cts"] * ops[o]["ativo_custo"]) : 0.0 );
			//Usa o custo da operação na hora de considerar uma operação 'Empate'
			let _empate_offset = ((_usa_custo_offset) ? (ops[o]["cts"] * ops[o]["ativo_custo"]) : 0.0 );
			//Calcula o resultado da operação
			let _op_result = calculate_op_result[_rr_used](ops[o], filters, simulate, _custo_operacao);
			//Se for null é porque o trade não acontece
			if (_op_result !== null){
				_temp__table_stats["dias__unicos"][ops[o].data] = null;
				//Se for uma operação 'Positiva'
				if (_op_result.result["brl"] > _empate_offset){
					_dashboard_ops__table_stats["trades__positivo"]++;
					_temp__table_stats["mediaGain"] += _op_result.result["brl"];
				}
				//Se for uma operação 'Negativa'
				else if (_op_result.result["brl"] < _empate_offset * (-1.0)){
					_dashboard_ops__table_stats["trades__negativo"]++;
					_temp__table_stats["mediaLoss"] += _op_result.result["brl"];
				}
				//Se for uma operação 'Empate (0x0)'
				else{
					_dashboard_ops__table_stats["trades__empate"]++;
					_temp__table_stats["mediaGain"] += _op_result.result["brl"];
				}
				//Calcula o lucro corrente após cada operação
				_temp__table_stats["lucro_corrente"]["brl"] += _op_result.result["brl"];
				_temp__table_stats["lucro_corrente"]["pts"] += _op_result.result["pts"];
				_temp_listas["resultados"].push(_op_result.result["brl"]);
				_temp_listas["lucro_no_tempo"].push(_temp__table_stats["lucro_corrente"]["brl"]);
			}
		}
		/*------------------------ Termina processamento dos Dados -----------------------*/
		//Termina de processar estatisticas de '_temp__table_stats'
		_temp__table_stats["mediaGain"] = (_temp__table_stats["mediaGain"] / (_dashboard_ops__table_stats["trades__positivo"] + _dashboard_ops__table_stats["trades__empate"]));
		_temp__table_stats["mediaLoss"] = (_temp__table_stats["mediaLoss"] / _dashboard_ops__table_stats["trades__negativo"]);
		//Termina de processar estatisticas do '_dashboard_ops__table_stats'
		_dashboard_ops__table_stats["dias__total"] = Object.keys(_temp__table_stats["dias__unicos"]).length;
		_dashboard_ops__table_stats["dias__trades_por_dia"] = (ops.length / _dashboard_ops__table_stats["dias__total"]);
		_dashboard_ops__table_stats["trades__total"] = ops.length;
		_dashboard_ops__table_stats["trades__positivo_perc"] = ((_dashboard_ops__table_stats["trades__positivo"] / _dashboard_ops__table_stats["trades__total"]) * 100);
		_dashboard_ops__table_stats["trades__negativo_perc"] = ((_dashboard_ops__table_stats["trades__negativo"] / _dashboard_ops__table_stats["trades__total"]) * 100);
		_dashboard_ops__table_stats["trades__empate_perc"] = ((_dashboard_ops__table_stats["trades__empate"] / _dashboard_ops__table_stats["trades__total"]) * 100);
		_dashboard_ops__table_stats["result__lucro_brl"] = _temp__table_stats["lucro_corrente"]["brl"];
		_dashboard_ops__table_stats["result__lucro_R"] = ("R" in opt) ? (_temp__table_stats["lucro_corrente"]["brl"] / opt["R"]) : "--";
		_dashboard_ops__table_stats["result__lucro_pts"] = _temp__table_stats["lucro_corrente"]["pts"];
		_dashboard_ops__table_stats["result__lucro_perc"] = ("valor_inicial" in opt) ? ((_temp__table_stats["lucro_corrente"]["brl"] / opt["valor_inicial"]) * 100) : "--";
		_dashboard_ops__table_stats["result__mediaGain_brl"] = _temp__table_stats["mediaGain"];
		_dashboard_ops__table_stats["result__mediaGain_R"] = ("R" in opt) ? (_temp__table_stats["mediaGain"] / opt["R"]) : "--";
		_dashboard_ops__table_stats["result__mediaGain_perc"] = ("valor_inicial" in opt) ? ((_temp__table_stats["mediaGain"] / opt["valor_inicial"]) * 100) : "--";
		_dashboard_ops__table_stats["result__mediaLoss_brl"] = _temp__table_stats["mediaLoss"];
		_dashboard_ops__table_stats["result__mediaLoss_R"] = ("R" in opt) ? (_temp__table_stats["mediaLoss"] / opt["R"]) : "--";
		_dashboard_ops__table_stats["result__mediaLoss_perc"] = ("valor_inicial" in opt) ? ((_temp__table_stats["mediaLoss"] / opt["valor_inicial"]) * 100) : "--";
		_dashboard_ops__table_stats["stats__breakeven"] = ((Math.abs(_temp__table_stats["mediaLoss"]) / (_temp__table_stats["mediaGain"] + Math.abs(_temp__table_stats["mediaLoss"]))) * 100);
		_dashboard_ops__table_stats["stats__edge"] = _dashboard_ops__table_stats["trades__positivo_perc"] - _dashboard_ops__table_stats["stats__breakeven"];
		_dashboard_ops__table_stats["stats__fatorLucro"] = (_dashboard_ops__table_stats["trades__positivo_perc"] * _temp__table_stats["mediaGain"]) / (_dashboard_ops__table_stats["trades__negativo_perc"] * _temp__table_stats["mediaLoss"]);
		_dashboard_ops__table_stats["stats__expect"] = ("R" in opt) ? ((_temp__table_stats["lucro_corrente"]["brl"] / _dashboard_ops__table_stats["trades__total"]) / opt["R"]) : "--";
		_dashboard_ops__table_stats["stats__dp"] = desvpad(_temp_listas["resultados"]);
		_dashboard_ops__table_stats["stats__sqn"] = ("R" in opt) ? (_dashboard_ops__table_stats["stats__expect"] / (_dashboard_ops__table_stats["stats__dp"] * Math.sqrt(_dashboard_ops__table_stats["trades__total"]))) : "--";
		return {
			dashboard_ops__table_stats: _dashboard_ops__table_stats
		}
	}
	/*--------------------------------------------------------------------------------*/
	return {
		generate: generate
	}
})();