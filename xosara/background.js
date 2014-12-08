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
           console.log("Connected ....."+port.name);
           port.onMessage.addListener(function(msg) {
              if (port.name == "badgeContentPopupShowing")
              {
                 console.log("message recieved "+ msg);
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
      console.log("Data refreshed...");
    },

};

xosara.monitor.init();