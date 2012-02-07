var app = require('/common/globals');
// create the module
var B = require('box_module').BOXModule;
// api_key & callback_url
var BOXModule = new B('aeu2bzzrh76crhsbggx1nzubc4p37ou0', 'http://www.clearlyinnovative.com/oAuth.html');
MainWindow = function(_controller) {

	this.controller = _controller;

	return this;

}
exports.MainWindow = MainWindow;

MainWindow.prototype.createWindow = function() {
	var that = this;
	// Globals
	app = require('/common/globals');

	/// initializing globals
	app.GlobalUpdate('current_folder', 0);
	app.GlobalUpdate('history', []);
	
	var toolbarTop = Ti.Platform.displayCaps.platformHeight - 60;

	var toolbarView = Ti.UI.createView({
		width : '100%',
		height : '40dp',
		backgroundColor: 'red',
		top : (app.globals.isAndroid) ? toolbarTop : '' + toolbarTop  + 'dp',
		layout : 'horizontal'
	})
	
	Ti.API.debug('-----***********-----. TOP: '+ (app.globals.isAndroid) ? Ti.Platform.displayCaps.platformHeight - 60 :  + (Ti.Platform.displayCaps.platformHeight - 60) + 'dp')

	var tableHeader = Ti.UI.createView({
		height : '25dp',
		width : '100%',
		layout : 'horizontal'
	})

	that.window = Titanium.UI.createWindow({
		title : 'Tab 1',
		backgroundColor : '#fff',
		//layout : 'vertical', // CAUSED ISSUES ON IOS
		height : '100%',
		width : '100%'
	});

	that.folderList = Ti.UI.createTableView({
		top : '36dp',
		bottom : '44dp',
		//height : '100%',
		width : '100%',
		data : [{
			title : 'Empty'
		}],
		header : tableHeader,
		//style : Ti.UI.iPhone.TableViewStyle.GROUPED,
		backgroundColor : '#fff'
	})
	that.window.add(that.folderList);
	that.window.open();

	var labelCurrentFolder = Ti.UI.createLabel({
		text : 'Current Folder: ',
		width : 'auto',
		color : '#666',
		font : {
			fontSize : '16px'
		}
	})

	var labelCurrentFolderName = Ti.UI.createLabel({
		text : ' none ',
		width : 'auto',
		color : '#333',
		font : {
			fontSize : '16px',
			fontWeight : 'bold'
		}
	})

	var labelTitle = Ti.UI.createLabel({
		text : 'Box.com Sample App',
		width : '100%',
		height : '36dp',
		color : '#fff',
		textAlign : 'center',
		exitOnClose : true,
		top : 0,
		backgroundColor : '#267BB6',
		font : {
			fontSize : '20px',
			fontWeight : 'bold'
		}
	});

	/*
	 * Buttons
	 */
	var uploadFile = Ti.UI.createButton({
		title : "Upload",
		width : "auto",
		height : '50dp',
		top : 0
	});

	var upFolder = createCustomButton('up', 'Up');
	var createFolder = createCustomButton('add', 'New Folder');
	var refreshFolder = createCustomButton('refresh', 'Refresh');
	var uploadFile = createCustomButton('upload', 'Upload File');

	/*
	 * Button Actions
	 */
	createFolder.addEventListener('click', function(e) {
		that.controller.createFolder.call(that.controller, e);
	});

	refreshFolder.addEventListener('click', function(e) {
		that.controller.refreshFolder.call(that.controller, e);
	});

	upFolder.addEventListener('click', function(e) {
		that.controller.historyBack.call(that.controller, e);
	});

	uploadFile.addEventListener('click', function(e) {
		that.controller.uploadFile.call(that.controller, e);
	});

	that.folderList.addEventListener('click', function(e) {
		that.controller.viewFileContents.call(that.controller, e);
	});
	// View to hold the labels with current folder
	var viewCurrentFolder = Ti.UI.createView({
		backgroundColor : '#fff',
		layout : 'horizontal',
		height : '20dp'
	});

	tableHeader.add(labelCurrentFolder);
	tableHeader.add(labelCurrentFolderName);
	that.labelCurrentFolder = labelCurrentFolder;
	that.labelCurrentFolderName = labelCurrentFolderName;

	that.window.add(labelTitle);
	toolbarView.add(upFolder);
	toolbarView.add(createFolder);
	toolbarView.add(refreshFolder);
	toolbarView.add(uploadFile);
	
	that.window.add(toolbarView);
	that.window.add(tableHeader);
	that.window.add(viewCurrentFolder);
	
	
};

