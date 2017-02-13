<?php


class ProjectFileParser_v0_94Test extends PHPUnit_Framework_TestCase
{
  public $id = 0;
  public $baseUrl = "http://localhost/html5/rest/v0.2/projects/";
  public $rootPath = "/libraryTest/";
  public $cacheDir = "cache/";
  public $xmlDir = "xml-codes/";
  public $projectsDir = "projects/";

  private function getId()
  {
    return $this->id++;
  }

  private function debug($str)
  {
    fwrite(STDERR, print_r($str, TRUE));
  }

  private function prepareCache($cache)
  {
    if(!is_dir($cache))
      mkdir($cache, 0777, true);

    if(!is_dir($cache . "/images"))
      mkdir($cache . "/images", 0777, true);

    if(!is_dir($cache . "/sounds"))
      mkdir($cache . "/sounds", 0777, true);
  }

  private function processProject($projectName, $cache)
  {
    $projectId = $this->getId();
    $projectPath = $this->projectsDir . $projectName;
    $resBaseUrl = $this->baseUrl . $projectId . "/";

    $this->prepareCache($cache);

    $this->copyDir($projectPath . "/images", $cache . "/images");
    $this->copyDir($projectPath . "/sounds", $cache . "/sounds");

    $simpleXML = simplexml_load_file($projectPath . "/code.xml");

    $parser = new ProjectFileParser_v0_94($projectId, $resBaseUrl, $cache, $simpleXML);
    $project = $parser->getProject();

    $this->saveJson($project, $cache);
  }

  private function copyDir($src, $dst)
  {
    $dir = opendir($src);
    @mkdir($dst);
    while(false !== ($file = readdir($dir)))
    {
      if(($file != '.') && ($file != '..'))
      {
        if(is_dir($src . '/' . $file))
        {
          copyDir($src . '/' . $file, $dst . '/' . $file);
        }
        else
        {
          copy($src . '/' . $file, $dst . '/' . $file);
        }
      }
    }
    closedir($dir);
  }

  private function saveJson($project, $cacheDir)
  {
    if(!is_dir($cacheDir))
      mkdir($cacheDir, 0777, true);

    $project_json = json_encode($project);
    $filePath = $cacheDir . "code.json";
    $fp = fopen($filePath, "w+");
    fwrite($fp, $project_json);
    fclose($fp);
  }

  private function checkJSON($projectName, $cache)
  {
    $projectPath = $this->projectsDir . $projectName;

    // XML
    $xml = simplexml_load_file($projectPath . "/code.xml");

    // JSON
    $empty = "{}";
    $json_empty = json_decode($empty);

    $json_string = file_get_contents($cache . "code.json");
    $this->assertNotEquals($empty, $json_empty, "code.json is empty");

    $json_result = json_decode($json_string);
    $this->assertNotEquals($json_empty, $json_result, "json_result is empty");

    // check existence
    $this->assertTrue(isset($json_result->id), "json: id is missing");
    $this->assertTrue(isset($json_result->header), "json: header is missing");
    $this->assertTrue(isset($json_result->background), "json: background is missing");
    $this->assertTrue(isset($json_result->sprites), "json: sprites is missing");
    $this->assertTrue(isset($json_result->resourceBaseUrl), "json: resourceBaseUrl is missing");
    $this->assertTrue(isset($json_result->images), "json: images is missing");
    $this->assertTrue(isset($json_result->sounds), "json: sounds is missing");
    $this->assertTrue(isset($json_result->variables), "json: variables is missing");
    $this->assertTrue(isset($json_result->lists), "json: lists is missing");
    $this->assertTrue(isset($json_result->broadcasts), "json: broadcasts is missing");

    $this->assertNotEquals($json_empty, $json_result->header, "json: header is empty");
    $this->assertNotEquals($json_empty, $json_result->background, "json: background is empty");

    // check validity
    $expBaseUrl = "/html5/rest/v0.2/projects/" . $json_result->id . "/";
    $this->assertContains($expBaseUrl, $json_result->resourceBaseUrl, "json: wrong resourceBaseUrl");

    $this->checkHeader($xml->header, $json_result->header);
    $this->checkBackground($xml->objectList[0]->object, $json_result->background);
    $this->checkSprites($json_empty, $json_empty);
    $this->checkImages($xml->objectList[0], $json_result->images);
    $this->checkSounds($json_empty, $json_empty);
    $this->checkGlobalVariables($xml->data[0]->programVariableList[0], $json_result->variables);
    $this->checkGlobalLists($xml->data[0]->programListOfLists[0], $json_result->lists);
    $this->checkBroadcasts($json_empty, $json_empty);
  }

