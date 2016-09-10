<?php

class SetMassBrickDto extends BaseBrickDto {

    public $value;	//FormulaDto

    public function __construct($value, $commentedOut = false) {
        parent::__construct("SetMass", $commentedOut);

        $this->value = $value;
    }
}
