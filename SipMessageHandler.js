// SIP STACK

var DIALOG_KEY =
{
    SUBSCRIBE_PRES: "PRES",
    SUBSCRIBE_XDM:  "XDM",
    INVITE_SESSION: "INVITE"
};

var FLOOR_STATUS =
{
    GRANTED: 1,
    TAKEN: 2,
    IDLE: 3
};

var CALL_STATUS =
{
    IDLE: 1,
    CALLING: 2,
    CONNECTED: 3
};

var pc;
var socket;
var sipHandler;

var SipMessageHandler = function SipMessageHandler(callbackHandler)
{
	this.socket    		= null;
	this.pc        		= null;
	this.incomingpc		= null;
	this.host      		= true;
	this.reflexive 		= true;
	this.relay     		= false;
	this._sipMessage	= null;
    this.callback       = callbackHandler;
    this.callBackHandler = null;
    this.isInitialNotify = false;
    this.numberOfCandidates = 0;

    sipHandler = this;
    /*this.timer = new Worker('timerWorker.js');
    this.timer.onmessage = function(e)
    {
       //sipHandler.publishSettings();
    }*/

	//Automation setup.
	//this.telMDN    	= "tel:+919400121112";
	  this.telMDN    	= "tel:+919955002001";

	  this.calleeMDN	= "tel:+919955008002";
	//this.calleeMDN	= "tel:+919991002003";

	this.sdp       		    = "";
	this.stack     		    = null;
	this.inviteUserAgent 	= null;
	this.dtmfSender 	    = null;
	//this.pcConstraint 	= {optional: [{RtpDataChannels: true}]};
	this.pcConstraint       = null;
	this._invite		    = null;
	this._ipRtcpAddress	    = null;
	this._ipRtcpPort	    = null;
	this.localIpAddress	    = "172.27.13.189";
	this.rtcpDetails	    = {};
	this.pocServer		    = true;
	this.configuration	    = "";
	this.mdn				= "";
    this.loginStatus        = "IDLE";
	this.floorStatus	    = FLOOR_STATUS.IDLE;
	this.callStatus		    = CALL_STATUS.IDLE;
	this.secondCall		    = false;
	this.numberCandidates 	= 1;
};

SipMessageHandler.prototype.setFromMDN = function (mdn)
{
    if( mdn != undefined )
    {
        this.telMDN = "tel:+" + mdn;
        this.mdn = mdn;
    }
};

SipMessageHandler.prototype.stopAllRefresh = function ()
{
};

SipMessageHandler.prototype.stopClient = function ()
{
};

SipMessageHandler.prototype.closeAllSockets = function ()
{
};

function iceCollection(evt)
{
	console.log("iceCollection");
}


SipMessageHandler.prototype.startMediaChannel = function (configuration)
{
    var self = this;
    this.configuration = configuration;

    this.pc = new webkitRTCPeerConnection(null, self.pcConstraint);

    pc = this.pc;

    this.pc.onicecandidate = function (evt)
    {
	console.log("RTCIceGatheringState :" 	+ self.pc.iceGatheringState);
	console.log("IceConnectionState : " 	+ self.pc.iceConnectionState);

	var ice = evt.candidate;

	if(!ice)
	{
		//console.log("Final-Candidate  :" + JSON.stringify(evt.candidate));
		console.log("Final-Local-Description  :" + JSON.stringify(self.pc.localDescription));

		self.sdp = self.pc.localDescription.sdp;

		if(self.pc.remoteDescription != null)
		{
			if(self.pc.remoteDescription.type == "offer")
			{
				self.respondToInvite();
			}
			else
			{
			        self.sendInvite(this.callJson);
			}
		}
		else
		{
				self.sendInvite();
		}

		return;
	}



	console.log("candidate  :" + JSON.stringify(evt.candidate));

	if(self.host && ice.candidate.indexOf('typ host') != -1)
	{
		console.log("Host Candidate  :" + JSON.stringify(evt.candidate));
		return;
	}

	if(self.reflexive && ice.candidate.indexOf('srflx') != -1)
	{
		console.log("Server Reflexive Candidate :" + JSON.stringify(evt.candidate));
		return;
	}

	if(self.relay && ice.candidate.indexOf('relay') == -1) return;

	if (evt.candidate)
	{
		self.numberOfCandidates++;
		console.log("Relay Candidate  :" + JSON.stringify(evt.candidate));
	}

	//Work around to handle sub second call.
	if(self.numberOfCandidates>=self.numberCandidates)
	{
		self.numberOfCandidates=0;
		//newly added to make sure call setup time reduces.
		//if(self.pc.iceGatheringState=="complete")
		{
			self.sdp = self.pc.localDescription.sdp;
			if(self.pc.remoteDescription != null)
			{
				if(self.pc.remoteDescription.type == "offer")
				{
					self.respondToInvite();
				}
                else
                {
                    self.sendInvite(this.callJson);
                }
			}
			else
			{
					self.sendInvite(this.callJson);
			}
			return;
		}
	}
    };

    // let the "negotiationneeded" event trigger offer generation
    /*pc.onnegotiationneeded = function () {
	console.log("On Negotiation Needed");
	pc.createOffer(localDescCreated, logError);
    }*/

    //once remote stream arrives, show it in the remote video element.
    this.pc.onaddstream = function (evt) {
	remoteView.src = URL.createObjectURL(evt.stream);
    };
}

function onToneChange(evt)
{
	    console.log(evt.tone);
    	if (evt.tone == "1")
    	{
    	     console.log("Remote User released Floor...");
    	}
    	else if(evt.tone == "2")
    	{
    	     console.log("Remote User acquired Floor...");
    	}
}



SipMessageHandler.prototype.makeCall = function (callJson)
{
	if(this.pc.signalingState=="closed")
	{
		console.log("INFO: WEBRTC ENGINE IS IN CLOSED STATE......");

        this.calleeMDN = "tel:+" + callJson["phoneNumber"];
		this.secondCall = true;
		this.startMediaChannel(this.configuration);
		this.initMediaSource();
	}
	else
	{
        this.calleeMDN = "tel:+" + callJson["phoneNumber"];
		this.pc.createOffer(this.localDescCreated1, function(error) {console.log("Error");});
	}
}

SipMessageHandler.prototype.getPC = function ()
{

}

