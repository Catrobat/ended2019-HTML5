<?php

class ShowVariableBrickDto extends BaseBrickDto
{
    public $resourceId;
    public $x;	//FormulaDto
    public $y;	//FormulaDto

    public function __construct($resourceId, $x, $y, $commentedOut = false) {
        parent::__construct("ShowVariable", $commentedOut);

        $this->resourceId = $resourceId;
        $this->x = $x;
        $this->y = $y;
    }
}
