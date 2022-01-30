import dishesConst from './dishesConst.js';
import { assert, expect, should } from 'chai';
import createUI from "./createUI.js";
import installOwnCreateElement from "./jsxCreateElement.js";

const DinnerModel= require('../src/'+TEST_PREFIX+'DinnerModel.js').default;

const Summary= require('../src/vuejs/'+TEST_PREFIX+'summaryPresenter.js').default;
const SummaryView= require('../src/views/'+TEST_PREFIX+'summaryView.js').default;

let SidebarView;
let Sidebar;
const X= TEST_PREFIX;
try{
    SidebarView= require('../src/views/'+X+'sidebarView.js').default;
    Sidebar= require('../src/vuejs/'+X+'sidebarPresenter.js').default;
}catch(e){};

const App= require('../src/views/'+TEST_PREFIX+'app.js').default;

const VueRoot=require("/src/vuejs/"+TEST_PREFIX+"VueRoot.js").default;

const {render, h}= require("vue");

const {shoppingList, dishType, menuPrice}=require("/src/"+TEST_PREFIX+"utilities.js");


function getDishDetails(x){ return dishesConst.find(function(d){ return d.id===x;});}




describe("TW1.5 Array rendering", function() {
    this.timeout(200000);  // increase to allow debugging during the test run

    before(function(){
        if(!SidebarView || !Sidebar) this.skip();
    });

    it("SummaryView table content", function(){
        window.React={createElement:h};
        const div= createUI();
        const ingrList=shoppingList([getDishDetails(2), getDishDetails(100), getDishDetails(200)]);
        const ppl=3;
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
            document.body.append(tds[2]); // we append the TD to the document, for style.css to take effect
            try{
                expect(window.getComputedStyle(tds[2])["text-align"]).to.equal("right", "align quantities to the right using CSS");
            }finally{
                document.body.lastElementChild.remove();
            }
        });
    });

    it("SummaryView table order", function(){
        window.React={createElement:h};
        const div= createUI();
        const ingrList=shoppingList([getDishDetails(2), getDishDetails(100), getDishDetails(200)]);
        const ppl=3;
        render(<SummaryView people={ppl} ingredients={ingrList}/>, div);

        const [x,...rows]= [...div.querySelectorAll("tr")];  // ignore header

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
    
    it("Vue Summary presenter passes ingredients prop (shopping list)", function(){
        installOwnCreateElement();
        const dishes= [getDishDetails(1), getDishDetails(100), getDishDetails(201)];
        const model= {numerOfGuests:3, dishes};
        
        const rendering=Summary({model});

        expect(rendering.props).to.be.ok;
        expect(rendering.props.ingredients).to.deep.equal(shoppingList(dishes));
    });

    it("SidearView table content", function(){
        window.React={createElement:h};
        const div= createUI();
        const dishes=[getDishDetails(2), getDishDetails(100), getDishDetails(200)];
        const ppl=3;
        const lookup=  dishes.reduce(function(acc, dish){ return {...acc, [dish.title]:{...dish, type: dishType(dish) }}; }, {});
        
        render(<SidebarView number={ppl} dishes={dishes}/>, div);

        [...div.querySelectorAll("tr")].forEach(function(tr, index, arr){
            const tds= tr.querySelectorAll("td");            
            expect(tds.length).to.equal(4, "dish table must have 4 columns");
            expect(tds[3].textContent.trim()[tds[3].textContent.trim().length-3]).to.equal(".", "price and total must be shown with two decimals, use (someExpr).toFixed(2)");  
            document.body.append(tds[3]);
            try{  // we append the TD to the document, for style.css to take effect
                expect(window.getComputedStyle(tds[3])["text-align"]).to.equal("right", "align dish prices and total to the right using CSS");
            }finally{
                document.body.lastElementChild.remove();
            }            
            if(index==arr.length-1){
                expect(tds[3].textContent.trim()).to.equal((menuPrice(dishes)*ppl).toFixed(2), "last row must show total menu price multiplied by number of guests");
                return;
            }
            expect(lookup[tds[1].textContent.trim()]);
            expect(lookup[tds[1].textContent.trim()].type).to.equal(tds[2].textContent.trim(), "3rd column must show dish type");
            expect((lookup[tds[1].textContent.trim()].pricePerServing*ppl).toFixed(2)).to.equal(tds[3].textContent.trim(), "last column must show total menu price multiplied by number of guests");

        });
    });

    it("SidebarView table order", function(){
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
    
    it("Vue Sidebar presenter passes dishes prop", function(){
        installOwnCreateElement();
        const dishes= [getDishDetails(1), getDishDetails(100), getDishDetails(201)];
        const model= {numberOfGuests:3, dishes};
        
        const rendering= Sidebar({model});

        expect(rendering.props).to.be.ok;
        expect(rendering.props.dishes).to.deep.equal(dishes);
    });

    it("Vue Sidebar presenter passes two dish-related custom event handlers: one removes dish, the other sets currentDish", function(){
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
        div.querySelectorAll("a")[0].click();    // click the first link
        expect(buttonPressed).to.equal(getDishDetails(1), "SidebarView fires custom events links and sends a dish as parameter");      
    });
    it("Integration test: pressing UI X buttons removes dishes in Model", async function(){
        window.React={createElement:h};

        let div= createUI();

        render(<VueRoot />,div);
        let myModel= require("/src/vuejs/"+TEST_PREFIX+"VueRoot.js").proxyModel;

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
    });

    it("Integration test: clicking on dish names sets model.currentDish", async function(){
        window.React={createElement:h};

        let div= createUI();

        render(<VueRoot />,div);
        let myModel= require("/src/vuejs/"+TEST_PREFIX+"VueRoot.js").proxyModel;

        myModel.addToMenu(getDishDetails(200));
        myModel.addToMenu(getDishDetails(2));
        myModel.addToMenu(getDishDetails(100));
        myModel.setNumberOfGuests(5);

        await new Promise(resolve => setTimeout(resolve));  // need to wait a bit for UI to update...
        
        expect(div.querySelectorAll("a").length).to.equal(3, "There should be 3 links, one for each dish");

        // nice idea but this hits the API so we comment it out. The SidebarView custom event firing check addresses this.
        //div.querySelectorAll("a")[1].click();
        //expect(myModel.currentDish).to.equal(100);
    });
});
