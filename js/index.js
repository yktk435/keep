'use strict';

let url = 'http://localhost:8888/keep/processingData.php';
let edditId = '';//現在編集中のメモID
let removeCansellData = {
  'id': '',
  'title': '',
  'contents': '',
  'timeoutId': '',
  'HTML': ''
};

document.addEventListener('click', (e) => { //新規メモ追加の際、外側をクリックしたら保存
  if (!e.target.closest('#create') && edditId != '') {
    //console.log("外側")
    //console.log('edditId=' + edditId)
    save(edditId)
    //console.log('fin')
  } else {
    //console.log("内側")
    //console.log('edditId=' + edditId)
  }
})


function focusOut(obj) {//textareaからフォーカスアウトしたら
  //console.log('フォーカスアウト=' + edditId)
  let id = obj.parentNode.id;//メモID取得
  edditId = id;
}


function focusOn(obj) {//textareaにフォーカスしたら
  //console.log('フォーカス=' + edditId)
  let id = obj.parentNode.id;//メモID取得
  if (edditId != id && edditId != '') {//edditIdが異なり且つ空でない場合、保存する
    save(edditId);
    edditId = id;
  } 
}

function save(edditId) {
  //console.log('save////////////');
  //console.log("保存=" + edditId)
  let parent = document.getElementById(edditId);
  //console.log('parent:')
  //console.log(parent)

  //let now = new Date();
  //let datetime = getDatetime(now);
  // let title = parent.children[0].value;
  // let contents = parent.children[1].value;
  // let label = parent.getAttribute('label');
  // let color_id = parent.getAttribute('color_id');
  // let user_id = parent.getAttribute('user_id');
  let data = {//データベースへ送信する値
    'id': toId(edditId),
    'title': parent.children[0].value,
    'contents': parent.children[1].value,
    'datetime': getDatetime(new Date()),
    'label': parent.getAttribute('label'),
    'color_id': parent.getAttribute('color_id'),
    'user_id': parent.getAttribute('user_id'),
  }
  if (edditId == 'create') { //新規メモ追加時
    console.log('create')

    if (data.title != '' || data.contents != '') {//どちらかに記入されていれば
      let lastAutoIncrementId = Number(document.querySelector('dialog').innerText);//直近の自動連番を取得
      //console.log(lastAutoIncrementId)
      let autoIncrementId = lastAutoIncrementId + 1; 
      data.id=autoIncrementId;
      
      createEl(data);//新規メモをメモ一覧に表示
      delete data.id;
      postData(url, 'create', data);
      
      parent.children[0].value = '';
      parent.children[1].value = '';
    }
  } else { //更新時
    postData(url, 'update', data);
  }
  console.log('save 終わり')
}

function createEl(data){//新規メモをメモ一覧に表示
  let parentNode=document.querySelector('.memo_area');
  let newNode = document.createElement('div');
  let referenceNode=document.querySelector('.memo');
  
  newNode.id = "id_" + data.id;
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
       
     </div>
     `;
  newNode.innerHTML = template;
  parentNode.insertBefore(newNode, referenceNode);

  
}

function remove(obj) {
  console.log('remove');
  let parent = obj.parentNode.parentNode;
  let memoArea=document.querySelector('.memo_area');
  let id = toId(parent.id);
  let data = {
    'id': id
  }
  removeCansellData.id = id;
  removeCansellData.title = parent.children[0].value;
  removeCansellData.contents = parent.children[1].value;
  removeCansellData.HTML = memoArea.innerHTML;//今のメモ状況を一時保存
  removeCansellData.timeoutId = setTimeout(() => {//5秒後にデータベースから消去
    postData(url, 'remove', data)
  }, 5000);
  parent.remove();

  //消去キャンセル用通知要素作成
  let newNode = document.createElement('div')
  newNode.className = 'cansell';
  newNode.innerHTML = '<button type="button" name="button" onclick=removeCansell(this)>戻す</button>';
  document.body.appendChild(el)
  
  setTimeout(function(){//5秒後に要素を消す
    document.querySelector('div.cansell').remove();
    clearTimeout(removeCansellData.timeoutId);
  },5000);
}

function removeCansell(obj) {
  //console.log('removeCansell');
  
  //もとに戻す
  document.querySelector('.memo_area').innerHTML = removeCansellData.HTML;
  let target = document.querySelector('#id_' + removeCansellData.id);
  // console.log(removeCansellData);
  // console.log(target);
  clearTimeout(removeCansellData.timeoutId);
  
  //削除前のタイトルと内容を反映
  target.children[0].innerText = removeCansellData.title;
  target.children[1].innerText = removeCansellData.contents;

  obj.parentNode.remove();
}

//post送信
function postData(url, key, data) {
  console.log('postData');
  let xhr = new XMLHttpRequest();
  let res;
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send('&' + key + '=' + JSON.stringify(data));
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      console.log("response=" + xhr.responseText)
      res = xhr.responseText;
      return res;
    }
  };
}

function fetchver(url, key, data) {
  console.log('fetch');

  fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      // mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: "same-origin", // include, same-origin, *omit
      headers: {
        //   "Content-Type": "application/json; charset=utf-8",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      // redirect: "follow", // manual, *follow, error
      // referrer: "no-referrer", // no-referrer, *client
      body: '&' + key + '=' + JSON.stringify(data), // 本文のデータ型は "Content-Type" ヘッダーと一致する必要があります  })
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      res.text();
    });
  // .then((text) => {
  //   res = text;
  // }); 
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

function toId(id) {
  console.log('toId');
  console.log('id=' + id);
  let res;
  if (id.match(/\d+/)) {
    let int = id.match(/\d+/);
    res = int[0];
  } else {
    res = id;
  }
  return res;
}