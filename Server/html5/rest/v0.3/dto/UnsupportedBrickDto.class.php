<?php

class UnsupportedBrickDto extends BaseBrickDto {

  public $xml;	//original xml for this brick
  public $brickType;
  
  public function __construct($xml, $brickType) {
	parent::__construct("Unsupported");

	$this->xml = $xml;
    $this->brickType = $brickType;
  }

}
