let status = document.getElementById('status');
let chatbox = document.getElementById('main-box');
let id = Math.floor(Math.random() * 1000 + 1);
let ul = document.getElementById('conversation');
let chat = document.getElementById("chat-container");
let input = document.getElementById("chat-input");
let fab = document.getElementById('fab');
let fab_close = document.getElementById('fab-close');

const url = 'http://localhost:8081/api/v1';

input.addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("btn").click();
    }
});

window.onload = function () {
    fetch(`${url}/status`, {
        method: 'GET'
    })
        .then(function (response) {
            status.innerHTML = "<i class='fas fa-circle'></i> Online";
        })
        .catch(function (response) {
            status.innerHTML = "<i class='fas fa-circle' style='color:red'></i> Offline";
        })
}

function openchat() {
    chatbox.style.display = "block"
    fab.style.display = "none";
    fab_close.style.display = "block";
}

function closechat() {
    chatbox.style.display = "none";
    fab_close.style.display = "none";
    fab.style.display = "block";
}

function start(msg) {
    createSender(msg);
    document.getElementById('typing').style.display = "inline";
    respond(msg);
}

function speak(msg) {
    var speech = new SpeechSynthesisUtterance(msg);
    speech.voice = speechSynthesis.getVoices()[5];
    window.speechSynthesis.speak(speech);
}

function createSender(msg) {
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(msg));
        li.className = "sender"
        ul.appendChild(li);
        document.getElementById('chat-input').value = "";
        chat.scrollTop = chat.scrollHeight;
}

function createResponder(msg) {
    let li = document.createElement('li');
    li.innerHTML = msg;
    if (voice() == true)
        speak(li.innerText);
    li.className = 'responder';
    ul.appendChild(li)
    chat.scrollTop = chat.scrollHeight;
}

function send() {
    let message = document.getElementById('chat-input').value;
    if (message != '') {
        createSender(message);
        document.getElementById('typing').style.display = "inline";
        respond(message);
    }
}

function respond(msg) {
    data = {
        query: msg
    }
    fetch(`${url}/${id}/respond`, {
        method: 'POST',
        body: JSON.stringify(data)
    })
        .then(function (response) {
            document.getElementById('typing').style.display = "none";
            return response.json();
        })
        .then(function (responses) {
            console.log(responses);
            if (responses) {
                for (let response of responses) {
                    createResponder(response.text);
            }
            } else {
                createResponder("Sorry, I'm having trouble understanding you, try asking me in an other way")
            }

        })
        .catch(function (err) {
            document.getElementById('typing').style.display = "none";
            createResponder("I'm having some technical issues. Try again later :)");
        });
}

function voice() {
    let speaker = document.getElementById('voice').checked;
    if (speaker == true)
        return true;
    else
        return false;
}

function listen() {
    let mic = document.getElementById('mic');
    mic.style.color = 'red';
    mic.className = 'animated pulse infinite';
    let hear = new webkitSpeechRecognition();
    hear.continuous = false;
    hear.lang = 'en-IN';
    hear.start();

    hear.onresult = function (e) {
        mic.style.color = 'black';
        mic.className = '';
        userVoiceText = e.results[0][0].transcript;
        hear.stop();
        createSender(userVoiceText);
        respond(userVoiceText);
    }
}