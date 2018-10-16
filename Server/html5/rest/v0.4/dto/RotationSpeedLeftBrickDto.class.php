<?php

class RotationSpeedLeftBrickDto extends BaseBrickDto {

    public $degreesPerSec;	//FormulaDto

    public function __construct($degreesPerSec, $commentedOut = false) {
        parent::__construct("RotationSpeedLeft", $commentedOut);

        $this->degreesPerSec = $degreesPerSec;
    }
}
