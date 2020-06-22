'use strict';

const CREATE = 'create';
let FLAG = 0; //1:新規メモ要素を非表示にして作成している
let createdId;
let url = 'http://localhost:8888/keep/processingData.php';
let newMemoData = { //新規メモ作成時のメモ情報の一時保存
  'datetime': '',
  'label': '',
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

  let target = obj.parentNode;
  let id = obj.parentNode.id
  if (setTimeoutId) {
    clearTimeout(setTimeoutId);
  }
  if (id == CREATE) { //新規メモ作成・更新
    if (FLAG) { //新規メモの要素を非表示で作成しているならDBへの更新と非表示になっている要素への反映
      
      setTimeoutId = setTimeout(() => {//新規メモ更新
        updateNewMemo();
      }, 500);
    } else { //新規メモ作成
      setTimeoutId = setTimeout(() => {
        postData(url, CREATE, idToData(CREATE));
      }, 500);
    }
  } else {//メモ更新
    setTimeoutId = setTimeout(() => {
      update(toId(id));
    }, 500);
  }
  console.log('▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  keyUp終わり  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲')
}
document.addEventListener('click', (e) => { //新規メモ追加の際、外側をクリックしたら保存
  if (!e.target.closest('#' + CREATE)) {
    if (FLAG) { //すでに新規作成済みなら
      //新規メモ入力箇所を初期化
      newMemoData.newNode.style.display = "inline-block"
      let target = document.getElementById(CREATE);
      target.children[0].innerText = '';
      target.children[1].innerText = '';
      target.setAttribute('color_id', 'def');
      target.setAttribute('datetime', '');
      target.setAttribute('label','');
      target.setAttribute('color_id','');
      target.setAttribute('user_id','');
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
  data.id = createdId;
  data.title = target.children[0].innerText;
  data.contents = target.children[1].innerText;
  data.datetime = getDatetime(new Date());
  data.label = target.getAttribute('label');
  data.color_id = target.getAttribute('color_id');
  data.user_id = target.getAttribute('user_id');

  postData(url, 'update', data);

  //非表示になっている新規作成メモへ反映
  newMemoData.newNode.id = 'id_' + createdId;
  newMemoData.newNode.children[0].innerText = target.children[0].innerText;
  newMemoData.newNode.children[1].innerText = target.children[1].innerText;
  newMemoData.newNode.datetime = getDatetime(new Date());
  newMemoData.newNode.setAttribute('label', target.getAttribute('label'));
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

  newMemoData.newNode.id = "#id_" + id;
  newMemoData.newNode.className = newMemoData.className;
  newMemoData.newNode.style.display = "none";
  newMemoData.newNode.setAttribute('datetime', newMemoData.datetime);
  newMemoData.newNode.setAttribute('label', newMemoData.label);
  newMemoData.newNode.setAttribute('color_id', newMemoData.color_id);
  newMemoData.newNode.setAttribute('user_id', newMemoData.user_id);
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
//既存メモ更新
/*******************************************/
function update(id) {
  postData(url, 'update', idToData(id));
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
  }, 5000);
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
      if (key == CREATE) {
        createdId = res.data;
        console.log('res=' + createdId)
        createEl(res.data);
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
    data.label = target.getAttribute('label');
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
    target = document.querySelector('#create');
    target.setAttribute('color_id', color_id)
    updateNewMemo()
  } else {
    target = document.querySelector('div#' + id);
    console.log(target)
    target.setAttribute('color_id', color_id)
    update(id)
  }
  console.log('▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  changeColor終わり  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲')
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