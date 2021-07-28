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
    });
  }
  