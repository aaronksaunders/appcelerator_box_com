
var globals = {
	u : Ti.Android != undefined ? 'dp' : 0,
	isAndroid : Ti.Android != undefined,
};

exports.globals = globals;


exports.GlobalUpdate = function(inName, inValue) {
	this.globals[inName] = inValue;
};
