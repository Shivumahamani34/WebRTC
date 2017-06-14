
var myService={};

var data= [];
var IPAData= [];
var userdata=[
		    {
		        id: 12,
		        firstName: "Desmond",
		        lastName: "Hence",
		        send:1,
		        user:0,
		        members:[{"name":"David"}]
            }
		];

var app = angular.module('myApp', ['datatables']);

//factory service
app.factory("myFactory",function($rootScope){
	myService.selectedContacts={};
	myService.selectedGroups={};
    myService.selectedMDN=[];
    myService.json;
    myService.contacts=[];
    myService.username="";
    myService.password="";
    myService.selfName="";
    myService.talkerInfo={};
    myService.floorStatus={};
    myService.onCall = false;

    myService.loginResponse=function(json){
        myService.json = json;
        myService.publishItem("login");
    }

    myService.callResponse=function(json){
        myService.json = json;
        myService.floorStatus = json;
        myService.publishItem("callstatus");
    }

    myService.talkerInfo=function(json)
    {
        myService.talkerInfo = json;
        myService.publishItem("talkerInfo");
    }

    myService.contactInfo=function(json)
    {
        myService.contacts = json;
        myService.publishItem("contactInfo");
        //myService.publishItem("IPA");
    }

    myService.selfName=function(json){
        myService.selfName = json;
        myService.publishItem("selfName");
    }

    myService.IPAAlert=function(json){
        myService.IPA = json;
        myService.publishItem("IPA");
    }

    myService.IPAStatus = function(json){
        myService.IPAStatus = json;
        myService.publishItem("IPASTATUS");
    }

    myService.ContactAvailStatus = function(json){
        myService.contactAvailStatusJson = json;
        myService.publishItem("CONTACTAVAILSTATUS");
    }

	myService.appendContact=function(contact){
		this.selectedContacts[contact.mdn]=contact;
        this.selectedMDN.push(contact.mdn);
		this.publishItem("contactReady");
	}

    myService.updateOnCallStatus=function(status)
    {
        this.onCall = status;
    }

	myService.deleteContact=function(contact){
		delete this.selectedContacts[contact.id];

        for(var nMDN=0;nMDN<this.selectedMDN.length;nMDN++)
        {
            if(this.selectedMDN[nMDN]==contact.mdn)
            {
               delete this.selectedMDN.splice(nMDN,nMDN+1);
               console.log("Selected MDN: " + this.selectedMDN);
            }
        }


		this.publishItem("contactReady");
	}

	myService.addAllContacts=function(contacts){
		this.selectedContacts=contacts;
		this.publishItem("contactReady");
	}

	myService.deleteAllContacts=function(){
		this.selectedContacts={};
		this.publishItem("contactReady");
	}
	myService.appendGroup=function(group){
		this.selectedGroups[group.id]=group;
		this.publishItem("groupReady");
	}
	myService.deleteGroup=function(group){
		delete this.selectedGroups[group.id];
		this.publishItem("groupReady");
	}

	myService.addAllGroups=function(groups){
		this.selectedGroups=groups;
		this.publishItem("groupReady");
	}

	myService.deleteAllGroups=function(){
		this.selectedGroups={};
		this.publishItem("groupReady");
	}

	myService.publishItem = function(msg,json) {
        $rootScope.$broadcast(msg,json);
    };

    var kodiakPoc    = KNPoC.setup();
    KNCallBackMgr.setupCallBack(myService.loginResponse,        "LOGIN");
    KNCallBackMgr.setupCallBack(myService.callResponse,         "CALLSTATUS");
    KNCallBackMgr.setupCallBack(myService.talkerInfo,           "TALKERINFO");
    KNCallBackMgr.setupCallBack(myService.IPAStatus,            "IPASTATUS");
    KNCallBackMgr.setupCallBack(myService.IPAAlert,             "IPAALERT");
    KNCallBackMgr.setupCallBack(myService.ContactAvailStatus,   "CONTACTAVAILABILITYSTATUS");

	return myService;
})

function loginHandler($scope, myFactory)
{
   $scope.$on('login', function(json)
   {
        if(myFactory.json.status==LOGINSTATUS.SUCCESS)
        {
            var knName       = KNPoC.getSelfName();
            myService.selfName(knName);

            var contactsJson = KNCntGrpMgr.fetchContacts();
            myService.contactInfo(contactsJson);

            //$('#myloaderModal').modal("hide");
        }

        console.log("LOGIN STATUS"  + JSON.stringify(myFactory.json));
   });
}


