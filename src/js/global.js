let Global = (function(){
	/*------------------------------------ VARS --------------------------------------*/
	/*----------------------------------- FUNCOES ------------------------------------*/
	/*
		Requisita scripts js.
	*/
	let request = function (filename){
		$.getScript(location.href+filename);
	}
	/*
		Gera conexoes com a interface de webservices.
	*/
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
	/*
		Cria Toasts.
	*/
	let toast = {
		create: function (obj){
			if (!("width" in obj))
				obj.width = "";
			if (!("color" in obj))
				obj.color = "";
			obj.text_color = ((obj.color === "bg-danger")?"text-white":"");
			let html = `<div class='toast align-items-center border-0 mb-2 ${obj.width} ${obj.color}' role='alert' aria-live='assertive' aria-atomic='true' data-bs-delay='${obj.delay}'>`;
			if (("title" in obj)){
				html += `<div class='toast-header'>`+
						`<strong class='mr-auto'>${obj.title}</strong>`+
						`<small class='text-muted'>${obj.time}</small>`+
						`<button type='button' class='ml-2 mb-1 close' data-dismiss='toast' aria-label='Close'><span aria-hidden='true'>&times;</span></button>`+
						`</div>`+
						`<div class='toast-body ${obj.text_color}'>${obj.body}</div></div>`;
			}
			else{
				html += `<div class="d-flex">`+
						`<div class="toast-body p-2 ${obj.text_color}">${obj.body}</div>`+
						`<button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>`+
						`</div></div>`;
			}
			$(obj.location).append(html).promise().done(function (){
				$("div.toast:last", obj.location).toast("show").on("hidden.bs.toast", function (){
					$(this).remove();
				});
			});
		}
	}
	/*--------------------------------------------------------------------------------*/
	return {
		connect: connect,
		request: request,
		toast: toast
	}
})();