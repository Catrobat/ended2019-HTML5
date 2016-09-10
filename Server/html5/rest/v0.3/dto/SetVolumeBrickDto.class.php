<?php

class SetVolumeBrickDto extends BaseBrickDto {

    public $percentage;	//type of FormulaDto

    public function __construct($percentage, $commentedOut = false) {
        parent::__construct("SetVolume", $commentedOut);

        $this->percentage = $percentage;
    }

}
