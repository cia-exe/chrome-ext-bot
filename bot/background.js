// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function toTimeStr(d) {
    return d.toLocaleTimeString('en-GB') + '.' + d.getMilliseconds();
}

function toDateTimeStr(d) {
    // note: We can enable 'Show timestamps' in Settings of Chrome DevTools as well!
    return d.toLocaleDateString() + '(' + toTimeStr(d) + ')';
}


//function test() {
//    let n = new Date();
//    console.log('fn:' + toTimeStr(n));
//    console.log('fn:' + toDateTimeStr(n));

//    console.log('now:' + n.toDateString('en-GB') + " @@ " + n.toDateString()); // same: Wed Aug 11 2021
//    console.log('now:' + n.toLocaleDateString('en-GB') + " @@ " + n.toLocaleDateString()); //now:11/08/2021 @@ 2021/8/11
//    console.log('now:' + n.toTimeString('en-GB') + " @@ " + n.toTimeString()); // same: 17:56:00 GMT+0800
//    console.log('now:' + n.toLocaleTimeString('en-GB') + " @@ " + n.toLocaleTimeString()); // now:17:56:00 @@ ¤U¤È5:56:00
//}
//test();


var tabMap = new Map();
var contentTabId;

var chkTxt = "unknown....";
var sentChkTxt = false;
var clickTime = new Date(0);
//console.log('diff=' + (new Date() - clickTime));


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 2. A page requested user data, respond with a copy of `user`
    if (message === 'get-user-data') {

        //let tDiff = (new Date() - clickTime);
        //console.log("get chkTxt : time diff= " + tDiff);

        //if (tDiff < 2000) sendResponse("wait:" + chkTxt)
        var resp;
        if (!sentChkTxt) {
            sentChkTxt = true;
            resp = chkTxt;
        }
        else {
            if (clickTime.getTime() > 0) resp = "clicked:" + chkTxt;
            else resp = "sent:" + chkTxt;
        }

        sendResponse(resp);
        console.log('@@ send chkTxt:' + resp + ' ->' + sender.tab.id);
    }
    else if (message === 'myTabId?') sendResponse(sender.tab.id);

});

chrome.runtime.onMessage.addListener(function (msg, sender) {
    if (msg.from === "content") {  //get content scripts tab id
        contentTabId = sender.tab.id;
        console.log('set contentTabId=' + contentTabId);
    }

    if (msg.from === "clicked") {
        clickTime = new Date();
        //chkTxt = null;
        console.log('@@ clicked(' + sender.tab.id + ')' + toTimeStr(clickTime));
    }


    //  if (msg.from === "popup" && contentTabId) {  //got message from popup
    //    chrome.tabs.sendMessage(contentTabId, {  //send it to content script
    //      from: "background",
    //      first: msg.first,
    //      second: msg.second
    //    });
    //  }
});

//--------------------------











chrome.cookies.onChanged.addListener(function (info) {
    //console.log("onChanged" + JSON.stringify(info));

    if (!info.removed && info.cookie.name === "CheckCode") {
        let x = info.cookie.value
        console.log("@@ " + x);
        chkTxt = x
        //chrome.storage.local.set({ "chkTxt": chkTxt });

        //chrome.runtime.sendMessage({from:"setChkTxt",value:x});

        //window.prompt("Copy to clipboard: Ctrl+C, Enter", x);

        //"txtCheckCode"
        //console.log(document);
        //console.log(document.getElementsByName("chknumTxt")[0]);
        //console.log(document.getElementsByName("txtCheckCode")[0]);


        //chrome.tabs.sendMessage(contentTabId, {text: 'report_back', value :x});
        //chrome.tabs.sendMessage(contentTabId, {text: 'report_back', value :x}, doStuffWithDom);
    }
});

function focusOrCreateTab(url) {
    chrome.windows.getAll({ "populate": true }, function (windows) {
        var existing_tab = null;
        for (var i in windows) {
            var tabs = windows[i].tabs;
            for (var j in tabs) {
                var tab = tabs[j];
                if (tab.url == url) {
                    existing_tab = tab;
                    break;
                }
            }
        }
        if (existing_tab) {
            chrome.tabs.update(existing_tab.id, { "selected": true });
        } else {
            chrome.tabs.create({ "url": url, "selected": true });
        }
    });
}

var repeat = 0;
var timeoutId;
var newURL;