SipMessageHandler.prototype.localDescCreated1 = function(desc)
{
	var self = this;

	//Altering the sdp to remove RTP & RTCP Multiplexing.
	var sdpAttr = desc.sdp;
	//sdpAttr     = sdpAttr.replace('a=group:BUNDLE audio\r\n','');
	//sdpAttr     = sdpAttr.replace('a=rtcp-mux\r\n','');
	desc["sdp"] = sdpAttr;

	pc.setLocalDescription(desc, function ()
	{
	     console.log("INFO: SETTING LOCAL DESCRIPTION SUCCESSFULL:" + JSON.stringify(pc.localDescription));
	}, function(error) {console.log(error);});
}

SipMessageHandler.prototype.initMediaSource = function ()
{
    var self = this;
    // get a local stream, show it in a self-view and add it to be sent
    navigator.webkitGetUserMedia({ "audio": true, "video": false }, function (stream)
    {
		//selfView.src = URL.createObjectURL(stream);

		console.log("INFO: ADDED STREAM SUCCESSFULLY");
		self.pc.addStream(stream);


		if(self.secondCall == true)
		{
			self.secondCall = false;
			console.log("INFO: SECOND CALL STATE MACHINE");

			if(self.pc.remoteDescription!=null)
			{
				if (self.pc.remoteDescription.type == "offer")
				{
					console.log("INFO: STATE MACHINE FOR SECOND INCOMING CALL...");
					self.pc.createAnswer(self.localDescCreated1, function(error) {console.log(error);});
				}
                else
                {
                    console.log("INFO: STATE MACHINE FOR SECOND OUTGOING CALL REMOTE NOT DEFINED");
				    self.pc.createOffer(self.localDescCreated1, function(error) { console.log("Error"); });
                }
			}
			else
			{
				console.log("INFO: STATE MACHINE FOR SECOND OUTGOING CALL....");
				self.pc.createOffer(self.localDescCreated1, function(error) { console.log("Error"); });
			}
		}
    }, function(error) {console.log("Error");});
}


SipMessageHandler.prototype.initSigTransport = function (url)
{
       var self 		= this;
       this.socket 		= new WebSocket(url , "echo-protocol");
       socket = this.socket;
       this.socket.url 		= url;
       this.socket.binaryType 	= "arraybuffer";

        this.socket.addEventListener("open", function(event)
        {
         	console.log("INFO: WEBSOCKET CONNECTED SUCCESSFULLY...");
            var timerCommand = {command: 'start', config: "data"};
            self.sendSipDataToServer("LoginData:"+self.mdn);
            //self.sendSipDataToServer(loginData);
            //self.timer.postMessage(timerCommand);
        	self.sendRegister();
        });

        // Display messages received from the server
        this.socket.addEventListener("message", function(event)
        {
		console.log("INFO: INCOMING DATA:   " + event.data.byteLength +  "   " + event.data.toString());

		if(event.data instanceof ArrayBuffer)
		{
			console.log("INFO: RECEIVED RTCP DATA.....");

			var binaryData = new Uint8Array(event.data);

			var rc = new KnMbcpPacket();
			rc.decode(binaryData);
			console.log(rc._jsonPkt.SubType);

			if(rc.type==4)
			{
				console.log("INFO: FLOOR RELEASED");
			}
			else if(rc.type==5)
			{
				console.log("INFO:  FLOOR IDLE");
				self.handleIdleFloor();
			}
			else if(rc.type==1)
			{
				console.log("INFO: FLOOR GRANTED");
				self.handleGrantedFloor();
			}
			else if(rc.type==2)
			{
				console.log("INFO: FLOOR TAKEN");
				self.handleTakenFloor(rc);
			}
			else if(rc.type==0)
			{
				console.log("INFO: FLOOR REQUEST");
			}
			else if(rc.type==15)
			{
				console.log("INFO: TBCP CONNECT");
				self.acceptCall();
			}
			else if(rc.type==11)
			{
				console.log("INFO: TBCP DISCONNECTED");

				this.floorStatus = FLOOR_STATUS.IDLE;
				this.callStatus  = CALL_STATUS.IDLE;

				//document.getElementById('PoC').src = "./images/idle.png";
				self.pc.getLocalStreams()[0].getAudioTracks()[0].enabled = false;
			}
			else if(rc.type==3)
			{
				console.log("INFO: FLOOR DENIED");
			}
		}
		else
		{
			self.receivedSipData(event.data);
		}
        });

        // Display any errors that occur
    	this.socket.addEventListener("error", function(event) {
    		    console.log("INFO: ERROR IN WEBSOCKET CONNECTION"  + JSON.stringify(event));
            	message.textContent = "Error: " + event;
                var timerCommand = {command: 'stop', config: "data"};
                //self.timer.postMessage(timerCommand);
        });

    	this.socket.addEventListener("close", function(event) {
                console.log("INFO: WEBSOCKET CONNECTION CLOSED");
            	//open.disabled = false;
            	status.textContent = "Not Connected";
                var timerCommand = {command: 'stop', config: "data"};
                //self.timer.postMessage(timerCommand);
        });
};

SipMessageHandler.prototype.handleIdleFloor = function ()
{
	var self = this;
	self.floorStatus = FLOOR_STATUS.IDLE;
	self.pc.getLocalStreams()[0].getAudioTracks()[0].enabled = false;
	//document.getElementById('PoC').src = "./images/idle.png";
    var callStatus = { "TYPE": "FLOORSTATUS", "callStatus" : CALLSTATUS.FLOOR_CHANGED, "floorStatus" : FLOORSTATUS.IDLE };
    self.callBackHandler(callStatus,this.callback);
};

SipMessageHandler.prototype.handleTakenFloor = function (rc)
{
	var self = this;
	self.floorStatus = FLOOR_STATUS.TAKEN;

	if(self.pc.getLocalStreams()[0]!=undefined)
	{
		self.pc.getLocalStreams()[0].getAudioTracks()[0].enabled = false;
	}
	else
	{
		console.log("INFO: STREAM NOT YET CONNECTED...");
	}

    var callStatus = { "TYPE": "FLOORSTATUS", "callStatus" : CALLSTATUS.FLOOR_CHANGED, "floorStatus" : FLOORSTATUS.TAKEN };

    console.log(JSON.stringify(rc));

    var talker = rc._jsonPkt.userName.replace("+","");

    var talkerInfo = { "TYPE": "TALKERINFO", "name" : rc._jsonPkt.nickName, "mdn" : talker };
    self.callBackHandler(talkerInfo,this.callback);
    self.callBackHandler(callStatus,this.callback);
};

