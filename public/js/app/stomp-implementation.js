// Use SockJS
Stomp.WebSocketClass = SockJS;
var token = "93b3b2f1-3c3a-11e5-8e61-42010af056e4";
/*
  var username = "sripad",
  password = "123456",*/
  var username = "@ind1",
  password = token,  
    vhost    = "/",
    url      = host,
    queue    = "topic"; // To translate mqtt topics to
                             // stomp we change slashes 
                             // to dots
var divBox = document.getElementById('console');

var sendMessage = function(){
		var msgText = document.getElementById('msg').value;
		document.getElementById('msg').value = "";
		if(!msgText){
			return;		
		}
		//var message = {type: 'notification', value: pubTopic +" : " +msgText};
		message = msgText;
		on_message({ body : 'Sent :  '+message});

		client.send("/topic/.indrajeet", {}, message);
	};


function on_connect() {
	console.log(client);
	divBox.innerHTML += '<br/> Connected <br/>';
	client.subscribe("/topic/.indrajeet",on_message);
	sendMessage();
}

function on_connection_error() {
	divBox.innerHTML += '<br/> Connection Failed <br/>';
	console.log('Connection Failed');
}

function on_message(m) {
	//console.log(m);
	divBox.innerHTML += '<br/> Message : ' + m.body + '<br/>';
}

var ws = new SockJS(url);
var client = Stomp.over(ws);
client.heartbeat.outgoing = 0;
client.heartbeat.incoming = 0;

window.onload = function () {
  // Connect
  client.connect(
    username,
    password,
    on_connect,
    on_connection_error,
    vhost
  );
}

$('.test-btn').click(function(e){
	e.preventDefault();
		console.log('Btn');
});

$('.test-link').click(function(e){
	if(e.isDefaultPrevented()){
		e.defaultPrevented();
	}
	else{
		e.preventDefault();
	}
	
	console.log('Link');
});