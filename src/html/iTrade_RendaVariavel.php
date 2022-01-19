<div class="container-fluid">
	<div class="row">
		<div class="col d-flex">
			<div class="container-fluid bg-light p-5 pt-3 rounded">
				<div class="container-fluid d-flex mb-4 px-0" id="renda_variavel__menu">
					<div class="btn-group me-2" role="group">
						<div class="btn-group" role="group">
							<button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown"><i class="fas fa-chart-line me-2"></i>Dados Instância </button>
							<ul class="dropdown-menu">
								<li><a class="dropdown-item" href="#" name="section_dashboard_ops"><i class="fas fa-chart-line me-2"></i>Dados Instância </a></li>
								<li><a class="dropdown-item" href="#" name="section_analise_obs"><i class="fas fa-microchip me-2"></i>Análise Observações </a></li>
							</ul>
						</div>
					</div>
					<button class="btn btn-sm btn-primary me-2" type="button" name="arcaboucos"><i class="fas fa-archive me-2"></i>Arcabouços</button>
					<button class="btn btn-sm btn-primary me-2" type="button" name="ativos"><i class="fas fa-euro-sign me-2"></i>Ativos</button>
					<button class="btn btn-sm btn-primary" type="button" name="gerenciamentos"><i class="fas fa-coins me-2"></i>Gerenciamentos</button>
					<button class="btn btn-sm btn-outline-primary ms-auto me-2" type="button" name="arcabouco_info"><i class="fas fa-info-circle me-2"></i>Info</button>
					<button class="btn btn-sm btn-outline-primary me-2" type="button" name="cenarios"><i class="fas fa-tasks me-2"></i>Gerir Cenários</button>
					<div class="btn-group" role="group">
						<button class="btn btn-sm btn-outline-primary" type="button" name="adicionar_operacoes"><i class="fab fa-buffer me-2"></i>Adicionar Operações</button>
						<div class="btn-group" role="group">
							<button type="button" class="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown"></button>
							<ul class="dropdown-menu">
								<li><a class="dropdown-item" href="#" name="lista_ops"><i class="fas fa-list-ul me-2"></i>Operações</a></li>
								<li><a class="dropdown-item" href="#" name="upload_operacoes"><i class="fas fa-cloud-upload-alt me-2"></i>Upload Operações</a></li>
							</ul>
						</div>
					</div>
				</div>
				<div class="row mb-4">
					<div class="col" id="renda_variavel__instancias"></div>
				</div>
				<div class="row">
					<div class="col" id="renda_variavel__search">
						<div class="row">
							<div class="col">
								<div class="card mb-2 rounded-3 shadow-sm">
									<div class="card-body p-2">
										<div class="container-fluid d-flex justify-content-end px-0">
											<form class="row m-0 flex-fill">
												<div class="col-auto">
													<label class="form-label m-0 text-muted fw-bold">Filtrar Data</label>
													<input type="text" name="data" class="form-control form-control-sm" placeholder="Data">
												</div>
												<div class="col-auto">
													<label class="form-label m-0 text-muted fw-bold">Filtrar Hora</label>
													<div class="slider-styled filter-hora" name="hora"></div>
												</div>
												<div class="col-auto" name="ativo">
													<label class="form-label m-0 text-muted fw-bold">Filtrar Ativo</label>
													<select name="ativo" class="form-control form-control-sm init" multiple></select>
												</div>
												<div class="col-auto" name="gerenciamento">
													<label class="form-label m-0 text-muted fw-bold">Filtrar Gerenciamento</label>
													<select name="gerenciamento" class="form-select form-select-sm ms-auto"></select>
												</div>
												<div class="col-auto" name="cenario">
													<label class="form-label m-0 text-muted fw-bold">Filtrar Cenário</label>
													<select name="cenario" class="form-control form-control-sm init" multiple></select>
												</div>
												<div class="col-auto" name="observacoes">
													<label class="form-label m-0 text-muted fw-bold">Filtrar Observações</label>
													<div class="iSelectKami dropdown bootstrap-select w-100" name="observacoes">
														<button class="form-control form-control-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside">Observações</button>
														<ul class="dropdown-menu overflow-auto"></ul>
													</div>
												</div>
											</form>
										</div>
									</div>
								</div>
								<div class="card rounded-3 shadow-sm">
									<div class="card-body p-2">
										<div class="container-fluid d-flex justify-content-end px-0">
											<form class="row m-0 flex-fill">
												<div class="col-auto">
													<label class="form-label m-0 text-muted fw-bold">Período</label>
													<select name="periodo_calc" class="form-select form-select-sm ms-auto">
														<option value="1">Por Trade</option>
														<option value="2">Por Dia</option>
														<option value="3">Por Mes</option>
													</select>
												</div>
												<div class="col-auto">
													<label class="form-label m-0 text-muted fw-bold">Simular Cts</label>
													<div class="input-group">
														<select class="form-select form-select-sm" name="tipo_cts">
															<option value="1">Padrão</option>
															<option value="2">Quantidade Fixa</option>
															<option value="3">Quantidade Máx por R</option>
														</select>
														<input type="text" name="cts" class="form-control form-control-sm" onclick="this.select()" placeholder="Cts" disabled>
													</div>
												</div>
												<div class="col-auto">
													<label class="form-label m-0 text-muted fw-bold">Custos</label>
													<select name="usa_custo" class="form-select form-select-sm ms-auto">
														<option value="1">Incluir</option>
														<option value="0">Não Incluir</option>
													</select>
												</div>
												<div class="col-auto">
													<label class="form-label m-0 text-muted fw-bold">Ignorar Erros</label>
													<select name="ignora_erro" class="form-select form-select-sm ms-auto">
														<option value="0">Não</option>
														<option value="1">Sim</option>
													</select>
												</div>
												<div class="col-auto" name="tipo_parada">
													<label class="form-label m-0 text-muted fw-bold">Simular Parada</label>
													<div class="iSelectKami dropdown bootstrap-select w-100" name="tipo_parada">
														<button class="form-control form-control-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside">Tipos de Parada</button>
														<ul class="dropdown-menu overflow-auto">
															<li class="not-selectable">Após N stops (Total)<input class="form-control form-control-sm" type="input" tipo_parada="1" name="valor_parada" onclick="this.select()"></li>
															<li class="not-selectable">Após N stops (Sequencial)<input class="form-control form-control-sm" type="input" tipo_parada="2" name="valor_parada" onclick="this.select()"></li>
															<li class="not-selectable">Após X valor no Negativo<input class="form-control form-control-sm" type="input" tipo_parada="3" name="valor_parada" onclick="this.select()"></li>
															<li class="not-selectable">Após X valor de Perda Bruta<input class="form-control form-control-sm" type="input" tipo_parada="4" name="valor_parada" onclick="this.select()"></li>
															<li class="not-selectable">Após atingir X R's no Negativo<input class="form-control form-control-sm" type="input" tipo_parada="5" name="valor_parada" onclick="this.select()"></li>
															<li class="not-selectable">Após atingir X R's de Perda Bruta<input class="form-control form-control-sm" type="input" tipo_parada="6" name="valor_parada" onclick="this.select()"></li>
														</ul>
													</div>
												</div>
												<div class="col-auto">
													<label class="form-label m-0 text-muted fw-bold">Simular Capital</label>
													<input type="text" name="valor_inicial" class="form-control form-control-sm" onclick="this.select()" placeholder="Capital">
												</div>
												<div class="col-auto">
													<label class="form-label m-0 text-muted fw-bold">Simular R</label>
													<input type="text" name="R" class="form-control form-control-sm" onclick="this.select()" placeholder="R">
												</div>
											</form>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="row mt-4">
					<div class="col" id="dashboard_ops__section">
						<div class="d-none" target="data">
							<!-- Tabela de dados por Cenário -->
							<div class="row">
								<div class="col">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="dashboard_ops__table_stats__byCenario__place"></div>
									</div>
								</div>
							</div>
							<div class="row mt-4">
								<!-- Tabela de Trades -->
								<div class="col-6" id="dashboard_ops__table_trades__place">
								</div>
								<!-- Grafico Trades Resultados Normalizado -->
								<div class="col-6">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="dashboard_ops__chart_resultadoNormalizado"></div>
									</div>
								</div>
							</div>
							<div class="row mt-3">
								<!-- Graficos Horario -->
								<div class="col-3">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="dashboard_ops__chart_resultadoPorHorario"></div>
									</div>
								</div>
								<!-- Graficos Evolução Patrimonial -->
								<div class="col-9">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="dashboard_ops__chart_evolucaoPatrimonial"></div>
									</div>
								</div>
							</div>
						</div>
						<div class="" target="empty">
							<div class="card mb-2 rounded-3 shadow-sm">
								<div class="card-body">
									<div class="container-fluid text-center fw-bold text-muted fs-5"><i class="fas fa-cookie-bite me-2"></i>Nada a mostrar</div>
								</div>
							</div>
						</div>
						<div class="d-none" target="building">
							<div class="card mb-2 rounded-3 shadow-sm">
								<div class="card-body">
									<div class="container-fluid text-center fw-bold text-muted fs-5"><i class="fas fa-cog fa-spin me-2"></i>Construindo..</div>
								</div>
							</div>
						</div>
					</div>
					<div class="col d-none" id="analise_obs__section">
						<div class="d-none" target="data">
							<div class="row">
								<!-- Tabela Resultado por Grupo -->
								<div class="col">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="analise_obs__table_result"></div>
									</div>
								</div>
								<!-- Grafico Dispersão por Grupo -->
								<div class="col-6">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="analise_obs__chart_dispersaoGrupo"></div>
									</div>
								</div>
							</div>
						</div>
						<div class="" target="empty">
							<div class="card mb-2 rounded-3 shadow-sm">
								<div class="card-body">
									<div class="container-fluid text-center fw-bold text-muted fs-5"><i class="fas fa-cookie-bite me-2"></i>Nada a analisar</div>
								</div>
							</div>
						</div>
						<div class="d-none" target="building">
							<div class="card mb-2 rounded-3 shadow-sm">
								<div class="card-body">
									<div class="container-fluid text-center fw-bold text-muted fs-5"><i class="fas fa-cog fa-spin me-2"></i>Construindo..</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<!-- MODAL (AREA) -->
