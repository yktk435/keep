<?php
require_once 'DBManager.php';

try {
    $db = getDb();
    if ($_POST['update']) {
        $data=json_decode($_POST['update'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        update($db, $data);
    } elseif ($_POST['remove']) {
        $data=json_decode($_POST['remove'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        remove($db, $data);
    } elseif ($_POST['create']) {
        $data=json_decode($_POST['create'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        create($db, $data);
        print $db->lastInsertId();
    }
} catch (PDOException $e) {
    print "エラーメッセージ：{$e->getMessage()}";
} finally {
    $_POST=[];
}


function update($db, $data)
{
    $stt = $db->prepare('UPDATE memo SET title=:title, contents=:contents, datetime=:datetime, label=:label, color_id=:color_id, user_id=:user_id WHERE id=:id');

    $stt->bindValue(':id', $data['id']);
    $stt->bindValue(':title', $data['title']);
    $stt->bindValue(':datetime', $data['datetime']);
    $stt->bindValue(':contents', $data['contents']);
    $stt->bindValue(':label', $data['label']);
    $stt->bindValue(':color_id', (int)$data['color_id']);
    $stt->bindValue(':user_id', (int)$data['user_id']);
    $stt->execute();
}

function remove($db, $data)
{
    $stt = $db->prepare('DELETE FROM memo WHERE id=:id');
  
    $stt->bindValue(':id', $data['id']);
    $stt->execute();
}

function create($db, $data)
{
    $stt = $db->prepare('INSERT INTO memo (title, contents, datetime, label, color_id, user_id) VALUES(:title, :contents, :datetime, :label, :color_id, :user_id)');
  
    $stt->bindValue(':title', $data['title']);
    $stt->bindValue(':datetime', $data['datetime']);
    $stt->bindValue(':contents', $data['contents']);
    $stt->bindValue(':label', $data['datetime']);
    $stt->bindValue(':color_id', (int)$data['color_id']);
    $stt->bindValue(':user_id', (int)$data['user_id']);
    $stt->execute();
}
