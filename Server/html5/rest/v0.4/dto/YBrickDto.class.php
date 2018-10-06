<?php

class ChangeYBrickDto extends OpCodeBrickDto {

    public $value;	//type of FormulaDto

    public function __construct($opCode, $value, $commentedOut = false) {
        parent::__construct($opCode, "Y", $commentedOut);

        $this->value = $value;
    }
}
