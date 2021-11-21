var budgetController=(function(){
//we want to distinguish between different income and expenses
//and we want them to have a unique ID

//a constructor =they are private
var Expense=function(id,description,value){
    this.id=id;
    this.description=description;
    this.value=value;
    this.percentage=-1;
};

Expense.prototype.calcPercentage= function(totalIncome){
    if(totalIncome>0){
        this.percentage=Math.round((this.value/ totalIncome)*100);
    }
    else{
        this.percentage=-1;
    }
};

Expense.prototype.getPercentage= function(){
    return this.percentage;
};

var Income=function(id,description,value){
    this.id=id;
    this.description=description;
    this.value=value;
};

var calculateTotal= function(type){
    var sum=0;
    //loop over the array over inc and exp
    //the for each get the current number(of income of expense). and  they both has a value in the ctor
    data.allItems[type].forEach(function(cur){
        sum=sum+cur.value;
    });
    data.totals[type]= sum;

};

var data={
    allItems:{
        exp:[],
        inc:[]
    },
    totals:{
        exp:0,
        inc:0
    },
    budget:0,
    percentage:-1 
};

return {
    addItem:function(type,des,val){
        var newItem, ID;

        //[1 2 4 6 8] next ID=9
        //ID=last ID+1
        if(data.allItems[type].length > 0){//checking if there is staff in the array
            //we get into the array and in the '2' [] we get into the last 
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        }
        else{
            ID=0;

        }
     
         // Create new item based on 'inc' or 'exp' type
        if (type === 'exp') {
            newItem = new Expense(ID, des, val);
        } else if (type === 'inc') {
            newItem = new Income(ID, des, val);
        }
        
        // Push it into our data structure
        data.allItems[type].push(newItem);
        
        // Return the new element
        return newItem;
    },

    deleteItem: function(type,id){
        var ids, index;
        //id=6
        //[1 2 4 6 8] index=3
        //we want an array of all id
        ids= data.allItems[type].map(function(current){
            return current.id;
        });
        index = ids.indexOf(id); //get here 3 in the index
        if(index!== -1){
            data.allItems[type].splice(index,1);
        }

    },

    calculateBudget: function(){
        //calculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');

        //Calculate the budget: income- expenses
        data.budget=data.totals.inc-data.totals.exp;

        //Calculate the percentage of income that we spent
        if(data.totals.inc>0){
            data.percentage=Math.round((data.totals.exp/ data.totals.inc)*100);
        }
        else{
            data.percentage=-1;
        }
        //expenses=100 and income=200, spent=50%=100/200*100 from the income 

    },

    calculatePercentages: function(){
        //a=20  b=10  c=40  income=100
        //a=20/100=20%  b=10/100=10%  c=40/100=40%
        //calculate the percentage for each of the exp in the array
        data.allItems.exp.forEach(function(current){
            current.calcPercentage(data.totals.inc);
        });
    },

    getPercentages: function(){
        var allPer=data.allItems.exp.map(function(cur){
            return cur.getPercentage();
        });
        return allPer;

    },

    getBudget: function(){
        return{
            budget: data.budget,
            totalIncome: data.totals.inc,
            totalExpense: data.totals.exp,
            percentage: data.percentage
        };

    },

    //a function in order to check
    testing:function(){
        console.log(data);
    }
};

})();

