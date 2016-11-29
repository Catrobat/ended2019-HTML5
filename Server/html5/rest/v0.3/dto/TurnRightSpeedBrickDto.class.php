<?php

class TurnRightSpeedBrickDto extends BaseBrickDto {

    public $degreesPerSec;	//FormulaDto

    public function __construct($degreesPerSec, $commentedOut = false) {
        parent::__construct("TurnRightSpeed", $commentedOut);

        $this->degreesPerSec = $degreesPerSec;
    }
}
