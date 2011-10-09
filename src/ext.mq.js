/**
* Ext.mq
* Message Queue implementation for Ext.Core / Ext.JS capable of remoting
*
* LICENSE
*
* This source file is subject to the new BSD license that is bundled
* with this package in the file LICENSE.
* It is also available through the world-wide-web at this URL:
* http://web-rocker.de/projekte/new-bsd-license/
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to community@web-rocker.de so we can send you a copy immediately.
*
* @category Ext
* @package MQ
* @copyright Copyright (c) 2011 Web Rocker (http://web-rocker.de)
* @license http://web-rocker.de/projekte/new-bsd-license/ New BSD License
*/

MQ = {
	'subscribers' : [],
	'webserviceurl' : '/'
};

MQ.subscribe = function (_pattern, _callback) {
	this.subscribers.push({
		'regexp' : new RegExp(_pattern),
		'callback' : _callback
	});
}

MQ.publish = function (_pattern, _payload) {	
	if (_pattern.match(new RegExp(/webservice\.(.*)/))) {
		this.ajax(_pattern, _payload);
	} else {
		this.dispatch(_pattern, _payload);
	}
}	

MQ.urlgenerator = function (_pattern) {
	var clean = _pattern.replace(new RegExp(/webservice\./), '');
	return this.webserviceurl + clean.replace(new RegExp(/\./g), '/') + '/';
}

MQ.dispatch = function (_pattern, _payload) {
	this.subscribers.forEach(function(subscriber) {
		if (_pattern.match(subscriber.regexp)) {
			subscriber.callback(_pattern, _payload);
		}
	});
}

MQ.ajax = function (_pattern, _payload) {
    Ext.Ajax.request({
		'url' : this.urlgenerator(_pattern),
		'params' : _payload ? _payload : {},
		'success' : function(response) {
			try {
				var obj = Ext.decode(response.responseText);
				this.dispatch(_pattern + '.success', obj);
			} catch (e) {
				this.dispatch(_pattern + '.failure', response);
			}
		},
		'failure' : function(response) {
			this.dispatch(_pattern + '.failure', response);
		}
	},
	this);
}
