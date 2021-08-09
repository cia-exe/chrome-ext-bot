//debugger;
//first, tell the background page that this is the tab that wants to receive the messages.
console.log("@f@ start++");
//chrome.runtime.sendMessage({ from: "content" });
console.log("@f@ start--");

var chkTxt = "unknown"
//chrome.runtime.onMessage.addListener(function(msg,sender) {
//    console.log("@@ " + msg);
//  if (msg.from == "setChkTxt") {  //get content scripts tab id
//    chkTxt = msg.value;
//    console.log('chkTxt=' + chkTxt);
//  }
//  }
//  );




var chkTxt
var element

function checkAndSet(str) {

    let c = document.getElementsByName(str)[0]

    if (c != null) {
        console.log(c);
        element = c;

        //get value from background
        chrome.runtime.sendMessage('get-user-data', (response) => {
            // 3. Got an asynchronous response with the data from the background
            console.log('received user data', response);
            chkTxt = response
            c.value = chkTxt

            if (chkTxt.length == 4) {
                c.value = chkTxt

                let b = document.getElementsByName("Button1")[0];
                console.log('b=' + b);
                if (b != null) {
                    b.click();
                    chrome.runtime.sendMessage({ from: "clicked" });
                }
            }

        });

        //chrome.storage.local.get(["chkTxt"], function(result){
        //
        //
        //    chkTxt=result.chkTxt;
        //
        //    if(chkTxt!=null){
        //    c.value = result.chkTxt
        //
        //    var b = document.getElementsByName("Button1")[0];
        //    console.log('b=' + b);
        //    if(b!=null){
        //     b.click()
        //     chrome.storage.local.set({"chkTxt": null});
        //    }
        //    }
        //});
        //c.value = chkTxt
        console.log("read chkTxt " + chkTxt);
        //chrome.runtime.sendMessage({from:"content"});
    }
}

window.addEventListener("load", myMain, false);
function myMain(evt) {
    // DO YOUR STUFF HERE.
    console.log("myMain " + evt);
    // document.all[0].outerHTML

    // console.log(document);

    checkAndSet("chknumTxt")
    checkAndSet("txtCheckCode")

}

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    //chrome.runtime.onMessage.addListener(function (msg,sender) {
    // If the received message has the expected format...
    //console.log("@@ " + msg.value + " " + sender + " " + sendResponse); //@@ JR26 [object Object] function () { [native code] }
    console.log("@@ " + msg.value + " " + sender);

    if (msg.text === 'report_back') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument

        console.log("@@ " + element);
        if (element != null) element.value = msg.value;
        chkTxt = msg.value;
        console.log("set chkTxt " + chkTxt);
        //sendResponse(element);
        //sendResponse(document.all[0].outerHTML);
    }

});