function callActivityCtrl($scope, myFactory)
{
	$scope.floorController = function()
	{
        if(document.getElementById('Call-Handle').textContent == "Call Activity")
        {
            var callJson = [{"phoneNumber": myFactory.selectedMDN[0]}];
            console.log("INFO: Call JSON" + JSON.stringify(callJson));
            KNCallMgr.makeCall(callJson);
        }
        else
        {
                if(document.getElementById('Call-Handle').textContent != "Dialing")
                {
                    if(myFactory.floorStatus.floorStatus == FLOORSTATUS.GRANTED)
                    {
                         KNCallMgr.releaseFloor();
                    }
                    else if(myFactory.floorStatus.floorStatus == FLOORSTATUS.IDLE)
                    {
                        KNCallMgr.acquireFloor();
                    }
                    else if(myFactory.floorStatus.floorStatus == FLOORSTATUS.TAKEN)
                    {
                        console.log("INFO: CANNOT ACQUIRE FLOOR.....");
                    }
                }
                else
                {
                    console.log("INFO: CALL IN PROGRESS");
                }

        }
	}

    $scope.endCall = function()
    {
        KNCallMgr.endcall();
    }

    $scope.$on('contactReady', function()
    {
        //KNCallMgr.sendPW();
    });

    $scope.$on('callstatus', function(json){
                console.log("LOGIN STATUS"  + JSON.stringify(myFactory.json));
                if(myFactory.json.callStatus==CALLSTATUS.FLOOR_CHANGED)
                {
                       if(myFactory.json.floorStatus==FLOORSTATUS.GRANTED)
                       {
                            $scope.floorStatus = FLOOR_STATUS.GRANTED;
                            document.getElementById('call_icon').src='./image/talk.png';
                       }
                       else if(myFactory.json.floorStatus==FLOORSTATUS.TAKEN)
                       {
                            $scope.floorStatus = FLOOR_STATUS.TAKEN;
                            document.getElementById('call_icon').src='./image/wait.png';
                       }
                       else if(myFactory.json.floorStatus==FLOORSTATUS.IDLE)
                       {
                            $scope.floorStatus = FLOOR_STATUS.IDLE;
                            document.getElementById('call_icon').src='./image/idle.png';
                            document.getElementById('talker-name').textContent = "None";
                            document.getElementById('talker-mdn').textContent  = "None";
                       }
                }
                else
                {
                       if(myFactory.json.callStatus==CALLSTATUS.CONNECTED)
                       {
                               document.getElementById('Call-Handle').textContent = "Call Connected";

                               if(myFactory.username=="SJBIT1")
                               {
									document.getElementById('talker-name').textContent = "SJBIT2";
                               		document.getElementById('talker-mdn').textContent  = "SJBIT2";
							   }
							   else if(myFactory.username=="SJBIT2")
							   {
									document.getElementById('talker-name').textContent = "SJBIT1";
                               		document.getElementById('talker-mdn').textContent  = "SJBIT1";
							   }

                       }
                       if(myFactory.json.callStatus==CALLSTATUS.DIALING)
                       {
                               document.getElementById('Call-Handle').textContent = "Dialing";
                       }
                       else if(myFactory.json.callStatus==CALLSTATUS.TERMINATED)
                       {
                                document.getElementById('Call-Handle').textContent = "Call Activity";
                       }
                       else if(myFactory.json.callStatus==CALLSTATUS.UNKNOWN)
                       {
                               document.getElementById('Call-Handle').textContent = "Call Activity";

                               $scope.floorStatus = FLOOR_STATUS.IDLE;
                               document.getElementById('call_icon').src='./image/idle.png';
                               document.getElementById('talker-name').textContent = "None";
                               document.getElementById('talker-mdn').textContent  = "None";

                               console.log("ERROR: CALL FAILURE");
                       }
                }

    });

    $scope.$on('talkerInfo', function(json){
        document.getElementById('talker-name').textContent = myFactory.talkerInfo.name;
        document.getElementById('talker-mdn').textContent  = myFactory.talkerInfo.mdn;
    });
}