<div class="modal fade" id="arcaboucos_modal" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xxl">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Arcabouços</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="container-fluid">
					<div class="row"><div class="col"><div id="arcaboucos_modal_toasts"></div></div></div>
					<div class="row">
						<div class="col-4">
							<div class="card rounded-3 shadow-sm">
								<div class="card-body">
									<div class="container-fluid px-0">
										<form class="row m-0 flex-fill" id="arcaboucos_modal_form">
											<div class="col-12">
												<label class="form-label m-1 text-muted fw-bold">Nome</label>
												<input type="text" name="nome" class="form-control form-control-sm" onclick="this.select()">
											</div>
											<div class="col-6">
												<label class="form-label m-1 text-muted fw-bold">Situação</label>
												<select name="situacao" class="form-select form-select-sm">
													<option value="2">Pendente</option>
													<option value="3">Fazendo</option>
													<option value="1">Fechado</option>
												</select>
											</div>
											<div class="col-6">
												<label class="form-label m-1 text-muted fw-bold">Tipo</label>
												<select name="tipo" class="form-select form-select-sm">
													<option value="1">Live</option>
													<option value="2">Replay</option>
													<option value="3">Paper Trade</option>
													<option value="4">Misto</option>
												</select>
											</div>
											<div class="col-12">
												<label class="form-label m-1 text-muted fw-bold">Usuários com Acesso</label>
												<select name="usuarios" multiple></select>
											</div>
											<div class="col-12 mt-2">
												<label class="form-label m-1 text-muted fw-bold">Observações</label>
												<textarea id="arcabouco_modal__observacao" class="form-control form-control-sm"></textarea>
											</div>
											<div class="col-12 mt-3">
												<div class="row">
													<div class="col-8"><button type="button" class="btn btn-sm btn-primary w-100" id="arcaboucos_modal_enviar">Enviar</button></div>
													<div class="col-4"><button type="button" class="btn btn-sm btn-danger w-100" id="arcaboucos_modal_cancelar">Cancelar</button></div>
												</div>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
						<div class="col-8">
							<div class="row">
								<div class="col">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body p-2">
											<div class="container-fluid d-flex justify-content-end px-0">
												<form class="row m-0 flex-fill" id="arcaboucos_modal__search">
													<div class="col-auto">
														<label class="form-label m-0 text-muted fw-bold">Nome</label>
														<input type="text" name="nome" class="form-control form-control-sm" placeholder="Nome">
													</div>
													<div class="col-auto">
														<label class="form-label m-0 text-muted fw-bold">Situação</label>
														<select name="situacao" class="form-select form-select-sm">
															<option value="">Todos</option>
															<option value="2">Pendente</option>
															<option value="3">Fazendo</option>
															<option value="1">Fechado</option>
														</select>
													</div>
													<div class="col-auto">
														<label class="form-label m-0 text-muted fw-bold">Tipo</label>
														<select name="situacao" class="form-select form-select-sm">
															<option value="">Todos</option>
															<option value="1">Live</option>
															<option value="2">Replay</option>
															<option value="3">Paper Trade</option>
															<option value="4">Misto</option>
														</select>
													</div>
												</form>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="row mt-2">
								<div class="col">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body">
											<table class="table" id="table_arcaboucos">
												<thead>
													<tr>
														<th></th>
														<th></th>
														<th>Nome</th>
														<th>Criado Em</th>
														<th>Atualizado</th>
														<th>Trades</th>
														<th>Usuários</th>
														<th></th>
														<th></th>
													</tr>
												</thead>
												<tbody></tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer"></div>
		</div>
	</div>
