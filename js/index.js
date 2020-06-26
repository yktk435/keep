'use strict';

const CREATE = 'create';
let FLAG = 0; //1:新規メモ要素を非表示にして作成している
let createdId;
let url = 'http://localhost:8888/keep/processingData.php';
let newMemoData = { //新規メモ作成時のメモ情報の一時保存
  'datetime': '',
  'label_id': '',
  'color_id': '',
  'user_id': '',
  'className': 'memo share',
  'newNode': ''
}
let recoveryMemoData = {
  'targetEl': '',
  'setTimeoutId': '',
}
let setTimeoutId;
/*******************************************/
//保存検知
/*******************************************/
function keyUp(obj) {
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
document.addEventListener('click', (e) => { //新規メモ追加の際、外側をクリックしたら保存
  if (!e.target.closest('#' + CREATE)) {
    if (FLAG) { //すでに新規作成済みなら
      updateNewMemo();
      //新規メモ入力箇所を初期化
      newMemoData.newNode.style.display = "inline-block"
      let target = document.getElementById(CREATE);
      target.children[0].innerText = '';
      target.children[1].innerText = '';
      target.setAttribute('color_id', 'def');
      target.setAttribute('datetime', '');
      target.setAttribute('label_id', '');
      target.setAttribute('color_id', '');
      target.setAttribute('user_id', '');
      FLAG = 0;
    }
  }
})
/*******************************************/
//新規メモ作成
/*******************************************/
function updateNewMemo() { //
  let data = {}
  let target = document.getElementById(CREATE)
  //DB送信用データの作成
  data = idToData(CREATE);
  data.id = createdId;

  postData(url, 'update', data);

  //非表示になっている新規作成メモへ反映
  newMemoData.newNode.id = 'id_' + createdId;
  newMemoData.newNode.children[0].innerText = target.children[0].innerText;
  newMemoData.newNode.children[1].innerText = target.children[1].innerText;
  newMemoData.newNode.datetime = getDatetime(new Date());
  newMemoData.newNode.setAttribute('label_id', target.getAttribute('label_id'));
  newMemoData.newNode.setAttribute('color_id', target.getAttribute('color_id'));
  newMemoData.newNode.setAttribute('user_id', target.getAttribute('user_id'));
}
/*******************************************/
//新規メモ要素作成
/*******************************************/
function createEl(id) {
  let parentNode = document.querySelector('.memo_area');
  newMemoData.newNode = document.createElement('div');
  let referenceNode = document.querySelector('.memo');
  let target = document.getElementById(CREATE);

  newMemoData.newNode.id = "id_" + id;
  newMemoData.newNode.className = newMemoData.className;
  newMemoData.newNode.style.display = "none";
  newMemoData.newNode.setAttribute('datetime', target.getAttribute('datetime'));
  newMemoData.newNode.setAttribute('label_id', target.getAttribute('label_id'));
  newMemoData.newNode.setAttribute('color_id', target.getAttribute('color_id'));
  newMemoData.newNode.setAttribute('user_id', target.getAttribute('user_id'));
  let template = `
  <div contenteditable="true" class="textArea"  onkeyup="keyUp(this)">${target.children[0].innerText}
  </div>
  <div contenteditable="true" class="textArea"  onkeyup="keyUp(this)">${target.children[1].innerText}
  </div>
    <div class="">
      <button type="button" name="button" onclick=remove(this)>削除_${id}</button>
    </div>
    <div class="other_menu">
      <ul class="gnav">
        <li>カラー <span>▼</span>
          <ul id="id_${id}">
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
  newMemoData.newNode.innerHTML = template;
  parentNode.insertBefore(newMemoData.newNode, referenceNode);
  FLAG = 1;
}
/*******************************************/
//メモ削除
/*******************************************/
function remove(obj) {
  let target = obj.parentNode.parentNode;
  let id = target.id; //メモID
  let memoArea = document.querySelector('.memo_area');
  //消去するメモを非表示
  target.style.display = "none";
  recoveryMemoData.targetEl = target;
  recoveryMemoData.setTimeoutId = setTimeout(() => { //3秒後にデータベースから消去
    //DBから削除
    postData(url, 'remove', idToData(id));
    //要素を消す
    target.remove()
  }, 3000);
  // //消去キャンセル用通知要素作成
  let newNode = document.createElement('div')
  newNode.className = 'cancel';
  newNode.innerHTML = '<button type="button" name="button" onclick=removeCancel(this)>戻す</button>';
  document.body.appendChild(newNode)
  setTimeout(() => { //消去キャンセル通知を5秒後に消す
    document.querySelector('div.cancel').remove();
    clearTimeout(recoveryMemoData.setTimeoutId);
  }, 3000);
}
/*******************************************/
//消去キャンセル
/*******************************************/
function removeCancel(obj) {
  console.log('▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽  removeCancel  ▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽')
  //もとに戻す
  clearTimeout(recoveryMemoData.setTimeoutId);
  recoveryMemoData.targetEl.style.display = "inline-block";
  //消去キャンセル通知を消す
  obj.target.remove();
  console.log('▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  removeCancel終わり  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲')
}
/*******************************************/
//送信
/*******************************************/
function postData(url, key, data) {
  console.log('▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽  postData  ▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽')
  let xhr = new XMLHttpRequest();
  let res;
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send('&' + key + '=' + JSON.stringify(data));
  console.log('↓最終送信データ')
  console.log(data)
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      res = JSON.parse(xhr.responseText);
      console.log('===========response===========')
      console.log(res)
      console.log('===========response===========')
      switch (key) {
        case CREATE:
          createdId = res.data;
          createEl(res.data);
          break;
        case 'createLabel':
console.log(res.labelId)
createLabelEl(res.labelId, data.label_name)
          break;
        default:

      }
    }
  };
  console.log('▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  postData終わり  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲')
}
/*******************************************/
//メモidから送信用データを作成する
/*******************************************/
function idToData(id) {
  console.log('▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽  idToData  ▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽')
  if (id != CREATE && !id.match(/id_/)) {
    id = 'id_' + id
  }
  let target = document.getElementById(id);
  let data = {};
  if (target) {
    data.id = toId(id);
    data.title = target.children[0].innerText;
    data.contents = target.children[1].innerText;
    data.datetime = getDatetime(new Date());
    data.label_id = target.getAttribute('label_id');
    data.color_id = target.getAttribute('color_id');
    data.user_id = target.getAttribute('user_id');
    return data;
  }
  console.log('▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  idToData終わり  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲')
}
/*******************************************/
//メモIDを数字のみにする  例 id_345 → 345
/*******************************************/
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
/*******************************************/
//色変更
/*******************************************/
function changeColor(obj) {
  console.log('▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽  changeColor  ▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽▽')
  let color_id = obj.id
  let id = obj.parentNode.id;
  let target;
  if (id == CREATE) {
    console.log(CREATE)
    target = document.getElementById(CREATE);
    target.setAttribute('color_id', color_id)
    //updateNewMemo()
  } else {
    console.log(id)
    target = document.querySelector('div#' + id);
    console.log(target)
    target.setAttribute('color_id', color_id)
    postData(url, 'update', idToData(toId(id)));
  }
  console.log('▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  changeColor終わり  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲')
}
/*******************************************/
//ラベル
/*******************************************/
function setLabel(obj) {

  let memoId = obj.parentNode.id;
  let labelId = obj.getAttribute('label_id');
  let labelName = obj.innerText;
  let labelStatus = obj.getAttribute('label-status');
  let parentNode = document.getElementById(memoId);
  let getAttribute = parentNode.getAttribute('label_id')


  if (labelStatus == 'true') {
    console.log('消す')
    removeLabel(memoId, labelId);
    obj.setAttribute('label-status', 'false')
    //label_idへ反映
<<<<<<< HEAD
    parentNode.setAttribute('label_id', replaveLabelId(getAttribute, labelId))
=======
    parentNode.setAttribute('label_id', replaveLabelId(getAttribute,labelId))
>>>>>>> 33d7b0bd81f42e1bef5b07a149799b06e961fd14
  } else {
    createLabel(memoId, labelId, labelName);
    console.log('表示')
    obj.setAttribute('label-status', 'true')
    //label_idへ反映
    parentNode.setAttribute('label_id', getAttribute + ' ' + labelId)
  }
  postData(url, 'update', idToData(toId(memoId)));

}

function replaveLabelId(label_id,labelId) {
  let arr = label_id.split(' ');
  arr = arr.filter(function(a) {//labelIdを消す
    return a !== labelId;
  });
  arr = arr.filter(v => v);//配列内の空白を消す
  
  console.log(arr.join(' '));
  return arr.join(' ');//配列を文字列にする

}
/*******************************************/
//ラベル作成 削除
/*******************************************/
function createLabel(memoId, labelId, labelName) {
  console.log('ラベル作成')
  let e = document.createElement('div');
  let target = document.querySelector('#' + memoId + '.label-area');
  e.setAttribute('label_id', labelId);
  e.className = 'label'
  e.innerText = labelName;
  target.appendChild(e);

}

function removeLabel(memoId, labelId) {
  console.log('ラベル消す')
  let target = document.querySelector('div#' + memoId + ' [label_id="' + labelId + '"]');
  target.remove();
}
/*******************************************/
//時刻取得
/*******************************************/
function getDatetime(now) {
  let Year = now.getFullYear();
  let Month = now.getMonth() + 1;
  let Date = now.getDate();
  let Hour = now.getHours();
  let Min = now.getMinutes();
  let Sec = now.getSeconds();
  return Year + "/" + Month + "/" + Date + " " + Hour + ":" + Min + ":" + Sec;
}
//ラベル名を入力してエンターを押したらラベルテーブルとラベル中カンテ-ブルへ登録する
function addLabel(code, obj) {
  let memoId = toId(obj.id);
  let labelName = obj.value;
  let data = {
    'label_name': labelName,
    'memo_id': memoId,
  }
  //エンターキー押下なら
  if (13 === code) {
    if (labelName == '') {
      return false;
    } else {
      console.log(data)
      //ラベルエーブルへの登録とラベル中間テーブルへの登録
      postData(url, 'createLabel', data);
    }

    //ページ上のラベルのところに表示させる要素を作成する。
    obj.value = '';
  }
}

function createLabelEl(labelId, labelName) {
  let parentNode = document.querySelectorAll('.label-parent');
  let newNode = document.createElement('li');
  let referenceNode = document.querySelector('.memo');
  
  //newNode.className = ;
  newNode.onkeypress = "setLabel(this)";
  newNode.setAttribute('label_id', labelId)
  newNode.setAttribute('label-status', 'true')

  newNode.innerHTML = labelName;
  // parentNode.forEach((e)=>{
  //   e.appendChild(newNode);
  // });
  let g=Array.from(parentNode);
  let gs;
  console.log(g);
for (let i = 0; i < g.length; i++) {
  console.log(g[i])
  gs=g[i].appendChild(newNode);
}
  //parentNode.appendChild(newNode);
}

function linkMemoTolabel(url, memoId, labelId) {

}
