<?php

class TurnBrickDto extends BaseBrickDto {

    public $degrees;	//FormulaDto

    public function __construct($degrees, $ccw = false, $commentedOut = false) {
        parent::__construct("Turn", $commentedOut);

        $this->degrees = $degrees;
		$this->ccw = $ccw;
    }
}
