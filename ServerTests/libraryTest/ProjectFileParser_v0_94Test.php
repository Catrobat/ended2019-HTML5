<?php

require_once("Server/rest/v0.1/library/ProjectFileParser_v0_94.class.php");

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
}