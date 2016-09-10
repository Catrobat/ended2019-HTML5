<?php

class SetColorEffectBrickDto extends SetGraphicEffectBrickDto {

    public function __construct($value, $commentedOut = false) {
		parent::__construct(EGraphicEffect::COLOR, $value, $commentedOut);

		$this->type = "SetColorEffect";

    }

}
