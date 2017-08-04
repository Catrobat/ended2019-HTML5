<?php

class SetRotationSpeedCcwBrickDto extends SetRotationSpeedBrickDto {

    public function __construct($degreesPerSec, $commentedOut = false) {
        parent::__construct($degreesPerSec, $commentedOut);

		$this->type = "SetRotationSpeedCcw";
		//$this->ccw = true;
    }
}
