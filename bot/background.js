
function toTimeStr(d) {
    return d.toLocaleTimeString('en-GB') + '.' + d.getMilliseconds();
}

function toDateTimeStr(d) {
    // note: We can enable 'Show timestamps' in Settings of Chrome DevTools as well!
    return d.toLocaleDateString() + '(' + toTimeStr(d) + ')';
}

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}


var tabMap = new Map();
var contentTabId;
var clickTime = new Date(0);


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'myTabId?') sendResponse(sender.tab.id);
});

chrome.runtime.onMessage.addListener(function (msg, sender) {

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
                //newURL.pathname = pathArr[repeat]
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


var timeoutId2;
function refreshDelay(time) {

    if (timeoutId2 != null) clearTimeout(timeoutId2);

    timeoutId2 = setTimeout(function () {

        console.log('@ refreshDelay(id=' + timeoutId2 + ')..' + newURL + ':' + contentTabId); // + '.. tabId=' + contentTabId)

        timeoutId2 = null;

        //if (newURL != null) {
        chrome.tabs.reload(contentTabId);
        refreshDelay(time);
        //}

    }, time);

    console.log('refreshDelay(' + time + '), id=' + timeoutId2);
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

    let debug = false;

    let shiftTarget = 0; // find it from the logs of test server
    let triggerSecs = [53000, 60002, 60500, 61000, 61500, 62000, 63000, 64000]

    //let triggerSecs = [50000, 55000, 60003, 60500, 61000, 63000, 65000]
    //let triggerSecs = [49000, 60000 - shiftTarget, 60300, 60600, 60900, 65000]
    //let triggerSecs = [52000, 56200, 60000 - shiftTarget, 61000, 63000, 65000]
    //let triggerSecs = [53000,56500,57200, 57900, 58600, 59300, 59985, 60590, 61290, 62000, 63000]

    if (debug) triggerSecs = [55000, 60010, 63000]

    let n = new Date()

    //!(n.getHours() === 15 && n.getMinutes() > 40)

    let t = debug ? //Date(year, month, day, hours, minutes, seconds, milliseconds)
        new Date(n.getFullYear(), n.getMonth(), n.getDate(), n.getHours(), (n.getSeconds() > 40 ? n.getMinutes() + 1 : n.getMinutes()), 0, 0)
        : new Date(n.getFullYear(), n.getMonth(), n.getDate(), 13, 59, 0, 0);//9, 59, 0, 0);

    if (!debug && n > t) { // now < target
        t = t.addDays(1);
        console.log(`@@ !!! add 1day to t, now=${n}, t=${t}`);
    }

    let i = 0
    triggerDates = Array.from(triggerSecs, s => new Date(t.getTime() + triggerSecs[i++]))

    triggerDates.forEach((o, i) => console.log('triggerDate(' + i + ') ' + toTimeStr(o)))
    //console.log(triggerTimes)
    //console.log(Array.from(triggerTimes, o => toTimeStr(o)))

    let ttime = triggerDates[0]
    triggerAtDate(ttime)

    return ttime
}


chrome.browserAction.onClicked.addListener(function (tab) {

    //reset data
    //chkTxt = "unknown....";
    clickTime = new Date(0);
    repeat = 0;
    sentChkTxt = false;

    newURL = new URL(tab.url);
    contentTabId = tab.id;
    let strTab = newURL + ' set contentTabId=' + contentTabId

    //pathArr = magic(newURL.pathname)

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

    let strTime = 'target time:' + toDateTimeStr(t) + ', now=' + toTimeStr(new Date()) + '\n\nPlease focus on the current browser. New tabs will be created on it!';
    let oStr = strTab + '\n' + strTime;
    console.log(oStr);
    alert(oStr); // blocking


    //var manager_url = chrome.extension.getURL("manager.html");
    //focusOrCreateTab(manager_url);
    refreshDelay(115*1000);
});


//--------------------------------

chrome.tabs.onRemoved.addListener(function (tabId, info) {
    //info: isWindowClosing: True when the tab was closed because its parent window was closed.
    // windowId

    if (tabId === contentTabId) contentTabId = null
    tabMap.delete(tabId)
    console.log('@removed(' + info.windowId + ', isWindowClosing:' + info.isWindowClosing + ')' + tabId + '/' + tabMap.size)
});

chrome.tabs.onUpdated.addListener(function (tabId, info) {

    console.log('@' + tabId + '->' + info.status)


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
