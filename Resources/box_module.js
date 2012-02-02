/**
 *
 * Copyright 2012 Aaron K. Saunders, Clearly Innovative Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     <a href="http://www.apache.org/licenses/LICENSE-2.0">http://www.apache.org/licenses/LICENSE-2.0</a>
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
BOXModule = function(api_key, redirectUri) {
	this.api_key = api_key || 'aeu2bzzrh76crhsbggx1nzubc4p37ou0';
	this.redirectUri = redirectUri || 'http://www.clearlyinnovative.com/oAuth.html';
	this.ACCESS_TOKEN = null;
	this.xhr = null;
	this.API_URL = "https://www.box.net/api/1.0/rest?action=";
	this.ticket = null;
};

BOXModule.prototype.logout = function() {
	showAuthorizeUI(String.format('https://foursquare.com/oauth2/authorize?response_type=token&client_id=%s&redirect_uri=%s', BOXModule.clientId, BOXModule.redirectUri));
	return;
};
/**
 * displays the familiar web login dialog we all know and love
 *
 * @params authSuccess_callback method called when successful
 *
 */
BOXModule.prototype.login = function(authSuccess_callback) {

	var that = this;

	if(authSuccess_callback != undefined) {
		that.success_callback = authSuccess_callback;
	}

	this.getTicket(function() {
		that.showAuthorizeUI(String.format('https://m.box.net/api/1.0/auth/%s', that.ticket));
	});
	return;
};

BOXModule.prototype.getTicket = function(callback) {
	var that = this;

	// get the login information and let it roll!!
	try {

		if(that.xhr == null) {
			that.xhr = Titanium.Network.createHTTPClient();
		}

		that.xhr.open("GET", "https://www.box.net/api/1.0/rest?action=get_ticket&api_key=" + that.api_key);

		that.xhr.onerror = function(e) {
			Ti.API.error("BOXModule ERROR " + e.error);
			Ti.API.error("BOXModule ERROR " + that.xhr.location);
			if(error) {
				error(e);
			}
		};

		that.xhr.onload = function(_xhr) {
			Ti.API.debug("BOXModule response: " + that.xhr.responseText);
			var xmlDocument = Ti.XML.parseString(that.xhr.responseText);
			var ticket = xmlDocument.getElementsByTagName('ticket');
			that.ticket = ticket.item(0).text;
			if(callback !== null) {
				callback(that.ticket);
			}
		};

		that.xhr.send();
	} catch(err) {
		Titanium.UI.createAlertDialog({
			title : "Error",
			message : String(err),
			buttonNames : ['OK']
		}).show();
	}
}
BOXModule.prototype.callMethod = function(method, params, callback) {
	var that = this;

	// get the login information and let it roll!!
	try {

		if(that.xhr == null) {
			that.xhr = Titanium.Network.createHTTPClient();
		}

		var url = that.API_URL + method + "?api_key=" + that.api_key + "&auth_token=" + that.ACCESS_TOKEN;

		// add params
		var paramMap = params || {};
		for(var a in paramMap) {
			url += '&' + Titanium.Network.encodeURIComponent(a) + '=' + (paramMap[a] ? Titanium.Network.encodeURIComponent(paramMap[a]) : "");
		}

		// open client
		that.xhr.open("GET", url);

		that.xhr.onerror = function(e) {
			Ti.API.error("BOXModule ERROR " + e.error);
			Ti.API.error("BOXModule ERROR " + that.xhr.location);
			if(callback !== null) {
				callback({
					"success" : false,
					"error" : e
				});
			}
		};

		BOXModule.xhr.onload = function(_xhr) {
			Ti.API.debug("BOXModule response: " + that.xhr.responseText);
			var xmlDocument = Ti.XML.parseString(that.xhr.responseText);
			if(callback !== null) {
				callback({
					"success" : true,
					"error" : null,
					"responseText" : that.xhr.responseText
				});
			}
		};

		BOXModule.xhr.send();
	} catch(err) {
		Titanium.UI.createAlertDialog({
			title : "Error",
			message : String(err),
			buttonNames : ['OK']
		}).show();
	}
};
/**
 * code to display the familiar web login dialog we all know and love
 */
BOXModule.prototype.showAuthorizeUI = function(pUrl) {

	var that = this;
	window = Ti.UI.createWindow({
		//modal : true,
		fullscreen : true,
		width : '100%',
		tabBarHidden : true,

	});
	closeLabel = Ti.UI.createLabel({
		textAlign : 'right',
		font : {
			fontWeight : 'bold',
			fontSize : '12pt'
		},
		text : '(X)',
		top : 5,
		right : 12,
		height : 14
	});
	window.open();
	webView = Ti.UI.createWebView({
		scalesPageToFit : true,
		touchEnabled : true,
		width : '100%',
		url : pUrl,
		autoDetect : [Ti.UI.iOS.AUTODETECT_NONE]
	});
	webView.addEventListener('beforeload', function(e) {
		if(e.url.indexOf(that.redirectUri) != -1 || e.url.indexOf('https://www.box.net/') != -1) {
			Titanium.API.debug(e);

			that.authorizeUICallback.call(that, e);
			webView.stopLoading = true;
		}
	});
	webView.addEventListener('load', function(e) {
		that.authorizeUICallback.call(that, e);
	});

	closeLabel.addEventListener('click', function(e) {
		that.destroyAuthorizeUI.call(that, e);
	});
	window.add(webView);
	window.add(closeLabel);

};
/**
 * unloads the UI used to have the user authorize the application
 */
BOXModule.prototype.destroyAuthorizeUI = function() {
	var that = this;

	Ti.API.debug('destroyAuthorizeUI');
	// if the window doesn't exist, exit
	if(window == null) {
		return;
	}

	// remove the UI
	try {
		Ti.API.debug('destroyAuthorizeUI:webView.removeEventListener');
		webView.removeEventListener('load', that.authorizeUICallback);
		Ti.API.debug('destroyAuthorizeUI:window.close()');
		window.hide();
	} catch(ex) {
		Ti.API.debug('Cannot destroy the authorize UI. Ignoring.');
	}
};
/**
 * executes callback if specified when creating object
 */
BOXModule.prototype.authorizeUICallback = function(e) {
	var that = this;

	Ti.API.debug('authorizeUILoaded ' + e.url);
	Titanium.API.debug(e);

	if(e.url.indexOf('auth_token') != -1) {
		var token = e.url.split("&")[1];
		that.ACCESS_TOKEN = token.split("=")[1];

		if(that.success_callback != undefined) {
			that.success_callback({
				access_token : that.ACCESS_TOKEN,
			});
		}

		that.destroyAuthorizeUI();

	} else if('https://www.box.net/' === e.url) {
		that.destroyAuthorizeUI();
	} else if(e.url.indexOf('#error=access_denied') != -1) {
		that.destroyAuthorizeUI();
	}

};

exports.BOXModule = BOXModule;
