<?php

class ShowVariableBrickDto extends BaseBrickDto
{
    public $resourceId;
    public $x;	//FormulaDto
    public $y;	//FormulaDto

    public function __construct($resourceId, $x, $y)
    {
        parent::__construct("ShowVariable");

        $this->resourceId = $resourceId;
        $this->x = $x;
        $this->y = $y;
    }
}
