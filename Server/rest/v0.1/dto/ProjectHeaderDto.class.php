<?php

class ProjectHeaderDto {

  //public $applicationBuildName;
  //public $applicationBuildNumber;
  //public $applicationName;
  //public $applicationVersion;
  public $languageVersion;
  //public $dateTimeUpload;
  public $description;
  
  //public $mediaLicense;
  //public $programLicense;
  public $title;	//$programName;
  //public $remixOf;
  //public $tags = array();
  public $url;
  public $author;	//$userHandle;
  public $bricksCount;
  public $device;
  
  
  public function __construct($title, $description, $languageVersion, $author, $url) {
    $this->title = $title;
    $this->description = $description;
    $this->languageVersion = $languageVersion;
    $this->author = $author;
    $this->url = $url;
  }
  
}
