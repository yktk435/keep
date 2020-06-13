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
    <div class="add_memo share">
      <input type="text" name="title" value="タイトル" /><br>
      <input type="text" class="content" name="content" value="メモを入力...">
      
    </div>
    <?php
    foreach ($res as $value) {
      $msg=<<<EOD
       <div class="memo share" >
          <p class="title">{$value['title']}</p>
          <p class="content">{$value['contents']}</p>
        </div>
EOD;
      print $msg;
    }
    ?>

  </body>
</html>