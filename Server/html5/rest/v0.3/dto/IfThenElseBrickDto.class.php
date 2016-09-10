<?php

class IfThenElseBrickDto extends BaseBrickDto {

    public $condition;	//type of FormulaDto

    public $ifBricks = array();	//inner scripts: if block
    public $elseBricks = array();	//inner scripts: else block
    public $showElse;

    public function __construct($condition, $showElse = true, $commentedOut = false) {
        parent::__construct("IfThenElse", $commentedOut);
        $this->condition = $condition;
        $this->showElse = $showElse;
    }
}
