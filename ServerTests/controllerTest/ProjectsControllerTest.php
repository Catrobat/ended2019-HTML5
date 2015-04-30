<?php

require_once("./Server/rest/v0.1/controller/ProjectsController.class.php");

class ProjectsControllerTest extends PHPUnit_Framework_TestCase
{
  public function testPath()
  {
    $expected = "/var/www/";
    $actual = ProjectsController::SERVER_ROOT;
    $this->assertEquals($expected, $actual);
  }
}