// function checkForIndexedDb() {
//     if (!window.indexedDB) {
//       console.log("Your browser doesn't support a stable version of IndexedDB.");
//       return false;
//     }
//     return true;
// }

let db;
const request= indexedDB.open('budget', 1);

request.onupgradeneeded = (event)=>{
  console.log('Upgrade needed in IndexDB');

  const { oldVersion } = event;
  const newVersion = event.newVersion || db.version;

  console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

  db = event.target.result;

  if(db.objectStoreNames.length===0){
    db.createObjectStore('pending',{
      autoIncrement:true
    });
  }
};

request.onerror = (event)=>{
  console.log(`Whoops! ${event.target.errorCode}`);
}

function checkDatabase(){
  console.log('Check db invoked');

  let transaction = db.transaction(['pending'],'readwrite');

  const store = transaction.objectStore('pending');

  const getAll = store.getAll();

  getAll.onsuccess = () => {
    if(getAll.result.length>0){
      fetch('/api/transaction/bulk',{
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*', 'Content-Type':'application/json'
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if(res.length !== 0) {
            transaction = db.transaction(['pending'],'readwrite');

            const currentStore = transaction.objectStore('pending');

            currentStore.clear();
            console.log('Clearing store');
          }
        });
    }
  };
}

request.onsuccess = (event)=>{
  console.log('Success!');
  db = event.target.result;

  if(navigator.onLine) {
    console.log('Backend online');
    checkDatabase();
  }
}

const saveRecord = (record)=>{
  console.log('Save record invoked');

  const transaction = db.transaction(['pending'], 'readwrite');

  const store = transaction.objectStore('pending');

  store.add(record);
}

window.addEventListener('online',checkDatabase);

