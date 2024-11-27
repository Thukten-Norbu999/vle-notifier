import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
const uri = "mongodb://localhost:27017/notfier";

export async function connectMongo() {
  const client = new MongoClient(uri);

  try {
    client.connect();
    console.log("Connection Successful");

  } catch (e) {
    console.log("Error:", e);
  }
  return client
}

export async function checkExist(collection, key, pk){
  const [db, client] = await connectMongo()
  
  const coll = db.collection(collection)

  console.log(await coll.find({key:pk}))

  return await coll.find({key:pk})
}

export async function insert(collection, data){
  const [db, client] = await connectMongo()

  const coll = db.collection(collection)

  await coll.insertMany(data)

  console.log(`Insertion of ${data} in ${collection} successful`)
  await client.close()
}



// Hash Password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Verify Password
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};




import CryptoJS from 'crypto-js';

// Encrypt using AES from crypto-js
export const encrypt = (text, passphrase) => {
  const encrypted = CryptoJS.AES.encrypt(text, passphrase).toString();
  return encrypted;
};

// Decrypt using AES from crypto-js
export const decrypt = (ciphertext, passphrase) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
};


