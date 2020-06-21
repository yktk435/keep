'use strict';
//////////////////////////////////////////////////////
let url = 'http://localhost:8888/keep/processingData.php';
let editingId = ''; //現在編集中のメモID
let data = { //データベースへ送信する値
  'id': '',
  'title': '',
  'contents': '',
  'datetime': '',
  'label': '',
  'color_id': '',
  'user_id': '',
}
let newMemoData = { //新規メモ作成時のメモ情報の一時保存
  'id': '',
  'title': '',
  'contents': '',
  'datetime': '',
  'label': '',
  'color_id': '',
  'user_id': '',
}
let recoveryMemoData = {
  'target': '',
  'setTimeoutId': '',
}
let setTimeoutId;

document.addEventListener('click', (e) => { //新規メモ追加の際、外側をクリックしたら保存
  if (!e.target.closest('#create')) {
    console.log("外側")

    //console.log('editingId=' + editingId)

    //console.log('fin')
  }
})

/*******************************************/
//新規メモ作成
/*******************************************/
function create() {
  /*******************************************/
  //一時保存し、擬似的に更新とするケース

  /*******************************************/
  //メモリスト化して以降更新とするケース
  
  //新規メモ要素を作成しているなら
  update();


}
/*******************************************/
//既存メモ更新
/*******************************************/
function update() {
  postData(url, 'update');
}
/*******************************************/
//メモ削除
/*******************************************/
function remove(obj) {
  console.log('/******************  remove  ******************/')
  let target = obj.parentNode.parentNode; //メモID
  let id = target.id;
  let memoArea = document.querySelector('.memo_area');
  editingId = id;
  console.log(target)
  console.log('editingId=' + editingId)
  console.log('editingId=' + toId(editingId))
  //非表示
  target.style.display = "none";
  recoveryMemoData.target = target;
  recoveryMemoData.setTimeoutId = setTimeout(() => { //5秒後にデータベースから消去
    console.log('setTimeout=>' + recoveryMemoData.setTimeoutId)
    //DBから削除
    postData(url, 'remove');
    //要素を消す
    target.remove()
  }, 5000);

  // //消去キャンセル用通知要素作成
  let newNode = document.createElement('div')
  newNode.className = 'cancel';
  newNode.innerHTML = '<button type="button" name="button" onclick=removeCancell(this)>戻す</button>';
  document.body.appendChild(newNode)

  setTimeout(() => { //消去キャンセル通知を5秒後に消す
    document.querySelector('div.cancel').remove();
    clearTimeout(recoveryMemoData.setTimeoutId);
  }, 5000);
  console.log('/******************  remove終わり  ******************/')
}
/*******************************************/
//保存検知
/*******************************************/
function removeCancell(obj) {
  //もとに戻す
  clearTimeout(recoveryMemoData.setTimeoutId);
  recoveryMemoData.target.style.display = "inline-block";
  //消去キャンセル通知を消す
  obj.target.remove();
}
/*******************************************/
//保存検知
/*******************************************/
function keyUp(obj) {
  console.log('/******************  keyup  ******************/')
  let id = obj.parentNode.id
  if (editingId != id) { //以前のめもIDとは別のメモをいじっていたら以前いじってたメモを更新
    update();
    editingId = id //キー入力されたメモID
  } else { //同じメモIDをいじってたら
    if (setTimeoutId) {
      console.log('clearTimeout')
      clearTimeout(setTimeoutId);
    }
    setTimeoutId = setTimeout(() => {
      update();
    }, 500);
  }
  console.log('/******************  keyup終わり  ******************/')

}
/*******************************************/
//送信
/*******************************************/
function postData(url, key) {
  console.log('/******************  postData  ******************/')
  toData();
  console.log('最終的に送信するデータ')
  console.log(data)
  if (key == 'update') {
    if (!dataCheck()) {
      console.log('入力されたのもが正しくない')
      return false;
    }
  }
  let xhr = new XMLHttpRequest();
  let res;
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send('&' + key + '=' + JSON.stringify(data));

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {

      res = JSON.parse(xhr.responseText);
      console.log(res)
    }
  };
  console.log('/******************  postData終わり  ******************/')

}
/*******************************************/
//データチェック
/*******************************************/
function dataCheck() {

  if (!data.id.match(/\d+/)) { //data.idが数字ならOK
    console.log('data.idが数字である必要がある。')
    return false;
  } else if (data.title == '' && data.contents == '') { //タイトルと内容が両方からじゃないならOK
    console.log('タイトルと内容はどちらかが入力されている必要がある。')
    return false;
  } else {
    return true;
  }
}
/*******************************************/
//変更しない データを整えるだけ
/*******************************************/
function toData() { //送信用データへ値を代入
  console.log('/******************  toData  ******************/')
  let target = document.getElementById(editingId);
  //console.log(target)
  if (target) {
    data.id = toId(editingId);
    data.title = target.children[0].innerText;
    data.contents = target.children[1].innerText;
    data.datetime = getDatetime(new Date());
    data.label = target.getAttribute('label');
    data.color_id = target.getAttribute('color_id');
    data.user_id = target.getAttribute('user_id');

  } else {
    console.log('要素が見つからない')
  }
  console.log('/******************  toData終わり  ******************/')

}

