//letting db be declared to 
let db;

const request = indexedDB.open("budget", 1);


request.onupgradeneeded = function (event) {
    // Defining database for offline 
    const db = event.target.result;
    db.createObjectStore("pending", {autoIncrement: true}) 
}

request.onsuccess = function (event){
    db = event.target.result;
   
    if(navigator.onLine) {
        console.log("Connection established you are online");
        checkDb();
    } else {
        console.log("Connection Lost");
    }
};
// Error message
request.onerror = function(event) {
    console.log("Unsuccessful Request" + event.target.errorCode);
};

//Saving the information 
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
}

function checkDb() {
    const transaction = db.transaction(["pending"], "readwrite");
   
    //Returning  info
    const store = transaction.objectStore("pending");
    const allInfo = store.getAll();
        allInfo.onsuccess = function() {
        const recordCount = allInfo.result.length;
        console.log(allInfo.result);
        if (recordCount === 0){
        const JSONInfo = JSON.stringify(allInfo.result);
            fetch("/api/transaction/bulk", {
            method: "POST", 
            body: JSONInfo,
            headers: {
                Accept: "application/json, text/plain, */*", 
                "Content-Type": "application/json"
            }
        })
        
        // Storing info for the transaction and reading the file 
        .then(response => response.json())
        .then(() => {
            const saveInfo = db.transaction(["pending"], "readwrite");
            const store = saveInfo.objectStore("pending");
            store.clear();
        })        
    }
    };
}

window.addEventListener("online", checkDb)