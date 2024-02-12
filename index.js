const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://mega-market-6295e.web.app",
      "https://mega-market-6295e.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB database connection
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.n9v3wxy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // U can start create a new API for Database
    const database = client.db("megaMarketDB");
    const usersCollection = database.collection("users");
    const booksCollection = database.collection("books");
    const onlineBooksCollection = database.collection("onlineBooks");
    const categoriesCollection = database.collection("category");
    const kidsCategoriesCollection = database.collection("kidsCategory");
    const kidsZoneCollection = database.collection("kidsZone");
    const electronicsCollection = database.collection("electronics");
    const addProductsCollection = database.collection("addProducts");
    const authorCollection = database.collection("author");
    const superstoreCollection = database.collection("superstore");
    const paymentCollection = database.collection("payments");
    const reviewCollection = database.collection("reviews");


    // user related api
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result)
    })
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user?.email }
      const existingUser = await usersCollection.findOne(query)
      if (existingUser) {
        return res.send({ massage: "user already exists" })
      }
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })



    // Admin related api
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query)
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin })
    })



    // category related api
    app.get("/category", async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result);
    });
    app.post('/category', async (req, res) => {
      const category = req.body;
      const result = await categoriesCollection.insertOne(category)
      res.send(result)
    })



    // kids category related api
    app.get("/kidsCategory", async (req, res) => {
      const result = await kidsCategoriesCollection.find().toArray();
      res.send(result);
    });
    app.post('/kidsCategory', async (req, res) => {
      const category = req.body;
      const result = await kidsCategoriesCollection.insertOne(category)
      res.send(result)
    })


    // author related api
    app.get("/author", async (req, res) => {
      const result = await authorCollection.find().toArray();
      res.send(result);
    });

    // Super store Category related api
    app.get("/superstore", async (req, res) => {
      const result = await superstoreCollection.find().toArray();
      res.send(result);
    });
    app.post('/superstore', async (req, res) => {
      const category = req.body;
      const result = await superstoreCollection.insertOne(category)
      res.send(result)
    })

    // books related api
    app.get("/allBooks", async (req, res) => {
      const query = {};
      const sortObj = {};
      const categorys = req.query.categorys;
      const authorName = req.query.author_name;
      const sortField = req.query.sortField;
      const sortOrder = req.query.sortOrder;

      if (categorys) {
        query.categorys = categorys;
      }

      if (authorName) {
        query.authors = authorName;
      }

      if (sortField && sortOrder) {
        sortObj[sortField] = sortOrder;
      }

      try {
        let cursor;

        if (categorys && authorName) {
          cursor = await booksCollection
            .find({ $and: [query, { authors: authorName }] })
            .sort(sortObj);
        } else {
          cursor = await booksCollection.find(query).sort(sortObj);
        }

        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    app.get("/allBooks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(query);
      res.send(result);
    });
    app.post('/allBooks', async (req, res) => {
      const book = req.body;
      const result = await booksCollection.insertOne(book)
      res.send(result)
    })


    // online books related api
    app.get('/onlineBooks', async (req, res) => {
      const result = await onlineBooksCollection.find().toArray();
      res.send(result)
    })
    app.get('/onlineBooks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await onlineBooksCollection.findOne(query);
      res.send(result)
    })
    app.post('/onlineBooks', async (req, res) => {
      const book = req.body;
      const result = await onlineBooksCollection.insertOne(book)
      res.send(result)
    })



    // kids related api
    app.get("/kidsZone", async (req, res) => {
      let query = {};
      if (req?.query?.category) {
        query = { category: req?.query?.category };
      }
      const result = await kidsZoneCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/kidsZone/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await kidsZoneCollection.findOne(query);
      res.send(result);
    });
    app.post('/kidsZone', async (req, res) => {
      const product = req.body;
      const result = await kidsZoneCollection.insertOne(product)
      res.send(result)
    })



    // electronics device related api
    app.get("/allElectronics", async (req, res) => {
      const result = await electronicsCollection.find().toArray();
      res.send(result);
    });
    app.get("/allElectronics/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await electronicsCollection.findOne(query);
      res.send(result);
    });
    app.post('/allElectronics', async (req, res) => {
      const product = req.body;
      const result = await electronicsCollection.insertOne(product)
      res.send(result)
    })



    // add product related api
    app.get("/addProducts", async (req, res) => {
      let query = {};
      if (req?.query?.email) {
        query = { email: req?.query?.email };
      }
      const result = await addProductsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/addProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addProductsCollection.findOne(query);
      res.send(result);
    });

    app.post("/addProducts/:id", async (req, res) => {
      const book = req.body;
      const result = await addProductsCollection.insertOne(book);
      res.send(result);
    });
    app.delete("/addProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addProductsCollection.deleteOne(query);
      res.send(result);
    });



    // payment intent
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 1000);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });



    // payment related api

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const paymentResult = await paymentCollection.insertOne(payment);
      const query = {
        _id: {
          $in: payment.cartIds?.map((id) => new ObjectId(id)),
        },
      };
      const deleteResult = await addProductsCollection.deleteMany(query);
      res.send({ paymentResult, deleteResult });
    });


    // status update routes here
    app.patch("/update-status", async (req, res) => {
      const id = req.query.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "Confirm",
        },
      };
      const result = await paymentCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.get("/payments", async (req, res) => {
      let query = {};
      if (req?.query?.email) {
        query = { email: req?.query?.email };
      }
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    });



    // add product increase or decrease related api
    // increment
    app.put("/addProducts/:id/increment", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const currentProduct = await addProductsCollection.findOne(query);

      if (!currentProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      const updatedCount = currentProduct?.count + 1;
      const newTotalPrice = updatedCount * currentProduct?.discountedPrice;
      const quantity = currentProduct?.quantity - 1;
      const result = await addProductsCollection.findOneAndUpdate(
        query,
        {
          $set: {
            count: updatedCount,
            priceWithDiscount: newTotalPrice,
            quantity: quantity,
          },
        },
        { returnDocument: "after" }
      );
      res.json(result);
    });



    // decrement
    app.put("/addProducts/:id/decrement", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const currentProduct = await addProductsCollection.findOne(query);

      if (!currentProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      const updatedCount = currentProduct?.count - 1;
      const newTotalPrice = updatedCount * currentProduct?.discountedPrice;
      const quantity = currentProduct?.quantity + 1;
      const result = await addProductsCollection.findOneAndUpdate(
        query,
        {
          $set: {
            count: updatedCount,
            priceWithDiscount: newTotalPrice,
            quantity: quantity,
          },
        },
        { returnDocument: "after" }
      );
      res.json(result);
    });

    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });


    // review related api
    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review).toArray();
      res.send(result);
    });

    

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
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
