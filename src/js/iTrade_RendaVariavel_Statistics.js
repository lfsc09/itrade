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
		Busca observações do cenario passado na lista de observações dos filtros.
	*/
	let checkObservacoes = function (opCenario, opObs, filter_cenarios, method = 'OR'){
		//Verifica se o cenario está nos filtros
		if (opCenario in filter_cenarios){
			//Verifica se há observações escolhidas nos filtros do cenario
			if (!Global.isObjectEmpty(filter_cenarios[opCenario]['observacoes'])){
				let opObs__Array = opObs.split(',');
				//A operação deve ter pelo menos um dos filtros escolhidos 
				if (method === 'OR'){
					for (let ref in filter_cenarios[opCenario]['observacoes']){
						//Operações que TENHAM a observação
						if (filter_cenarios[opCenario]['observacoes'][ref] == 0){
							if (opObs__Array.includes(ref))
								return true;
						}
						//Operações que NÃO TENHAM a observação
						else if (filter_cenarios[opCenario]['observacoes'][ref] == 1){
							if (!opObs__Array.includes(ref))
								return true;
						}
					}
					return false;
				}
				//A operação deve ter todos os filtros escolhidos 
				if (method === 'AND'){
					for (let ref in filter_cenarios[opCenario]['observacoes']){
						//Operações que TENHAM a observação
						if (filter_cenarios[opCenario]['observacoes'][ref] == 0){
							if (!opObs__Array.includes(ref))
								return false;
						}
						//Operações que NÃO TENHAM a observação
						else if (filter_cenarios[opCenario]['observacoes'][ref] == 1){
							if (opObs__Array.includes(ref))
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
	let findCts_toUse = function (opCts, stopBrl, opEscalada, simulation){
		//Usar Cts da operação
		if (simulation.tipo_cts === '1' || (simulation.tipo_cts === '2' && simulation.cts === null) || (simulation.tipo_cts === '3' && simulation.R === null))
			return opCts;
		//Força uma quantidade fixa passada em 'simulation.cts'
		else if (simulation.tipo_cts === '2' && simulation.cts !== null)
			return simulation.cts * (opEscalada + 1);
		//Calcula o numero maximo de Cts a partir do 'R' e do 'Maior Stop' da operacao
		else if (simulation.tipo_cts === '3')
			return Math.floor(divide(simulation.R, stopBrl)) * (opEscalada + 1);
	}
	/*
		Aplica os 'filters' na operacao passada.
	*/
	let okToUse_filterOp = function (op, op_stopBrl, filters, simulation){
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
		//Filtra apenas os gerenciamentos selecionados
		if (filters.gerenciamento !== null && filters.gerenciamento != op.gerenciamento)
			return false;
		//Filtra apenas os cenarios selecionados
		if (!Global.isObjectEmpty(filters.cenario) && !(op.cenario in filters.cenario))
			return false;
		//Filtra apenas as observações selecionadas dos cenarios
		if (!checkObservacoes(op.cenario, op.observacoes, filters.cenario, filters.observacoes_query_union))
			return false;
		//Filtra apenas as operações com Stop dentro do R passado
		if (simulation.R !== null && simulation.R_filter_ops && op_stopBrl > simulation.R)
			return false;
		//Filtra operações com Erro
		if (simulation.ignora_erro && op.erro == 1)
			return false;
		return true;
	}
	/*
		Realiza os calculos de 'tipo_parada', para aplicar os filtros.
	*/
	let checkTipo_Paradas = function (stop_tipo_parada, resultLiquido_operacao, simulation){
		//Verifica se a operação pode ser executada dados os tipos de parada 'Na Semana'
		for (let tp_value in stop_tipo_parada['sem'].tipo_parada){
			//Parada N dias Stop (Cheio)
			if (tp_value === 'ss1'){
				if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current >= stop_tipo_parada['sem']['tipo_parada'][tp_value].max)
					return false;
			}
			//Parada N dias Gain (Cheio)
			else if (tp_value === 'gs1'){
				if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current >= stop_tipo_parada['sem']['tipo_parada'][tp_value].max)
					return false;
			}
			//Parada N dias Stop (Total)
			else if (tp_value === 'ss2'){
				if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current < stop_tipo_parada['sem']['tipo_parada'][tp_value].max){
					if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao !== stop_tipo_parada['dia'].condicao){
						if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current < 0){
							stop_tipo_parada['sem']['tipo_parada'][tp_value].current += 1;
							if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current >= stop_tipo_parada['sem']['tipo_parada'][tp_value].max)
								return false;
						}
						stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current = 0.0;
						stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao = stop_tipo_parada['dia'].condicao;
					}
					stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current += resultLiquido_operacao;
				}
				else
					return false;
			}
			//Parada N dias Gain (Total)
			else if (tp_value === 'gs2'){
				if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current < stop_tipo_parada['sem']['tipo_parada'][tp_value].max){
					if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao !== stop_tipo_parada['dia'].condicao){
						if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current > 0){
							stop_tipo_parada['sem']['tipo_parada'][tp_value].current += 1;
							if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current >= stop_tipo_parada['sem']['tipo_parada'][tp_value].max)
								return false;
						}
						stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current = 0.0;
						stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao = stop_tipo_parada['dia'].condicao;
					}
					stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current += resultLiquido_operacao;
				}
				else
					return false;
			}
			//Parada N dias Stop (Sequencia)
			else if (tp_value === 'ss3'){
				if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current < stop_tipo_parada['sem']['tipo_parada'][tp_value].max){
					if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao !== stop_tipo_parada['dia'].condicao){
						//Se o dia foi negativo
						if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current < 0){
							stop_tipo_parada['sem']['tipo_parada'][tp_value].current += 1;
							if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current >= stop_tipo_parada['sem']['tipo_parada'][tp_value].max)
								return false;
						}
						//Zera apenas com dias positivos, Empates não contam
						else if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current > 0)
							stop_tipo_parada['sem']['tipo_parada'][tp_value].current = 0;
						stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current = 0.0;
						stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao = stop_tipo_parada['dia'].condicao;
					}
					stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current += resultLiquido_operacao;
				}
				else
					return false;
			}
			//Parada N dias Gain (Sequencia)
			else if (tp_value === 'gs3'){
				if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current < stop_tipo_parada['sem']['tipo_parada'][tp_value].max){
					if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao !== stop_tipo_parada['dia'].condicao){
						//Se o dia foi positivo
						if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current > 0){
							stop_tipo_parada['sem']['tipo_parada'][tp_value].current += 1;
							if (stop_tipo_parada['sem']['tipo_parada'][tp_value].current >= stop_tipo_parada['sem']['tipo_parada'][tp_value].max)
								return false;
						}
						//Zera apenas com dias negativos, Empates não contam
						else if (stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current < 0)
							stop_tipo_parada['sem']['tipo_parada'][tp_value].current = 0;
						stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current = 0.0;
						stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].condicao = stop_tipo_parada['dia'].condicao;
					}
					stop_tipo_parada['sem']['tipo_parada'][tp_value]['dia'].current += resultLiquido_operacao;
				}
				else
					return false;
			}
		}
		//Verifica se a operação pode ser executada dados os tipos de parada 'No Dia'
		for (let tp_value in stop_tipo_parada['dia'].tipo_parada){
			//Parada N Stops (Total)
			if (tp_value === 'sd1'){
				if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max){
					//Se for um Stop
					if (resultLiquido_operacao < 0)
						stop_tipo_parada['dia']['tipo_parada'][tp_value].current += 1;
					//Atualiza o 'ss1' os dias com stop cheio
					if ('ss1' in stop_tipo_parada['sem']['tipo_parada']){
						//Se caso atingiu o limite diario, atualiza as paradas semanais
						if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max){
							if (stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao !== stop_tipo_parada['dia'].condicao){
								stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
								stop_tipo_parada['sem']['tipo_parada']['ss1'].current += 1;
							}
						}
					}
				}
				//Foi atingido o limite diário
				else
					return false;
			}
			//Parada N Gain (Total)
			else if (tp_value === 'gd1'){
				if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max){
					//Se for um Gain
					if (resultLiquido_operacao > 0)
						stop_tipo_parada['dia']['tipo_parada'][tp_value].current += 1;
					//Atualiza o 'gs1' os dias com gain cheio
					if ('gs1' in stop_tipo_parada['sem']['tipo_parada']){
						//Se caso atingiu o limite diario, atualiza as paradas semanais
						if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max){
							if (stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao !== stop_tipo_parada['dia'].condicao){
								stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
								stop_tipo_parada['sem']['tipo_parada']['gs1'].current += 1;
							}
						}
					}
				}
				//Foi atingido o limite diário
				else
					return false;
			}
			//Parada N Stops (Sequencia)
			else if (tp_value === 'sd2'){
				if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max){
					//Se for um Stop
					if (resultLiquido_operacao < 0)
						stop_tipo_parada['dia']['tipo_parada'][tp_value].current += 1;
					//Zera apenas com Gain, Empates não contam
					else if (resultLiquido_operacao > 0)
						stop_tipo_parada['dia']['tipo_parada'][tp_value].current = 0;
					//Atualiza o 'ss1' os dias com stop cheio
					if ('ss1' in stop_tipo_parada['sem']['tipo_parada']){
						//Se caso atingiu o limite diario, atualiza as paradas semanais
						if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max){
							if (stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao !== stop_tipo_parada['dia'].condicao){
								stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
								stop_tipo_parada['sem']['tipo_parada']['ss1'].current += 1;
							}
						}
					}
				}
				//Foi atingido o limite diário
				else
					return false;
			}
			//Parada N Gains (Sequencia)
			else if (tp_value === 'gd2'){
				if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max){
					//Se for um Gain
					if (resultLiquido_operacao > 0)
						stop_tipo_parada['dia']['tipo_parada'][tp_value].current += 1;
					//Zera apenas com Stop, Empates não contam
					else if (resultLiquido_operacao < 0)
						stop_tipo_parada['dia']['tipo_parada'][tp_value].current = 0;
					//Atualiza o 'gs1' os dias com gain cheio
					if ('gs1' in stop_tipo_parada['sem']['tipo_parada']){
						//Se caso atingiu o limite diario, atualiza as paradas semanais
						if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max){
							if (stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao !== stop_tipo_parada['dia'].condicao){
								stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
								stop_tipo_parada['sem']['tipo_parada']['gs1'].current += 1;
							}
						}
					}
				}
				//Foi atingido o limite diário
				else
					return false;
			}
			//Parada X Valor no Negativo
			else if (tp_value === 'sd3'){
				if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current > stop_tipo_parada['dia']['tipo_parada'][tp_value].max * (-1)){
					stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
					//Atualiza o 'ss1' os dias com stop cheio
					if ('ss1' in stop_tipo_parada['sem']['tipo_parada']){
						//Se caso atingiu o limite diario, atualiza as paradas semanais
						if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current <= stop_tipo_parada['dia']['tipo_parada'][tp_value].max * (-1)){
							if (stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao !== stop_tipo_parada['dia'].condicao){
								stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
								stop_tipo_parada['sem']['tipo_parada']['ss1'].current += 1;
							}
						}
					}
				}
				//Foi atingido o limite diário
				else
					return false;
			}
			//Parada X Valor no Positivo
			else if (tp_value === 'gd3'){
				if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max){
					stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
					//Atualiza o 'gs1' os dias com gain cheio
					if ('gs1' in stop_tipo_parada['sem']['tipo_parada']){
						//Se caso atingiu o limite diario, atualiza as paradas semanais
						if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max){
							if (stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao !== stop_tipo_parada['dia'].condicao){
								stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
								stop_tipo_parada['sem']['tipo_parada']['gs1'].current += 1;
							}
						}
					}
				}
				//Foi atingido o limite diário
				else
					return false;
			}
			//Parada X Valor de Perda Bruta
			else if (tp_value === 'sd4'){
				if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current > stop_tipo_parada['dia']['tipo_parada'][tp_value].max * (-1)){
					//Se for um Stop
					if (resultLiquido_operacao < 0)
						stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
					//Atualiza o 'ss1' os dias com stop cheio
					if ('ss1' in stop_tipo_parada['sem']['tipo_parada']){
						//Se caso atingiu o limite diario, atualiza as paradas semanais
						if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current <= stop_tipo_parada['dia']['tipo_parada'][tp_value].max * (-1)){
							if (stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao !== stop_tipo_parada['dia'].condicao){
								stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
								stop_tipo_parada['sem']['tipo_parada']['ss1'].current += 1;
							}
						}
					}
				}
				//Foi atingido o limite diário
				else
					return false;
			}
			//Parada X Valor de Ganho Bruta
			else if (tp_value === 'gd4'){
				if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current > stop_tipo_parada['dia']['tipo_parada'][tp_value].max * (-1)){
					//Se for um Gain
					if (resultLiquido_operacao > 0)
						stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
					//Atualiza o 'gs1' os dias com gain cheio
					if ('gs1' in stop_tipo_parada['sem']['tipo_parada']){
						//Se caso atingiu o limite diario, atualiza as paradas semanais
						if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max){
							if (stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao !== stop_tipo_parada['dia'].condicao){
								stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
								stop_tipo_parada['sem']['tipo_parada']['gs1'].current += 1;
							}
						}
					}
				}
				//Foi atingido o limite diário
				else
					return false;
			}
			//Parada X R's no Negativo
			else if (tp_value === 'sd5' && simulation.R !== null){
				if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current > stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R * (-1)){
					stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
					//Atualiza o 'ss1' os dias com stop cheio
					if ('ss1' in stop_tipo_parada['sem']['tipo_parada']){
						//Se caso atingiu o limite diario, atualiza as paradas semanais
						if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current <= stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R * (-1)){
							if (stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao !== stop_tipo_parada['dia'].condicao){
								stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
								stop_tipo_parada['sem']['tipo_parada']['ss1'].current += 1;
							}
						}
					}
				}
				//Foi atingido o limite diário
				else
					return false;
			}
			//Parada X R's no Positivo
			else if (tp_value === 'gd5' && simulation.R !== null){
				if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R){
					stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
					//Atualiza o 'gs1' os dias com gain cheio
					if ('gs1' in stop_tipo_parada['sem']['tipo_parada']){
						//Se caso atingiu o limite diario, atualiza as paradas semanais
						if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R){
							if (stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao !== stop_tipo_parada['dia'].condicao){
								stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
								stop_tipo_parada['sem']['tipo_parada']['gs1'].current += 1;
							}
						}
					}
				}
				//Foi atingido o limite diário
				else
					return false;
			}
			//Parada X R's de Perda Bruta
			else if (tp_value === 'sd6' && simulation.R !== null){
				if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current > stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R * (-1)){
					//Se for um Stop
					if (resultLiquido_operacao < 0)
						stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
					//Atualiza o 'ss1' os dias com stop cheio
					if ('ss1' in stop_tipo_parada['sem']['tipo_parada']){
						//Se caso atingiu o limite diario, atualiza as paradas semanais
						if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current <= stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R * (-1)){
							if (stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao !== stop_tipo_parada['dia'].condicao){
								stop_tipo_parada['sem']['tipo_parada']['ss1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
								stop_tipo_parada['sem']['tipo_parada']['ss1'].current += 1;
							}
						}
					}
				}
				//Foi atingido o limite diário
				else
					return false;
			}
			//Parada X R's de Ganho Bruto
			else if (tp_value === 'gd6' && simulation.R !== null){
				if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current < stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R){
					//Se for um Gain
					if (resultLiquido_operacao > 0)
						stop_tipo_parada['dia']['tipo_parada'][tp_value].current += resultLiquido_operacao;
					//Atualiza o 'gs1' os dias com gain cheio
					if ('gs1' in stop_tipo_parada['sem']['tipo_parada']){
						//Se caso atingiu o limite diario, atualiza as paradas semanais
						if (stop_tipo_parada['dia']['tipo_parada'][tp_value].current >= stop_tipo_parada['dia']['tipo_parada'][tp_value].max * simulation.R){
							if (stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao !== stop_tipo_parada['dia'].condicao){
								stop_tipo_parada['sem']['tipo_parada']['gs1']['dia'].condicao = stop_tipo_parada['dia'].condicao;
								stop_tipo_parada['sem']['tipo_parada']['gs1'].current += 1;
							}
						}
					}
				}
				//Foi atingido o limite diário
				else
					return false;
			}
		}
		return true;
	}
	/*
		Recebe a lista de operações (Por Trade), e agrupa dependendo do escolhido. (Por Trade 'Default', Por Dia, Por Mes)
		Já calcula as informações de resultado necessárias.
	*/
	let groupData_byPeriodo = function (list, filters, simulation, options = {}){
		let new_list = [],
			stop_tipo_parada = {
				dia: { condicao: null, tipo_parada: {} },
				sem: { condicao: null, tipo_parada: {} }
			}
		//Mantem 'por Trade'
		if (simulation.periodo_calc === '1'){
			for (let e in list){
				let op_resultBruto_Unitario = calculate_op_result(list[e], simulation);
				//Roda os 'filters' na operação
				if (okToUse_filterOp(list[e], op_resultBruto_Unitario['stop_c_cts'].brl, filters, simulation)){
					let current_month_year = list[e].data.split('-'),
						current_week_year = moment(list[e].data).isoWeek();
					current_week_year = `${current_month_year[0]}-${current_week_year}`;
					current_month_year = `${current_month_year[0]}-${current_month_year[1]}`;
					//Inicia a condição do Tipo Parada (No Dia)
					if (stop_tipo_parada['dia'].condicao !== list[e].data){
						stop_tipo_parada['dia']['condicao'] = list[e].data;
						for (let tp = 0; tp < simulation['tipo_parada'].length; tp++){
							//Busca apenas os 'tipo_parada' de 'No Dia'
							if (/[sg]d[1-9]/.test(simulation['tipo_parada'][tp]['tipo_parada'])){
								stop_tipo_parada['dia']['tipo_parada'][simulation['tipo_parada'][tp].tipo_parada] = {
									current: 0.0,
									max: parseFloat(simulation['tipo_parada'][tp].valor_parada)
								}
							}
						}
					}
					//Inicia a condição do Tipo Parada (Na Semana)
					if (stop_tipo_parada['sem'].condicao !== current_week_year){
						stop_tipo_parada['sem']['condicao'] = current_week_year;
						for (let tp = 0; tp < simulation['tipo_parada'].length; tp++){
							//Busca apenas os 'tipo_parada' de 'Na Semana'
							if (/[sg]s[1-9]/.test(simulation['tipo_parada'][tp]['tipo_parada'])){
								stop_tipo_parada['sem']['tipo_parada'][simulation['tipo_parada'][tp].tipo_parada] = {
									dia: { condicao: null, current: 0.0 },
									current: 0.0,
									max: parseFloat(simulation['tipo_parada'][tp].valor_parada)
								}
							}
						}
					}
					//Calcula o resultado bruto da operação com apenas 1 contrato
					//Calcula o numero de contratos a ser usado dependendo do 'simulation'
					let cts_usado = findCts_toUse(list[e].cts, op_resultBruto_Unitario['stop'].brl, list[e].escalada, simulation);
					//Calcula o resultado bruto aplicando o numero de contratos
					let resultBruto_operacao = op_resultBruto_Unitario['result'].brl * (cts_usado / (list[e].escalada + 1));
					//Usa o custo da operação a ser aplicada no resultado 'Resultado Líquido'
					let custo_operacao = ((simulation.usa_custo) ? (cts_usado * list[e].ativo_custo) : 0.0 );
					//Calcula o resultado liquido aplicando os custos
					let resultLiquido_operacao = resultBruto_operacao - custo_operacao;
					if (checkTipo_Paradas(stop_tipo_parada, resultLiquido_operacao, simulation)){
						if ('only_FilterOps' in options && options.only_FilterOps){
							new_list.push({
								id: list[e].id,
								sequencia: list[e].sequencia,
								gerenciamento: list[e].gerenciamento,
								escalada: list[e].escalada,
								data: list[e].data,
								hora: list[e].hora,
								ativo: list[e].ativo,
								op: list[e].op,
								vol: list[e].vol,
								cts: cts_usado,
								erro: list[e].erro,
								cenario: list[e].cenario,
								observacoes: list[e].observacoes,
								resultado: resultBruto_operacao,
								ativo_custo: list[e].ativo_custo,
								ativo_valor_tick: list[e].ativo_valor_tick,
								ativo_pts_tick: list[e].ativo_pts_tick,
								gerenciamento_acoes: list[e].gerenciamento_acoes
							});
						}
						else{
							new_list.push({
								id: list[e].id,
								data: list[e].data,
								hora: list[e].hora,
								cenario: list[e].cenario,
								vol: list[e].vol,
								op: list[e].op,
								erro: list[e].erro,
								cts_usado: cts_usado,
								custo: custo_operacao,
								observacoes: list[e].observacoes,
								resultado_op: (resultLiquido_operacao > 0 ? 1 : (resultLiquido_operacao < 0 ? -1 : 0)),
								result_bruto: {
									brl: resultBruto_operacao,
									R: (simulation.R !== null) ? divide(resultBruto_operacao, simulation.R) : '--',
									S: (op_resultBruto_Unitario['result'].brl != 0 ? divide(divide(op_resultBruto_Unitario['result'].brl, list[e].vol), op_resultBruto_Unitario['menor_alvo']) : 0),
								},
								result_liquido: {
									brl: resultLiquido_operacao,
									R: (simulation.R !== null) ? divide(resultLiquido_operacao, simulation.R) : '--'
								}
							});
						}
					}
				}
			}
		}
		//Agrupa 'por Dia'
		else if (simulation.periodo_calc === '2'){
			let day_used = null,
				index = -1;
			for (let e in list){
				let op_resultBruto_Unitario = calculate_op_result(list[e], simulation);
				//Roda os 'filters' na operação
				if (okToUse_filterOp(list[e], op_resultBruto_Unitario['stop_c_cts'].brl, filters, simulation)){
					let current_month_year = list[e].data.split('-'),
						current_week_year = moment(list[e].data).isoWeek();
					current_week_year = `${current_month_year[0]}-${current_week_year}`;
					current_month_year = `${current_month_year[0]}-${current_month_year[1]}`;
					//Inicia a condição do Tipo Parada (No Dia)
					if (stop_tipo_parada['dia'].condicao !== list[e].data){
						stop_tipo_parada['dia']['condicao'] = list[e].data;
						for (let tp = 0; tp < simulation['tipo_parada'].length; tp++){
							//Busca apenas os 'tipo_parada' de 'No Dia'
							if (simulation['tipo_parada'][tp].tipo_parada.includes('d')){
								stop_tipo_parada['dia']['tipo_parada'][simulation['tipo_parada'][tp].tipo_parada] = {
									current: 0.0,
									max: parseFloat(simulation['tipo_parada'][tp].valor_parada)
								}
							}
						}
					}
					//Inicia a condição do Tipo Parada (Na Semana)
					if (stop_tipo_parada['sem'].condicao !== current_week_year){
						stop_tipo_parada['sem']['condicao'] = current_week_year;
						for (let tp = 0; tp < simulation['tipo_parada'].length; tp++){
							//Busca apenas os 'tipo_parada' de 'Na Semana'
							if (simulation['tipo_parada'][tp].tipo_parada.includes('s')){
								stop_tipo_parada['sem']['tipo_parada'][simulation['tipo_parada'][tp].tipo_parada] = {
									dia: { condicao: null, current: 0.0 },
									current: 0.0,
									max: parseFloat(simulation['tipo_parada'][tp].valor_parada)
								}
							}
						}
					}
					//Calcula o resultado bruto da operação com apenas 1 contrato
					//Calcula o numero de contratos a ser usado dependendo do 'simulation'
					let cts_usado = findCts_toUse(list[e].cts, op_resultBruto_Unitario['stop'].brl, list[e].escalada, simulation);
					//Calcula o resultado bruto aplicando o numero de contratos
					let resultBruto_operacao = op_resultBruto_Unitario['result'].brl * (cts_usado / (list[e].escalada + 1));
					//Usa o custo da operação a ser aplicada no resultado 'Resultado Líquido'
					let custo_operacao = ((simulation.usa_custo) ? (cts_usado * list[e].ativo_custo) : 0.0 );
					//Calcula o resultado liquido aplicando os custos
					let resultLiquido_operacao = resultBruto_operacao - custo_operacao;
					if (checkTipo_Paradas(stop_tipo_parada, resultLiquido_operacao, simulation)){
						//Guarda o dia sendo olhado
						if (day_used !== list[e].data){
							day_used = list[e].data;
							if (index > -1)
								new_list[index]['resultado_op'] = (new_list[index]['result_liquido'].brl > 0 ? 1 : (new_list[index]['result_liquido'].brl < 0 ? -1 : 0));
							index++;
						}
						if (!(index in new_list)){
							new_list[index] = {
								erro: list[e].erro,
								data: day_used,
								qtd_trades: 1,
								vol_total: list[e].vol,
								erro: list[e].erro,
								cts_usado: cts_usado,
								custo: custo_operacao,
								resultado_op: null,
								lucro_bruto: {
									brl: (resultBruto_operacao > 0) ? resultBruto_operacao : 0.0,
									R: (simulation.R !== null) ? ((resultBruto_operacao > 0) ? divide(resultBruto_operacao, simulation.R) : 0.0) : '--'
								},
								prejuizo_bruto: {
									brl: (resultBruto_operacao < 0) ? resultBruto_operacao : 0.0,
									R: (simulation.R !== null) ? ((resultBruto_operacao < 0) ? divide(resultBruto_operacao, simulation.R) : 0.0) : '--'
								},
								result_bruto: {
									brl: resultBruto_operacao,
									R: (simulation.R !== null) ? divide(resultBruto_operacao, simulation.R) : '--',
									S: (op_resultBruto_Unitario['result'].brl != 0 ? divide(divide(op_resultBruto_Unitario['result'].brl, list[e].vol), op_resultBruto_Unitario['menor_alvo']) : 0),
								},
								result_liquido: {
									brl: resultLiquido_operacao,
									R: (simulation.R !== null) ? divide(resultLiquido_operacao, simulation.R) : '--'
								}
							};
						}
						else{
							new_list[index]['qtd_trades']++;
							if (new_list[index]['erro'] === 0)
								new_list[index]['erro'] = list[e].erro;
							new_list[index]['cts_usado'] += cts_usado;
							new_list[index]['custo'] += custo_operacao;
							new_list[index]['vol_total'] += list[e].vol;
							new_list[index]['erro'] = new_list[index]['erro'] || list[e].erro;
							if (resultBruto_operacao > 0){
								new_list[index]['lucro_bruto']['brl'] += resultBruto_operacao;
								if (simulation.R !== null)
									new_list[index]['lucro_bruto']['R'] += divide(resultBruto_operacao, simulation.R);
							}
							else if (resultBruto_operacao < 0){
								new_list[index]['prejuizo_bruto']['brl'] += resultBruto_operacao;
								if (simulation.R !== null)
									new_list[index]['prejuizo_bruto']['R'] += divide(resultBruto_operacao, simulation.R);
							}
							new_list[index]['result_bruto']['brl'] += resultBruto_operacao;
							new_list[index]['result_bruto']['S'] += (op_resultBruto_Unitario['result'].brl != 0 ? divide(divide(op_resultBruto_Unitario['result'].brl, list[e].vol), op_resultBruto_Unitario['menor_alvo']) : 0);
							if (simulation.R !== null)
								new_list[index]['result_bruto']['R'] += divide(resultBruto_operacao, simulation.R);
							new_list[index]['result_liquido']['brl'] += resultLiquido_operacao;
							if (simulation.R !== null)
								new_list[index]['result_liquido']['R'] += divide(resultLiquido_operacao, simulation.R);
						}
					}
				}
			}
			//Termina para o ultimo
			if (index > -1)
				new_list[index]['resultado_op'] = (new_list[index]['result_liquido']['brl'] > new_list[index]['custo'] ? 1 : (new_list[index]['result_liquido']['brl'] < new_list[index]['custo'] ? -1 : 0));
		}
		//Agrupa 'por Mes'
		else if (simulation.periodo_calc === '3'){
			let month_used = null,
				index = -1;
			for (let e in list){
				let op_resultBruto_Unitario = calculate_op_result(list[e], simulation);
				//Roda os 'filters' na operação
				if (okToUse_filterOp(list[e], op_resultBruto_Unitario['stop_c_cts'].brl, filters, simulation)){
					let current_month_year = list[e].data.split('-'),
						current_week_year = moment(list[e].data).isoWeek();
					current_week_year = `${current_month_year[0]}-${current_week_year}`;
					current_month_year = `${current_month_year[0]}-${current_month_year[1]}`;
					//Inicia a condição do Tipo Parada (No Dia)
					if (stop_tipo_parada['dia'].condicao !== list[e].data){
						stop_tipo_parada['dia']['condicao'] = list[e].data;
						for (let tp = 0; tp < simulation['tipo_parada'].length; tp++){
							//Busca apenas os 'tipo_parada' de 'No Dia'
							if (simulation['tipo_parada'][tp].tipo_parada.includes('d')){
								stop_tipo_parada['dia']['tipo_parada'][simulation['tipo_parada'][tp].tipo_parada] = {
									current: 0.0,
									max: parseFloat(simulation['tipo_parada'][tp].valor_parada)
								}
							}
						}
					}
					//Inicia a condição do Tipo Parada (Na Semana)
					if (stop_tipo_parada['sem'].condicao !== current_week_year){
						stop_tipo_parada['sem']['condicao'] = current_week_year;
						for (let tp = 0; tp < simulation['tipo_parada'].length; tp++){
							//Busca apenas os 'tipo_parada' de 'Na Semana'
							if (simulation['tipo_parada'][tp].tipo_parada.includes('s')){
								stop_tipo_parada['sem']['tipo_parada'][simulation['tipo_parada'][tp].tipo_parada] = {
									dia: { condicao: null, current: 0.0 },
									current: 0.0,
									max: parseFloat(simulation['tipo_parada'][tp].valor_parada)
								}
							}
						}
					}
					//Calcula o resultado bruto da operação com apenas 1 contrato
					//Calcula o numero de contratos a ser usado dependendo do 'simulation'
					let cts_usado = findCts_toUse(list[e].cts, op_resultBruto_Unitario['stop'].brl, list[e].escalada, simulation);
					//Calcula o resultado bruto aplicando o numero de contratos
					let resultBruto_operacao = op_resultBruto_Unitario['result'].brl * (cts_usado / (list[e].escalada + 1));
					//Usa o custo da operação a ser aplicada no resultado 'Resultado Líquido'
					let custo_operacao = ((simulation.usa_custo) ? (cts_usado * list[e].ativo_custo) : 0.0 );
					//Calcula o resultado liquido aplicando os custos
					let resultLiquido_operacao = resultBruto_operacao - custo_operacao;
					if (checkTipo_Paradas(stop_tipo_parada, resultLiquido_operacao, simulation)){
						//Guarda o mes sendo olhado
						if (month_used !== current_month_year){
							month_used = current_month_year;
							if (index > -1)
								new_list[index]['resultado_op'] = (new_list[index]['result_liquido'].brl > 0 ? 1 : (new_list[index]['result_liquido'].brl < 0 ? -1 : 0));
							index++;
						}
						if (!(index in new_list)){
							new_list[index] = {
								erro: list[e].erro,
								data: month_used,
								qtd_trades: 1,
								vol_total: list[e].vol,
								erro: list[e].erro,
								cts_usado: cts_usado,
								custo: custo_operacao,
								resultado_op: null,
								lucro_bruto: {
									brl: (resultBruto_operacao > 0) ? resultBruto_operacao : 0.0,
									R: (simulation.R !== null) ? ((resultBruto_operacao > 0) ? divide(resultBruto_operacao, simulation.R) : 0.0) : '--'
								},
								prejuizo_bruto: {
									brl: (resultBruto_operacao < 0) ? resultBruto_operacao : 0.0,
									R: (simulation.R !== null) ? ((resultBruto_operacao < 0) ? divide(resultBruto_operacao, simulation.R) : 0.0) : '--'
								},
								result_bruto: {
									brl: resultBruto_operacao,
									R: (simulation.R !== null) ? divide(resultBruto_operacao, simulation.R) : '--',
									S: (op_resultBruto_Unitario['result'].brl != 0 ? divide(divide(op_resultBruto_Unitario['result'].brl, list[e].vol), op_resultBruto_Unitario['menor_alvo']) : 0),
								},
								result_liquido: {
									brl: resultLiquido_operacao,
									R: (simulation.R !== null) ? divide(resultLiquido_operacao, simulation.R) : '--'
								}
							};
						}
						else{
							new_list[index]['qtd_trades']++;
							if (new_list[index]['erro'] === 0)
								new_list[index]['erro'] = list[e].erro;
							new_list[index]['cts_usado'] += cts_usado;
							new_list[index]['custo'] += custo_operacao;
							new_list[index]['vol_total'] += list[e].vol;
							new_list[index]['erro'] = new_list[index]['erro'] || list[e].erro;
							if (resultBruto_operacao > 0){
								new_list[index]['lucro_bruto']['brl'] += resultBruto_operacao;
								if (simulation.R !== null)
									new_list[index]['lucro_bruto']['R'] += divide(resultBruto_operacao, simulation.R);
							}
							else if (resultBruto_operacao < 0){
								new_list[index]['prejuizo_bruto']['brl'] += resultBruto_operacao;
								if (simulation.R !== null)
									new_list[index]['prejuizo_bruto']['R'] += divide(resultBruto_operacao, simulation.R);
							}
							new_list[index]['result_bruto']['brl'] += resultBruto_operacao;
							new_list[index]['result_bruto']['S'] += (op_resultBruto_Unitario['result'].brl != 0 ? divide(divide(op_resultBruto_Unitario['result'].brl, list[e].vol), op_resultBruto_Unitario['menor_alvo']) : 0);
							if (simulation.R !== null)
								new_list[index]['result_bruto']['R'] += divide(resultBruto_operacao, simulation.R);
							new_list[index]['result_liquido']['brl'] += resultLiquido_operacao;
							if (simulation.R !== null)
								new_list[index]['result_liquido']['R'] += divide(resultLiquido_operacao, simulation.R);
						}
					}
				}
			}
			//Termina para o ultimo
			if (index > -1)
				new_list[index]['resultado_op'] = (new_list[index]['result_liquido']['brl'] > new_list[index]['custo'] ? 1 : (new_list[index]['result_liquido']['brl'] < new_list[index]['custo'] ? -1 : 0));
		}
		return new_list;
	}
	/*
		Calcula em 'Brl' e 'R' o Resultado, Alvo, Stop de uma operação, dada as infos de 'simulation'.
	*/
	let calculate_op_result = function (op, simulation){
		if (op.gerenciamento_acoes && op.gerenciamento_acoes.length){
			let maior_stop__gerenciamento = Math.min(...op.gerenciamento_acoes),
				menor_alvo_gerenciamento = Math.min(...op.gerenciamento_acoes.filter(v => v > 0)),
				maior_alvo__gerenciamento = Math.max(...op.gerenciamento_acoes);
			return {
				//Resultado com apenas 1 contrato (Sem escalada)
				result: { brl: (op.resultado / (op.cts / (op.escalada + 1))) },
				stop: { brl: op.vol * op.ativo_valor_tick * Math.abs(maior_stop__gerenciamento) },
				stop_c_cts: { brl: op.vol * op.cts * op.ativo_valor_tick * Math.abs(maior_stop__gerenciamento) },
				alvo: { brl: op.vol * op.ativo_valor_tick * Math.abs(maior_alvo__gerenciamento) },
				menor_alvo: menor_alvo_gerenciamento
			}
		}
		else{
			console.log(`A operação não possui ações registrada para o gerenciamento '${op.gerenciamento}'.`);
			return {
				result: { brl: 0 },
				stop: { brl: 0 },
				stop_c_cts: { brl: 0 },
				alvo: { brl: 0 },
				menor_alvo: 0
			}
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
			- banda_superior: Lista que conterá a banda de 'dist_banda' desvio acima da media.
			- banda_inferior: Lista que conterá a banda de 'dist_banda' desvio abaixo da media.
	*/
	let BBollinger = function (obj, min_period = 1, empty_value = NaN, dist_banda = 1, all_bands = false, which_band = 'all'){
		let desv_list = [];
		for (let i_data = 0; i_data < obj['data'].length; i_data++){
			desv_list.push(obj['data'][i_data]);
			if (desv_list.length > min_period){
				let dp_calc = desvpad(desv_list, 'amostra');
				obj['banda_media'].push(dp_calc['media']);
				if (all_bands){
					for (let b = 1; b <= dist_banda; b++){
						if (which_band === 'all' || which_band === 'sup')
							obj[`banda_superior${b}`].push(dp_calc['media'] + (dp_calc['desvpad'] * b));
						if (which_band === 'all' || which_band === 'inf')
							obj[`banda_inferior${b}`].push(dp_calc['media'] - (dp_calc['desvpad'] * b));
					}
				}
				else{
					if (which_band === 'all' || which_band === 'sup')
						obj['banda_superior'].push(dp_calc['media'] + (dp_calc['desvpad'] * dist_banda));
					if (which_band === 'all' || which_band === 'inf')
						obj['banda_inferior'].push(dp_calc['media'] - (dp_calc['desvpad'] * dist_banda));
				}
			}
			else{
				obj['banda_media'].push(empty_value);
				if (all_bands){
					for (let b = 1; b <= dist_banda; b++){
						if (which_band === 'all' || which_band === 'sup')
							obj[`banda_superior${b}`].push(empty_value);
						if (which_band === 'all' || which_band === 'inf')
							obj[`banda_inferior${b}`].push(empty_value);
					}
				}
				else{
					if (which_band === 'all' || which_band === 'sup')
						obj['banda_superior'].push(empty_value);
					if (which_band === 'all' || which_band === 'inf')
						obj['banda_inferior'].push(empty_value);
				}
			}
		}
	}
	/*
		Gera as estatisticas e dados para Gráficos, para a seção de Dashboard Ops em Renda Variável.
		Input:
			- ops: Lista de operações. (Seguira a ordem da lista passada)
			- filters: Filtros a serem aplicados na lista de operações.
			- simulation: Dados de simulação para serem substituidos na lista de operações.
			- options: Opções opcionais a serem passadas para a funcao.
	*/
	let generate__DashboardOps = function (ops = [], filters = {}, simulation = {}, options = {}){
		/*------------------------------------ Vars --------------------------------------*/
		//Opções passadas ao executar o generate
		let _options = {
			get_byCenario: ('get_byCenario' in options) ? options.get_byCenario : true,
			get_graficoData: ('get_graficoData' in options) ? options.get_graficoData : true,
			get_tradeTableData: ('get_tradeTableData' in options) ? options.get_tradeTableData : true,
			only_FilterOps: ('only_FilterOps' in options) ? options.only_FilterOps : false
		}
		//Modifca alguns valores do 'filters' e 'simulation'
		let _filters = {
			data_inicial: ('data_inicial' in filters) ? filters.data_inicial : null,
			data_final: ('data_final' in filters) ? filters.data_final : null,
			hora_inicial: ('hora_inicial' in filters) ? filters.hora_inicial : null,
			hora_final: ('hora_final' in filters) ? filters.hora_final : null,
			ativo: ('ativo' in filters) ? filters.ativo : [],
			gerenciamento: ('gerenciamento' in filters) ? filters.gerenciamento : null,
			cenario: ('cenario' in filters) ? filters.cenario : {},
			observacoes_query_union: ('observacoes_query_union' in filters) ? filters.observacoes_query_union : 'AND'
		};
		let _simulation = {
			periodo_calc: ('periodo_calc' in simulation) ? simulation.periodo_calc : '1',
			tipo_cts: ('tipo_cts' in simulation) ? simulation.tipo_cts : '1',
			cts: ('cts' in simulation) ? simulation.cts : null,
			usa_custo: ('usa_custo' in simulation) ? simulation.usa_custo == 1 : true,
			ignora_erro: ('ignora_erro' in simulation) ? simulation.ignora_erro == 1 : false,
			tipo_parada: ('tipo_parada' in simulation) ? simulation.tipo_parada : [],
			valor_inicial: ('valor_inicial' in simulation) ? parseFloat(simulation.valor_inicial) : null,
			R: ('R' in simulation && simulation.R != 0) ? simulation.R : null,
			R_filter_ops: ('R_filter_ops' in simulation && simulation.R_filter_ops == '1') ? true : false
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
			//Maior sequencia de trades negativos
			trades__max_seq_negativo: 0,
			//Média da sequencia de trades negativos
			trades__max_seq_negativo_medio: 0,
			//Maior sequencia de trades positivos
			trades__max_seq_positivo: 0,
			//Média da sequencia de trades positivos
			trades__max_seq_positivo_medio: 0,
			//Lucro total em R$ das operações
			result__lucro_brl: 0.0,
			//Lucro total em R das operações
			result__lucro_R: 0.0,
			//Lucro total % das operações (Com base em um valor Inicial)
			result__lucro_perc: 0.0,
			//Lucro em Scalps
			result__lucro_S: 0.0,
			//Lucro médio no periodo em R$ das operações
			result__lucro_medio_brl: 0.0,
			//Lucro médio no periodo em R das operações
			result__lucro_medio_R: 0.0,
			//Lucro médio no periodo em % das operações
			result__lucro_medio_perc: 0.0,
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
			//Desvio Padrão em R$ das operações
			stats__dp_brl: 0.0,
			//Desvio Padrão em R das operações
			stats__dp_R: 0.0,
			//Desvio Padrão em % das operações
			stats__dp_perc: 0.0,
			//Risco Retorno médio das operações
			stats__rrMedio: 0.0,
			//Expectativa média em R$ a se esperar em futuras operações
			stats__expect_brl: 0.0,
			//Expectativa média em R a se esperar em futuras operações
			stats__expect_R: 0.0,
			//Expectativa média em % a se esperar em futuras operações
			stats__expect_perc: 0.0,
			//Quantidade total de drawdowns passados
			stats__drawdown_qtd: 0,
			//Drawdown corrente (Caso haja)
			stats__drawdown: 0.0,
			//Periodo do drawdown corrente
			stats__drawdown_periodo: 0,
			//Topo histórico alcançado na lista de operações
			stats__drawdown_topoHistorico: 0.0,
			//Maior drawdown na lista de operações
			stats__drawdown_max: 0.0,
			//Periodo do maior drawdown na lista de operações
			stats__drawdown_max_periodo: 0,
			//Valor corrente para chegar à ruína de (X%)
			stats__ruinaAtual: 0.0,
			//Valor médio da Vol dos trades
			stats__media_vol: 0.0,
			//Valor Inicial informado + resultado liquido
			stats__valorInicial_com_lucro: 0.0,
			//Quantidade de Stops até quebrar o Valor Inicial informado
			stats__stops_ruina: 0
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
				date: [],
				risco: (_simulation.R !== null) ? _simulation.R * (-1) : null
			},
			evolucao_patrimonial: {
				labels: [],
				data: [],
				sma20: [],
				banda_media: [],
				banda_superior: [],
				banda_inferior: [],
				date: []
			},
			resultado_por_hora: {
				labels: [],
				data_result: [],
				data_qtd: []
			},
			sequencia_de_resultados: {
				labels: [],
				data_positivos: [],
				data_negativos: []
			},
			drawdowns: {
				labels: [],
				data: [],
				banda_media: [],
				banda_superior1: [],
				banda_superior2: []
			}
		}
		//Variaveis temporarias usadas em '_dashboard_ops__table_stats'
		let _temp__table_stats = {
			i_seq: 1,
			dias__unicos: {},
			horas__unicas: {},
			lucro_corrente: {brl: 0.0},
			lucro_por_periodo: {},
			mediaGain: 0.0,
			mediaLoss: 0.0,
			lista_resultados: [],
			lista_resultados_R: [],
			sequencias_negativo__index: 0,
			sequencias_negativo: [],
			sequencias_positivo__index: 0,
			sequencias_positivo: [],
			drawdowns: [],
			sorted_drawdowns: [],
			drawdowns_index: 0
		}
		//Variaveis para a tabela de estatistica por cenario
		let _dashboard_ops__table_stats__byCenario = {}
		//Variaveis temporarias usadas em '_dashboard_ops__table_stats__byCenario'
		let _temp__table_stats__byCenario = {}
		let _ops = groupData_byPeriodo(ops, _filters, _simulation, _options);
		if (_options.only_FilterOps){
			return {
				filtered_ops: _ops
			}
		}
		/*----------------------------- Percorre as operações ----------------------------*/
		/*----------------------------------- Por Trade ----------------------------------*/
		if (_simulation.periodo_calc === '1'){
			for (let o in _ops){
				//////////////////////////////////
				//Resultados do Trade
				//////////////////////////////////
				if (_options.get_tradeTableData){
					_dashboard_ops__table_trades.push({
						trade__id: _ops[o].id,
						//Sequencia do trade, na ordem que vem do BD
						trade__seq: _temp__table_stats['i_seq']++,
						//Data do trade
						trade__data: _ops[o].data,
						//Hora do trade
						trade__hora: _ops[o].hora,
						//Cenario do trade
						trade__cenario: _ops[o].cenario,
						//Contratos usados
						trade__cts: _ops[o].cts_usado,
						//Vol do trade
						trade__vol: _ops[o].vol,
						//Tipo da operação
						trade__op: _ops[o].op,
						//Se teve erro na operação
						trade__erro: _ops[o].erro,
						//Retorna a lista de observações do trade
						trade__observacoes: _ops[o].observacoes,
						//Resultado bruto do trade em BRL
						trade__result_bruto__brl: _ops[o].result_bruto['brl'],
						//Custo do trade
						trade__custo: _ops[o].custo,
						//Resultado Liquido do trade em BRL
						trade__result_liquido__brl: _ops[o].result_liquido['brl']
					});
				}
				//////////////////////////////////
				//Estatisticas Gerais
				//////////////////////////////////
				_temp__table_stats['dias__unicos'][_ops[o].data] = null;
				//Para a Vol média
				_dashboard_ops__table_stats['stats__media_vol'] += _ops[o].vol;
				//Para o lucro em S
				_dashboard_ops__table_stats['result__lucro_S'] += _ops[o].result_bruto['S'];
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
					if (_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] === undefined)
						_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] = 0;
					_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']]++;
					//Reinicia a contagem de sequencia negativa
					if (_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] > 0)
						_temp__table_stats['sequencias_negativo__index']++;
				}
				//Se for uma operação 'Negativa'
				else if (_ops[o].resultado_op === -1){
					_dashboard_ops__table_stats['trades__negativo']++;
					_temp__table_stats['mediaLoss'] += _ops[o].result_liquido['brl'];
					if (_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] === undefined)
						_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] = 0;
					_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']]++;
					//Reinicia a contagem de sequencia positiva
					if (_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] > 0)
						_temp__table_stats['sequencias_positivo__index']++;
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
				//Calcula o Lucro por Mes
				let current_month_year = _ops[o].data.split('-');
				current_month_year = `${current_month_year[0]}-${current_month_year[1]}`;
				if (!(current_month_year in _temp__table_stats['lucro_por_periodo']))
					_temp__table_stats['lucro_por_periodo'][current_month_year] = 0.0;
				_temp__table_stats['lucro_por_periodo'][current_month_year] += _ops[o].result_liquido['brl'];
				//Para o Drawdown
				//Atualiza o topo historico
				if (_temp__table_stats['lucro_corrente']['brl'] > _dashboard_ops__table_stats['stats__drawdown_topoHistorico']){
					_dashboard_ops__table_stats['stats__drawdown_topoHistorico'] = _temp__table_stats['lucro_corrente']['brl'];
					_dashboard_ops__table_stats['stats__drawdown'] = 0;
					_dashboard_ops__table_stats['stats__drawdown_periodo'] = 0;
					if (_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] !== undefined)
						_temp__table_stats['drawdowns_index']++;
				}
				//Se estiver abaixo do topo, está em drawdown
				else if (_temp__table_stats['lucro_corrente']['brl'] < _dashboard_ops__table_stats['stats__drawdown_topoHistorico']){
					if (_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] === undefined){
						_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] = {
							brl: 0,
							periodo: 0
						}
						_temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']] = {
							brl: 0,
							periodo: 0
						}
					}
					let lucro__topo_diff = Math.abs(_dashboard_ops__table_stats['stats__drawdown_topoHistorico'] - Math.abs(_temp__table_stats['lucro_corrente']['brl']));
					if (lucro__topo_diff > _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['brl']){
						_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
						_temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
					}
					_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['periodo']++;
					_temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']]['periodo']++;
					_dashboard_ops__table_stats['stats__drawdown'] = lucro__topo_diff;
					_dashboard_ops__table_stats['stats__drawdown_periodo']++;
				}
				//Para o DP
				_temp__table_stats['lista_resultados'].push(_ops[o].result_liquido['brl']);
				if (_simulation['R'] !== null)
					_temp__table_stats['lista_resultados_R'].push(divide(_ops[o].result_liquido['brl'], _simulation['R']));
				//////////////////////////////////
				//Estatisticas para os Gráficos
				//////////////////////////////////
				if (_options.get_graficoData){
					//Para o gráfico de Resultados por Trade
					_dashboard_ops__chart_data['resultados_normalizado']['labels'].push(parseInt(o) + 1);
					_dashboard_ops__chart_data['resultados_normalizado']['data'].push(_ops[o].result_liquido['brl']);
					_dashboard_ops__chart_data['resultados_normalizado']['date'].push(`${Global.convertDate(_ops[o].data)} ${_ops[o].hora}`);
					//Para o gráfico de Evolução Patrimonial
					_dashboard_ops__chart_data['evolucao_patrimonial']['labels'].push(parseInt(o) + 1);
					_dashboard_ops__chart_data['evolucao_patrimonial']['data'].push(_temp__table_stats['lucro_corrente']['brl']);
					_dashboard_ops__chart_data['evolucao_patrimonial']['date'].push(`${Global.convertDate(_ops[o].data)} ${_ops[o].hora}`);
				}
				//////////////////////////////////
				//Estatisticas por Cenario
				//////////////////////////////////
				if (_options.get_byCenario){
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
							result__lucro_S: 0.0,
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
							stats__dp_brl: 0.0,
							stats__dp_R: 0.0,
							stats__dp_perc: 0.0,
							stats__rrMedio: 0.0,
							stats__expect_brl: 0.0,
							stats__expect_R: 0.0,
							stats__expect_perc: 0.0
						};
						_temp__table_stats__byCenario[_ops[o].cenario] = {
							dias__unicos: {},
							lucro_corrente: {brl: 0.0},
							mediaGain: 0.0,
							mediaLoss: 0.0,
							lista_resultados: [],
							lista_resultados_R: []
						}
					}
					_temp__table_stats__byCenario[_ops[o].cenario]['dias__unicos'][_ops[o].data] = null;
					_dashboard_ops__table_stats__byCenario[_ops[o].cenario]['trades__total']++;
					_dashboard_ops__table_stats__byCenario[_ops[o].cenario]['result__lucro_S'] += _ops[o].result_bruto['S'];
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
					_temp__table_stats__byCenario[_ops[o].cenario]['lista_resultados'].push(_ops[o].result_liquido['brl']);
					if (_simulation['R'] !== null)
						_temp__table_stats__byCenario[_ops[o].cenario]['lista_resultados_R'].push(divide(_ops[o].result_liquido['brl'], _simulation['R']));
				}
			}
			/*------------------------ Termina processamento dos Dados -----------------------*/
			//////////////////////////////////
			//Estatisticas Gerais
			//////////////////////////////////
			//Termina de processar estatisticas de '_temp__table_stats'
			_temp__table_stats['mediaGain'] = divide(_temp__table_stats['mediaGain'], (_dashboard_ops__table_stats['trades__positivo'] + _dashboard_ops__table_stats['trades__empate']));
			_temp__table_stats['mediaLoss'] = divide(_temp__table_stats['mediaLoss'], _dashboard_ops__table_stats['trades__negativo']);

			//Termina de processar estatisticas do '_dashboard_ops__table_stats'
			_dashboard_ops__table_stats['dias__total']                    = Object.keys(_temp__table_stats['dias__unicos']).length;

			_dashboard_ops__table_stats['dias__trades_por_dia']           = divide(_ops.length, _dashboard_ops__table_stats['dias__total']);
			_dashboard_ops__table_stats['trades__total']                  = _ops.length;
			_dashboard_ops__table_stats['trades__positivo_perc']          = (divide(_dashboard_ops__table_stats['trades__positivo'], _dashboard_ops__table_stats['trades__total']) * 100);
			_dashboard_ops__table_stats['trades__negativo_perc']          = (divide(_dashboard_ops__table_stats['trades__negativo'], _dashboard_ops__table_stats['trades__total']) * 100);
			_dashboard_ops__table_stats['trades__empate_perc']            = (divide(_dashboard_ops__table_stats['trades__empate'], _dashboard_ops__table_stats['trades__total']) * 100);
			_dashboard_ops__table_stats['trades__max_seq_negativo']       = (_temp__table_stats['sequencias_negativo'].length) ? Math.max(..._temp__table_stats['sequencias_negativo']) : 0;
			_dashboard_ops__table_stats['trades__max_seq_positivo']       = (_temp__table_stats['sequencias_positivo'].length) ? Math.max(..._temp__table_stats['sequencias_positivo']) : 0;
			_dashboard_ops__table_stats['trades__max_seq_negativo_medio'] = (_temp__table_stats['sequencias_negativo'].length) ? divide(_temp__table_stats['sequencias_negativo'].reduce((a, b) => a + b, 0), _temp__table_stats['sequencias_negativo'].length) : 0;
			_dashboard_ops__table_stats['trades__max_seq_positivo_medio'] = (_temp__table_stats['sequencias_positivo'].length) ? divide(_temp__table_stats['sequencias_positivo'].reduce((a, b) => a + b, 0), _temp__table_stats['sequencias_positivo'].length) : 0;

			_dashboard_ops__table_stats['result__lucro_brl']              = _temp__table_stats['lucro_corrente']['brl'];
			_dashboard_ops__table_stats['result__lucro_R']                = (_simulation['R'] !== null) ? divide(_temp__table_stats['lucro_corrente']['brl'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['result__lucro_perc']             = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['lucro_corrente']['brl'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['result__lucro_medio_brl']        = divide(Object.values(_temp__table_stats['lucro_por_periodo']).reduce((a, b) => a + b, 0), Object.keys(_temp__table_stats['lucro_por_periodo']).length);
			_dashboard_ops__table_stats['result__lucro_medio_R']          = (_simulation['R'] !== null) ? divide(_dashboard_ops__table_stats['result__lucro_medio_brl'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['result__lucro_medio_perc']       = (_simulation['valor_inicial'] !== null) ? (divide(_dashboard_ops__table_stats['result__lucro_medio_brl'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['result__mediaGain_brl']          = _temp__table_stats['mediaGain'];
			_dashboard_ops__table_stats['result__mediaLoss_brl']          = _temp__table_stats['mediaLoss'];
			_dashboard_ops__table_stats['result__mediaGain_R'] 	          = (_simulation['R'] !== null) ? divide(_temp__table_stats['mediaGain'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['result__mediaLoss_R']            = (_simulation['R'] !== null) ? divide(_temp__table_stats['mediaLoss'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['result__mediaGain_perc']         = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaGain'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['result__mediaLoss_perc']         = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaLoss'], _simulation['valor_inicial']) * 100) : '--';

			_dashboard_ops__table_stats['stats__rrMedio']                 = divide(_temp__table_stats['mediaGain'], Math.abs(_temp__table_stats['mediaLoss']));
			_dashboard_ops__table_stats['stats__breakeven']               = (divide(Math.abs(_temp__table_stats['mediaLoss']), (_temp__table_stats['mediaGain'] + Math.abs(_temp__table_stats['mediaLoss']))) * 100);
			_dashboard_ops__table_stats['stats__edge']                    = _dashboard_ops__table_stats['trades__positivo_perc'] - _dashboard_ops__table_stats['stats__breakeven'];
			_dashboard_ops__table_stats['stats__fatorLucro']              = divide((_dashboard_ops__table_stats['trades__positivo_perc'] * _temp__table_stats['mediaGain']), (_dashboard_ops__table_stats['trades__negativo_perc'] * _temp__table_stats['mediaLoss']));
			_dashboard_ops__table_stats['stats__expect_brl']              = divide(_temp__table_stats['lucro_corrente']['brl'], _dashboard_ops__table_stats['trades__total']);
			_dashboard_ops__table_stats['stats__expect_R']                = (_simulation['R'] !== null) ? divide(_dashboard_ops__table_stats['stats__expect_brl'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['stats__expect_perc']             = (_simulation['valor_inicial'] !== null) ? (divide(_dashboard_ops__table_stats['stats__expect_brl'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['stats__dp_brl']                  = desvpad(_temp__table_stats['lista_resultados'])['desvpad'];
			_dashboard_ops__table_stats['stats__dp_R']                    = (_simulation['R'] !== null) ? desvpad(_temp__table_stats['lista_resultados_R'])['desvpad'] : '--';
			_dashboard_ops__table_stats['stats__dp_perc']                 = (_simulation['valor_inicial'] !== null) ? (divide(_dashboard_ops__table_stats['stats__dp_brl'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['stats__sqn']                     = (_simulation['R'] !== null) ? (divide(_dashboard_ops__table_stats['stats__expect_R'], _dashboard_ops__table_stats['stats__dp_R']) * Math.sqrt(_dashboard_ops__table_stats['trades__total'])) : '--';
			_dashboard_ops__table_stats['stats__media_vol']               = divide(_dashboard_ops__table_stats['stats__media_vol'], _dashboard_ops__table_stats['trades__total']);
			_dashboard_ops__table_stats['stats__valorInicial_com_lucro']  = (_simulation['valor_inicial'] !== null) ? (_simulation['valor_inicial'] + _temp__table_stats['lucro_corrente']['brl']) : '--';
			_dashboard_ops__table_stats['stats__stops_ruina']             = (_simulation['valor_inicial'] !== null && _simulation['R'] !== null) ? Math.floor(divide(_dashboard_ops__table_stats['stats__valorInicial_com_lucro'], _simulation['R'])) : '--';

			_temp__table_stats['sorted_drawdowns'].sort((a, b) => a.brl - b.brl);

			_dashboard_ops__table_stats['stats__drawdown_qtd']            = _temp__table_stats['drawdowns'].length;
			_dashboard_ops__table_stats['stats__drawdown_max']            = (_temp__table_stats['sorted_drawdowns'].length) ? _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns'].length-1]['brl'] : 0.0;
			_dashboard_ops__table_stats['stats__drawdown_max_periodo']    = (_temp__table_stats['sorted_drawdowns'].length) ? _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns'].length-1]['periodo'] : 0.0;

			_dashboard_ops__table_stats['trades__erro']                   = ((!_simulation.ignora_erro) ? _dashboard_ops__table_stats['trades__erro'] : '--');
			_dashboard_ops__table_stats['trades__erro_perc']              = ((!_simulation.ignora_erro) ? (divide(_dashboard_ops__table_stats['trades__erro'], _dashboard_ops__table_stats['trades__total']) * 100) : '--');
			
			//////////////////////////////////
			//Estatisticas por Cenario
			//////////////////////////////////
			if (_options.get_byCenario){
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
					_dashboard_ops__table_stats__byCenario[cenario]['result__lucro_R']        = (_simulation['R'] !== null) ? divide(_temp__table_stats__byCenario[cenario]['lucro_corrente']['brl'], _simulation['R']) : '--';
					_dashboard_ops__table_stats__byCenario[cenario]['result__lucro_perc']     = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats__byCenario[cenario]['lucro_corrente']['brl'], _simulation['valor_inicial']) * 100) : '--';
					_dashboard_ops__table_stats__byCenario[cenario]['result__mediaGain_brl']  = _temp__table_stats__byCenario[cenario]['mediaGain'];
					_dashboard_ops__table_stats__byCenario[cenario]['result__mediaLoss_brl']  = _temp__table_stats__byCenario[cenario]['mediaLoss'];
					_dashboard_ops__table_stats__byCenario[cenario]['result__mediaGain_R'] 	  = (_simulation['R'] !== null) ? divide(_temp__table_stats__byCenario[cenario]['mediaGain'], _simulation['R']) : '--';
					_dashboard_ops__table_stats__byCenario[cenario]['result__mediaLoss_R']    = (_simulation['R'] !== null) ? divide(_temp__table_stats__byCenario[cenario]['mediaLoss'], _simulation['R']) : '--';
					_dashboard_ops__table_stats__byCenario[cenario]['result__mediaGain_perc'] = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats__byCenario[cenario]['mediaGain'], _simulation['valor_inicial']) * 100) : '--';
					_dashboard_ops__table_stats__byCenario[cenario]['result__mediaLoss_perc'] = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats__byCenario[cenario]['mediaLoss'], _simulation['valor_inicial']) * 100) : '--';

					_dashboard_ops__table_stats__byCenario[cenario]['stats__rrMedio']         = divide(_temp__table_stats__byCenario[cenario]['mediaGain'], Math.abs(_temp__table_stats__byCenario[cenario]['mediaLoss']));
					_dashboard_ops__table_stats__byCenario[cenario]['stats__breakeven']       = (divide(Math.abs(_temp__table_stats__byCenario[cenario]['mediaLoss']), (_temp__table_stats__byCenario[cenario]['mediaGain'] + Math.abs(_temp__table_stats__byCenario[cenario]['mediaLoss']))) * 100);
					_dashboard_ops__table_stats__byCenario[cenario]['stats__edge']            = _dashboard_ops__table_stats__byCenario[cenario]['trades__positivo_perc'] - _dashboard_ops__table_stats__byCenario[cenario]['stats__breakeven'];
					_dashboard_ops__table_stats__byCenario[cenario]['stats__fatorLucro']      = divide((_dashboard_ops__table_stats__byCenario[cenario]['trades__positivo_perc'] * _temp__table_stats__byCenario[cenario]['mediaGain']), (_dashboard_ops__table_stats__byCenario[cenario]['trades__negativo_perc'] * _temp__table_stats__byCenario[cenario]['mediaLoss']));
					_dashboard_ops__table_stats__byCenario[cenario]['stats__expect_brl']      = divide(_temp__table_stats__byCenario[cenario]['lucro_corrente']['brl'], _dashboard_ops__table_stats__byCenario[cenario]['trades__total']);
					_dashboard_ops__table_stats__byCenario[cenario]['stats__expect_R']        = (_simulation['R'] !== null) ? divide(_dashboard_ops__table_stats__byCenario[cenario]['stats__expect_brl'], _simulation['R']) : '--';
					_dashboard_ops__table_stats__byCenario[cenario]['stats__expect_perc']     = (_simulation['valor_inicial'] !== null) ? (divide(_dashboard_ops__table_stats__byCenario[cenario]['stats__expect_brl'], _simulation['valor_inicial']) * 100) : '--';
					_dashboard_ops__table_stats__byCenario[cenario]['stats__dp_brl']          = desvpad(_temp__table_stats__byCenario[cenario]['lista_resultados'])['desvpad'];
					_dashboard_ops__table_stats__byCenario[cenario]['stats__dp_R']            = (_simulation['R'] !== null) ? desvpad(_temp__table_stats__byCenario[cenario]['lista_resultados_R'])['desvpad'] : '--';
					_dashboard_ops__table_stats__byCenario[cenario]['stats__dp_perc']         = (_simulation['valor_inicial'] !== null) ? (divide(_dashboard_ops__table_stats__byCenario[cenario]['stats__dp_brl'], _simulation['valor_inicial']) * 100) : '--';
					_dashboard_ops__table_stats__byCenario[cenario]['stats__sqn']             = (_simulation['R'] !== null) ? (divide(_dashboard_ops__table_stats__byCenario[cenario]['stats__expect_R'], _dashboard_ops__table_stats__byCenario[cenario]['stats__dp_R']) * Math.sqrt(_dashboard_ops__table_stats__byCenario[cenario]['trades__total'])) : '--';
					
					_dashboard_ops__table_stats__byCenario[cenario]['trades__erro']           = ((!_simulation.ignora_erro) ? _dashboard_ops__table_stats__byCenario[cenario]['trades__erro'] : '--');
					_dashboard_ops__table_stats__byCenario[cenario]['trades__erro_perc']      = ((!_simulation.ignora_erro) ? (divide(_dashboard_ops__table_stats__byCenario[cenario]['trades__erro'], _dashboard_ops__table_stats__byCenario[cenario]['trades__total']) * 100) : '--');
				}
			}

			//////////////////////////////////
			//Estatisticas para os Gráficos
			//////////////////////////////////
			if (_options.get_graficoData){
				//////////////////////////////////
				//Gráfico de Evolução Patrimonial
				//////////////////////////////////
				//Média móvel simples da evolução patrimonial
				SMA(_dashboard_ops__chart_data['evolucao_patrimonial']['data'], _dashboard_ops__chart_data['evolucao_patrimonial']['sma20'], 20);
				//2 Bandas de Desvio Padrão
				BBollinger(_dashboard_ops__chart_data['evolucao_patrimonial'], 1, NaN, 2);
				//////////////////////////////////
				//Gráfico de Resultados Normalizados
				//////////////////////////////////
				//Gráfico de barras dos resultados + bandas superior e inferior do desvio padrao + linha de risco
				BBollinger(_dashboard_ops__chart_data['resultados_normalizado'], 1, NaN, 1);
				//////////////////////////////////
				//Gráfico de Resultados por Hora
				//////////////////////////////////
				let sorted_horas__unicas = Object.keys(_temp__table_stats['horas__unicas']).sort();
				for (let h = 0; h < sorted_horas__unicas.length; h++){
					_dashboard_ops__chart_data['resultado_por_hora']['labels'].push(sorted_horas__unicas[h]);
					_dashboard_ops__chart_data['resultado_por_hora']['data_result'].push(_temp__table_stats['horas__unicas'][sorted_horas__unicas[h]]['result']);
					_dashboard_ops__chart_data['resultado_por_hora']['data_qtd'].push(_temp__table_stats['horas__unicas'][sorted_horas__unicas[h]]['qtd']);
				}
				//////////////////////////////////
				//Gráfico Sequencia de Result.
				//////////////////////////////////
				let sequencia_sep_counter = {},
					sequencia_sep_counter__max_key = 0;
				for (let s = 0; s < _temp__table_stats['sequencias_positivo'].length; s++){
					if (!(_temp__table_stats['sequencias_positivo'][s] in sequencia_sep_counter))
						sequencia_sep_counter[_temp__table_stats['sequencias_positivo'][s]] = 0;
					sequencia_sep_counter[_temp__table_stats['sequencias_positivo'][s]]++;
				}
				sequencia_sep_counter__max_key = Math.max(...Object.keys(sequencia_sep_counter));
				for (let s = 1; s <= sequencia_sep_counter__max_key; s++){
					if (s in sequencia_sep_counter)
						_dashboard_ops__chart_data['sequencia_de_resultados']['data_positivos'].push(sequencia_sep_counter[s]);
					else
						_dashboard_ops__chart_data['sequencia_de_resultados']['data_positivos'].push(0);
				}
				sequencia_sep_counter = {};
				sequencia_sep_counter__max_key = 0;
				for (let s = 0; s < _temp__table_stats['sequencias_negativo'].length; s++){
					if (!(_temp__table_stats['sequencias_negativo'][s] in sequencia_sep_counter))
						sequencia_sep_counter[_temp__table_stats['sequencias_negativo'][s]] = 0;
					sequencia_sep_counter[_temp__table_stats['sequencias_negativo'][s]]++;
				}
				sequencia_sep_counter__max_key = Math.max(...Object.keys(sequencia_sep_counter));
				for (let s = 1; s <= sequencia_sep_counter__max_key; s++){
					if (s in sequencia_sep_counter)
						_dashboard_ops__chart_data['sequencia_de_resultados']['data_negativos'].push(sequencia_sep_counter[s] * -1);
					else
						_dashboard_ops__chart_data['sequencia_de_resultados']['data_negativos'].push(0);
				}
				_dashboard_ops__chart_data['sequencia_de_resultados']['labels'] = (_dashboard_ops__chart_data['sequencia_de_resultados']['data_positivos'].length > _dashboard_ops__chart_data['sequencia_de_resultados']['data_negativos'].length) ? Object.keys(_dashboard_ops__chart_data['sequencia_de_resultados']['data_positivos']).map(o => parseInt(o) + 1) : Object.keys(_dashboard_ops__chart_data['sequencia_de_resultados']['data_negativos']).map(o => parseInt(o) + 1);
				//////////////////////////////////
				//Gráfico Historico de Drawdowns 
				//////////////////////////////////
				_dashboard_ops__chart_data['drawdowns']['data'] = _temp__table_stats['drawdowns'].map(o => o.brl);
				_dashboard_ops__chart_data['drawdowns']['labels'] = Object.keys(_dashboard_ops__chart_data['drawdowns']['data']).map(o => parseInt(o) + 1);
				BBollinger(_dashboard_ops__chart_data['drawdowns'], 1, NaN, 2, true, 'sup');
				//////////////////////////////////
				//Enche o dataset base com vazio para regular o zoom dos graficos com poucos elementos
				//////////////////////////////////
				if (_dashboard_ops__chart_data['evolucao_patrimonial']['labels'].length < 150){
					let diff_to_fill = 150 - _dashboard_ops__chart_data['evolucao_patrimonial']['labels'].length;
					for (let es=0; es<diff_to_fill; es++)
						_dashboard_ops__chart_data['evolucao_patrimonial']['labels'].push('');
				}
				if (_dashboard_ops__chart_data['resultados_normalizado']['labels'].length < 50){
					let diff_to_fill = 50 - _dashboard_ops__chart_data['resultados_normalizado']['labels'].length;
					for (let es=0; es<diff_to_fill; es++)
						_dashboard_ops__chart_data['resultados_normalizado']['labels'].push('');
				}
				if (_dashboard_ops__chart_data['resultado_por_hora']['labels'].length < 10){
					let diff_to_fill = 10 - _dashboard_ops__chart_data['resultado_por_hora']['labels'].length;
					for (let es=0; es<diff_to_fill; es++)
						_dashboard_ops__chart_data['resultado_por_hora']['labels'].push('');
				}
				if (_dashboard_ops__chart_data['sequencia_de_resultados']['labels'].length < 10){
					let diff_to_fill = 10 - _dashboard_ops__chart_data['sequencia_de_resultados']['labels'].length;
					for (let es=0; es<diff_to_fill; es++)
						_dashboard_ops__chart_data['sequencia_de_resultados']['labels'].push('');
				}
				if (_dashboard_ops__chart_data['drawdowns']['labels'].length < 10){
					let diff_to_fill = 10 - _dashboard_ops__chart_data['drawdowns']['labels'].length;
					for (let es=0; es<diff_to_fill; es++)
						_dashboard_ops__chart_data['drawdowns']['labels'].push('');
				}
			}
			/*------------------------------- Retorno dos Dados ------------------------------*/
			return {
				dashboard_ops__table_stats: _dashboard_ops__table_stats,
				dashboard_ops__table_stats__byCenario: _dashboard_ops__table_stats__byCenario,
				dashboard_ops__table_trades: _dashboard_ops__table_trades,
				dashboard_ops__chart_data: _dashboard_ops__chart_data
			}
		}
		/*------------------------------------ Por Dia -----------------------------------*/
		else if (_simulation.periodo_calc === '2'){
			for (let o in _ops){
				//////////////////////////////////
				//Resultados do Trade
				//////////////////////////////////
				if (_options.get_tradeTableData){
					_dashboard_ops__table_trades.push({
						//Sequencia do trade, na ordem que vem do BD
						dia__seq: _temp__table_stats['i_seq']++,
						//Data do trade
						dia__data: _ops[o].data,
						//Contratos usados
						dia__cts: _ops[o].cts_usado,
						//Trades feitos no dia
						dia__qtd_trades: _ops[o].qtd_trades,
						//Media de Vol no dia
						dia__vol_media: divide(_ops[o].vol_total, _ops[o].qtd_trades),
						//Se houve erro no dia
						dia__erro: _ops[o].erro,
						//Resultado bruto do dia em S
						dia__result_bruto__S: _ops[o].result_bruto['S'],
						//Lucro bruto do dia em BRL
						dia__lucro_bruto__brl: _ops[o].lucro_bruto['brl'],
						//Prejuizo bruto do dia em BRL
						dia__prejuizo_bruto__brl: _ops[o].prejuizo_bruto['brl'],
						//Resultado bruto do dia em BRL
						dia__result_bruto__brl: _ops[o].result_bruto['brl'],
						//Custo do trade
						dia__custo: _ops[o].custo,
						//Resultado Liquido do dia em BRL
						dia__result_liquido__brl: _ops[o].result_liquido['brl']
					});
				}
				//////////////////////////////////
				//Estatisticas Gerais
				//////////////////////////////////
				let day_of_week = moment(_ops[o].data).weekday();
				if (!(day_of_week in _temp__table_stats['horas__unicas']))
					_temp__table_stats['horas__unicas'][day_of_week] = { result: 0.0, qtd: 0 };
				_temp__table_stats['horas__unicas'][day_of_week]['result'] += _ops[o].result_liquido['brl'];
				_temp__table_stats['horas__unicas'][day_of_week]['qtd']++;
				//Para o lucro em S
				_dashboard_ops__table_stats['result__lucro_S'] += _ops[o].result_bruto['S'];
				//Se for uma operação 'Positiva'
				if (_ops[o].resultado_op === 1){
					_dashboard_ops__table_stats['trades__positivo']++;
					_temp__table_stats['mediaGain'] += _ops[o].result_liquido['brl'];
					if (_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] === undefined)
						_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] = 0;
					_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']]++;
					//Reinicia a contagem de sequencia negativa
					if (_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] > 0)
						_temp__table_stats['sequencias_negativo__index']++;
				}
				//Se for uma operação 'Negativa'
				else if (_ops[o].resultado_op === -1){
					_dashboard_ops__table_stats['trades__negativo']++;
					_temp__table_stats['mediaLoss'] += _ops[o].result_liquido['brl'];
					if (_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] === undefined)
						_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] = 0;
					_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']]++;
					//Reinicia a contagem de sequencia positiva
					if (_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] > 0)
						_temp__table_stats['sequencias_positivo__index']++;
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
				//Calcula o Lucro por Mes
				let current_month_year = _ops[o].data.split('-');
				current_month_year = `${current_month_year[0]}-${current_month_year[1]}`;
				if (!(current_month_year in _temp__table_stats['lucro_por_periodo']))
					_temp__table_stats['lucro_por_periodo'][current_month_year] = 0.0;
				_temp__table_stats['lucro_por_periodo'][current_month_year] += _ops[o].result_liquido['brl'];
				//Para o Drawdown
				//Atualiza o topo historico
				if (_temp__table_stats['lucro_corrente']['brl'] > _dashboard_ops__table_stats['stats__drawdown_topoHistorico']){
					_dashboard_ops__table_stats['stats__drawdown_topoHistorico'] = _temp__table_stats['lucro_corrente']['brl'];
					_dashboard_ops__table_stats['stats__drawdown'] = 0;
					_dashboard_ops__table_stats['stats__drawdown_periodo'] = 0;
					if (_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] !== undefined)
						_temp__table_stats['drawdowns_index']++;
				}
				//Se estiver abaixo do topo, está em drawdown
				else if (_temp__table_stats['lucro_corrente']['brl'] < _dashboard_ops__table_stats['stats__drawdown_topoHistorico']){
					if (_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] === undefined){
						_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] = {
							brl: 0,
							periodo: 0
						}
						_temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']] = {
							brl: 0,
							periodo: 0
						}
					}
					let lucro__topo_diff = Math.abs(_dashboard_ops__table_stats['stats__drawdown_topoHistorico'] - Math.abs(_temp__table_stats['lucro_corrente']['brl']));
					if (lucro__topo_diff > _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['brl']){
						_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
						_temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
					}
					_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['periodo']++;
					_temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']]['periodo']++;
					_dashboard_ops__table_stats['stats__drawdown'] = lucro__topo_diff;
					_dashboard_ops__table_stats['stats__drawdown_periodo']++;
				}
				//Para o DP
				_temp__table_stats['lista_resultados'].push(_ops[o].result_liquido['brl']);
				if (_simulation['R'] !== null)
					_temp__table_stats['lista_resultados_R'].push(divide(_ops[o].result_liquido['brl'], _simulation['R']));
				//////////////////////////////////
				//Estatisticas para os Gráficos
				//////////////////////////////////
				if (_options.get_graficoData){
					//Para o gráfico de Resultados por Trade
					_dashboard_ops__chart_data['resultados_normalizado']['labels'].push(parseInt(o) + 1);
					_dashboard_ops__chart_data['resultados_normalizado']['data'].push(_ops[o].result_liquido['brl']);
					_dashboard_ops__chart_data['resultados_normalizado']['date'].push(`${Global.convertDate(_ops[o].data)} Trades: ${_ops[o].qtd_trades}`);
					//Para o gráfico de Evolução Patrimonial
					_dashboard_ops__chart_data['evolucao_patrimonial']['labels'].push(parseInt(o) + 1);
					_dashboard_ops__chart_data['evolucao_patrimonial']['data'].push(_temp__table_stats['lucro_corrente']['brl']);
					_dashboard_ops__chart_data['evolucao_patrimonial']['date'].push(`${Global.convertDate(_ops[o].data)} Trades: ${_ops[o].qtd_trades}`);
				}
			}
			/*------------------------ Termina processamento dos Dados -----------------------*/
			//////////////////////////////////
			//Estatisticas Gerais
			//////////////////////////////////
			//Termina de processar estatisticas de '_temp__table_stats'
			_temp__table_stats['mediaGain'] = divide(_temp__table_stats['mediaGain'], (_dashboard_ops__table_stats['trades__positivo'] + _dashboard_ops__table_stats['trades__empate']));
			_temp__table_stats['mediaLoss'] = divide(_temp__table_stats['mediaLoss'], _dashboard_ops__table_stats['trades__negativo']);

			//Termina de processar estatisticas do '_dashboard_ops__table_stats'

			// _dashboard_ops__table_stats['dias__trades_por_dia']   = divide(_ops.length, _dashboard_ops__table_stats['dias__total']);
			_dashboard_ops__table_stats['trades__total']                  = _ops.length;

			_dashboard_ops__table_stats['trades__positivo_perc']          = (divide(_dashboard_ops__table_stats['trades__positivo'], _dashboard_ops__table_stats['trades__total']) * 100);
			_dashboard_ops__table_stats['trades__negativo_perc']          = (divide(_dashboard_ops__table_stats['trades__negativo'], _dashboard_ops__table_stats['trades__total']) * 100);
			_dashboard_ops__table_stats['trades__empate_perc']            = (divide(_dashboard_ops__table_stats['trades__empate'], _dashboard_ops__table_stats['trades__total']) * 100);
			_dashboard_ops__table_stats['trades__max_seq_negativo']       = (_temp__table_stats['sequencias_negativo'].length) ? Math.max(..._temp__table_stats['sequencias_negativo']) : 0;
			_dashboard_ops__table_stats['trades__max_seq_positivo']       = (_temp__table_stats['sequencias_positivo'].length) ? Math.max(..._temp__table_stats['sequencias_positivo']) : 0;
			_dashboard_ops__table_stats['trades__max_seq_negativo_medio'] = (_temp__table_stats['sequencias_negativo'].length) ? divide(_temp__table_stats['sequencias_negativo'].reduce((a, b) => a + b, 0), _temp__table_stats['sequencias_negativo'].length) : 0;
			_dashboard_ops__table_stats['trades__max_seq_positivo_medio'] = (_temp__table_stats['sequencias_positivo'].length) ? divide(_temp__table_stats['sequencias_positivo'].reduce((a, b) => a + b, 0), _temp__table_stats['sequencias_positivo'].length) : 0;

			_dashboard_ops__table_stats['result__lucro_brl']              = _temp__table_stats['lucro_corrente']['brl'];
			_dashboard_ops__table_stats['result__lucro_R']                = (_simulation['R'] !== null) ? divide(_temp__table_stats['lucro_corrente']['brl'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['result__lucro_perc']             = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['lucro_corrente']['brl'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['result__lucro_medio_brl']        = divide(Object.values(_temp__table_stats['lucro_por_periodo']).reduce((a, b) => a + b, 0), Object.keys(_temp__table_stats['lucro_por_periodo']).length);
			_dashboard_ops__table_stats['result__lucro_medio_R']          = (_simulation['R'] !== null) ? divide(_dashboard_ops__table_stats['result__lucro_medio_brl'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['result__lucro_medio_perc']       = (_simulation['valor_inicial'] !== null) ? (divide(_dashboard_ops__table_stats['result__lucro_medio_brl'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['result__mediaGain_brl']          = _temp__table_stats['mediaGain'];
			_dashboard_ops__table_stats['result__mediaLoss_brl']          = _temp__table_stats['mediaLoss'];
			_dashboard_ops__table_stats['result__mediaGain_R'] 	          = (_simulation['R'] !== null) ? divide(_temp__table_stats['mediaGain'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['result__mediaLoss_R']            = (_simulation['R'] !== null) ? divide(_temp__table_stats['mediaLoss'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['result__mediaGain_perc']         = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaGain'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['result__mediaLoss_perc']         = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaLoss'], _simulation['valor_inicial']) * 100) : '--';

			_dashboard_ops__table_stats['stats__rrMedio']                 = divide(_temp__table_stats['mediaGain'], Math.abs(_temp__table_stats['mediaLoss']));
			_dashboard_ops__table_stats['stats__breakeven']               = (divide(Math.abs(_temp__table_stats['mediaLoss']), (_temp__table_stats['mediaGain'] + Math.abs(_temp__table_stats['mediaLoss']))) * 100);
			_dashboard_ops__table_stats['stats__edge']                    = _dashboard_ops__table_stats['trades__positivo_perc'] - _dashboard_ops__table_stats['stats__breakeven'];
			_dashboard_ops__table_stats['stats__fatorLucro']              = divide((_dashboard_ops__table_stats['trades__positivo_perc'] * _temp__table_stats['mediaGain']), (_dashboard_ops__table_stats['trades__negativo_perc'] * _temp__table_stats['mediaLoss']));
			_dashboard_ops__table_stats['stats__expect_brl']              = divide(_temp__table_stats['lucro_corrente']['brl'], _dashboard_ops__table_stats['trades__total']);
			_dashboard_ops__table_stats['stats__expect_R']                = (_simulation['R'] !== null) ? divide(_dashboard_ops__table_stats['stats__expect_brl'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['stats__expect_perc']             = (_simulation['valor_inicial'] !== null) ? (divide(_dashboard_ops__table_stats['stats__expect_brl'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['stats__dp_brl']                  = desvpad(_temp__table_stats['lista_resultados'])['desvpad'];
			_dashboard_ops__table_stats['stats__dp_R']                    = (_simulation['R'] !== null) ? desvpad(_temp__table_stats['lista_resultados_R'])['desvpad'] : '--';
			_dashboard_ops__table_stats['stats__dp_perc']                 = (_simulation['valor_inicial'] !== null) ? (divide(_dashboard_ops__table_stats['stats__dp_brl'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['stats__sqn']                     = (_simulation['R'] !== null) ? (divide(_dashboard_ops__table_stats['stats__expect_R'], _dashboard_ops__table_stats['stats__dp_R']) * Math.sqrt(_dashboard_ops__table_stats['trades__total'])) : '--';
			_dashboard_ops__table_stats['stats__media_vol']               = '--';
			_dashboard_ops__table_stats['stats__valorInicial_com_lucro']  = (_simulation['valor_inicial'] !== null) ? (_simulation['valor_inicial'] + _temp__table_stats['lucro_corrente']['brl']) : '--';
			_dashboard_ops__table_stats['stats__stops_ruina']             = (_simulation['valor_inicial'] !== null && _simulation['R'] !== null) ? Math.floor(divide(_dashboard_ops__table_stats['stats__valorInicial_com_lucro'], _simulation['R'])) : '--';

			_temp__table_stats['sorted_drawdowns'].sort((a, b) => a.brl - b.brl);

			_dashboard_ops__table_stats['stats__drawdown_qtd']            = _temp__table_stats['drawdowns'].length;
			_dashboard_ops__table_stats['stats__drawdown_max']            = (_temp__table_stats['sorted_drawdowns'].length) ? _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns'].length-1]['brl'] : 0.0;
			_dashboard_ops__table_stats['stats__drawdown_max_periodo']    = (_temp__table_stats['sorted_drawdowns'].length) ? _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns'].length-1]['periodo'] : 0.0;

			_dashboard_ops__table_stats['trades__erro']                   = ((!_simulation.ignora_erro) ? _dashboard_ops__table_stats['trades__erro'] : '--');
			_dashboard_ops__table_stats['trades__erro_perc']              = ((!_simulation.ignora_erro) ? (divide(_dashboard_ops__table_stats['trades__erro'], _dashboard_ops__table_stats['trades__total']) * 100) : '--');
			
			//////////////////////////////////
			//Estatisticas para os Gráficos
			//////////////////////////////////
			if (_options.get_graficoData){
				//////////////////////////////////
				//Gráfico de Evolução Patrimonial
				//////////////////////////////////
				//Média móvel simples da evolução patrimonial
				SMA(_dashboard_ops__chart_data['evolucao_patrimonial']['data'], _dashboard_ops__chart_data['evolucao_patrimonial']['sma20'], 20);
				//2 Bandas de Desvio Padrão
				BBollinger(_dashboard_ops__chart_data['evolucao_patrimonial'], 1, NaN, 2);
				//////////////////////////////////
				//Gráfico de Resultados Normalizados
				//////////////////////////////////
				//Gráfico de barras dos resultados + bandas superior e inferior do desvio padrao + linha de risco
				BBollinger(_dashboard_ops__chart_data['resultados_normalizado'], 1, NaN, 1);
				//////////////////////////////////
				//Gráfico de Resultados por Hora
				//////////////////////////////////
				let days_of_week = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'],
					sorted_horas__unicas = Object.keys(_temp__table_stats['horas__unicas']).sort();
				for (let h = 0; h < sorted_horas__unicas.length; h++){
					_dashboard_ops__chart_data['resultado_por_hora']['labels'].push(days_of_week[sorted_horas__unicas[h]]);
					_dashboard_ops__chart_data['resultado_por_hora']['data_result'].push(_temp__table_stats['horas__unicas'][sorted_horas__unicas[h]]['result']);
					_dashboard_ops__chart_data['resultado_por_hora']['data_qtd'].push(_temp__table_stats['horas__unicas'][sorted_horas__unicas[h]]['qtd']);
				}
				//////////////////////////////////
				//Gráfico Sequencia de Result.
				//////////////////////////////////
				let sequencia_sep_counter = {},
					sequencia_sep_counter__max_key = 0;
				for (let s = 0; s < _temp__table_stats['sequencias_positivo'].length; s++){
					if (!(_temp__table_stats['sequencias_positivo'][s] in sequencia_sep_counter))
						sequencia_sep_counter[_temp__table_stats['sequencias_positivo'][s]] = 0;
					sequencia_sep_counter[_temp__table_stats['sequencias_positivo'][s]]++;
				}
				sequencia_sep_counter__max_key = Math.max(...Object.keys(sequencia_sep_counter));
				for (let s = 1; s <= sequencia_sep_counter__max_key; s++){
					if (s in sequencia_sep_counter)
						_dashboard_ops__chart_data['sequencia_de_resultados']['data_positivos'].push(sequencia_sep_counter[s]);
					else
						_dashboard_ops__chart_data['sequencia_de_resultados']['data_positivos'].push(0);
				}
				sequencia_sep_counter = {};
				sequencia_sep_counter__max_key = 0;
				for (let s = 0; s < _temp__table_stats['sequencias_negativo'].length; s++){
					if (!(_temp__table_stats['sequencias_negativo'][s] in sequencia_sep_counter))
						sequencia_sep_counter[_temp__table_stats['sequencias_negativo'][s]] = 0;
					sequencia_sep_counter[_temp__table_stats['sequencias_negativo'][s]]++;
				}
				sequencia_sep_counter__max_key = Math.max(...Object.keys(sequencia_sep_counter));
				for (let s = 1; s <= sequencia_sep_counter__max_key; s++){
					if (s in sequencia_sep_counter)
						_dashboard_ops__chart_data['sequencia_de_resultados']['data_negativos'].push(sequencia_sep_counter[s] * -1);
					else
						_dashboard_ops__chart_data['sequencia_de_resultados']['data_negativos'].push(0);
				}
				_dashboard_ops__chart_data['sequencia_de_resultados']['labels'] = (_dashboard_ops__chart_data['sequencia_de_resultados']['data_positivos'].length > _dashboard_ops__chart_data['sequencia_de_resultados']['data_negativos'].length) ? Object.keys(_dashboard_ops__chart_data['sequencia_de_resultados']['data_positivos']).map(o => parseInt(o) + 1) : Object.keys(_dashboard_ops__chart_data['sequencia_de_resultados']['data_negativos']).map(o => parseInt(o) + 1);
				//////////////////////////////////
				//Gráfico Historico de Drawdowns 
				//////////////////////////////////
				_dashboard_ops__chart_data['drawdowns']['data'] = _temp__table_stats['drawdowns'].map(o => o.brl);
				_dashboard_ops__chart_data['drawdowns']['labels'] = Object.keys(_dashboard_ops__chart_data['drawdowns']['data']).map(o => parseInt(o) + 1);
				BBollinger(_dashboard_ops__chart_data['drawdowns'], 1, NaN, 2, true, 'sup');
				//////////////////////////////////
				//Enche o dataset base com vazio para regular o zoom dos graficos com poucos elementos
				//////////////////////////////////
				if (_dashboard_ops__chart_data['evolucao_patrimonial']['labels'].length < 150){
					let diff_to_fill = 150 - _dashboard_ops__chart_data['evolucao_patrimonial']['labels'].length;
					for (let es=0; es<diff_to_fill; es++)
						_dashboard_ops__chart_data['evolucao_patrimonial']['labels'].push('');
				}
				if (_dashboard_ops__chart_data['resultados_normalizado']['labels'].length < 50){
					let diff_to_fill = 50 - _dashboard_ops__chart_data['resultados_normalizado']['labels'].length;
					for (let es=0; es<diff_to_fill; es++)
						_dashboard_ops__chart_data['resultados_normalizado']['labels'].push('');
				}
				if (_dashboard_ops__chart_data['resultado_por_hora']['labels'].length < 7){
					let diff_to_fill = 7 - _dashboard_ops__chart_data['resultado_por_hora']['labels'].length;
					for (let es=0; es<diff_to_fill; es++)
						_dashboard_ops__chart_data['resultado_por_hora']['labels'].push('');
				}
				if (_dashboard_ops__chart_data['sequencia_de_resultados']['labels'].length < 10){
					let diff_to_fill = 10 - _dashboard_ops__chart_data['sequencia_de_resultados']['labels'].length;
					for (let es=0; es<diff_to_fill; es++)
						_dashboard_ops__chart_data['sequencia_de_resultados']['labels'].push('');
				}
				if (_dashboard_ops__chart_data['drawdowns']['labels'].length < 10){
					let diff_to_fill = 10 - _dashboard_ops__chart_data['drawdowns']['labels'].length;
					for (let es=0; es<diff_to_fill; es++)
						_dashboard_ops__chart_data['drawdowns']['labels'].push('');
				}
			}
			/*------------------------------- Retorno dos Dados ------------------------------*/
			return {
				dashboard_ops__table_stats: _dashboard_ops__table_stats,
				dashboard_ops__table_stats__byCenario: _dashboard_ops__table_stats__byCenario,
				dashboard_ops__table_trades: _dashboard_ops__table_trades,
				dashboard_ops__chart_data: _dashboard_ops__chart_data
			}
		}
		/*------------------------------------ Por Mes -----------------------------------*/
		else if (_simulation.periodo_calc === '3'){
			for (let o in _ops){
				//////////////////////////////////
				//Resultados do Trade
				//////////////////////////////////
				if (_options.get_tradeTableData){
					_dashboard_ops__table_trades.push({
						//Sequencia do trade, na ordem que vem do BD
						mes__seq: _temp__table_stats['i_seq']++,
						//Data do trade
						mes__data: _ops[o].data,
						//Contratos usados
						mes__cts: _ops[o].cts_usado,
						//Trades feitos no mes
						mes__qtd_trades: _ops[o].qtd_trades,
						//Media de Vol no mes
						mes__vol_media: divide(_ops[o].vol_total, _ops[o].qtd_trades),
						//Se houve erro no mes
						mes__erro: _ops[o].erro,
						//Resultado bruto do mes em S
						mes__result_bruto__S: _ops[o].result_bruto['S'],
						//Lucro bruto do mes em BRL
						mes__lucro_bruto__brl: _ops[o].lucro_bruto['brl'],
						//Prejuizo bruto do mes em BRL
						mes__prejuizo_bruto__brl: _ops[o].prejuizo_bruto['brl'],
						//Resultado bruto do mes em BRL
						mes__result_bruto__brl: _ops[o].result_bruto['brl'],
						//Custo do mes
						mes__custo: _ops[o].custo,
						//Resultado Liquido do mes em BRL
						mes__result_liquido__brl: _ops[o].result_liquido['brl']
					});
				}
				//////////////////////////////////
				//Estatisticas Gerais
				//////////////////////////////////
				let month = moment(_ops[o].data).month();
				if (!(month in _temp__table_stats['horas__unicas']))
					_temp__table_stats['horas__unicas'][month] = { result: 0.0, qtd: 0 };
				_temp__table_stats['horas__unicas'][month]['result'] += _ops[o].result_liquido['brl'];
				_temp__table_stats['horas__unicas'][month]['qtd']++;
				//Para o lucro em S
				_dashboard_ops__table_stats['result__lucro_S'] += _ops[o].result_bruto['S'];
				//Se for uma operação 'Positiva'
				if (_ops[o].resultado_op === 1){
					_dashboard_ops__table_stats['trades__positivo']++;
					_temp__table_stats['mediaGain'] += _ops[o].result_liquido['brl'];
					if (_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] === undefined)
						_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] = 0;
					_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']]++;
					//Reinicia a contagem de sequencia negativa
					if (_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] > 0)
						_temp__table_stats['sequencias_negativo__index']++;
				}
				//Se for uma operação 'Negativa'
				else if (_ops[o].resultado_op === -1){
					_dashboard_ops__table_stats['trades__negativo']++;
					_temp__table_stats['mediaLoss'] += _ops[o].result_liquido['brl'];
					if (_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] === undefined)
						_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']] = 0;
					_temp__table_stats['sequencias_negativo'][_temp__table_stats['sequencias_negativo__index']]++;
					//Reinicia a contagem de sequencia positiva
					if (_temp__table_stats['sequencias_positivo'][_temp__table_stats['sequencias_positivo__index']] > 0)
						_temp__table_stats['sequencias_positivo__index']++;
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
				//Calcula o Lucro por Mes
				if (!(_ops[o].data in _temp__table_stats['lucro_por_periodo']))
					_temp__table_stats['lucro_por_periodo'][_ops[o].data] = 0.0;
				_temp__table_stats['lucro_por_periodo'][_ops[o].data] += _ops[o].result_liquido['brl'];
				//Para o Drawdown
				//Atualiza o topo historico
				if (_temp__table_stats['lucro_corrente']['brl'] > _dashboard_ops__table_stats['stats__drawdown_topoHistorico']){
					_dashboard_ops__table_stats['stats__drawdown_topoHistorico'] = _temp__table_stats['lucro_corrente']['brl'];
					_dashboard_ops__table_stats['stats__drawdown'] = 0;
					_dashboard_ops__table_stats['stats__drawdown_periodo'] = 0;
					if (_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] !== undefined)
						_temp__table_stats['drawdowns_index']++;
				}
				//Se estiver abaixo do topo, está em drawdown
				else if (_temp__table_stats['lucro_corrente']['brl'] < _dashboard_ops__table_stats['stats__drawdown_topoHistorico']){
					if (_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] === undefined){
						_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']] = {
							brl: 0,
							periodo: 0
						}
						_temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']] = {
							brl: 0,
							periodo: 0
						}
					}
					let lucro__topo_diff = Math.abs(_dashboard_ops__table_stats['stats__drawdown_topoHistorico'] - Math.abs(_temp__table_stats['lucro_corrente']['brl']));
					if (lucro__topo_diff > _temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['brl']){
						_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
						_temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
					}
					_temp__table_stats['drawdowns'][_temp__table_stats['drawdowns_index']]['periodo']++;
					_temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns_index']]['periodo']++;
					_dashboard_ops__table_stats['stats__drawdown'] = lucro__topo_diff;
					_dashboard_ops__table_stats['stats__drawdown_periodo']++;
				}
				//Para o DP
				_temp__table_stats['lista_resultados'].push(_ops[o].result_liquido['brl']);
				if (_simulation['R'] !== null)
					_temp__table_stats['lista_resultados_R'].push(divide(_ops[o].result_liquido['brl'], _simulation['R']));
				//////////////////////////////////
				//Estatisticas para os Gráficos
				//////////////////////////////////
				if (_options.get_graficoData){
					//Para o gráfico de Resultados por Trade
					_dashboard_ops__chart_data['resultados_normalizado']['labels'].push(parseInt(o) + 1);
					_dashboard_ops__chart_data['resultados_normalizado']['data'].push(_ops[o].result_liquido['brl']);
					_dashboard_ops__chart_data['resultados_normalizado']['date'].push(`${Global.convertDate(_ops[o].data)} Trades: ${_ops[o].qtd_trades}`);
					//Para o gráfico de Evolução Patrimonial
					_dashboard_ops__chart_data['evolucao_patrimonial']['labels'].push(parseInt(o) + 1);
					_dashboard_ops__chart_data['evolucao_patrimonial']['data'].push(_temp__table_stats['lucro_corrente']['brl']);
					_dashboard_ops__chart_data['evolucao_patrimonial']['date'].push(`${Global.convertDate(_ops[o].data)} Trades: ${_ops[o].qtd_trades}`);
				}
			}
			/*------------------------ Termina processamento dos Dados -----------------------*/
			//////////////////////////////////
			//Estatisticas Gerais
			//////////////////////////////////
			//Termina de processar estatisticas de '_temp__table_stats'
			_temp__table_stats['mediaGain'] = divide(_temp__table_stats['mediaGain'], (_dashboard_ops__table_stats['trades__positivo'] + _dashboard_ops__table_stats['trades__empate']));
			_temp__table_stats['mediaLoss'] = divide(_temp__table_stats['mediaLoss'], _dashboard_ops__table_stats['trades__negativo']);

			//Termina de processar estatisticas do '_dashboard_ops__table_stats'

			// _dashboard_ops__table_stats['dias__trades_por_dia']   = divide(_ops.length, _dashboard_ops__table_stats['dias__total']);
			_dashboard_ops__table_stats['trades__total']                  = _ops.length;

			_dashboard_ops__table_stats['trades__positivo_perc']          = (divide(_dashboard_ops__table_stats['trades__positivo'], _dashboard_ops__table_stats['trades__total']) * 100);
			_dashboard_ops__table_stats['trades__negativo_perc']          = (divide(_dashboard_ops__table_stats['trades__negativo'], _dashboard_ops__table_stats['trades__total']) * 100);
			_dashboard_ops__table_stats['trades__empate_perc']            = (divide(_dashboard_ops__table_stats['trades__empate'], _dashboard_ops__table_stats['trades__total']) * 100);
			_dashboard_ops__table_stats['trades__max_seq_negativo']       = (_temp__table_stats['sequencias_negativo'].length) ? Math.max(..._temp__table_stats['sequencias_negativo']) : 0;
			_dashboard_ops__table_stats['trades__max_seq_positivo']       = (_temp__table_stats['sequencias_positivo'].length) ? Math.max(..._temp__table_stats['sequencias_positivo']) : 0;
			_dashboard_ops__table_stats['trades__max_seq_negativo_medio'] = (_temp__table_stats['sequencias_negativo'].length) ? divide(_temp__table_stats['sequencias_negativo'].reduce((a, b) => a + b, 0), _temp__table_stats['sequencias_negativo'].length) : 0;
			_dashboard_ops__table_stats['trades__max_seq_positivo_medio'] = (_temp__table_stats['sequencias_positivo'].length) ? divide(_temp__table_stats['sequencias_positivo'].reduce((a, b) => a + b, 0), _temp__table_stats['sequencias_positivo'].length) : 0;

			_dashboard_ops__table_stats['result__lucro_brl']              = _temp__table_stats['lucro_corrente']['brl'];
			_dashboard_ops__table_stats['result__lucro_R']                = (_simulation['R'] !== null) ? divide(_temp__table_stats['lucro_corrente']['brl'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['result__lucro_perc']             = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['lucro_corrente']['brl'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['result__lucro_medio_brl']        = divide(Object.values(_temp__table_stats['lucro_por_periodo']).reduce((a, b) => a + b, 0), Object.keys(_temp__table_stats['lucro_por_periodo']).length);
			_dashboard_ops__table_stats['result__lucro_medio_R']          = (_simulation['R'] !== null) ? divide(_dashboard_ops__table_stats['result__lucro_medio_brl'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['result__lucro_medio_perc']       = (_simulation['valor_inicial'] !== null) ? (divide(_dashboard_ops__table_stats['result__lucro_medio_brl'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['result__mediaGain_brl']          = _temp__table_stats['mediaGain'];
			_dashboard_ops__table_stats['result__mediaLoss_brl']          = _temp__table_stats['mediaLoss'];
			_dashboard_ops__table_stats['result__mediaGain_R'] 	          = (_simulation['R'] !== null) ? divide(_temp__table_stats['mediaGain'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['result__mediaLoss_R']            = (_simulation['R'] !== null) ? divide(_temp__table_stats['mediaLoss'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['result__mediaGain_perc']         = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaGain'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['result__mediaLoss_perc']         = (_simulation['valor_inicial'] !== null) ? (divide(_temp__table_stats['mediaLoss'], _simulation['valor_inicial']) * 100) : '--';

			_dashboard_ops__table_stats['stats__rrMedio']                 = divide(_temp__table_stats['mediaGain'], Math.abs(_temp__table_stats['mediaLoss']));
			_dashboard_ops__table_stats['stats__breakeven']               = (divide(Math.abs(_temp__table_stats['mediaLoss']), (_temp__table_stats['mediaGain'] + Math.abs(_temp__table_stats['mediaLoss']))) * 100);
			_dashboard_ops__table_stats['stats__edge']                    = _dashboard_ops__table_stats['trades__positivo_perc'] - _dashboard_ops__table_stats['stats__breakeven'];
			_dashboard_ops__table_stats['stats__fatorLucro']              = divide((_dashboard_ops__table_stats['trades__positivo_perc'] * _temp__table_stats['mediaGain']), (_dashboard_ops__table_stats['trades__negativo_perc'] * _temp__table_stats['mediaLoss']));
			_dashboard_ops__table_stats['stats__expect_brl']              = divide(_temp__table_stats['lucro_corrente']['brl'], _dashboard_ops__table_stats['trades__total']);
			_dashboard_ops__table_stats['stats__expect_R']                = (_simulation['R'] !== null) ? divide(_dashboard_ops__table_stats['stats__expect_brl'], _simulation['R']) : '--';
			_dashboard_ops__table_stats['stats__expect_perc']             = (_simulation['valor_inicial'] !== null) ? (divide(_dashboard_ops__table_stats['stats__expect_brl'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['stats__dp_brl']                  = desvpad(_temp__table_stats['lista_resultados'])['desvpad'];
			_dashboard_ops__table_stats['stats__dp_R']                    = (_simulation['R'] !== null) ? desvpad(_temp__table_stats['lista_resultados_R'])['desvpad'] : '--';
			_dashboard_ops__table_stats['stats__dp_perc']                 = (_simulation['valor_inicial'] !== null) ? (divide(_dashboard_ops__table_stats['stats__dp_brl'], _simulation['valor_inicial']) * 100) : '--';
			_dashboard_ops__table_stats['stats__sqn']                     = (_simulation['R'] !== null) ? (divide(_dashboard_ops__table_stats['stats__expect_R'], _dashboard_ops__table_stats['stats__dp_R']) * Math.sqrt(_dashboard_ops__table_stats['trades__total'])) : '--';
			_dashboard_ops__table_stats['stats__media_vol']               = '--';
			_dashboard_ops__table_stats['stats__valorInicial_com_lucro']  = (_simulation['valor_inicial'] !== null) ? (_simulation['valor_inicial'] + _temp__table_stats['lucro_corrente']['brl']) : '--';
			_dashboard_ops__table_stats['stats__stops_ruina']             = (_simulation['valor_inicial'] !== null && _simulation['R'] !== null) ? Math.floor(divide(_dashboard_ops__table_stats['stats__valorInicial_com_lucro'], _simulation['R'])) : '--';

			_temp__table_stats['sorted_drawdowns'].sort((a, b) => a.brl - b.brl);

			_dashboard_ops__table_stats['stats__drawdown_qtd']            = _temp__table_stats['drawdowns'].length;
			_dashboard_ops__table_stats['stats__drawdown_max']            = (_temp__table_stats['sorted_drawdowns'].length) ? _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns'].length-1]['brl'] : 0.0;
			_dashboard_ops__table_stats['stats__drawdown_max_periodo']    = (_temp__table_stats['sorted_drawdowns'].length) ? _temp__table_stats['sorted_drawdowns'][_temp__table_stats['drawdowns'].length-1]['periodo'] : 0.0;

			_dashboard_ops__table_stats['trades__erro']                   = ((!_simulation.ignora_erro) ? _dashboard_ops__table_stats['trades__erro'] : '--');
			_dashboard_ops__table_stats['trades__erro_perc']              = ((!_simulation.ignora_erro) ? (divide(_dashboard_ops__table_stats['trades__erro'], _dashboard_ops__table_stats['trades__total']) * 100) : '--');
			
			//////////////////////////////////
			//Estatisticas para os Gráficos
			//////////////////////////////////
			if (_options.get_graficoData){
				//////////////////////////////////
				//Gráfico de Evolução Patrimonial
				//////////////////////////////////
				//Média móvel simples da evolução patrimonial
				SMA(_dashboard_ops__chart_data['evolucao_patrimonial']['data'], _dashboard_ops__chart_data['evolucao_patrimonial']['sma20'], 20);
				//2 Bandas de Desvio Padrão
				BBollinger(_dashboard_ops__chart_data['evolucao_patrimonial'], 1, NaN, 2);
				//////////////////////////////////
				//Gráfico de Resultados Normalizados
				//////////////////////////////////
				//Gráfico de barras dos resultados + bandas superior e inferior do desvio padrao + linha de risco
				BBollinger(_dashboard_ops__chart_data['resultados_normalizado'], 1, NaN, 1);
				//////////////////////////////////
				//Gráfico de Resultados por Hora
				//////////////////////////////////
				let months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
					sorted_horas__unicas = Object.keys(_temp__table_stats['horas__unicas']).sort();
				for (let m = 0; m < sorted_horas__unicas.length; m++){
					_dashboard_ops__chart_data['resultado_por_hora']['labels'].push(months[sorted_horas__unicas[m]]);
					_dashboard_ops__chart_data['resultado_por_hora']['data_result'].push(_temp__table_stats['horas__unicas'][sorted_horas__unicas[m]]['result']);
					_dashboard_ops__chart_data['resultado_por_hora']['data_qtd'].push(_temp__table_stats['horas__unicas'][sorted_horas__unicas[m]]['qtd']);
				}
				//////////////////////////////////
				//Gráfico Sequencia de Result.
				//////////////////////////////////
				let sequencia_sep_counter = {},
					sequencia_sep_counter__max_key = 0;
				for (let s = 0; s < _temp__table_stats['sequencias_positivo'].length; s++){
					if (!(_temp__table_stats['sequencias_positivo'][s] in sequencia_sep_counter))
						sequencia_sep_counter[_temp__table_stats['sequencias_positivo'][s]] = 0;
					sequencia_sep_counter[_temp__table_stats['sequencias_positivo'][s]]++;
				}
				sequencia_sep_counter__max_key = Math.max(...Object.keys(sequencia_sep_counter));
				for (let s = 1; s <= sequencia_sep_counter__max_key; s++){
					if (s in sequencia_sep_counter)
						_dashboard_ops__chart_data['sequencia_de_resultados']['data_positivos'].push(sequencia_sep_counter[s]);
					else
						_dashboard_ops__chart_data['sequencia_de_resultados']['data_positivos'].push(0);
				}
				sequencia_sep_counter = {};
				sequencia_sep_counter__max_key = 0;
				for (let s = 0; s < _temp__table_stats['sequencias_negativo'].length; s++){
					if (!(_temp__table_stats['sequencias_negativo'][s] in sequencia_sep_counter))
						sequencia_sep_counter[_temp__table_stats['sequencias_negativo'][s]] = 0;
					sequencia_sep_counter[_temp__table_stats['sequencias_negativo'][s]]++;
				}
				sequencia_sep_counter__max_key = Math.max(...Object.keys(sequencia_sep_counter));
				for (let s = 1; s <= sequencia_sep_counter__max_key; s++){
					if (s in sequencia_sep_counter)
						_dashboard_ops__chart_data['sequencia_de_resultados']['data_negativos'].push(sequencia_sep_counter[s] * -1);
					else
						_dashboard_ops__chart_data['sequencia_de_resultados']['data_negativos'].push(0);
				}
				_dashboard_ops__chart_data['sequencia_de_resultados']['labels'] = (_dashboard_ops__chart_data['sequencia_de_resultados']['data_positivos'].length > _dashboard_ops__chart_data['sequencia_de_resultados']['data_negativos'].length) ? Object.keys(_dashboard_ops__chart_data['sequencia_de_resultados']['data_positivos']).map(o => parseInt(o) + 1) : Object.keys(_dashboard_ops__chart_data['sequencia_de_resultados']['data_negativos']).map(o => parseInt(o) + 1);
				//////////////////////////////////
				//Gráfico Historico de Drawdowns 
				//////////////////////////////////
				_dashboard_ops__chart_data['drawdowns']['data'] = _temp__table_stats['drawdowns'].map(o => o.brl);
				_dashboard_ops__chart_data['drawdowns']['labels'] = Object.keys(_dashboard_ops__chart_data['drawdowns']['data']).map(o => parseInt(o) + 1);
				BBollinger(_dashboard_ops__chart_data['drawdowns'], 1, NaN, 2, true, 'sup');
			}
			//////////////////////////////////
			//Enche o dataset base com vazio para regular o zoom dos graficos com poucos elementos
			//////////////////////////////////
			if (_dashboard_ops__chart_data['evolucao_patrimonial']['labels'].length < 30){
				let diff_to_fill = 30 - _dashboard_ops__chart_data['evolucao_patrimonial']['labels'].length;
				for (let es=0; es<diff_to_fill; es++)
					_dashboard_ops__chart_data['evolucao_patrimonial']['labels'].push('');
			}
			if (_dashboard_ops__chart_data['resultados_normalizado']['labels'].length < 50){
				let diff_to_fill = 50 - _dashboard_ops__chart_data['resultados_normalizado']['labels'].length;
				for (let es=0; es<diff_to_fill; es++)
					_dashboard_ops__chart_data['resultados_normalizado']['labels'].push('');
			}
			if (_dashboard_ops__chart_data['resultado_por_hora']['labels'].length < 10){
				let diff_to_fill = 10 - _dashboard_ops__chart_data['resultado_por_hora']['labels'].length;
				for (let es=0; es<diff_to_fill; es++)
					_dashboard_ops__chart_data['resultado_por_hora']['labels'].push('');
			}
			if (_dashboard_ops__chart_data['sequencia_de_resultados']['labels'].length < 10){
				let diff_to_fill = 10 - _dashboard_ops__chart_data['sequencia_de_resultados']['labels'].length;
				for (let es=0; es<diff_to_fill; es++)
					_dashboard_ops__chart_data['sequencia_de_resultados']['labels'].push('');
			}
			if (_dashboard_ops__chart_data['drawdowns']['labels'].length < 10){
				let diff_to_fill = 10 - _dashboard_ops__chart_data['drawdowns']['labels'].length;
				for (let es=0; es<diff_to_fill; es++)
					_dashboard_ops__chart_data['drawdowns']['labels'].push('');
			}
			/*------------------------------- Retorno dos Dados ------------------------------*/
			return {
				dashboard_ops__table_stats: _dashboard_ops__table_stats,
				dashboard_ops__table_stats__byCenario: _dashboard_ops__table_stats__byCenario,
				dashboard_ops__table_trades: _dashboard_ops__table_trades,
				dashboard_ops__chart_data: _dashboard_ops__chart_data
			}
		}
	}
	/*
		Gera as estatisticas e dados de uma Run da Build 'tipo_parada__1'.
		Input:
			- ops: Lista de operações. (Seguira a ordem da lista passada)
			- filters: Filtros a serem aplicados na lista de operações.
			- simulation: Dados de simulação para serem substituidos na lista de operações.
			- options: Opções opcionais a serem passadas para a funcao.
	*/
	let get_stats__build__tipo_parada__1 = function (ops = [], filters = {}, simulation = {}){
		/*------------------------------------ Vars --------------------------------------*/
		//Modifca alguns valores do 'filters' e 'simulation'
		let _filters = {
			data_inicial: ('data_inicial' in filters) ? filters.data_inicial : null,
			data_final: ('data_final' in filters) ? filters.data_final : null,
			hora_inicial: ('hora_inicial' in filters) ? filters.hora_inicial : null,
			hora_final: ('hora_final' in filters) ? filters.hora_final : null,
			ativo: ('ativo' in filters) ? filters.ativo : [],
			gerenciamento: ('gerenciamento' in filters) ? filters.gerenciamento : null,
			cenario: ('cenario' in filters) ? filters.cenario : {},
			observacoes_query_union: ('observacoes_query_union' in filters) ? filters.observacoes_query_union : 'AND'
		};
		let _simulation = {
			periodo_calc: ('periodo_calc' in simulation) ? simulation.periodo_calc : '1',
			tipo_cts: ('tipo_cts' in simulation) ? simulation.tipo_cts : '1',
			cts: ('cts' in simulation) ? simulation.cts : null,
			usa_custo: ('usa_custo' in simulation) ? simulation.usa_custo == 1 : true,
			ignora_erro: ('ignora_erro' in simulation) ? simulation.ignora_erro == 1 : false,
			tipo_parada: ('tipo_parada' in simulation) ? simulation.tipo_parada : [],
			valor_inicial: ('valor_inicial' in simulation) ? parseFloat(simulation.valor_inicial) : null,
			R: ('R' in simulation && simulation.R != 0) ? simulation.R : null,
			R_filter_ops: ('R_filter_ops' in simulation && simulation.R_filter_ops == '1') ? true : false
		};
		//Variaveis para a tabela de estatistica geral
		let _run_stats = {
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
			//Lucro total em R$ das operações
			result__lucro_brl: 0.0,
			//Edge das operações
			stats__edge: 0.0,
			//Breakeven das operações
			stats__breakeven: 0.0,
			//Fator de Lucro das operações
			stats__fatorLucro: 0.0,
			//Expectativa média em R$ a se esperar em futuras operações
			stats__expect_brl: 0.0,
			//Quantidade total de drawdowns passados
			stats__drawdown_qtd: 0,
			//Drawdown corrente (Caso haja)
			stats__drawdown: 0.0,
			//Periodo do drawdown corrente
			stats__drawdown_periodo: 0,
			//Topo histórico alcançado na lista de operações
			stats__drawdown_topoHistorico: 0.0,
		}
		//Variaveis temporarias usadas em '_run_stats'
		let _temp__run_stats = {
			i_seq: 1,
			lucro_corrente: {brl: 0.0},
			mediaGain: 0.0,
			mediaLoss: 0.0,
			drawdowns: [],
			sorted_drawdowns: [],
			drawdowns_index: 0
		}
		let _ops = groupData_byPeriodo(ops, _filters, _simulation, {});
		/*----------------------------- Percorre as operações ----------------------------*/
		for (let o in _ops){
			//////////////////////////////////
			//Estatisticas
			//////////////////////////////////
			//Se for uma operação 'Positiva'
			if (_ops[o].resultado_op === 1){
				_run_stats['trades__positivo']++;
				_temp__run_stats['mediaGain'] += _ops[o].result_liquido['brl'];
			}
			//Se for uma operação 'Negativa'
			else if (_ops[o].resultado_op === -1){
				_run_stats['trades__negativo']++;
				_temp__run_stats['mediaLoss'] += _ops[o].result_liquido['brl'];
			}
			//Se for uma operação 'Empate (0x0)'
			else if (_ops[o].resultado_op === 0){
				_run_stats['trades__empate']++;
				_temp__run_stats['mediaGain'] += _ops[o].result_liquido['brl'];
			}
			//Calcula o lucro corrente após cada operação
			_temp__run_stats['lucro_corrente']['brl'] += _ops[o].result_liquido['brl'];
			//Para o Drawdown
			//Atualiza o topo historico
			if (_temp__run_stats['lucro_corrente']['brl'] > _run_stats['stats__drawdown_topoHistorico']){
				_run_stats['stats__drawdown_topoHistorico'] = _temp__run_stats['lucro_corrente']['brl'];
				_run_stats['stats__drawdown'] = 0;
				_run_stats['stats__drawdown_periodo'] = 0;
				if (_temp__run_stats['drawdowns'][_temp__run_stats['drawdowns_index']] !== undefined)
					_temp__run_stats['drawdowns_index']++;
			}
			//Se estiver abaixo do topo, está em drawdown
			else if (_temp__run_stats['lucro_corrente']['brl'] < _run_stats['stats__drawdown_topoHistorico']){
				if (_temp__run_stats['drawdowns'][_temp__run_stats['drawdowns_index']] === undefined){
					_temp__run_stats['drawdowns'][_temp__run_stats['drawdowns_index']] = {
						brl: 0,
						periodo: 0
					}
					_temp__run_stats['sorted_drawdowns'][_temp__run_stats['drawdowns_index']] = {
						brl: 0,
						periodo: 0
					}
				}
				let lucro__topo_diff = Math.abs(_run_stats['stats__drawdown_topoHistorico'] - Math.abs(_temp__run_stats['lucro_corrente']['brl']));
				if (lucro__topo_diff > _temp__run_stats['drawdowns'][_temp__run_stats['drawdowns_index']]['brl']){
					_temp__run_stats['drawdowns'][_temp__run_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
					_temp__run_stats['sorted_drawdowns'][_temp__run_stats['drawdowns_index']]['brl'] = lucro__topo_diff;
				}
				_temp__run_stats['drawdowns'][_temp__run_stats['drawdowns_index']]['periodo']++;
				_temp__run_stats['sorted_drawdowns'][_temp__run_stats['drawdowns_index']]['periodo']++;
				_run_stats['stats__drawdown'] = lucro__topo_diff;
				_run_stats['stats__drawdown_periodo']++;
			}
		}
		/*------------------------ Termina processamento dos Dados -----------------------*/
		//////////////////////////////////
		//Estatisticas
		//////////////////////////////////
		//Termina de processar estatisticas de '_temp__run_stats'
		_temp__run_stats['mediaGain'] = divide(_temp__run_stats['mediaGain'], (_run_stats['trades__positivo'] + _run_stats['trades__empate']));
		_temp__run_stats['mediaLoss'] = divide(_temp__run_stats['mediaLoss'], _run_stats['trades__negativo']);

		//Termina de processar estatisticas do '_run_stats'

		_run_stats['trades__total']                  = _ops.length;
		_run_stats['trades__positivo_perc']          = (divide(_run_stats['trades__positivo'], _run_stats['trades__total']) * 100);
		_run_stats['trades__negativo_perc']          = (divide(_run_stats['trades__negativo'], _run_stats['trades__total']) * 100);

		_run_stats['result__lucro_brl']              = _temp__run_stats['lucro_corrente']['brl'];

		_run_stats['stats__breakeven']               = (divide(Math.abs(_temp__run_stats['mediaLoss']), (_temp__run_stats['mediaGain'] + Math.abs(_temp__run_stats['mediaLoss']))) * 100);
		_run_stats['stats__edge']                    = _run_stats['trades__positivo_perc'] - _run_stats['stats__breakeven'];
		_run_stats['stats__fatorLucro']              = divide((_run_stats['trades__positivo_perc'] * _temp__run_stats['mediaGain']), (_run_stats['trades__negativo_perc'] * _temp__run_stats['mediaLoss']));

		_temp__run_stats['sorted_drawdowns'].sort((a, b) => a.brl - b.brl);

		_run_stats['stats__drawdown_qtd']            = _temp__run_stats['drawdowns'].length;
		_run_stats['stats__drawdown_medio']          = divide(_temp__run_stats['drawdowns'].reduce((total, dd) => total + dd.brl, 0), _temp__run_stats['drawdowns'].length);
		/*------------------------------- Retorno dos Dados ------------------------------*/
		return _run_stats;
	}
	/*--------------------------------------------------------------------------------*/
	return {
		generate__DashboardOps: generate__DashboardOps,
		get_stats__build__tipo_parada__1: get_stats__build__tipo_parada__1
	}
})();