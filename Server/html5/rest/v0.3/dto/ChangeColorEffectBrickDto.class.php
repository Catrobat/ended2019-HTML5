<?php

class ChangeColorEffectBrickDto extends ChangeGraphicEffectBrickDto {

    public function __construct($value, $commentedOut = false) {
		parent::__construct(EGraphicEffect::COLOR, $value, $commentedOut);

		$this->type = "ChangeColorEffect";
    }
}
