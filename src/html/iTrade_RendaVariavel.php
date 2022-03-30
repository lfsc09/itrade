<div class="container-fluid">
	<div class="row">
		<div class="col d-flex">
			<div class="container-fluid bg-light p-5 pt-3 rounded">
				<div class="container-fluid d-flex mb-4 px-0" id="renda_variavel__menu">
					<button class="btn btn-sm btn-primary me-2" type="button" name="arcaboucos"><i class="fas fa-archive me-2"></i>Arcabouços</button>
					<button class="btn btn-sm btn-primary me-2" type="button" name="ativos"><i class="fas fa-euro-sign me-2"></i>Ativos</button>
					<button class="btn btn-sm btn-primary" type="button" name="gerenciamentos"><i class="fas fa-coins me-2"></i>Gerenciamentos</button>
					<button class="btn btn-sm btn-outline-primary ms-auto me-2" type="button" name="arcabouco_info"><i class="fas fa-info-circle me-2"></i>Info</button>
					<button class="btn btn-sm btn-outline-primary me-2" type="button" name="cenarios"><i class="fas fa-tasks me-2"></i>Gerir Cenários</button>
					<button class="btn btn-sm btn-outline-primary me-2" type="button" name="builds"><i class="fas fa-flask me-2"></i>Builds</button>
					<div class="btn-group" role="group">
						<button class="btn btn-sm btn-outline-primary" type="button" name="adicionar_operacoes"><i class="fab fa-buffer me-2"></i>Adicionar Operações</button>
						<button class="btn btn-sm btn-outline-primary" type="button" name="upload_operacoes"><i class="fas fa-cloud-upload-alt"></i></button>
					</div>
				</div>
				<div class="row mb-4">
					<div class="col" id="renda_variavel__instancia"></div>
				</div>
				<div class="row">
					<div class="col" id="renda_variavel__search">
						<div class="row">
							<div class="col">
								<button class="btn btn-primary" type="button" id="renda_variavel__search_build"><i class="fas fa-magic"></i></button>
							</div>
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
															<li><h6 class="dropdown-header text-decoration-underline">No Dia</h6></li>
															<li class="not-selectable">
																<label class="text-muted fw-bold">N (Total)</label>
																<div class="input-group">
																	<input class="form-control form-control-sm" type="input" tipo_parada="sd1" name="valor_parada" placeholder="Stops" onclick="this.select()">
																	<input class="form-control form-control-sm" type="input" tipo_parada="gd1" name="valor_parada" placeholder="Gains" onclick="this.select()">
																</div>
															</li>
															<li class="not-selectable">
																<label class="text-muted fw-bold">N (Sequencia)</label>
																<div class="input-group">
																	<input class="form-control form-control-sm" type="input" tipo_parada="sd2" name="valor_parada" placeholder="Stops" onclick="this.select()">
																	<input class="form-control form-control-sm" type="input" tipo_parada="gd2" name="valor_parada" placeholder="Gains" onclick="this.select()">
																</div>
															</li>
															<li class="not-selectable">
																<label class="text-muted fw-bold">R$ (Final)</label>
																<div class="input-group">
																	<input class="form-control form-control-sm" type="input" tipo_parada="sd3" name="valor_parada" placeholder="Perda" onclick="this.select()">
																	<input class="form-control form-control-sm" type="input" tipo_parada="gd3" name="valor_parada" placeholder="Ganho" onclick="this.select()">
																</div>
															</li>
															<li class="not-selectable">
																<label class="text-muted fw-bold">R$ (Bruto)</label>
																<div class="input-group">
																	<input class="form-control form-control-sm" type="input" tipo_parada="sd4" name="valor_parada" placeholder="Perda" onclick="this.select()">
																	<input class="form-control form-control-sm" type="input" tipo_parada="gd4" name="valor_parada" placeholder="Ganho" onclick="this.select()">
																</div>
															</li>
															<li class="not-selectable">
																<label class="text-muted fw-bold">Quantidade R (Final)</label>
																<div class="input-group">
																	<input class="form-control form-control-sm" type="input" tipo_parada="sd5" name="valor_parada" placeholder="Perda" onclick="this.select()">
																	<input class="form-control form-control-sm" type="input" tipo_parada="gd5" name="valor_parada" placeholder="Ganhos" onclick="this.select()">
																</div>
															</li>
															<li class="not-selectable">
																<label class="text-muted fw-bold">Quantidade R (Bruto)</label>
																<div class="input-group">
																	<input class="form-control form-control-sm" type="input" tipo_parada="sd6" name="valor_parada" placeholder="Perda" onclick="this.select()">
																	<input class="form-control form-control-sm" type="input" tipo_parada="gd6" name="valor_parada" placeholder="Ganhos" onclick="this.select()">
																</div>
															</li>
															<li><h6 class="dropdown-header text-decoration-underline">Na Semana</h6></li>
															<li class="not-selectable">
																<label class="text-muted fw-bold">N dias (Cheio)</label>
																<div class="input-group">
																	<input class="form-control form-control-sm" type="input" tipo_parada="ss1" name="valor_parada" placeholder="Stops" onclick="this.select()">
																	<input class="form-control form-control-sm" type="input" tipo_parada="gs1" name="valor_parada" placeholder="Gains" onclick="this.select()">
																</div>
															</li>
															<li class="not-selectable">
																<label class="text-muted fw-bold">N dias (Total)</label>
																<div class="input-group">
																	<input class="form-control form-control-sm" type="input" tipo_parada="ss2" name="valor_parada" placeholder="Stops" onclick="this.select()">
																	<input class="form-control form-control-sm" type="input" tipo_parada="gs2" name="valor_parada" placeholder="Gains" onclick="this.select()">
																</div>
															</li>
															<li class="not-selectable">
																<label class="text-muted fw-bold">N dias (Sequencia)</label>
																<div class="input-group">
																	<input class="form-control form-control-sm" type="input" tipo_parada="ss3" name="valor_parada" placeholder="Stops" onclick="this.select()">
																	<input class="form-control form-control-sm" type="input" tipo_parada="gs3" name="valor_parada" placeholder="Gains" onclick="this.select()">
																</div>
															</li>
														</ul>
													</div>
												</div>
												<div class="col-auto">
													<label class="form-label m-0 text-muted fw-bold">Simular Capital / R / Margem</label>
													<div class="input-group">
														<input type="text" name="valor_inicial" class="form-control form-control-sm" onclick="this.select()" placeholder="Capital">
														<input type="text" name="R" class="form-control form-control-sm" onclick="this.select()" placeholder="R">
														<div class="input-group-text">
															<input class="form-check-input m-0" type="checkbox" value="" name="R_filter_ops"><i class="fas fa-filter ms-2 text-muted"></i>
														</div>
														<input type="text" name="margem" class="form-control form-control-sm" onclick="this.select()" placeholder="Margem">
													</div>
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
								<div class="col-8" id="dashboard_ops__table_trades__place"></div>
								<div class="col-4">
									<!-- Graficos Horario -->
									<div class="row">
										<div class="col-12">
											<div class="card rounded-3 shadow-sm">
												<div class="card-body" id="dashboard_ops__chart_resultadoPorHorario"></div>
											</div>
										</div>
									</div>
									<!-- Graficos Sequencia de Result. -->
									<div class="row mt-3">
										<div class="col-12">
											<div class="card rounded-3 shadow-sm">
												<div class="card-body" id="dashboard_ops__chart_sequenciaResults"></div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="row mt-3">
								<!-- Graficos Evolução Patrimonial -->
								<div class="col">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="dashboard_ops__chart_evolucaoPatrimonial"></div>
									</div>
								</div>
							</div>
							<div class="row mt-3">
								<!-- Grafico Trades Resultados Normalizado -->
								<div class="col-7">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="dashboard_ops__chart_resultadoNormalizado"></div>
									</div>
								</div>
								<!-- Graficos Histórico de Drawdown -->
								<div class="col-5">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="dashboard_ops__chart_drawdown"></div>
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
													<div class="col-8"><button type="button" class="btn btn-sm btn-primary w-100" id="arcaboucos_modal_enviar"><i class="fas fa-angle-double-up me-2"></i>Enviar</button></div>
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
															<div class="col"><button type="button" class="btn btn-sm btn-primary w-100" id="ativos_modal_enviar"><i class="fas fa-angle-double-up me-2"></i>Enviar</button></div>
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
													<div class="col"><button type="button" class="btn btn-sm btn-primary w-100" id="gerenciamentos_modal_enviar"><i class="fas fa-angle-double-up me-2"></i>Enviar</button></div>
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
			<div class="row mt-2">
				<div class="col p-0" id="arcabouco_info__actions">
					<button class="btn btn-sm col-12 btn-outline-primary btn-nohover" type="button" name="extract_all" hold_time="1500"><span><i class="fas fa-angle-double-down me-2" aria-hidden="true"></i>Baixar Tudo</span></button>
					<button class="btn btn-sm col-12 mt-2 btn-outline-danger btn-nohover" type="button" name="remove_all" hold_time="2000"><span><i class="fas fa-trash me-2" aria-hidden="true"></i>Apagar Tudo</span></button>
				</div>
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
			<div class="modal-footer"><button type="button" class="btn btn-sm btn-success w-25" id="cenarios_modal_atualizar"><i class="fas fa-angle-double-up me-2"></i>Atualizar</button></div>
		</div>
	</div>
