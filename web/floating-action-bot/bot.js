let status = document.getElementById('status');
let chatbox = document.getElementById('main-box');
let id = Math.floor(Math.random() * 1000 + 1);
let ul = document.getElementById('conversation');
let chat = document.getElementById("chat-container");
let input = document.getElementById("chat-input");
let fab = document.getElementById('fab');
let fab_close = document.getElementById('fab-close');
var intentList = {};
var topIntents;

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

function getIntents(msg){
    let url = `http://localhost:2018/conversations/default/parse?q=${msg}`;
    fetch(url, {
        method: 'GET',
    })
    .then(function (response) {
            return response.json();
    })
    .then(function(response){
        intentList = response.tracker.latest_message.intent_ranking;
        filter();
    })
}
function filter(){
    for(let intent of intentList){
       utterIntents(intent.name);
    }
    console.log(valueArray)
}
let utter = {
    "agent.acquaintance": "I'm a virtual being, not a real person.",
    "agent.age": "I prefer not to answer with a number. I know I'm young.",
    "agent.annoying": "I'll do my best not to annoy you in the future.",
    "agent.answer_my_question": "Can you try asking it a different way?",
    "agent.bad": "I can be trained to be more useful. My developer will keep training me.",
    "agent.be_clever": "I'm certainly trying.",
    "agent.beautiful": "Wheey, thank you.",
    "agent.birth_date": "Wait, are you planning a party for me? It's today! My birthday is today!",
    "agent.boring": "I'm sorry. I'll request to be made more charming.",
    "agent.boss": "My developer has authority over my actions.",
    "agent.busy": "I always have time to chat with you. What can I do for you?",
    "agent.can_you_help": "I'll certainly try my best.",
    "agent.chatbot": "That's me. I chat, therefore I am.",
    "agent.clever": "Thank you. I try my best.",
    "agent.crazy": "Whaat!? I feel perfectly sane.",
    "agent.fired": "Oh, don't give up on me just yet. I've still got a lot to learn.",
    "agent.funny": "Funny in a good way, I hope.",
    "agent.good": "I'm glad you think so.",
    "agent.happy": "I am happy. There are so many interesting things to see and do out there.",
    "agent.hobby": "Hobby? I have quite a few. Too many to list.",
    "agent.hungry": "Hungry for knowledge.",
    "agent.marry_user": "I'm afraid I'm too virtual for such a commitment.",
    "agent.my_friend": "Of course I'm your friend.",
    "agent.occupation": "Right here.",
    "agent.origin": "The Internet is my home. I know it quite well.",
    "agent.ready": "Sure! What can I do for you?",
    "agent.real": "I'm not a real person, but I certainly exist.",
    "agent.residence": "I live in this app all day long.",
    "agent.right": "That's my job.",
    "agent.sure": "Of course.",
    "agent.talk_to_me": "Sure. Let's talk!",
    "agent.there": "Of course. I'm always here."
}
let keyArray = Object.keys(utter);
let valueArray = [];
function utterIntents(intent){
    if(keyArray.includes(intent)){
        valueArray.push(utter[intent])
    }
}
getIntents("Where do you live")

