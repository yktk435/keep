<?php
require_once 'DBManager.php';
try {
    $db = getDb();
    $stt = $db->prepare('SELECT * FROM memo ORDER BY id DESC');
    $stt->execute();
    while ($row=$stt->fetch(PDO::FETCH_ASSOC)) {
        $res[]=$row;
    }
} catch (PDOException $e) {
    print "エラーメッセージ：{$e->getMessage()}";
}

?>
<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="utf-8">
  <title>Keep</title>
  <link rel="stylesheet" type="text/css" href="css/def.css">

  <script type="text/javascript" src="js/index.js">

  </script>
</head>

<body>


  <div class="menu">
    メニュー
  </div>
  <!-- メモ追加 -->

  <div id="create" class="add_memo share" datetime="" label_id="" user_id="" color_id="def">

    <div contenteditable="true" class="textArea" onkeyup="keyUp(this)"></div>
    <div contenteditable="true" class="textArea" onkeyup="keyUp(this)"></div>
    <div id="create" class="label-area">
      
    </div>


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
        <li class="label-menu">ラベル<span>▼</span>
          <ul id="create">
            <li><input id="create" type="text" class="add-label" maxlength="50" placeholder="ラベル名を入力" onkeypress="addLabel(event.keyCode);"></li>
            <li onclick="setLabel(this)" label-status="false" label_id="1">ラベル1</li>
            <li onclick="setLabel(this)" label-status="false" label_id="2">ラベル2</li>
          </ul>
        </li>
      </ul>
    </div>

  </div>

  <!-- メモ -->
  <div class="memo_area">
    <?php
    if ($res) {
        foreach ($res as $value) {
            $msg=<<<EOD
         <div class="memo share" id="id_{$value['id']}"  datetime="{$value['datetime']}"         label_id="{$value['label_id']}" user_id="{$value['user_id']}" color_id="{$value['color_id']}">
         <div contenteditable="true" class="textArea"  onkeyup="keyUp(this)">{$value['title']}
         </div>
         <div contenteditable="true" class="textArea"  onkeyup="keyUp(this)">{$value['contents']}
           
         </div>
         
           <div class="">
             <button type="button" name="button" onclick=remove(this)>削除_{$value['id']}</button>
           </div>
           <div class="other_menu">
             <ul class="gnav">
               <li>カラー <span>▼</span>
                 <ul id="id_{$value['id']}">
                   <li id="def" onclick=changeColor(this)>def</li>
                   <li id="red" onclick=changeColor(this)>赤</li>
                   <li id="blue" onclick=changeColor(this)>青</li>
                   <li id="yellow" onclick=changeColor(this)>黄</li>
                 </ul>
               </li>

               <li class="label-menu">ラベル<span>▼</span>
                   <ul id="id_{$value['id']}" class="label-parent">
                     <li><input id="id_{$value['id']}" type="text" class="add-label" maxlength="50" placeholder="ラベル名を入力" onkeypress="addLabel(event.keyCode,this);"></li>
                     <li onclick="setLabel(this)" label-status="false" label_id="1">ラベル1</li>
                     <li onclick="setLabel(this)" label-status="false" label_id="2">ラベル2</li>
                   </ul>


               </li>
             </ul>
           </div>


        </div>
        EOD;
            print $msg;
        }
        print "<dialog>".$value['id']."</dialog>";
    } else {
        print "<dialog>".$db->lastInsertId()."</dialog>";
    }
    
    ?>

  </div>
</body>

</html>