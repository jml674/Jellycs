var LOCAL_STORAGE_BADGE_CONTENT="htmlBadgesContent";
var jellycs = jellycs || {};
jellycs.DOMAIN="www.xosara.com";
jellycs.PROTOCOL="http://";
jellycs.UTM='?utm_campaign=' + jellycs.DOMAIN + '&utm_medium=chrome-addon&campaign=chrome-addon';



jellycs.monitor = {
  BADGES_CONTENT_POLLING_MNS:1,
  htmlBadgeContent:"",
  init: function() {
     var that = this;
     jellycs.GAMES.init();
     chrome.alarms.create("refreshBadgesContent", {when: 100,periodInMinutes : this.BADGES_CONTENT_POLLING_MNS});
     chrome.alarms.onAlarm.addListener(function(alarm) {
           if (alarm.name == "refreshBadgesContent") jellycs.monitor.refresh();
        });
  },
  refresh:function() {
    console.log("Refreshing cache");
    jellycs.GAMES.refresh();
  },
};

jellycs.GAMES = {
   MAX_GAMES:"8",
   HTML:"",
   htmlString : "",
   init: function() {
      this.HTML = jellycs.PROTOCOL+ jellycs.DOMAIN+ "/addon/json/"+this.MAX_GAMES+"/index.html";
      chrome.storage.local.get(LOCAL_STORAGE_BADGE_CONTENT,this.init_next);
      chrome.extension.onConnect.addListener(function(port) {
           console.debug("Connected ....."+port.name);
           port.onMessage.addListener(function(msg) {
              if (port.name == "badgeContentPopupShowing")
              {
                 console.debug("message received "+ msg);
                 port.postMessage(jellycs.GAMES.htmlString);
              }
           });
          });
   },
   init_next : function(html_string) {
      if (html_string == "")
      {
         jQuery.ajax({
            url: this.HTML,
            dataType : "json",
            success: this.success});
      }
    },
    refresh : function(html_string) {
         jQuery.ajax({
            url: this.HTML,
            dataType : "json",
            success: this.success});
    },
    success: function(data, text, xhr) {
      var html_string;
      if (data["html"].length != 0)
      {
        html_string = data["ulTemplate"]["ul"][0];
        for(var i=0;i<data["html"].length;i++)
        {
          html_string += data["ulTemplate"]["li"][0];
          html_string += data["html"][i];
          html_string += data["ulTemplate"]["li"][1];
        }
        html_string+=data["ulTemplate"]["ul"][1];
        //chrome.storage.local.set({jellycs.GAMES.LOCAL_STORAGE_BADGE_CONTENT: html_string},function(){});
        chrome.storage.local.set({LOCAL_STORAGE_BADGE_CONTENT : html_string},function(){});
        jellycs.GAMES.htmlString = html_string;
        
      }      
      console.info("Data refreshed...");
    },

};

jellycs.monitorTabs = {
  sitesDefs: [{"function":"function1","sites":[{"url":"www.xosara.com"},{"url":"http://www.enjoydressup.com/"}]},{"function":"function2","sites":[{"url":"jellycs.com"}]}],
  init: function() {
     chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {jellycs.monitorTabs.changed(tabId, changeInfo, tab);}) ;
  },
  changed: function(tabId,changeInfo,tab) {
    if (changeInfo.status == "complete")
    {

       var functionCode=this.getFunctionCode(tab.url);
       console.log("changed: function to call: "+functionCode);

       if (jellycs.functions[functionCode])
          jellycs.functions[functionCode]();
       else
          console.error("no function to call for"+url);
       
    }
    
  },
  getFunctionCode:function(url) {
     var found=false;
     var result = "";
     for (var i=0;i<this.sitesDefs.length;i++)
     {
        var sites = this.sitesDefs[i]["sites"];
        var function_string = this.sitesDefs[i]["function"];
        console.log("function_string="+function_string);
        console.log("length="+sites.length);
        
        for (var j=0;j<sites.length;j++)
        {
          var reg=new RegExp(sites[j]["url"]+".*");
          if (reg.test(url))
          {
            result = function_string;
            found = true;
            break;
          }
        }
        if (found) break;
     }
     return result;
  }
};

jellycs.monitor.init();
jellycs.monitorTabs.init();