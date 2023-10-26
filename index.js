const express = require('express')
const app = express();
const cors = require("cors");
require('dotenv').config();
const port = 5000

// middleware 
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const database = client.db("sohozDatabase");
    const infoCollection = database.collection("officeInfo");
    const cylindersCollection = database.collection("cylinders");
    const usersCollection = database.collection("users");
    const collectDataCollection = database.collection("collectData");
    const temporaryNewCustomerCollection = database.collection("temporaryNewCustomer");
    const completerOrderDataCollection = database.collection("completerOrderData");
    const CustomerDataSohozDjrCollection = database.collection("customerDataSohozDjr");
    const upcommingProductsCollection = database.collection("upcoming");
    const costDetailsCollection = database.collection("costDetailsSohozDjr")

    // office information 
    app.get("/info", async (req, res) => {
      const data = infoCollection.find();
      const result = await data.toArray();
      res.send(result)
    })



    // get all cyliners 
    app.get("/cylinders", async (req, res) => {
      const cylinder = cylindersCollection.find();
      const allCylinders = await cylinder.toArray();
      res.send(allCylinders)
    })

    // get six userIds for showing admin panel to find out last id 
    app.get("/lastSixUserIds", async (req, res) => {
      try {
        const customerData = await CustomerDataSohozDjrCollection.find()
          .sort({ userId: -1 }) // Sort by userId in descending order (latest first)
          .limit(6) // Limit the result to the last 6 records
          .toArray();

        res.send(customerData);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });




    app.get("/temporaryNewCustomer", async (req, res) => {
      const submitTemporayNewcustomer = temporaryNewCustomerCollection.find();
      const allTemporaryCustomer = await submitTemporayNewcustomer.toArray();
      res.send(allTemporaryCustomer)
    })
    // get all  temporaryNewCustomer for rider 
    app.get("/temporaryNewCustomer/:status", async (req, res) => {
      try {
        const status = req.params.status;
        console.log(status);
        const query = { status };
        const statusData = await temporaryNewCustomerCollection.find(query).toArray();
        res.send(statusData);
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("An error occurred while fetching data.");
      }
    });


    // // not work when status code run 

    //     app.get('/temporaryNewCustomer/:orderId', async (req, res) => {
    //     const orderId = (req.params.orderId);
    //     console.log(orderId)
    //     // console.log('Request for orderId:', orderId);
    //     const query = { orderId };
    //     const riderOrderId = await temporaryNewCustomerCollection.findOne(query);
    //     console.log(riderOrderId)
    //     res.send(riderOrderId)

    // });

    // app.get("/upcoming" , async (req , res) => {
    //   const upComingOrders = await OrderStatusCollection.find().sort({ _id : -1 }).limit(3).toArray();
    // })
    app.get("/upcomingSohozDjr", async (req, res) => {
      const user = upcommingProductsCollection.find();
      const upcommingProducts = await user.toArray();
      res.send(upcommingProducts)
    })

    // check order id is exits or not .
    app.get('/temporaryNewCustomer/:orderId', async (req, res) => {
      const orderId = parseInt(req.params.orderId);
      // console.log('Request for orderId:', orderId);
      const query = { orderId };
      const existUser = await temporaryNewCustomerCollection.findOne(query);
      res.json({ exists: !!existUser });
    });

    // get single data by UserId for submit a new order 
    app.get('/customerDataSohozDjr/:id', async (req, res) => {
      const userId = req.params.id; // Use "id" instead of "userId" here to match the route parameter
      const query = { userId };
      const user = await CustomerDataSohozDjrCollection.findOne(query);
      console.log(user)
      res.json(user);
    });

    // get all accepted and process  order from rider

    app.get("/temporaryNewCustomer/progress", async (req, res) => {
      const email = req.query.email; // Retrieve the email from the query parameters
      try {
        const results = await temporaryNewCustomerCollection.find({ email });
        res.json(results);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
      }
    });

    // get all users from database
    app.get("/users", async (req, res) => {
      const user = usersCollection.find();
      const allUsers = await user.toArray();
      res.send(allUsers)
    })

    // get data for conditonal dashboard 
    app.get("/users/role/:email", async (req, res) => {
      const email = req.params.email;
      const quary = { email: email };
      const user = await usersCollection.findOne(quary);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      let role;
      if (user.role === "admin") {
        role = "admin";
      } else if (user.role === "manager") {
        role = "manager";
      } else if(user.role === "rider") {
        role = "rider"
      } else {
        role = "user";
      }
      res.json({ email: email, role: role });
    })
    console.log("end")

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

    // collected data Post method

    app.post("/collectData", async (req, res) => {
      const user = req.body;
      console.log(user)
      const quary = { phone: user.phone };
      const existUser = await collectDataCollection.findOne(quary);
      if (existUser) {
        return res.send({ message: "already have user" })
      }
      const result = await collectDataCollection.insertOne(user);
      res.send(result)
    })

    // post method for all cost details 
    app.post ("/costDetailsSohozDjr" , async (req , res ) => {
      const costDetail = req.body ;
      const result = await costDetailsCollection.insertOne(costDetail);
      res.send(result)
    })



    // post temporaryNewCustomer from dalim 

    app.post("/temporaryNewCustomer", async (req, res) => {
      const user = req.body;
      console.log(user)
      const quary = { orderId: user.orderId };
      const existUser = await temporaryNewCustomerCollection.findOne(quary);
      if (existUser) {
        return res.send({ message: "already have user" })
      }
      const result = await temporaryNewCustomerCollection.insertOne(user);
      res.send(result)
    })


    // post completerOrderData from rider 

    app.post("/completerOrderData", async (req, res) => {
      const user = req.body;
      console.log(user)
      const quary = { orderId: user.orderId };
      const existUser = await completerOrderDataCollection.findOne(quary);
      if (existUser) {
        return res.send({ message: "already order completed" })
      }
      const result = await completerOrderDataCollection.insertOne(user);
      res.send(result)
    })
    // post CustomerData from admin panel 

    app.post("/customerDataSohozDjr", async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { userId: user.userId };
      const existUser = await CustomerDataSohozDjrCollection.findOne(query);
      if (existUser) {
        return res.status(409).send({ error: "Customer already exists" }); // Return a 409 Conflict status
      }
      const result = await CustomerDataSohozDjrCollection.insertOne(user);
      res.send(result);
    });



    // patch  rider orders progess state    
    // app.patch("/temporaryNewCustomer/progress/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = {  _id: new ObjectId(id) };
    //   // const {email} = req.body ;
    //   console.log(filter)
    //   const updateDoc = {
    //     $set: {
    //       status: 'progress',
    //       // email : email ,
    //     },
    //   };
    //   const result = await temporaryNewCustomerCollection.updateOne(filter, updateDoc);
    //   res.send(result)
    // })

    // update rider orders completed state

    app.patch("/temporaryNewCustomer/completed/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      console.log(filter)
      const updateDoc = {
        $set: {
          status: 'completed'
        },
      };
      const result = await temporaryNewCustomerCollection.updateOne(filter, updateDoc);
      res.send(result)
    })

    // update role for admin 
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result)
    })
    // update role for Manager
    app.patch("/users/manager/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'manager'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result)
    })
    // update role for rider
    app.patch("/users/rider/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'rider'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result)
    })

    // put operation for accept order and set rider id 

    app.put("/temporaryNewCustomer/progress/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const { email } = req.body;
      console.log(filter)
      const updateDoc = {
        $set: {
          status: 'progress',
          email: email,
        },
      };
      const result = await temporaryNewCustomerCollection.updateOne(filter, updateDoc);
      res.send(result)
    })


    // user Delete operation 

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
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






app.get('/', (req, res) => {
  res.send("server is running")
})


app.listen(port, () => {
  console.log(`my port is running ${port}`)
})