SipMessageHandler.prototype.handleGrantedFloor = function ()
{
	var self = this;
	self.floorStatus = FLOOR_STATUS.GRANTED;
	self.pc.getLocalStreams()[0].getAudioTracks()[0].enabled = true;

    var talker = this.telMDN.replace("tel:+","");
    var talkerInfo = { "TYPE": "TALKERINFO", "name" : "You", "mdn" : talker };
    self.callBackHandler(talkerInfo,this.callback);

    var callStatus = { "TYPE": "FLOORSTATUS", "callStatus" : CALLSTATUS.FLOOR_CHANGED, "floorStatus" : FLOORSTATUS.GRANTED };
    self.callBackHandler(callStatus,this.callback);


	//document.getElementById('PoC').src = "./images/talk.png";
};

SipMessageHandler.prototype.initMediaTransport = function ()
{

};

SipMessageHandler.prototype.startClient = function ()
{
    //creating Sip stack and transport.

    this._listen_port 	= 5060;
    this._rtcpPort 	= 6080;
    this._rtpPort 	= 6081;

    var transport = new sip.TransportInfo("172.168.27.31", this._listen_port, "TCP", false, true, false);
    var app = new sip.App(this);

    this.stack = new sip.Stack(app, transport);

    //Create a WebSocket.
    //this.initSigTransport();

};


SipMessageHandler.prototype.restartClient = function ()
{
};

SipMessageHandler.prototype.sendRegister = function ()
{
    /*var self 		 = this;
	this._reg 		 = new sip.UserAgent(this.stack);
	this._reg.localParty 	 = new sip.Address(this.telMDN);
	this._reg.remoteParty 	 = new sip.Address(this.telMDN);

	this.primary_proxy_route = 'sip:'.concat(this.localIpAddress).concat(';lr');
	this._reg.remoteTarget 	 = new sip.URI(this.primary_proxy_route);

	var register = this._reg.createRequest("REGISTER");

	var sessionExpire = "3600";
	register.setItem('Kpoc', new sip.Header('1;type=p;apn=IMS', 'Kpoc'));
	register.setItem('User-Agent', new sip.Header("PoC-client/OMA2.0 samsung/GT-I9100M Android/2.3.3 knpoc-07_004_02_01I/6.0 07_004.02.01I", 'User-Agent'));
	register.setItem('Expires', new sip.Header(sessionExpire, 'Expires'));
	register.setItem('accept-contact', new sip.Header('*;+g.poc.talkburst', 'accept-contact'));
	register.setItem('allow', new sip.Header('INVITE, ACK, CANCEL, BYE, REFER,MESSAGE,SUBSCRIBE,NOTIFY,PUBLISH', 'allow'));
	register.setItem('P-Access-Network-Info', new sip.Header('3GPP-UTRAN-FDD;utran-cell-id-3gpp=4044584E51920459', 'P-Access-Network-Info'));
	register.setItem('require', new sip.Header('pref', 'require'));

	//For Incoming Call.
	var contactHeader = 'sip:'.concat("192.168.30.216").concat(":30000").concat(';+g.poc.talkburst');
	register.setItem('Contact', new sip.Header(contactHeader, 'Contact'));

	this._reg.sendRequest(register);*/

	var loginCallBack = {"TYPE":"LOGIN","status":2};
    this.callBackHandler(loginCallBack,this.callback);

	register = null;
};


SipMessageHandler.prototype.publishSettings = function () {

    var self = this;
    var sessionExpire = "3600";
    var contactHeader = 'sip:'.concat(this.localIpAddress).concat(":5060").concat(';+g.poc.talkburst');
    var xmlBody = this.getCallXml();

    {
        this._sipPublish = new sip.UserAgent(self.stack);
        this._sipPublish.localParty = new sip.Address(self.telMDN);
        this._sipPublish.remoteParty = new sip.Address(self.telMDN);
        this._sipPublish.remoteTarget = new sip.Address(self.telMDN);
    }

    var publish = this._sipPublish.createRequest("PUBLISH", xmlBody);

    publish.setItem('Route', 	      new sip.Header(contactHeader, 'Route'));
    publish.setItem('Contact', 	      new sip.Header(contactHeader, 'Contact'));
    publish.setItem('Expires', 	      new sip.Header(sessionExpire, 'Expires'));
    publish.setItem('accept-contact', new sip.Header('*;+g.poc.talkburst;require;explicit', 'accept-contact'));
    publish.setItem('Content-Type',   new sip.Header("application/poc-settings+xml", 'Content-Type'));
    publish.setItem('Event',   	      new sip.Header("poc-settings", 'Event'));
    publish.setItem('User-Agent',     new sip.Header("PoC-client/OMA2.0 samsung/GT-I9100M Android/2.3.3 knpoc-07_004_02_01I/6.0 07_004.02.01I", 'User-Agent'));

    this._sipPublish.sendRequest(publish);
};

SipMessageHandler.prototype.getCallXml = function () {
    var l_strRequestXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><poc-settings xmlns=\"urn:oma:params:xml:ns:poc:poc-settings\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:oma:params:xml:ns:poc:poc-settings\"><entity id=\"do39s8zksn2d98x\"><isb-settings><incoming-session-barring active=\"false\"/></isb-settings><am-settings><answer-mode>automatic</answer-mode></am-settings><ipab-settings><incoming-personal-alert-barring active=\"false\"/></ipab-settings></entity></poc-settings>";
    return l_strRequestXML;
};


SipMessageHandler.prototype.unRegister = function ()
{
    var self = this;
};


SipMessageHandler.prototype.sendIPA = function (IPAJson)
{
    this.calleeMDN = "tel:+" + IPAJson["phoneNumber"];

    var contactHeader = 'sip:'.concat("172.168.27.31").concat(":5060");
    var uriTo = this.calleeMDN;

    if ( this._sipMessage == null )
    {
        this._sipMessage 		= new sip.UserAgent(this.stack);
        this._sipMessage.localParty 	= new sip.Address(this.telMDN);
    }

    this._sipMessage.remoteParty 	= new sip.Address(uriTo);
    this._sipMessage.remoteTarget 	= new sip.URI(uriTo);
    var ipaMessage 			= this._sipMessage.createRequest("MESSAGE");

    ipaMessage.setItem('Route',   		    new sip.Header("<sip:".concat("webrtc.koditgvzwnet.com").concat(";lr>"), 'Route'));
    ipaMessage.setItem('contact', 		    new sip.Header(contactHeader, 'contact'));
    ipaMessage.setItem('accept-contact',    new sip.Header('*;+g.poc.talkburst;require;explicit', 'accept-contact'));
    ipaMessage.setItem('Content-Type', 		new sip.Header("text/plain", 'Content-Type'));
    ipaMessage.setItem('KPoc', 			    new sip.Header("0;pv=6.0", 'KPoc'));
    ipaMessage.setItem('WebRTC-Client',		new sip.Header('WebRTC-Client', 'WebRTC-Client'));

    this._sipMessage.sendRequest(ipaMessage);

    ipaMessage =  uriTo = null;
};

