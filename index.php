<?php session_start(); ?>
<?php if (!isset($_SESSION["username"])){ ?>
	<html>
		<meta http-equiv="Content-type" content="text/html;charset=utf-8" />
		<head>
			<title>iTrade</title>
			<link rel="shortcut icon" href="favicon.ico">
			<link rel="stylesheet" href="src/css/bootstrap.min.css">
			<link rel="stylesheet" href="src/css/iTrade.css">
			<script src="src/js/base/jquery_3.6.0.min.js"></script>
			<script src="src/js/base/bootstrap.bundle.min.js"></script>
			<style type="text/css">
				html,body {
					height: 100%;
				}
				body {
					display: flex;
					align-items: center;
					padding-top: 40px;
					padding-bottom: 40px;
					background-color: #f5f5f5;
				}
				.form-signin {
					width: 100%;
					max-width: 330px;
					padding: 15px;
					margin: auto;
				}
				.form-signin .form-floating:focus-within {
					z-index: 2;
				}
				.form-signin input[type="text"] {
					margin-bottom: -1px;
					border-bottom-right-radius: 0;
					border-bottom-left-radius: 0;
				}
				.form-signin input[type="password"] {
					margin-bottom: 10px;
					border-top-left-radius: 0;
					border-top-right-radius: 0;
				}
			</style>
		</head>
		<body>
			<main class="form-signin">
				<form class="needs-validation" novalidate>
					<div class="form-floating">
						<input type="text" class="form-control" id="floatingInput" placeholder="User" name="username" required autofocus>
						<label for="floatingInput">User</label>
					</div>
					<div class="form-floating">
						<input type="password" class="form-control" id="floatingPassword" placeholder="Password" name="password" required>
						<label for="floatingPassword">Password</label>
					</div>
					<button class="w-100 btn btn-lg btn-primary" type="button" id="signin">Sign in</button>
				</form>
			</main>
		</body>
		<script src="src/js/base/md5.min.js"></script>
		<script src="src/js/iLogin.js"></script>
	</html>
<?php } else { ?>
	<html>
		<meta http-equiv="Content-type" content="text/html;charset=utf-8" />
		<head>
			<title>iTrade | <?=explode(" ", $_SESSION["name"])[0]?></title>
			<link rel="shortcut icon" href="favicon.ico">
			<link rel="stylesheet" href="src/css/bootstrap.min.css">
			<link rel="stylesheet" href="src/css/bootstrap-select.min.css">
			<link rel="stylesheet" href="src/css/datatables.min.css">
			<link rel="stylesheet" href="src/css/daterangepicker.min.css">
			<link rel="stylesheet" href="src/css/noUiSlider.min.css">
			<link rel="stylesheet" href="src/css/iTrade.css">
			<script src="https://kit.fontawesome.com/9bb84e5d3e.js" crossorigin="anonymous"></script>
			<script src="src/js/base/jquery_3.6.0.min.js"></script>
			<script src="src/js/base/popper.min.js"></script>
			<script src="src/js/base/jquery.inputmask.min.js"></script>
			<script src="src/js/base/bootstrap.bundle.min.js"></script>
			<script src="src/js/base/bootstrap-select.min.js"></script>
			<script src="src/js/base/moment.min.js"></script>
			<script src="src/js/base/daterangepicker.min.js"></script>
			<script src="src/js/base/noUiSlider.min.js"></script>
			<script src="src/js/base/chart.min.js"></script>
			<script src="src/js/base/chart-plugin-annotation.min.js"></script>
			<!-- DataTables -->
			<script src="src/js/base/datatables.min.js"></script>
			<script src="src/js/base/datatables.pagination.min.js"></script>
		</head>
		<body class="container container-body">
			<div class="position-fixed top-0 end-0 p-3" id="master_toasts"></div>
			<div class="container-fluid" id="renda_variavel">
				<div class="row">
					<div class="col d-flex">
						<div class="container-fluid bg-light p-5 pt-3 rounded">
							<div class="container-fluid d-flex mb-4 px-0" id="renda_variavel__menu">
								<button class="btn btn-sm btn-primary me-2" type="button" name="arcaboucos"><i class="fas fa-archive me-2"></i>Arcabouços</button>
								<button class="btn btn-sm btn-primary me-2" type="button" name="ativos"><i class="fas fa-euro-sign me-2"></i>Ativos</button>
								<button class="btn btn-sm btn-primary" type="button" name="gerenciamentos"><i class="fas fa-coins me-2"></i>Gerenciamentos</button>
								<button class="btn btn-sm btn-outline-primary ms-auto me-2" type="button" name="info_arcabouco"><i class="fas fa-info-circle me-2"></i>Info</button>
								<button class="btn btn-sm btn-outline-primary me-2" type="button" name="cenarios"><i class="fas fa-tasks me-2"></i>Gerir Cenários</button>
								<button class="btn btn-sm btn-outline-primary me-2" type="button" name="lista_ops"><i class="fas fa-list-ul me-2"></i>Operações</button>
								<button class="btn btn-sm btn-outline-primary me-2" type="button" name="upload_operacoes"><i class="fas fa-cloud-upload-alt me-2"></i>Upload Operações</button>
								<button class="btn btn-sm btn-outline-primary" type="button" name="adicionar_operacoes"><i class="fab fa-buffer me-2"></i>Adicionar Operações</button>
							</div>
							<div class="row mb-4">
								<div class="col" id="renda_variavel__instancias"></div>
							</div>
							<div class="row">
								<div class="col" id="dashboard_ops__search">
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
															<div class="col-auto" name="cenario">
																<label class="form-label m-0 text-muted fw-bold">Filtrar Cenário</label>
																<select name="cenario" class="form-control form-control-sm init" multiple></select>
															</div>
															<div class="col-auto" name="premissas">
																<label class="form-label m-0 text-muted fw-bold">Filtrar Premissas</label>
																<div class="iSelectKami dropdown bootstrap-select w-100" name="premissas">
																	<button class="form-control form-control-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside">Premissas</button>
																	<ul class="dropdown-menu overflow-auto"></ul>
																</div>
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
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="container-fluid" id="ativos">
				<div class="bg-light p-5 rounded mt-3">
					<div class="row row-cols-1 row-cols-md-3 mb-3 text-center">
						<div class="col">
							<div class="card mb-4 rounded-3 shadow-sm">
								<div class="card-header py-3 d-flex">
									<button type="button" class="btn btn-sm btn-primary" id="table_ativos_adicionar"><i class="fas fa-plus"></i></button>
									<h4 class="my-0 flex-fill">Ativos</h4>
								</div>
								<div class="card-body">
									<table id="table_ativos" class="table table-hover">
										<thead>
											<tr>
												<th>Nome</th>
												<th class="text-center">Custo (Abert. + Fech.)</th>
												<th class="text-center">Valor por Tick</th>
												<th class="text-center">Pts por Tick</th>
												<th></th>
											</tr>
										</thead>
										<tbody></tbody>
									</table>
								</div>
							</div>
						</div>
						<div class="col">
							<div class="card mb-4 rounded-3 shadow-sm">
								<div class="card-header py-3">
									<h4 class="my-0">WIN Vencimentos</h4>
								</div>
								<div class="card-body">
									<table id="table_win_series" class="table">
										<thead>
											<tr><th colspan="2"><input type="text" name="ano" class="form-control form-control-sm"></th></tr>
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
								<div class="card-header py-3">
									<h4 class="my-0">WDO Vencimentos</h4>
								</div>
								<div class="card-body">
									<table id="table_wdo_series" class="table">
										<thead>
											<tr><th colspan="2"><input type="text" name="ano" class="form-control form-control-sm"></th></tr>
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
			<footer class="footer mt-auto fixed-bottom py-2 bg-light">
				<div class="container-fluid d-flex" id="menu_bottom">
					<button class="btn btn-sm btn-secondary me-2" type="button" name="renda_variavel">Renda Variável</button>
					<button class="btn btn-sm btn-secondary me-4 ms-auto" type="button" name="ativos">Ativos</button>
					<button class="btn btn-sm btn-light me-2" type="button" name="logout"><i class="fas fa-sign-out-alt text-danger"></i></button>
				</div>
			</footer>
			<!-- MODAL (AREA) -->
			<!-- MODAIS GENERICOS -->
			<div class="modal fade" id="insert_modal" tabindex="-1" aria-hidden="true" data-bs-keyboard="false">
				<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">Modal title</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div class="modal-body"></div>
						<div class="modal-footer d-flex justify-content-between">
							<button type="button" class="btn btn-secondary btn-sm col-2" data-bs-dismiss="modal">Fechar</button>
							<button type="button" class="btn btn-success btn-sm col-2" id="insert_modal_enviar">Salvar</button>
						</div>
					</div>
				</div>
			</div>
			<div class="modal fade" id="update_modal" tabindex="-1" aria-hidden="true" data-bs-keyboard="false">
				<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">Modal title</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div class="modal-body"></div>
						<div class="modal-footer d-flex justify-content-between">
							<button type="button" class="btn btn-secondary btn-sm col-2" data-bs-dismiss="modal">Fechar</button>
							<button type="button" class="btn btn-success btn-sm col-2" id="update_modal_enviar">Salvar</button>
						</div>
					</div>
				</div>
			</div>
			<div class="modal fade" id="remove_modal" tabindex="-1" aria-hidden="true">
				<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-sm">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">Confirma esta remoção?</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div class="modal-footer d-flex justify-content-evenly">
							<button type="button" class="btn btn-secondary btn-sm col-5" data-bs-dismiss="modal">Não</button>
							<button type="button" class="btn btn-danger btn-sm col-5" id="remove_modal_enviar">Sim</button>
						</div>
					</div>
				</div>
			</div>
			<!-- MODAIS RENDA VARIAVEL -->
			<div class="modal fade" id="arcaboucos_modal" tabindex="-1" aria-hidden="true">
				<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">Arcabouços</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div class="modal-body">
							<div class="container-fluid">
								<div class="row"><div class="col"><div id="arcaboucos_modal_toasts"></div></div></div>
								<div class="row">
									<div class="col">
										<div class="card rounded-3 shadow-sm">
											<div class="card-body">
												<div class="container-fluid d-flex px-0">
													<form class="row m-0 flex-fill" id="arcaboucos_modal_form">
														<div class="col-3">
															<label class="form-label m-1 text-muted fw-bold">Nome</label>
															<input type="text" name="nome" class="form-control form-control-sm" onclick="this.select()">
														</div>
														<div class="col-2">
															<label class="form-label m-1 text-muted fw-bold">Situação</label>
															<select name="situacao" class="form-select form-select-sm">
																<option value="2">Pendente</option>
																<option value="3">Fazendo</option>
																<option value="1">Fechado</option>
															</select>
														</div>
														<div class="col-2">
															<label class="form-label m-1 text-muted fw-bold">Tipo</label>
															<select name="situacao" class="form-select form-select-sm">
																<option value="1">Live</option>
																<option value="2">Replay</option>
																<option value="3">Paper Trade</option>
																<option value="4">Misto</option>
															</select>
														</div>
														<div class="col-5">
															<label class="form-label m-1 text-muted fw-bold">Usuários com Acesso</label>
															<select name="usuarios" multiple></select>
														</div>
														<div class="col-12 mt-2">
															<label class="form-label m-1 text-muted fw-bold">Observações</label>
															<textarea name="observacao" class="form-control form-control-sm"></textarea>
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
								</div>
								<div class="row mt-2">
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
																<input type="text" name="s_gain" class="form-control form-control-sm" onclick="this.select()">
																<button class="btn btn-outline-secondary" type="button" name="s_gain"><i class="fas fa-plus"></i></button>
															</div>
														</div>
														<div class="col-6">
															<label class="form-label m-1 text-muted fw-bold">Scalps de Loss</label>
															<div class="input-group">
																<input type="text" name="s_loss" class="form-control form-control-sm" onclick="this.select()">
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
			<div class="modal fade" id="cenarios_modal" tabindex="-1" aria-hidden="true" data-bs-keyboard="false">
				<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
					<div class="modal-content">
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
								<div class="row">
									<div class="col" id="table_cenarios"></div>
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
													<th>Cenário</th>
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
					<div class="container-fluid">
						<div class="row"><div class="col p-0"><div id="adicionar_operacoes_offcanvas_toasts"></div></div></div>
						<div class="row">
							<div class="col p-0">
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
													<select name="gerenciamento" class="form-control form-control-sm init" multiple>
														<option value="1" risco="2" retorno="1" e="0" selected>2:1</option>
														<option value="2" risco="2" retorno="1" e="1" selected>2:1 E1</option>
														<option value="3" risco="2" retorno="1" e="1" selected>2:1 E1 Fixo</option>
														<option value="1" risco="3" retorno="1" e="0" selected>3:1</option>
													</select>
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
							<div class="col p-0">
								<button class="btn btn-sm btn-primary w-100" type="button" id="adicionar_operacoes_offcanvas__new_bloco"><i class="fas fa-plus me-2" aria-hidden="true"></i>Nova Operação</button>
							</div>
						</div>
						<div class="row mt-3">
							<div class="col p-0">
								<div class="card rounded-3 shadow-sm">
									<div class="card-body">
										<table id="table_adicionar_operacoes" class="table w-100">
											<thead>
												<tr>
													<th>#</th>
													<th>Data</th>
													<th>Ativo</th>
													<th>R:R</th>
													<th>Entrada</th>
													<th>Op</th>
													<th>Barra</th>
													<th>Vol</th>
													<th>Cts</th>
													<th>Stop</th>
													<th>Alvo</th>
													<th>MEN</th>
													<th>MEP</th>
													<th>Saída</th>
													<th>Cenário</th>
													<th>Observações</th>
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
			<div id="loading_div" style="display: none"><div class="loading-spinner"></div></div>
		</body>
		<script src="src/js/global.js"></script>
		<script src="src/js/iTrade.js"></script>
	</html>
<?php } ?>