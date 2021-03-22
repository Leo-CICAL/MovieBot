'use strict';
const request = require('request');
const axios = require('axios');
const apiVersion = 'v10.0';
const tmdb = require('../tmdb')


class FBeamer{

    constructor({pageAccessToken, VerifyToken}){
        try{
            this.FBparam = [pageAccessToken,VerifyToken];
        }
        catch(error){
            console.log(error);
        }
    }
    registerHook(req,res) {
        const params= req.query;
        const mode = params['hub.mode'],
        token = params['hub.verify_token'],
        challenge = params['hub.challenge'];
        
        try{
            if (mode === 'subscribe' && token === this.FBparam[1]){
                console.log('Webhook is registered !');
                return res.send(challenge);
            } else {
                console.log('Could not registered Webhook !');   
                return res.sendStatus(200);    
            } 
        }
        catch(e){
            console.log(e);
        }
    }
    
    
    messageHandler(obj) {
      let sender = obj[0].id;
      let message = obj[1];
      if (message.text){
        let object = {
          sender,
          type: 'text',
          content: message.text
        }
        return (object)
      }
      
    }

    getMovieData(movie,releaseYear = null){
    return new Promise(async (resolve, reject) => {
        try{
            const movieinfo = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=b8e024ea37cfcaaad09ee08500978409&language=en-US&query=${movie}&primary_release_year=${releaseYear}`,
            );
            let result = [movieinfo.data.results[0].id,movieinfo.data.results[0].title,movieinfo.data.results[0].release_date, movieinfo.data.results[0].overview];
            resolve(result)
        }
        catch(error){
            reject(error);
        }
    })
    }

    getDirectorData(id_movie){
    return new Promise(async (resolve, reject) => {
        try{
            const movieinfo = await axios.get(`https://api.themoviedb.org/3/movie/${id_movie}?api_key=b8e024ea37cfcaaad09ee08500978409&append_to_response=credits`,
            );
            resolve(movieinfo.data)
        }
        catch(error){
            reject(error);
        }
    })
    }

    incoming(req,res,cb) {
      //console.log(req);
      res.sendStatus(200);
      if(req.body.object  === 'page' && req.body.entry){
        let data = req.body;
        //console.log(data.entry);
        //const data = request.body;
        const messageObj = data.entry;
        if (!messageObj[0].messaging){
          console.log("Error message");}
        else{
          let obj = [messageObj[0].messaging[0].sender, messageObj[0].messaging[0].message];
          if (tmdb(messageObj[0].messaging[0].message.nlp,'movie')== null){
            return cb(obj);
          }
          else{

          
          this.getMovieData(tmdb(messageObj[0].messaging[0].message.nlp,'movie'),tmdb(messageObj[0].messaging[0].message.nlp,'releaseYear')).then((data) => {
            let obj = [messageObj[0].messaging[0].sender, messageObj[0].messaging[0].message,data];
            if (messageObj[0].messaging[0].message.nlp.intents[0].name != "director"){
              return cb(obj);
            }
            else{
              this.getDirectorData(data[0]).then((data) => {
              var directors = [];
              data.credits.crew.forEach(function(entry){
                if (entry.job === 'Director') {
                directors.push(entry.name);
              }
              })
              obj.push(directors);
              return cb(obj);
            })
            
          }
          });
          }

          
        }

      }
    }
    
    sendMessage(payload){
      return new Promise((resolve, reject) => {
      request({
        uri: "https://graph.facebook.com/v10.0/me/messages?access_token=EAACgkCYO8PoBAIUcewPkrfEmKSLRICWAZCFos4I112syF0Vp8iRxyuE2L4uatGGObxS9sb0PCVRDvcuhcdl4pZCFpjZAkwbUTsfSl7nvGKPGNqKbgZAX44lZAOcKc4hV3laJRbKsgYPtGeeUF0agJQuGeYfpWq8ZBkZCU9uktaaHwZDZD",
        qs:{
          access_token : this.pageAccessToken
        },
        method: 'POST',
        json: payload
      }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          resolve({
            messageId: body.message_id
          });
        } else {
          //console.log(response.statusCode);
          reject(error);
        }
      });
    });
    }

    txt(id, text, messaging_type = 'RESPONSE'){
      let obj = {
        messaging_type,
        recipient:{
          id
        },
        message: {
          text
        }
      }
      return this.sendMessage(obj);

    }

    img(id, url_img, messaging_type = 'RESPONSE'){
      let obj = {
        messaging_type,
        recipient:{
          id
        },
        message: {
          attachment:{
            type: "image",
            payload: {
              url: url_img,
            }
          }
        }
      }
      return this.sendMessage(obj);

    }
    
    
}


module.exports = FBeamer;