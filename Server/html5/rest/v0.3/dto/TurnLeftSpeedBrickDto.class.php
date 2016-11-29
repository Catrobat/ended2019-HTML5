<?php

class TurnLeftSpeedBrickDto extends BaseBrickDto {

    public $degreesPerSec;	//FormulaDto

    public function __construct($degreesPerSec, $commentedOut = false) {
        parent::__construct("TurnLeftSpeed", $commentedOut);

        $this->degreesPerSec = $degreesPerSec;
    }
}
