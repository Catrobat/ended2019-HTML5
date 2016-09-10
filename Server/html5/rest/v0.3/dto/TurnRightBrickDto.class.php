<?php

class TurnRightBrickDto extends BaseBrickDto {

    public $degrees;	//FormulaDto

    public function __construct($degrees, $commentedOut = false) {
        parent::__construct("TurnRight", $commentedOut);

        $this->degrees = $degrees;
    }

}