</div>
<div class="modal fade" id="builds_modal" tabindex="-1" aria-hidden="true" data-bs-keyboard="false">
	<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
		<div class="modal-content h-100">
			<div class="modal-header">
				<h5 class="modal-title">Rodar Builds</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="container-fluid">
					<div class="row"><div class="col"><div id="builds_modal_toasts"></div></div></div>
					<div class="row mt-3">
						<div class="col" id="builds_modal__runs">
							<div class="card text-center" name="tipo_parada__comb">
								<div class="card-header d-flex align-items-center">
									<div class="col-5">
										<p class="m-1 text-start fw-bold"><code>Build (Tipo Parada)</code></p>
										<div class="progress"><div class="progress-bar bg-success" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>
									</div>
									<button type="button" class="btn btn-sm btn-outline-secondary align-self-stretch ms-auto" info_build><i class="fas fa-info-circle" aria-hidden="true"></i></button>
									<button type="button" class="btn btn-sm btn-primary ms-2" build="tipo_parada__comb" run_build>Run Build<i class="fas fa-vial ms-2" aria-hidden="true"></i></button>
								</div>
								<div class="card-body">
									<div name="builds_modal__runs_vars">
										<table class="table table-sm table-borderless text-muted m-0">
											<thead>
												<tr>
													<th></th>
													<th></th>
													<th>Stop</th>
													<th>Gain</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td rowspan="9">Gerar dados para testar uma combinação de gerenciamentos de saida usando os filtros aplicados.</td>
													<td name="label"><kbd>N (Total)</kbd></td>
													<td name="stop"><input type="text" class="form-control form-control-sm text-center" name="sd1" increment></td>
													<td name="gain"><input type="text" class="form-control form-control-sm text-center" name="gd1" increment></td>
												</tr>
												<tr>
													<td name="label"><kbd>N (Sequencia)</kbd></td>
													<td name="stop"><input type="text" class="form-control form-control-sm text-center" name="sd2" increment></td>
													<td name="gain"><input type="text" class="form-control form-control-sm text-center" name="gd2" increment></td>
												</tr>
												<tr>
													<td name="label"><kbd>R$ (Final)</kbd></td>
													<td name="stop"><input type="text" class="form-control form-control-sm text-center" name="sd3"></td>
													<td name="gain"><input type="text" class="form-control form-control-sm text-center" name="gd3"></td>
												</tr>
												<tr>
													<td name="label"><kbd>R$ (Bruto)</kbd></td>
													<td name="stop"><input type="text" class="form-control form-control-sm text-center" name="sd4"></td>
													<td name="gain"><input type="text" class="form-control form-control-sm text-center" name="gd4"></td>
												</tr>
												<tr>
													<td name="label"><kbd>Quantidade R (Final)</kbd></td>
													<td name="stop"><input type="text" class="form-control form-control-sm text-center" name="sd5"></td>
													<td name="gain"><input type="text" class="form-control form-control-sm text-center" name="gd5"></td>
												</tr>
												<tr>
													<td name="label"><kbd>Quantidade R (Bruto)</kbd></td>
													<td name="stop"><input type="text" class="form-control form-control-sm text-center" name="sd6"></td>
													<td name="gain"><input type="text" class="form-control form-control-sm text-center" name="gd6"></td>
												</tr>
												<tr>
													<td name="label"><kbd>N dias (Cheio)</kbd></td>
													<td name="stop"><input type="text" class="form-control form-control-sm text-center" name="ss1" increment></td>
													<td name="gain"><input type="text" class="form-control form-control-sm text-center" name="gs1" increment></td>
												</tr>
												<tr>
													<td name="label"><kbd>N dias (Total)</kbd></td>
													<td name="stop"><input type="text" class="form-control form-control-sm text-center" name="ss2" increment></td>
													<td name="gain"><input type="text" class="form-control form-control-sm text-center" name="gs2" increment></td>
												</tr>
												<tr>
													<td name="label"><kbd>N dias (Sequencia)</kbd></td>
													<td name="stop"><input type="text" class="form-control form-control-sm text-center" name="ss3" increment></td>
													<td name="gain"><input type="text" class="form-control form-control-sm text-center" name="gs3" increment></td>
												</tr>
											</tbody>
										</table>
									</div>
									<div class="d-none" name="builds_modal__runs_info">
										<p class="text-muted text-start" name="run_stats"><span class="fw-bold">Total Runs: </span><span value></span></p>
										<table class="table table-sm"></table>
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
					<div class="row" tabindex="-1" id="upload_operacoes_modal__tips">
						<div class="col bg-light p-3">
							<dl class="row m-0">
								<dt class="col-sm-3 mt-2">Campos Reconhecidos / <kbd class="bg-primary">Obrigatórios</kbd></dt>
								<dd class="col-sm-9">
									<table class="table text-muted m-0">
										<tbody>
											<tr>
												<td><kbd class="bg-primary">data</kbd></td>
												<td>Apenas no formato <code>dd/mm/aaaa</code> ou <code>aaaa-mm-dd</code></td>
											</tr>
											<tr>
												<td><kbd class="bg-primary">hora</kbd></td>
												<td>Apenas no formato <code>hh:mm:ss</code> ou <code>hh:mm</code></td>
											</tr>
											<tr>
												<td><kbd>sequencia</kbd></td>
												<td>&nbsp;</td>
											</tr>
											<tr>
												<td><kbd class="bg-primary">ativo</kbd></td>
												<td class="fw-bold">
													<p class="mb-1">Se acompanhado das colunas <kbd>ativo_custo</kbd> <kbd>ativo_valor_tick</kbd> <kbd>ativo_pts_tick</kbd> irá auto-cadastrar, se não estiver cadastrado</p>
													<p class="m-0">Se vier apenas o nome do ativo, este já deve estar cadastrado</p>
												</td>
											</tr>
											<tr>
												<td><kbd class="bg-primary">gerenciamento</kbd></td>
												<td class="fw-bold">Gerenciamentos passados já devem estar cadastrados</td>
											</tr>
											<tr>
												<td><kbd class="bg-primary">op</kbd></td>
												<td>Deverá ser <code>'1'</code> para Compras e <code>'2'</code> para Vendas</td>
											</tr>
											<tr>
												<td><kbd class="bg-primary">vol</kbd></td>
												<td>&nbsp;</td>
											</tr>
											<tr>
												<td><kbd class="bg-primary">cts</kbd></td>
												<td>&nbsp;</td>
											</tr>
											<tr>
												<td><kbd>escalada</kbd></td>
												<td>Informar <code>'1'</code> se a operação foi escalada 1 vez, <code>'2'</code> para 2 vezes...</td>
											</tr>
											<tr>
												<td><kbd>erro</kbd></td>
												<td>Informar <code>'1'</code> se a operação foi errada</td>
											</tr>
											<tr>
												<td><kbd class="bg-primary">resultado</kbd></td>
												<td>Usar <code>'.'</code> nas casas decimais</td>
											</tr>
											<tr>
												<td><kbd class="bg-primary">cenario</kbd></td>
												<td class="fw-bold">Cenários passados já devem estar cadastrados</td>
											</tr>
											<tr>
												<td><kbd>observacoes</kbd></td>
												<td>Se informado, separar os números por <code>','</code></td>
											</tr>
											<tr>
												<td><kbd>gerenciamento_acoes</kbd></td>
												<td>&nbsp;</td>
											</tr>
										</tbody>
									</table>
								</dd>
							</dl>
						</div>
					</div>
					<div class="row mt-3">
						<div class="col bg-light p-3">
							<div class="row">
								<div class="col-12">
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
				<button type="button" class="btn btn-success btn-sm col-1 ms-auto" id="upload_operacoes_modal_enviar"><i class="fas fa-angle-double-up me-2"></i>Salvar</button>
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