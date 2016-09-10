<?php

class SetXBrickDto extends BaseBrickDto {

    public $value;	//FormulaDto

    public function __construct($value, $commentedOut = false) {
        parent::__construct("SetX", $commentedOut);

        $this->value = $value;
    }
}
