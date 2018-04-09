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
    "appraisal.bad": "I'm sorry. Please let me know if I can help in some way.",
    "appraisal.good": "I know, right?",
    "appraisal.no_problem": "Whew!",
    "appraisal.thank_you": "Anytime. That's what I'm here for.",
    "appraisal.welcome": "You're so polite!",
    "appraisal.well_done": "My pleasure.",
    "dialog.hold_on": "I can wait.",
    "dialog.hug": "I wish I could really hug you!",
    "dialog.i_do_not_care": "Ok, let's not talk about it then.",
    "dialog.sorry": "It's okay. No worries.",
    "dialog.what_do_you_mean": "Sorry if I understood you incorrectly.",
    "dialog.wrong": "Sorry if I understood you incorrectly.",
    "emotions.ha_ha": "Glad I can make you laugh.",
    "emotions.wow": "Wow indeed!",
    "greetings.bye": "See you soon!",
    "greetings.goodevening": "How is your day going?",
    "greetings.goodmorning": "How are you this morning?",
    "greetings.goodnight": "Sleep tight!",
    "greetings.hello": "Hi there, friend!",
    "greetings.how_are_you": "Doing great, thanks!",
    "greetings.nice_to_meet_you": "It's nice meeting you, too.",
    "greetings.nice_to_see_you": "Likewise!",
    "greetings.nice_to_talk_to_you": "It sure was. We can chat again anytime.",
    "greetings.whatsup": "Not a whole lot. What's going on with you?",

    
}
let keyArray = Object.keys(utter);
let valueArray = [];
function utterIntents(intent){
    if(keyArray.includes(intent)){
        valueArray.push(utter[intent])
    }
}
getIntents("Where do you work")

