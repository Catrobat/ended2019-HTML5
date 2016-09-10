<?php

class SetYBrickDto extends BaseBrickDto {

    public $value;	//FormulaDto

    public function __construct($value, $commentedOut = false) {
        parent::__construct("SetY", $commentedOut);

        $this->value = $value;
    }

}
