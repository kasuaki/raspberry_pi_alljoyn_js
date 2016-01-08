var AJ = require('AllJoyn');
var IO = require('IO');

var INTERFACE_NAME = "org.alljoyn.SensorLightCamera.Sensor";
var SERVICE_NAME = "org.alljoyn.SensorLightCamera";
var SERVICE_PATH = "/";

var pin = '18';
IO.system('sudo echo ' + pin + ' > /sys/class/gpio/export');
IO.system('sudo echo out > /sys/class/gpio/gpio' + pin + '/direction');

AJ.interfaceDefinition[INTERFACE_NAME] =
{
    sensed:{ type:AJ.SIGNAL, args:["b"]},
    sense:{ type:AJ.PROPERTY, signature:'b' },
};

AJ.objectDefinition[SERVICE_PATH] = {
    interfaces:[INTERFACE_NAME]
};

function foundService(svc) {
	print('findService');
//	var signal = svc.signal(svc.path, {nameChanged:svc.interfaces[0]});
//	signal.send('test');
}

AJ.onAttach = function()
{
    print("AJ.onAttach");

//    AJ.findService(INTERFACE_NAME, foundService);
    AJ.findServiceByName(SERVICE_NAME, {
	interfaces: [INTERFACE_NAME],
	path: SERVICE_PATH,
	port: 25,
}, foundService);
}

AJ.onDetach = function()
{
    print("AJ.onDetach");
    IO.system('sudo echo ' + pin + ' > /sys/class/gpio/unexport');
}

AJ.onSignal = function() {
    print("Object path: ", this.path);
    print("Interface: ", this.iface);
    print("Member: ", this.member);
    print("Arguments: ", JSON.stringify(arguments));

print(arguments[0]);
    if (this.member == "sensed") {
      var val = arguments[0];
      print("sense: ", val);
      IO.system('sudo echo ' + val + ' > /sys/class/gpio/gpio' + pin + '/value');
    }
}