  private function checkHeader($xml_header, $json)
  {
    // check existence
    $this->assertTrue(isset($json->languageVersion), "json: languageVersion is missing");
    $this->assertTrue(isset($json->description), "json: description is missing");
    $this->assertTrue(isset($json->title), "json: title is missing");
    $this->assertTrue(isset($json->url), "json: url is missing");
    $this->assertTrue(isset($json->author), "json: author is missing");
    $this->assertTrue(isset($json->device->screenHeight), "json: device->screenHeight is missing");
    $this->assertTrue(isset($json->device->screenMode), "json: device->screenMode is missing");
    $this->assertTrue(isset($json->device->screenWidth), "json: device->screenWidth is missing");

    // check validity
    $expected = (string)$xml_header->catrobatLanguageVersion[0];
    $actual = (string)$json->languageVersion;
    $this->assertEquals($expected, $actual, "catrobatLanguageVersion <-> languageVersion : FAILED");

    $expected = (string)$xml_header->description[0];
    $actual = (string)$json->description;
    $this->assertEquals($expected, $actual, "description <-> description : FAILED");

    $expected = (string)$xml_header->programName[0];
    $actual = (string)$json->title;
    $this->assertEquals($expected, $actual, "programName <-> title : FAILED");

    $expected = (string)$xml_header->url[0];
    $actual = (string)$json->url;
    $this->assertEquals($expected, $actual, "url <-> url : FAILED");

    $expected = (string)$xml_header->userHandle[0];
    $actual = (string)$json->author;
    $this->assertEquals($expected, $actual, "userHandle <-> author : FAILED");

    $expected = (string)$xml_header->screenHeight[0];
    $actual = (string)$json->device->screenHeight;
    $this->assertEquals($expected, $actual, "screenHeight <-> screenHeight : FAILED");

    $expected = (string)$xml_header->screenMode[0];
    $actual = (string)$json->device->screenMode;
    $this->assertEquals($expected, $actual, "screenMode <-> screenMode : FAILED");

    $expected = (string)$xml_header->screenWidth[0];
    $actual = (string)$json->device->screenWidth;
    $this->assertEquals($expected, $actual, "screenWidth <-> screenWidth : FAILED");
  }

  private function checkBackground($xml_bg, $json)
  {
    // check existence
    $this->assertTrue(isset($json->id), "json: id is missing");
    $this->assertTrue(isset($json->name), "json: name is missing");
    $this->assertTrue(isset($json->looks), "json: looks is missing");
    $this->assertTrue(isset($json->sounds), "json: sounds is missing");
    $this->assertTrue(isset($json->variables), "json: variables is missing");
    $this->assertTrue(isset($json->lists), "json: lists is missing");
    $this->assertTrue(isset($json->scripts), "json: scripts is missing");
      $this->assertTrue(isset($json->userScripts), "json: userScripts is missing");

    // check validity
    $this->assertContains("s", $json->id);

    $expected = (string)$xml_bg['name'];
    $actual = (string)$json->name;
    $this->assertEquals($expected, $actual, "bg name <-> name != 'Background' : FAILED");

    $expected = count($xml_bg->lookList[0]);
    $actual = count($json->looks);
    $this->assertEquals($expected, $actual, "lookList <-> looks -> LENGTH : FAILED");

    $expected = count($xml_bg->soundList[0]);
    $actual = count($json->sounds);
    $this->assertEquals($expected, $actual, "lookList <-> looks -> LENGTH : FAILED");

//    if(count($xml_bg->scriptList[0]) > 0)
//    {
//      $expected = count($xml_bg->scriptList[0]->script[0]->brickList[0]);
//      echo $expected . " vs. ";
//      $actual = count($json->bricks->bricks);
//      echo $actual;
//    }

  }

  private function checkSprites($xml_sprites, $json)
  {

  }

  private function checkImages($xml_imgs, $json)
  {
    $images = [];
    foreach($json as $image)
    {
      $this->assertTrue(isset($image->id), "json: image id is missing");
      $this->assertTrue(isset($image->url), "json: image url is missing");
      $this->assertTrue(isset($image->size), "json: image size is missing");
      $url = str_replace("images/", "", $image->url);
      array_push($images, $url);
    }

    foreach($xml_imgs as $object)
    {
      $lookList = $object->lookList[0];
      foreach($lookList as $look)
      {
        $url = $look->fileName;
        $this->assertTrue(in_array($url, $images), "json: " . $url . " not found");
      }
    }
  }

