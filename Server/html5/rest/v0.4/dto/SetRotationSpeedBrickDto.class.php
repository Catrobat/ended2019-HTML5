<?php

class SetRotationSpeedBrickDto extends BaseBrickDto {

    public $degreesPerSec;	//FormulaDto
	//public $ccw = false;
	
    public function __construct($degreesPerSec, $commentedOut = false) {
        parent::__construct("SetRotationSpeed", $commentedOut);

        $this->degreesPerSec = $degreesPerSec;
    }
}
