const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3200;

const dbFilePath = path.join(__dirname, 'db.json');

let db = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));

server.use(bodyParser.urlencoded({ extended: true }));

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

server.get('/new-collection', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/newCollection.html'));
});

server.get('/collections', (req, res) => {
  const collections = Object.keys(db); 
  res.json(collections); 
});

server.delete('/delete-collection/:collectionName', (req, res) => {
  const { collectionName } = req.params;

  if (db[collectionName]) {
    delete db[collectionName];

    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));

    res.status(200).json({ message: `Collection '${collectionName}' deleted successfully` });
  } else {
    res.status(404).json({ error: `Collection '${collectionName}' not found` });
  }
});

server.post('/add-collection', (req, res) => {
  const { collectionName, data } = req.body;

  if (collectionName && !db[collectionName]) {
    db[collectionName] = JSON.parse(data); 
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2)); 
  }

  res.redirect('/'); 
});

const router = jsonServer.router(dbFilePath);
server.use(middlewares);
server.use(router);

console.log(`Starting server.....`);
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
