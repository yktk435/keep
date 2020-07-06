'use strict';


class Memo {
  constructor(title, contents) {
    this.id = 0;
    this.title = title;
    this.contents = contents;
    this.datetime = new Date();
    this.labelName = {}
    this.color = 'def';
    this.userId = 1;
    this.api = new ApiManager()
  }

  createDivTag() {
    let div = document.createElement("div");
    div.id = 'id_' + this.id
    div.className = "memo share";
    div.setAttribute('color_id', this.color)

    div.innerHTML = `
    <div contenteditable="true" class="textArea" >${this.title}</div>
    <div contenteditable="true" class="textArea" >${this.contents}</div>
    <div id="id_${this.id}" class="label-area">
    `;

    Object.keys(this.labelName).forEach((key) => {
      div.innerHTML += `
      <div label_id="${key}" class="label">${this.labelName[key]}</div>
      `;
    })

    div.innerHTML += `
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
        <li id="id_${this.id}" class="label-menu">ラベル
        </li>
      </ul>
    </div>
    `;

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
        } else if (e.querySelector('button')) { //削除ボタン
          let button = e.querySelector('button')
          button.addEventListener('click', function(event) {
            this.removeDivTag(div);
          }.bind(this))
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
          "Content-Type": "application/x-www-form-urlencoded",
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
    }).then(function(json){
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
      user_id: 1
    })
    this.fetchAllData('update', this.postData).then(function(json) {
      console.log(json)
      json = JSON.parse(json)
      console.log(json)
    })
  }
}

window.onload = function() {
  // for (let i = 0; i < 10; i++) {
  //   let memo = new Memo();
  //   memo.id = i;
  //   document.querySelector(".memo_area").appendChild(memo.createDivTag());
  // }

  let api = new ApiManager();
  let memoObj = {}
  let label;
  api.fetchAllData().then(function(json) {
    console.log(json)
    let res = JSON.parse(json);
    // console.log(res)
    let resMemo = res.memo
    let resLabel = res.label
    let resLabelMiddle = res.labelMiddle
    label = new LabelMiddle(resLabel, resLabelMiddle)
    console.log(label.getLabelName('921'))
    resMemo.forEach(e => {
      let memo = new Memo(e.title, e.contents);

      memo.id = e.id;
      memo.datetime = e.datetime;
      memo.color = e.color_id;
      memo.labelName = label.getLabelName(memo.id)

      document.querySelector(".memo_area").appendChild(memo.createDivTag());

      memoObj = Object.assign(memoObj, {
        [e.id]: memo
      })
    })
  })
}

window.onmouseout = function(e) {

  let subMenu = document.querySelector('.aaaa');
  let subTop = subMenu.getBoundingClientRect().top;
  let subLeft = subMenu.getBoundingClientRect().left;
  let subHeight = subMenu.getBoundingClientRect().height;
  let memoId;
  //console.log(e.toElement)
  if (e && e.toElement.className.match(/label-menu/)) { //クラス名がlabel-menuだったら
    memoId = e.toElement.id;
    if (memoId != '') {
      subMenu.id = memoId;
    }


    let li = e.toElement.getBoundingClientRect()
    // console.log('li=top=' + li.top);
    // console.log('li=left=' + li.left);
    // console.log('li=height=' + li.height);

    subMenu.style.top = String(li.top + li.height - 5) + "px";
    subMenu.style.left = li.left + "px";
  } else if (e && (e.target.className.match(/aaaa/) || e.target.parentNode.className.match(/aaaa/) || e.toElement.className.match(/aaaa/) || e.toElement.parentNode.className.match(/aaaa/))) {
    //継続
  } else {
    subMenu.style.top = "-9999px";
    subMenu.style.left = "0px";
    subMenu.id = '';

  }
}