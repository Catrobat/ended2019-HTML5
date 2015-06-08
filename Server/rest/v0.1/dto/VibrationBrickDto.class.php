<?php

class VibrationBrickDto extends BaseBrickDto {

    public $duration;

    public function __construct($duration) {
        parent::__construct("Vibration");

        $this->duration = $duration;
    }
}
