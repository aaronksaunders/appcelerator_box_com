// create the module
var BOXModule, U, B;
B = require('box_module').BOXModule;
U = require('/common/utils').Utils;
BOXModule = new B('aeu2bzzrh76crhsbggx1nzubc4p37ou0', 'http://www.clearlyinnovative.com/oAuth.html');

/** ------------------------------------------------------------------------------
 *
 *
 * ----------------------------------------------------------------------------- */
ApplicationController = function() {
	// Windows
	var MainWindow = require('/views/MainWindow').MainWindow;

	// Globals
	app = require('/common/globals');

	var that = this;
	BOXModule.login(function() {
		Ti.API.debug('Logged in.');

		// open main window
		var mainWindow = new MainWindow(that);
		mainWindow.createWindow();

		app.GlobalUpdate('mainWindow', mainWindow);

		// show the main folder
		that.dumpFolderContents();
	});

	app.GlobalUpdate('applicationController', this);

};
exports.ApplicationController = ApplicationController;

/** ------------------------------------------------------------------------------
 *
 * Create new folder
 *
 * ----------------------------------------------------------------------------- */

ApplicationController.prototype.createFolder = function() {

	var DialogWindow = require('/views/DialogWindow').DialogWindow;
	var window = new DialogWindow();
	
	// display toolbar for data entry
	window.create(app.globals.mainWindow.window, function(e) {
		if(e.success === true) {
			Ti.API.debug('create_folder: ' + name);
			BOXModule.callMethod("create_folder", {
				"name" : e.name,
				"share" : "1",
				"parent_id" : app.globals.current_folder // CHECK  THIS, I BELIEVE WE NEED TO VERIFY THE ID
			}, function(data) {
				Ti.API.debug(data);
			});
		}
	});
};
/** ------------------------------------------------------------------------------
 *
 * reload data in current view
 *
 * ----------------------------------------------------------------------------- */
ApplicationController.prototype.refreshFolder = function() {
	var that = this;
	that.dumpFolderContents(app.globals.current_folder);
};

/** ------------------------------------------------------------------------------
 *
 * navigate up in folder history
 *
 * ----------------------------------------------------------------------------- */

ApplicationController.prototype.historyBack = function() {
	var that = this;
	if(app.globals.history.length > 0) {
		that.dumpFolderContents(app.globals.history.pop(), true);
	}
};
/** ------------------------------------------------------------------------------
 *
 * view contents of file
 *
 * ----------------------------------------------------------------------------- */

ApplicationController.prototype.viewFileContents = function(e) {
	var that = this;
	if(e.rowData.isFolder)
		that.dumpFolderContents(e.rowData.id);
	else {
		
		BOXModule.callMethod("download", {
				"file_id" : e.rowData.id,
				"folder_id" : app.globals.current_folder
			}, function(data) {
				if(data.success) {					
					Ti.API.debug(JSON.stringify(data));
					 var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,e.rowData.fileName);
            		f.write(data.responseData);
            		Ti.API.debug('Native Path: '+f.nativePath)
				} else {
					Ti.API.debug(JSON.stringify(data))
				}
			});
		
		return ;
		
		 var win = Ti.UI.createWindow({
		 	width: '50%',
			height: '50%',
			backgroundColor: 'red',
			modal: true
		 })
		var wview = Ti.UI.createWebView({
			width: '100%',
			height: '100%',
			url: BOXModule.getFileURL(e.rowData.id),
		})
		Ti.API.debug(JSON.stringify(BOXModule.getFileURL(e.rowData.id)));
		win.add(wview);
		wview.show();
		win.open();
		
		
		return;
		BOXModule.callMethod("download", {
				"file_id" : e.rowData.id,
				"folder_id" : app.globals.current_folder
			}, function(data) {
				if(data.success) {
					pDialog.hide();
					Ti.API.debug(JSON.stringify(data));
				} else {
					Ti.API.debug(JSON.stringify(data))
				}
			});
	}
};
/** ------------------------------------------------------------------------------
 *
 * upload a file to the system
 *
 * ----------------------------------------------------------------------------- */
ApplicationController.prototype.uploadFile = function() {
	var that = this;
	Ti.API.debug('upload file:');

	Titanium.Media.openPhotoGallery({

		success : function(event) {
			Ti.API.debug('Got the file');
			var image = event.media;
			var pDialog = U.createActivityWindow('Uploading File...');
			pDialog.show();
			BOXModule.callMethod("upload", {
				"file" : image,
				"share" : "0",
				"message" : "Uploaded using API",
				"folder_id" : app.globals.current_folder
			}, function(data) {
				if(data.success) {
					pDialog.hide();
					Ti.API.debug(JSON.stringify(data));

					that.dumpFolderContents(app.globals.current_folder);
				}
			});
		},
		cancel : function() {
		},
		error : function() {
		},
		allowImageEditing : true
	});

	return false;

	BOXModule.callMethod("upload", {
		"file" : "/KS_nav_ui.png",
		"share" : "0",
		"message" : "Uploaded using API",
		// Uploading to the root directory for now
		"folder_id" : "0"
	}, function(data) {
		Ti.API.debug(JSON.stringify(data));
	});
};
/** ------------------------------------------------------------------------------
 *
 * get the list of folder items and display them in the main table
 *
 * ----------------------------------------------------------------------------- */
ApplicationController.prototype.dumpFolderContents = function(_folder_id, backwards) {
	// get the table view
	var folderList = app.globals.mainWindow.folderList;
	var mainWindow = app.globals.mainWindow;

	var find_by_folder_id = _folder_id || BOXModule.ROOT_FOLDER_ID;

	if((find_by_folder_id != BOXModule.ROOT_FOLDER_ID ) && (!backwards)) {
		app.globals.history.push(app.globals.current_folder);
	}

	BOXModule.callMethod("get_account_tree", {
		"folder_id" : find_by_folder_id,
		"params[]" : ['nozip', 'onelevel']
	}, function(data) {

		app.GlobalUpdate('current_folder', find_by_folder_id);
		var pDialog = U.createActivityWindow('Loading...');

		pDialog.show();

		Ti.API.debug('List folders callback');
		pDialog.setMessage("Loading Folders");
		var xmlDoc = U.xmlToJson(Ti.XML.parseString(data.responseText));
		var root_folder = xmlDoc.response ? xmlDoc['response']['tree']['folder'] : xmlDoc['tree']['folder'];

		mainWindow.updateWindow(root_folder, find_by_folder_id, pDialog);

	});
};
