var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs'),url = require('url');
var clients = {}, clientData = {}, connectionIDCounter = 0;

var server = http.createServer(function(request, response) {

    var filePath = url.parse(request.url).pathname;
    console.log((new Date()) + ' Received request for ' + request.url+' Path Name : '+filePath);

    if(request.url.indexOf('.html') != -1)
    {
        //req.url has the pathname, check if it conatins '.html'
        fs.readFile(__dirname + filePath, function (err, data) {
            if (err) console.log(err);
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(data);
            response.end();
        });
    }

    if(request.url.indexOf('.js') != -1)
    {
        //req.url has the pathname, check if it conatins '.js'
        fs.readFile(__dirname + filePath, function (err, data) {
            if (err) console.log(err);
            response.writeHead(200, {'Content-Type': 'text/javascript'});
            response.write(data);
            response.end();
        });
    }

    if(request.url.indexOf('.css') != -1)
    {
        //req.url has the pathname, check if it conatins '.css'
        fs.readFile(__dirname + filePath, function (err, data) {
            if (err) console.log(err);
            response.writeHead(200, {'Content-Type': 'text/css'});
            response.write(data);
            response.end();
        });
    }
});

server.listen(443, function() {
    console.log((new Date()) + ' Server is listening on port 3030');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin)
{
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function(request) {

    if (!originIsAllowed(request.origin))
    {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    // in your case you would rewrite these 2 lines as
    connection.id = connectionIDCounter ++;
    clients[connection.id] = connection;
    console.log((new Date()) + ' Connection from origin '+request.origin+ ', Connection accepted.'+connection.id);

    connection.on('message', function(message) {
        if (message.type === 'utf8')
        {
			if(message.utf8Data!=undefined)
			{
					if(message.utf8Data.indexOf("LoginData")!=-1)
					{
						for(var i in clients)
		 				{
							if(clients[i].id == connection.id)
							{
								console.log(message.utf8Data);
								console.log("Creating New Connections  :"  + message.utf8Data.split(':')[1]);

								clients[message.utf8Data.split(':')[1]] 	= connection;
								clientData[connection.id] 					= message.utf8Data.split(':')[1];
							}
						}
					}
					else
					{
						var clientConn = null;
            			//console.log((new Date()) + 'Received Message: ' + message.utf8Data + " message: "+message);
	            		var lines = message.utf8Data.split('\n');

						var keyWord = "";
						if(message.utf8Data.indexOf("INVITE sip:") != -1 )
						{
							keyWord = "t: ";
							console.log("INVITE :" + keyWord + message.utf8Data);
						}
						else if(message.utf8Data.indexOf("ACK sip:") != -1 )
						{
							keyWord = "t: ";
							console.log("ACK :" + keyWord + message.utf8Data);
						}
						else if(message.utf8Data.indexOf("BYE sip:") != -1 )
						{
							keyWord = "t: ";
							console.log("ACK :" + keyWord + message.utf8Data);
						}
						else if(message.utf8Data.indexOf("MESSAGE tel:") != -1)
						{
							keyWord = "t: ";
							console.log("ACK :" + keyWord + message.utf8Data);
						}
						else
						{
							keyWord = "f: ";
							console.log("keyWord :" + keyWord + message.utf8Data);
						}

						//console.log("KEYWORD   :" + keyWord);

						for(var i = 0;i < lines.length; i++)
						{
							if(lines[i]!=undefined)
							{
								//console.log("Lines :" + lines[i]);
								var index = lines[i].indexOf(keyWord);
								console.log("Index :" + index);
								if(index!=-1)
								{
									var to = lines[i].split(">")[0].split("+")[1];
									console.log(to);
									clientConn = clients[to];
									if(clientConn==undefined)
									{
										console.log("Client Connection Undefined");
										clientConn = null;
									}
									break;
								}
							}
						}
						if(clientConn == null)
						    return;
						clientConn.sendUTF(message.utf8Data);
					}
				}
   			}

        /*else if (message.type === 'binary')
        {
            console.log((new Date()) + ' Received Binary Message of ' + message.binaryData.length + ' bytes');
            var clientConn = returnConnectionObject(1);
            if(clientConn == null)
                return;
            clientConn.sendBytes(message.binaryData);
        }*/

    });

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + " close: client id "+connection.id);
    	var clientConn = returnConnectionObject(connection.id,true);
        if(clientConn == null)
            return;
        console.log((new Date()) + ' Peer ' + clientConn.remoteAddress + ' disconnected. reasonCode: '+reasonCode+' description: '+description);
    });
});

function returnConnectionObject(clientId,isClose)
{
	var clientConn = null;

	if(isClose!=undefined && isClose==true)
	{
			var logindata = clientData[clientId];

			console.log("Login data during close:  " + logindata);
			delete clientData[clientId];
			console.log("Login data during close1 :  " + clients[logindata]);
			delete clients[logindata];
			for(var i in clients)
			{
				if(clients[i].id == clientId)
				{
					delete clients[i].id;
				}
			}
	}
	else{
    for(var i in clients) {
        console.log((new Date()) + " returnConnectionObject(): client id "+clients[i].id);
        if(clients[i].id == clientId)
	  {
            console.log((new Date()) + " returnConnectionObject(): Matched client id "+clients[i].id);
			if(i==0)
			{
				clientConn = clients[1];
			}
			else if(i==1)
			{
				clientConn = clients[0];
			}
        }
    }
	}
    return clientConn;
}