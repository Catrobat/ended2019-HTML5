<?php

class ChangeVolumeBrickDto extends OpCodeBrickDto {

    public $value;	//type of FormulaDto

    public function __construct($opCode, $value, $commentedOut = false) {
        parent::__construct($opCode, "Volume", $commentedOut);

        $this->value = $value;
    }
}
