<?php

class InsertAtListBrickDto extends BaseBrickDto
{
    public $resourceId;
    public $index;  //type of FormulaDto
    public $value;  //type of FormulaDto

    public function __construct($resourceId, $index, $value)
    {
        parent::__construct("InsertAtList");

        $this->resourceId = $resourceId;
        $this->index = $index;
        $this->value = $value;
    }
}
