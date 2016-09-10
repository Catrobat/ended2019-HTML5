<?php

class MoveNStepsBrickDto extends BaseBrickDto {

    public $steps;	//FormulaDto


    public function __construct($steps, $commentedOut = false) {
        parent::__construct("MoveNSteps", $commentedOut);

        $this->steps = $steps;
    }

}