</div>
<div class="modal fade" id="ativos_modal" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xxl">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Ativos</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="container-fluid">
					<div class="row"><div class="col"><div id="ativos_modal_toasts"></div></div></div>
					<div class="row">
						<div class="col-5">
							<div class="row">
								<div class="col">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body">
											<div class="container-fluid d-flex px-0">
												<form class="row m-0 flex-fill" id="ativos_modal_form">
													<div class="col">
														<label class="form-label m-1 text-muted fw-bold">Nome</label>
														<input type="text" name="nome" class="form-control form-control-sm" onclick="this.select()">
													</div>
													<div class="col">
														<label class="form-label m-1 text-muted fw-bold">Custos</label>
														<input type="text" name="custo" class="form-control form-control-sm" onclick="this.select()">
													</div>
													<div class="col">
														<label class="form-label m-1 text-muted fw-bold">Valor por Tick</label>
														<input type="text" name="valor_tick" class="form-control form-control-sm" onclick="this.select()">
													</div>
													<div class="col">
														<label class="form-label m-1 text-muted fw-bold">Pts por Tick</label>
														<input type="text" name="pts_tick" class="form-control form-control-sm" onclick="this.select()">
													</div>
													<div class="col-12 mt-3">
														<div class="row">
															<div class="col"><button type="button" class="btn btn-sm btn-primary w-100" id="ativos_modal_enviar">Enviar</button></div>
															<div class="col"><button type="button" class="btn btn-sm btn-danger w-100" id="ativos_modal_cancelar">Cancelar</button></div>
														</div>
													</div>
												</form>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="row mt-2">
								<div class="col">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body">
											<table class="table" id="table_ativos">
												<thead>
													<tr>
														<th>Nome</th>
														<th class="text-center">Custo (Abert. + Fech.)</th>
														<th class="text-center">Valor por Tick</th>
														<th class="text-center">Pts por Tick</th>
														<th></th>
														<th></th>
													</tr>
												</thead>
												<tbody></tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="col-7">
							<div class="row">
								<div class="col">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="ativos_modal__vencimentos_search">
											<div class="col">
												<label class="form-label m-1 text-muted fw-bold">Ano Vencimento</label>
												<input type="text" name="ano" class="form-control form-control-sm">
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="row mt-2">
								<div class="col">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body">
											<table id="ativos_modal__vencimentos_table_win_series" class="table">
												<thead>
													<tr>
														<th>Data</th>
														<th class="text-center">Série</th>
													</tr>
												</thead>
												<tbody></tbody>
											</table>
										</div>
									</div>
								</div>
								<div class="col">
									<div class="card mb-4 rounded-3 shadow-sm">
										<div class="card-body">
											<table id="ativos_modal__vencimentos_table_wdo_series" class="table">
												<thead>
													<tr>
														<th>Data</th>
														<th class="text-center">Série</th>
													</tr>
												</thead>
												<tbody></tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer"></div>
		</div>
	</div>
