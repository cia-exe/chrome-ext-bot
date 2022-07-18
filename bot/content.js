//debugger;
//first, tell the background page that this is the tab that wants to receive the messages.
console.log("@@ content start");
//chrome.runtime.sendMessage({ from: "content" });
//console.log("@@ start--");

chrome.runtime.sendMessage('myTabId?', response => {
    console.log('@@ My tabId is', response);
});

//window.addEventListener("load", myMain, false);

//function myMain(evt) {
//    // DO YOUR STUFF HERE.
//    console.log("myMain " + evt.type);
//    // document.all[0].outerHTML

//    console.log(document);
//}

// Listen for messages
//chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//    // If the received message has the expected format...
//    console.log("@@ " + msg.value + " " + sender + " " + sendResponse);
//
//    if (msg.text === 'report_back') {
//        // Call the specified callback, passing
//        // the web-page's DOM content as argument
//        sendResponse(document.all[0].outerHTML);
//    }
//
//});