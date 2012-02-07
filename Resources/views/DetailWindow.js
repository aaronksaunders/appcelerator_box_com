

DetailWindow = function( controller, fileinfo ){
	
	var self = Ti.UI.createWindow({
		title: fileinfo.filename,
		width:'100%',
		height: '100%',
		modal: true
	});
	
	return self;
	
}



