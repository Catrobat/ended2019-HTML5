<?php

class SetSizeBrickDto extends BaseBrickDto {

    public $value;	//FormulaDto

    public function __construct($value, $commentedOut = false) {
        parent::__construct("SetSize", $commentedOut);

        $this->value = $value;
    }
}
