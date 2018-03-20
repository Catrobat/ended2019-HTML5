<?php

class StopBrickDto extends BaseBrickDto {

    public $stopType;	//EStopType: THIS_SCRIPT, OTHER_SCRIPTS, ALL_SOUNDS, ALL

    public function __construct($stopType, $commentedOut = false) {
        parent::__construct("Stop", $commentedOut);

        $this->stopType = $stopType;
    }
}
