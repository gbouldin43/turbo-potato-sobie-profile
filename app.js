const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser')
const { ObjectId } = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;

//console.log(uri);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'))

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
//run().catch(console.dir);

async function getData() {

  await client.connect();
  let collection = await client.db("garrett-sobie-profile").collection("garrett-sobie-profile");

  let results = await collection.find({}).toArray();
    //.limit(50)
    //.toArray();
  
  console.log(results);
  return results;

}


app.get('/read', async function (req, res){
  let getDataResults = await getData();
  console.log(getDataResults);
  res.render('songs',
    { songData : getDataResults}
  )
})

app.post('/insert', async (req,res)=> {
//app.get('/insert', async (req,res)=> {
  console.log('in /insert');

  let newSong = req.body.myName;
  //let newSong = req.query.myName;

  await client.connect();

  await client.db("garrett-sobie-profile").collection("garrett-sobie-profile").insertOne({song: newSong});
    res.redirect('/read');
})

app.post('/update', async (req,res)=>{

  console.log("req.body: ", req.body)

  client.connect; 
  const collection = client.db("garrett-sobie-profile").collection("garrett-sobie-profile");
  let result = await collection.findOneAndUpdate( 

  {"_id": new ObjectId(req.body.nameID)}, 
  
  { $set: {"fname": req.body.inputUpdateName } }
)
.then(result => {
  console.log(result); 
  res.redirect('/');
})
});

app.post('/delete/:id', async (req,res)=>{

  console.log("in delete, req.parms.id: ", req.params.id)

  client.connect; 
  const collection = client.db("garrett-sobie-profile").collection("garrett-sobie-profile");
  let result = await collection.findOneAndDelete( 
    {
      "_id": new ObjectId(req.params.id)
    }
  ).then(result => {
  console.log(result); 
  res.redirect('/read');})

  

})


app.get('/', function (req, res) {
  res.sendFile('index.html')
})

app.post('/saveMyName', (req,res)=>{
  console.log('did we hit the endpoint?');

  console.log(req.body);

  //res.redirect('/ejs');

  res.render('words', {pageTitle: req.body.myName});
})

app.get('/saveMyNameGet', (req,res)=>{
  console.log('did we hit the endpoint?');

  console.log(req.query);

  let reqName = req.query.myNameGet;

  res.render('words', {pageTitle: reqName});

  //res.redirect('/ejs');
})

app.get('/ejs', function (req, res) {
  res.render('words', {pageTitle: 'my cool ejs page'});
})

app.get('/nodemon', function (req, res) {
  res.send('look ma, no kill node process')
})

//endpoint, middleware(s)
app.get('/helloRender', function (req, res) {
  res.send('Hello Express from Real World<br><a href="/">back to home</a>')
})

app.listen(port, ()=> console.log(`server is running on ... localhost:${port}`));