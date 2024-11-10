// test.js
import {checkExist, insert } from './db.js';  // Adjust path if needed

async function checkExistTest() {
    const collection = 'testCollection';
    const key = 'name';
    const pk = 'Alice';  // The value to search for

    // Call checkExist to see if the document with key:pk exists
    const result = await checkExist(collection, key, pk);

    if (result.length > 0) {
        console.log(`Document with ${key}: ${pk} exists.`);
    } else {
        console.log(`Document with ${key}: ${pk} does not exist.`);
    }
}

async function insertTest() {
    const collection = 'testCollection';
    const data = [
        { name: "Alice", age: 28, role: "developer" },
        { name: "Bob", age: 35, role: "manager" }
    ];

    // Call insert to add data to the collection
    await insert(collection, data);
    console.log("Insert test completed.");
}

// Run the test functions
async function runTests() {
    console.log("Starting checkExist test...");
    await checkExistTest();
    console.log("Starting insert test...");
    await insertTest();
}

runTests();
