'use strict';

class Memo {
  constructor(title, contents, labelMenu) {
    this.id = 0;
    this.title = title;
    this.contents = contents;
    this.datetime = new Date();
    this.labelName = {}
    this.allLabel = {}
    this.color = 'def';
    this.userId = 1;
    this.api = new ApiManager()
    this.labelMenuPosition = labelMenu
  }

  createDivTag() {
    let div = document.createElement("div");
    let template = '';
    div.id = 'id_' + this.id
    div.className = "memo share";
    div.setAttribute('color_id', this.color)

    template = `
<div contenteditable="true" class="textArea" >${this.title}</div>
<div contenteditable="true" class="textArea" >${this.contents}</div>
<div id="id_${this.id}" class="label-area">
`;

    Object.keys(this.labelName).forEach((key) => {
      template += `
<div label_id="${key}" class="label">${this.labelName[key]}</div>
`;
    })

    //     template += `
    // </div>
    // <div class="">
    // <button type="button" name="button" >削除_${this.id}</button>
    // </div>
    // <div class="other_menu">
    // <ul class="gnav">
    // <li>カラー 
    // <ul id="id_${this.id}" class="label-color">
    // <li id="def"  >def</li>
    // <li id="red"  >赤</li>
    // <li id="blue"  >青</li>
    // <li id="yellow"  >黄</li>
    // </ul>
    // </li>
    // <li id="id_${this.id}" class="label-hover">ラベル
    // <ul class="label-menu">
    // <li><input type="text" class="add-label" maxlength="50" placeholder="ラベル名を入力" ;"></li>
    // 
    // `;
    //     if (this.allLabel != null) {
    //       Object.keys(this.allLabel).forEach((key) => {
    //         template += `<li label_id=${key}>${this.allLabel[key]}</li>`;
    //       })
    //     }
    // 
    //     template += `
    // </ul>
    // </li>
    // </ul>
    // 
    // `;

    template += `
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
<li id="id_${this.id}" class="label-hover">ラベル
<ul class="label-menu">
</ul>

 `;

    div.innerHTML = template;

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
          let target = e.querySelector('button')
          target.addEventListener('click', function(event) {
            this.removeDivTag(div);

          }.bind(this))
        }

