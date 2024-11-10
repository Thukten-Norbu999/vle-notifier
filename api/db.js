import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017/notfier";

export async function connectMongo() {
  const client = new MongoClient(uri);
  let db = ''
  try {
    client.connect();
    db = client.db('notifier')
    console.log("Connection Successful");
  } catch (e) {
    console.log("Error:", e);
  }
  return [db,client]
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


