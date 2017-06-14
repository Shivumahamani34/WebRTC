document.write('<script type="text/javascript" src="plugin.js"></script>');

/**
 * @version 1.0.0
 *
 * @fileoverview  <h3> PoC Plugin for Browser</h3>
 * <p>poc.js is a JavaScript API that exposes several  PoC services directly into the browser.</p>
 *
 * <p> PoC Plugin lets you open inbound and outbound audio connections to  PoC Server
 *    for Building conference calls, push-to-talk systems, etc all from the browser.</p>
 *
 * <p> PoC EventStream pushes the real-time events from your PoC calls and
 * SMS messages into your browser to create completely synchronized phone and
 * browser application experiences.</p>
 *
 * <p>Import poc.js file in HTML for using the PoC services</p>
 * <p>Example : &lt;script src="http://static.networks.com/jslib/pocjs/1.0/poc.js" type="text/javascript"&gt;&lt;/script&gt;</p>
 * @copyright Copyright (c) 2010   Networks (India) Pvt. Ltd.
 * <br/>#401, 4th Floor, 'Prestige Sigma'
 * <br/>No.3, Vittal Mallya Road
 * <br/>Bangalore - 560 001
 * <br/>www.networks.com
 * <br/>
 * <br/>All Rights Reserved.
 * <br/><p>This software is the confidential and proprietary information of 
 * Networks, Inc. You shall not disclose such confidential information and
 * shall use it only in accordance with the terms of the license agreement
 * you entered into with  Networks.</p>
 */

/**
 * Plugin download URL.
 *
 * Set the valid pluign url using {@link KNPoC.setPluginURL}
 * @type {string}
 */
var defaultPluginURL = '';

/**
 * <br/>
 * <h5 style="padding-left:14px">Login Status Codes:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">UNKNOWN</td><td class="description last">Unknown status code</td></tr>
 *    <tr><td class="name">2</td><td class="type">SUCCESS</td><td class="description last">Login is success</td></tr>
 *    <tr><td class="name">3</td><td class="type">FAILED</td><td class="description last">Login failed</td></tr>
 *    <tr><td class="name">4</td><td class="type">ALREADY_LOGGED_IN</td><td class="description last">Client is already logged in, logout and try again.</td></tr></table>
 *@type {enum}
 */
var LOGINSTATUS = {
    UNKNOWN           : "1",
    SUCCESS           : "2",
    FAILED            : "3",
    ALREADY_LOGGED_IN : "4"
};
/**
 * <br/>
 * <h5 style="padding-left:14px">Subscription Status Codes:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">UNKNOWN</td><td class="description last">Unknown status code</td></tr>
 *    <tr><td class="name">2</td><td class="type">SUBSCRIPTION_ENABLED</td><td class="description last">Subscription is Enabled</td></tr>
 *    <tr><td class="name">3</td><td class="type">SUBSCRIPTION_CANCELLED</td><td class="description last">Subscription is Cancelled</td></tr>
 *    <tr><td class="name">4</td><td class="type">SUBSCRIPTION_DELETED</td><td class="description last">Subscription is Deleted</td></tr></table>
 *@type {enum}
 */
