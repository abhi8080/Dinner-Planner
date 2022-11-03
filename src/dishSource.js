import {BASE_URL,API_KEY} from './apiConfig.js'
function treatHTTPResponseACB(response){ 
    if(response.status !== 200)
      throw "HTTP response is not 200"
    else {
        return response.json();
    }
 }

 function transformResultACB(object) {
    return object.results;
 }

 async function getDishDetails(id) {
    return fetch(BASE_URL+"recipes/"+id+"/information", {
        "method": "GET",             
        "headers": {                  
     'X-Mashape-Key': API_KEY,
    "x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
     }
    }
    )
    .then(treatHTTPResponseACB);
 }

 async function searchDishes(params) {
     return fetch(BASE_URL+"recipes/complexSearch?"+ new URLSearchParams(params), { 
         "method": "GET",              
         "headers": {                  
      'X-Mashape-Key': API_KEY,
     "x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
      } 
     }
     ).then(treatHTTPResponseACB).then(transformResultACB)
 }

 export {getDishDetails, searchDishes}