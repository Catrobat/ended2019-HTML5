<?php

class SizeBrickDto extends OpCodeBrickDto {

    public $value;	//type of FormulaDto

    public function __construct($opCode, $value, $commentedOut = false) {
        parent::__construct($opCode, "Size", $commentedOut);

        $this->value = $value;
    }
}
