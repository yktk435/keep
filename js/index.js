'use strict';


class Memo {
  constructor(title, contents) {
    this.id = 0;
    this.title = title;
    this.contents = contents;
    this.datetime = new Date();
    this.labelName = {}
    this.allLabel={}
    this.color = 'def';
    this.userId = 1;
    this.api = new ApiManager()
  }

  createDivTag() {
    let div = document.createElement("div");
    let templete='';
    div.id = 'id_' + this.id
    div.className = "memo share";
    div.setAttribute('color_id', this.color)

    templete = `
    <div contenteditable="true" class="textArea" >${this.title}</div>
    <div contenteditable="true" class="textArea" >${this.contents}</div>
    <div id="id_${this.id}" class="label-area">
    `;

    Object.keys(this.labelName).forEach((key) => {
      templete += `
      <div label_id="${key}" class="label">${this.labelName[key]}</div>
      `;
    })

    templete += `
    <div class="">
      <button type="button" name="button" >削除_${this.id}</button>
    </div>
    <div class="other_menu">
      <ul class="gnav">
        <li>カラー 
          <ul id="id_${this.id}" class="label-color">
            <li id="def"  >def</li>
            <li id="red"  >赤</li>
            <li id="blue"  >青</li>
            <li id="yellow"  >黄</li>
          </ul>
        </li>
        <li id="id_${this.id}" >ラベル
        <ul class="label-menu">
        <li><input type="text" class="add-label" maxlength="50" placeholder="ラベル名を入力" onkeypress="addLabel(event.keyCode,this);"></li>
        
        `;
    Object.keys(this.allLabel).forEach((key) => {
      templete += `<li label_id=${key}>${this.allLabel[key]}</li>`;
    })
    templete += `
        </ul>
        </li>
      </ul>
    </div>
    `;
    div.innerHTML=templete;

    //***************************************************//
    //addEventListenerの設定
    //***************************************************//
    Array.from(div.childNodes).forEach((e) => {
      if (e.nodeName && e.nodeName != '#text') {


        if (e.querySelector('.label-color')) {

          let target = e.querySelector('.label-color');

          //色をクリック
          target.addEventListener('click', function(event) {
            //console.log(this) //このときすでに this.color = event.target.id; が実行されている。。。。。。。？？
            div.setAttribute('color_id', event.target.id)
            this.color = event.target.id;
            this.api.updateMemo(this)
          }.bind(this))
        }
        if (e.querySelector('button')) { //削除ボタン
          let button = e.querySelector('button')
          button.addEventListener('click', function(event) {
            this.removeDivTag(div);

          }.bind(this))
        }
        if (e.querySelector('.label-menu')) {//ラベルをクリックしたとき
           let li = e.querySelector('.label-menu').children
           let labelId;
           Object.keys(li).forEach((key)=>{
             li[key].addEventListener('click',function(event){
               labelId=li[key].getAttribute('label_id')
               
               if(!Object.keys(this.labelName).find(item => item === labelId)){
                 console.log('そのまま')
                 console.log(Object.keys(this.labelName))
                 this.labelName=Object.assign(this.labelName,{[labelId]:li[key].innerText})                  
                 console.log('そのまま')
               }else{//すでにそのラベルが付いてるなら
                 //ラベル削除
                 console.log(this.labelName)
                 console.log(labelId)
                 delete this.labelName[labelId]
               }
               console.log(this.labelName)
               this.api.updateMemo(this)
               
             }.bind(this))
           })
           
        }
      }
    })
    div.addEventListener('DOMFocusOut', function(e) {

    }.bind(this));

    div.addEventListener('keyup', function(e) {
      this.title = div.children[0].innerText
      this.contents = div.children[1].innerText
      console.log(this)
      this.api.updateMemo(this)
    }.bind(this));
    return div;
  }
  updateDivTag() {
    let div = document.querySelector('#id_' + this.id);
    div.children[0] = this.title
    div.children[1] = this.contents
    div.setAttribute('color_id', this.color)
  }
  removeDivTag(div) {
    div.remove();
    this.api.deleteMemo(this.id);
  }
}

