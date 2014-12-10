var LOCAL_STORAGE_BADGE_CONTENT="htmlBadgesContent";
var xosara = xosara || {};

xosara.monitor = {
  BADGES_CONTENT_POLLING_MNS:1,
  DOMAIN:"www.xosara.com",
  PROTOCOL:"http://",
  htmlBadgeContent:"",
  init: function() {
     var that = this;
     xosara.GAMES.init();
     chrome.alarms.create("refreshBadgesContent", {when: 100,periodInMinutes : this.BADGES_CONTENT_POLLING_MNS});
     chrome.alarms.onAlarm.addListener(function(alarm) {
           if (alarm.name == "refreshBadgesContent") xosara.monitor.refresh();
        });
  },
  refresh:function() {
    console.log("Refreshing cache");
    xosara.GAMES.refresh();
  },
};

xosara.GAMES = {
   MAX_GAMES:"8",
   HTML:"",
   UTM:'?utm_campaign=' + xosara.monitor.DOMAIN + '&utm_medium=chrome-addon&campaign=chrome-addon',
   htmlString : "",
   init: function() {
      this.HTML = xosara.monitor.PROTOCOL+ xosara.monitor.DOMAIN+ "/addon/json/"+this.MAX_GAMES+"/index.html";
      chrome.storage.local.get(LOCAL_STORAGE_BADGE_CONTENT,this.init_next);
      chrome.extension.onConnect.addListener(function(port) {
           console.debug("Connected ....."+port.name);
           port.onMessage.addListener(function(msg) {
              if (port.name == "badgeContentPopupShowing")
              {
                 console.debug("message received "+ msg);
                 port.postMessage(xosara.GAMES.htmlString);
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
        //chrome.storage.local.set({xosara.GAMES.LOCAL_STORAGE_BADGE_CONTENT: html_string},function(){});
        chrome.storage.local.set({LOCAL_STORAGE_BADGE_CONTENT : html_string},function(){});
        xosara.GAMES.htmlString = html_string;
        
      }      
      console.info("Data refreshed...");
    },

};

xosara.monitorTabs = {
  sitesDefs:{"function":"function1","other":[{"function":"function2","sites":[{"url":"www.xosara.com"}]}]},
  init: function() {
     chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {xosara.monitorTabs.changed(tabId, changeInfo, tab);}) ;
  },
  changed: function(tabId,changeInfo,tab) {
    if (changeInfo.status == "complete")
    {
       var functionCode=this.getFunctionCode(tab.url);
       switch (functionCode) {
          case "function1": alert("function1");
          break;
          case "function2": alert("function2");
          break;
          case "function3": alert("function3");
          break;  
          default: console.error("no function to call for"+url);
       }
    }
    
  },
  getFunctionCode:function(url) {
     var found=false;
     var result = this.sitesDefs["function"];
     for (var i=0;i<this.sitesDefs["other"].length;i++)
     {
        var sites = this.sitesDefs["other"][i]["sites"];
        var function_string = this.sitesDefs["other"][i]["function"];
        //console.log("function_string="+function_string);
        //console.log("length="+sites.length);
        
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

xosara.monitor.init();
xosara.monitorTabs.init();