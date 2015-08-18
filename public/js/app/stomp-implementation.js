// Use SockJS
Stomp.WebSocketClass = SockJS;
var token =  $rootScope._userInfo.Token;
/*
  var username = "sripad",
  password = "123456",*/
  var username = $rootScope._userInfo.ezeone,
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
	//subscribe to all the groups
	getGroupApiCall().then(function(data){
		if(!data)
			return;

		//subscribe to all the groups of this logged in user
		data.forEach(function(val){
			var groupId = val.GroupID;
			subscribeToTopic(groupId);
		});
	},
	function(){
		//Error occured
	});

}

/**
 * Subscribe to a particular group
 * @param id
 */
function subscribeToTopic(id)
{
	client.subscribe("/topic/."+id,on_message);
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


/**
 * Call group ApI calls for getting all the groups of the logged in user
 */
function getGroupApiCall()
{
	$scope.$emit('$preLoaderStart');
	var defer = $q.defer();
	$http({
		url : GURL + 'group_list',
		method : "GET",
		params :{
			token : $rootScope._userInfo.Token
		}
	}).success(function(resp){
		$scope.$emit('$preLoaderStop');
		if(!resp.status)
		{
			defer.reject();
			return defer.promise;
		}
		defer.resolve(resp.data);
	}).error(function(err){
		$scope.$emit('$preLoaderStop');
		Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
		defer.reject();
	});

	return defer.promise;
}
