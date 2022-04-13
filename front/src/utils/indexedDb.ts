const onRequest = indexedDB.open("programming", 1);

onRequest.onupgradeneeded = (): void => {
  //const initialData = await getEntryFromDb("programmingwords");
  //const isInitialData = initialData.length === 0 ? false : true;

  //if (isInitialData) {
  //return;
  //}

  const database = onRequest.result;

  database.createObjectStore("user", { keyPath: "userToken" });

  const wordsStore = database.createObjectStore("programmingwords", {
    autoIncrement: true,
  });

  wordsStore.transaction.oncomplete = () => {
    const wordsStore = database
      .transaction("programmingwords", "readwrite")
      .objectStore("programmingwords");

    const initialWords = ["react", "express", "node", "javascript", "python"];
    initialWords.forEach((word) => {
      wordsStore.add(word);
    });
  };
};

onRequest.onsuccess = (): void => {
  console.log("db open success");
};

onRequest.onerror = (): void => {
  console.error("Error creating or accessing db");
};

const addEntryToDb = (storeName: string, entry: any): void => {
  const database = onRequest.result;
  const transaction = database.transaction([storeName], "readwrite");

  const store = transaction.objectStore(storeName);

  store.add(entry);

  transaction.onerror = () => {
    console.log(`error adding Entry to ${storeName}.`);
    console.log(transaction.error);
  };
};

const clearAllEntries = (storeName: string): void => {
  const database = onRequest.result;
  const transaction = database.transaction([storeName], "readwrite");

  const store = transaction.objectStore(storeName);

  store.clear();
};

const getEntryFromDb = (
  storeName: string,
  key: string | number
): Promise<any> => {
  const data = new Promise((resolve, reject) => {
    const database = onRequest.result;
    const transaction = database.transaction([storeName]);
    const store = transaction.objectStore(storeName);

    const request = key ? store.get(key) : store.getAll();

    request.onerror = () => {
      reject(request.error);
      console.log("error getting data from the store");
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });

  return Promise.resolve(data);
};

export { addEntryToDb, getEntryFromDb, clearAllEntries };
