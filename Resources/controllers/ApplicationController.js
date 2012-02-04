// create the module
var BOXModule, U, B;
B = require('box_module').BOXModule;
U = require('/common/utils').Utils;
BOXModule = new B('aeu2bzzrh76crhsbggx1nzubc4p37ou0', 'http://www.clearlyinnovative.com/oAuth.html');

/*
 *
 */
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

}
exports.ApplicationController = ApplicationController;

ApplicationController.prototype.createFolder = function() {
	// Creating a new folder
	createNewFolderDialog();
	return;
	Ti.API.debug('create_folder:');
	BOXModule.callMethod("create_folder", {
		"name" : "API Folder 2",
		"share" : "1",
		"parent_id" : "0"
	}, function(data) {
		Ti.API.debug(data);
	});
}

ApplicationController.prototype.refreshFolder = function() {
	var that = this;
	that.dumpFolderContents(app.globals.current_folder);
}
ApplicationController.prototype.historyBack = function() {
	var that = this;
	if(app.globals.history.length > 0) {
		that.dumpFolderContents(app.globals.history.pop(), true);
	}
}
ApplicationController.prototype.viewFileContents = function(e) {
	var that = this;
	if(e.rowData.isFolder)
		that.dumpFolderContents(e.rowData.id);
	else {
		/// Need to download file and show it on device with default application
	}
}
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
				// Uploading to the root directory for now
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
}
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
		var xmlDoc = xmlToJson(Ti.XML.parseString(data.responseText));
		var root_folder = xmlDoc.response ? xmlDoc['response']['tree']['folder'] : xmlDoc['tree']['folder'];

		mainWindow.updateWindow(root_folder, find_by_folder_id, pDialog);

	});
}
var xmlToJson = function(xml) {
	var attr, child, attrs = xml.attributes, children = xml.childNodes, key = xml.nodeType, obj = {}, i = -1;

	if(key == 1 && attrs && attrs.length) {
		obj[ key = '@attributes'] = {};
		while( attr = attrs.item(++i)) {
			obj[key][attr.nodeName] = attr.nodeValue;
		}
		i = -1;
	} else if(key == 3) {
		obj = xml.nodeValue;
	}
	for(var i = 0; i < children.length; i++) {
		var child = children.item(i);
		key = child.nodeName;
		if(obj.hasOwnProperty(key)) {
			if(obj.toString.call(obj[key]) != '[object Array]') {
				obj[key] = [obj[key]];
			}
			obj[key].push(Utils.xmlToJson(child));
		} else {
			obj[key] = Utils.xmlToJson(child);
		}
	}

	return obj;
}