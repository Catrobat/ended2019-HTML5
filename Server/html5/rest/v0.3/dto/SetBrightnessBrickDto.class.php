<?php

class SetBrightnessBrickDto extends SetGraphicEffectBrickDto {

    public function __construct($value, $commentedOut = false) {
        parent::__construct(EGraphicEffect::BRIGHTNESS, $value, $commentedOut);

        $this->type = "SetBrightness";
    }
}
