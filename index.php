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
			<!-- SEÇÃO RENDA VARIAVEL -->
			<div id="renda_variavel"></div>
			<!-- SEÇÃO CONTROLE FINANCEIRO -->
			<div id="controle_financeiro"></div>
			<footer class="footer mt-auto fixed-bottom py-2 bg-light">
				<div class="container-fluid d-flex" id="menu_bottom">
					<button class="btn btn-sm btn-secondary me-2" type="button" name="renda_variavel"><i class="fas fa-chart-bar me-2"></i>Renda Variável</button>
					<button class="btn btn-sm btn-secondary me-4" type="button" name="controle_financeiro"><i class="fas fa-donate me-2"></i>Controle Financeiro</button>
					<button class="btn btn-sm btn-light ms-auto me-2" type="button" name="logout"><i class="fas fa-sign-out-alt text-danger"></i></button>
				</div>
			</footer>
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
			<div id="loading_div" style="display: none"><div class="loading-spinner"></div></div>
		</body>
		<script src="src/js/base/ckeditor.min.js"></script>
		<script src="src/js/global.js"></script>
		<script src="src/js/iTrade.js"></script>
	</html>
<?php } ?>