</div>
<div class="modal fade" id="gerenciamentos_modal" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Gerenciamentos</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="container-fluid">
					<div class="row"><div class="col"><div id="gerenciamentos_modal_toasts"></div></div></div>
					<div class="row">
						<div class="col-5">
							<div class="card rounded-3 shadow-sm">
								<div class="card-body">
									<div class="container-fluid d-flex px-0">
										<form class="row m-0 flex-fill" id="gerenciamentos_modal_form">
											<div class="col-12 mb-2">
												<label class="form-label m-1 text-muted fw-bold">Nome</label>
												<input type="text" name="nome" class="form-control form-control-sm" onclick="this.select()">
											</div>
											<div class="col-6">
												<label class="form-label m-1 text-muted fw-bold">Scalps de Gain</label>
												<div class="input-group">
													<input type="text" name="s_gain" class="form-control form-control-sm text-center" placeholder="S" onclick="this.select()" scalp_value>
													<input type="text" name="s_gain" class="form-control form-control-sm text-center" placeholder="Escal." onclick="this.select()" scalp_escalada>
													<button class="btn btn-outline-secondary" type="button" name="s_gain"><i class="fas fa-plus"></i></button>
												</div>
											</div>
											<div class="col-6">
												<label class="form-label m-1 text-muted fw-bold">Scalps de Loss</label>
												<div class="input-group">
													<input type="text" name="s_loss" class="form-control form-control-sm text-center" placeholder="S" onclick="this.select()" scalp_value>
													<input type="text" name="s_loss" class="form-control form-control-sm text-center" placeholder="Escal." onclick="this.select()" scalp_escalada>
													<button class="btn btn-outline-secondary" type="button" name="s_loss"><i class="fas fa-plus"></i></button>
												</div>
											</div>
											<div class="col-12 mt-3">
												<div class="input-group d-flex" id="gerenciamentos_modal_form__acoes"></div>
											</div>
											<div class="col-12 mt-3">
												<div class="row">
													<div class="col"><button type="button" class="btn btn-sm btn-primary w-100" id="gerenciamentos_modal_enviar">Enviar</button></div>
													<div class="col"><button type="button" class="btn btn-sm btn-danger w-100" id="gerenciamentos_modal_cancelar">Cancelar</button></div>
												</div>
											</div>
											<div class="col-12 mt-3">
												<p class="text-muted m-0 tips"><i class="fas fa-info-circle me-1"></i>Duplo clique para remover uma Saída do Gerenciamento.</p>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
						<div class="col-7">
							<div class="card rounded-3 shadow-sm">
								<div class="card-body">
									<table class="table" id="table_gerenciamentos">
										<thead>
											<tr>
												<th>Nome</th>
												<th>Ações</th>
												<th></th>
												<th></th>
											</tr>
										</thead>
										<tbody></tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer"></div>
		</div>
	</div>