var SUBSCRIPTIONSTATUS = {
    UNKNOWN                 : "1",
    SUBSCRIPTION_ENABLED    : "2",
    SUBSCRIPTION_CANCELLED  : "3",
    SUBSCRIPTION_DELETED    : "4"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Contact Availability Status status Codes:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">UNKNOWN</td><td class="description last">Unknown status code</td></tr>
 *    <tr><td class="name">2</td><td class="type">OFFLINE</td><td class="description last">Contact is offline</td></tr>
 *    <tr><td class="name">3</td><td class="type">AVAILABLE</td><td class="description last">Contact is available</td></tr>
 *    <tr><td class="name">4</td><td class="type">DND</td><td class="description last">Contact status is Do Not Disturb</td></tr></table>
 *@type {enum}
 */
var CONTACTAVAILABILITYSTATUS = 
{
    UNKNOWN        : "1",
    OFFLINE        : "2",
    AVAILABLE      : "3",
    DND            : "4"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Self Availability status Codes:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">UNKNOWN</td><td class="description last">Unknown status code</td></tr>
 *    <tr><td class="name">2</td><td class="type">OFFLINE</td><td class="description last">Self status is offline</td></tr>
 *    <tr><td class="name">3</td><td class="type">AVAILABLE</td><td class="description last">Self status is available</td></tr>
 *    <tr><td class="name">4</td><td class="type">DND</td><td class="description last">Self status is Do Not Disturb</td></tr></table>
 *@type {enum}
 */

var SELFAVAILABILITYSTATUS = {
    UNKNOWN        : "1",
    OFFLINE        : "2",
    AVAILABLE      : "3",
    DND            : "4"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Self Availability Change Status Codes:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">UNKNOWN</td><td class="description last">Unknown status code</td></tr>
 *    <tr><td class="name">2</td><td class="type">SUCCESS</td><td class="description last">Success</td></tr>
 *    <tr><td class="name">3</td><td class="type">FAILURE</td><td class="description last">Failure</td></tr></table>
 *@type {enum}
 */

var SELFAVAILABILITYCHANGESTATUS = {
    UNKNOWN : "1",
    SUCCESS : "2",
    FAILURE : "3"
};


/**
 * <br/>
 * <h5 style="padding-left:14px">Logout Status Codes:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">UNKNOWN</td><td class="description last">Unknown status code</td></tr>
 *    <tr><td class="name">2</td><td class="type">SUCCESS</td><td class="description last">Success</td></tr>
 *    <tr><td class="name">3</td><td class="type">FAILURE</td><td class="description last">Failure</td></tr>
 *    <tr><td class="name">4</td><td class="type">USER_NOT_LOGGED_IN</td><td class="description last">User not logged in</td></tr></table>
 *@type {enum}
 */

var LOGOUTSTATUS = {
    UNKNOWN             : "1",
    SUCCESS             : "2",
    FAILURE             : "3",
    USER_NOT_LOGGED_IN  : "4"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Contact Status Codes:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">UNKNOWN</td><td class="description last">Unknown status code</td></tr>
 *    <tr><td class="name">2</td><td class="type">ADDED</td><td class="description last">When a single contact added</td></tr>
 *    <tr><td class="name">3</td><td class="type">DELETED</td><td class="description last">When a single contact deleted</td></tr>
 *    <tr><td class="name">4</td><td class="type">UPDATED</td><td class="description last">When a contacts name is updated</td></tr>
 *    <tr><td class="name">5</td><td class="type">LOCATION_CHANGE</td><td class="description last">When contact location changes</td></tr></table>
 *@type {enum}
 */

var CONTACTOPERATIONCODE = {
    UNKNOWN          : "1",
    ADDED            : "2",
    DELETED          : "3",
    UPDATED          : "4",
    LOCATION_CHANGE  : "5"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Group Status Codes:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">UNKNOWN</td><td class="description last">Unknown status code</td></tr>
 *    <tr><td class="name">2</td><td class="type">ADDED</td><td class="description last">Group is created</td></tr>
 *    <tr><td class="name">3</td><td class="type">DELETED</td><td class="description last">Group is deleted</td></tr>
 *    <tr><td class="name">4</td><td class="type">UPDATED</td><td class="description last">Group is updated</td></tr></table>
 *@type {enum}
 */

var GROUPOPERATIONCODE = {
    UNKNOWN        : "1",
    ADDED          : "2",
    DELETED        : "3",
    UPDATED        : "4"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Call Status Codes:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">UNKNOWN</td><td class="description last">Unknown status code</td></tr>
 *    <tr><td class="name">2</td><td class="type">DIALING</td><td class="description last">The call is dialing</td></tr>
 *    <tr><td class="name">3</td><td class="type">RINGING</td><td class="description last">The call is ringing</td></tr>
 *    <tr><td class="name">4</td><td class="type">BUSY</td><td class="description last">The other end is busy</td></tr>
 *    <tr><td class="name">5</td><td class="type">ANSWERED</td><td class="description last">The call is being answered</td></tr>
 *    <tr><td class="name">6</td><td class="type">CONNECTED</td><td class="description last">The call is connected and active</td></tr>
 *    <tr><td class="name">7</td><td class="type">TERMINATED</td><td class="description last">The call is terminated</td></tr>
 *    <tr><td class="name">8</td><td class="type">FLOOR_CHANGED</td><td class="description last">Floor has changed</td></tr>
 *    <tr><td class="name">9</td><td class="type">RECONNECTING</td><td class="description last">Call is reconnecting</td></tr>
 *    <tr><td class="name">10</td><td class="type">USER_DND</td><td class="description last">User is in "Do Not Disturb" mode</td></tr>
 *    <tr><td class="name">11</td><td class="type">USER_OFFLINE</td><td class="description last">User is Offline</td></tr>
 *    <tr><td class="name">12</td><td class="type">OTHER_CALL_ERROR</td><td class="description last">Any other call error</td></tr></table>
 *@type {enum}
 */

var CALLSTATUS = {
    UNKNOWN           : "1",
    DIALING           : "2",
    RINGING           : "3",
    BUSY              : "4",
    ANSWERED          : "5",
    CONNECTED         : "6",
    TERMINATED        : "7",
    FLOOR_CHANGED     : "8",
    RECONNECTING      : "9",
    USER_DND          : "10",
    USER_OFFLINE      : "11",
    OTHER_CALL_ERROR  : "12"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Floor Status Codes:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">REQUESTED_SELF</td><td class="description last">Floor is requested by self</td></tr>
 *    <tr><td class="name">2</td><td class="type">RELEASED</td><td class="description last">Floor is released by self or by participant</td></tr>
 *    <tr><td class="name">3</td><td class="type">REVOKED</td><td class="description last">Floor is revoked</td></tr>
 *    <tr><td class="name">4</td><td class="type">GRANTED</td><td class="description last">Floor is granted to self or to a participant</td></tr>
 *    <tr><td class="name">5</td><td class="type">DENIED</td><td class="description last">Floor requested is denied</td></tr>
 *    <tr><td class="name">6</td><td class="type">TAKEN</td><td class="description last">Floor is taken by a participant</td></tr>
 *    <tr><td class="name">7</td><td class="type">IDLE</td><td class="description last">Floor is idle</td></tr></table>
 *@type {enum}
 */

var FLOORSTATUS = {
    REQUESTED_SELF  : "1",
    RELEASED        : "2",
    REVOKED         : "3",
    GRANTED         : "4",
    DENIED          : "5",
    TAKEN           : "6",
    IDLE            : "7"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">IPA Status Codes:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">UNKNOWN</td><td class="description last">Unknown status code</td></tr>
 *    <tr><td class="name">2</td><td class="type">SUCCESS</td><td class="description last">Success</td></tr>
 *    <tr><td class="name">3</td><td class="type">FAILURE</td><td class="description last">Failure</td></tr></table>
 *@type {enum}
 */


var IPASTATUS = {
    UNKNOWN        : "1",
    SUCCESS        : "2",
    FAILURE        : "3"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Setup Status Codes:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">UNKNOWN</td><td class="description last">Unknown status code</td></tr>
 *    <tr><td class="name">2</td><td class="type">SUCCESS</td><td class="description last">Success</td></tr>
 *    <tr><td class="name">3</td><td class="type">PLUGIN_NOT_INSTALLED</td><td class="description last">Plugin not installed</td></tr>
 *    <tr><td class="name">4</td><td class="type">PLUGIN_ALREADY_RUNNING</td><td class="description last">Another instance is already running</td></tr>
 *    <tr><td class="name">5</td><td class="type">PLUGIN_IS_BLOCKED</td><td class="description last">Plugin is blocked</td></tr></table>
 *@type {enum}
 */


var SETUPSTATUS = {
    UNKNOWN                 : "1",
    SUCCESS                 : "2",
    PLUGIN_NOT_INSTALLED    : "3",
    PLUGIN_ALREADY_RUNNING  : "4",
    PLUGIN_IS_BLOCKED       : "5"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Plugin Status Codes:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">BUSY</td><td class="description last">Plugin is busy</td></tr>
 *    <tr><td class="name">2</td><td class="type">READY</td><td class="description last">Plugin is ready for use</td></tr>
 *    <tr><td class="name">3</td><td class="type">NETWORK_CONNECTED</td><td class="description last">Network connected</td></tr>
 *    <tr><td class="name">4</td><td class="type">NETWORK_DISCONNECTED</td><td class="description last">Network disconnected</td></tr></table>
 *@type {enum}
 */


var PLUGINSTATUS = {
    BUSY                    : "1",
    READY                   : "2",
    NETWORK_CONNECTED       : "3",
    NETWORK_DISCONNECTED    : "4"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Missed call alert call type:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">PRIVATE</td><td class="description last">Missed call while originator originated one to one private call </td></tr>
 *    <tr><td class="name">2</td><td class="type">GROUP</td><td class="description last">Missed call while originator originated prearranged group call </td></tr>
 *    <tr><td class="name">3</td><td class="type">ADHOC</td><td class="description last">Missed call while originator originated adhoc group call</td></tr></table>
 *@type {enum}
 */
var MISSEDCALLALERTCALLTYPE = {
    PRIVATE     : "1",
    GROUP       : "2",
    ADHOC       : "3"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Plugin generic error code:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>Status Code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">UNKNOWN</td><td class="description last">Unknown error code </td></tr>
 *    <tr><td class="name">2</td><td class="type">PLUGIN_BUSY</td><td class="description last">Plugin is busy</td></tr>
 *    <tr><td class="name">3</td><td class="type">NETWORK_DISCONNECTED</td><td class="description last">Network disconnected, Plugin is trying to reconnect</td></tr>
 *    <tr><td class="name">4</td><td class="type">INPUT_VALIDATION_FAILED</td><td class="description last">Input parameter is not valid</td></tr>
 *    <tr><td class="name">5</td><td class="type">USER_NOT_LOGGED_IN</td><td class="description last">User not logged in</td></tr>
 *    <tr><td class="name">6</td><td class="type">AUDIO_DEVICE_NOT_FOUND</td><td class="description last">Audio Device(s) not available</td></tr></table>
 *@type {enum}
 */
var ERRORCODE = {
    UNKNOWN                     : "1",
    PLUGIN_BUSY                 : "2",
    NETWORK_DISCONNECTED        : "3",
    INPUT_VALIDATION_FAILED     : "4",
    USER_NOT_LOGGED_IN          : "5",
    AUDIO_DEVICE_NOT_FOUND      : "6"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Plugin API:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>HotKey code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">ACQUIREFLOOR</td><td class="description last">Acquring floor</td></tr>
 *    <tr><td class="name">2</td><td class="type">RELEASEFLOOR</td><td class="description last">Release floor</td></tr>
 *    <tr><td class="name">3</td><td class="type">ENDCALL</td><td class="description last">End call</td></tr></table>
 *@type {enum}
 */
var PLUGINAPI = {
    ACQUIREFLOOR: "1",
    RELEASEFLOOR: "2",
    ENDCALL: "3"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Hot Key functions:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>HotKey code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">FOOTPEDAL</td><td class="description last">Device to acquire/release floor during call</td></tr></table>
 *@type {enum}
 */
var DEVICETYPE = {
    FOOTPEDAL: "1"
};

/**
 * <br/>
 * <h5 style="padding-left:14px">Hot Key functions:</h5>
 *    <table class="params" style="margin-left:17px" border="1px solid">
 *    <thead><th>HotKey code</th><th>Name</th><th class="last">Description</th></thead>
 *    <tr><td class="name">1</td><td class="type">PRESSED</td><td class="description last">Foot Pedal Pressed</td></tr>
 *    <tr><td class="name">2</td><td class="type">RELEASED</td><td class="description last">Foot Pedal Release</td></tr></table>
 *@type {enum}
 */
var DEVICESTATUS = {
    PRESSED: "1",
    RELEASED: "2"

};


/**
 * Plugin reference variable. Holds the reference of kodaik poc plugin
 * @private
 * @type {object}
 */
var plugin;
var webrtcPlugin = null;
var isWebRTC = true;

/**
 * Using KNPoC APIs user can perform the below actions:
 * <ul><li> Set the plugin download url</li>
 * <li> Download the plugin</li>
 * <li> Install/Setup the plugin</li>
 * <li> Login to the poc server using the userId and access token</li>
 * <li> Logout from the poc server</li>
 * <li> Set the self availability status</li></ul>
 * @namespace
 * @class
 */
var KNPoC = {

    /**
     * Method for setting up the plugin installable URL.
     * From this URL browser will look for plugin MSI file and prompt the user to install or download the file.
     * @param pluginURL {string} plugin installer URL
     * @returns void
     *
     * @example
     *
     * KNPoC.setPluginURL("http://static..com/ptt/");
     *
     */
    setPluginURL    : function(pluginURL) {
        if(pluginURL) {
            defaultPluginURL = pluginURL;
        }
    },
    /**
     * Method for checking the plugin new version.
     * If version JSON status is true then UI should prompt the user for new version download.
     * @example
     * KNPoC.versionCheck();
     * @returns {JSON}
     * Output JSON:
     *      {"status":true,"downloadURL":"http://static..com/plugin/KWP.msi"}
     *
     */
    versionCheck: function() {
        var xmlhttp;
        var rtnJSON ="[{\"status\":false,\"downloadURL\":\"\"}]";
        if(plugin && defaultPluginURL) {
            var versionNum = plugin().version;
            try {
                if (window.XMLHttpRequest) {
                // code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp = new XMLHttpRequest({mozSystem: true});
                } else {
                // code for IE6, IE5
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                }
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 ) {
                       if(xmlhttp.status == 200){
                           console.log("version check:"+xmlhttp.responseText);
                           if(xmlhttp.responseText == "false"){
                              // KNUtil.downloadPluginNewVersion();
                               rtnJSON ="{\"status\":true,\"downloadURL\":\""+defaultPluginURL+"plugin/KWP.msi\"}";
                           }
                       } else {
                           console.error("unable to check the plugin version!");
                       }
                    }
                };

                xmlhttp.open("GET", defaultPluginURL+"VersionCheck?version="+versionNum, false);
                xmlhttp.send();
            }catch(error){
                 console.error("unable to check the plugin version!"+error);
            }
        }
        return JSON.parse(rtnJSON);
    },
    /**
     * Method for setting up the plugin and registering default ERROR callback.
     * User has to call this method before performing any of the POC operation, like login, call management, contact/group management etc.
     * @returns {JSON}
     *
     * Output JSON:
     *  {"result":status} Refer: {@link SETUPSTATUS}
     *
     *
     * var statusJson = KNPoC.setup();
     * var result = statusJson.result;
     *
     */
    setup  : function() {
        console.log('setup method call');
        var status = KNUtil.loadPlugin();
        var statusJson = {"result":status};
        if(status == SETUPSTATUS.SUCCESS) {
            KNCallBackMgr.setupCallBack(this.onError, 'ERROR');
        }
        console.log('setup statusJson: '+JSON.stringify(statusJson));
        return statusJson;

    },
    /**
     * Method for logging into the  PTT server.
     * @param loginJson {JSON} Login json object with login credentials.
     *
     * @example
     *
     * var loginJson  =  {
         *    "userId" : "19724453400", "accessToken" : "abcderfgh1234"
         * }
     *
     * KNPoC.login(loginJson);
     *
     * @returns Boolean and asynchronous callback. Refer: {@link LOGINSTATUS}, {@link KNCallBackMgr}
     */
    login          : function(loginJson) {
        return plugin().login(loginJson);
    },
    /**
     * Method for setting up self status.
     * @param statusCodeJson {JSON} set the self status code.
     * @returns Boolean and asynchronous callback. Refer: {@link SELFAVAILABILITYSTATUS}, {@link KNCallBackMgr}
     * @example
     *
     * var availabilityStatus = {
         *    "statusCode" : "0"
         * }
     *
     * KNPoC.setAvailabilityStatus(availabilityStatus);
     */
    setAvailabilityStatus : function(statusCodeJson) {
        return plugin().setAvailabilityStatus(statusCodeJson);
    },
    /**
     * Method for logging out from the  PTT server.
     * @returns void and asynchronous callback. Refer: {@link LOGOUTSTATUS}, {@link KNCallBackMgr}
     *
     * @example
     *
     * KNPoC.logout();
     */
    logout         : function() {
        return plugin().logout();
    },

    /**
     * Method for getting the self name
     * @returns String  Self name
     *
     * @example
     *
     * KNPoC.getSelfName();
     */
    getSelfName         : function() {
        return plugin().getSelfName();
    },
    /**
     * Default callback method for handling errors.
     * @param errorJson {JSON} error detail.
     * @returns void
     * @private
     */
    onError        : function(errorJson) {
        console.log("Error :" + JSON.stringify(errorJson));
    },
     /**
     * Method for getting device info
     * @param deviceJson {JSON} device type detail.
     * @returns String
     * @example
     * var deviceJson  =  {
     *    deviceType" : "1"
     * }
     *
     * KNPoC.getDeviceInfo(deviceJson);
     */
    getDeviceInfo  : function(deviceJson) {
        return plugin().getDeviceInfo(deviceJson);
    }

};

/**
 * KNCallBackMgr class is used for registering the callbacks from the plugin
 * <br/>
 * <h5 style="padding-left:14px">Callbacks type and description:</h5>
 *    <table class="params" style="margin-left:17px;font-size:12px;" border="1px solid">
 *    <thead><th>Callback Type</th><th>Callback Json Response Structure</th><th>Response Code Referrence</th><th class="last">Description</th></thead>
 *    <tr><td class="name">LOGIN </td><td class="name" style="width:40%">{ "status" : "3" }</td><td class="name">{@link LOGINSTATUS}</td><td class="description last">Will be called after calling login(args)</td></tr>
 *    <tr><td class="name">LOGOUT </td><td class="name" style="width:40%">{ "status" : "1" }</td><td class="name">{@link LOGOUTSTATUS}</td><td class="description last">Will be called after calling logout(args)</td></tr>
 *    <tr><td class="name">CALLSTATUS</td><td class="name">{ "callStatus" : "5", "floorStatus" : "3"  } </td><td class="name">{@link CALLSTATUS}<br/>{@link FLOORSTATUS}</td><td class="description last">Will be called when there is change in call status and floor status</td></tr>
 *    <tr><td class="name">CALLALERT</td><td class="name">{ "name": "Bill", "mdn": "12146209832" }</td><td class="name">N/A</td><td class="description last">Will be called when there in incoming alert</td></tr>
 *    <tr><td class="name">TALKERINFO</td><td class="name">{ "name": "Elizabeth", "mdn": "121462098435" }</td><td class="name">N/A</td><td class="description last">Will be called when a talker takes the floor and starts talking</td></tr>
 *    <tr><td class="name">IPALERT</td><td class="name">{ "name" : "Jennifer", "mdn" : "12146209832"}</td><td class="name">N/A</td><td class="description last">Will be called when there is incoming IPA</td></tr>
 *    <tr><td class="name">IPASTATUS</td><td class="name">{ "status": "1" }</td><td class="name">{@link IPASTATUS}</td><td class="description last">Will be called when an IPA is initated by the API-User</td></tr>
 *    <tr><td class="name">CONTACTAVAILABILITYSTATUS</td><td class="name">[{"mdn" : "12146209832", "availabilityStatus" : "0"},...]</td><td class="name">{@link CONTACTAVAILABILITYSTATUS}</td><td class="description last">Will be called when there is availability state change for self or any mdn</td></tr>
 *    <tr><td class="name">GROUPSTATUS</td><td class="name"><u><h3>Group is added</u></h3>
                                                            var groupData = { groupOperationCode: "2", group:
                                                                                { "name": "Group1", "groupId": "23478236787" } };

                                                            <u><h3>Group is deleted</u></h3>
                                                            var groupData = { groupOperationCode: "3", group:
                                                                                { "groupId": "23478236787 }};

                                                            <u><h3>Group is modified response 1:</u></h3>
                                                            var groupData = { groupOperationCode: "4", group:
                                                            { "name": "Group1", "groupId": "23478236787 }};
                                                            <u><h3>Group is modified response 2:</u></h3>
                                                            var groupData = { groupOperationCode: "4", group:
                                                                { "name": "Group1", "groupId": "23478236787", "contacts" : [
                                                                { "contactOperationCode ":"2", contact: {"name": "Bill", "mdn": "12146209832"},
                                                                { "contactOperationCode":"3", contact: {"name": "Bill", "mdn": "12146209832"},
                                                                { "contactOperationCode":"4", contact: {"name": "Bill", "mdn": "12146209832"}, ... ] }};

</br></br><h3>Note* :</h3> Whenever there is no contacts key [as in group modified case 2 and new group addition], API user has to fetch the entire group contacts using fetchGroupDetail API
</td><td class="name">{@link GROUPOPERATIONCODE}</td><td class="description last">Will be called when there is a change in group</td></tr>
 *    <tr><td class="name">CONTACTSTATUS</td><td class="name">[{"contactOperationCode":"2", contacts: {"name": "Bill", "mdn": "12146209832", "availabilityStatus": "0"}},{"contactOperationCode":"3", contacts: {"mdn": "12146209832"}},{"contactOperationCode":"4", contacts: {"name": "Bill", "mdn": "12146209832"}},{"contactOperationCode":"4", contacts: {"mdn": "12146209832", "LOC": "18.9750,72.8258"}}...]</td><td class="name">{@link CONTACTOPERATIONCODE}</td><td class="description last">Will be called when a contact gets added or removed</td></tr>
 *    <tr><td class="name">SUBSCRIPTIONSTATUS</td><td class="name">{ "status" : "0" }</td><td class="name">{@link SUBSCRIPTIONSTATUS}</td><td class="description last">Will be called when the subscriberâs subscription status changes</td></tr>
 *    <tr><td class="name">PLUGINSTATUS</td><td class="name">{ "status" : "1" }</td><td class="name">{@link PLUGINSTATUS}</td><td class="description last">Will be called when plugin is busy or ready</td></tr>
 *    <tr><td class="name">SELFAVAILABILITYSTATUS</td><td class="name">{ "status" : "1" }</td><td class="name">{@link SELFAVAILABILITYSTATUS}</td><td class="description last">Will be called when there is change in self presence status, for example client went to offline or the last self presence status when client relogin after logout</td></tr>
 *    <tr><td class="name">SELFAVAILABILITYCHANGESTATUS</td><td class="name">{ "status" : "1" }</td><td class="name">{@link SELFAVAILABILITYCHANGESTATUS}</td><td class="description last">Will be called whenever client has change the self presence status by calling setAvailabilityStatus API</td></tr>
 *    <tr><td class="name">MISSEDCALLALERT</td><td class="name">{"callType":"1","name":"Jennifer","originator":"19870000014"}</td><td class="name">{@link MISSEDCALLALERTCALLTYPE}</td><td class="description last">Will be called whenever there is missed call alert, alert type can be one to one call or group call or adhoc group call</td></tr>
 *    <tr><td class="name">ERROR</td><td class="name">{"errorCode":"2","msg":"Error Message"}</td><td class="name">{@link ERRORCODE}</td><td class="description last">Will be called whenever there is generic error</td></tr>
 *    <tr><td class="name">DEVICESTATUS</td><td class="name">{"deviceType" : "1", "deviceState" : "1"}</td><td class="name">{@link DEVICETYPE} {@link DEVICESTATUS}</td><td class="description last">Will be called whenever there is change in device status</td></tr></table>
 * @namespace
 * @class
 */
var KNCallBackMgr = {
    /**
     * Method for setting up the callbacks.
     * @param callback {functionRef} callback function reference to receive callback event/notification from plugin.
     * @param callbackType {string} Check the predefined callback type in Plugin API documentation.
     * @returns Boolean
     *
     * @example
     * Receiving call status event :
     *
     * var mediaCallback = function(callStatusJson) {
         *
         *      var callStatus = callStatusJson.callStatus;
         *      var floorStatus = callStatusJson.floorStatus;
         *      ...
         * }
     *
     * KNCallMgrCBK.setupCallBack(mediaCallback, "CALLSTATUS");
     */
    setupCallBack : function(callback, callbackType) {
        return plugin().setupCallBack(callback, callbackType);
    }
};

/**
 * KNCntGrpMgr class defines Contact and Group Management APIs
 * @namespace
 * @class
 */
var KNCntGrpMgr = {
    /**
     * Method for fetching logged in user contacts.
     * @returns contactsJson {JSON}
     *
     * @example
     * var contactsJson = KNCntGrpMgr.fetchContacts();
     *
     * Response JSON Format:
     *
     * var contacts =  [
     *  {"name": "Bill", "mdn": "12146209832", "availabilityStatus": "0"},
     *  {"name": "James", "mdn": "12146209833", "availabilityStatus": "1"},
     *  {"name": "Ingrid", "mdn": "12146209834", "availabilityStatus": "2"}
     * ];
     *
     * contactsJson[0].name;
     * contactsJson[0].mdn;
     * contactsJson[0].availabilityStatus;
     *
     */
    fetchContacts : function() {
        return plugin().fetchContacts();
    },
    /**
     * Method for fetching logged in user groups.
     * @returns groupsJson {JSON}
     *
     * @example
     * var groupsJson = KNCntGrpMgr.fetchGroups();
     *
     * Response JSON Format:
     *
     * var groups = [
     *  { "name": "Group1", "groupId": "23478236787",
         *    "contacts" : [
         *                  {"name": "John", "mdn": "12146209833", "availabilityStatus": "1"},
         *                  {"name": "Daisy", "mdn": "12146209834", "availabilityStatus": "2"}
         *                ]
         *  }
     * ];
     *
     * groups[0].name;
     * groups[0].groupId;
     * groups[0].contacts[0].name;
     *
     */
    fetchGroups   : function() {
        return plugin().fetchGroups();
    },
    /**
     * Method for fetching logged in user specific group based on group ID.
     * @param groupIdJson {JSON} specific group ID
     * @returns groupsJson {JSON}
     *
     * @example
     * Input Json:
     *  var json  =  {
     *      "groupId" : "jasda7s66q271322"
     *  }
     *
     * Output Json:
     *  var groupsJson = { "name": "Group1",
     *  "contacts" : [
     *      {"name": "John", "mdn": "12146209833", "availabilityStatus": "1"},
     *      {"name": "Daisy", "mdn": "12146209834", "availabilityStatus": "2"}
     *    ]
     *  };
     *
     * var groupsJson = KNCntGrpMgr.fetchGroupDetail(json);
     *
     * groupsJson.name;
     * groupsJson.groupId;
     * groupsJson.contacts[0].name;
     *
     */
    fetchGroupDetail   : function(json) {
        return plugin().fetchGroupDetail(json);
    },
    /**
     * Method for fetching logged in user all group list.
     * @returns groupListJson {JSON}
     *
     * @example
     * var groupListJson = KNCntGrpMgr.fetchGroupList();
     *
     * Response JSON Format:
     *
     * var groupList = [
     *  { "name": "Group1", "groupId": "23478236787", "memberCount": "2"},
     *  { "name": "Group2", "groupId": "12345678900", "memberCount": "5"},
     *  { "name": "Group3", "groupId": "34556636787", "memberCount": "9"},
     * ];
     *
     * groups[0].name;
     * groups[0].groupId;
     *
     */
    fetchGroupList   : function() {
        return plugin().fetchGroupList();
    }
};

/**
 * KNCallMgr class defines APIs related to PoC Call Management.
 * @namespace
 * @class

 */
var KNCallMgr = {
    /**
     * This API is used by web user to initiate a one to one private PoC call with a contact
     * or any phone number or to a list of contacts or phone numbers
     * <br/>

     * @param callJson {JSON} Json object with one or more phone number(s)
     * @returns void and asynchronous callback. Refer: {@link CALLSTATUS}, {@link FLOORSTATUS}, {@link KNCallBackMgr}
     *
     * @example
     * var callJson = [
     *  {"phoneNumber" : "12146209832"},
     *  {"phoneNumber" : "12146209835"}
     * ];
     *
     * KNCallMgr.makeCall(callJSon)
     *
     */
    makeCall : function(callJSonObj) {
        plugin().makeCall(callJSonObj);
    },

    /**
     * This API is used by web user to end an ongoing call.
     * @returns Boolean and asynchronous callback. Refer: {@link CALLSTATUS}, {@link KNCallBackMgr}
     *
     * @example
     * KNCallMgr.endcall()
     */
    endcall : function() {
        return plugin().endCall();
    },

    /**
     * This API is used to initiate a group call identified by the groupId.
     * @param groupIdJson {JSON} Json object with group ID
     * @returns Boolean and asynchronous callback. Refer: {@link CALLSTATUS}, {@link FLOORSTATUS}, {@link KNCallBackMgr}
     *
     * @example
     * var groupIdJson = {
         *      "groupId" : "23478236787"
         * }
     *
     * KNCallMgr.makeGroupCall(groupIdJson)
     */
    makeGroupCall : function(groupIdJson) {
        return plugin().makeGroupCall(groupIdJson);
    },

    /**
     * This API is used for acquiring the floor to talk.
     * @returns Boolean and asynchronous callback. Refer: {@link FLOORSTATUS}, {@link KNCallBackMgr}
     *
     * @example
     * KNCallMgr.acquireFloor()
     */
    acquireFloor : function() {
        return plugin().acquireFloor();
    },

    /**
     * This API is used for releasing the floor to allow other participants to talk.

     * @returns Boolean and asynchronous callback. Refer: {@link FLOORSTATUS}, {@link KNCallBackMgr}
     *
     * @example
     * KNCallMgr.releaseFloor()
     */
    releaseFloor : function() {
        return plugin().releaseFloor();
    },


    //Added by Rajendra Kumar. A
    sendPW : function() {
        return plugin().sendPW();    
    },

    /**
     * This API is used for initiating IPA by the web user to any of the contact.

     * @param IPAJson {JSON} Json object with phone number
     * @returns Boolean and asynchronous callback. Refer: {@link IPASTATUS}, {@link KNCallBackMgr}
     * @example
     * var IPAJson = {
         *      "phoneNumber" : "12146209832"
         * }
     *
     * KNCallMgr.sendIPA(IPAJson)
     */
    sendIPA : function(IPAJson) {
        return plugin().sendIPA(IPAJson);

    }
};

/**
 * KNHotKeyStorage is global array, that store hot key in JSON format:
 * @private
 */
var KNHotKeyStorage = [];

/**
 * KNHotKeyHandler can be used to register and unregister hot keys for Plugin API
 * @namespace
 * @class
 */
var KNHotKeyHandler = {

    hasHotKeyRegistered: function (jsonHotKey) {
        var len;
        len = KNHotKeyStorage.length;

        if (len < 1 || len == undefined) return -1;

        for (i = 0; i < len; i++) {
            if (jsonHotKey["ctrl"] == KNHotKeyStorage[i]["ctrl"] &&
                    jsonHotKey["shift"] == KNHotKeyStorage[i]["shift"] &&
                    jsonHotKey["alt"] == KNHotKeyStorage[i]["alt"] &&
                    jsonHotKey["keyCode"] == KNHotKeyStorage[i]["keyCode"]) {
                return i;
            }
        }
        return -1;
    },

    hasFunctionRegistered: function (apiName) {
        var len;
        len = KNHotKeyStorage.length;

        if (len < 1 || len == undefined) return -1;

        for (i = 0; i < len; i++) {
            if (apiName == KNHotKeyStorage[i]["functionName"]) {
                return i;
            }
        }
        return -1;
    },

    /**
    * Method for registering hot keys.
    * @param jsonHotKey {JSON} json object as mentioned in example section.
    * @param apiName {String} Plugin API to register refer: {@link PLUGINAPI}.
    * @example
    * Registering Ctrl-A for Acquire Floor
    * var jsonHotKey  =  {
    *    "ctrl" : "true", "shift" : "false", "alt" : "false", "keyCode" : "65"
    * }
    * var apiName = PLUGINAPI.ACQUIREFLOOR
    * KNHotKeyHandler.registerHotKey(jsonHotKey, apiName);
    *
    * @returns Boolean
    */
    registerHotKey: function (jsonHotKey, apiName) {
        //validation on inputs
        if ((jsonHotKey["ctrl"] == "" || jsonHotKey["ctrl"] == undefined) ||
            (jsonHotKey["shift"] == "" || jsonHotKey["shift"] == undefined) ||
            (jsonHotKey["alt"] == "" || jsonHotKey["alt"] == undefined) ||
            (jsonHotKey["keyCode"] == "" || jsonHotKey["keyCode"] == undefined) ||
            (apiName == undefined || apiName == ""))
            return false;

        var index = -1;
        var len = KNHotKeyStorage.length;

        if(len > 0) {
            //check whether given hot keys already registered.
            index = KNHotKeyHandler.hasHotKeyRegistered(jsonHotKey);
            if (index != -1) {
                console.log("Given hot key has already been registered with function " + KNHotKeyStorage[index]["functionName"]);
                return false;
            }
            //check whether given function already registered
            index = KNHotKeyHandler.hasFunctionRegistered(apiName);

            //given registered key is new, so registered it at the end of KNHotKeyStorage array
            index = (index == -1) ? KNHotKeyStorage.length : index;
        }
        index = (index == -1) ? 0 : index;

        jsonHotKey.functionName = apiName;
        KNHotKeyStorage.splice(index, 1, jsonHotKey);

        return true;
    },

    /**
    * Method for unregistering hot keys.
    * @param apiName {String} Plugin API to register refer: {@link PLUGINAPI}.
    * @example
    *
    * var apiName = PLUGINAPI.ACQUIREFLOOR
    * KNHotKeyHandler.unregisterHotKey(PLUGINAPI.ACQUIREFLOOR);
    *
    * @returns Boolean
    */
    unregisterHotKey: function (apiName) {
        //validation on inputs
        if ((apiName == undefined || apiName == "")) return false;

        var len = KNHotKeyStorage.length;
        if (len < 1) return false;

        var index = KNHotKeyHandler.hasFunctionRegistered(apiName);
        if (index == -1) return false;

        KNHotKeyStorage.splice(index, 1);
        return true;
    },

    /**
    * Method for handling hot keys
    * @param jsonHotKey {JSON}  Json object as mentioned below
    * @example
    *
    * document.onkeydown = function(evt) {
    *           evt = evt || window.event;
    *           var json = {"ctrl" : (evt.ctrlKey).toString(), "shift" : (evt.shiftKey).toString(), "alt" : (evt.altKey).toString(), "keyCode" : (evt.keyCode).toString()};
    *           console.log(JSON.stringify(json));
    *           KNHotKeyHandler.handleHotKey(json);
    * };
    *
    * @returns Boolean
    */
    handleHotKey: function (jsonHotKey) {
        //validation on inputs
        if ((jsonHotKey["ctrl"] == "" || jsonHotKey["ctrl"] == undefined) ||
            (jsonHotKey["shift"] == "" || jsonHotKey["shift"] == undefined) ||
            (jsonHotKey["alt"] == "" || jsonHotKey["alt"] == undefined) ||
            (jsonHotKey["keyCode"] == "" || jsonHotKey["keyCode"] == undefined))
            return false;

        var len = KNHotKeyStorage.length;
        if (len < 1) return false;

        var index = KNHotKeyHandler.hasHotKeyRegistered(jsonHotKey);
        if (index == -1) return false;

        switch (KNHotKeyStorage[index]["functionName"]) {
            case PLUGINAPI.ACQUIREFLOOR:
                KNCallMgr.acquireFloor();
                return true;
            case PLUGINAPI.RELEASEFLOOR:
                KNCallMgr.releaseFloor();
                return true;
            case PLUGINAPI.ENDCALL:
                KNCallMgr.endcall();
                return true;
            default:
                break;
        }
        return false;
    }
};

/**
 * KNUtil class is related to plugin installation and are private.
 * @namespace
 * @class
 * @private
 */
var KNUtil = {
    /**
     * This API is used downloading plugin.
     * @private
     * @returns Boolean
     */
    setplugin : function() {
        plugin = function() {
            if(isWebRTC==true)
            {
                if(webrtcPlugin == null)
                {
                    webrtcPlugin = new Kodiakplugin();
                }
                return webrtcPlugin; 
            }
            else
            {
               return document.getElementById('kn-plugin'); 
            }
        };
        //plugin = new plugin(); 
    },
    /**
         * This API for downloading the plugin.
         * @private
         * @returns void
     */
    downloadPlugin: function(){
            var r = confirm("Do you want to install  Web Poc Plugin?");
            if (r == true) {
                 var win = window.open(defaultPluginURL+"plugin/KWP.msi", '_self');
                 win.focus();
             }
    },
    /**
     * This API is used to load the plugin.
     loadPlugin}
     * @private
     * @returns Boolean
     */
    loadPlugin    : function() {
        if(isWebRTC == false)
        {
        var obj = document.createElement("object");
        obj.setAttribute("id", "kn-plugin");
        obj.setAttribute("width", "0");
        obj.setAttribute("height", "0");

        //Add <param> node(s) to <object>
        var param_knplugin = document.createElement("param");
        param_knplugin.setAttribute("name", "onload");
        param_knplugin.setAttribute("value", "KNUtil.echo");
        obj.appendChild(param_knplugin);

        var param_pid = document.createElement("param");
        param_pid.setAttribute("name", "pluginID");
        param_pid.setAttribute("value", this.generatePluginID());
        obj.appendChild(param_pid);

        obj.setAttribute("type", "application/x-kwp");
        var target_element = document.body;
        if(typeof (target_element) == "undefined" || target_element == null) {
            console.log("return false");
            return SETUPSTATUS.UNKNOWN;
        }

        if(this.isIE()){
            console.log("Browser IE");
            target_element.appendChild(obj);
            this.setplugin();
            if(this.isPluginInstalledIE()){
                if(this.isInstanceRunning()){
                    return SETUPSTATUS.PLUGIN_ALREADY_RUNNING;
                }
            }else{
                this.downloadPlugin();
                return SETUPSTATUS.PLUGIN_NOT_INSTALLED;
            }
        } else {
            console.log("Browser Not IE");
            target_element.appendChild(obj);
            this.setplugin();
            if(this.isPluginInstalledNotIE() && !this.isPluginBlockedNotIE()){
                if(this.isInstanceRunning()){
                    return SETUPSTATUS.PLUGIN_ALREADY_RUNNING;
                }
            } else if(!this.isPluginInstalledNotIE()){
                this.downloadPlugin();
                return SETUPSTATUS.PLUGIN_NOT_INSTALLED  ;
            } else if(this.isPluginBlockedNotIE()){
                return SETUPSTATUS.PLUGIN_IS_BLOCKED  ;
            }
        }
        }
        else
        {
           this.setplugin(); 
        }
        return SETUPSTATUS.SUCCESS;
    },

    /**
     * This API is used for checking the number of plugin instances running.
     * Refer to this as {@link KNUtil.isInstanceRunning}
     * @private
     * @returns Boolean
     */
    isInstanceRunning    : function() {
            var isInstanceRunning = plugin().isInstanceRunning();
            console.log("isInstanceRunning="+isInstanceRunning);
            return isInstanceRunning;
    },
    /**
     * This API is used for generating plugin instances identifier.
     * Refer to this as {@link KNUtil.generatePluginID}
     * @private
     * @returns string
     */
    generatePluginID : function() {
            return Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
    },
    /**
     * This API is used to log the installer plugin version.
     * Refer to this as {@link KNUtil.echo}
     * @private
     * @returns void
     */
    echo          : function() {
        console.log(plugin().version);
    },

    isPluginInstalledNotIE :function() {
        if (navigator.mimeTypes["application/x-kwp"]) {
            return true;
        } else {
            return false;
        }
    },

    isPluginBlockedNotIE :function() {
         if(eval("plugin().valid")) {
             return false;
         } else {
             return true;
         }
    },

    isPluginInstalledIE :function(){
        if(!eval("plugin().valid")) {
          return false;
        } else {
          console.log("installPlugin: Plugin exists");
          return true;
        }
      },

    isIE: function(){
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        return isIE;
    }

};