function keyUp(obj) {
  console.log(obj)
  console.log(this)
  console.log('▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽  keyUp  ▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽')
  let id = obj.parentNode.id
  if (setTimeoutId) {
    clearTimeout(setTimeoutId);
  }
  setTimeoutId = setTimeout(() => {
    if (id == CREATE) { //新規メモ作成・更新
      if (FLAG) { //新規メモの要素を非表示で作成しているならDBへの更新と非表示になっている要素への反映
        //新規メモ更新
        updateNewMemo();
      } else { //新規メモ作成
        postData(url, CREATE, idToData(CREATE));
      }
    } else { //メモ更新
      postData(url, 'update', idToData(toId(id)));
    }
  }, 500);
  console.log('▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  keyUp終わり  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲')
}



class Label {
  constructor(label) {
    this.label = label;
  }
  toDivTag() {
    let div = document.querySelector('div')
    div.style = 'order: 1px solid #d5d2d2;';

    Object.keys(this.label).forEach((key) => {
      div.setAttribute('label_id', key);
      div.innerText = this.label[key];
    })
  }
}
class LabelMiddle {
  constructor(label, labelMiddle) {
    this.label = label;
    this.labelMiddle = labelMiddle;
  }
  getLabelName(memoId) { //メモIDを指定して紐付いているラベルを取得できる。{labelId:labelName}
    let labelName = {}
    Object.keys(this.labelMiddle).forEach((key) => {
      if (key == memoId) {
        Object.keys(this.labelMiddle[key]).forEach((e) => {
          labelName = Object.assign(labelName, {
            [this.labelMiddle[key][e]]: this.label[this.labelMiddle[key][e]]
          })
        })
      }
    })

    return labelName;
  }
}

class Color {
  constructor() {

  }
}

class ApiManager {
  constructor() {
    this.url = 'http://localhost:8888/keep/processingData.php';
    this.postData = {}
  }

  fetchAllData(key = 'get', postData = {}) {
    // 既定のオプションには * が付いています
    return fetch(this.url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: '&' + key + '=' + JSON.stringify(postData),
      })
      .then(function(response) {
        return response.text()
      });
  }
  toDatetime(now) {
    let Year = now.getFullYear();
    let Month = now.getMonth() + 1;
    let Date = now.getDate();
    let Hour = now.getHours();
    let Min = now.getMinutes();
    let Sec = now.getSeconds();
    return Year + "/" + Month + "/" + Date + " " + Hour + ":" + Min + ":" + Sec;
  }

  // createMemo(Memo memo) {
  // 
  // }
  // 
  deleteMemo(memoId) {
    console.log(memoId)
    this.fetchAllData('remove', {
      id: memoId
    }).then(function(json) {
      console.log(json)
      json = JSON.parse(json)
      console.log(json)
    })
  }

  updateMemo(memo) {
    console.log(memo)
    this.postData = Object.assign({}, {
      id: memo.id,
      title: memo.title,
      contents: memo.contents,
      datetime: this.toDatetime(new Date()),
      color_id: memo.color,
      label_id: 1,
      user_id: 1,
      labelName:memo.labelName
    })
    this.fetchAllData('update', this.postData).then(function(json) {
      console.log(json)
      json = JSON.parse(json)
      console.log(json)
    })
  }
}

window.onload = function() {
  let subMenu = document.querySelector('.aaaa');
  subMenu.addEventListener('mouseover', function() {
    console.log('ddsad')
  })

  let api = new ApiManager();
  let memoObj = {}
  let label;
  api.fetchAllData().then(function(json) {
    console.log(json)
    let res = JSON.parse(json);
    console.log(res)
    let resMemo = res.memo
    let resLabel = res.label
    console.log(resLabel)
    let resLabelMiddle = res.labelMiddle
    console.log(resLabelMiddle)
    label = new LabelMiddle(resLabel, resLabelMiddle)
    //console.log(label.getLabelName('921'))
    resMemo.forEach(e => {
      let memo = new Memo(e.title, e.contents);

      memo.id = e.id;
      memo.datetime = e.datetime;
      memo.color = e.color_id;
      memo.allLabel=res.label
      console.log(memo.allLabel)
      memo.labelName = label.getLabelName(memo.id)
      console.log(memo.labelName)

      document.querySelector(".memo_area").appendChild(memo.createDivTag());

      memoObj = Object.assign(memoObj, {
        [e.id]: memo
      })
    })
  })
}
