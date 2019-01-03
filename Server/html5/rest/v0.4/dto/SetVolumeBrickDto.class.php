<?php

class SetVolumeBrickDto extends BaseBrickDto {

    public $value;	//type of FormulaDto

    public function __construct($value, $commentedOut = false) {
        parent::__construct("SetVolume", $commentedOut);

        $this->value = $value;
    }
}
