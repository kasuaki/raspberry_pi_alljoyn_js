var AJ = require('AllJoyn');
var IO = require('IO');

var INTERFACE_NAME  = "org.alljoyn.SensorLightCamera.Sensor";
var INTERFACE_NAME2 = "org.alljoyn.SensorLightCamera.Light";
var SERVICE_NAME    = "org.alljoyn.SensorLightCamera";
var SERVICE_PATH    = "/org/alljoyn/SensorLightCamera/Light";

var pin = '18';

// gpio18がなければ設定.
var listBuf = IO.system('sudo ls /sys/class/gpio/');
var listStr = listBuf.toString('UTF-8');
var list = listStr.split('\n');

if (list.indexOf('gpio' + pin) < 0) {
	IO.system('sudo echo ' + pin + ' > /sys/class/gpio/export');
	IO.system('sudo echo out > /sys/class/gpio/gpio' + pin + '/direction');
}
//IO.system('sudo echo ' + pin + ' > /sys/class/gpio/unexport');

AJ.interfaceDefinition[INTERFACE_NAME] =
{
	sensed:{ type:AJ.SIGNAL, args:["b"]},
	sense:{ type:AJ.PROPERTY, signature:'b', access: "R" },
};

AJ.interfaceDefinition[INTERFACE_NAME2] =
{
	lit:{ type:AJ.SIGNAL, args:["b"]},
	light:{ type:AJ.PROPERTY, signature:'b', access: "R" },
};

properties = {
	light: 0,
};

AJ.objectDefinition[SERVICE_PATH] = {
	interfaces:[INTERFACE_NAME, INTERFACE_NAME2]
};

function foundService(svc) {
	print('findService');
//	var signal = svc.signal(svc.path, {nameChanged:svc.interfaces[0]});
//	signal.send('test');
}

AJ.onAttach = function()
{
	print("AJ.onAttach");

	AJ.findServiceByName(SERVICE_NAME, {
		interfaces: [INTERFACE_NAME],
		path: '/',
		port: 25,
	}, foundService);
}

AJ.onDetach = function()
{
	print("AJ.onDetach");
}

AJ.onPropGet = function(iface, prop)
{
	if (iface == INTERFACE_NAME2) {
		this.reply(properties[prop]);
	} else {
		throw('rejected');
	}
}

AJ.onSignal = function() {

	print("Object path: ", this.path);
	print("Interface: ", this.iface);
	print("Member: ", this.member);
	print("Arguments: ", JSON.stringify(arguments));

	if (this.member == "sensed") {

		var val = arguments[0];
		print(IO.system('date') + " : sense: " + val);

		// 日中はライトは付けない.
		var hour = IO.system('date +%H');
		if ((hour >= 7) && (hour <= 17)) {
			val = 0;
		}

		print(IO.system('date') + " : light: " + val);

		// 異なっている場合のみ実施.
		if (properties["light"] != val) {

			properties["light"] = val;
			IO.system('sudo echo ' + val + ' > /sys/class/gpio/gpio' + pin + '/value');

			var signal = AJ.signal(SERVICE_PATH, {lit:INTERFACE_NAME2});
			signal.sessionless = true;
			signal.timeToLive = 0;
			signal.send(val);
		}
	}
}