function toId(id) {
  let res;
  if (id.match(/\d+/)) {
    let int = id.match(/\d+/);
    res = int[0];
  } else {
    res = id;
  }
  return res;
}

//////////////////////////////////////////////////////




function tempSave() {
  console.log('tempsave')
  toData();
  console.log('editingId=>' + editingId)
  console.log(data);
  if (editingId == 'create') {
    if (!createdId) {
      console.log('createdIdがない')
      delete data.id;
      postData(url, 'create');
    } else {
      if (!createdId.match(/\d+/)) {
        console.log('createdIdあり(文字)' + createdId)
        data.id = createdId;
        postData(url, 'update');
      } else {
        console.log('createdIdありちゃんと数字=>' + createdId)
        createdId = 'temp';
      }
    }

  }

}

function changeColor(obj) {
  let color_id = obj.id
  let id = obj.parentNode.id;
  let target;

  if (id == 'create') {
    target = document.querySelector('#create');
  } else {
    target = document.getElementById(id);
  }
  target.setAttribute('color_id', color_id)
  tempSave()
}

function focusOut(obj) { //textareaからフォーカスアウトしたら
  let id = obj.parentNode.id; //メモID取得
  editingId = id;
}


function focusOn(obj) { //textareaにフォーカスしたら
  let id = obj.parentNode.id; //メモID取得
  if (editingId != id && editingId != '') { //editingIdが異なり且つ空でない場合、保存する
    save();
    editingId = id;
  }
}

function save() {
  console.log('save==============')
  console.log('editingId=' + editingId)
  toData();
  if (editingId == 'create') { //新規メモ追加時かつどちらかに記入されていれば
    console.log('新規メモ作成');
    if (!(data.title == '' && data.contents == '')) {

      postData(url, 'create');
      let target = document.getElementById(editingId);
      //タイトルと内容を殻にする
      target.children[0].innerText = '';
      target.children[1].innerText = '';
      //色を戻す
      target.setAttribute('color_id', 'def');
    }
  } else { //更新時
    console.log('データ更新')
    postData(url, 'update');
  }
}


function createEl() { //新規メモをメモ一覧に表示
  let parentNode = document.querySelector('.memo_area');
  let newNode = document.createElement('div');
  let referenceNode = document.querySelector('.memo');

  newNode.id = createdId;
  newNode.className = 'memo share';
  newNode.setAttribute('datetime', data.datetime);
  newNode.setAttribute('label', data.label);
  newNode.setAttribute('color_id', data.color_id);
  newNode.setAttribute('user_id', data.user_id);
  let template = `
     <textarea class="textArea" placeholder="タイトル" cols="" rows="" wrap="soft" onblur="focusOut(this)" onfocus="focusOn(this)">${data.title}</textarea>
  
     <textarea class="textArea" placeholder="内容" cols="" rows="" wrap="soft" onblur="focusOut(this)" onfocus="focusOn(this)">${data.contents}</textarea> 
     <div class="">
       <button type="button" name="button" onclick=remove(this)>削除</button>
       <div class="other_menu">
         <ul class="gnav">
           <li>カラー <span>▼</span>
             <ul id="create">
               <li id="def" onclick=changeColor(this)>def</li>
               <li id="red" onclick=changeColor(this)>赤</li>
               <li id="blue" onclick=changeColor(this)>青</li>
               <li id="yellow" onclick=changeColor(this)>黄</li>
             </ul>
           </li>
           <li>ラベル<span>▼</span>
             <ul>
               <li>ラベル1</li>
               <li>ラベル1</li>
             </ul>
           </li>
         </ul>
       </div>
       
     </div>
     `;
  newNode.innerHTML = template;
  parentNode.insertBefore(newNode, referenceNode);
  let e = document.querySelector('#create');
  e.children[0].innerText = '';
  e.children[1].innerText = '';
  e.setAttribute('color_id', 'def');


}






function getDatetime(now) {
  let Year = now.getFullYear();
  let Month = now.getMonth() + 1;
  let Date = now.getDate();
  let Hour = now.getHours();
  let Min = now.getMinutes();
  let Sec = now.getSeconds();

  return Year + "/" + Month + "/" + Date + " " + Hour + ":" + Min + ":" + Sec;
}


// 
// window.onmousemove = function() {
//   var ele = document.querySelector("div.memo:hover");
//   if (ele) {
//     editingId = ele.id;
//     console.log(editingId)
//   }
// }