function triggerDelay(time) {

    if (timeoutId != null) clearTimeout(timeoutId);

    timeoutId = setTimeout(function () {

        let n = new Date();
        console.log('@ ' + repeat + ' trigger(id=' + timeoutId + ')..' + toTimeStr(n)); // + '.. tabId=' + contentTabId)

        timeoutId = null;

        if (clickTime.getTime() > 0) {
            console.log("stop repeat! clicked at!" + toTimeStr(clickTime));
            //alert("clicked at!" + clickTime.toLocaleTimeString());
            return;
        }

        if (contentTabId == null) {
            console.log("stop repeat! because main tab has been removed!");
            return;
        }

        //if (repeat === 0) { // reload main tab at 1st time

        //    tabMap.set(contentTabId, Date.now())
        //    console.log('@@@ reload!' + contentTabId);
        //    chrome.tabs.reload(contentTabId);

        //} else
        {
            if (newURL != null) {
                newURL.pathname = pathArr[repeat]
                chrome.tabs.create({ active: false, url: newURL.href }, function (tab) {
                    tabMap.set(tab.id, Date.now())
                    console.log('@@@ tab created:' + tab.id);
                });
            }
        }


        triggerAtDate(triggerDates[++repeat])

        //if (++repeat >= 8) // by init()
        //    console.log('repeat over!') //alert('repeat over!');
        //else triggerDelay(repeatDelay);

    }, time);

    //console.log('setTimeout(' + time + '), id=' + timeoutId);
}

function triggerAtDate(date) {

    //let xxx = triggerDates[100]
    //console.log('@ xxx=' + xxx)
    //console.log('@==' + (xxx == null))
    //console.log('@===' + (xxx === null))

    if (date == null) console.log('@ stop trigger at null')
    else triggerDelay(date.getTime() - Date.now())
}


var triggerDates
function initTriggerDates() {

    // test by local testServer
    // set     52000 56200 59967 61000 63000 65000
    // trigger 52017 56212 59983 61010 63002 65007
    // create  52037 56227 59998 61025 63018 65023 
    // server  52346 56236 60005 61035 63028 65030
    // delay=  346   36    38    35    28    30
    // server2 52335 56237 59998 61028 63032 65036
    // delay2= 335   37    31    28    32    36

    let shiftTarget = 30; // find it from the logs of test server
    let triggerSecs = [52000, 56200, 60000 - shiftTarget, 61000, 63000, 65000]
    //let triggerSecs = [53000,56500,57200, 57900, 58600, 59300, 59985, 60590, 61290, 62000, 63000]

    let n = new Date()

    let debug = !(n.getHours() === 15 && n.getMinutes() > 40)

    let t = debug ? //Date(year, month, day, hours, minutes, seconds, milliseconds)
        new Date(n.getFullYear(), n.getMonth(), n.getDate(), n.getHours(), (n.getSeconds() > 40 ? n.getMinutes() + 1 : n.getMinutes()), 0, 0)
        : new Date(n.getFullYear(), n.getMonth(), n.getDate(), 15, 59, 0, 0);

    let i = 0
    triggerDates = Array.from(triggerSecs, s => new Date(t.getTime() + triggerSecs[i++]))

    triggerDates.forEach((o, i) => console.log('triggerDate(' + i + ') ' + toTimeStr(o)))
    //console.log(triggerTimes)
    //console.log(Array.from(triggerTimes, o => toTimeStr(o)))

    let ttime = triggerDates[repeat]
    triggerAtDate(ttime)

    return ttime
}


var repeatDelay = 700;
function initTrggerInterval() {

    let n = new Date();
    let hours = n.getHours();
    var t;

    //Date(year, month, day, hours, minutes, seconds, milliseconds)
    if (hours === 15) t = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 16, 0, 0, 0);
    else
        t = new Date(n.getFullYear(), n.getMonth(), n.getDate(), hours, n.getMinutes() + 1, 0, 0);

    // When processing the request, the server may check the current time to return different results instead of checking the sending time of the request header.
    // Thus, when the server is busy, it processes the request sent a long time ago.
    let triggerTimesBeforeTarget = 4;
    let shiftTarget = 33; // find it from the logs of test server

    // The actual trigger time will be delayed, and each time the delay will accumulate. e.g:
    // (1) 60000-700*4-33 = 57167. actual triggered at 57183, delay = 16
    // (2) 60000-700*3-33 = 57867. but set as 57183+700 = 57883. actual triggered at 57899, delay = 32
    // (3) 60000-700*2-33 = 58567. actual triggered at 58614, delay = 47
    // (4) 60000-700*1-33 = 59267. actual triggered at 59330, delay = 63
    // (5) 60000-33       = 59967. actual triggered at 60045, delay = 78
    triggerDelay(t - n - repeatDelay * triggerTimesBeforeTarget - shiftTarget); // call it ASAP because now is running!

    return t
}



