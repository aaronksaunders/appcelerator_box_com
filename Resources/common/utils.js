Utils = {};
Utils.createActivityWindow = function(msg) {
	var actInd = Titanium.UI.createActivityIndicator({
		height : '50dp',
		width : '210dp',
		top : '100dp',
		color : 'black',
		message : msg,
		zIndex : 100,
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 15,
			fontWeight : 'bold'
		},
		//style : Titanium.UI.iPhone.ActivityIndicatorStyle.DARK,
		//style: Titanium.UI.Android.
	});
	return actInd;
}

Utils.xmlToJson = function(xml) {
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
exports.Utils = Utils;
