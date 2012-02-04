// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

/// This should be on the globals.js file 
var current_folder = 0;
var history = [];

//
// create base UI tab and root window
//

var toolbarView = Ti.UI.createView({
	width: '100%',
	height: '50dp',
	layout: 'horizontal'
})


var tableHeader = Ti.UI.createView({
	height:'25dp',
	width:'100%',
	layout:'horizontal'
})

var folderList = Ti.UI.createTableView({
	height: 'auto',
	data: [{title:'Empty',hasChild:false}],
	header: tableHeader,
	style: Ti.UI.iPhone.TableViewStyle.GROUPED,
	backgroundColor: '#EFF5F9'
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

var upFolder = createCustomButton('up','Up');
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
	dumpFolderContents(current_folder);
})

upFolder.addEventListener('click',function(){
	if(history.length>0){
		dumpFolderContents(history.pop(),true);
	}
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
				"folder_id" : current_folder
			}, function(data) {
				if(data.success){
					Ti.API.debug(JSON.stringify(data));
					dumpFolderContents(current_folder);
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
	if(e.rowData.isFolder)
		dumpFolderContents(e.rowData.id);
	else {
		/// Need to download file and show it on device with default application
	}
})

// View to hold the labels with current folder
var viewCurrentFolder = Ti.UI.createView({
	backgroundColor: '#fff',
	layout: 'horizontal',
	height:'20dp'
})

tableHeader.add(labelCurrentFolder);
tableHeader.add(labelCurrentFolderName);

win1.add(labelTitle);
toolbarView.add(upFolder);
toolbarView.add(createFolder);
toolbarView.add(refreshFolder);
toolbarView.add(uploadFile);

win1.add(toolbarView);
win1.add(tableHeader);
//win1.add(viewCurrentFolder);
win1.add(folderList);
win1.open();

// create the module
var B = require('box_module').BOXModule;
// api_key & callback_url
var BOXModule = new B('aeu2bzzrh76crhsbggx1nzubc4p37ou0', 'http://www.clearlyinnovative.com/oAuth.html');


BOXModule.login(function(){
	Ti.API.debug('Loged in.');
	dumpFolderContents();
});

function dumpFolderContents(_folder_id,backwards){

	var find_by_folder_id = _folder_id || BOXModule.ROOT_FOLDER_ID;
	
	if ( ( find_by_folder_id != BOXModule.ROOT_FOLDER_ID ) && (!backwards) ){
		history.push(current_folder);
	}
	
	Ti.API.debug('dump_files: Geting conotents of folder: ' + find_by_folder_id);
	BOXModule.callMethod("get_account_tree", {
		"folder_id" : find_by_folder_id, // 0 == root directory
		"params[]" : ['nozip','onelevel']
	}, function(data) {
		current_folder = find_by_folder_id;
		var pDialog = createActivityWindow('Loading...');
		pDialog.show();
		
		Ti.API.debug('List folders callback');
		pDialog.setMessage("Loading Folders");
		var xmlDoc = xmlToJson(Ti.XML.parseString(data.responseText));
		var root_folder = xmlDoc['response']['tree']['folder'];
		Ti.API.debug("Root Folder: "+JSON.stringify(root_folder));
		
		var folders = (root_folder['folders']) ? root_folder['folders']['folder'] : {};
		
		var files = {}
		
		if(root_folder['files'])
			files = root_folder['files']['file'];
		
		/// Setting folder name on label
		if(find_by_folder_id === BOXModule.ROOT_FOLDER_ID)
			labelCurrentFolderName.setText('Root');
		else 
			labelCurrentFolderName.setText(root_folder['@attributes']['name']);
		
		var rows = [];
		for (var folder in folders){
			Ti.API.debug("Subfolder: "+JSON.stringify(folders[folder]))
			//if()
			var folderId = (folders.length) ? folders[folder]['@attributes']['id'] : folders[folder]['id'];
			var folderName = (folders.length) ? folders[folder]['@attributes']['name'] : folders[folder]['name'] ;
			var shared = (folders.length) ? (folders[folder]['@attributes']['shared']==1) : (folders[folder]['shared']==1);
			
			Ti.API.debug(JSON.stringify(folders[folder]))
			var row = Titanium.UI.createTableViewRow({
				id:folderId,
				hasChild: true,
				touchEnabled: true,
				isFolder: true,
				backgroundColor: '#fff',
			});
			
			var folderView = Ti.UI.createView({
				backgroundColor: '#fff',
				height: '100%',
				width: '100%',
				layout: 'horizontal'
			}) 
			
			var icon = Ti.UI.createImageView({
					image: (shared) ? './images/folder_shared.png' : './images/folder.png',
					width: 32,
					height: 32,
					left: 2
				})
			
			var folderName = Ti.UI.createLabel({
				text: folderName,
				height: '50dp',
				width: 'auto',
				color: '#000',
				left: 5,
				font: { fontSize: '14px', fontWeight:'bold'}
			})
			
			folderView.add(icon);
			folderView.add(folderName);
			row.add(folderView);
			rows.push(row)
		}
		pDialog.setMessage("Loading Files");
		for (var file in files){
			
			var row = Titanium.UI.createTableViewRow({
				id:files[file]['@attributes']['id'],
				hasChild: false,
				touchEnabled: true,
				isFolder: false
			});
			
			var fileView = Ti.UI.createView({
				backgroundColor: '#fff',
				height: '100%',
				width: '100%',
				layout: 'horizontal'
			}) 
			
			var icon = Ti.UI.createImageView({
					image: files[file]['@attributes']['thumbnail'],
					width: 32,
					height: 32,
					left: 2
				})
			
			var fileName = Ti.UI.createLabel({
				text: files[file]['@attributes']['file_name'],
				height: '50dp',
				width: 'auto',
				color: '#000',
				left: 5,
				font: { fontSize: '14px', fontWeight:'bold'}
			})
			
			fileView.add(icon);
			fileView.add(fileName);
			row.add(fileView);
			rows.push(row)
		}
		if(rows.length > 0)
			folderList.setData(rows);
		else
			folderList.setData({title:'Empty',hasChild:false})
		
		pDialog.hide();
		
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
		left:15
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
