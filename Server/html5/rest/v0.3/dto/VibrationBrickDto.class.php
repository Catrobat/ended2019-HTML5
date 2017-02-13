<?php

class VibrationBrickDto extends BaseBrickDto {

    public $duration;

    public function __construct($duration, $commentedOut = false) {
        parent::__construct("Vibration", $commentedOut);

        $this->duration = $duration;
    }
}
