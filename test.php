<?php
require_once 'DBManager.php';

try {
  $db = getDb();
  $stt = $db->prepare('INSERT INTO memo(title, contents, datetime,label, color_id, user_id) VALUES(:title, :contents, :datetime, :label, :color_id, :user_id)');
  
  $stt->bindValue(':title', 'タイトル');
  $stt->bindValue(':datetime', date('Y/m/d H:i:s'));
  $stt->bindValue(':contents', '内容');
  $stt->bindValue(':label', 'ラベル');
  $stt->bindValue(':color_id', 000001);
  $stt->bindValue(':user_id', '1');
  
/*
  $stt = $db->prepare('INSERT INTO book(isbn, title, price, publish, published) VALUES(?, ?, ?, ?, ?)');
  $stt->bindValue(1, $_POST['isbn']);
  $stt->bindValue(2, $_POST['title']);
  $stt->bindValue(3, $_POST['price']);
  $stt->bindValue(4, $_POST['publish']);
  $stt->bindValue(5, $_POST['published']);
*/
  $stt->execute();
} catch(PDOException $e) {
  print "エラーメッセージ：{$e->getMessage()}";
}