SipMessageHandler.prototype.sendPresSubscribe = function ()
{
    var contactHeader = 'sip:'.concat().concat("172.168.27.31").concat(":5060").concat(';+g.poc.talkburst');

    var toHeader = '<'.concat(this.telMDN).concat(';rls-list=oma_pocbuddylist').concat('>');

    var ua 		= new sip.UserAgent(this.stack);
    ua.localParty 	= new sip.Address(this.telMDN);
    ua.remoteParty 	= new sip.Address(toHeader);
    ua.remoteTarget 	= new sip.URI(this.telMDN.concat(';rls-list=oma_pocbuddylist'));

    var subscribe = ua.createRequest("SUBSCRIBE");

    subscribe.setItem('Contact', new sip.Header(contactHeader, 'contact'));
    subscribe.setItem('Route', new sip.Header("<sip:".concat("webrtc.koditgvzwnet.com").concat(";lr>"),'Route'));

    var setExpire = "3600";
    subscribe.setItem('Expires', new sip.Header(setExpire, 'Expires'));
    subscribe.setItem('KPoc', new sip.Header("51;pv=6.0", 'KPoc'));
    subscribe.setItem('Event', new sip.Header('presence', 'Event'));
    subscribe.setItem('Accept', new sip.Header('application/kn-pidf+xml', 'Accept'));
    subscribe.setItem('Allow-Events', new sip.Header('presence, kn-xcap-diff, message-summary, refer', 'Allow-Events'));
    subscribe.setItem('Content-Type', new sip.Header('application/resource-lists+xml', 'Content-Type'));
    subscribe.setItem('Supported', new sip.Header("eventlist", 'Supported'));
    subscribe.setItem('WebRTC-Client',		new sip.Header('WebRTC-Client', 'WebRTC-Client'));

    ua.sendRequest(subscribe);
    subscribe = null;
};


SipMessageHandler.prototype.sendInvite = function (callJson)
{
    var self = this;

    if(self.callStatus==CALL_STATUS.IDLE)
    {
	    var sessionExpire = "3600";
	    var contentXML = self.pc.localDescription.sdp;

	    /*contentXML = contentXML.replace(/^.*host generation 0.*$\r\n/mg, '');
	    contentXML = contentXML.replace(/^.*active generation 0.*$\r\n/mg, '');
	    contentXML = contentXML.replace(/^.*typ srflx raddr.*$\r\n/mg, '');*/

	    //Changes to support SipAdapter.
	    if(self.pocServer==true)
	    {
		    //contentXML = contentXML.replace('RTP/SAVPF', 'RTP/AVP');
		    //contentXML = this.insert(contentXML, contentXML.indexOf("t=0 0"), "c=IN IP4 192.168.30.218\r\n");
		    //contentXML = this.insert(contentXML, contentXML.indexOf("t=0 0"), "c=IN IP4 192.168.31.39\r\n");
	    }

	    var contactHeader = 'sip:'.concat("172.168.27.31").concat(":5060").concat(';+g.poc.talkburst');

	    this._invite 		        = new sip.UserAgent(self.stack);
	    this._invite.localParty 	= new sip.Address(self.telMDN);
	    this._invite.remoteParty 	= new sip.Address(self.calleeMDN);
	    this._invite.remoteTarget 	= new sip.URI(self.calleeMDN);

	    var inviteMsg = this._invite.createRequest("INVITE", contentXML);

	    inviteMsg.setItem('contact', 		        new sip.Header(contactHeader, 'contact'));
	    inviteMsg.setItem('Route', 			        new sip.Header(contactHeader, 'Route'));
	    inviteMsg.setItem('P-Preferred-Identity', 	new sip.Header(self.telMDN, 'P-Preferred-Identity'));
	    inviteMsg.setItem('Expires', 		        new sip.Header(sessionExpire, 'Expires'));
	    inviteMsg.setItem('Allow', 			        new sip.Header("INVITE, ACK, CANCEL, BYE, REFER, MESSAGE, SUBSCRIBE, NOTIFY, PUBLISH", 'Allow'));
	    inviteMsg.setItem('Content-Type', 		    new sip.Header("application/sdp", 'Content-Type'));
	    inviteMsg.setItem('User-Agent',     	    new sip.Header("PoC-client/OMA2.0 samsung/GT-I9100M Android/2.3.3 knpoc-07_004_02_01I/6.0 07_004.02.01I", 'User-Agent'));
	    inviteMsg.setItem('accept-contact', 	    new sip.Header('*;+g.poc.talkburst;require;explicit', 'accept-contact'));
	    inviteMsg.setItem('X-KN-PoC-Flags', 	    new sip.Header('media-fqdn;media-transport=udp-only', 'X-KN-PoC-Flags'));

	    //Functionalities of F5.
	    inviteMsg.setItem('WebRTC-Client',		new sip.Header('WebRTC-Client', 'WebRTC-Client'));

	    self.callStatus = CALL_STATUS.CALLING;

	    this._invite.sendRequest(inviteMsg);

        var callStatus = { "TYPE": "CALLSTATUS", "callStatus" : CALLSTATUS.DIALING, "floorStatus" : FLOORSTATUS.IDLE };
        this.callBackHandler(callStatus,this.callback);
     }
     else
     {
     	    console.log("INFO: Call Already in Established State.");
     }
};

SipMessageHandler.prototype.insert = function(str, index, value)
{
    //console.log(str.substr(0, index) + " " + value + " " + str.substr(index));
    return str.substr(0, index) + value + str.substr(index);
};


