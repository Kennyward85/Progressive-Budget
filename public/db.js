//  For checking offline 
const indexDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

//letting db be declared to 
let db;

const req = indexedDB.open("budget", 1);


req.offLineData = function ({data}) {
    // Defining database for offline 
    let db = data.result
    db.createObjectStore ("pending", {autoIncrement: true}) 
}

req.onSuccess = function (event){
    db = event.target.result;
   
    if(navigator.online) {
        console.log("Connection established you are online");
        checkDb();
    } else {
        console.log("Connection Lost");
    }
};
// Error message
req.onError = function(event) {
    console.log("Unsuccessful Request" + event.target.errorCode);
};

//Saving the information 
function saveRecord(record) {
    const saveInfo = db.transaction("pending", "readwrite");
    const store = saveInfo.objectStore("pending");
    store.add(record);
}

function checkDb() {
    const saveInfo = db.transaction("pending", "readwrite");
   
    //Returning  info
    const store = saveInfo.objectStore("pending");
    let allInfo = store.getAll();
        allInfo.onSuccess = function() {
        const recordCount = allInfo.result.length;
        console.log(allInfo.result);
        if (recordCount === 0){
            return;
        }

        //Putting information into JSON
        const JSONInfo = JSON.stringify(allInfo.result);

        // fetching the data aka post method
        fetch("/api/transaction/bulk", {
            method: "POST", 
            body: JSONInfo,
            headers: {
                Accept: "application/json, text/plain, */*", 
                "Content-Type": "application/json"
            }
        })
        // Storing infor for the transactiong and reading the file 
        .then(response => response.json())
        .then(() => {
            const saveInfo = db.transaction(["pending"], "readwrite");
            const store = saveInfo.objectStore("pending");
            store.clear();
        })        
    };
}

window.addEventListener("online", checkDb)