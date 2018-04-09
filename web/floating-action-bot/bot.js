let status = document.getElementById('status');
let chatbox = document.getElementById('main-box');
let id = Math.floor(Math.random() * 1000 + 1);
let ul = document.getElementById('conversation');
let chat = document.getElementById("chat-container");
let input = document.getElementById("chat-input");
let fab = document.getElementById('fab');
let fab_close = document.getElementById('fab-close');
var intentList = {};
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
    "agent.there": "Of course. I'm always here.",
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
    "confirmation.yes": "Great!",
    "confirmation.cancel": "That's forgotten. What next?",
    "confirmation.no": "Okay."
}
let keyArray = Object.keys(utter);
let valueArray = [];
let valueObject = {};
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

function speak(msg) {
    var speech = new SpeechSynthesisUtterance(msg);
    speech.voice = speechSynthesis.getVoices()[3];
    window.speechSynthesis.speak(speech);
}

function send() {
    let msg = document.getElementById('chat-input').value;
    createSender(msg);
    getIntents(msg);
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
            if (data[0]) {
                for(let d of data){
                    createResponder(d)
                }
            }
            else {
                createResponder("Sorry, I'm having technical issues");
            }

        })
        .catch(function (err) {
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

function getIntents(msg){
    let url = `http://localhost:2018/conversations/default/parse?q=${msg}`;
    fetch(url, {
        method: 'GET',
    })
    .then(function (response) {
            return response.json();
    })
    .then(function(response){
        name = response.tracker.latest_message.intent.name;
        confidence = response.tracker.latest_message.intent.confidence * 100;
        if(confidence < 20){
            console.log("Goes to filter " + name + " " + confidence);
            intentList = response.tracker.latest_message.intent_ranking;
            filter(msg);
        }
        else{
            console.log("Goes to respond "+ name +" "+confidence);
            respond(msg)
        }
    })
}

function filter(userMessage){
    for(let intent of intentList){
        utterIntents(intent.name);
    }
    console.log(valueArray);
    findIntent(valueArray.shift().utter, userMessage)
}

function findIntent(utterance, userMessage){
    createResponder(utterance); 
    createResponder(`Did I give you the right response? <br><button class="btn btn-outline-primary btn-sm" onclick="checkCondition('yes', '${userMessage}')">Yes</button><button class="btn btn-sm btn-outline-primary" onclick="checkCondition('no', '${userMessage}')">No</button>`)     
}

function checkCondition(value, userMessage){
    if(value == 'no'){
        createSender("No");
        findIntent(valueArray.shift().utter)
    }
    else if (value == 'yes'){
        createSender("Yes")
        createResponder("I'll keep that in mind.")
        valueArray = [];
    }
}

function utterIntents(intent){
    if(keyArray.includes(intent)){
       valueArray.push({intent: intent, utter: utter[intent]})
    }
}