function contactsCtrl1($scope, myFactory, DTOptionsBuilder, DTColumnBuilder) {
    $scope.reloadData = function() {
        $scope.dtOptions.reloadData();
    };
    $scope.changeData = function() {
        //$scope.dtOptions.sAjaxSource = 'data1.json';
    };

    //$scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(2);

    /*$scope.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('ID'),
        DTColumnBuilder.newColumn('Imae').withTitle(''),
        DTColumnBuilder.newColumn('id').withTitle(''),
        DTColumnBuilder.newColumn('firstName').withTitle('Name'),
    ];*/

    $scope.$on('contactInfo', function(json){
            $('#myloaderModal').modal("hide");
            data.push(myFactory.contacts);
            var scope = angular.element($("#contacts")).scope();
            scope.$apply(function() {
                scope.contacts = angular.copy(data);
            });
    });

    $scope.contactSelect=function(contact,e){
		if(e.target.checked)
        {
			$scope.contact_check_all=false;
			myFactory.appendContact(contact);
		}
		else
        {
			$scope.contact_check_all=false;
			myFactory.deleteContact(contact);
		}

	}
}


function contactsCtrl($scope, $http, myFactory, DTOptionsBuilder) {

    $scope.contacts = [];

	$scope.contacts = angular.copy(data);

    $scope.dtOptions = {
                                                paginationType: 'full_numbers',
                                                displayLength: 5,
                                                scrollY: "95px",
                                                scrollCollapse: false,
                                                paging: false
                                };


    $scope.sendIPA = function()
    {
        var ipaJson = {"phoneNumber": myFactory.selectedMDN[0]};
        KNCallMgr.sendIPA(ipaJson);
    };


    console.log("PROBLEM        :" + JSON.stringify(data));

	$scope.checkAll=function(){
		if($scope.contact_check_all == false){

			$scope.contact_check_all=true;
			$(".contact-check").prop('checked', true);

			var selectedContacts=$scope.contacts.reduce(function(obj, k) {

			  var key = Object.keys(k)[0]; //first property

			  obj[k[key]] = k;
			  return obj;
			}, {});
			myFactory.addAllContacts(selectedContacts);
		}
		else{
			$scope.contact_check_all=false;
			$(".contact-check").prop('checked', false);
			myFactory.deleteAllContacts();
		}

	}
	$scope.contactSelect=function(contact,e){
		if(e.target.checked)
        {
			$scope.contact_check_all=false;
			myFactory.appendContact(contact);
		}
		else
        {
			$scope.contact_check_all=false;
			myFactory.deleteContact(contact);
		}

	}

    /*$scope.loadPeople = function() {
        var httpRequest = $http({
            method: 'POST',
            url: '/echo/json/',
            data: mockDataForThisTest

        }).success(function(data, status) {
            $scope.people = data;
        });

    };*/

    $scope.$on('contactInfo', function(json){
            $('#myloaderModal').modal("hide");

			/*for(var i in myFactory.contacts)
		 	{
				if(myFactory.contacts[i].name == myFactory.username)
				{

				}
			}*/

            //data.push(myFactory.contacts);

            var scope = angular.element($("#contacts")).scope();
            scope.$apply(function()
            {
                scope.contacts = angular.copy(myFactory.contacts);
            });
    });

    $scope.$on('CONTACTAVAILSTATUS', function(json){
            var scope = angular.element($("#contacts")).scope();
            scope.$apply(function()
            {
                angular.forEach(scope.contacts,function(item)
                {
                       for(var nPresence=0; nPresence < myFactory.contactAvailStatusJson.length; nPresence++)
                       {
                            if(item.mdn==myFactory.contactAvailStatusJson[nPresence].mdn)
                            {
                                item.availabilityStatus = myFactory.contactAvailStatusJson[nPresence].availabilityStatus;
                                break;
                            }
                       }
                });
            });
    });
}

