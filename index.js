const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

// middlewares
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xljmjxf.mongodb.net/?retryWrites=true&w=majority`;

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
const submittedItems = client.db('gradeMinersDB').collection('submittedItems');

// Post Jwt token
app.post('/jwt', async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1hr',
  });
  res
    .cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
    .send({ success: true });
});

app.post('/logout', async (req, res) => {
  const user = req.body;
  res.clearCookie('token', { maxAge: 0 }).send({ success: true });
});

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

// get data take-assignment page
app.get('/take-assignment/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await assignments.findOne(query);
  res.send(result);
});

//Post Select assignment data
// app.post('/selected', async (req, res) => {
//   const select = req.body;
//   const result = await selectedItems.insertOne(select);
//   res.send(result);
// });

//Post submitted assignment data
app.post('/submissions', async (req, res) => {
  const submitted = req.body;
  const result = await submittedItems.insertOne(submitted);
  res.send(result);
});

//Get submitted pending assignment data
app.get('/submissions', async (req, res) => {
  const query = { status: 'pending' };
  const result = await submittedItems.find(query).toArray();
  res.send(result);
});

// Put single assignment marks
app.put('/submissions/:id', async (req, res) => {
  const id = req.params.id;
  const submitMarks = req.body;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const assignment = {
    $set: {
      status: submitMarks.status,
      marks: submitMarks.marks,
      feedback: submitMarks.feedback,
    },
  };
  const result = await submittedItems.updateOne(filter, assignment, options);
  res.send(result);
});

// Get single assignment submit data
app.get('/submissions/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await submittedItems.findOne(query);
  res.send(result);
});

// Put method to update single assignment data
app.put('/update/:id', async (req, res) => {
  const id = req.params.id;
  const updatedAssignment = req.body;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const assignment = {
    $set: {
      title: updatedAssignment.title,
      subject: updatedAssignment.subject,
      description: updatedAssignment.description,
      date: updatedAssignment.date,
      thumbnail_url: updatedAssignment.photo,
      difficulty_level: updatedAssignment.level,
    },
  };
  const result = await assignments.updateOne(filter, assignment, options);
  res.send(result);
});

// Booking get via email
app.get('/my-assignments', async (req, res) => {
  console.log(req.query.email);
  // console.log('Token from client', req.cookies.token);
  // if (req.query.email !== req.user.email) {
  //   return res.status(403).send({ massage: 'forbidden access' });
  // }
  let query = {};
  if (req.query?.email) {
    query = { email: req.query.email };
  }
  console.log(query);
  const result = await submittedItems.find(query).toArray();
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