</div>
<div class="offcanvas offcanvas-start" id="arcabouco_info">
	<div class="offcanvas-body">
		<div class="container-fluid">
			<div class="row"><div class="col p-0"><div id="arcabouco_info_toasts"></div></div></div>
			<div class="row">
				<div class="col p-0" id="arcabouco_info_place"></div>
			</div>
		</div>
	</div>
</div>
<div class="modal fade" id="cenarios_modal" tabindex="-1" aria-hidden="true" data-bs-keyboard="false">
	<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
		<div class="modal-content h-100">
			<div class="modal-header">
				<h5 class="modal-title">Controle de Cenários</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="container-fluid">
					<div class="row"><div class="col"><div id="cenarios_modal_toasts"></div></div></div>
					<div class="row justify-content-between">
						<div class="col-5">
							<div class="input-group">
								<button type="button" class="btn btn-sm btn-primary" id="cenarios_modal_espelhar"><i class="fas fa-clone me-2"></i>Espelhar de</button>
								<select class="form-select form-select-sm" id="cenarios_modal_espelhar__arcaboucos"></select>
							</div>
						</div>
						<div class="col-5">
							<div class="input-group">
								<select class="form-select form-select-sm" id="cenarios_modal_copiar"></select>
								<button type="button" class="btn btn-sm btn-primary" id="cenarios_modal_adicionar"><i class="fas fa-plus me-2"></i>Cenário</button>
							</div>
						</div>
					</div>
					<div class="row mt-3">
						<div class="col" id="cenarios_modal__cenarios"></div>
					</div>
				</div>
			</div>
			<div class="modal-footer"></div>
		</div>
	</div>
