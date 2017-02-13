<?php

class WaitBrickDto extends BaseBrickDto {

    public $duration;	//type of FormulaDto

    public function __construct($duration, $commentedOut = false) {
        parent::__construct("Wait", $commentedOut);

        $this->duration = $duration;
    }
}
