/*
 * trackevents
 * https://github.com/cookedapple/trackevents
 *
 * Copyright (c) 2013 cookedapple
 * Licensed under the MIT license.
 */

var hset = {
  'url' : 'localhost:57367/pixel.gif' //'localhost:3000/tracks'
}

h = Haywire = function(selector){
  var self = this,
      elements = null,
      activeEvents = {};

  if (selector == window) {
    elements = [window];
  } else {
    if ( typeof Sizzle != 'undefined' ){
      elements = Sizzle(selector);    
    } else if (typeof jQuery != 'undefined'){
      elements = jQuery(selector);
    } else {
      var element = document.getElementById(selector);
      if (element) {
        elements = [element];
      } else {
        elements = [];
      }
    }  
  }
  
  var on = function(events, callback){    
    activeEvents[selector] = activeEvents[selector] ? activeEvents[selector] : [];
    events = events.split(' ');
    activeEvents[selector] = activeEvents[selector].concat(events).unique();
    return h(true);
  },

  del = function(events){
    if ( ! activeEvents[selector] ){
      return h();
    }
    cleanAllEvents();
    events = events.split(' ');
    var j;
    for ( var i = 0, ii = events.length; i<ii; i++){
       j = activeEvents[selector].include(events[i]);
       activeEvents[selector].splice(j, 1);
    }
    attachEvents();
    return h();
  },
  key = function(key){
    myKey = key;     
    return h();
  }, 
  cleanAllEvents = function(){
    if ( ! activeEvents[selector] ) {
      return h();
    } 
    
    for (var i = elements.length - 1; i >= 0; i--) {                 
      for (var j = activeEvents[selector].length - 1; j >= 0; j--) {     
        elements[i].removeEventListener(activeEvents[selector][j], trackCbk, false);
      }
    }
  },
  attachEvents = function(){
    if ( ! activeEvents[selector] ) {
      return h();
    }
    for (var i = elements.length - 1; i >= 0; i--) {      
      for (var j = activeEvents[selector].length - 1; j >= 0; j--) {         
        if (window == selector && activeEvents[selector][j] == 'load') {
          window.onload = trackCbk;
          return;
        } else {
          elements[i].addEventListener(activeEvents[selector][j], trackCbk, false);  
        }        
      };      
    };
  },
  h = function(flush){
    if(flush){      
      cleanAllEvents();
      attachEvents();
    }    
    return {
      on: on,
      del: del,
      key: key
    };
  },  
  trackCbk = function(evt){  
      req.jsonp(getTrackingObject(evt), function(){        
        console.log('Tracked ok', arguments);
      });
  },
  getTrackingObject = function(e){    
    if (e.type.startsWith('mouse') || e.type.startsWith('click')) return evt.mouseEvent(e);
    if (e.type.startsWith('key')) return evt.keyEvent(e);      
    if (e.type.startsWith('load')) return evt.domLoadEvent(e);      
  },

  /* Haywire request  */
  req = {};

  req.urlprotocol = function(){
    return (("https:" == document.location.protocol) ? "https://" : "http://");  
    return (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");  
  };
  req.url = function(){   
    return hset.url; 
  };
  req.gif = function(){
    return req.url + '.gif';
  };
  req.jsonp = function(obj, callback){  
    var url = req.urlprotocol() + req.url();
    console.log(JSON.stringify(obj));
    
    Haywire.require(String.format("{0}?callback={1}&key={2}", url, req.createCallback(callback), Base64.encodeURI(JSON.stringify(obj))));
  };  
  req.createCallback = function(fn){
    if (typeof fn != 'function'){
      console.log('req.callback: fn is not a function');
      return;
    }
    var callbackName = 'hw' + utils.guid().replace(/-/g, '');
    window[callbackName] = fn;
    return callbackName;
  };

  /* Haywire utils */
  var utils = {};
  utils.guid = function (){
      var S4 = function () {
          return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
      };
      return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  };
  utils.reload = function(){
    window.location.href = window.location.href;
  };

  /* Haywire events management */
  var evt = {};
  evt.modifiersData = function(e){
    var mod = 0;
    if (e.metaKey)      mod += 1;
    if (e.ctrlKey)      mod += 2;
    if (e.shiftKey)     mod += 4;
    if (e.altKey)       mod += 8;
    if (e.altGraphKey)  mod += 16;
    return mod;
  },
  evt.domLoadEvent = function(e){
    return {
      browser : {
        codeName : navigator.appCodeName,
        name : navigator.appName,
        version : navigator.appVersion,
        cookie : navigator.cookieEnabled,
        language : navigator.language,
        platform : navigator.platform,
        language : navigator.language,
        product : navigator.product,
        useragent : navigator.userAgent
      }
    }
  },
  evt.elementData = function(e){
    console.log(e.srcElement.attributes);
    return {
        id: e.srcElement.id,
        name: e.srcElement.name,
        title: document.title,
        url: window.location.href,
      };
  },
  evt.commonData = function(e){
    return {
        hevt : {
          ts: event.timeStamp, 
          evt_t: e.type,
          class: e.srcElement.className,
          id: e.srcElement.id,
          name: e.srcElement.name,
          href: ((e.srcElement.hasOwnProperty('href') === true) ? e.srcElement.href : null),
          value: (e.srcElement.hasOwnProperty('type') === true ? e.srcElement.value : null),
          src: ((e.srcElement.hasOwnProperty('src') === true) ? e.srcElement.src : null)
        },
        m: evt.modifiersData(e),
        e: evt.elementData(e),
        coords: {}
      };
  },
  evt.mouseEvent = function(e){
    var ev = evt.commonData(e);
    ev.coords.x = e.x;
    ev.coords.y = e.y;  
    return ev;  
  },
  evt.keyEvent = function(e){
    var ev = evt.commonData(e);
    ev.coords.x = e.x;
    ev.coords.y = e.y;
    return ev; 
  };

  return h();
};

Haywire.require = function(url){
    var head = document.getElementsByTagName("head")[0]; 
    var script = document.createElement("SCRIPT"); 
    script.type = "text/javascript";   
    script.src = url;; 
    head.appendChild(script); 
};

/* Require JSON */
(function(){  
  if(typeof JSON == 'undefined')
    Haywire.require('/js/json2.js');
})();

/*
 * CocoonJS Protoypes
 * by Piero Bozzolo (2011-2012)
 * cocoonjs.piero.bozzolo.name
 */
Array.prototype.first=function(){return this[0]};Array.prototype.last=function(){return this[this.length-1]};Array.prototype.include=function(a,b){var c=this.length;var b=b?b<0?Math.max(0,c+b):b:0;for(;b<c;b++){if(b in this&&this[b]===a)return b}return-1};Array.prototype.unique=function(){var a=this;var b=[];for(var c=a.length;c--;){var d=a[c];if(b.include(d)===-1){b.unshift(d)}}return b};String.format=function(){var a=arguments[0];for(var b=0;b<arguments.length-1;b++){var c=new RegExp("\\{"+b+"\\}","gm");a=a.replace(c,arguments[b+1])}return a};String.prototype.startsWith=function(a){return this.substr(0,a.length)===a};
/*Mozilla addEventListener fix for old browser*/if(!Element.prototype.addEventListener){var oListeners={};function runListeners(a){if(!a){a=window.event}for(var b=0,c=0,d=oListeners[a.type];c<d.aEls.length;c++){if(d.aEls[c]===this){for(b;b<d.aEvts[c].length;b++){d.aEvts[c][b].call(this,a)}break}}}Element.prototype.addEventListener=function(a,b){if(oListeners.hasOwnProperty(a)){var c=oListeners[a];for(var d=-1,e=0;e<c.aEls.length;e++){if(c.aEls[e]===this){d=e;break}}if(d===-1){c.aEls.push(this);c.aEvts.push([b]);this["on"+a]=runListeners}else{var f=c.aEvts[d];if(this["on"+a]!==runListeners){f.splice(0);this["on"+a]=runListeners}for(var g=0;g<f.length;g++){if(f[g]===b){return}}f.push(b)}}else{oListeners[a]={aEls:[this],aEvts:[[b]]};this["on"+a]=runListeners}};Element.prototype.removeEventListener=function(a,b){if(!oListeners.hasOwnProperty(a)){return}var c=oListeners[a];for(var d=-1,e=0;e<c.aEls.length;e++){if(c.aEls[e]===this){d=e;break}}if(d===-1){return}for(var f=0,g=c.aEvts[d];f<g.length;f++){if(g[f]===b){g.splice(f,1)}}}}
/*Cross browser XHR*/ if(window.XMLHttpRequest){Haywire.xhr=new XMLHttpRequest}else{Haywire.xhr=new ActiveXObject("Microsoft.XMLHTTP")}
/* Base64.js https://github.com/dankogai/ */(function(a){"use strict";var b;if(typeof module!=="undefined"&&module.exports){b=require("buffer").Buffer}var c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var d=function(a){var b={};for(var c=0,d=a.length;c<d;c++)b[a.charAt(c)]=c;return b}(c);var e=String.fromCharCode;var f=function(a){var b=a.charCodeAt(0);return b<128?a:b<2048?e(192|b>>>6)+e(128|b&63):e(224|b>>>12&15)+e(128|b>>>6&63)+e(128|b&63)};var g=function(a){return a.replace(/[^\x00-\x7F]/g,f)};var h=function(a){var b=[0,2,1][a.length%3],d=a.charCodeAt(0)<<16|(a.length>1?a.charCodeAt(1):0)<<8|(a.length>2?a.charCodeAt(2):0),e=[c.charAt(d>>>18),c.charAt(d>>>12&63),b>=2?"=":c.charAt(d>>>6&63),b>=1?"=":c.charAt(d&63)];return e.join("")};var i=a.btoa||function(a){return a.replace(/[\s\S]{1,3}/g,h)};var j=b?function(a){return(new b(a)).toString("base64")}:function(a){return i(g(a))};var k=function(a,b){return!b?j(a):j(a).replace(/[+\/]/g,function(a){return a=="+"?"-":"_"})};var l=function(a){return k(a,true)};var m=/[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}/g;var n=function(a){return e(a.length<3?(31&a.charCodeAt(0))<<6|63&a.charCodeAt(1):(15&a.charCodeAt(0))<<12|(63&a.charCodeAt(1))<<6|63&a.charCodeAt(2))};var o=function(a){return a.replace(m,n)};var p=function(a){var b=a.length,c=b%4,f=(b>0?d[a.charAt(0)]<<18:0)|(b>1?d[a.charAt(1)]<<12:0)|(b>2?d[a.charAt(2)]<<6:0)|(b>3?d[a.charAt(3)]:0),g=[e(f>>>16),e(f>>>8&255),e(f&255)];g.length-=[0,0,2,1][c];return g.join("")};var q=a.atob||function(a){return a.replace(/[\s\S]{1,4}/g,p)};var r=b?function(a){return(new b(a,"base64")).toString()}:function(a){return o(q(a))};var s=function(a){return r(a.replace(/[-_]/g,function(a){return a=="-"?"+":"/"}).replace(/[^A-Za-z0-9\+\/]/g,""))};a.Base64={atob:q,btoa:i,fromBase64:s,toBase64:k,utob:g,encode:k,encodeURI:l,btou:o,decode:s};if(typeof Object.defineProperty==="function"){var t=function(a){return{value:a,enumerable:false,writable:true,configurable:true}};a.Base64.extendString=function(){Object.defineProperty(String.prototype,"fromBase64",t(function(){return s(this)}));Object.defineProperty(String.prototype,"toBase64",t(function(a){return k(this,a)}))}}})(this)


