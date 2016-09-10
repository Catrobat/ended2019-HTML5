<?php

class ChangeVolumeBrickDto extends BaseBrickDto {

    public $value;	//type of FormulaDto

    public function __construct($value, $commentedOut = false) {
        parent::__construct("ChangeVolume", $commentedOut);

        $this->value = $value;
    }
}
