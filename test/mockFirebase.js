import {withMyFetch, myDetailsFetch, dishInformation} from "./mockFetch.js";

window.firebase={
    firebaseData:{},
    firebaseEvents:{
        value:{},
        child_added:{},
        child_removed:{},
    },
    initializeApp(){},
    database(){
        return {
            ref(x){
                if(!x)
                    window.firebase.emptyRef= true;
                else
                    if(x.slice(-1)=="/")
                        x=x.slice(0, -1); 
                return {
                    set(value){window.firebase.firebaseData[x]= value;},
                    on(event,f){window.firebase.firebaseEvents[event][x]= f;},
                    once(event,f){
                        window.firebase.firebaseRoot=x;
//                        expect(firebaseDataForOnce, "once is only supposed to be used for the initial promise").to.be.ok;
                        return Promise.resolve({
                            key:x,
                            val(){ return window.firebase.firebaseDataForOnce;}
                        });
                    },
                };
            }
        };
    }
};


async function findKeys(){
    window.firebase.firebaseData={};
    const DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;

    const model= new DinnerModel();
    require('../src/'+TEST_PREFIX+'firebaseModel.js').updateFirebaseFromModel(model);
    model.setNumberOfGuests(3);
    const numberKey= Object.keys(window.firebase.firebaseData)[0];
    
    window.firebase.firebaseData={};
    await withMyFetch(myDetailsFetch, function(){ model.setCurrentDish(8);});
    const currentDishKey= Object.keys(window.firebase.firebaseData)[0];
    
    window.firebase.firebaseData={};
    model.addToMenu(dishInformation);
    const dishesKey= Object.keys(window.firebase.firebaseData)[0].replace("/1445969", "");
    const root= longestCommonPrefix([numberKey, dishesKey, currentDishKey]);
    const num= numberKey.slice(root.length);
    const dishes= dishesKey.slice(root.length);
    const currentDish= currentDishKey.slice(root.length);
    
    return {numberKey, currentDishKey, dishesKey, num, dishes, currentDish, root};
}

function longestCommonPrefix(strs) {
    if (strs === undefined || strs.length === 0) { return ''; }
    
    return strs.reduce((prev, next) => {
        let i = 0;
        while (prev[i] && next[i] && prev[i] === next[i]) i++;
        return prev.slice(0, i);
    });
};

export {findKeys};
