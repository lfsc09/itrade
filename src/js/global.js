let Global = (function(){
	/*------------------------------------ VARS --------------------------------------*/
	/*----------------------------------- FUNCOES ------------------------------------*/
	let connect = function (options){
		$.ajax({
			type: "POST",
			url: "webservices/interface.php",
			data: options.data,
			dataType: "json",
			success: options.success,
			error: function (jqXHR, textStatus, errorThrown){
				console.log(`${textStatus}: ${errorThrown}`);
			}
		});
	}
	/*--------------------------------------------------------------------------------*/
	return {
		connect: connect
	}
})();