  private function checkSounds($xml_sounds, $json)
  {
    $sounds = [];
    foreach($json as $sound)
    {
      $this->assertTrue(isset($sound->id), "json: sound id is missing");
      $this->assertTrue(isset($sound->url), "json: sound url is missing");
      $this->assertTrue(isset($sound->size), "json: sound size is missing");
      $url = str_replace("sounds/", "", $sound->url);
      array_push($sounds, $url);
    }

    foreach($xml_sounds as $object)
    {
      $soundList = $object->soundList[0];
      foreach($soundList as $sound)
      {
        $url = $sound->fileName;
        $this->assertTrue(in_array($url, $sounds), "json: " . $url . " not found");
      }
    }
  }

  private function checkGlobalVariables($xml_vars, $json)
  {
    $expected = count($xml_vars);
    $actual = count($json);
    $this->assertEquals($expected, $actual, "global vars count : FAILED");
  }

  private function checkGlobalLists($xml_lists, $json)
  {
    $expected = count($xml_lists);
    $actual = count($json);
    $this->assertEquals($expected, $actual, "global lists count : FAILED");
  }

  private function checkBroadcasts($xml_bc, $json)
  {

  }

  public function setUp()
  {
    $this->rootPath = getcwd() . $this->rootPath;
    $this->cacheDir = $this->rootPath . $this->cacheDir;
    $this->xmlDir = $this->rootPath . $this->xmlDir;
    $this->projectsDir = $this->rootPath . $this->projectsDir;
  }

  public function testAddListBrick()
  {
    $projectName = "add-list";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testLocalList1()
  {
    $projectName = "local-list-1";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testLocalList2()
  {
    $projectName = "local-list-2";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testLocalList3()
  {
    $projectName = "local-list-3";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testLocalListFull()
  {
    $projectName = "local-list-full";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testGlobalList1()
  {
    $projectName = "global-list-1";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testGlobalList2()
  {
    $projectName = "global-list-2";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testGlobalList3()
  {
    $projectName = "global-list-3";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testGlobalListFull()
  {
    $projectName = "global-list-full";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testBumpBorderBrick()
  {
    $projectName = "bump-border";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testChangeBrightnessBrick()
  {
    $projectName = "change-brightness";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testChangeSizeBrick()
  {
    $projectName = "change-size";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testChangeTransparencyBrick()
  {
    $projectName = "change-transparency";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  // !!! fails
  public function testChangeVarBrick()
  {
    $projectName = "change-var";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testChangeVolumeBrick()
  {
    $projectName = "change-volume";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testChangeXBrick()
  {
    $projectName = "change-x";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testChangeYBrick()
  {
    $projectName = "change-y";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testForBrick()
  {
    $projectName = "for";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testHideBrick()
  {
    $projectName = "hide";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testIfThenBrick()
  {
    $projectName = "if-then";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testInsertListBrick()
  {
    $projectName = "insert-list";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testLevelBackBrick()
  {
    $projectName = "level-back";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testLevelFrontBrick()
  {
    $projectName = "level-front";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testShowBrick()
  {
    $projectName = "show";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testSlideBrick()
  {
    $projectName = "slide";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testSpeakBrick()
  {
    $projectName = "speak";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testStartSoundBrick()
  {
    $projectName = "start-sound";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testStopSoundsBrick()
  {
    $projectName = "stop-sounds";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testTurnLeftBrick()
  {
    $projectName = "turn-left";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testTurnRightBrick()
  {
    $projectName = "turn-right";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testWaitBrick()
  {
    $projectName = "wait";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testWhenReceivedBrick()
  {
    $projectName = "when-received";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testWhenTappedBrick()
  {
    $projectName = "when-tapped";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testSetVarBrick()
  {
    $projectName = "set-var";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testChangeVarEBrick()
  {
    $projectName = "change-var-e";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);
  }

  public function testEmptyProject()
  {
    $projectName = "empty";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);

    //$this->checkJSON($projectName, $cache);
  }

  public function testVars()
  {
    $projectName = "vars";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);

    $this->checkJSON($projectName, $cache);
  }

  public function testSwordPlay()
  {
    $projectName = "sword-play";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);

    $this->checkJSON($projectName, $cache);
  }

  public function testShowHide()
  {
    $projectName = "show-hide";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);

    $this->checkJSON($projectName, $cache);
  }
}