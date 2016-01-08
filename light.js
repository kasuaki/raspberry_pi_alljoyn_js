var AJ = require('AllJoyn');

var INTERFACE_NAME = "org.alljoyn.SensorLightCamera.Sensor";
var SERVICE_NAME = "org.alljoyn.SensorLightCamera";
var SERVICE_PATH = "/";

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
}

AJ.onSignal = function() {
    print("Object path: ", this.path);
    print("Interface: ", this.iface);
    print("Member: ", this.member);
    print("Arguments: ", JSON.stringify(arguments));

    if (this.member == "sensed") {
    }
}

