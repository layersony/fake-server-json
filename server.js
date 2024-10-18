const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3200;

// Path to the database JSON file
const dbFilePath = path.join(__dirname, 'db.json');

// Load existing data
let db = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));

// Use body-parser to parse form data
server.use(bodyParser.urlencoded({ extended: true }));

// Serve the index.html for listing collections
server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the newCollection.html for adding a new collection
server.get('/new-collection', (req, res) => {
  res.sendFile(path.join(__dirname, 'newCollection.html'));
});

// Endpoint to get all collections (used by client-side JS to show routes)
server.get('/collections', (req, res) => {
  const collections = Object.keys(db); // Get all collections in db.json
  res.json(collections); // Return as JSON
});

// Endpoint to delete an entire collection (route)
server.delete('/delete-collection/:collectionName', (req, res) => {
  const { collectionName } = req.params;

  if (db[collectionName]) {
    // Delete the collection from db.json
    delete db[collectionName];

    // Write the updated db back to file
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));

    res.status(200).json({ message: `Collection '${collectionName}' deleted successfully` });
  } else {
    res.status(404).json({ error: `Collection '${collectionName}' not found` });
  }
});

// Middleware to dynamically add collections via form
server.post('/add-collection', (req, res) => {
  const { collectionName, data } = req.body;

  if (collectionName && !db[collectionName]) {
    db[collectionName] = JSON.parse(data); // Add new collection with data
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2)); // Update db.json
  }

  res.redirect('/'); // Redirect to the index page after adding the collection
});

const router = jsonServer.router(dbFilePath);
server.use(middlewares);
server.use(router);

console.log(`Starting server.....`);
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