</div>
<div class="offcanvas offcanvas-end" id="lista_ops">
	<div class="offcanvas-body">
		<div class="container-fluid">
			<div class="row"><div class="col p-0"><div id="lista_ops_toasts"></div></div></div>
			<div class="row">
				<div class="col p-0">
					<div class="card mb-2 rounded-3 shadow-sm">
						<div class="card-body p-2">
							<div class="container-fluid d-flex justify-content-end px-0">
								<form class="row m-0 flex-fill" id="lista_ops__search">
									<div class="col-auto">
										<label class="form-label m-0 text-muted fw-bold">Data</label>
										<input type="text" name="data" class="form-control form-control-sm" placeholder="Data">
									</div>
									<div class="col-auto" name="ativo">
										<label class="form-label m-0 text-muted fw-bold">Ativo</label>
										<select name="ativo" class="form-control form-control-sm init" multiple></select>
									</div>
									<div class="col-auto" name="cenario">
										<label class="form-label m-0 text-muted fw-bold">Cenário</label>
										<select name="cenario" class="form-control form-control-sm init" multiple></select>
									</div>
									<div class="col-auto" name="gerenciamento">
										<label class="form-label m-0 text-muted fw-bold">Gerenciamento</label>
										<select name="gerenciamento" class="form-control form-control-sm init" multiple></select>
									</div>
								</form>
							</div>
						</div>
					</div>
					<div class="card mb-2 rounded-3 shadow-sm">
						<div class="card-body p-2">
							<div class="container-fluid d-flex justify-content-end px-0" id="lista_ops__actions">
								<button class="btn btn-sm btn-outline-danger me-2 d-none" type="button" name="remove_sel" title="Duplo Clique"><i class="fas fa-trash me-2"></i>Apagar Selecionado</button>
								<button class="btn btn-sm btn-danger" type="button" name="remove_all" title="Duplo Clique"><i class="fas fa-trash-alt me-2"></i>Apagar Tudo</button>
							</div>
						</div>
					</div>
					<div class="card rounded-3 shadow-sm">
						<div class="card-body">
							<table id="lista_ops__table" class="table table-hover w-100">
								<thead>
									<tr>
										<th>#</th>
										<th>Data</th>
										<th>Hora</th>
										<th>Ativo</th>
										<th>Gerenciamento</th>
										<th class="text-center">Op.</th>
										<th>Vol</th>
										<th>Result.</th>
										<th>Cenário</th>
										<th>Obs. Ref</th>
										<th>Erro</th>
									</tr>
								</thead>
								<tbody></tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<div class="modal fade" id="upload_operacoes_modal" tabindex="-1" aria-hidden="true" data-bs-keyboard="false">
	<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Upload de Operações</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="container-fluid">
					<div class="row"><div class="col p-0"><div id="upload_operacoes_modal_toasts"></div></div></div>
					<div class="row">
						<div class="col bg-light p-3">
							<div class="row">
								<div class="col-2">
									<label class="form-label m-1 text-muted fw-bold">Fonte do Arquivo</label>
									<select id="file_format" class="form-select form-select-sm" disabled>
										<option value="excel">Excel</option>
										<!-- <option value="profit">Profit</option> -->
										<!-- <option value="tryd">Tryd</option> -->
									</select>
								</div>
								<div class="col-2">
									<label class="form-label m-1 text-muted fw-bold">Operações de</label>
									<select id="table_layout" class="form-select form-select-sm" disabled>
										<option value="scalp">Scalp</option>
										<option value="tendencia">Tendência</option>
									</select>
								</div>
								<div class="col-8">
									<label class="form-label m-1 text-muted fw-bold">Arquivo</label>
									<input class="form-control form-control-sm col" type="file" id="upload_operacoes_modal_file">
								</div>
							</div>
						</div>
					</div>
					<div class="row mt-3">
						<div class="col bg-light p-3">
							<table id="table_upload_operacoes" class="table m-0">
								<thead></thead>
								<tbody></tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer d-flex">
				<button type="button" class="btn btn-secondary btn-sm col-1" data-bs-dismiss="modal">Fechar</button>
				<button type="button" class="btn btn-success btn-sm col-1 ms-auto" id="upload_operacoes_modal_enviar">Salvar</button>
			</div>
		</div>
	</div>
