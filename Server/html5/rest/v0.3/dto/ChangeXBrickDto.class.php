<?php

class ChangeXBrickDto extends BaseBrickDto {

    public $value;	//type of FormulaDto

    public function __construct($value, $commentedOut = false) {
        parent::__construct("ChangeX", $commentedOut);

        $this->value = $value;
    }
}