var pathArr
chrome.browserAction.onClicked.addListener(function (tab) {

    //reset data
    //chkTxt = "unknown....";
    clickTime = new Date(0);
    repeat = 0;
    sentChkTxt = false;

    newURL = new URL(tab.url);
    contentTabId = tab.id;
    let strTab = newURL + ' set contentTabId=' + contentTabId

    pathArr = magic(newURL.pathname)

    //console.log(newURL.hostname + '*' + newURL.pathname + '*' + newURL.origin + '*' + newURL.href);
    //hostname=localhost
    //pathname=/xxxxX/
    //origin=http://localhost:9900
    //href=http://localhost:9900/xxxxX/


    //----------------------------
    //for (let i = 0; i < 3; i++) {
    //    chrome.tabs.create({ url: newURL }, function (tab) { console.log('tab created:' + tab.id); });
    //}

    let t = initTriggerDates()
    //let t = initTrggerInterval()

    let strTime = 'target time:' + toDateTimeStr(t) + ', now=' + toTimeStr(new Date());
    let oStr = strTab + '\n' + strTime;
    console.log(oStr);
    alert(oStr); // blocking


    //var manager_url = chrome.extension.getURL("manager.html");
    //focusOrCreateTab(manager_url);
});

//------------------------------

// Regex-pattern to check URLs against.
// It matches URLs like: http[s]://[...]stackoverflow.com[...]
var urlRegex = /^https?:\/\/(?:[^./?#]+\.)?stackoverflow\.com/;

// A function to use as callback
function doStuffWithDom(domContent) {
    //console.log('I received the following DOM content:\n' + domContent);
}

// When the browser-action button is clicked...
//chrome.browserAction.onClicked.addListener(function (tab) {
//    // ...check the URL of the active tab against our pattern and...
//    if (urlRegex.test(tab.url)) {
//        // ...if it matches, send a message specifying a callback too
//        chrome.tabs.sendMessage(tab.id, {text: 'report_back'}, doStuffWithDom);
//    }
//});


//--------------------------------

chrome.tabs.onRemoved.addListener(function (tabId, info) {
    //info: isWindowClosing: True when the tab was closed because its parent window was closed.
    // windowId

    if (tabId === contentTabId) contentTabId = null
    tabMap.delete(tabId)
    console.log('@removed(' + info.windowId + ', isWindowClosing:' + info.isWindowClosing + ')' + tabId + '/' + tabMap.size)
});

chrome.tabs.onUpdated.addListener(function (tabId, info) {

    //console.log('@' + tabId + '->' + info.status)
    if (info.status === 'complete') {
        let t = tabMap.get(tabId)
        tabMap.delete(tabId)

        if (t != null) {
            let now = Date.now()
            console.log('@loaded duration:' + tabId + '->' + (now - t) / 1000.0)
        }
    }// else if (info.status === 'loading') {}

});

//chrome.tabs.onActivated.addListener(function (info) {

//    console.log('@@onActivated:' + info.tabId)

//});



function toBinStr(dec) {
    return (dec >>> 0).toString(2);
    //(-1).toString(2) output is "-1"
    //(-1 >>> 0) will shift 0 bits to the right, which doesn't change the number but it will be represented as an unsigned integer.

    //console.log(toBinStr(1)); // 1
    //console.log(toBinStr(-1)); // 11111111111111111111111111111111
    //console.log(toBinStr(256)); // 100000000
    //console.log(toBinStr(-256)); // 11111111111111111111111100000000
}

var StringBuilder = function () {
    this._sArray = new Array();
}
StringBuilder.prototype.append = function (str) {
    this._sArray.push(str);
}
StringBuilder.prototype.toString = function () {
    return this._sArray.join('');
}



function magic(str) {

    //console.log(str)
    //console.log(str.length)
    //console.log(str.size)

    if (str[0] !== '/') {
        console.log('str must begin with / !!!')
        return null
    }

    if (str.length < 5) {
        console.log('err str to small!!!')
        return null
    }

    let subStr = str.substr(5)
    //console.log(subStr)

    str = str.toLowerCase()
    let arr = [str[1], str[2], str[3], str[4]]
    //console.log(arr)

    let out = []
    for (let i = 0; i < 16; i++) {

        let bin = toBinStr(i).padStart(4, '0')

        //let bin = toBinStr(i)
        //bin = "0000".substr(bin.length) + bin;

        //console.log(bin)

        var sb = new StringBuilder()
        sb.append(str[0])
        for (let i = 0; i < 4; i++) {
            if (bin[i] === '1') sb.append(arr[i].toUpperCase())
            else sb.append(arr[i])
        }
        sb.append(subStr)
        out.push(sb.toString())
    }

    //console.log(out)
    return out
}

//var o = magic('/AbcDefGhi/')
//console.log(o)