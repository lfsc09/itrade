let iTrade = (function(){
	/*------------------------------------ VARS --------------------------------------*/
	let _active_section = '';
	/*----------------------------------- FUNCOES ------------------------------------*/
	/*---------------------------- EXECUCAO DAS FUNCOES ------------------------------*/
	/*------------------------------------ Menu --------------------------------------*/
	/*
		Processa toasts no master_toasts, para mostrar ou não a div.
	*/
	$(document.getElementById('master_toasts')).on('DOMSubtreeModified', function (){
		let me = $(this);
		me.toggle(me.html() !== '');
	});
	/*
		Processa a troca de abas no Menu.
	*/
	$('button', document.getElementById('menu_bottom')).click(function (){
		let me = this.name;
		//Logout da plataforma
		if (this.name === 'logout'){
			Global.connect({
				data: {module: 'login', action: 'logout'},
				success: function (result){
					Global.browserStorage__Sync.remove('instancia', 'sessionStorage');
					window.location.href = window.location.href;
				}
			});
			return false;
		}
		//Outras opcoes do menu
		$(this).parent().find('button.btn-primary').removeClass('btn-primary').addClass('btn-secondary');
		$(this).removeClass('btn-secondary').addClass('btn-primary');
		$('body > div[id]').each(function (i, elem){
			if (elem.id === me){
				if (elem.id === 'renda_variavel'){
					if (typeof Renda_variavel === 'undefined'){
						Global.request([
							{
								filename: 'src/html/iTrade_RendaVariavel.php',
								cache: true,
								dataType: 'html',
								target: $(document.getElementById('renda_variavel'))
							},
							{
								filename: 'src/js/iTrade_RendaVariavel_Statistics.js',
								cache: true,
								dataType: 'script'
							},
							{
								filename: 'src/js/iTrade_RendaVariavel.js',
								cache: true,
								dataType: 'script'
							}
						]).done(function(){
							$(elem).show();
							_active_section = elem.id;
						});
					}
					else{
						$(elem).show();
						_active_section = elem.id;
					}
				}
				else if (elem.id === 'controle_financeiro'){
					if (typeof Controle_financeiro === 'undefined'){
						Global.request([
							{
								filename: 'src/html/iTrade_ControleFinanceiro.php',
								cache: true,
								dataType: 'html',
								target: $(document.getElementById('controle_financeiro'))
							},
							{
								filename: 'src/js/iTrade_ControleFinanceiro.js',
								cache: true,
								dataType: 'script'
							}
						]).done(function(){
							$(elem).show();
							_active_section = elem.id;
						});
					}
					else{
						$(elem).show();
						_active_section = elem.id;
					}
				}
			}
			else
				$(elem).hide();
		});
	});
	/*------------------------------- INIT DO SISTEMA --------------------------------*/
	$('button[name="renda_variavel"]', document.getElementById('menu_bottom')).click();
	/*--------------------------------------------------------------------------------*/
	return {
	}
})();