'use strict';

class NewMemo {
  constructor(labelList) {
    this.id = 0
    this.labelList = labelList
    this.labelName = {}
    this.api = new ApiManager()
    this.obj
    this.posting=0 //送信判定
    this.createEl()
  }
  createEl() {

    let div = document.createElement('div')
    let templete;
    div.className = 'add_memo share'
    div.setAttribute('color_id', 'def')

    templete = `
        <div id='title' contenteditable="true" class="textArea"></div>
        <div id='contents' contenteditable="true" class="textArea"></div>
        <div id="create" class="label-area">
        </div>
        <div class="other_menu">
          <ul class="gnav">
            <li>カラー 
              <ul id="create">
                <li id="def" onclick=changeColor(this)>def</li>
                <li id="red" onclick=changeColor(this)>赤</li>
                <li id="blue" onclick=changeColor(this)>青</li>
                <li id="yellow" onclick=changeColor(this)>黄</li>
              </ul>
            </li>
            <li id="create" class="label-menu">ラベル
            <ul class="label-menu">
            <li><input type="text" class="add-label" maxlength="50" placeholder="ラベル名を入力" ;"></li>
            `;
    if (this.labelList != null) {
      Object.keys(this.labelList).forEach((key) => {
        templete += `<li label_id=${key}>${this.labelList[key]}</li>`;
      })
    }
    templete += `
            </ul>
            </li>
          </ul>
        `;
    div.innerHTML = templete
    
    Array.from(div.children).forEach((e) => {
      if (e.querySelector('input')) {
        let input = e.querySelector('input')
        input.addEventListener('keypress', function(event) {
          //エンター押したら
          if (event.charCode == 13 && input.value != '') {
            this.api.fetchAllData('createOnlyLabel', {
              'label_name': input.value,
            }).then(function(data) {
              let labelId = data.labelId
              //メモ全体へ反映する必要がある↓
              this.labelList[labelId] = input.value
              //メモ全体へ反映する必要がある↑
              this.labelName = Object.assign(this.labelName, {
                [labelId]: input.value
              })
              //ラベルエリアに要素を追加
              let liTag = document.createElement('li')
              liTag.setAttribute('label_id', labelId)
              liTag.className = 'label';
              liTag.innerText = input.value
              div.querySelector('.label-area').appendChild(liTag)
              //rベルメニューへ追加
              let liMenu = document.createElement('li')
              liMenu.setAttribute('label_id', labelId);
              liMenu.innerText = input.value
              //クリックされたときの動作を設定
              liMenu.addEventListener('click', function(event) {
                //ラベル追加
                if (!Object.keys(this.labelName).find(item => item === labelId)) {
                  this.labelName = Object.assign(this.labelName, {
                    [labelId]: input.value
                  })
                  let liTag = document.createElement('li')
                  liTag.setAttribute('label_id', labelId)
                  liTag.className = 'label';
                  liTag.innerText = this.labelList[labelId]


                  div.querySelector('.label-area').appendChild(liTag)
                  //すでにそのラベルが付いてるならラベル削除
                } else {
                  //ラベルエリアから要素を消す
                  div.querySelector('.label-area [label_id="' + labelId + '"]').remove()
                  //e.querySelector('[label_id="' + labelId + '"]').remove();

                  delete this.labelName[labelId]

                }
                // console.log(this.labelName)


              }.bind(this))
              div.querySelector('ul.label-menu').appendChild(liMenu)

              input.value = '';

            }.bind(this))
          }

        }.bind(this))

      }
      if (e.querySelectorAll('li[label_id]')) { //ラベルメニューをクリックしたとき  
        let li = e.querySelectorAll('li[label_id]')
        let labelId;
        Object.keys(li).forEach((key) => {
          li[key].addEventListener('click', function(event) {
            labelId = li[key].getAttribute('label_id')
            //ラベル追加
            if (!Object.keys(this.labelName).find(item => item === labelId)) {
              this.labelName = Object.assign(this.labelName, {
                [labelId]: li[key].innerText
              })
              let liTag = document.createElement('li')
              liTag.setAttribute('label_id', labelId)
              liTag.className = 'label';
              liTag.innerText = this.labelList[labelId]


              div.querySelector('.label-area').appendChild(liTag)
              //すでにそのラベルが付いてるならラベル削除
            } else {
              //ラベルエリアから要素を消す
              div.querySelector('.label-area [label_id="' + labelId + '"]').remove()
              //e.querySelector('[label_id="' + labelId + '"]').remove();

              delete this.labelName[labelId]

            }
            // console.log(this.labelName)
            this.api.updateMemo(this)

          }.bind(this))

        })

      }
    })

    div.querySelector('#title').addEventListener('keyup', function() {
      let title = div.querySelector('#title').innerText
      let contents = div.querySelector('#contents').innerText
      this.title = title
      this.contents = contents
      console.log(contents)

      if (this.id == 0) {
        if(this.posting==0){
          this.posting=1;
          this.api.createMemo(this).then(function(json) {
            this.id = json.data
          }.bind(this))
        }
      } else if (title == '' && contents == '') {
        this.api.deleteMemo(this.id)
      }
    }.bind(this))
    div.querySelector('#contents').addEventListener('keyup', function() {
      let title = div.querySelector('#title').innerText
      let contents = div.querySelector('#contents').innerText
      this.title = title
      this.contents = contents

      if (this.id == 0) {
        if(this.posting==0){
          this.posting=1;
          this.api.createMemo(this).then(function(json) {
            this.id = json.data
          }.bind(this))
        }
      } else if (title == '' && contents == '') {
        this.api.deleteMemo(this.id)
      }
    }.bind(this))

    document.addEventListener('click', function(e) {

      //タイトルと内容が空でない状態で、新規メモ以外をクリックしたとき
      if (!e.target.closest('.add_memo.share') && (div.querySelector('#title').innerText != '' || div.querySelector('#contents').innerText != '')) {
        div.querySelector('#title').innerText = ''
        div.querySelector('#contents').innerText = ''
        
        this.obj = new Memo(this.id, this.title, this.contents)
        this.obj.labelName = this.labelName

        this.obj.api.updateMemo(this.obj)
        //初期化
        this.id = 0;
        this.posting=0;
        div.querySelector('ul.label-menu').innerHTML = ''
        div.querySelector('.label-area').innerHTML = ''

        this.obj.createDivTag()
      }

    }.bind(this))

    document.body.insertBefore(div, document.querySelector('.memo_area'))
  }
}
class Memo {
  constructor(memoId, title = '', contents = '') {
    this.id = memoId;
    this.title = title;
    this.contents = contents;
    this.datetime = new Date();
    this.labelName = {}
    this.labelList = {}
    this.color = 'def';
    this.userId = 1;
    this.api = new ApiManager()
  }

