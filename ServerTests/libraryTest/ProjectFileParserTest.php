<?php

require_once("Server/rest/v0.1/library/ProjectFileParser.class.php");

class ProjectFileParserTest extends PHPUnit_Framework_TestCase
{
  public $id = 0;
  public $baseUrl = "http://localhost/html5/projects/v0.1/";
  public $rootPath = "/ServerTests/libraryTest/";
  public $cacheDir = "cache/";
  public $xmlDir = "xml-codes/";

  private function getId()
  {
    return $this->id++;
  }

  private function saveJson($project, $cacheDir)
  {
    $project_json = json_encode($project);
    $filePath = $cacheDir . "code.json";
    $fp = fopen($filePath, "w");
    fwrite($fp, $project_json);
    fclose($fp);
  }

  public function setUp()
  {
    $this->rootPath = getcwd() . $this->rootPath;
    $this->cacheDir = $this->rootPath . $this->cacheDir;
    $this->xmlDir = $this->rootPath . $this->xmlDir;
  }

  public function testWhenProgramStartedBrick()
  {
    $projectId = $this->getId();
    $resBaseUrl = $this->baseUrl . $projectId . "/";
    $cache = $this->cacheDir . __FUNCTION__ . "/";

    $simpleXML = simplexml_load_file($this->xmlDir . "01-when-program-started.xml");

    $parser = new ProjectFileParser($projectId, $resBaseUrl, $cache, $simpleXML);
    $project = $parser->getProject();

    $this->saveJson($project, $cache);
  }
}