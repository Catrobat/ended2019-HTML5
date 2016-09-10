<?php

class SetBounceFactorBrickDto extends BaseBrickDto {

    public $percentage;	//FormulaDto

    public function __construct($percentage, $commentedOut = false) {
        parent::__construct("SetBounceFactor", $commentedOut);

        $this->percentage = $percentage;
    }
}
