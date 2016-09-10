<?php

class HideVariableBrickDto extends BaseBrickDto
{
    public $resourceId;

    public function __construct($resourceId, $commentedOut = false) {
        parent::__construct("HideVariable", $commentedOut);

        $this->resourceId = $resourceId;
    }
}
