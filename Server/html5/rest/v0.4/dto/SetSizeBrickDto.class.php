<?php

class SetSizeBrickDto extends BaseBrickDto {

    public $percentage;	//FormulaDto

    public function __construct($percentage, $commentedOut = false) {
        parent::__construct("SetSize", $commentedOut);

        $this->percentage = $percentage;
    }
}
