const express = require('express')
const app = express() ;
const cors = require("cors") ;
require('dotenv').config() ;
const port = 5000

// middleware 
app.use(cors());
app.use(express.json()) ;


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://sohozDream:myDreamProject2024@cluster0.40yptof.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db("sohozDatabase") ;
    const infoCollection = database.collection("officeInfo") ;
    const cylindersCollection = database.collection("cylinders")
    const usersCollection = database.collection("users")

    app.get("/info" ,async ( req, res ) => {
      const data = infoCollection.find();
      const result = await data.toArray();
      res.send(result)
    })

    app.get("/cylinders" , async(req, res) => {
      const cylinder = cylindersCollection.find() ;
      const allCylinders = await cylinder.toArray() ;
      res.send(allCylinders)
    })
    app.get("/users" , async(req, res) => {
      const user = usersCollection.find() ;
      const allUsers = await user.toArray() ;
      res.send(allUsers)
    })


    // register post method 

    app.post("/users", async (req, res) => {
      const user = req.body;
      const quary = { email: user.email };
      const existUser = await usersCollection.findOne(quary);
      if (existUser) {
        return res.send({ message: "already have user" })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result)
    })








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.connect();
  }
}
run().catch(console.dir);






app.get('/' , (req, res ) => {
    res.send ("server is running")
})


app.listen(port , () => {
    console.log(`my port is running ${port}`)
})