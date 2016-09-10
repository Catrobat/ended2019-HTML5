<?php

class ChangeBrightnessBrickDto extends ChangeGraphicEffectBrickDto
{
    public function __construct($value, $commentedOut = false) {
        parent::__construct(EGraphicEffect::BRIGHTNESS, $value, $commentedOut);

        $this->type = "ChangeBrightness";
    }
}
