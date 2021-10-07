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
			<link rel="stylesheet" href="src/css/loadings.min.css">
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
			<script src="src/js/base/Chart.bundle.min.js"></script>
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
								<button class="btn btn-sm btn-primary me-4" type="button" name="arcaboucos"><i class="fas fa-archive me-2"></i>Arcabouços</button>
								<button class="btn btn-sm btn-primary me-2" type="button" name="cenarios"><i class="fas fa-tasks me-2"></i>Gerir Cenários</button>
								<button class="btn btn-sm btn-primary me-2" type="button" name="adicionar_operacoes"><i class="fas fa-cloud-upload-alt me-2"></i>Adicionar Operações</button>
								<button class="btn btn-sm btn-outline-primary ms-auto me-2" type="button" name="dashboard_ops"><i class="fas fa-chart-line me-2"></i>Dashboard</button>
								<button class="btn btn-sm btn-outline-primary" type="button" name="lista_ops"><i class="fas fa-list-ul me-2"></i>Operações</button>
							</div>
							<div class="row mb-4">
								<div class="col" id="renda_variavel__instancias"></div>
							</div>
							<div class="row">
								<div class="col" id="renda_variavel__section"></div>
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
														<div class="col-4"><label class="form-label m-1 text-muted fw-bold">Nome</label><input type="text" name="nome" class="form-control form-control-sm" onclick="this.select()"></div>
														<div class="col-2"><label class="form-label m-1 text-muted fw-bold">Meta</label><input type="text" name="meta" class="form-control form-control-sm" onclick="this.select()"></div>
														<div class="col-6"><label class="form-label m-1 text-muted fw-bold">Usuários com Acesso</label><select name="usuarios" multiple></select></div>
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
											<div class="card-body">
												<table class="table" id="table_arcaboucos">
													<thead>
														<tr>
															<th>Nome</th>
															<th>Criado Em</th>
															<th>Atualizado</th>
															<th>Trades</th>
															<th>Meta</th>
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
			<div class="modal fade" id="operacoes_modal" tabindex="-1" aria-hidden="true" data-bs-keyboard="false">
				<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xxxl">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">Cadastro de Operações</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div class="modal-body">
							<div class="container-fluid">
								<div class="row"><div class="col p-0"><div id="operacoes_modal_toasts"></div></div></div>
								<div class="row">
									<div class="col bg-light p-3">
										<div class="row">
											<div class="col-2">
												<label class="form-label m-1 text-muted fw-bold">Fonte do Arquivo</label>
												<select id="file_format" class="form-select form-select-sm">
													<option value="excel">Excel</option>
													<option value="profit">Profit</option>
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
												<input class="form-control form-control-sm col" type="file" id="importa_arquivo_operacoes_modal">
											</div>
										</div>
									</div>
								</div>
								<div class="row mt-3">
									<div class="col bg-light p-3">
										<table id="table_operacoes_add" class="table m-0">
											<thead></thead>
											<tbody></tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
						<div class="modal-footer d-flex">
							<button type="button" class="btn btn-secondary btn-sm col-1" data-bs-dismiss="modal">Fechar</button>
							<button type="button" class="btn btn-success btn-sm col-1 ms-auto" id="operacoes_modal_enviar">Salvar</button>
						</div>
					</div>
				</div>
			</div>
			<div id="loading_div" style="display: none"><div class="dot-revolution"></div></div>
		</body>
		<script src="src/js/global.js"></script>
		<script src="src/js/iTrade.js"></script>
	</html>
<?php } ?>