'use strict';

const express = require('express');

const conf = require('./config');
const Fbeamer = require('./fbeamer');
const server = express();
const bodyParser = require('body-parser');
server.use(bodyParser.json())
const PORT = process.env.PORT || 3000;

const f = new Fbeamer(conf.FB);
//console.log(f.FBparam);
server.get('/', (req, res) => f.registerHook(req,res));
server.listen(PORT, () => console.log(`The bot server is running on port ${PORT}`));
/*
server.post('/', (req, res, data) => {return f.incoming(req, res, data => {
            let userData = f.messageHandler(data);
            console.log(userData);
})});
*/
server.get('/', (req, res) => f.registerHook(req,res));
server.post('/', (req, res, next) => {
  return f.incoming(req, res, async data => {
    if (data.length === 2){
      data = f.messageHandler(data);
      try{
        await f.txt(data.sender, `I'm sorry, I didn't understand the movie. Can you repeat ?`)
    }
    catch(e){
      console.log(e);
    }
    }
    
    else if (data.length === 4){
      let movie = data[2];
      let director = data[3][0];
      data = f.messageHandler(data);
      try{
        await f.txt(data.sender, `The movie ${movie[1]}, released the ${movie[2]}, was directed by ${director}.`)
        
      if (data.content === "img"){
         await f.img(data.sender, "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg")
      }
    }
    catch(e){
      console.log(e);
    }
    }
    else {
      let movie = data[2];
      data = f.messageHandler(data);
      try{
        await f.txt(data.sender, `The movie ${movie[1]} was released the ${movie[2]}. This is the overview :\n ${movie[3]}`)
    }
    catch(e){
      console.log(e);
    }
    }
    
    //console.log(data);

  });
});

