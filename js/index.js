'use strict';
let url = 'http://localhost:8888/keep/processingData.php';
let edditId='';
document.addEventListener("DOMContentLoaded", function(){
  document.body.addEventListener('click',(e)=>{
    save(edditId);
  })
})


//入力項目からフフーカスアウトしたら更新情報を送信
function focusOut(obj) {
  let id=obj.parentNode.id;
  edditId=id;
}

//textareaにフォーカスしたら
function focusOn(obj) {
  let id=obj.parentNode.id;
  if(edditId!=id && edditId!=0){
    save(edditId);
    edditId=id;
  }
}

function save(edditId){
  let parent=document.getElementById(edditId);
  let now = new Date();
  let title = parent.children[0].value;
  let contents = parent.children[1].value;
  let datetime = getDatetime(now);
  let label = parent.getAttribute('label') ;
  let color_id = parent.getAttribute('color_id');
  let user_id = parent.getAttribute('user_id');
  let data = {
    'id': edditId,
    'title': title,
    'contents': contents,
    'datetime': datetime,
    'label':label,
    'color_id':color_id,
    'user_id': user_id,
  }

  if(edditId=='create'){
    console.log('create');
    if(!(title=='' && contents=='')){
      let insert=document.querySelector('.memo_area');
      delete data.id;
      let id=postData(url, 'create', data);          
      let template=`
      <div class="memo share" id="${id}"  datetime="${datetime}" label="${label}" user_id="${user_id}" color_id="${color_id}">
         <textarea class="textArea" placeholder="タイトル" cols="" rows="" wrap="soft" onblur="send(this)" onfocus="bgchange(this)">${title}</textarea>
         
         <textarea class="textArea" placeholder="内容" cols="" rows="" wrap="soft" onblur="send(this)" onfocus="bgchange(this)">${contents}</textarea> 
         <div class="">
           <button type="button" name="button" onclick=remove(this)>削除</button>
           
         </div>

      </div>
      `;
      insert.innerHTML+=template;
      parent.children[0].value='';
      parent.children[1].value='';

    }
  }else{  
    postData(url, 'update', data);    
  }

}

//post送信
function postData(url, key, data) {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', url)
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send('&' + key + '=' + JSON.stringify(data));
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      //console.log("response=="+xhr.responseText)
      return xhr.responseText;
    }
  }
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

function remove(obj) {
  let parent = obj.parentNode.parentNode;
  let id = parent.id;
  let data = {'id': id}
  parent.remove();
  postData(url, 'remove', data);
}