<?php
function getDb() {
  $dsn = 'mysql:dbname=keep; host=127.0.0.1; port=8889; charset=utf8';
  $usr = 'keep';
  $passwd = 'keeppass';

    $db = new PDO($dsn, $usr, $passwd);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db = new PDO($dsn, $usr, $passwd, [PDO::ATTR_PERSISTENT => true]);
  return $db;
}