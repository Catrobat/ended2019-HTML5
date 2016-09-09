<?php

class DeleteAtListBrickDto extends BaseBrickDto
{
    public $resourceId;
    public $index;  //type of FormulaDto

    public function __construct($resourceId, $index)
    {
        parent::__construct("DeleteAtList");

        $this->resourceId = $resourceId;
        $this->index = $index;
    }
}