SipMessageHandler.prototype.sendBye = function ()
{
    if (this.callStatus	== CALL_STATUS.CONNECTED)
    {
        var byeRequest = this._inviteDialog.createRequest('BYE');
	    byeRequest.setItem('WebRTC-Client', new sip.Header('WebRTC-Client', 'WebRTC-Client'));
	    this._Bye = new sip.UserAgent(this.stack);
        this._Bye.sendRequest(byeRequest);
    }
    else if(this.callStatus == CALL_STATUS.CALLING)
    {
        console.log("INFO: DIALLING STATE SO CANCELING THE REQUEST");
        this._invite.sendCancel();
        this.clearCallContext();
    }
    else
    {
    	console.log("INFO: CALL IS ALREADY IN DISCONNECTED STATE..");
    }
};

SipMessageHandler.prototype.sendCancel = function ()
{

};

SipMessageHandler.prototype.sendInfo = function (floorOperation)
{
    if (this._invite)
    {
        var m = this._inviteDialog.createRequest('INFO', floorOperation);
        m.setItem('Content-Type', new sip.Header("application/floor-control", 'Content-Type'));
	    this._info = new sip.UserAgent(this.stack);
        this._info.sendRequest(m);
    }
};


SipMessageHandler.prototype.resolve = function (host, type, callback, stack) {
            callback("115.114.48.61",["115.114.48.61"]);
};

// call back from SIP stack
SipMessageHandler.prototype.handler = function (command, ua, pResponse, stack) {
    var method = null;
    try
    {
        if (command == "response")
        {
        method = ua.request.method;
        if (method == 'REGISTER')
        {
        	console.log("INFO: REGISTER RESPONSE.");
        	this.publishSettings();
        }
        else if (method == 'INVITE')
        {
        	console.log("INFO: INVITE RESPONSE.");
        	this.handleInviteResponse(ua, pResponse, stack);
        }
        else if (method == 'PUBLISH')
        {
        	console.log("INFO: PUBLISH RESPONSE.");
            if(this.loginStatus=="IDLE")
            {
                this.loginStatus="SUCCESFULL";
                this.sendPresSubscribe();
            }
            /*var loginCallBack = {"TYPE":"LOGIN","status":2};
            this.callBackHandler(loginCallBack,this.callback);*/
        }
        else if (method == 'INFO')
        {
        	console.log("INFO: INFO RESPONSE");
        }
        else if (method == 'BYE')
        {
        	console.log("INFO: BYE RESPONSE");

        	console.log("INFO: CALL DISCONNECTED....");
		    this.clearCallContext();
        }
	    else if (method == "SUBSCRIBE")
        {
		    console.log("INFO: SUBSCRIBE RESPONSE");
        }
	    else if (method == "MESSAGE")
        {
		    console.log(pResponse);
		    console.log("INFO: IPA RESPONSE");
            this.handleIPAResponse(ua, pResponse);

        }
    }
    else if (command == "send")
    {
    	    var m = new sip.Message();
            m._parse(pResponse);

    	    if (m.method == "ACK")
    	    {
    	    	    this.callStatus = CALL_STATUS.CONNECTED;

    	    	    console.log("INFO: OUTGOING CALL SUCCESSFULL....");

    	    	    m.setItem('WebRTC-Client', new sip.Header('WebRTC-Client', 'WebRTC-Client'));

    	    	    this.sendSipDataToServer(m.toString(), stack);

                    var callStatus = { "TYPE": "CALLSTATUS", "callStatus" : CALLSTATUS.CONNECTED, "floorStatus" : FLOORSTATUS.IDLE };
                    this.callBackHandler(callStatus,this.callback);

                    //this.handleGrantedFloor();

    	    }
    	    else
    	    {
            	    this.sendSipDataToServer(pResponse, stack);
            }
    }
    else if (command == "request")
    {
    	    var method = pResponse.method;
            if (method == "INVITE")
            {
                console.log("INFO: HANDLE INCOMING CALL");
                this.numberCandidates = 1;

                if(this.pc.signalingState=="closed")
                {
                	console.log("INFO: WEBRTC IS IN CLOSED STATE.....");

                	this.secondCall = true;
                	this.startMediaChannel(this.configuration);
                	this.initMediaSource();
                }

                //Need to handle the incoming call.
                this.handleIncomingCall(ua, pResponse, stack);

            }
            else if (method == "ACK")
            {
            	this.callStatus  = CALL_STATUS.CONNECTED;
            	console.log("INFO: INCOMING CALL SUCCESSFULL");

                var callStatus = { "TYPE": "CALLSTATUS", "callStatus" : CALLSTATUS.CONNECTED, "floorStatus" : FLOORSTATUS.IDLE };
                this.callBackHandler(callStatus,this.callback);
            }
            else if (method == "INFO")
            {
            	console.log("INFO: MESSAGE....");
            	this.handleFloorControl(ua, pResponse, stack);
            }
            else if (method == "BYE")
            {
            	console.log("INFO: CALL DISCONNECTED....");
            	this.handleCallDisconnection(ua, pResponse, stack);
        	    this.clearCallContext();
            }
	    else if (method == "MESSAGE")
	    {
		        console.log("INFO: IPA MESSAGE RECEIVED....");
                this.handleIncomingIPA(ua, pResponse);
	    }
	    else if (method == "NOTIFY")
	    {
		        console.log("INFO: NOTIFY RECEIVED....");
		        this.receivedNotify(ua, pResponse);
        }
    }
    else if(command =="inDialogNotify")
    {
    	   console.log("INFO: IN DIALOG NOTIFY RECEIVED.....");
	   this.receivedNotify(ua, pResponse);
    }
    }
    catch(e)
    {
            console.log("ERROR: ERROR IN HANDLING THE MESSAGE");
            this.clearCallContext();
    }
    pResponse = null;
};

SipMessageHandler.prototype.handleIPAResponse = function (ua, pResponse) {
    if (pResponse.is2xx())
    {
            var callStatus = { "TYPE": "IPASTATUS", "status" : IPASTATUS.SUCCESS };
            this.callBackHandler(callStatus,this.callback);
    }
    else
    {
            var callStatus = { "TYPE": "IPASTATUS", "status" : IPASTATUS.FAILURE };
            this.callBackHandler(callStatus,this.callback);
    }
};

