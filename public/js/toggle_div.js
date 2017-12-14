$('#title_bar').click(function(){
	$(this).find('i').toggleClass('glyphicon glyphicon-chevron-up glyphicon glyphicon-chevron-down')
    $("#toggleDiv").toggle('up');
});