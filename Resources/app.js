// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

/// This should be on the globals.js file 
var folders = [];

var pDialog;

//
// create base UI tab and root window
//

var toolbarView = Ti.UI.createView({
	width: '100%',
	height: '50dp',
	layout: 'horizontal'
})

var folderList = Ti.UI.createTableView({
	data: [{title:'Empty',hasChild:false}]
})

var labelCurrentFolder = Ti.UI.createLabel({
	text: 'Current Folder: ',
	width: 'auto',
	color: '#666',
	font: { fontSize: '16px'}
})

var labelCurrentFolderName = Ti.UI.createLabel({
	text: ' none ',
	width: 'auto',
	color: '#333',
	font: { fontSize: '16px', fontWeight:'bold'}
})

var labelTitle = Ti.UI.createLabel({
	text: 'Box.com Sample App',
	width: '100%',
	height: '50dp',
	color: '#fff',
	textAlign: 'center',
	exitOnClose: true,
	top: 0,
	backgroundColor: '#267BB6',
	font: { fontSize: '18px', fontWeight: 'bold'}
})

var win1 = Titanium.UI.createWindow({
	title : 'Tab 1',
	backgroundColor : '#fff',
	layout: 'vertical'
});

/*
 * Buttons
 */


var uploadFile = Ti.UI.createButton({
	title:"Upload",
	width:"auto",
	height: '50dp',
	top: 0
})

var createFolder = createCustomButton('add','New Folder');
var refreshFolder = createCustomButton('refresh','Refresh');
var uploadFile = createCustomButton('upload','Upload File');


/*
 * Button Actions
 */

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

refreshFolder.addEventListener('click',function(){
	dumpFolders();
})

/*
 * Upload File
 */
