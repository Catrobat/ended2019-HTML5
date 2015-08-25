<?php

require_once("Server/html5/rest/v0.1/library/ProjectFileParser_v0_94.class.php");

class ProjectFileParser_v0_94Test extends PHPUnit_Framework_TestCase
{
  public $id = 0;
  public $baseUrl = "http://localhost/html5/projects/v0.1/";
  public $rootPath = "/ServerTests/libraryTest/";
  public $cacheDir = "cache/";
  public $xmlDir = "xml-codes/";
  public $projectsDir = "projects/";

  private function getId()
  {
    return $this->id++;
  }

  private function debug( $str )
  {
    fwrite( STDERR, print_r( $str, TRUE ) );
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

    //$this->debug( $simpleXML );

    $this->assertEquals( true, true );

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
    $json_string = file_get_contents( $cache . "code.json" );
    $json_result = json_decode( $json_string );

    $this->checkHeader( $xml->header, $json_result->header );
  }

  private function checkHeader( $xml_header, $json )
  {
    $expected = (string)$xml_header->catrobatLanguageVersion[0];
    $actual = (string)$json->languageVersion;
    $this->assertEquals( $expected, $actual, "catrobatLanguageVersion <-> languageVersion : FAILED" );

    $expected = (string)$xml_header->description[0];
    $actual = (string)$json->description;
    $this->assertEquals( $expected, $actual, "description <-> description : FAILED" );

    $expected = (string)$xml_header->programName[0];
    $actual = (string)$json->title;
    $this->assertEquals( $expected, $actual, "programName <-> title : FAILED" );

    $expected = (string)$xml_header->url[0];
    $actual = (string)$json->url;
    $this->assertEquals( $expected, $actual, "url <-> url : FAILED" );

    $expected = (string)$xml_header->userHandle[0];
    $actual = (string)$json->author;
    $this->assertEquals( $expected, $actual, "userHandle <-> author : FAILED" );

    $expected = (string)$xml_header->screenHeight[0];
    $actual = (string)$json->device->screenHeight;
    $this->assertEquals( $expected, $actual, "screenHeight <-> screenHeight : FAILED" );

    $expected = (string)$xml_header->screenMode[0];
    $actual = (string)$json->device->screenMode;
    $this->assertEquals( $expected, $actual, "screenMode <-> screenMode : FAILED" );

    $expected = (string)$xml_header->screenWidth[0];
    $actual = (string)$json->device->screenWidth;
    $this->assertEquals( $expected, $actual, "screenWidth <-> screenWidth : FAILED" );
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

    $this->checkJSON( $projectName, $cache );
  }

  public function testSwordPlay()
  {
    $projectName = "sword-play";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $this->processProject($projectName, $cache);

    $this->checkJSON( $projectName, $cache );
  }

}