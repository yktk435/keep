'use strict';
let url = 'http://localhost:8888/keep/processingData.php';
let edditId = '';
let removeCansellData = {
  'title': '',
  'contents': '',
  'timeoutId': '',
  'HTML': ''
};
document.addEventListener('click', (e) => { //新規メモ追加の際、外側をクリックしたら保存
  if (!e.target.closest('#create') && edditId != '') {
    console.log("外側")
    console.log('edditId=' + edditId)
    save(edditId)
  } else {
    console.log("内側")
    console.log('edditId=' + edditId)
  }
})

//入力項目からフフーカスアウトしたら更新情報を送信
function focusOut(obj) {
  console.log('フォーカスアウト=' + edditId)
  let id = toId(obj.parentNode.id);
  edditId = id;

}

//textareaにフォーカスしたら
function focusOn(obj) {
  console.log('フォーカス=' + edditId)
  let id = toId(obj.parentNode.id);
  if (edditId != id && edditId != '') {
    console.log('if')
    save(edditId);
    edditId = id;
  } else {
    console.log('それ以外')
  }
}

function save(edditId) {
  console.log('save////////////');
  console.log("保存=" + edditId)
  let parent = document.getElementById(edditId);
  console.log(parent)
  let now = new Date();
  let title = parent.children[0].value;
  let contents = parent.children[1].value;
  let datetime = getDatetime(now);
  let label = parent.getAttribute('label');
  let color_id = parent.getAttribute('color_id');
  let user_id = parent.getAttribute('user_id');
  let data = {
    'id': edditId,
    'title': title,
    'contents': contents,
    'datetime': datetime,
    'label': label,
    'color_id': color_id,
    'user_id': user_id,
  }
  if (edditId == 'create') { //新規追加時
    console.log('create')
    if (!(title == '' && contents == '')) {
      let insert = document.querySelector('.memo_area');
      delete data.id;
      //let id = postData(url, 'create', data);
       let id = fetchver(url, 'create', data);
      console.log('return===========================================================' + id);
      let el = document.createElement('div');
      el.id = "id_" + id;
      el.className = 'memo share';
      el.setAttribute('datetime', data.datetime);
      el.setAttribute('label', data.label);
      el.setAttribute('color_id', data.color_id);
      el.setAttribute('user_id', data.user_id);
      let template = `
         <textarea class="textArea" placeholder="タイトル" cols="" rows="" wrap="soft" onblur="focusOut(this)" onfocus="focusOn(this)">${title}</textarea>
      
         <textarea class="textArea" placeholder="内容" cols="" rows="" wrap="soft" onblur="focusOut(this)" onfocus="focusOn(this)">${contents}</textarea> 
         <div class="">
           <button type="button" name="button" onclick=remove(this)>削除</button>
           
         </div>
         `;
      el.innerHTML = template;
      document.querySelector('.memo_area').insertBefore(el, document.querySelector('.memo'))
      // let template = `
      // <div class="memo share" id="${id}"  datetime="${datetime}" label="${label}" user_id="${user_id}" color_id="${color_id}">
      //    <textarea class="textArea" placeholder="タイトル" cols="" rows="" wrap="soft" onblur="focusOut(this)" onfocus="focusOn(this)">${title}</textarea>
      // 
      //    <textarea class="textArea" placeholder="内容" cols="" rows="" wrap="soft" onblur="focusOut(this)" onfocus="focusOn(this)">${contents}</textarea> 
      //    <div class="">
      //      <button type="button" name="button" onclick=remove(this)>削除</button>
      // 
      //    </div>
      // 
      // </div>
      // `;
      //insert.innerHTML += template;
      parent.children[0].value = '';
      parent.children[1].value = '';

    }
  } else { //更新時
    postData(url, 'update', data);
  }
  console.log('save 終わり')
}

function remove(obj) {
  console.log('remove');
  let parent = obj.parentNode.parentNode;
  let id = toId(parent.id);
  let data = {
    'id': id
  }
  removeCansellData.title = parent.children[0].value;
  removeCansellData.contents = parent.children[1].value;
  //今のmemo状況を一時保存
  removeCansellData.HTML = document.querySelector('.memo_area').innerHTML;
  //10秒後にデータベースから消去
  removeCansellData.timeoutId = setTimeout(() => {
    postData(url, 'remove', data)
  }, 5000);
  parent.remove();

  //消去キャンセル用通知
  let el = document.createElement('div')
  el.className = 'cansell';
  el.innerHTML = '<button type="button" name="button" onclick=removeCansell(this)>戻す</button>';
  document.body.appendChild(el)
}

function removeCansell(obj) {
  console.log('removeCansell');

  clearTimeout(removeCansellData.timeoutId);
  document.querySelector('.memo_area').innerHTML = removeCansellData.HTML;

  obj.parentNode.remove();
}

//post送信
function postData(url, key, data) {
  console.log('postData');
  let xhr = new XMLHttpRequest();
  let res;
  xhr.open('POST', url)
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send('&' + key + '=' + JSON.stringify(data));
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      console.log("response==" + xhr.responseText)
      res = xhr.responseText;
    }
  }
}

function fetchver(url, key, data) {
  console.log('fetch');
  let res;
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
        body: '&'+key+'='+JSON.stringify(data), // 本文のデータ型は "Content-Type" ヘッダーと一致する必要があります  })
      })
      .then(response =>{return response.text()})
      .then((text)=>{
        console.log('ここ'+text);
        res=text;
      }); // レスポンスの JSON を解析
      
      return res;
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
        if (id == 'create') {
          res = id;
        } else {
          let int = id.match(/\d+/);
          res = int[0];
        }

        return res;
      }