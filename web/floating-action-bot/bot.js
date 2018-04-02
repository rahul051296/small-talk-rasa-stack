let status = document.getElementById('status');
let chatbox = document.getElementById('main-box');
let id = Math.floor(Math.random() * 1000 + 1);
let ul = document.getElementById('conversation');
let chat = document.getElementById("chat-container");
let input = document.getElementById("chat-input");
let fab = document.getElementById('fab');
let fab_close = document.getElementById('fab-close');

input.addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("btn").click();
    }
});

window.onload = function(){
    fetch('http://localhost:5004/status',{
        method:'GET'
    })
    .then(function(response){
        status.innerHTML = "<i class='fas fa-circle'></i> Online";
    })
    .catch(function(response){
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

function speak(msg) {
    var speech = new SpeechSynthesisUtterance(msg);
    speech.voice = speechSynthesis.getVoices()[3];
    window.speechSynthesis.speak(speech);
}

function send() {
    let msg = document.getElementById('chat-input').value;
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(msg));
    li.className = "sender"
    ul.appendChild(li);
    respond(msg);
    document.getElementById('chat-input').value = "";
    chat.scrollTop = chat.scrollHeight;
}

function respond(msg) {
    data = {
        query: msg,
        id: id
    }
    fetch(`http://localhost:5004/respond`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            if (data[0]) {
                for(let d of data){
                    let li = document.createElement('li');
                    li.innerHTML = d;
                    if (voice() == true)
                        speak(li.innerText);
                    li.className = 'responder';
                    ul.appendChild(li)
                    chat.scrollTop = chat.scrollHeight;
                }
            }
            else {
                let li = document.createElement('li');
                let t = document.createTextNode("Sorry, I'm having technical issues");
                li.className = 'responder';
                li.appendChild(t)
                ul.appendChild(li)
                chat.scrollTop = chat.scrollHeight;
            }

        })
        .catch(function (err) {
            let li = document.createElement('li');
            let t = document.createTextNode("I'm having some technical issues. Try again later :)");
            li.className = 'responder';
            li.appendChild(t)
            ul.appendChild(li)
            chat.scrollTop = chat.scrollHeight;
        });

}

function voice() {
    let speaker = document.getElementById('voice').checked;
    if (speaker == true)
        return true;
    else
        return false;
}