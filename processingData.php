<?php
require_once 'DBManager.php';

try {
    $db = getDb();
    if ($_POST['update']) {
        $data=json_decode($_POST['update'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        check($data);
        update($db, $data);
        $response['data']='update';
    } elseif ($_POST['remove']) {
        $data=json_decode($_POST['remove'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        check($data);
        remove($db, $data);
        $response['data']='remove';
    } elseif ($_POST['create']) {
        $data=json_decode($_POST['create'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        check($data);
        create($db, $data);
        $response['data']=$db->lastInsertId();
    } elseif ($_POST['createLabel']) {
      $data=json_decode($_POST['createLabel'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        
        $response['labelId']=createLabel($db, $data);
    } elseif ($_POST['removeLabel']) {
    }
} catch (PDOException $e) {
    http_response_code(404);
    $response['data']=$e->getMessage();
    print json_encode($response);
} catch (Exception $e) {
    http_response_code(404);
    $response['data']=$e->getMessage();
    print json_encode($response);
} finally {
    $_POST=[];
    print json_encode($response);
}


function update($db, $data)
{
    $stt = $db->prepare('UPDATE memo SET title=:title, contents=:contents, datetime=:datetime, label_id=:label_id, color_id=:color_id, user_id=:user_id WHERE id=:id');

    $stt->bindValue(':id', $data['id']);
    $stt->bindValue(':title', $data['title']);
    $stt->bindValue(':datetime', $data['datetime']);
    $stt->bindValue(':contents', $data['contents']);
    $stt->bindValue(':label_id', $data['label_id']);
    $stt->bindValue(':color_id', $data['color_id']);
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
    $stt = $db->prepare('INSERT INTO memo (title, contents, datetime, label_id, color_id, user_id) VALUES(:title, :contents, :datetime, :label_id, :color_id, :user_id)');
  
    $stt->bindValue(':title', $data['title']);
    $stt->bindValue(':datetime', $data['datetime']);
    $stt->bindValue(':contents', $data['contents']);
    $stt->bindValue(':label_id', $data['datetime']);
    $stt->bindValue(':color_id', $data['color_id']);
    $stt->bindValue(':user_id', (int)$data['user_id']);
    $stt->execute();
}

function createLabel($db, $data)
{
    $stt = $db->prepare('INSERT INTO label (name) VALUES(:name)');

    $stt->bindValue(':name', $data['label_name']);
    $stt->execute();
    $lastId=$db->lastInsertId();
    
    $stt = $db->prepare('INSERT INTO label_middle (memo_id,label_id) VALUES(:memo_id,:label_id)');

    $stt->bindValue(':memo_id', $data['memo_id']);
    $stt->bindValue(':label_id', $lastId);
    $stt->execute();
    return $lastId;
}

function linkMemoTolabel($db, $data)
{
}

function check($data)
{
    if ($data['title']=='' && $data['contents']=='') {
        throw new Exception('タイトルと内容がどちらも空です。');
    }
    if ($_POST['remove']) {
        if ($data['id']=='') {
            throw new Exception('メモIDが空です。');
        }
    }
}
