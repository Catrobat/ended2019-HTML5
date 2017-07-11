<?php

class GoBackBrickDto extends BaseBrickDto {

    public $layers;	//FormulaDto

    public function __construct($layers, $commentedOut = false) {
        parent::__construct("GoBack", $commentedOut);

        $this->layers = $layers;
    }
}
