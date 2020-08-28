document.getElementById('btnDispReq').addEventListener
('click', loadText);

function loadText(){
    fetch("data.txt")
    .then (function(response){
        //alert(response.text());
        return response.text();
    })
    .then(function(data){
        var getUrl = window.location;
        var baseUrl = getUrl .protocol + "//" + getUrl.host + "/"
        var requests=data.split(/[\n]+/);
        for (i = 0; i < requests.length; i++) {
            var user=requests[i].split(',')[0];
            var channel=requests[i].split(',')[1];
            var div = document.createElement("div");   // Create a <button> element
            div.innerHTML ="<a href='"+baseUrl+"/chat.html?channelName="+channel+"&identity="+user+"'>Chat With "+ user+"</a>"; 
                          
            document.body.appendChild(div); 

        }
        document.getElementById('requestList').innerHTML=data;
    }

    )
}