function usersCtrl($scope, $timeout, myFactory) {
	$scope.selectedGroups={};
    $scope.groups = [];
	$scope.groups = angular.copy(userdata);

	/*angular.forEach(userdata, function(usdata, key) {
		var udata=angular.copy(usdata);
		udata.active=false;
		udata.active=myFactory.chk(udata.active);
		var alerts=(udata.send==1)?"alert-success":"alert-danger";
		html1='<span class="glyphicon glyphicon-send '+alerts+'" aria-hidden="true"></span>';
		udata.send=html1;

		var alert1=(udata.user==1)?"alert-success":"alert-danger";
		html2='<span class="glyphicon glyphicon-user '+alert1+'" aria-hidden="true"></span>';
		udata.user=html2;

	  this.push(udata);
	},$scope.groups);*/


	$scope.checkAllGroup=function(){

		if($scope.group_check_all == false){

			$scope.group_check_all=true;
			//$(".grptoggle").prop('checked', true);

			$timeout(function() {
				angular.element($('.grptoggle').not(":checked")).trigger('click');
			  }, 10);

			//$(".grptoggle").trigger("click");

			if(Object.keys($scope.selectedGroups).length == 0){
				$scope.selectedGroups=$scope.groups.reduce(function(obj, k) {

				  var key = Object.keys(k)[0]; //first property

				  obj[k[key]] = k;
				  return obj;
				}, {});
			}


			myFactory.addAllGroups($scope.selectedGroups);



		}
		else{
			$scope.group_check_all=false;
			//$(".grptoggle").prop('checked', false);
			$timeout(function() {

				angular.element($('.grptoggle').filter(":checked")).trigger('click');
			  }, 10);

			myFactory.deleteAllGroups();

		}

	}
	$scope.showMembers=function(group,e){
		if($(e).is(':checked')){
			myFactory.appendGroup(group);


		}
		else{
			myFactory.deleteGroup(group);



		}

	}

    /*$scope.loadPeople = function() {
        var httpRequest = $http({
            method: 'POST',
            url: '/echo/json/',
            data: mockDataForThisTest

        }).success(function(data, status) {
            $scope.people = data;
        });

    };*/

}

function IPACtrl($scope, myFactory) {
	/*$scope.$on('contactReady', function()
    {
		$scope.selectedContacts=myFactory.selectedContacts;
	});
	$scope.$on('groupReady', function()
    {
		$scope.selectedGroups=myFactory.selectedGroups;
		console.log("group ready");
	});*/

    $scope.current_time=Date.now();
    $scope.notification={};


    $scope.dtOptions =
    {
            paginationType: 'full_numbers',
            displayLength: 5,
            scrollY: "95px",
            scrollCollapse: false,
            paging: false
    };


    $scope.$on('IPA', function()
    {
            IPAData.push(myService.IPA);
            var scope = angular.element($("#IPA")).scope();
            scope.$apply(function()
            {
                scope.IPAS=angular.copy(IPAData);
            });
    });

    $scope.$on('IPASTATUS', function()
    {
            //To Show a notification bar that the IPA is successfull.
            console.log("IPA Status   :" +  JSON.stringify(myFactory.IPAStatus));
            if(myFactory.IPAStatus.status==IPASTATUS.SUCCESS)
            {
                        var scope = angular.element($("#notification")).scope();
                        scope.$apply(function()
                        {
                            scope.notification.type="INFO: ";
                            scope.notification.body="   IPA SEND SUCCESS";
                            $("#notification").addClass('alert-danger');
                            $("#notification").addClass('in');
                        });
            }
            else if(myFactory.IPAStatus.status==IPASTATUS.FAILURE)
            {
                        var scope = angular.element($("#notification")).scope();
                        scope.$apply(function()
                        {
                            scope.notification.type="ERROR: ";
                            scope.notification.body="   IPA SEND FAILURE";
                            $("#notification").addClass('alert-danger');
                            $("#notification").addClass('in');
                        });

            }
    });
}

function selfDetialsController($scope, myFactory) {
    $scope.$on('selfName', function()
    {
        document.getElementById('subscriber-name').textContent = myFactory.selfName;
    });
}

function loginController($scope, myFactory)
{
                $scope.user={userName:"",passWord:""};
                $scope.submit_form = function(myForm)
                {
                    myFactory.username=$scope.user.userName;
                    myFactory.password=$scope.user.passWord;

                    $('#myloaderModal').modal({show:true,backdrop:"static",keyboard:false});
                    //$('#aendCall').addClass("disabled");


                    var loginJson  = { "userId" : myFactory.username, "accessToken" : "abcderfgh1234" };
                    var knPoc        = KNPoC.login(loginJson);
                }
}
