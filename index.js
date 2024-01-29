const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

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
    // await client.connect();

    // U can start create a new API for Database
    const database = client.db("megaMarketDB");
    const booksCollection = database.collection("books");
    const categoriesCollection = database.collection("category");
    const kidsCategoriesCollection = database.collection("kidsCategory");
    const kidsZoneCollection = database.collection("kidsZone");
    const electronicsCollection = database.collection("electronics");
    const addProductsCollection = database.collection("addProducts");
    const authorCollection = database.collection("author");
    const superstoreCollection = database.collection("superstore");
    const paymentCollection = database.collection("payments");
    // category related api
    app.get('/category', async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result)
    })

    // kids category related api
    app.get('/kidsCategory', async (req, res) => {
      const result = await kidsCategoriesCollection.find().toArray();
      res.send(result)
    })
    // author related api
    app.get('/author', async (req, res) => {
      const result = await authorCollection.find().toArray();
      res.send(result)

      // Super store Category related api
    })
    app.get('/superstore', async (req, res) => {
      const result = await superstoreCollection.find().toArray();
      res.send(result)
    })

    // books related api
    app.get('/allBooks', async (req, res) => {
      let query = {};
      if (req?.query?.category) {
        query = { category: req?.query?.category }
      }
      const result = await booksCollection.find(query).toArray();
      res.send(result)
    })
    app.get('/allBooks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await booksCollection.findOne(query);
      res.send(result)
    })
    // kids related api
    app.get('/kidsZone', async (req, res) => {
      let query = {};
      if (req?.query?.category) {
        query = { category: req?.query?.category }
      }
      const result = await kidsZoneCollection.find(query).toArray();
      res.send(result)
    })
    app.get('/kidsZone/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await kidsZoneCollection.findOne(query);
      res.send(result)
    })

    // electronics device related api
    app.get('/allElectronics', async (req, res) => {
      const result = await electronicsCollection.find().toArray();
      res.send(result)
    })
    app.get('/allElectronics/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
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
    app.delete('/addProducts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addProductsCollection.deleteOne(query);
      res.send(result)
    })

    // payment intent
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 1000);
    
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"]
      });
    
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // payment related api
    app.post('/payments' , async(req , res)=>{
      const payment = req.body;
      const paymentResult = await paymentCollection.insertOne(payment)
      const query = {_id : {
        $in : payment.cartIds?.map(id => new ObjectId(id))
      }}
      const deleteResult = await addProductsCollection.deleteMany(query)
      res.send({paymentResult , deleteResult})
    })
    app.get("/payments", async (req, res) => {
      let query = {};
      if (req?.query?.email) {
        query = { email: req?.query?.email }
      }
      const result = await paymentCollection.find(query).toArray();
      res.send(result)
    })


    // add product increase or decrease related api
    // increment 
    app.put('/addProducts/:id/increment', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const currentProduct = await addProductsCollection.findOne(query);

      if (!currentProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      const updatedCount = currentProduct?.count + 1;
      const newTotalPrice = updatedCount * currentProduct?.discountedPrice;
      const quantity = currentProduct?.quantity - 1 ;
      const result = await addProductsCollection.findOneAndUpdate(
        query,
        { $set: { count: updatedCount, priceWithDiscount: newTotalPrice , quantity : quantity} },
        { returnDocument: 'after' }
      );
      res.json(result);
    });

    // decrement 
    app.put('/addProducts/:id/decrement' , async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const currentProduct = await addProductsCollection.findOne(query);

      if (!currentProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      const updatedCount = currentProduct?.count - 1;
      const newTotalPrice = updatedCount * currentProduct?.discountedPrice;
      const quantity = currentProduct?.quantity + 1 ;
      const result = await addProductsCollection.findOneAndUpdate(
        query,
        { $set: { count: updatedCount, priceWithDiscount: newTotalPrice , quantity : quantity} },
        { returnDocument: 'after' }
      );
      res.json(result);
    });



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
