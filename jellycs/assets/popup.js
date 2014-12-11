/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var jellycs = jellycs || {};
jellycs.DOMAIN="www.xosara.com";
jellycs.PROTOCOL="http://";
jellycs.UTM='?utm_campaign=' + jellycs.DOMAIN + '&utm_medium=chrome-addon&campaign=chrome-addon';


jellycs.popup = {
  htmlString:"",
  init: function(){
    //console.log("jellycs.popup: init");    
    this.post();
  },
  changeDisplay: function (html_string) {
      this.htmlString = html_string;
      console.log("changeDisplay"+ html_string);

      jQuery('.games main').html(this.htmlString);
         
  },
  post: function() {
      var port = chrome.extension.connect({name: "badgeContentPopupShowing"});
      port.postMessage("Hi BackGround");
      port.onMessage.addListener(function(msg) {
            console.log("message received"+ msg);
            jellycs.popup.changeDisplay(msg);
         });
  },
};

var TOOLS = {
    init: function() {
   TOOLS.toggleSearchText();
   TOOLS.submitSearch();
   TOOLS.appendUtmTagsOnClick();
    },
    toggleSearchText: function() {

   if (jQuery('.searchText').length <= 0)
   {
       return false;
   }

   window.originalText = jQuery('.searchText').val();

   jQuery(document).on('focusin focusout mousedown', '.searchText', function(event) {

       var search = jQuery('.searchText').val();

       if (event.type === 'focusin' || event.type === 'mousedown')
       {
      if (search === window.originalText)
      {
          jQuery('.searchText').val('');
      }
       }

       if (event.type === 'focusout')
       {
      if (search.length === 0)
      {
          jQuery('.searchText').val(window.originalText);
      }
       }

   });

    },
    submitSearch: function() {

   if (jQuery('#searchForm').length <= 0)
   {
       return false;
   }

   var submitUrl = jQuery('#searchForm').attr('action');
   var submitSearch = function(e) {
       e.preventDefault();

       var search = jQuery.trim(jQuery('.searchText').val().toLowerCase());
       var regex = /^[a-zA-Z0-9 ]+$/i;

       if (search.length === 0 || !regex.test(search) || search === window.originalText)
       {
      return false;
       }

       jQuery('.searchText').val(search);
       var searchText = jQuery('.searchText').val();
       chrome.tabs.create({url: submitUrl + searchText + jellycs.UTM});

       return true;
   };

   jQuery(document).on('keypress', '.searchText', function(e) {

       var code = e.charCode ? e.charCode : e.keyCode;

       if (code === 13)
       {
      return submitSearch(e);
       }

       return true;

   });
   jQuery(document).on('click', '.searchButton', submitSearch);

    },
    appendUtmTagsOnClick: function() {

   jQuery(document).on('click', 'a', function(e) {

       var href = jQuery(this).attr('href');

       jQuery(this).attr('href', href + jellycs.UTM);

   });
    }
};
var FBTOOLS = {
   init: function() {
      jQuery(document).on('click', '.fbClose', FBTOOLS.closeHint);
      jQuery(document).on('click', '.fbButton', FBTOOLS.share);
    },
   sendGaEvent: function(evAction) {
//   ga('send', 'event', 'Facebook', evAction);
    },
   share: function(e) {
      FBTOOLS.sendGaEvent('Addon - Share Button Clicked');
    }
};

jQuery(document).ready(function() {
    jellycs.popup.changeDisplay();
    TOOLS.init();
    FBTOOLS.init();
});

jellycs.popup.init();