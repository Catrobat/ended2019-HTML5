<?php

class HideBrickDto extends BaseBrickDto {

    public function __construct($commentedOut = false) {
        parent::__construct("Hide", $commentedOut);
    }
}
