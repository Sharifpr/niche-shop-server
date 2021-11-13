const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const app = express()
const cors = require('cors')
require('dotenv').config()

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Hello Sharif Shop!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.diumk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect((err) => {
    const productsCollection = client.db("product").collection("product_details");
    const reviewCollection = client.db("customers").collection("review");
    const usersCollection = client.db('adminPannel').collection('users');
    const shipmentCollection = client
        .db("shipment")
        .collection("shipment_details");

    // add product
    app.post("/addproduct", async (req, res) => {
        const result = await productsCollection.insertOne(req.body);
        res.send(result);
    });

    // get product
    app.get("/product", async (req, res) => {
        const result = await productsCollection.find({}).toArray();
        res.send(result);
    });

    // get product
    app.get("/product/:id", async (req, res) => {
        console.log(req.params.id);
        const result = await productsCollection
            .find({
                _id: ObjectId(req.params.id),
            })
            .toArray();
        res.send(result);
    });

    // add review
    app.post("/reviews", async (req, res) => {
        const result = await reviewCollection.insertOne(req.body);
        res.send(result);
    });

    // get review
    app.get("/reviews", async (req, res) => {
        const result = await reviewCollection.find({}).toArray();
        res.send(result);
    });

    // post order
    app.post("/shipment/:id", async (req, res) => {
        const result = await shipmentCollection.insertOne(req.body);
        res.send(result);
    });

    // get order
    app.get("/shipment", async (req, res) => {
        const result = await shipmentCollection.find({}).toArray();
        res.send(result);
    });

    //place order
    app.post("/shipment/:id", async (req, res) => {
        const id = req.params.id;
        const updatedName = req.body;
        const filter = { _id: ObjectId(id) };
        shipmentCollection
            .insertOne(filter, {
                $set: {
                    name: updatedName.name,
                },
            })
            .then((result) => {
                res.send(result);
            });
    });

    //  my order
    app.get("/myOrder/:email", async (req, res) => {
        console.log(req.params.email);
        const result = await shipmentCollection
            .find({ email: req.params.email })
            .toArray();
        res.send(result);
    });

    app.get("/orders", async (req, res) => {
        const result = await shipmentCollection.find({}).toArray();
        res.send(result);
    });

    // delete data from my order
    app.delete("/delete/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await shipmentCollection.deleteOne(query);
        res.json(result);
    });

    // delete data from explore
    app.delete("/product/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await productsCollection.deleteOne(query);
        res.json(result);
    });

    // single user by get email 
    app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    })

    // user 
    app.post("/users", async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
    })

    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user }
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });

    app.put('/users/admin', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: { role: "admin" } };
        const result = await usersCollection.updateOne(filter, updateDoc)
        res.json(result);
    });

    // client.close();
});




app.listen(port, () => {
    console.log(`listening at this`, port);
});