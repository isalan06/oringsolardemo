const button_login = document.getElementById('btnRegister');
button_login.addEventListener('click', function(e){
	fetch('/PostTest2', {method: 'POST'})
	;
});
