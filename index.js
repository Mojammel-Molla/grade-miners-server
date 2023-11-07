const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

// middlewares
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri =
  'mongodb+srv://gradeMinersDB:VCKceMijJz0qwlE4@cluster0.xljmjxf.mongodb.net/?retryWrites=true&w=majority';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const assignments = client.db('gradeMinersDB').collection('assignments');
const selectedItems = client.db('gradeMinersDB').collection('selected-items');

// Post assignment data
app.post('/assignments', async (req, res) => {
  const select = req.body;
  const result = await assignments.insertOne(select);
  res.send(result);
});
// Get all assignments data
app.get('/assignments', async (req, res) => {
  const result = await assignments.find().toArray();
  res.send(result);
});

// Get single assignment detail data
app.get('/detail/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await assignments.findOne(query);
  res.send(result);
});
// Get assignment update data
app.get('/update/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await assignments.findOne(query);
  res.send(result);
});

//Post Select assignment data
app.post('/selected', async (req, res) => {
  const select = req.body;
  const result = await selectedItems.insertOne(select);
  res.send(result);
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('grade miners is running');
});

app.listen(port, () => {
  console.log(`grade miners is running on port ${port}`);
});