        // if (e.querySelectorAll('li[label_id]')) { //ラベルメニューをクリックしたとき
        // 
        //   let li = e.querySelectorAll('li[label_id]')
        //   let labelId;
        //   Object.keys(li).forEach((key) => {
        //     li[key].addEventListener('click', function(event) {
        //       labelId = li[key].getAttribute('label_id')
        //       //ラベル追加
        //       if (!Object.keys(this.labelName).find(item => item === labelId)) {
        //         this.labelName = Object.assign(this.labelName, {
        //           [labelId]: li[key].innerText
        //         })
        //         let liTag = document.createElement('li')
        //         liTag.setAttribute('label_id', labelId)
        //         liTag.className = 'label';
        //         liTag.innerText = this.allLabel[labelId]
        // 
        // 
        //         div.querySelector('.label-area').appendChild(liTag)
        //         //すでにそのラベルが付いてるならラベル削除
        //       } else {
        //         //ラベルエリアから要素を消す
        //         div.querySelector('.label-area [label_id="' + labelId + '"]').remove()
        //         //e.querySelector('[label_id="' + labelId + '"]').remove();
        // 
        //         delete this.labelName[labelId]
        // 
        //       }
        //       // console.log(this.labelName)
        //       this.api.updateMemo(this)
        // 
        //     }.bind(this))
        // 
        //   })
        // 
        // }
        if (e.querySelector('.label-hover')) {
          let li = e.querySelector('.label-hover')



          li.addEventListener('mouseover', function(event) {

            let liInfo = event.target.getBoundingClientRect()
            this.labelMenuPosition.top = String(liInfo.top + liInfo.height - 5) + "px";
            this.labelMenuPosition.left = liInfo.left + "px";
            this.labelMenuPosition.editingId = this.id
            this.labelMenuPosition.move()


          }.bind(this))

          li.addEventListener('mouseout', function(event) {
            let hover = document.querySelectorAll(':hover')
            try {
              Array.from(hover).forEach((el) => {
                if (el.className == 'aaaa') {
                  throw new Error('ラベルメニューの位置をそのままにする');
                }
              })
              this.labelMenuPosition.top = "-999px";
              this.labelMenuPosition.left = "-999px";
              this.labelMenuPosition.editingId = ''
              this.labelMenuPosition.move()

            } catch (e) {

            }
          }.bind(this))
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
                json = JSON.parse(json)
                let labelId = json.labelId
                //メモ全体へ反映する必要がある↓
                this.allLabel[labelId] = input.value
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
                    liTag.innerText = this.allLabel[labelId]
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

    Array.from(this.labelMenuPosition.div.querySelectorAll('[label_id]')).forEach((e) => {

      e.addEventListener('click', function(event) {
        let labelId = event.target.getAttribute('label_id')
        let labelName = event.target.innerText

        if (!Object.keys(this.labelName).find(item => item === labelId)) {
          this.labelName = Object.assign(this.labelName, {
            [labelId]: labelName
          })
          let liTag = document.createElement('li')
          liTag.setAttribute('label_id', labelId)
          liTag.className = 'label';
          liTag.innerText = this.allLabel[labelId]

          div.querySelector('.label-area').appendChild(liTag)
          //すでにそのラベルが付いてるならラベル削除
        } else {
          //       //ラベルエリアから要素を消す
          div.querySelector('.label-area [label_id="' + labelId + '"]').remove()
          //e.querySelector('[label_id="' + labelId + '"]').remove();

          delete this.labelName[labelId]

        }
        console.log(this.id, this.labelName)
        this.api.updateMemo(this)

      }.bind(this))


    })
    div.addEventListener('keyup', function(e) {
      this.title = div.children[0].innerText
      this.contents = div.children[1].innerText
      // console.log(this)
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

class LabelMenu {
  constructor(labelList, labelMiddle) {
    this.top = '-999px';
    this.left = '-999px';
    this.labelList = labelList
    this.labelMiddle = labelMiddle
    this.div = document.createElement('div');
    this.hoverEl;
    this.editingId;



  }
  createLabeMenu(targetLabelName) {

    this.div.className = 'aaaa'
    let template;
    this.div.style = 'padding: 5px;display:inline-block;position: fixed;background-color:rgb(73, 73, 73);top:' + this.top + ';left:' + this.left + ';';
    template = `  <div  class="">
        <input type="text" class="add-label" maxlength="50" placeholder="ラベル名を入力" >
      </div>`;

    Object.keys(this.labelList).forEach((key) => {

      template += `<div class="" style="border: 1px solid #d5d2d2;" label_id="${key}">
          ${this.labelList[key]}
        </div>`

    })

    this.div.innerHTML = template;


    // this.div.addEventListener('mouseover',function(ev){
    // console.log('マウスオーバー',this.top,this.left)

    // }.bind(this))
    // this.div.addEventListener('mouseout',function(ev){

    // console.log('マウスアウト',this.top,this.left)
    // if(ev.target.parentNode.className!='aaaa' || ev.target.className!='aaaa' || ev.fromElement.className!='aaaa'){  
    //   this.top="-999px";
    //   this.left="-999px";
    //   this.move()          
    // }

    // }.bind(this))
    document.body.appendChild(this.div)
  }
  move() {
    this.div.style.top = this.top
    this.div.style.left = this.left
  }
  setAddEventListener(memo) {
    let target = this.div.querySelectorAll('[label_id]')
    Array.from(this.div.querySelectorAll('[label_id]')).forEach((e) => {

      e.addEventListener('click', this.eventListenerFunc.bind(this))
      
    })

  }
  eventListenerFunc(){
    
      let labelId = event.target.getAttribute('label_id')
      let labelName = event.target.innerText

      if (!Object.keys(targetLabelName).find(item => item === labelId)) {
        targetLabelName = Object.assign(targetLabelName, {
          [labelId]: labelName
        })
        let liTag = document.createElement('li')
        liTag.setAttribute('label_id', labelId)
        liTag.className = 'label';
        liTag.innerText = this.allLabel[labelId]

        div.querySelector('.label-area').appendChild(liTag)
        //すでにそのラベルが付いてるならラベル削除
      } else {
        //       //ラベルエリアから要素を消す
        div.querySelector('.label-area [label_id="' + labelId + '"]').remove()
        //e.querySelector('[label_id="' + labelId + '"]').remove();

        delete targetLabelName[labelId]

      }
      console.log(this.id, targetLabelName)
      this.api.updateMemo(this)

    
  }


  // <div id="" class="aaaa" style="padding: 5px;display:inline-block;position: fixed;background-color:rgb(73, 73, 73);top:-999px;left:-999px;">
  //   <div  class="">
  //     <input type="text" class="add-label" maxlength="50" placeholder="ラベル名を入力" onkeypress="addLabel(event.keyCode,this);">
  //   </div>
  // 
  //   <?php
  //   if ($labelData) {
  //       foreach ($labelData as $labelId =>$labelName) {
  // 
  //           $text.=<<<EOF
  //       <div class="" style="border: 1px solid #d5d2d2;" onclick="setLabel(this)" label_id="{$labelId}">
  //         {$labelName}
  //       </div>
  //       EOF;
  // 
  //       }
  //       print  $text;
  //   }
  // ?>
  // 
  // </div>
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
    // console.log(memoId)
    this.fetchAllData('remove', {
      id: memoId
    }).then(function(json) {
      // console.log(json)
      json = JSON.parse(json)
      // console.log(json)
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
    this.fetchAllData('update', this.postData).then(function(json) {
      // console.log(json)
      json = JSON.parse(json)
      // console.log(json)
    })
  }
}

window.onload = function() {

  let api = new ApiManager();
  let labelMenu;
  let memoObj = {}
  let label;
  api.fetchAllData().then(function(json) {
    console.log(json)
    let res = JSON.parse(json);
    console.log(res)
    let resMemo = res.memo
    let resLabel = res.label
    // console.log(resLabel)
    let resLabelMiddle = res.labelMiddle
    // console.log(resLabelMiddle)
    labelMenu = new LabelMenu(resLabel, resLabelMiddle);
    labelMenu.createLabeMenu()
    label = new LabelMiddle(resLabel, resLabelMiddle)
    //console.log(label.getLabelName('921'))
    resMemo.forEach(e => {
      let memo = new Memo(e.title, e.contents, labelMenu);

      memo.id = e.id;
      memo.datetime = e.datetime;
      memo.color = e.color_id;
      memo.allLabel = res.label
      // console.log(memo.allLabel)
      memo.labelName = label.getLabelName(memo.id)
      // console.log(memo.labelName)

      document.querySelector(".memo_area").appendChild(memo.createDivTag());

      memoObj = Object.assign(memoObj, {
        [e.id]: memo
      })
    })
  })
}