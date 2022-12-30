//debugger;
//first, tell the background page that this is the tab that wants to receive the messages.
console.log("@f@ start");
//chrome.runtime.sendMessage({ from: "content" });
//console.log("@f@ start--");

var chkTxt = "unknown"
//chrome.runtime.onMessage.addListener(function(msg,sender) {
//    console.log("@@ " + msg);
//  if (msg.from === "setChkTxt") {  //get content scripts tab id
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
        chrome.runtime.sendMessage('get-user-data', response => {
            // 3. Got an asynchronous response with the data from the background
            console.log('received user data', response);
            chkTxt = response
            c.value = chkTxt

            if (chkTxt.length == 4) {
                c.value = chkTxt

                let b = document.getElementsByName("Button1")[0];

                if (b != null) {
                    b.click();
                    chrome.runtime.sendMessage({ from: "clicked" });
                    console.log('@@ click:' + b);
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


var savedElements;

window.addEventListener("load", myMain, false);
function myMain(evt) {
    // DO YOUR STUFF HERE.
    console.log("myMain " + evt.type);
    //localStorage.removeItem("selectElements") // test empty case

    try {
        savedElements = JSON.parse(localStorage.getItem("selectElements"));
        console.log('@@savedElements: ' + savedElements);
        console.log('@@savedElements: ' + typeof (savedElements) + ', len=' + savedElements?.length);
        //savedElements?.forEach(o => console.log('@: ' + o));
    } catch (error) {
        console.log('@@error' + error);
        savedElements = null;
    }

    // document.all[0].outerHTML

    // console.log(document);

    //checkAndSet("chknumTxt")
    //checkAndSet("txtCheckCode")

    let nlist = document.getElementsByName("event-select"); //nodelist
    //nlist = [...nlist].filter(x => !x.disabled);

    console.log(`@@ nlist=${nlist?.length},  savedElements=${savedElements?.length}`);

    //disabled="disabled"

    //var arr = Array.prototype.slice.call(nlist, 0);

    //arr.sort();
    //arr = arr.sort((a, b) => a.value < b.value ? 1 : -1);
    //var f = arr[0];
    //var l = arr[arr.length - 1];

    //console.log('@@0: ' + f.value );
    //console.log('@@l: ' + l.value );

    //arr=arr.sort((a, b) => a.value > b.value? 1 :-1 );
    //console.log('@@0: ' + f.value);
    //console.log('@@l: ' + l.value);
    //nlist = [...nlist].sort((a, b) => a.value < b.value ? 1 : -1);


    let checked = 0;
    let i = 0;
    nlist.forEach(o => {

        // check if o is new data.
        var idx = savedElements?.indexOf(o.value.substring(0, 8)); // todo: use Set to improve performance.
        //var idx=-1; //test

        console.log(`@@(${++i}) ${o.value}, ${o.id}, ${o.disabled}, ${idx}, t:${o}`);

        if (!o.disabled && idx < 0) {
            o.click();
            checked++;
        }
    }
    );
    console.log('@@ checked: ' + checked);

    let save = true; // set true to save data before real action!
    if (save) {

        if (false) { // fake data (delete some data to fake new data for next load) !!

            nlist = [...nlist].filter(x => x.value.indexOf('CC11299') < 0 && x.value.indexOf('CC11195')<0) // test

            //savedElements = savedElements.filter(x => x != 'insurance-tax-check-8' && x != 'insurance-tax-check-1') // test
            // 0: {eventId: "CC11088", installmentEvent: "Y", regEndDate: "2022-10-31T15:59:59.000Z", subItem: "Y"}
            // 1: {eventId: "CC11125", installmentEvent: "Y", regEndDate: "2022-12-31T15:59:59.000Z", subItem: "Y"}

            // CC11088_Y_Mon Oct 31 23:59:59 CST 2022_Y, insurance-tax-check-1
            // CC11125_Y_Sat Dec 31 23:59:59 CST 2022_Y, insurance-tax-check-8

            //<input type="checkbox" name="event-select" class="event-check" id="online-shopping-check-1" value="CC11132_N_Mon Jul 18 23:59:59 CST 2022_N" onclick="javascript:addSelect();" disabled="disabled">
            //<input type="checkbox" name="event-select" class="event-check" id="online-shopping-check-2" value="CC11133_N_Mon Jul 18 23:59:59 CST 2022_N" onclick="javascript:addSelect();" disabled="disabled">
        }

        if (nlist.length > 3 && (savedElements?.length != nlist.length)) {
            savedElements = [...nlist].map(x => x.value.substring(0,8));

            console.log('@@!!! save savedElements:' + savedElements.length + ': '+savedElements);
            localStorage.setItem("selectElements", JSON.stringify(savedElements));
        }
    }

    let b = document.getElementById("saveEventBtn");
    console.log('@@b: ' + b + checked);

    if (checked > 0) {
        if (save) {
            console.log('@@ fake saveEventBtn click:' + checked);
        } else {
            console.log('@@ !!! saveEventBtn click:' + checked);
            b.click(); // post data !! real action!!
        }
    }

    //if (b != null) {
    //    b.click();
    //    chrome.runtime.sendMessage({ from: "clicked" });
    //    console.log('@@ click:' + b);
    //}

    console.log("--myMain " + evt.type);
}

// Listen for messages
//chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//    //chrome.runtime.onMessage.addListener(function (msg,sender) {
//    // If the received message has the expected format...
//    //console.log("@@ " + msg.value + " " + sender + " " + sendResponse); //@@ JR26 [object Object] function () { [native code] }
//    console.log("@@ " + msg.value + " " + sender);

//    if (msg.text === 'report_back') {
//        // Call the specified callback, passing
//        // the web-page's DOM content as argument

//        console.log("@@ " + element);
//        if (element != null) element.value = msg.value;
//        chkTxt = msg.value;
//        console.log("set chkTxt " + chkTxt);
//        //sendResponse(element);
//        //sendResponse(document.all[0].outerHTML);
//    }

//});