SipMessageHandler.prototype.handleIncomingIPA = function (ua, pRequest, stack) {
    var m = pRequest;
    var from = m.getItem("from").toString().split(">")[0].split("+")[1];

    var ipaCallBack = {"TYPE":"IPAALERT", "name":from, "mdn":from};
    this.callBackHandler(ipaCallBack,this.callback);

	var contactHeader 	= 'sip:'.concat("172.168.27.31").concat(':').concat(this._listen_port);
    messageResp 		= ua.createResponse(200, 'OK', null, null, pRequest);
	messageResp.setItem('Contact', new sip.Header(contactHeader, 'Contact'));
	messageResp.setItem('WebRTC-Client', new sip.Header('WebRTC-Client', 'WebRTC-Client'));
	ua.sendResponse(messageResp);
};

SipMessageHandler.prototype.receivedNotify = function (ua, pRequest, stack) {
    var contactHeader = 'sip:'.concat("172.168.27.31").concat(':').concat(this._listen_port);

    if(pRequest._body !== null)
    {
        status.Content=pRequest._body;
        var presenceJson = x2js.xml_str2json(pRequest._body);
	    console.log("PRESENCE NOTIFICATION  :" + JSON.stringify(presenceJson));
    }

    if (pRequest.getItem('Event') == 'presence')
    {
            if(this.isInitialNotify==false)
            {
                this.isInitialNotify = true;
                var loginCallBack = {"TYPE":"LOGIN","status":2};
                this.callBackHandler(loginCallBack,this.callback);
            }

            notifyResp = ua.createResponse(200, 'OK', null, null, pRequest);
            notifyResp.setItem('Contact', new sip.Header(contactHeader, 'Contact'));
            notifyResp.setItem('WebRTC-Client', new sip.Header('WebRTC-Client', 'WebRTC-Client'));
	        ua.sendResponse(notifyResp);

            var contAvailStatus = [];

            {
                if(presenceJson["presence"]!=undefined && presenceJson["presence"]["ps"]!=undefined)
                {
                    if(presenceJson["presence"]["ps"]["_r"]!=undefined)
                    {
                        var registerStatus = presenceJson["presence"]["ps"]["_r"];
                        var sessionStatus  = presenceJson["presence"]["ps"]["_s"];
                        var contactMDN     = presenceJson["presence"]["ps"]["_u"];

                        contactMDN = contactMDN.replace('tel:+','');
                        var availabilityStatus = "";

                        if(registerStatus=="o" && sessionStatus=="o")
                        {
                            availabilityStatus = CONTACTAVAILABILITYSTATUS.AVAILABLE;
                        }
                        else if(registerStatus=="o" && sessionStatus=="c")
                        {
                            availabilityStatus = CONTACTAVAILABILITYSTATUS.DND;
                        }
                        else if(registerStatus=="c")
                        {
                            availabilityStatus = CONTACTAVAILABILITYSTATUS.OFFLINE;
                        }
                        contAvailStatus[0] = {"TYPE":"CONTACTAVAILABILITYSTATUS","mdn": contactMDN, "availabilityStatus": availabilityStatus};
                    }
                    else
                    {
                        for(var nPresence=0; nPresence<presenceJson["presence"]["ps"].length; nPresence++)
                        {
                            var registerStatus = presenceJson["presence"]["ps"][nPresence]["_r"];
                            var sessionStatus  = presenceJson["presence"]["ps"][nPresence]["_s"];
                            var contactMDN     = presenceJson["presence"]["ps"][nPresence]["_u"];

                            contactMDN = contactMDN.replace('tel:+','');
                            var availabilityStatus = "";

                            if(registerStatus=="o" && sessionStatus=="o")
                            {
                                availabilityStatus = CONTACTAVAILABILITYSTATUS.AVAILABLE;
                            }
                            else if(registerStatus=="o" && sessionStatus=="c")
                            {
                                availabilityStatus = CONTACTAVAILABILITYSTATUS.DND;
                            }
                            else if(registerStatus=="c")
                            {
                                availabilityStatus = CONTACTAVAILABILITYSTATUS.OFFLINE;
                            }
                            contAvailStatus[nPresence] = {"TYPE":"CONTACTAVAILABILITYSTATUS","mdn": contactMDN, "availabilityStatus": availabilityStatus};
                        }
                    }
                }
            }
            this.callBackHandler(contAvailStatus,this.callback);
    }

    notifyResp = status = null;
    ua.transaction = null;
};


SipMessageHandler.prototype.clearCallContext = function ()
{
	this.callStatus  = CALL_STATUS.IDLE;
	this.floorStatus = FLOOR_STATUS.IDLE;
	//document.getElementById('PoC').src = "./images/idle.png";

	//this.pc.getLocalStreams()[0].stop();
	//this.pc.removeStream(this.pc.getLocalStreams()[0]);

    this.callJson = null;

    var callStatus = { "TYPE": "CALLSTATUS", "callStatus" : CALLSTATUS.FLOOR_CHANGED, "floorStatus" : FLOORSTATUS.IDLE };
    this.callBackHandler(callStatus,this.callback);

    var callStatus = { "TYPE": "CALLSTATUS", "callStatus" : CALLSTATUS.TERMINATED, "floorStatus" : FLOORSTATUS.IDLE };
    this.callBackHandler(callStatus,this.callback);

    if(this.pc!=null && this.pc.signalingState!="closed")
    {
        this.pc.close();
    }
};

SipMessageHandler.prototype.handleInviteResponse = function (ua, pResponse, stack)
{
	var self = this;

	var remoteSDP = {};
	remoteSDP.sdp  = pResponse._body;
	remoteSDP.type = "answer";

	if (pResponse.is2xx())
	{
	    //To remove javascript NULL characters \u0000 = \0.
	    remoteSDP.sdp = remoteSDP.sdp.replace(/\0/g,"");

	    console.log("INFO: REMOTE SDP :" + JSON.stringify(remoteSDP.sdp));

		self.pc.setRemoteDescription(new RTCSessionDescription(remoteSDP), function ()
		{
			console.log("INFO: SETTING REMOTE DESCRIPTION IS SUCCESSFULL....");
		}, function(error) {console.log(error);});
	}
	else if(pResponse.is1xx())
    {
            console.log("INFO: INVITE TEMPORARY RESPONSE.......");
    }
    else
	{
        /*var callStatus = { "TYPE": "CALLSTATUS", "callStatus" : CALLSTATUS.UNKNOWN, "floorStatus" : FLOORSTATUS.IDLE };
        this.callBackHandler(callStatus,this.callback);
        this.callStatus==CALL_STATUS.IDLE;*/
        this.clearCallContext();
	}
};

