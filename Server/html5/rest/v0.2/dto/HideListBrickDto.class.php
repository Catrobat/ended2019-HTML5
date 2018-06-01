<?php

class HideListBrickDto extends HideVariableBrickDto
{

    public function __construct($resourceId)
    {
        parent::__construct($resourceId);

        $this->type = "HideLst";
    }
}
