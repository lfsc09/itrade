<div class="container-fluid">
	<div class="row">
		<div class="col d-flex">
			<div class="container-fluid bg-light p-5 pt-3 rounded">
				<div class="container-fluid d-flex mb-4 px-0" id="controle_financeiro__menu">
					<button class="btn btn-sm btn-primary me-2" type="button" name="contas"><i class="fas fa-file-invoice-dollar me-2"></i>Contas</button>
					<button class="btn btn-sm btn-primary me-2" type="button" name="categorias"><i class="fas fa-tags me-2"></i>Categorias</button>
					<button class="btn btn-sm btn-primary me-2" type="button" name="cartoes_credito"><i class="fas fa-credit-card me-2"></i>Cartões Crédito</button>
					<button class="btn btn-sm btn-primary me-2" type="button" name="despesas_fixas"><i class="fas fa-book me-2"></i>Despesas Fixas</button>
					<div class="btn-group ms-auto" role="group">
						<button class="btn btn-sm btn-outline-primary" type="button" name="adicionar_lancamentos"><i class="fab fa-buffer me-2"></i>Adicionar Lançamentos</button>
						<div class="btn-group" role="group">
							<button type="button" class="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown"></button>
							<ul class="dropdown-menu">
								<li><a class="dropdown-item" href="#" name="lista_lanc"><i class="fas fa-list-ul me-2"></i>Lançamentos</a></li>
								<li><a class="dropdown-item" href="#" name="upload_lancamentos"><i class="fas fa-cloud-upload-alt me-2"></i>Upload Lançamentos</a></li>
							</ul>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col" id="controle_financeiro__search">
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
												<div class="col-auto" name="conta">
													<label class="form-label m-0 text-muted fw-bold">Filtrar Conta</label>
													<select name="conta" class="form-control form-control-sm init" multiple></select>
												</div>
												<div class="col-auto" name="cartao">
													<label class="form-label m-0 text-muted fw-bold">Filtrar Cartão</label>
													<select name="cartao" class="form-control form-control-sm init" multiple></select>
												</div>
												<div class="col-auto" name="tipo">
													<label class="form-label m-0 text-muted fw-bold">Filtrar Tipo</label>
													<select name="tipo" class="form-select form-select-sm ms-auto">
														<option value="">Todos</option>
														<option value="1">Despesa</option>
														<option value="2">Receita</option>
														<option value="3">Transferência</option>
													</select>
												</div>
												<div class="col-auto" name="categorias">
													<label class="form-label m-0 text-muted fw-bold">Filtrar Categorias</label>
													<div class="iSelectKami dropdown bootstrap-select w-100" name="categorias">
														<button class="form-control form-control-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside">Categorias</button>
														<ul class="dropdown-menu overflow-auto"></ul>
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
					<div class="col" id="dashboard_lanc__section">
						<div class="d-none" target="data">
							<!-- Tabela de dados por Cenário -->
							<div class="row">
								<div class="col">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="dashboard_lanc__table_stats__byCenario__place"></div>
									</div>
								</div>
							</div>
							<div class="row mt-4">
								<!-- Tabela de Trades -->
								<div class="col-6" id="dashboard_lanc__table_trades__place">
								</div>
								<!-- Grafico Trades Resultados Normalizado -->
								<div class="col-6">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="dashboard_lanc__chart_resultadoNormalizado"></div>
									</div>
								</div>
							</div>
							<div class="row mt-3">
								<!-- Graficos Horario -->
								<div class="col-3">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="dashboard_lanc__chart_resultadoPorHorario"></div>
									</div>
								</div>
								<!-- Graficos Evolução Patrimonial -->
								<div class="col-9">
									<div class="card rounded-3 shadow-sm">
										<div class="card-body" id="dashboard_lanc__chart_evolucaoPatrimonial"></div>
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
<div class="modal fade" id="contas_modal" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Contas</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="container-fluid">
					<div class="row"><div class="col"><div id="contas_modal_toasts"></div></div></div>
					<div class="row">
						<div class="col">
							<div class="card rounded-3 shadow-sm">
								<div class="card-body">
									<div class="container-fluid d-flex px-0">
										<form class="row m-0 flex-fill" id="contas_modal_form">
											<div class="col-4">
												<label class="form-label m-1 text-muted fw-bold">Banco</label>
												<input type="text" name="banco" class="form-control form-control-sm" onclick="this.select()">
											</div>
											<div class="col-4">
												<label class="form-label m-1 text-muted fw-bold">Número Conta</label>
												<input type="text" name="numero" class="form-control form-control-sm" onclick="this.select()">
											</div>
											<div class="col-2">
												<label class="form-label m-1 text-muted fw-bold">Local da Conta</label>
												<input type="text" name="local" class="form-control form-control-sm" onclick="this.select()">
											</div>
											<div class="col-2">
												<label class="form-label m-1 text-muted fw-bold">Cor</label>
												<div class="d-flex">
													<input type="color" name="cor" class="form-control form-control-sm form-control-color">
												</div>
											</div>
											<div class="col-12 mt-3">
												<div class="row">
													<div class="col"><button type="button" class="btn btn-sm btn-primary w-100" id="contas_modal_enviar">Enviar</button></div>
													<div class="col"><button type="button" class="btn btn-sm btn-danger w-100" id="contas_modal_cancelar">Cancelar</button></div>
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
									<table class="table" id="table_contas">
										<thead>
											<tr>
												<th></th>
												<th>Banco</th>
												<th>Número</th>
												<th>Local</th>
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
<div class="modal fade" id="cartoes_credito_modal" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Cartões de Crédito</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="container-fluid">
					<div class="row"><div class="col"><div id="cartoes_credito_modal_toasts"></div></div></div>
					<div class="row">
						<div class="col">
							<div class="card rounded-3 shadow-sm">
								<div class="card-body">
									<div class="container-fluid d-flex px-0">
										<form class="row m-0 flex-fill" id="cartoes_credito_modal_form">
											<div class="col-6">
												<label class="form-label m-1 text-muted fw-bold">Banco</label>
												<input type="text" name="banco" class="form-control form-control-sm" onclick="this.select()">
											</div>
											<div class="col-6">
												<label class="form-label m-1 text-muted fw-bold">Número</label>
												<input type="text" name="numero" class="form-control form-control-sm" onclick="this.select()">
											</div>
											<div class="col-12 mt-3">
												<div class="row">
													<div class="col"><button type="button" class="btn btn-sm btn-primary w-100" id="cartoes_credito_modal_enviar">Enviar</button></div>
													<div class="col"><button type="button" class="btn btn-sm btn-danger w-100" id="cartoes_credito_modal_cancelar">Cancelar</button></div>
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
									<table class="table" id="table_cartoes_credito">
										<thead>
											<tr>
												<th>Banco</th>
												<th>Número</th>
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