let db

const request = indexedDB.open('budget', 1)

request.onupgradeneeded = function(e) {
    const db = e.target.result
    db.createObjectStore('new_transaction', { autoIncrement: true })
}

request.onsuccess = function(e) {
    db = e.target.result

    if (navigator.onLine) {
        uploadTransaction()
    }
}

request.onerror = function(e) {
    console.log(e.target.errorCode)
}

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite')

    const transactionObjectStore = transaction.objectStore('new_transaction')

    transactionObjectStore.add(record)
}

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite')

    const transactionObjectStore = transaction.objectStore('new_transaction')

    const getAll = transactionObjectStore.getAll()

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json',
                    'Content-Type':'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.MESSAGE) {
                    throw new Error(serverResponse)
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite')
                const transactionObjectStore = transaction.objectStore('new_transaction')

                transactionObjectStore.clear()
                alert('All saved transactions have been submitted!')
            })
            .catch(console.log)
        }
    }
}

window.addEventListener('online', uploadTransaction)