var UIComtroller=(function(){

    var DOMstrings={
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel:'.budget__title--month'

    };

    
    var formatNumber=function(num,type){
        var numSplit, dec, int;
        // + or - before number exactly 2 decimal points comma seperating the thousands
        //2310.4567-> + 2,310.46
        //2000-> +2,000.00

        num=Math.abs(num);
        num= num.toFixed(2);

        //we split the nuber to decimal part and integer part and it'll stored in array
        numSplit=num.split('.');//return string
        int=numSplit[0];
        //it means we have more then a thousand
        if(int.length>3){
            //sunstr= we start at position one and read 3 numbers
            int=int.substr(0,int.length-3) + ',' + int.substr(int.length-3,int.length); //gives us the first part of the number
        }
        dec=numSplit[1];
        return (type==='exp'?'-': '+') +' ' + int+'.'+dec;
    };

    var nodeListForEach=function(list,callback){
        for( var i=0; i<list.length;i++){
            callback(list[i],i);
        } 
    };

    return{
        getInput:function(){
            return{
            type:document.querySelector(DOMstrings.inputType).value,   //will be either inc or exp
            description:document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)

            };
            
        },
        //this object that we get is the same object that we created using a constructor
        //and then passed to our app controller(in newItem that the one wer'e send to this function)
        addListItem: function(obj,type){
            var html, newHtml,element;
            //create an html string with some placeholder text
            if(type ==='inc'){
                element=DOMstrings.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"> <i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element=DOMstrings.expensesContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
            }

            //replace the placeholder text with some actual data
            newHtml=html.replace('%id%', obj.id);
            newHtml=newHtml.replace('%description%', obj.description);
            newHtml=newHtml.replace('%value', formatNumber(obj.value,type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        },

        deleteListItem: function(selectorID){
            //this is the item that we want to remove
            var el=document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields:function(){
            var fields,fieldsArr;
            fields=document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr=Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current,index,array) {
                current.value= "";
                
            });
            //we select the first element and set the focus to the description
            fieldsArr[0].focus();

        },

        displayBudget: function(obj){
            //we compart the obj from the method get budget that we created on the budgetctrl
            var type;
            obj.budget>0? type='inc': type='exp';
            document.querySelector(DOMstrings.budgetLabel).textContent= formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent= formatNumber(obj.totalIncome,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent= formatNumber(obj.totalExpense,'exp');

            if(obj.percentage> 0){
                document.querySelector(DOMstrings.percentageLabel).textContent= obj.percentage + '%';
            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent= '---';

            }

        },

        displayPercentages: function(percentages){
            //we dont know how mant expenses is going to have on the list 
            //so we need to use the queryselectorall
            var fields=document.querySelectorAll(DOMstrings.expensesPercLabel); //return a node list
            
            nodeListForEach(fields,function(current,index){
                if(percentages[index]>0){
                    current.textContent=percentages[index] + '%'; //the first element we want the first percentage...
                }
                else{
                    current.textContent= '---';
                }
            });
        },

        displayMonth: function(){
            var now,year,month,months;
            now=new Date(); //it will return the date of today
            months=['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month=now.getMonth();
            year=now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent=months[month]+ ' ' + year;
        },

        changedType: function(){
            //all of this inputs will receive the red focus class- it returns a node list
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus'); 
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings:function(){
            return DOMstrings;
        }
    };

})();

var Controller=(function(budgetCtrl, UICtrl){
    var setupEventListeners = function() {
        var DOM=UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        //we want to do what you did in the last event listener when the user press on enter
        //we will undentified which key was pressed by keyCode(enter=13)
         
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
//when is someone click on this container this delete function will be called
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    };

    var updateBudget= function(){
        var budget;
        //calculate the budget
        budgetCtrl.calculateBudget();

        //return the budget
        budget= budgetCtrl.getBudget();

        //Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages=function(){
        //calculate percentages
        budgetCtrl.calculatePercentages();

        //Read percentages from the budget controller
        var per=budgetCtrl.getPercentages();

        //Update the UI with the new percentages
        UICtrl.displayPercentages(per);

    };

    var ctrlAddItem=function(){
        var input,newItem;
        //1.get the field input data
        input=UICtrl.getInput();

        //we want that all of the buttom will happened when there is an a significant data that we can use
        if(input.description!=="" && !isNaN(input.value) && input.value>0){
        //2. Add the item to the budgetController
        newItem=budgetCtrl.addItem(input.type, input.description, input.value);
        //3.Add the item to the UI
        UICtrl.addListItem(newItem,input.type);
        //4.Clear the fields
        UICtrl.clearFields();
        //calculate and update budget
        updateBudget();

        //calculate and update percentages
        updatePercentages();

        }
       
    };
//we need this event because we want to know what the event target is
    var ctrlDeleteItem= function(event){
        var itemID,splitID,type, ID;
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id; //it will give us the element that we clicked on it
        //we checked if this id is defined
        if(itemID){
            //inc-1
            splitID=itemID.split('-'); //return us all the elements that come before and after the '-'
            type=splitID[0];
            ID=parseInt(splitID[1]);

            // delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);

            //delete the item from the user interface
            UICtrl.deleteListItem(itemID);

            //Update and show the new budget
            updateBudget();

            //calculate and update percentages
        updatePercentages();


        }


    };

    return{
        init:function(){
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget:0,
                totalIncome:0,
                totalExpense:0,
                percentage:-1
            });
            setupEventListeners();
        }
    };


})(budgetController,UIComtroller);

Controller.init();