<?php

class SpeakAndWaitBrickDto extends BaseBrickDto {

  public $text;	//formula

  public function __construct($text) {
      parent::__construct("SpeakAndWait");

	$this->text = $text;
  }

}
