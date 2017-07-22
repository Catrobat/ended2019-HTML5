<?php

class HideListBrickDto extends HideVariableBrickDto {

    public function __construct($resourceId, $commentedOut = false) {
        parent::__construct($resourceId, $commentedOut);

        $this->type = "HideLst";
    }
}
