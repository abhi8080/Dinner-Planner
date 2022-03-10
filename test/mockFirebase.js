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
