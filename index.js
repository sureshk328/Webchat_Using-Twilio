function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  document.getElementById('time').innerHTML =
  h + ":" + m + ":" + s;
  var t = setTimeout(startTime, 500);
}
function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

function startClockCounter(){
  var minutesLabel = document.getElementById("minutes");
var secondsLabel = document.getElementById("seconds");
var totalSeconds = 0;
setInterval(setTime, 1000);

function setTime() {
  ++totalSeconds;
  secondsLabel.innerHTML = pad(totalSeconds % 60);
  minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}
}

$(function() {
  // Get handle to the chat div
  var $chatWindow = $('#messages');

  // Our interface to the Chat service
  var chatClient;

  // A handle to the "general" chat channel - the one and only channel we
  // will have in this sample app
  var generalChannel;

  // The server will assign the client a random username - store that value
  // here
  var username;
  const params = new URLSearchParams(window.location.search);
  username= params.get('identity');
  

  // Helper function to print info messages to the chat window
  function print(infoMessage, asHtml) {
    var $msg = $('<div class="info">');
    if (asHtml) {
      $msg.html(infoMessage);
    } else {
      $msg.text(infoMessage);
    }
    $chatWindow.append($msg);
  }

  // Helper function to print chat message to the chat window
  function getTime(){
    const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
    var $today = new Date();
    var $h = $today.getHours();
    var $m = $today.getMinutes();
    var $s = $today.getSeconds();
    var $date=$today.getDate()+"-"+ monthNames[$today.getMonth()]+"-"+$today.getFullYear();
    $m = checkTime($m);
    $s = checkTime($s);
    var $time =$date+" "+ $h + ":" + $m + ":" + $s;
    return $time;
  }
  function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
  }

  function printMessage(fromUser, message) {
    var $user = $('<span class="username">').text(fromUser + ':');
    if (fromUser === username) {
      $user.addClass('me');
      var $message = $('<span class="message">').text(message);
      var $container = $('<div class="message-container-user">');
      var time_stamp = getTime();
      var $time_stamp = $('<span class="time-stamp">').text(time_stamp);
      $container.append($user).append($message).append($time_stamp);
    }

    else {
      var $message = $('<span class="message">').text(message);
      var $container = $('<div class="message-container">');
      var time_stamp = getTime();
      var $time_stamp = $('<span class="time-stamp">').text(time_stamp);
      $container.append($user).append($message).append($time_stamp);
    }
    
    $chatWindow.append($container);
    $chatWindow.scrollTop($chatWindow[0].scrollHeight);
  }

  // Alert the user they have been assigned a random username
  var start_time = getTime();
  print('Logging in...('+start_time+')');
  
  console.log('1 '+username);
  createCookie("identity", username, "10"); 
  // Get an access token for the current user
  $.getJSON('tokenSession.php', function(data) {

    // Initialize the Chat client
    Twilio.Chat.Client.create(data.token).then(client => {
      console.log('Created chat client');
      chatClient = client;
      chatClient.getSubscribedChannels().then(createOrJoinGeneralChannel);
      
      // when the access token is about to expire, refresh it
      chatClient.on('tokenAboutToExpire', function() {
        refreshToken(username);
      });

      // if the access token already expired, refresh it
      chatClient.on('tokenExpired', function() {
        refreshToken(username);
      });

    // Alert the user they have been assigned a random username
    
    username= data.identity;
    

    }).catch(error => {
      console.error(error);
      print('There was an error creating the chat client:<br/>' + error, true);
      print('Please check your .env file.', false);
    });
  });

  function refreshToken(identity) {
    console.log('Token about to expire');
    // Make a secure request to your backend to retrieve a refreshed access token.
    // Use an authentication mechanism to prevent token exposure to 3rd parties.
    $.getJSON('tokenSession.php', {identity, identity}, function(data) {
      console.log('updated token for chat client');          
      chatClient.updateToken(data.token);
    });
  }

  function createOrJoinGeneralChannel() {
    // Get the general chat channel, which is where all the messages are
    // sent in this simple application
    const params = new URLSearchParams(window.location.search);
    var channel= params.get('channelName');
    console.log(channel);
    document.getElementById('channelName').innerHTML="You are now connected to channel: "+ channel;
    chatClient.getChannelByUniqueName(channel)
    .then(function(channel) {
      generalChannel = channel;
      console.log('Found general channel:');
      console.log(generalChannel);
      setupChannel();
    }).catch(function() {
      // If it doesn't exist, let's create it
      console.log('Creating general channel');
      chatClient.createChannel({
        uniqueName: channel,
        friendlyName: 'General Chat Channel'
      }).then(function(channel) {
        console.log('Created general channel:');
        console.log(channel);
        generalChannel = channel;
        setupChannel();
      }).catch(function(channel) {
        console.log('Channel could not be created:');
        console.log(channel);
      });
    });
  }

  // Set up channel after it has been found
  function setupChannel() {
    // Join the general channel
    print('Joined channel as '
      + '<span style="font-weight:bold; ">' + username + '</span>('+getTime()+')', true);
      generalChannel.join().then(function(channel) {
        print('Joined channel as '
        + '<span style="font-weight:bold;" class="me">' + username + '</span>', true);
      });

    // Listen for new messages sent to the channel
    generalChannel.on('messageAdded', function(message) {
      console.log("hi");
      printMessage(message.author, message.body);
    });
  }

  // Function to create the cookie 
function createCookie(name, value, days) { 
  var expires; 
    
  if (days) { 
      var date = new Date(); 
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); 
      expires = "; expires=" + date.toGMTString(); 
  } 
  else { 
      expires = ""; 
  } 
    
  document.cookie = escape(name) + "=" +  
      escape(value) + expires + "; path=/"; 
}

  // Send a new message to the general channel
  var $input = $('#chat-input');
  $input.on('keydown', function(e) {

    if (e.keyCode == 13) {
      if (generalChannel === undefined) {
        print('The Chat Service is not configured. Please check your .env file.', false);
        return;
      }
      generalChannel.sendMessage($input.val())
      $input.val('');
    }
  });
});

