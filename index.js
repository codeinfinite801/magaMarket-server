const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB database connection 
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.n9v3wxy.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    // U can start create a new API for Database
    const database = client.db("megaMarketDB");
    const booksCollection = database.collection("books");
    const electronicsCollection = database.collection("electronics");
    const addProductsCollection = database.collection("addProducts");

    // books related api
    app.get('/allBooks', async (req, res) => {
      const result = await booksCollection.find().toArray();
      res.send(result)
    })
    app.get('/allBooks/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await booksCollection.findOne(query);
      res.send(result)
    })
    // electronics device related api
    app.get('/allElectronics', async (req, res) => {
      const result = await electronicsCollection.find().toArray();
      res.send(result)
    })
    app.get('/allElectronics/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await electronicsCollection.findOne(query);
      res.send(result)
    })

    // add product related api
    app.get("/addProducts", async (req, res) => {
      let query = {};
      if (req?.query?.email) {
        query = { email: req?.query?.email }
      }
      const result = await addProductsCollection.find(query).toArray();
      res.send(result)
    })


    app.get('/addProducts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addProductsCollection.findOne(query)
      res.send(result)
    })

    app.post('/addProducts/:id', async (req, res) => {
      const book = req.body;
      const result = await addProductsCollection.insertOne(book)
      res.send(result)
    })


    
    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);


app.get("/", (req, res) => {
  res.send("MegaMarket Server is Running");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
