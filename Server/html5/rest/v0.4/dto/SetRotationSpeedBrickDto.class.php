<?php

class SetRotationSpeedBrickDto extends BaseBrickDto {

    public $degreesPerSec;	//FormulaDto
	public $ccw;	//bool: counterclockwise (=rotate left)
	
    public function __construct($degreesPerSec, $ccw = false, $commentedOut = false) {
        parent::__construct("SetRotationSpeed", $commentedOut);

        $this->degreesPerSec = $degreesPerSec;
		$this->ccw = $ccw;
    }
}
