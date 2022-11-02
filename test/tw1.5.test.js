import dishesConst from './dishesConst.js';
import { assert, expect, should } from 'chai';
import createUI from "./createUI.js";
import installOwnCreateElement from "./jsxCreateElement.js";

let SidebarView;
let SummaryView;
let Sidebar;
let utilities;
const X= TEST_PREFIX;
try{
    utilities = require("/src/"+TEST_PREFIX+"utilities.js");
    SidebarView= require('../src/views/'+X+'sidebarView.js').default;
    SummaryView= require('../src/views/'+X+'summaryView.js').default;
    Sidebar= require('../src/vuejs/'+X+'sidebarPresenter.js').default;
}catch(e){};

const {render, h}= require("vue");

const {shoppingList, dishType, menuPrice}=utilities;


function getDishDetails(x){ return dishesConst.find(function(d){ return d.id===x;});}

describe("TW1.5 Array rendering", function tw1_5() {
    this.timeout(200000);  // increase to allow debugging during the test run

    before(function tw1_5_before(){
        if(!SidebarView || !Sidebar) this.skip();
    });

    it("SummaryView table content", function tw1_5_1(){
        window.React={createElement:h};
        const ppl=3;

        // 3 dishes, 2 guests
        const div= createUI();
        const ingrList=shoppingList([getDishDetails(2), getDishDetails(100), getDishDetails(200)]);
        checkSummaryViewArrayRendering(SummaryView, ingrList, ppl, div, true)
        
        // 2 dishes, 2 guests
        const div2 = createUI();
        const ingrList2=shoppingList([getDishDetails(2), getDishDetails(100)]);
        checkSummaryViewArrayRendering(SummaryView, ingrList2, ppl, div2)

        // Function to check that the SummaryView renders correctly
        // Called mulitple times with different array sizes to test that array rendering is performed correctly
        function checkSummaryViewArrayRendering(SummaryView, ingrList,ppl, div, checkCSS=false) {
            const lookup=  ingrList.reduce(function(acc, ingr){ return {...acc, [ingr.name]:ingr}; }, {});
            render(<SummaryView people={ppl} ingredients={ingrList}/>, div);

            [...div.querySelectorAll("tr")].forEach(function(tr, index){
                const tds= tr.querySelectorAll("td");
                
                if(!tds.length){
                    expect(tr.querySelectorAll("th").length).to.equal(4);
                    expect(index).to.equal(0);  // must be first row
                    return;
                }
                expect(tds.length).to.equal(4);
                expect(lookup[tds[0].textContent.trim()]);
                expect(lookup[tds[0].textContent.trim()].aisle).to.equal(tds[1].textContent.trim(), "aisle must be shown in column 2");
                expect(lookup[tds[0].textContent.trim()].unit).to.equal(tds[3].textContent.trim(), "measurement unit must be shown in last column");
                expect((lookup[tds[0].textContent.trim()].amount*ppl).toFixed(2)).to.equal(tds[2].textContent.trim(), "amount must be shown in column 3, multiplied by number of guests");
                expect(tds[2].textContent.trim()[tds[2].textContent.trim().length-3]).to.equal(".", "amount must be shown with two decimals, use (someExpr).toFixed(2)"); 
                document.body.lastElementChild.append(tds[2]); // we append the TD to the document, for style.css to take effect
                if(!checkCSS) return;
                try{
                    expect(window.getComputedStyle(tds[2])["text-align"]).to.equal("right", "align quantities to the right using CSS");
                }finally{
                    document.body.lastElementChild.firstChild.remove();
                }
            });
        }

    });

    it("SummaryView table order", function tw1_5_2(){
        window.React={createElement:h};
        const div= createUI();
        const ingrList=shoppingList([getDishDetails(2), getDishDetails(100), getDishDetails(200)]);
        const ppl=3;
        render(<SummaryView people={ppl} ingredients={ingrList}/>, div);

        const [x,...rows]= [...div.querySelectorAll("tr")];  // ignore header
        expect(rows.length, "there should be as many table rows as ingredients").to.equal(ingrList.length);
        
        rows.forEach(function(tr, index){
            if(!index) return;
            const tds= tr.querySelectorAll("td");
            const prevTds= rows[index-1].querySelectorAll("td");
            if(tds[1].textContent.trim()===prevTds[1].textContent.trim())
                assert.operator(tds[0].textContent.trim(), ">=", prevTds[0].textContent.trim());
            else
                assert.operator(tds[1].textContent.trim(), ">", prevTds[1].textContent.trim());
        });
    });
    
    it("Vue Summary presenter passes ingredients prop (shopping list)", function tw1_5_3(){
        installOwnCreateElement();
        const dishes= [getDishDetails(1), getDishDetails(100), getDishDetails(201)];
        const model= {numberOfGuests:3, dishes};
        let Summary;
        try {
        Summary= require('../src/vuejs/'+TEST_PREFIX+'summaryPresenter.js').default;
        } catch(e){console.log(e);};
        const rendering=Summary({model});
        
        expect(rendering.tag).to.equal(SummaryView);
        expect(rendering.props).to.be.ok;
        expect(rendering.props.people).to.equal(3);
        expect(rendering.props.ingredients).to.deep.equal(shoppingList(dishes));
    });

    it("SidearView table content", function tw1_5_4(){
        window.React={createElement:h};
        const ppl=3;

        // 3 dishes, 3 guests
        const div= createUI();
        const dishes=[getDishDetails(2), getDishDetails(100), getDishDetails(200)];
        checkSidebarView(SidebarView, dishes, ppl, div);

        // 2 dishes, 3 guests
        const div2= createUI();
        const dishes2=[getDishDetails(100), getDishDetails(200)];
        checkSidebarView(SidebarView, dishes2, ppl, div2, true);

        function checkSidebarView(SidebarView, dishes, ppl, div, checkCSS=false) {
        const lookup =  dishes.reduce(function(acc, dish){ return {...acc, [dish.title]:{...dish, type: dishType(dish) }}; }, {});
        render(<SidebarView number={ppl} dishes={dishes}/>, div);
        
        const trs= div.querySelectorAll("tr");
        expect(trs.length, "there should be table rows for each dish, plus the row for the totals").to.equal(dishes.length+1);

        [...trs].forEach(function(tr, index, arr){
            const tds= tr.querySelectorAll("td");            
            expect(tds.length).to.equal(4, "dish table must have 4 columns");
            expect(tds[3].textContent.trim()[tds[3].textContent.trim().length-3]).to.equal(".", "price and total must be shown with two decimals, use (someExpr).toFixed(2)");            
            if(index==arr.length-1){
                expect(tds[3].textContent.trim()).to.equal((menuPrice(dishes)*ppl).toFixed(2), "last row must show total menu price multiplied by number of guests");
                return;
            }
            expect(lookup[tds[1].textContent.trim()]);
            expect(lookup[tds[1].textContent.trim()].type).to.equal(tds[2].textContent.trim(), "3rd column must show dish type");
            expect((lookup[tds[1].textContent.trim()].pricePerServing*ppl).toFixed(2)).to.equal(tds[3].textContent.trim(), "last column must show total menu price multiplied by number of guests");
            if(!checkCSS) return;
            document.body.append(tds[3]);
            try{  // we append the TD to the document, for style.css to take effect
                expect(window.getComputedStyle(tds[3])["text-align"]).to.equal("right", "align dish prices and total to the right using CSS");
            }finally{
                document.body.lastElementChild.remove();
            }  
        });
    }
    });

    it("SidebarView table order", function tw1_5_5(){
        window.React={createElement:h};
        const div= createUI();
        const ppl=3;
        const dishes=[getDishDetails(200), getDishDetails(100), getDishDetails(2), getDishDetails(1)];
        render(<SidebarView number={ppl} dishes={dishes}/>, div);

        const rows= [...div.querySelectorAll("tr")];  // ignore header
        const knownTypes= ["starter", "main course", "dessert"];
        rows.forEach(function(tr, index, arr){
            if(!index)return;
            if(index==arr.length-1) return;
            const tds= tr.querySelectorAll("td");
            const prevTds= rows[index-1].querySelectorAll("td");
            assert.operator(knownTypes.indexOf(tds[2].textContent.trim()), ">=", knownTypes.indexOf(prevTds[2].textContent.trim()));
        });
    });
    
    it("Vue Sidebar presenter passes dishes prop", function tw1_5_6(){
        installOwnCreateElement();
        const dishes= [getDishDetails(1), getDishDetails(100), getDishDetails(201)];
        const model= {numberOfGuests:3, dishes};
        
        const rendering= Sidebar({model});

        expect(rendering.tag).to.equal(SidebarView);
        expect(rendering.props).to.be.ok;
        expect(rendering.props.dishes).to.deep.equal(dishes);
    });

    it("Vue Sidebar presenter passes two dish-related custom event handlers: one removes dish, the other sets currentDish", function tw1_5_7(){
        installOwnCreateElement();
        const dishes= [getDishDetails(1), getDishDetails(100), getDishDetails(201)];
        let latestCurrentDish;
        let latestRemovedDish;
        const model= {
            numberOfGuests:3,
            dishes,
            setCurrentDish(id){
                latestCurrentDish=id;
            },
            removeFromMenu(dish){
                latestRemovedDish=dish;
            }
            
        };
        
        const rendering= Sidebar({model});
        
        expect(rendering.tag).to.equal(SidebarView);
        expect(rendering.props).to.be.ok;
        const twoHandlers= Object.keys(rendering.props).filter(function(prop){
            return !["number", "dishes", "onNumberChange"].includes(prop);
        });
        expect(twoHandlers.length).to.equal(2);
        [1, 100, 201].forEach(function(testId){
            let foundSetCurrentDish, foundRemoveFromMenu;
            twoHandlers.forEach(function(handler){
                latestCurrentDish= undefined;
                latestRemovedDish= undefined;
                rendering.props[handler]( getDishDetails(testId));
                expect(latestCurrentDish || latestRemovedDish,"custom evvents handlers should call either setCurrentDish or removeFromMenu").to.be.ok;
                foundSetCurrentDish = foundSetCurrentDish || latestCurrentDish;
                foundRemoveFromMenu = foundRemoveFromMenu || latestRemovedDish;
            });
            expect(foundSetCurrentDish && foundRemoveFromMenu,"custom evvents handlers should call both setCurrentDish or removeFromMenu").to.be.ok;
        });

        let div = createUI();
        window.React = { createElement: h };
        let buttonPressed;
        function pressed(x){ buttonPressed=x;}
        render(h(SidebarView, {
            number:3,
            dishes,
            [twoHandlers[0]]: pressed,
            [twoHandlers[1]]: pressed
        }), div
              );
        div.querySelectorAll("button")[3].click(); // click the second X
        expect(buttonPressed).to.equal(getDishDetails(100), "SidebarView fires custom events from X buttons and sends a dish as parameter");
        buttonPressed=undefined;

        try{
            div.querySelectorAll("a")[0].click();    // click the first link
        }finally{window.location.hash="";}
        
        expect(buttonPressed).to.equal(getDishDetails(1), "SidebarView fires custom events links and sends a dish as parameter");      
    });
    
//    it("Integration test: pressing UI X buttons removes dishes in Model", async function(){
/*        let myModel= require("/src/vuejs/"+TEST_PREFIX+"VueRoot.js").proxyModel;

        myModel.addToMenu(getDishDetails(200));
        myModel.addToMenu(getDishDetails(2));
        myModel.addToMenu(getDishDetails(100));
        myModel.setNumberOfGuests(5);

        await new Promise(resolve => setTimeout(resolve));  // need to wait a bit for UI to update...

        const buttons= div.querySelectorAll("button");
        expect(buttons.length).to.be.gte(5, "There should be at least 5 buttons: +, - and 3 X for dishes");
        expect(buttons[0].textContent).to.equal("-", "first button must be minus");
        const sidebar= buttons[0].parentElement;
        expect(sidebar.querySelectorAll("button").length).to.equal(5, "There should be 5 buttons in sidebar: +, - and 3 X for dishes");
        buttons[4].click();
        expect(myModel.dishes.length).to.equal(2);
        expect(myModel.dishes).to.not.include(getDishDetails(200));

        await new Promise(resolve => setTimeout(resolve));  // need to wait a bit for UI to update...
        expect(sidebar.querySelectorAll("button").length).to.equal(4, "There should be 4 buttons after deletion: +, - and 2 X for dishes");
*/

/*    it("Integration test: clicking on dish names sets model.currentDish", async function(){
          let myModel= require("/src/vuejs/"+TEST_PREFIX+"VueRoot.js").proxyModel;

        myModel.addToMenu(getDishDetails(200));
        myModel.addToMenu(getDishDetails(2));
        myModel.addToMenu(getDishDetails(100));
        myModel.setNumberOfGuests(5);

        await new Promise(resolve => setTimeout(resolve));  // need to wait a bit for UI to update...
        
        expect(div.querySelectorAll("a").length).to.equal(3, "There should be 3 links, one for each dish");

        div.querySelectorAll("a")[1].click();
        expect(myModel.currentDish).to.equal(100);
        }finally{ window.fetch=oldFetch; window.location.hash=""; }
        */
});
