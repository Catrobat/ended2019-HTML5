<?php

class ChangeYBrickDto extends BaseBrickDto {

    public $value;	//type of FormulaDto


    public function __construct($value, $commentedOut = false) {
        parent::__construct("ChangeY", $commentedOut);

        $this->value = $value;
    }

}
