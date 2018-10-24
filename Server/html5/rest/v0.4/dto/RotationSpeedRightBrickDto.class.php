<?php

class RotationSpeedRightBrickDto extends BaseBrickDto {

    public $degreesPerSec;	//FormulaDto

    public function __construct($degreesPerSec, $commentedOut = false) {
        parent::__construct("RotationSpeedRight", $commentedOut);

        $this->degreesPerSec = $degreesPerSec;
    }
}
