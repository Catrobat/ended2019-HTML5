<?php

class ChangeXBrickDto extends OpCodeBrickDto {

    public $value;	//type of FormulaDto

    public function __construct($opCode, $value, $commentedOut = false) {
        parent::__construct($opCode, "X", $commentedOut);

        $this->value = $value;
    }
}
