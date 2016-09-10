<?php

class SetFrictionBrickDto extends BaseBrickDto {

    public $percentage;	//FormulaDto

    public function __construct($percentage, $commentedOut = false) {
        parent::__construct("SetFriction", $commentedOut);

        $this->percentage = $percentage;
    }
}
