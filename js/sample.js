'use strict';

class Memo {
    constructor(title, content){
        this.id = 0;
        this.title = title;
        this.content = content;
        this.datetime = new Date();
    }
    
    createLiTag(){
        let li = document.createElement("li");
        li.textContent = this.content;
        li.addEventListener('click' function(){
            console.log(this);
        }.bind(this));
    }
    
}

for(let i = 0; i<10; i++){
    let memo = new Memo();
    memo.id = i;
    document.getElementById("contents").appendChild(memo.createLiTag());
}


class ApiManager {
    constructor(){
        
    }
    
    fetchAllData(){
        
    }
    
    createMemo(Memo memo){
        
    }
    
    deleteMemo(Memo memo){
        
    }
    
    updateMemo(Memo memo){
        
    }
}