SipMessageHandler.prototype.handleIncomingCall = function (ua, pRequest, stack)
{
	var self = this;
	console.log("Body   :" + pRequest._body);

	var remoteSDP = {};
	remoteSDP.sdp  = pRequest._body;
	remoteSDP.type = "offer";


    //remoteSDP.sdp = this.insert(remoteSDP.sdp, remoteSDP.sdp.indexOf("a=msid-semantic:"), "a=group:BUNDLE audio\r\n");

	console.log("remoteSDP  :" + JSON.stringify(remoteSDP));
	self.pc.setRemoteDescription(new RTCSessionDescription(remoteSDP), function ()
	{
		if(self.secondCall == true)
		{
			console.log("INFO: SECOND CALL... DEFERED HANDLING OF THE INCOMING CALL AFTER MEDIA STREAM IS ACCESSED..");
		}
		else
		{
			if (self.pc.remoteDescription.type == "offer")
			{
				console.log("INFO: INCOMING CALL CREATING ANSWER");
		    		self.pc.createAnswer(self.localDescCreated1, function(error) {console.log(error);});
			}
		}
	}, function(error) {console.log(error);});

	this.inviteUserAgent = ua;
};

SipMessageHandler.prototype.handleCallDisconnection = function (ua, pRequest, stack)
{
	var byeResponse = ua.createResponse(200, 'OK');
	byeResponse.setItem('WebRTC-Client', new sip.Header('WebRTC-Client', 'WebRTC-Client'));
	ua.sendResponse(byeResponse);
}

SipMessageHandler.prototype.handleFloorControl = function (ua, pRequest, stack)
{
	var floorControl = pRequest._body;
	var infoResponse = ua.createResponse(200, 'OK');
	ua.sendResponse(infoResponse);

	if(floorControl == "release")
	{
		console.log("remote party released floor");
	}
	else if(floorControl == "acquire")
	{
		console.log("remote party acquired floor");
	}
};

SipMessageHandler.prototype.respondToInvite = function()
{
	var self = this;
  	var contentXML = self.pc.localDescription.sdp;

  	//contentXML = contentXML.replace(/^.*host generation 0.*$\r\n/mg, '');

	if (self.pocServer==true)
  	{
  		//contentXML = this.insert(contentXML, contentXML.indexOf("t=0 0"), "c=IN IP4 192.168.30.218\r\n");
  		//contentXML = this.insert(contentXML, contentXML.indexOf("t=0 0"), "c=IN IP4 192.168.31.39\r\n");
  	}

	var inviteResponse = this.inviteUserAgent.createResponse(200, 'OK', contentXML, 'application/sdp');

    inviteResponse.setItem('P-Asserted-Identity', new sip.Header(this.telMDN, 'P-Asserted-Identity'));
    inviteResponse.setItem('P-Charging-Vector', new sip.Header('icid-value="536e8f6c:9cdc5:7803452f@pcscf1",orig-ioi="ims.motorola.com",term-ioi="ims.motorola.com"', 'P-Charging-Vector'));
    inviteResponse.setItem('Session-Expires', new sip.Header('7200;refresher=uac', 'Session-Expires'));
    inviteResponse.setItem('Require', new sip.Header('timer', 'Require'));
    inviteResponse.setItem('WebRTC-Client',	new sip.Header('WebRTC-Client', 'WebRTC-Client'));
    inviteResponse.setItem('Server', new sip.Header('PoC-serv/OMA1.0', 'Server'));

	this.inviteUserAgent.sendResponse(inviteResponse);
};

SipMessageHandler.prototype.receivedRegisterResponse = function (pUa, pResponse)
{
};

SipMessageHandler.prototype.receivedInviteResponse = function (pUa, pResponse)
{
};

SipMessageHandler.prototype.authenticate = function (ua, header, stack)
{
    header['password'] = this.MDN;
    header['hashValue'] = 'abcd';
    header['username'] = this.MDN;
    return true;
};

SipMessageHandler.prototype.saveDialog = function (dialog, ua, stack)
{
    if (dialog.request.method == 'INVITE')
    {
	this._inviteDialog = dialog;
    }
};

SipMessageHandler.prototype.notifyResponse = function ()
{
    if (result === true)
    {
        json.status = "success";
    }
    else
    {
        json.status = "failed";
    }
    json.isIncoming = "false";
    //this._pocClientRef.handleResponseEvent(json);
    json = null;
};

SipMessageHandler.prototype.notifyIncomingEvent = function (result, json)
{
    if (result === true)
    {
        json.status = "success";
    }
    else
    {
        json.status = "failed";
    }
    json.isIncoming = "true";
    //this._pocClientRef.handleIncomingEvent(json);
};

SipMessageHandler.prototype.returnCb = function (msg)
{
};

SipMessageHandler.prototype.persistCb = function (msg, callback)
{
};

SipMessageHandler.prototype.deleteCB = function (msg)
{
};

SipMessageHandler.prototype.generateReqId = function (r)
{
};

SipMessageHandler.prototype.setAdditionalHeaders = function (operation, message)
{
};

//method to send data to the Server over webSocket..
SipMessageHandler.prototype.sendSipDataToServer = function (data, stack)
{
	console.log("sendSipDataToServer :" + data);
	this.socket.send(data);
};

SipMessageHandler.prototype.receivedSipData = function (msg, host, port)
{
    var sipMessage = new sip.Message(msg.toString());
    var addr = ["115.114.48.61", "5060"];
    this.stack.received(msg.toString(), addr)
    msg = addr = null;
};

SipMessageHandler.prototype.clearCallData = function ()
{


};

SipMessageHandler.prototype.Pause = function ()
{
	this.pc.getLocalStreams()[0].getAudioTracks()[0].enabled = false;

	var self = this;

	var desc 	= this.pc.localDescription;
	var sdpAttr 	= desc.sdp;

	sdpAttr 	= sdpAttr.replace('a=sendrecv\r\n','a=recvonly\r\n');
	sdpAttr 	= sdpAttr.replace('a=sendonly\r\n','a=recvonly\r\n');

	desc["sdp"] 	= sdpAttr;

	this.pc.setLocalDescription(desc, function () {
	    	console.log("set-RecvOnly-Description   :" + JSON.stringify(pc.localDescription));
    	}, function(error) {console.log(error);});
};

