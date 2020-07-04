'use strict';

class Memo {
  constructor(title, contents,label={}) {
    this.id = 0;
    this.title = title;
    this.contents = contents;
    this.datetime = new Date();
    this.label=label;
  }

  createDivTag() {
    let div = document.createElement("div");
    div.id='id_'+this.id
    div.textContent = this.contents;
    div.className="memo share";
    
    div.innerHTML = `
    <div contenteditable="true" class="textArea"  onkeyup="keyUp(this)">${this.title}</div>
    <div contenteditable="true" class="textArea"  onkeyup="keyUp(this)">${this.content}</div>
    <div id="id_${this.id}" class="label-area">`;
    
    Object.keys(this.label).forEach((key)=>{
    div.innerHTML += `<div label_id="${key}" class="label">${this.label[key]}</div>`;  
    })
    div.innerHTML += `
    </div>
    <div class="">
      <button type="button" name="button" onclick=removeObj(this)>削除_${this.id}</button>
    </div>
    <div class="other_menu">
      <ul class="gnav">
        <li>カラー 
          <ul id="id_${this.id}">
            <li id="def" onclick=changeColor(this)>def</li>
            <li id="red" onclick=changeColor(this)>赤</li>
            <li id="blue" onclick=changeColor(this)>青</li>
            <li id="yellow" onclick=changeColor(this)>黄</li>
          </ul>
        </li>
        <li id="id_${this.id}}" class="label-menu">ラベル
        </li>
      </ul>
    </div>
    `;
    
    div.addEventListener('DOMFocusOut', function(e) {
      console.log(e);
      console.log(this);
    }.bind(this));
    return div;
  }

}
window.onload = function() {
  // for (let i = 0; i < 10; i++) {
  //   let memo = new Memo();
  //   memo.id = i;
  //   document.querySelector(".memo_area").appendChild(memo.createDivTag());
  // }

  let g = new ApiManager();
  let memoObj = {}
  g.fetchAllData().then(function(json) {
    console.log(json)
    let res=JSON.parse(json);
    let resMemo = res.memo
    let resLabel= res.label
    let resLabelMiddle= res.labelMiddle
    console.log(res)
    
    resMemo.forEach(e => {
      Object.keys(res.labelMiddle).forEach(()=>{
        
      })
      let memo=new Memo(e.title, e.contents,resLabel[e.id]);
      console.log(memo)
        memo.id=e.id;
        memo.datetime=e.datetime;
        document.querySelector(".memo_area").appendChild(memo.createDivTag());
      memoObj = Object.assign(memoObj, {
        [e.id]:memo 
      })
    })
    console.log(memoObj)
  })

}


class ApiManager {
  constructor() {
    this.url = 'http://localhost:8888/keep/processingData.php';
    this.data = {
      test: 'ok'
    }
  }

  fetchAllData() {
    // 既定のオプションには * が付いています
    return fetch(this.url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
          // "Content-Type": "application/json; charset=utf-8",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: '&get=' + JSON.stringify(this.data), // 本文のデータ型は "Content-Type" ヘッダーと一致する必要があります
      })
      .then(function(response) {
        return response.text()
      });

  }

  // createMemo(Memo memo) {
  // 
  // }
  // 
  // deleteMemo(Memo memo) {
  // 
  // }
  // 
  // updateMemo(Memo memo) {
  // 
  // }
}