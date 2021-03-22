'use strict';

const extractEntity = (nlp, entity) =>{
  //console.log(nlp.intents[0].confidence);
  if (nlp.intents[0] == undefined || nlp.entities[`${entity}:${entity}`] == undefined){
    return null;
  }
  if (nlp.intents[0].confidence < 0.6 || ( (Object.keys( nlp.entities ).length === 1) && (nlp.intents[0].name === "movieinfo" || nlp.intents[0].name === "releaseYear")  && entity === "releaseYear") || ( (Object.keys( nlp.entities ).length === 2) && nlp.intents[0].name != "movieinfo" && entity === "releaseYear")) {
    //console.log(nlp.entities[entity]);
    //console.log(nlp.entities[`${entity}:${entity}`][0].body);
    return null;
  }
  else{
    return nlp.entities[`${entity}:${entity}`][0].value;;
  }
}

module.exports = extractEntity;