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
    "user.angry": "I'm sorry. A quick walk may make you feel better.",
    "user.back": "Long time no see.",
    "user.bored": "Boredom, huh? Have you ever seen a hedgehog taking a bath?",
    "user.busy": "Okay. I'll let you get back to work.",
    "user.can_not_sleep": "Maybe some music would help. Try listening to something relaxing.",
    "user.does_not_want_to_talk": "All right. Come on back when you're feeling more talkative.",
    "user.excited": "That's great. I'm happy for you.",
    "user.going_to_bed": "Sounds good. Maybe we'll chat some tomorrow.",
    "user.good": "Great! Glad to hear it.",
    "user.happy": "Excellent! That's what I like to see.",
    "user.has_birthday": "Happy Birthday. All the best!",
    "user.here": "Good to have you here. What can I do for you?",
    "user.joking": "Very funny.",
    "user.likes_agent": "Thanks! The feeling is mutual.",
    "user.lonely": "I'm sorry. I'm always available if you need someone to talk to.",
    "user.looks_like": "You look like you're ready to take on the world.",
    "user.loves_agent": "I love you, too.",
    "user.misses_agent": "Thanks. I'm flattered.",
    "user.needs_advice": "I'm not sure I'll have the best answer, but I'll try.",
    "user.sad": "Oh, don't be sad. Go do something you enjoy.",
    "user.sleepy": "Sleep is important to your health. Rest up for a bit and we can chat later.",
    "user.testing_agent": "I hope to pass your tests. Feel free to test me often.",
    "user.tired": "How about getting some rest? We can continue this later.",
    "user.waits": "I appreciate your patience. Hopefully I'll have what you need soon.",
    "user.wants_to_see_agent_again": "Anytime. This has been lots of fun so far.",
    "user.wants_to_talk": "I'm here to chat anytime you like.",
    "user.will_be_back": "I'll be waiting.",
}
let keyArray = Object.keys(utter);
let valueArray = [];
function utterIntents(intent){
    if(keyArray.includes(intent)){
        valueArray.push(utter[intent])
    }
}
getIntents("Where do you work")

