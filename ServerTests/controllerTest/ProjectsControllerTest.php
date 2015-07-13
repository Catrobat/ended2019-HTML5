<?php

require_once("Server/rest/v0.1/controller/ProjectsController.class.php");

class ProjectsControllerTest extends PHPUnit_Framework_TestCase
{
  public function testAPI()
  {
    // correct test API
    $expected = "https://web-test.catrob.at/pocketcode";
    $this->assertEquals($expected, ProjectsController::TEST_API);

    // correct deploy API
    $expected = "https://share.catrob.at/pocketcode";
    $this->assertEquals($expected, ProjectsController::DEPLOY_API);
  }
}