'use strict';


function FindFirstVRDevice(devices) {
    var sensorDevice = null;
    var hmdDevice = null;

    // First find an HMD device
    for (var i = 0; i < devices.length; ++i) {
        if (devices[i] instanceof HMDVRDevice) {
            hmdDevice = devices[i];
            break;
        }
    }

    if (!hmdDevice)
        return null;

    // Next find a sensor that matches the HMD hardwareUnitId
    for (var i = 0; i < devices.length; ++i) {
        if (devices[i] instanceof PositionSensorVRDevice &&
            (!hmdDevice || devices[i].hardwareUnitId == hmdDevice.hardwareUnitId)) {
            sensorDevice = devices[i];
            break;
        }
    }

    return {
        'hmdDevice': hmdDevice,
        'sensorDevice': sensorDevice
    };
}


function PerspectiveMatrixFromVRFieldOfView(fov, zNear, zFar) {
    var upTan = Math.tan(fov.upDegrees * Math.PI/180.0);
    var downTan = Math.tan(fov.downDegrees * Math.PI/180.0);
    var leftTan = Math.tan(fov.leftDegrees * Math.PI/180.0);
    var rightTan = Math.tan(fov.rightDegrees * Math.PI/180.0);

    var xScale = 2.0 / (leftTan + rightTan);
    var yScale = 2.0 / (upTan + downTan);

    return [
        xScale,
        0.0,
        0.0,
        0.0,

        0.0,
        yScale,
        0.0,
        0.0,

        -((leftTan - rightTan) * xScale * 0.5),
        ((upTan - downTan) * yScale * 0.5),
        zFar / (zNear - zFar),
        -1.0,

        0.0,
        0.0,
        (zFar * zNear) / (zNear - zFar),
        0.0
    ];
}


function RequestFullscreen(canvas, vrDevice) {
    if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen( { vrDisplay: vrDevice.hmdDevice } );
    } else if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen({ vrDisplay: vrDevice.hmdDevice });
    }
    vrDevice.sensorDevice.zeroSensor();
}


function GetVRDevices(SetupVRDevice) {
    if (navigator.getVRDevices) {
        navigator.getVRDevices().then(SetupVRDevice);
    } else if (navigator.mozGetVRDevices) {
        navigator.mozGetVRDevices(SetupVRDevice);
    } else {
        console.error('WebVR API not supported');
    }
}
