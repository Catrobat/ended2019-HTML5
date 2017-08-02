<?php


class ProjectsControllerTest extends PHPUnit_Framework_TestCase
{
  public function testAPI()
  {
    // correct test API
    $expected = "https://web-test.catrob.at/";
    $this->assertEquals($expected, ProjectsController::TEST_API);

    // correct deploy API
    $expected = "https://share.catrob.at/";
    $this->assertEquals($expected, ProjectsController::DEPLOY_API);
  }
}