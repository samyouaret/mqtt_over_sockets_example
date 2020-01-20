function createClient(name) {
    var client = new Paho.MQTT.Client("localhost", 15675, "/ws", name + "_" + parseInt(Math.random() * 100, 10));
    //set callback handlers
    client.onConnectionLost = onConnectionLost;

    //connect the client
    client.connect({
        onSuccess: onConnect
    });
    return client;
}

function onArrived(clientNum) {
    return function (message) {
        let box = selectByDataId(".message-box", clientNum);
        box.prepend(message.payloadString + "\n");
    }
}

function subscribe(clientNum) {
    var topic = selectByDataId(".subscribeTo", clientNum);
    getClient(clientNum).subscribe(topic.val());
    console.log("subscribed");
}

function connect(clientNum) {
    var client = getClient(clientNum);
    if (client.isConnected()) {
        return;
    }
    client.connect();
    setConnectionStatus(clientNum, true);
}

function sendMessage(clientNum) {
    let client = getClient(clientNum);
    if (!client.isConnected()) {
        return;
    }
    // get sender information
    var topic = selectByDataId(".topic", clientNum);
    var msg = selectByDataId(".message", clientNum);
    //show animation when sending messages
    var msgStatus = selectByDataId(".message-status", clientNum);
    msgStatus.css("display", "block");
    msgStatus.attr("src", "/images/loader.gif");
    console.log("message" + msg.val());
    //create message and send
    message = createMessage(msg.val(), topic.val());
    getClient(clientNum).send(message);
    // remove animation after 300ms
    setTimeout(() => {
        msgStatus.css("display", "none");
    }, 300);
    // logging to console
    console.log("sent message succesfully");
}

function createMessage(msg, topic) {
    message = new Paho.MQTT.Message(msg);
    message.destinationName = topic;
    return message;
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

// the program 
const ROBOOT_1 = 1;
const ROBOOT_2 = 2;
const CAMERA = 3;
const COMMAND_CENTER = 4;
// helper just to get desired client based on it number
function getClient(clientNum) {
    switch (clientNum) {
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
// bind onMessageArrived callbaks for all clients
robot1.onMessageArrived = onArrived(ROBOOT_1);
robot2.onMessageArrived = onArrived(ROBOOT_2);
camera.onMessageArrived = onArrived(CAMERA);
commandCenter.onMessageArrived = onArrived(COMMAND_CENTER);

// a function that emulate sending of messages up to 100 message
function simulate() {
    // the commenad center is subscriber
    subscribe(COMMAND_CENTER);
    for (let i = 0; i < 1000; i++) {
        setTimeout(function () {
            // publish messages to command center
            sendMessage(ROBOOT_1);
            sendMessage(ROBOOT_2);
            sendMessage(CAMERA);
        }, 1000);
    }
}

// helper to display connection status
function setConnectionStatus(clientNum, flag) {
    let status = selectByDataId(".connection-status", clientNum);
    console.log(status);
    let color = flag ? "#00ff71" : "#dc3535";
    status.css("background-color", color);
}

// select html element based on client id
function selectByDataId(selector, clientNum) {
    return $(`${selector}[data-id='${clientNum}']`);
}