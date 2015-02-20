<?php

class SpeakBrickDto extends BaseBrickDto {

  public $text;	//formula
  
  public function __construct($text) {
	parent::__construct("Speak");

	$this->text = $text;
  }
  
}

?>