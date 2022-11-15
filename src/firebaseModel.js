// Add relevant imports here
import firebaseConfig from "/src/firebaseConfig.js";
import { getDishDetails } from "./dishSource.js";
import DinnerModel from "./DinnerModel.js";
// Initialise firebase
firebase.initializeApp(firebaseConfig);
const REF = "dinnerModel78";
function observerRecap(model) {
  model.addObserver(function observerACB(payload) {
    console.log(payload);
  });
}
function firebaseModelPromise() {
  async function makeBigPromiseACB(firebaseData) {
    function getDishDetailsPromiseCB(dishId) {
      return getDishDetails(dishId);
    }
    function createModelACB(dishArray) {
      return new DinnerModel(firebaseData.val().numberOfGuests, dishArray);
    }
    if (
      firebaseData.val() &&
      firebaseData.val().addedDishes &&
      firebaseData.val().numberOfGuests
    ) {
      const dishPromiseArray = Object.keys(firebaseData.val().addedDishes).map(
        getDishDetailsPromiseCB
      );
      return Promise.all(dishPromiseArray).then(createModelACB);
    } else {
      function createModelWithEmptyDatabaseACB(dishArray) {
        return new DinnerModel(2, dishArray);
      }
      return Promise.all([]).then(createModelWithEmptyDatabaseACB);
    }
  }
  return firebase.database().ref(REF).once("value").then(makeBigPromiseACB);
}
function updateFirebaseFromModel(model) {
  model.addObserver(function observerACB(payload) {
    if (payload) {
      if (payload.hasOwnProperty("nrOfGuests"))
        firebase
          .database()
          .ref(REF + "/numberOfGuests")
          .set(model.numberOfGuests);
      else if (payload.hasOwnProperty("currDish"))
        firebase
          .database()
          .ref(REF + "/currentDish")
          .set(model.currentDish);
      else if (payload.hasOwnProperty("addDish"))
        firebase
          .database()
          .ref(REF + "/addedDishes/" + payload.addDish.id)
          .set(payload.addDish.title);
      else if (payload.hasOwnProperty("removeDish"))
        firebase
          .database()
          .ref(REF + "/addedDishes/" + payload.removeDish.id)
          .set(null);
    }
  });
  return;
}
function updateModelFromFirebase(model) {
  firebase
    .database()
    .ref(REF + "/numberOfGuests")
    .on("value", function guestsChangedInFirebaseACB(firebaseData) {
      model.setNumberOfGuests(firebaseData.val());
    });
  firebase
    .database()
    .ref(REF + "/currentDish")
    .on("value", function currentDishChangedInFirebaseACB(firebaseData) {
      model.setCurrentDish(firebaseData.val());
    });
  firebase
    .database()
    .ref(REF + "/addedDishes")
    .on("child_added", function fetchDishDataBasedOnIDACB(data) {
      function isDishInMenuCB(dish) {
        return dish.id === +data.key;
      }
      if (!model.dishes.some(isDishInMenuCB))
        getDishDetails(+data.key).then(function addDishToMenuACB(dish) {
          model.addToMenu(dish);
        });
    });
  firebase
    .database()
    .ref(REF + "/addedDishes")
    .on("child_removed", function removeDishFromMenuACB(data) {
      model.removeFromMenu({ id: +data.key });
    });
  return;
}
// Remember to uncomment the following line:
export {
  observerRecap,
  firebaseModelPromise,
  updateFirebaseFromModel,
  updateModelFromFirebase,
};
