<?php

class HideVariableBrickDto extends BaseBrickDto
{
    public $resourceId;

    public function __construct($resourceId)
    {
        parent::__construct("HideVariable");

        $this->resourceId = $resourceId;
    }
}
