<?php

class TextToSpeechProvider {

  public $projectId;
  public $soundId;
  
  public function __construct($projectId) {

	$this->$projectId = $projectId;

  }

  public function loadSoundFile($text) {
    
  } 
   
}

?>