uploadFile.addEventListener('click',function(){
	Ti.API.debug('upload file:');
	
	Titanium.Media.openPhotoGallery({
 
        success:function(event)
        {
        	Ti.API.debug('Got the file');
        	var image = event.media;
        	BOXModule.callMethod("upload", {
				"file" : image,
				"share" : "0",
				"message" : "Uploaded using API",
				// Uploading to the root directory for now
				"folder_id" : "0"
			}, function(data) {
				if(data.success){
					Ti.API.debug(JSON.stringify(data));
					dumpFolders("0");
				}
			});
            
        },
        cancel:function(){},
        error:function(){},
        allowImageEditing:true
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
})

folderList.addEventListener('click',function(e){
	Ti.API.debug('TableView click');
	Ti.API.debug(JSON.stringify(e));
})

// View to hold the labels with current folder
var viewCurrentFolder = Ti.UI.createView({
	backgroundColor: '#fff',
	layout: 'horizontal',
	height:'20dp'
})

viewCurrentFolder.add(labelCurrentFolder);
viewCurrentFolder.add(labelCurrentFolderName);

win1.add(labelTitle);
toolbarView.add(createFolder);
toolbarView.add(refreshFolder);
toolbarView.add(uploadFile);
toolbarView.show();
win1.add(toolbarView);
win1.add(viewCurrentFolder);
win1.add(folderList);
win1.open();

// create the module
var B = require('box_module').BOXModule;
// api_key & callback_url
var BOXModule = new B('aeu2bzzrh76crhsbggx1nzubc4p37ou0', 'http://www.clearlyinnovative.com/oAuth.html');


BOXModule.login(function(){
	Ti.API.debug('Loged in.');
	dumpFolders();
});

function dumpFolders(folder){
	//var pDialog = createActivityWindow('Loading Folders');
	//if(!pDialog)
		//pDialog = createActivityWindow('Loading Files');
	//pDialog.show();	
	var folder_id = folder || BOXModule.ROOT_FOLDER_ID;
	Ti.API.debug('dump_files:');
	BOXModule.callMethod("get_account_tree", {
		"folder_id" : folder_id, // 0 == root directory
		"params[]" : "onelevel",
		"params[]" : "nozip"
	}, function(data) {
		Ti.API.debug('List folders callback');
		var xmlDoc = xmlToJson(Ti.XML.parseString(data.responseText));
		var root_folder = xmlDoc['response']['tree']['folder'];
		//Ti.API.debug(JSON.stringify(root_folder));
		
		folders = root_folder['folders']['folder'];
		var files = root_folder['files']['file'];
		
		
		
		/// Getting all the folders
		labelCurrentFolderName.setText('Root');
		var rows = [];
		for (var folder in folders){
			
			var row = Titanium.UI.createTableViewRow({
				id:folders[folder]['@attributes']['id'],
				hasChild: true
			});
			
			var folderView = Ti.UI.createView({
				backgroundColor: '#F9F9F9',
				height: '100%',
				width: '100%',
				layout: 'horizontal'
			}) 
			var shared = (folders[folder]['@attributes']['shared']) ? '_shared' : '';
			var icon = Ti.UI.createImageView({
					image: './images/folder'+ shared +'.png',
					width: 32,
					height: 32,
					left: 2
				})
			
			var folderName = Ti.UI.createLabel({
				text: folders[folder]['@attributes']['name'],
				height: '50dp',
				width: 'auto',
				color: '#000',
				left: 5,
				font: { fontSize: '14px', fontWeight:'bold'}
			})
			
			/*folderView.add(Ti.UI.createImageView({
					url: '/images/folder.png',
					width: 48,
					height: 48,
					left: 2
				})
			)*/
			
			folderView.add(icon);
			folderView.add(folderName);
			
			/*rows.push({
				title:folders[folder]['@attributes']['name'],'class':'subFolder', 
				id:folders[folder]['@attributes']['id'],
				is_folder: true 
			})*/
			row.add(folderView);
			rows.push(row)
		}
		folderList.setData(rows);
		return ;
		//progess.setText('Loading Files');
		/// Getting all files inside the folder
		for (var file in files){
			rows.push({
				title: files[file]['@attributes']['file_name'],
				id: files[file]['@attributes']['id'],
				is_folder: false
			})
		}
		
		folderList.setData(rows);
		
		//pDialog.hide();
		
	});
}

function uploadFile(folder, media){
	Ti.API.debug("uploadFile: ");
	var folder_id = folder || BOXModule.ROOT_FOLDER_ID;
	BOXModule.callMethod("upload", {
		"file" : media,
		"share" : "0",
		"message" : "Uploaded using API",
		// Uploading to the root directory for now
		"folder_id" : folder
	}, function(data) {
		Ti.API.debug(JSON.stringify(data));
	});
}

function showFolderContent(folder_id){
	
}

function findFolderById(folder_id){
	
}

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

function createFolderDialog(){
	var view = Ti.UI.createView({
		width: '100%',
		height: '100%',
		backgroundColor: 'red'
	})
	return view;
}

/*
 *  UI extra stuff
 */

function createCustomButton(icon_name,name){
	var button = Ti.UI.createView({
		layout: 'vertical',
		width: 65,
		height: 50,
		touchEnabled: true,
		borderColor: '#eee',
		borderRadius: 4,
		borderWidth: 1,
		left: 5,
		backgroundColor: '#fff'
	})
	//Ti.API.debug(icon_name)
	var icon = Ti.UI.createImageView({
		url: './images/buttons/'+icon_name+'.png',
		width: 32,
		height: 32,
		top: 0,
		left:16
	})
	
	var label = Ti.UI.createLabel({
		text: name,
		color: '#666',
		font: { fontSize: '9px'},
		height: 18,
		textAlign: 'center'
	})
	
	button.add(icon);
	button.add(label);
	button.show();
	return button;
}

function xmlToJson(xml) {
    var attr, child, attrs = xml.attributes, children = xml.childNodes, key = xml.nodeType, obj = {}, i = -1;

    if(key == 1 && attrs.length) {
        obj[ key = '@attributes'] = {};
        while( attr = attrs.item(++i)) {
            obj[key][attr.nodeName] = attr.nodeValue;
        }
        i = -1;
    } else if(key == 3) {
        obj = xml.nodeValue;
    }
    for ( var i = 0; i < children.length; i++) {
        var child = children.item(i);
        key = child.nodeName;
        if(obj.hasOwnProperty(key)) {
            if(obj.toString.call(obj[key]) != '[object Array]') {
                obj[key] = [obj[key]];
            }
            obj[key].push(xmlToJson(child));
        } else {
            obj[key] = xmlToJson(child);
        }
    }

    return obj;
}



/// This should be on UIFactory.js (common js)
function createActivityWindow(msg){
	var actInd = Titanium.UI.createActivityIndicator({
	    height:50,
	    width:210,
	    top:100,
	    color:'black',
	    message:msg,
	    zIndex:100,
	    font : {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'},
	    //style : Titanium.UI.iPhone.ActivityIndicatorStyle.DARK,
	    //style: Titanium.UI.Android.
	});
	return actInd;
}
