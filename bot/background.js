// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


var contentTabId;

var chkTxt = "unknown....";
var clickTime = new Date(0);
//console.log('diff=' + (new Date() - clickTime));


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 2. A page requested user data, respond with a copy of `user`
    if (message === 'get-user-data') {

        let tDiff = (new Date() - clickTime);

        console.log(message + ": time diff= " + tDiff);

        //if (tDiff < 2000) sendResponse("wait:" + chkTxt)
        if (clickTime.getTime() > 0) sendResponse("clicked:" + chkTxt)
        else sendResponse(chkTxt);
    }

});

chrome.runtime.onMessage.addListener(function (msg, sender) {
    if (msg.from == "content") {  //get content scripts tab id
        contentTabId = sender.tab.id;
        console.log('set contentTabId=' + contentTabId);
    }

    if (msg.from == "clicked") {
        console.log('clicked');
        //chkTxt = null;
        clickTime = new Date();
    }


    //  if (msg.from == "popup" && contentTabId) {  //got message from popup
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

    if (!info.removed && info.cookie.name == "CheckCode") {
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

var repeatDelay = 777;
var repeat = 0;
var timeoutId;
var newURL;

function triggerDelay(time) {

    if (timeoutId != null) clearTimeout(timeoutId);

    timeoutId = setTimeout(function () {

        let n = new Date();
        console.log('@ ' + repeat + ' trigger(id=' + timeoutId + ')' + n + ":" + n.getMilliseconds() + '... tabId=' + contentTabId)

        timeoutId = null;

        if (clickTime.getTime() > 0) {
            console.log("stop repeat! clicked at!" + clickTime.toLocaleTimeString());
            //alert("clicked at!" + clickTime.toLocaleTimeString());
            return;
        }

        if (repeat == 0) {
            if (contentTabId != null) {
                console.log('@@@ reload!' + contentTabId);
                chrome.tabs.reload(contentTabId);
            }
        } else {
            if (newURL != null)
                chrome.tabs.create({ url: newURL }, function (tab) { console.log('tab created:' + tab.id); });
        }

        if (++repeat >= 22)
            console.log('repeat over!') //alert('repeat over!');
        else triggerDelay(repeatDelay);

    }, time);

    console.log('setTimeout(' + time + '), id=' + timeoutId);

}

chrome.browserAction.onClicked.addListener(function (tab) {

    //reset data
    //chkTxt = "unknown....";
    clickTime = new Date(0);
    repeat = 0;

    contentTabId = tab.id;
    let str1 = 'set contentTabId=' + contentTabId
    console.log(str1);

    //----------------------------
    newURL = tab.url;
    //for (let i = 0; i < 3; i++) {
    //    chrome.tabs.create({ url: newURL }, function (tab) { console.log('tab created:' + tab.id); });
    //}


    //-----------------------------
    let n = new Date();
    //console.log('now:' + n.toDateString());
    //console.log('now:' + n.toLocaleDateString());
    //console.log('now:' + n.toTimeString());
    //console.log('now:' + n.toLocaleTimeString());
    //Date(year, month, day, hours, minutes, seconds, milliseconds)

    let hours = n.getHours();
    var t;
    if (hours == 15) t = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 16, 0, 0, 0);
    else
        t = new Date(n.getFullYear(), n.getMonth(), n.getDate(), hours, n.getMinutes() + 1, 0, 0);

    triggerDelay(t - n - repeatDelay * 3 - 15); // before ?ms; call it ASAP because now is running!

    let str2 = 'target time:' + t.toLocaleTimeString() + ', now=' + n.toLocaleTimeString();
    console.log(str2);
    alert(str1 + '\n' + str2); // blocking 
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
