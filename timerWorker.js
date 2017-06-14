var interval;
var callbackInstance;


this.onmessage = function(e){
  switch(e.data.command){
    case 'start':
                callbackInstance = e.data.config.callBack;
                interval = setInterval(function(){
                    self.postMessage(callbackInstance);
                }, 60000);
      break;
    case 'stop':
            clearInterval(interval);
      break;
  }
};

/*self.addEventListener('message', function(e)
{
    switch (e.data.command) 
    {
        case 'start':
            break;
        case 'stop':
            break;
    };
}, false);*/
