DialogWindow = function(_controller) {
	this.controller = _controller;
	return this;
};

exports.DialogWindow = DialogWindow;

DialogWindow.prototype.create = function(dlg, callback) {
	app = require('/common/globals');
	if(app.globals.isAndroid === true) {
		this.createAndroid(dlg, callback);
	} else {
		this.createIOS(dlg, callback);
	}
};
/** ------------------------------------------------------------------------------
 *
 * display dialog for getting the folder name
 *
 * ----------------------------------------------------------------------------- */
DialogWindow.prototype.createAndroid = function(dlg, callback) {
	var folderNameField = Ti.UI.createTextField();

	var dialog = Ti.UI.createOptionDialog({
		title : 'Enter Folder Name',
		androidView : folderNameField,
		buttonNames : ['Cancel', 'Create Folder'],
		cancel : 0
	});

	dialog.addEventListener('click', function(e) {
		if(e.index == 1) {
			callback({
				"success" : true,
				"name" : folderNameField.value
			});
		} else {
			callback({
				"success" : false,
				"name" : null
			});
		}

	});
	
	dialog.show();
};
/**
 * create the dialog
 */
DialogWindow.prototype.createIOS = function(dlg, callback) {
	var slide_in = Ti.UI.createAnimation({
		top : 0
	});
	var slide_out = Ti.UI.createAnimation({
		top : -40
	});
	singleInputView = Ti.UI.createView({
		height : 40,
		top : -40
	});
	opaqueView = Ti.UI.createView({
		height : 480,
		top : 0,
		backgroundColor : '#000',
		opacity : 0.5
	});
	duhLabel = Ti.UI.createLabel({
		text : 'Tap here to cancel',
		top : 120,
		height : 'auto',
		textAlign : 'center',
		color : '#ff0000',
		opacity : 1.0,
		font : {
			fontSize : 22,
			fontWeight : 'bold'
		}
	});
	opaqueView.add(duhLabel);

	var folderNameField = Ti.UI.createTextField({
		hintText : 'Enter Folder Name',
		height : 32,
		width : 240,
		top : 10,
		left : 10,
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		font : {
			fontSize : 12
		}
	});

	var createButton = Ti.UI.createButton({
		title : 'Create',
		style : Ti.UI.iPhone.SystemButtonStyle.DONE,
		left : 270,
		top : 10
	});

	var inputToolbar = Ti.UI.createToolbar({
		top : 0,
		barColor : 'black',
		items : [folderNameField, createButton]
	});

	singleInputView.add(inputToolbar);

	var closeWindowHandler = function() {
		folderNameField.blur()
		opaqueView.hide();
		singleInputView.animate(slide_out);
		singleInputView = null;
		opaqueView = null;
	};

	folderNameField.addEventListener('return', function() {
		closeWindowHandler();
		callback({
			"success" : true,
			"name" : folderNameField.value
		});
	});

	createButton.addEventListener('click', function() {
		closeWindowHandler();
		callback({
			"success" : true,
			"name" : folderNameField.value
		});
	});
	opaqueView.addEventListener('click', function() {
		closeWindowHandler();
		callback({
			"success" : false,
			"name" : null
		});
	});

	dlg.add(opaqueView);
	dlg.add(singleInputView);
	singleInputView.animate(slide_in);
};