SipMessageHandler.prototype.Resume = function ()
{
	this.pc.getLocalStreams()[0].getAudioTracks()[0].enabled = true;

	var self = this;

	var desc = this.pc.localDescription;
	var sdpAttr = desc.sdp;
	sdpAttr = sdpAttr.replace('a=sendonly\r\n','a=sendrecv\r\n');
	sdpAttr = sdpAttr.replace('a=recvonly\r\n','a=sendrecv\r\n');
	desc["sdp"] = sdpAttr;

	this.pc.setLocalDescription(desc, function () {
	    	console.log("set-SendRecv-Description   :" + JSON.stringify(pc.localDescription));
        }, function(error) {console.log(error);});
};

SipMessageHandler.prototype.createDTMF = function ()
{
	this.dtmfSender = this.pc.createDTMFSender(this.pc.getLocalStreams()[0].getAudioTracks()[0]);
	this.dtmfSender.ontonechange = onToneChange;
};

SipMessageHandler.prototype.releaseFloor = function ()
{
	var self = this;
	this.pc.getLocalStreams()[0].getAudioTracks()[0].enabled = false;
	this.sendInfo("release");

	/*if (this.dtmfSender.canInsertDTMF)
	{
    		this.dtmfSender.insertDTMF('1234567890#*12345', 2000);
	}
	else
	{
    		console.log("DTMF function not available");
    	}*/
};

SipMessageHandler.prototype.acquireFloor = function ()
{
	var self = this;
	this.pc.getLocalStreams()[0].getAudioTracks()[0].enabled = true;
	this.sendInfo("acquire");

	/*if (this.dtmfSender.canInsertDTMF)
	{
    		this.dtmfSender.insertDTMF("2");
	}
	else
	{
    		console.log("DTMF function not available");
    	}*/
};

SipMessageHandler.prototype.createDataChannel = function (isInitiator)
{
	 if (isInitiator)
	 {
	        this.dataChannel = this.pc.createDataChannel("chat");
	        this.setupChat();
	 }
	 else
	 {
	        this.pc.ondatachannel = function (evt)
	        {
	            this.dataChannel = evt.channel;
	            this.setupChat();
	        };
    	 }
};

SipMessageHandler.prototype.setupChat = function()
{
    this.dataChannel.onopen = function ()
    {
    	console.log("Data Channel Enabled..........");
    };

    this.dataChannel.onmessage = function (evt)
    {
        console.log("Data ......... :" + evt.data);
    };
};

SipMessageHandler.prototype.sendData = function(data)
{
    this.dataChannel.send(data);
};

SipMessageHandler.prototype.sendMBCPRelease = function(obj)
{
    var rc = new KnMbcpPacket(kn.SUBTYPE_TBCP_RELEASE);
    rc.json.SSRC = 245678;
    console.log(JSON.stringify(rc.json));
    rc.encode(this.rtcpDetails);
    console.log(rc.buf);
    this.socket.send(rc.buf);
};

SipMessageHandler.prototype.sendPWRequest = function(obj)
{
    console.log("SENDING PW");
    var rc = new KnMbcpPacket(kn.SUBTYPE_TBCP_PW_NOTIFY);
    rc.json.SSRC = 245678;
    console.log(JSON.stringify(rc.json));
    rc.encode();
    this.socket.send(rc.buf);
};


SipMessageHandler.prototype.handleCallRequest = function(callJson)
{
            if(callJson!=undefined)
            {
                if(callJson[0]!=undefined)
                {
                    this.numberCandidates = 2;
    	            this.makeCall(callJson[0]);
                }
                else
                {
                    console.log("ERROR: To CALLING NUMBER is not populated.....");
                }
            }
            else
            {
                console.log("ERROR: Please select a contact");
                var callStatus = { "TYPE": "CALLSTATUS", "callStatus" : CALLSTATUS.UNKNOWN, "floorStatus" : FLOORSTATUS.IDLE };
                this.callBackHandler( callStatus, this.callback);
            }
}

SipMessageHandler.prototype.sendMBCPRequest = function(callJson)
{
    if(this.callStatus == CALL_STATUS.IDLE)
    {
           this.handleCallRequest(callJson);
    }
    else
    {
    	    if(this.callStatus == CALL_STATUS.CONNECTED)
    	    {
		        if(this.floorStatus == FLOOR_STATUS.IDLE)
		        {
		    	    console.log("INFO: ACQUIRE FLOOR");
                    this.AcquireFloor();
		        }
		        else if(this.floorStatus == FLOOR_STATUS.GRANTED)
		        {
		    	    console.log("INFO: RELEASE FLOOR");
			        this.sendMBCPRelease();
		        }
		        else
		        {
			        console.log("INFO: FLOOR CANNOT BE REQUESTED OR RELEASED FLOOR TAKEN MODE");
		        }
	        }
	        else
	        {
	    	    console.log("ERROR STATE: CALL IS NOT IN CONNECTED STATE..");
	        }
     }
};


SipMessageHandler.prototype.AcquireFloor = function(obj)
{
    console.log("INFO: ACQUIRE FLOOR");
	var rc = new KnMbcpPacket(kn.SUBTYPE_TBCP_REQUEST);
    rc.json.SSRC = 245678;
    console.log(JSON.stringify(rc.json));
    rc.encode();
    console.log(rc.buf);
    this.socket.send(rc.buf);
};

SipMessageHandler.prototype.acceptCall = function(obj)
{
    var rc = new KnMbcpPacket(kn.SUBTYPE_TBCP_ACKMT);
    rc.json.SSRC = 245678;
    console.log(JSON.stringify(rc.json));
    rc.encode();
    console.log(rc.buf);
    this.socket.send(rc.buf);
};


SipMessageHandler.prototype.disconnectCall = function(obj)
{
    var rc = new KnMbcpPacket(kn.SUBTYPE_TBCP_DISCONNECT);
    rc.json.SSRC = 245678;
    console.log(JSON.stringify(rc.json));
    rc.encode();
    console.log(rc.buf);
    this.socket.send(rc.buf);
};

SipMessageHandler.prototype.ipAddress2num = function(ipAddress) {
var d = ipAddress.split('.');
return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
}

SipMessageHandler.prototype.setupCallBack = function(callback, callbackType)
{
   this.callBackHandler = callback;
}

SipMessageHandler.prototype.setAvailabilityStatus = function(statusCodeJson)
{
}

SipMessageHandler.prototype.logout = function()
{
}

