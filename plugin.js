document.write('<script type="text/javascript" src="contactmanagement.js"></script>');
document.write('<script type="text/javascript" src="SipMessageHandler.js"></script>');
document.write('<script type="text/javascript" src="knmbcp.js"></script>');
document.write('<script type="text/javascript" src="sip.js"></script>');

var signallingServer="ws://40.0.1.158:443/";
var turnServer 	= { "iceServers": [{ "url": "stun:115.114.48.62:443" }, { "url": "turn:rajendratest@103.249.46.141:443?transport=tcp", credential:"kod456" }], "iceTransports": "relay" };
var xcapServer = "103.249.46.132";

//var signallingServer="wss://103.249.44.30:443/";
//var turnServer 	= { "iceServers": [{ "url": "stun:115.114.48.62:443" }, { "url": "turn:rajendratest@103.249.44.31:443?transport=tcp", credential:"kod456" }], "iceTransports": "relay" };
//var xcapServer = "103.249.46.148";

var Kodiakplugin = function Kodiakplugin()
{
    this.sipHandler     = new SipMessageHandler(this);
    this.contactHandler = new ContactManagement();
    this.loginCallback  = null;
    this.userId         = "";
}

Kodiakplugin.prototype.getSipHandler = function()
{
    return this.sipHandler;
}


Kodiakplugin.prototype.sipCallBackHandler = function(callbackJson,self)
{
    if(callbackJson.TYPE=="LOGIN")
    {
        console.log("Received Login Status");
        self.loginCallback(callbackJson);
    }
    else if(callbackJson.TYPE=="CALLSTATUS")
    {
        console.log("Received Call Status");
        self.callStatusCallBack(callbackJson);
    }
    else if(callbackJson.TYPE=="FLOORSTATUS")
    {
        self.callStatusCallBack(callbackJson);
        console.log("Received Floor Status");
    }
    else if(callbackJson.TYPE=="TALKERINFO")
    {
        self.TalkerInfoCallBack(callbackJson);
        console.log("Received Talker Info");
    }
    else if(callbackJson.TYPE=="IPAALERT")
    {
        self.ipaAlertCallBack(callbackJson);
        console.log("Received IPA Alert");
    }
    else if(callbackJson.TYPE=="IPASTATUS")
    {
        self.ipaStatusCallBack(callbackJson);
        console.log("IPA STATUS");
    }
    else if(callbackJson.TYPE="CONTACTAVAILABILITYSTATUS")
    {
        self.contactAvailStatusCallBack(callbackJson);
        console.log("PRESENCE STATE CHANGE");
    }
}

Kodiakplugin.prototype.login = function(json)
{
    this.userId = json.userId;
    this.sipHandler.setFromMDN(json.userId);
    this.sipHandler.setupCallBack(this.sipCallBackHandler);
	this.sipHandler.startClient();
	this.sipHandler.initSigTransport(signallingServer);
	//this.sipHandler.sendSipDataToServer("LoginData:" + this.userId);
	this.sipHandler.startMediaChannel(turnServer);
	this.sipHandler.initMediaSource();
}

Kodiakplugin.prototype.setAvailabilityStatus = function(statusCodeJson)
{
    this.sipHandler.setAvailabilityStatus(statusCodeJson);
}

Kodiakplugin.prototype.logout = function()
{
    this.sipHandler.logout();
}

Kodiakplugin.prototype.getSelfName = function()
{
    return this.contactHandler.getSelfName(this.userId);
}


/* Contact Management*/
Kodiakplugin.prototype.fetchContacts = function()
{
    var contactJson = this.contactHandler.fetchContacts(this.userId);
    return contactJson;
}

Kodiakplugin.prototype.fetchGroups = function()
{
    this.contactHandler.fetchGroups();
}

Kodiakplugin.prototype.fetchGroupDetail = function(inputJson)
{
    this.contactHandler.fetchGroupDetail(inputJson);
}

Kodiakplugin.prototype.fetchGroupList = function()
{
    this.contactHandler.fetchGroupList();
}


/* Call Management */
Kodiakplugin.prototype.makeCall = function(callJson)
{
    //this.sipHandler.sendInvite();
    this.sipHandler.sendMBCPRequest(callJson);
}

Kodiakplugin.prototype.endCall = function()
{
    this.sipHandler.sendBye();
}

Kodiakplugin.prototype.makeGroupCall = function()
{
}

Kodiakplugin.prototype.acquireFloor = function()
{
    this.sipHandler.AcquireFloor();
}

Kodiakplugin.prototype.releaseFloor = function()
{
    this.sipHandler.sendMBCPRelease();
}

Kodiakplugin.prototype.sendIPA = function(IPAJson)
{
    this.sipHandler.sendIPA(IPAJson);
}

Kodiakplugin.prototype.sendPW = function()
{
    this.sipHandler.sendPWRequest();
}
Kodiakplugin.prototype.setupCallBack = function (callback, callbackType)
{
   if(callbackType == "LOGIN")
   {
         this.loginCallback = callback;
   }
   else if(callbackType == "LOGOUT")
   {
         this.logOutCallback = callback;
   }
   else if(callbackType == "CALLSTATUS")
   {
         this.callStatusCallBack = callback;
   }
   else if(callbackType == "CALLALERT")
   {
         this.callAlertCallBack = callback;
   }
   else if(callbackType == "TALKERINFO")
   {
         this.TalkerInfoCallBack = callback;
   }
   else if(callbackType == "IPAALERT")
   {
         this.ipaAlertCallBack = callback;
   }
   else if(callbackType == "CONTACTAVAILABILITYSTATUS")
   {
         this.contactAvailStatusCallBack = callback;
   }
   else if(callbackType == "SELFAVAILABILITYSTATUS")
   {
         this.selfAvailStatusCallBack = callback;
   }
   else if(callbackType == "IPASTATUS")
   {
         this.ipaStatusCallBack = callback;
   }
}





