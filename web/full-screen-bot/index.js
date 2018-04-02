let ul = document.getElementById('chat-box');
let element = document.getElementById("box");
let id = Math.floor(Math.random()*1000+1);
console.log(id)
function send() {
	let msg = document.getElementById('text-box').value;
	let li = document.createElement('li');
	li.className = 'sender';
	li.appendChild(document.createTextNode(msg))
	ul.appendChild(li)
	document.getElementById('text-box').value = "";
	element.scrollTop = element.scrollHeight;
	respond(msg);
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
			if(data[0]){
				for (let d of data) {
					let li = document.createElement('li');
					li.innerHTML = d;
					li.className = 'responder';
					ul.appendChild(li)
					element.scrollTop = element.scrollHeight;
				}
			}
			else{
				let li = document.createElement('li');
				let t = document.createTextNode("Sorry, I'm having technical issues");
				li.className = 'responder';
				li.appendChild(t)
				ul.appendChild(li)
				element.scrollTop = element.scrollHeight;
			}
			
		})
		.catch(function (err) {
			let li = document.createElement('li');
			let t = document.createTextNode("I'm having some technical issues. Try again later :)");
			li.className = 'responder';
			li.appendChild(t)
			ul.appendChild(li)
			element.scrollTop = element.scrollHeight;
		});

}
var input = document.getElementById("text-box");
input.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("btn").click();
    }
});
//python my_server.py -d models/dialogue -u models/nlu/default/ticketsnlu -o out.log --cors *