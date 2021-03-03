const fs = require("fs");
const path = require("path"); 
const express = require('express');
const { animals } = require('./data/animals');

const PORT = process.env.PORT || 3001;
const app = express();

function filterByQuery(query, animalsArray) {
  let personalityTraitsArray = [];
  // Note that we save the animalsArray as filteredResults here:
  let filteredResults = animalsArray;
  if (query.personalityTraits) {
    // Save personalityTraits as a dedicated array.
    // If personalityTraits is a string, place it into a new array and save.
    if (typeof query.personalityTraits === 'string') {
      personalityTraitsArray = [query.personalityTraits];
    } else {
      personalityTraitsArray = query.personalityTraits;
    }
    // Loop through each trait in the personalityTraits array:
    personalityTraitsArray.forEach(trait => {
      // Check the trait against each animal in the filteredResults array.
      // Remember, it is initially a copy of the animalsArray,
      // but here we're updating it for each trait in the .forEach() loop.
      // For each trait being targeted by the filter, the filteredResults
      // array will then contain only the entries that contain the trait,
      // so at the end we'll have an array of animals that have every one 
      // of the traits when the .forEach() loop is finished.
      filteredResults = filteredResults.filter(
        animal => animal.personalityTraits.indexOf(trait) !== -1
      );
    });
  }
  if (query.diet) {
    filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
  }
  if (query.species) {
    filteredResults = filteredResults.filter(animal => animal.species === query.species);
  }
  if (query.name) {
    filteredResults = filteredResults.filter(animal => animal.name === query.name);
  }
  // return the filtered results:
  return filteredResults;
}

function findById(id, animalsArray) {
  const result = animalsArray.filter(animal => animal.id === id)[0];
  return result;
}
function createNewAnimal(body, animalsArray) {
  const animal = body;
  animalsArray.push(animal);
  fs.writeFileSync(
    path.join(__dirname, "./data/animals.json"),
    //JSON.stringify convert and save the JavaScript array data as JSON
    JSON.stringify({ animals: animalsArray }, null, 2) //null argument means we dont want to edit existing data. The 2 indicates we want to create white space between our values to make it more readable. These are not required, but the animals.json file will look more organize and readable.
  );
  //our function's main code will go here!

  //return finished code to post route for response
  return animal;
}
//validating our data
function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false;
  }
  if(!animal.species || typeof animal.species !== "string") {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== "string")  {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true;
}

/*-app.get works as same as app.post
example:
app.post("/", (req, res) => {
  res.send("home")
}); 
note: worked this code with tutor.
app.get("/",(req, res) => {
  res.send("home")
});
-*/
// MIDDLEWARE FUNCTIONS!!!  to parse(convert) incoming string or array data

//another middleware function  'express.static()' method. It tells the server to make file "public" static resource. This means that all of our front-end code can now be accessed without having a specific server endpoint created for it!
//we always want to use this middleware creating a app
app.use(express.static("public"));

//express.urlencoded({extended: true}) is a method built into Express.js. It takes incoming POST data and converts it to key/value pairings that can be accessed in the req.body object. The extended: true option set inside the method call informs our server that there may be sub-array data nested in it as well, so it needs to look as deep into the POST data as possible to parse all of the data correctly.
app.use(express.urlencoded({ extended: true }));

//parse incoming JSON data
app.use(express.json());

//respond with "home" when a GET request is made to the homepage.
app.get('/api/animals', (req, res) => {
  let results = animals;
  if (req.query) {
    results = filterByQuery(req.query, results);
  }
  res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
  const result = findById(req.params.id, animals);
  if (result) {
    res.json(result);
  } else {
    res.send(404);
  }

});
//app.post() is a method to create POST routes that accept incoming data from a client request.
app.post('/api/animals', (req, res) => {
  // set id based on what the next index of the array will be
  req.body.id = animals.length.toString();

  //if any data in req.body is incorrect, send 400 error back
  if (!validateAnimal(req.body)) {
    res.status(400).send("The animal is not properly formatted.");
  } else {
    //add animal to json file and animals array in this function
  const animal = createNewAnimal(req.body, animals);
  
  res.json(animal);
  }

  
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});



app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`);
});

  //to share app link:  https://<your-app>.herokuapp.com/api/animals

 //https://app-zoomaster.herokuapp.com/api/animals

 //We use Insomnia Core to test our POST requests while we wait for the zoo's front-end designer to give us client-side code.