MainWindow.prototype.updateWindow = function(root_folder, find_by_folder_id, pDialog) {
	var that = this;

	if(find_by_folder_id === BOXModule.ROOT_FOLDER_ID) {
		that.labelCurrentFolderName.setText('Root');
	} else {
		that.labelCurrentFolderName.setText(root_folder['@attributes']['name']);
	}

	var _folders = (root_folder['folders']);

	var folders = [];
	try {
		if(_folders.folder.length)
			folders = _folders['folder'];
		else
			folders[0] = _folders['folder'];
	} catch(e) {
		// No Subfolders
	}

	var _files = root_folder['files'];

	Ti.API.debug('Files: -----> ' + JSON.stringify(_files));

	var files = [];

	try {
		if(_files.file.length)
			files = _files['file'];
		else
			files[0] = _files['file'];
	} catch(e) {
		// No Files
	}

	var rows = [];

	for(var folder in folders) {
		Ti.API.debug("Subfolder: " + JSON.stringify(folders[folder]));
		rows.push(createFolderRow(folders[folder]));
	};

	pDialog.setMessage("Loading Files");

	for(var file in files) {
		Ti.API.debug("File: " + JSON.stringify(files));
		rows.push(createFileRow(files[file]));
	};

	if(rows.length)
		that.folderList.setData(rows);
	else
		that.folderList.setData({
			title : 'Empty',
			hasChild : false
		});
	pDialog.hide();

	// cleanup
	rows = null;
	_folders = null;
	folders = null;
	return;

};
function createFolderRow(data) {
	var folderId = data['@attributes']['id'];
	var folderName = data['@attributes']['name'];
	var shared = (data['@attributes']['shared'] == 1);
	Ti.API.debug("Shared: "+ shared)

	var row = Titanium.UI.createTableViewRow({
		id : folderId,
		hasChild : true,
		touchEnabled : true,
		width : '100%',
		height : 'auto',
		isFolder : true,
		backgroundColor : '#fff',
	});

	var folderView = Ti.UI.createView({
		backgroundColor : '#fff',
		height : '100%',
		width : '100%',
		layout : 'horizontal'
	})

	var icon = Ti.UI.createImageView({
		image : (shared) ? '/images/folder_shared.png' : '/images/folder.png',
		width : 32,
		height : 32,
		left : 2
	})

	var folderName = Ti.UI.createLabel({
		text : folderName,
		height : '50dp',
		width : 'auto',
		color : '#000',
		left : 5,
		font : {
			fontSize : '14px',
			fontWeight : 'bold'
		}
	})

	folderView.add(icon);
	folderView.add(folderName);
	row.add(folderView)
	return row;
}

function createFileRow(data) {
	var row = Titanium.UI.createTableViewRow({
		id : data['@attributes']['id'],
		fileName : data['@attributes']['file_name'],
		hasChild : false,
		touchEnabled : true,
		isFolder : false
	});

	var fileView = Ti.UI.createView({
		backgroundColor : '#fff',
		height : '100%',
		width : '100%',
		layout : 'horizontal'
	})

	var icon = Ti.UI.createImageView({
		image : data['@attributes']['thumbnail'],
		width : 32,
		height : 32,
		left : 2
	})

	var fileName = Ti.UI.createLabel({
		text : data['@attributes']['file_name'],
		height : '50dp',
		width : 'auto',
		color : '#000',
		left : 5,
		font : {
			fontSize : '14px',
			fontWeight : 'bold'
		}
	})

	fileView.add(icon);
	fileView.add(fileName);
	row.add(fileView);
	return row;
}

function dump_files() {
	Ti.API.debug('dump_files:');
	BOXModule.callMethod("get_account_tree", {
		"folder_id" : "0", // 0 == root directory
		"params[]" : "simple"
	}, function(data) {
		var xmlDoc = Ti.XML.parseString(data);
		alert(xmlDoc.documentElement.getAttribute("rows"));
	});
}


/*
 *  UI extra stuff
 */

function createCustomButton(icon_name, name) {
	var button = Ti.UI.createView({
		layout : 'vertical',
		width : '36dp',
		height : '36dp',
		touchEnabled : true,
		borderColor : '#ccc',
		borderRadius : 6,
		borderWidth : 1,
		left : '30dp',
		backgroundColor : '#F8F8F8'
	});
	//Ti.API.debug(icon_name)
	var icon = Ti.UI.createImageView({
		url : './images/buttons/' + icon_name + '.png',
		width : '22dp',
		height : '22dp',
		top : '6dp',
		left : '6dp'
	});

	var label = Ti.UI.createLabel({
		text : name,
		color : '#666',
		font : {
			fontSize : '9px'
		},
		height : 18,
		textAlign : 'center'
	});

	button.add(icon);
	//button.add(label);
	button.show();
	return button;
}