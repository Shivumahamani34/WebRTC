
var contactJson = [
                            {"name": "SJBIT1",  "mdn": "SJBIT1", "availabilityStatus": CONTACTAVAILABILITYSTATUS.AVAILABLE},
                            {"name": "SJBIT2",  "mdn": "SJBIT2", "availabilityStatus": CONTACTAVAILABILITYSTATUS.AVAILABLE}/*,
                            {"name": "Mobile-WebRTC-S5_02", "mdn": "121510000002", "availabilityStatus": CONTACTAVAILABILITYSTATUS.AVAILABLE},
							{"name": "Mobile-WebRTC-S5_01", "mdn": "121510000001", "availabilityStatus": CONTACTAVAILABILITYSTATUS.AVAILABLE}
                 */ ];

var ContactManagement = function ContactManagement()
{
    this.name = "";
}

ContactManagement.prototype.fetchContacts = function(mdn)
{
    var self=this;
    this.name = mdn;
    var xmlhttp;
    /*if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            console.log(xmlhttp.responseText);
            //return xmlhttp.responseText;
            //var courseDef = x2js.xml_str2json(xmlhttp.responseText);
            //console.log(JSON.stringify(courseDef));
            contactJson = {name: "David Bowie", mdn: "919955008002", "availabilityStatus": "1"};
        }
        else
        {
            console.log("Contact Management  :"  +  xmlhttp.readyState +  "  " + xmlhttp.status);
        }
    }
    var url = "https://" + xcapServer + "/kodiak-poc/kn-corp-resource-lists/users/tel:+" + mdn + "/index";*/
    //xmlhttp.open("GET",url,false);
    //xmlhttp.withCredentials = true;
    //xmlhttp.send();
    return contactJson;
}

ContactManagement.prototype.updatePresence = function(contactJson)
{
}

ContactManagement.prototype.addContact = function(mdn)
{
    var self=this;
    var xmlhttp;
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            console.log(xmlhttp.responseText);
            //return xmlhttp.responseText;
            //var courseDef = x2js.xml_str2json(xmlhttp.responseText);
            //console.log(JSON.stringify(courseDef));
            contactJson = {name: "David Bowie", mdn: "919955008002", "availabilityStatus": "1"};
        }
        else
        {
            console.log("Contact Management  :"  +  xmlhttp.readyState +  "  " + xmlhttp.status);
        }
    }

    var url = "https://" + xcapServer + "/kodiak-poc/resource-lists/users/tel:+" + mdn + "/index/~~/resource-lists/list[@name=%22oma_pocbuddylist%22]/entry[@uri=%22tel:+919955008001%22]";
    var contentBody = "<entry uri=\"tel:+919955008001\"><display-name>webRTC Client1</display-name></entry>"

    var owner_mdn = "tel:+" + mdn;

    xmlhttp.open("PUT",url,false);
    xmlhttp.withCredentials = true;
    xmlhttp.setRequestHeader("Content-type","application/xcap-el+xml;charset=UTF-8");
    xmlhttp.setRequestHeader("X-XCAP-Asserted-Identity", owner_mdn);
    //xmlhttp.setRequestHeader("Content-length", contentBody.length);
    xmlhttp.send(contentBody);
    return "";
}


ContactManagement.prototype.getSelfName = function(mdn)
{
    var self =this;
    this.name = mdn;
    var xmlhttp;

    /*if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            var courseDef = x2js.xml_str2json(xmlhttp.responseText);
            self.name = courseDef["subscriber-config"]["subscriber-name"];
            self.mdn = courseDef["subscriber-config"]["mdn"];
        }
        else
        {
            console.log("Contact Management  :"  +  xmlhttp.readyState +  "  " + xmlhttp.status);
        }
    }
    var url = "https://" + xcapServer + "/kodiak-poc/kn-subscriber-config/users/tel:+" + mdn + "/index";*/

    //xmlhttp.open("GET",url,false);
    //xmlhttp.withCredentials = true;
    //xmlhttp.send();

    return this.name;
}

