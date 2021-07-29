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
			<link rel="stylesheet" href="src/css/fancygrid.min.css">
			<link rel="stylesheet" href="src/css/iTrade.css">
			<script src="https://kit.fontawesome.com/9bb84e5d3e.js" crossorigin="anonymous"></script>
			<script src="src/js/base/jquery_3.6.0.min.js"></script>
			<script src="src/js/base/jquery.inputmask.min.js"></script>
			<script src="src/js/base/bootstrap.bundle.min.js"></script>
			<script src="src/js/base/fancygrid.min.js"></script>
			<script src="src/js/base/Chart.bundle.min.js"></script>
		</head>
		<body>
			<div class="position-fixed top-0 end-0 p-3" id="master_toasts"></div>
			<div class="container-fluid" id="renda_variavel">
				<div class="row">
					<!-- Arcabouço de Operacionais -->
					<div class="col-2">
						<div class="d-flex flex-column align-items-stretch flex-shrink-0 bg-white">
							<a href="#" class="d-flex align-items-center flex-shrink-0 p-3 pe-2 link-dark text-decoration-none border-bottom">
								<span class="fs-5 fw-bold">Arcabouços</span>
								<button class="btn btn-sm btn-primary ms-auto align-self-end" type="button" id="table_arcaboucos_adicionar"><i class="fas fa-plus"></i></button>
							</a>
							<div class="list-group list-group-flush border-bottom scrollarea" id="table_arcaboucos"></div>
						</div>
					</div>
					<div class="col-10 d-flex">
						<div class="vertical-divider"></div>
						<div class="bg-light p-5 pt-3 rounded">
							<div class="row row-cols-1 row-cols-md-1 mb-3 text-center">
								<div class="col">
									<div class="card mb-4 rounded-3 shadow-sm col-4">
										<div class="card-header py-2">
											<h5 class="my-0">Gerenciamentos</h5>
										</div>
										<div class="card-body">
											<form class="row g-2 m-0">
												<div class="input-group col-auto">
													<input type="text" class="form-control" placeholder="Nome">
													<button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Cadastrados</button>
													<ul class="dropdown-menu dropdown-menu-end">
														<li><a class="dropdown-item" href="#">Action</a></li>
														<li><a class="dropdown-item" href="#">Another action</a></li>
														<li><a class="dropdown-item" href="#">Something else here</a></li>
														<li><a class="dropdown-item" href="#">Separated link</a></li>
													</ul>
												</div>
												<div class="col-auto">
													<button type="button" class="btn btn-primary mb-3">Criar</button>
												</div>
											</form>
										</div>
									</div>
								</div>
								<div class="col">
									<div class="card mb-4 rounded-3 shadow-sm">
										<div class="card-header py-2">
											<h5 class="my-0">Adicionar</h5>
										</div>
										<div class="card-body">
											<table id="table_adicionar_operacoes" class="table">
												<thead>
													<tr>
														<th>Data</th>
														<th>Hora</th>
														<th>Ativo</th>
														<th>Op.</th>
														<th>Gerenc.</th>
														<th>Cts</th>
														<th>Entrada</th>
														<th>Stop</th>
														<th>MEN</th>
														<th>Saída</th>
														<th>MEP</th>
													</tr>
												</thead>
												<tbody>
													<tr>
														<td name="data"><input type="text" name="data" class="form-control form-control-sm"></td>
														<td name="hora"><input type="text" name="hora" class="form-control form-control-sm"></td>
														<td name="ativo"><select name='ativo' class="form-select form-select-sm"></select></td>
														<td name="op"><select name='op' class="form-select form-select-sm"><option value="1">Compra</option><option value="2">Venda</option></select></td>
														<td name="gerenciamento">
															<div class="input-group">
																<select name='gerenciamento' class="form-select form-select-sm"></select>
																<button class="btn btn-sm btn-outline-secondary" type="button"><i class="fas fa-plus"></i></button>
															</div>
														</td>
														<td name="cts"><input type="text" name="cts" class="form-control form-control-sm"></td>
														<td name="entrada"><input type="text" name="entrada" class="form-control form-control-sm"></td>
														<td name="stop"><input type="text" name="stop" class="form-control form-control-sm"></td>
														<td name="men"><input type="text" name="men" class="form-control form-control-sm"></td>
														<td name="saida"><input type="text" name="saida" class="form-control form-control-sm"></td>
														<td name="mep"><input type="text" name="mep" class="form-control form-control-sm"></td>
													</tr>
												</tbody>
											</table>
										</div>
									</div>
								</div>
								<div class="col">
									<div class="card mb-4 rounded-3 shadow-sm">
										<div class="card-header py-2">
											<h5 class="my-0">Operações</h5>
										</div>
										<div class="card-body">
											<table id="table_operacoes" class="table">
												<thead>
													<tr>
														<th>#</th>
														<th>Data</th>
														<th>Hora</th>
														<th>Ativo</th>
														<th>Op.</th>
														<th>Cts</th>
														<th>Entrada</th>
														<th>Stop</th>
														<th>MEN</th>
														<th>Saída</th>
														<th>MEP</th>
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
									<table id="table_ativos" class="table">
										<thead>
											<tr>
												<th>Nome</th>
												<th class="text-center">Custo (Abert. + Fech.)</th>
												<th class="text-center">Valor Pt</th>
												<th class="text-center">Tick</th>
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
					<button class="btn btn-sm btn-secondary me-2" type="button" name="dashboard">Dashboard</button>
					<button class="btn btn-sm btn-secondary me-2" type="button" name="renda_variavel">Renda Variável</button>
					<button class="btn btn-sm btn-secondary me-4 ms-auto" type="button" name="ativos">Ativos</button>
					<button class="btn btn-sm btn-light me-2" type="button" name="logout"><i class="fas fa-sign-out-alt text-danger"></i></button>
				</div>
			</footer>
			<!-- MODAL (AREA) -->
			<!-- MODAIS GENERICOS -->
			<div class="modal fade" id="insert_modal" tabindex="-1" aria-hidden="true">
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
			<div class="modal fade" id="update_modal" tabindex="-1" aria-hidden="true">
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
		</body>
		<script src="src/js/global.js"></script>
		<script src="src/js/iTrade.js"></script>
	</html>
<?php } ?>