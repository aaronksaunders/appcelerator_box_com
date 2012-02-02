// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();

//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({
	title : 'Tab 1',
	backgroundColor : '#fff',
	layout: 'vertical'
});
var tab1 = Titanium.UI.createTab({
	icon : 'KS_nav_views.png',
	title : 'Tab 1',
	window : win1
});

var createFolder = Ti.UI.createButton({
	title:"Create Folder",
	width:"200dp",
	height: '50dp',
	top: '20dp'
})

var listFolders = Ti.UI.createButton({
	title:"List Folder",
	width:"200dp",
	height: '50dp',
	top: '20dp'
})

createFolder.addEventListener('click',function(){
	// Creating a new folder
	Ti.API.debug('create_folder:');
	BOXModule.callMethod("create_folder", {
		"name" : "API Folder 2",
		"share" : "1",
		"parent_id":"0"
	}, function(data) {
		Ti.API.debug(data);
	});
})

/// List all folders
listFolders.addEventListener('click',function(){
	Ti.API.debug('dump_files:');
	BOXModule.callMethod("get_account_tree", {
		"folder_id" : "0", // 0 == root directory
		"params[]" : "nozip",
	}, function(data) {
		/*var xmlDocument = Ti.XML.parseString(data.responseText);
		var tree = xmlDocument.getElementsByTagName('tree');
		alert(tree[0].item(0).text);
		for(var i=0;i<folders.length;i++){
			alert(folders[i].item(0).text)
		}
		*/
	});
})

win1.add(createFolder);
win1.add(listFolders);

//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({
	title : 'Tab 2',
	backgroundColor : '#fff'
});
var tab2 = Titanium.UI.createTab({
	icon : 'KS_nav_ui.png',
	title : 'Tab 2',
	window : win2
});

var label2 = Titanium.UI.createLabel({
	color : '#999',
	text : 'I am Window 2',
	font : {
		fontSize : 20,
		fontFamily : 'Helvetica Neue'
	},
	textAlign : 'center',
	width : 'auto'
});

win2.add(label2);

//
//  add tabs
//
tabGroup.addTab(tab1);
tabGroup.addTab(tab2);

// open tab group
tabGroup.open();


// create the module
var B = require('box_module').BOXModule;
// api_key & callback_url
var BOXModule = new B('aeu2bzzrh76crhsbggx1nzubc4p37ou0', 'http://www.clearlyinnovative.com/oAuth.html');


BOXModule.login(function(){
	Ti.API.debug('Loged in.')
});

function dump_files() {
	Ti.API.debug('dump_files:');
	BOXModule.callMethod("get_account_tree", {
		"folder_id" : "0", // 0 == root directory
		"params[]" : "simple"
	}, function(data) {
		var xmlDoc = Ti.XML.parseString(data);
		alert(xmlDoc.documentElement.getAttribute("rows"))
	});
}