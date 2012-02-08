// Globals
app = require('/common/globals');

/**
 * constructor for window object
 */
DetailWindow = function(controller, fileinfo) {

	// create window
	this.proxy = Ti.UI.createWindow({
		title : fileinfo.filename,
		width : '100%',
		height : '100%',
		modal : true
	});

	// create the webview for rendering the file
	this.webView = Ti.UI.createWebView({
		url : fileinfo.url
	})

	// add web view
	this.proxy.add(this.webView);

	// add cancel for IOS, use back button on Android
	if(app.globals.isAndroid === false) {
		var cancel, that = this;

		// create button
		cancel = Titanium.UI.createButton({
			systemButton : Titanium.UI.iPhone.SystemButton.CANCEL
		});

		// add button
		that.proxy.setRightNavButton(cancel);

		//button listener
		cancel.addEventListener('click', function() {
			that.proxy.close();
		});
	}
	return this;

}
/**
 * open window
 */
DetailWindow.prototype.open = function() {
	this.proxy.open({
		modal : true
	});
}
/**
 * close window
 */
DetailWindow.prototype.close = function() {
	// close window and clean up a bit
	this.proxy.remove(this.webView);
	this.webView = null;
	this.proxy.close();
}

exports.DetailWindow = DetailWindow;
