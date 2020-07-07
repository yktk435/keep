<?php
require_once 'DBManager.php';

try {
    $db = getDb();
    $labelMiddle=labelMiddle($db);
    $allLabel=allLabel($db);
  
    
    if ($_POST['update']) {
        $data=json_decode($_POST['update'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        check($data);
        
        $response['data']='update';
        $response['postData']=$data;
        $response['error']=update($db, $data, $labelMiddle);
    } elseif ($_POST['remove']) {
        $data=json_decode($_POST['remove'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        //check($data);
        remove($db, $data);
        $response['data']='remove';
    } elseif ($_POST['create']) {
        $data=json_decode($_POST['create'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        check($data);
        create($db, $data);
        $response['data']=$db->lastInsertId();
    } elseif ($_POST['createLabel']) {
        $data=json_decode($_POST['createLabel'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        if ($data['label_name']) {
            $response['labelId']=createLabel($db, $data);
            ;
        }
    } elseif ($_POST['test']) {
        $data=json_decode($_POST['addLabel'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        //print_r($data);
        $response['data']='aaa';
    } elseif ($_POST['removeLabel']) {
    } elseif ($_POST['addLabel']) {
        $data=json_decode($_POST['addLabel'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        addLabel($db, $data);
    } elseif ($_POST['removeLabelLink']) {
        $data=json_decode($_POST['removeLabelLink'], true);//第2引数をtrueにしないと$dataが連想配列にならない
        removeLabelLink($db, $data);
    } elseif ($_POST['get']) {
        $stt = $db->prepare('SELECT * FROM memo ORDER BY id DESC');
        $stt->execute();
        while ($row=$stt->fetch(PDO::FETCH_ASSOC)) {
            $res[]=$row;
        }
        $stt = $db->prepare('SELECT memo_id,label_id FROM label_middle ORDER BY id');
        $stt->execute();
        $memoIdlabelIdRes=$row=$stt->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP);
        // print_r($memoIdlabelIdRes);
      
        $stt = $db->prepare('SELECT * FROM label');
        $stt->execute();
        while ($row=$stt->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_UNIQUE)) {
            $labelData=$row;
        }
      
        $response['memo']=$res;
        $response['labelMiddle']=$memoIdlabelIdRes;
        $response['label']=$labelData;

    } else {
        print 'NG';
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

function labelMiddle($db)
{
    $stt = $db->prepare('SELECT memo_id,label_id FROM label_middle');
    $stt->execute();
  
    $labelMiddle=$row=$stt->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP);
    return $labelMiddle;
}

function allLabel($db)
{
    $stt = $db->prepare('SELECT * FROM label');
    $stt->execute();
  
    while ($row=$stt->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_UNIQUE)) {
        $allLabel=$row;
    }
    return $allLabel;
}

function update($db, $data, $labelMiddle)
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
//
//
    if (empty($data['labelName'])) {
        $sended=[];
    } else {
        foreach ($data['labelName'] as $key => $value) {
            $sended[]=$key;
        }
    }


    if (empty($sended) || empty($labelMiddle[$data['id']])) {//送信されてくるラベルが0ならすべて消す。
        if (empty($sended)) {
            foreach ($labelMiddle[$data['id']] as $value) {
                removeLabelLink($db, $data['id'], $value);
            }
        } else {
            print_r($sended);
            foreach ($sended as $value) {
                addLabel($db, $data['id'], $value);
            }
        }
    } else {

        //
        $add=array_diff($sended, $labelMiddle[$data['id']]);
        ;

        foreach ($add as  $value) {
            addLabel($db, $data['id'], $value);
        }
        $del=array_diff($labelMiddle[$data['id']], $sended);

        foreach ($del as  $value) {
            removeLabelLink($db, $data['id'], $value);
        }
        // $stt = $db->prepare(' DELETE FROM label_middle WHERE label_id=:label_id AND memo_id=:memo_id');
  // $stt->bindValue(':label_id', $value);
  // $stt->bindValue(':memo_id', $data['id']);
  // $stt->execute();
  // //var_dump($stt->errorInfo());
    }

    
    
    
    return $stt->errorInfo();
}

function remove($db, $data)
{
    $stt = $db->prepare('DELETE FROM memo WHERE id=:id');
    $stt->bindValue(':id', $data['id']);
    $stt->execute();
    $stt = $db->prepare('DELETE FROM label_middle WHERE memo_id=:id');
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
function addLabel($db, $memoId, $labelId)
{
    $stt = $db->prepare('INSERT INTO label_middle (label_id,memo_id) VALUES(:label_id,:memo_id)');
    $stt->bindValue(':label_id', $labelId);
    $stt->bindValue(':memo_id', $memoId);
    $stt->execute();
}

function removeLabelLink($db, $memoId, $labelId)
{
    $stt = $db->prepare('DELETE FROM label_middle WHERE label_id=:label_id AND memo_id=:memo_id');
    $stt->bindValue(':label_id', $labelId);
    $stt->bindValue(':memo_id', $memoId);
    $stt->execute();
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
