<?php

class TurnLeftBrickDto extends BaseBrickDto {

    public $degrees;	//FormulaDto

    public function __construct($degrees, $commentedOut = false) {
        parent::__construct("TurnLeft", $commentedOut);

        $this->degrees = $degrees;
    }

}
