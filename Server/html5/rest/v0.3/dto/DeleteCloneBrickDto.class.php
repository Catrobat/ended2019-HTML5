<?php

class DeleteCloneBrickDto extends BaseBrickDto {

    public function __construct($commentedOut = false) {
        parent::__construct("DeleteClone", $commentedOut);
    }
}