  createDivTag() {
    let div = document.createElement("div");
    let templete = '';
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
    </div>
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
        <li><input type="text" class="add-label" maxlength="50" placeholder="ラベル名を入力" ;"></li>
        
        `;
    if (this.labelList != null) {
      Object.keys(this.labelList).forEach((key) => {
        templete += `<li label_id=${key}>${this.labelList[key]}</li>`;
      })
    }

    templete += `
        </ul>
        </li>
      </ul>
    
    `;
    div.innerHTML = templete;

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
        if (e.querySelectorAll('li[label_id]')) { //ラベルメニューをクリックしたとき
          let li = e.querySelectorAll('li[label_id]')
          let labelId;
          Object.keys(li).forEach((key) => {
            li[key].addEventListener('click', function(event) {
              labelId = li[key].getAttribute('label_id')
              //ラベル追加
              if (!Object.keys(this.labelName).find(item => item === labelId)) {
                this.labelName = Object.assign(this.labelName, {
                  [labelId]: li[key].innerText
                })
                let liTag = document.createElement('li')
                liTag.setAttribute('label_id', labelId)
                liTag.className = 'label';
                liTag.innerText = this.labelList[labelId]


                div.querySelector('.label-area').appendChild(liTag)
                //すでにそのラベルが付いてるならラベル削除
              } else {
                //ラベルエリアから要素を消す
                div.querySelector('.label-area [label_id="' + labelId + '"]').remove()
                delete this.labelName[labelId]
              }
              this.api.updateMemo(this)
            }.bind(this))
          })
        }
        if (e.querySelector('input')) { //ラベル登録
          let input = e.querySelector('input')
          input.addEventListener('keypress', function(event) {
            //エンター押したら
            if (event.charCode == 13 && input.value != '') {
              this.api.fetchAllData('createLabel', {
                'label_name': input.value,
                'memo_id': this.id,
              }).then(function(json) {
                let labelId = json.labelId
                //メモ全体へ反映する必要がある↓
                this.labelList[labelId] = input.value
                //メモ全体へ反映する必要がある↑
                this.labelName = Object.assign(this.labelName, {
                  [labelId]: input.value
                })
                //ラベルエリアに要素を追加
                let liTag = document.createElement('li')
                liTag.setAttribute('label_id', labelId)
                liTag.className = 'label';
                liTag.innerText = input.value
                div.querySelector('.label-area').appendChild(liTag)
                //rベルメニューへ追加
                let liMenu = document.createElement('li')
                liMenu.setAttribute('label_id', labelId);
                liMenu.innerText = liTag.innerText
                //クリックされたときの動作を設定
                liMenu.addEventListener('click', function(event) {
                  //ラベル追加
                  if (!Object.keys(this.labelName).find(item => item === labelId)) {
                    this.labelName = Object.assign(this.labelName, {
                      [labelId]: input.value
                    })
                    let liTag = document.createElement('li')
                    liTag.setAttribute('label_id', labelId)
                    liTag.className = 'label';
                    liTag.innerText = this.labelList[labelId]

                    div.querySelector('.label-area').appendChild(liTag)
                    //すでにそのラベルが付いてるならラベル削除
                  } else {
                    //ラベルエリアから要素を消す
                    div.querySelector('.label-area [label_id="' + labelId + '"]').remove()
                    //e.querySelector('[label_id="' + labelId + '"]').remove();
                    delete this.labelName[labelId]
                  }
                  // console.log(this.labelName)
                  this.api.updateMemo(this)
                }.bind(this))
                div.querySelector('.label-menu').appendChild(liMenu)
                input.value = '';
              }.bind(this))
            }
          }.bind(this))
        }
        if (e.querySelector('li.label')) {}
      }
    })
    div.addEventListener('DOMFocusOut', function(e) {
    }.bind(this));
    div.addEventListener('keyup', function(e) {
      this.title = div.children[0].innerText
      this.contents = div.children[1].innerText
      this.api.updateMemo(this)
    }.bind(this));
    //return div;

    let parent = document.querySelector(".memo_area")
    let ref
    if (parent.children[0]) {
      ref = parent.children[0]
      parent.insertBefore(div, ref)
    } else {
      parent.appendChild(div)
    }
  }
  removeDivTag(div) {
    div.remove();
    this.api.deleteMemo(this.id);
  }
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
      }).then(function(json) {
        console.log(json)
        json = JSON.parse(json)
        return json
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

  createMemo(memo) {
    return this.fetchAllData('create', {
      title: memo.title,
      contents: memo.contents,
      datetime: this.toDatetime(new Date()),
      color_id: memo.color,
      user_id: 1,
    })
  }

  deleteMemo(memoId) {
    // console.log(memoId)
    this.fetchAllData('remove', {
      id: memoId
    })
  }

  updateMemo(memo) {
    // console.log(memo)
    this.postData = Object.assign({}, {
      id: memo.id,
      title: memo.title,
      contents: memo.contents,
      datetime: this.toDatetime(new Date()),
      color_id: memo.color,
      label_id: 1,
      user_id: 1,
      labelName: memo.labelName
    })
    this.fetchAllData('update', this.postData)
  }
}

window.onload = function() {
  let api = new ApiManager();
  let memoObj = {}
  let label;
  api.fetchAllData().then(function(json) {
    let res = json;
    console.log(res)
    let resMemo = res.memo
    let labelList = res.label
    let resLabelMiddle = res.labelMiddle
    let newMemo = new NewMemo(labelList)
    
    label = new LabelMiddle(labelList, resLabelMiddle)
    resMemo.forEach(e => {
      let memo = new Memo(e.id, e.title, e.contents);
      memo.datetime = e.datetime;
      memo.color = e.color_id;
      memo.labelList = labelList
      memo.labelName = label.getLabelName(memo.id)
      memo.createDivTag();
      memoObj = Object.assign(memoObj, {
        [e.id]: memo
      })
    })
  })
}