</div>
<div class="offcanvas offcanvas-end" id="adicionar_operacoes_offcanvas">
	<div class="offcanvas-body">
		<div class="container-fluid p-0">
			<div class="row"><div class="col"><div id="adicionar_operacoes_offcanvas_toasts"></div></div></div>
			<div class="row">
				<div class="col">
					<div class="card rounded-3 shadow-sm">
						<div class="card-body p-2">
							<div class="container-fluid d-flex justify-content-end px-0">
								<form class="row m-0 flex-fill" id="adicionar_operacoes_offcanvas__form_default">
									<div class="col-auto" name="hoje">
										<label class="form-label m-0 text-muted fw-bold">Data (Padrão)</label>
										<select name="hoje" class="form-control form-control-sm init" multiple>
											<option value="1" selected>Hoje</option>
										</select>
									</div>
									<div class="col-auto">
										<label class="form-label m-0 text-muted fw-bold">Ativo (Padrão)</label>
										<input type="text" name="ativo" class="form-control form-control-sm" placeholder="Ativo">
									</div>
									<div class="col-auto">
										<label class="form-label m-0 text-muted fw-bold">Cts (Padrão)</label>
										<input type="text" name="cts" class="form-control form-control-sm" placeholder="Cts">
									</div>
									<div class="col-auto">
										<label class="form-label m-0 text-muted fw-bold">Cenário (Padrão)</label>
										<input type="text" name="cenario" class="form-control form-control-sm" placeholder="Cenário">
									</div>
									<div class="col-auto" name="gerenciamento">
										<label class="form-label m-0 text-muted fw-bold">R:R (Gerenciamentos)</label>
										<select name="gerenciamento" class="form-control form-control-sm init" multiple></select>
									</div>
									<div class="col-auto">
										<label class="form-label m-0 text-muted fw-bold">Tempo Gráfico</label>
										<select name="tempo_grafico" class="form-select form-select-sm">
											<option value="5" selected>5min</option>
										</select>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="row mt-3">
				<div class="col-4">
					<button class="btn btn-sm btn-primary w-100" type="button" id="adicionar_operacoes_offcanvas__new_bloco"><i class="fas fa-plus me-2" aria-hidden="true"></i>Nova Operação</button>
				</div>
				<div class="col-4">
					<button class="btn btn-sm btn-success w-100" type="button" id="adicionar_operacoes_offcanvas__enviar"><i class="fas fa-paper-plane me-2" aria-hidden="true"></i>Enviar</button>
				</div>
				<div class="col-4">
					<button class="btn btn-sm btn-outline-danger w-100" type="button" id="adicionar_operacoes_offcanvas__erase_all"><i class="fas fa-trash-alt me-2" aria-hidden="true"></i>Limpa</button>
				</div>
			</div>
			<div class="row mt-3">
				<div class="col-8">
					<div class="card rounded-3 shadow-sm overflow-auto">
						<div class="card-body">
							<table id="table_adicionar_operacoes" class="table table-sm m-0 w-100">
								<thead></thead>
								<tbody></tbody>
							</table>
						</div>
					</div>
				</div>
				<div class="col-4">
					<div class="row">
						<div class="col-12 ps-0">
							<div class="card rounded-3 shadow-sm">
								<div class="card-body">
									<div class="container-fluid d-flex justify-content-end px-0">
										<form class="row m-0 flex-fill" id="adicionar_operacoes_offcanvas__contagem">
											<div class="col-6">
												<label class="form-label m-0 text-muted fw-bold">Contagem Tendência</label>
												<div class="input-group">
													<input type="text" class="form-control form-control-sm" name="c_tendencia" value="" raw_value="0" not_ok="0" disabled>
													<button class="btn btn-sm btn-outline-secondary" type="button" name="up_c_tendencia"><i class="fas fa-caret-up"></i></button>
													<button class="btn btn-sm btn-outline-secondary" type="button" name="down_c_tendencia"><i class="fas fa-caret-down"></i></button>
													<button class="btn btn-sm btn-outline-secondary" type="button" name="restart_c_tendencia"><i class="fas fa-times"></i></button>
												</div>
											</div>
											<div class="col-6">
												<label class="form-label m-0 text-muted fw-bold">Contagem Pernada</label>
												<div class="input-group">
													<input type="text" class="form-control form-control-sm" name="c_pernada" value="" raw_value="0" not_ok="0" disabled>
													<button class="btn btn-sm btn-outline-secondary" type="button" name="up_c_pernada"><i class="fas fa-caret-up"></i></button>
													<button class="btn btn-sm btn-outline-secondary" type="button" name="down_c_pernada"><i class="fas fa-caret-down"></i></button>
													<button class="btn btn-sm btn-outline-secondary" type="button" name="restart_c_pernada"><i class="fas fa-times"></i></button>
												</div>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="row mt-2">
						<div class="col-12 ps-0">
							<div class="card rounded-3 shadow-sm">
								<div class="card-body">
									<div id="adicionar_operacoes__extraDados">
										<div class="container-fluid p-4 text-center text-muted fw-bold"><i class="fas fa-cookie-bite me-2" aria-hidden="true"></i>Nada a mostrar</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>