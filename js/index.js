function connect(clientNum) {
    var client = getClient(clientNum);
    if (client.isConnected()) {
        return;
    }
    client.connect();
    setConnectionStatus(clientNum, true);
}

function subscribe(client) {
    var topic = $(`.subscribeTo[data-id='${client}']`);
    getClient(client).subscribe(topic.val());
    console.log("subscribed");

}

function sendMessage(clientNum) {
    let client = getClient(clientNum);
    if (!client.isConnected()) {
        return;
    }
    var topic = $(`.topic[data-id='${clientNum}']`);
    var msg = $(`.message[data-id='${clientNum}']`);
    var msgStatus = $(`.message-status[data-id='${clientNum}']`);
    msgStatus.css("display", "block");
    msgStatus.attr("src", "/images/loader.gif");
    console.log("message" + msg.val());
    message = new Paho.MQTT.Message(msg.val());
    message.destinationName = topic.val();
    getClient(clientNum).send(message);
    setTimeout(() => {
        msgStatus.css("display", "none");
    }, 300);
    console.log("sent message succesfully");
}


function disconnect(clientNum) {
    var client = getClient(clientNum);
    if (!client.isConnected()) {
        return;
    }
    console.log("disconnected");
    setConnectionStatus(clientNum, false);
    client.disconnect();
}

// Web Messaging API callbacks

//called when the client connects
function onConnect() {
    console.log("connected");
    
}

//called when the client loses its connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
}

function createClient(name) {
    var client = new Paho.MQTT.Client("localhost", 15675, "/ws", name + "_" + parseInt(Math.random() * 100, 10));
    //set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    //connect the client
    client.connect({
        onSuccess: onConnect
    });
    return client;
}

//called when a message arrives

//called when a message arrives
function onMessageArrived(message) {
    console.log(message);
    console.log("onMessageArrived:" + message.payloadString);
    console.log("onMessageArrived:" + message);
}

const ROBOOT_1 = 1;
const ROBOOT_2 = 2;
const CAMERA = 3;
const COMMAND_CENTER = 4;

function getClient(client) {
    switch (client) {
        case ROBOOT_1:
            return robot1;
            break;
        case ROBOOT_2:
            return robot2;
            break;
        case CAMERA:
            return camera;
            break;
        case COMMAND_CENTER:
            return commandCenter;
            break;
        default:
            return null;
            break;
    }
}
robot1 = createClient("robot1");
robot2 = createClient("robot2");
camera = createClient("camera");
commandCenter = createClient("Command-center");

robot1.onMessageArrived = onArrived(ROBOOT_1);
robot2.onMessageArrived = onArrived(ROBOOT_2);
camera.onMessageArrived = onArrived(CAMERA);
commandCenter.onMessageArrived = onArrived(COMMAND_CENTER);

function onArrived(client) {
    return function (message) {
        let box = $(`.message-box[data-id='${client}']`);
        box.prepend(message.payloadString + "\n");
        console.log("onMessageArrived:" + message);
    }
}

function emulate() {
    subscribe(COMMAND_CENTER);
    for (let i = 0; i < 1000; i++) {
        setTimeout(function () {
            sendMessage(ROBOOT_1);
            sendMessage(ROBOOT_2);
            sendMessage(CAMERA);
        }, 1000);
    }
}

function setConnectionStatus(client, flag) {
    let status = $(`.connection-status[data-id='${client}']`);
    console.log(status);
    let color = flag ? "#00ff71" : "#dc3535";
    status.css("background-color", color);
}