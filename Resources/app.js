// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

//
// create base UI tab and root window
//

var labelTitle = Ti.UI.createLabel({
	text: 'Box.com Sample App',
	width: '100%',
	height: '50dp',
	color: '#fff',
	textAlign: 'center',
	fullScreen:true,
	exitOnClose: true,
	top: 0,
	backgroundColor: '#267BB6',
	font: { fontSize: 14, fontWeight: 'bold'}
})

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
		Ti.API.debug('List folders callback');
		var root = JSON.parse(xmlToJson(Ti.XML.parseString(data.responseText)));
		Ti.API.debug("Folders: "+JSON.stringify(xmlToJson(Ti.XML.parseString(data.responseText))));
		Ti.API.debug(root['tree'])
		for (var i in root){
			Ti.UI.debug(root[i]);
		}
		
		/*var xmlDocument = Ti.XML.parseString(data.responseText);
		var tree = xmlDocument.getElementsByTagName('tree');
		alert(tree[0].item(0).text);
		for(var i=0;i<folders.length;i++){
			alert(folders[i].item(0).text)
		}
		*/
	});
})


win1.add(labelTitle);
win1.add(createFolder);
win1.add(listFolders);

win1.open();

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

function createFolderDialog(){
	var view = Ti.UI.createView({
		width: '100%',
		height: '100%',
		backgroundColor: 'red'
	})
	return view;
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
