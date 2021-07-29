function checkForIndexedDb() {
    if (!window.indexedDB) {
      console.log("Your browser doesn't support a stable version of IndexedDB.");
      return false;
    }
    return true;
  }
  
function useIndexedDb(databaseName) {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(databaseName, 1);
      let db;
  
      request.onupgradeneeded = ({target})=>{
        const db = target.result;
        db.createObjectStore("pending", { autoIncrement: true});
      };
  
      request.onerror = (e)=> {
        console.log("There was an error" + e.target.errorCode);
      };
  
      request.onsuccess = ({target})=>{
        db = target.result;

        if(navigator.onLine){
            checkDatabase();
        }
      };

      const saveTransaction = (data)=>{
        const transaction = db.transaction(["pending"],"readwrite");
        const store = transaction.objectStore("pending");

        store.add(data);
      }

      const checkDatabase = ()=>{
        const transaction = db.transaction(["pending"],"readwrite");
        const store = transaction.objectStore("pending");
        const getAll = store.getAll();

        getAll.onsuccess = ()=>{
            if(getAll.result.length>0){
                fetch("/api/transaction/bulk",{
                    method: "POST",
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: "application/json, text/plain, */*", "Content-Type":
                        "application/json"
                    }
                })
                .then(response=>{
                    return response.json();
                })
                .then(()=>{
                    const transaction = db.transaction(["pending"],"readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                })
            }
        }
      }

    });
  }
  
  window.addEventListener("online",checkDatabase);