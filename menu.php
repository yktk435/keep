<?php
require_once 'DBManager.php';
try {
  $db = getDb();
  $stt = $db->prepare('SELECT * FROM memo');
  $stt->execute();
  while($row=$stt->fetch(PDO::FETCH_ASSOC)){
    $res[]=$row;
  }
} catch(PDOException $e) {
  print "エラーメッセージ：{$e->getMessage()}";
}

?>
<!DOCTYPE html>
<html lang="ja" >
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
    <div  id="create" class="add_memo share" datetime="" label="" user_id="" color_id=""> 
      <textarea class="textArea" placeholder="タイトル" cols="" rows="" wrap="soft" onblur="focusOut(this)" onfocus="focusOn(this)"></textarea>
      
      <textarea class="textArea" placeholder="内容" cols="" rows="" wrap="soft" onblur="focusOut(this)" onfocus="focusOn(this)"></textarea> 

    </div>
    <!-- メモ -->
    <div class="memo_area">
    <?php
    if($res){
      foreach ($res as $value) {
        $msg=<<<EOD
         <div class="memo share" id="id_{$value['id']}"  datetime="{$value['datetime']}"         label="{$value['label']}" user_id="{$value['user_id']}" color_id="{$value['color_id']}">
           <textarea class="textArea" placeholder="タイトル" cols="" rows="" wrap="soft" onblur="focusOut(this)" onfocus="focusOn(this)">{$value['title']}</textarea>
           
           <textarea class="textArea" placeholder="内容" cols="" rows="" wrap="soft" onblur="focusOut(this)" onfocus="focusOn(this)">{$value['contents']}</textarea> 
           <div class="">
             <button type="button" name="button" onclick=remove(this)>削除</button>
             
           </div>

        </div>
        EOD;
        print $msg;
      }      
    }
    ?>
    
</div>
  </body>
</html>