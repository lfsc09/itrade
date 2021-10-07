let iLogin = (function(){
	/*------------------------------------ VARS --------------------------------------*/
	/*----------------------------------- FUNCOES ------------------------------------*/
	/*---------------------------- EXECUCAO DAS FUNCOES ------------------------------*/
	/*------------------------------------ Menu --------------------------------------*/
	/*
		Processa a troca de abas no Menu.
	*/
	$(document.getElementById('signin')).click(function (){
		let form = $('form');
		 if (form[0].checkValidity()){
        	$.post('webservices/login.php', {user: form.find('input[name="username"]').val(), pass: Md5.md5(form.find('input[name="password"]').val())}, function(result){
    			window.location.href = window.location.href;
        	});
        }
        form[0].classList.add('was-validated');
	});
	/*------------------------------- INIT DO SISTEMA --------------------------------*/
	/*--------------------------------------------------------------------------------*/
	return {}
})();