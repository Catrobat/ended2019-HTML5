<?php

class SetColorEffectBrickDto extends SetGraphicEffectBrickDto {

  public function __construct($value) {
		parent::__construct(EGraphicEffect::COLOR, $value);
		
		$this->type = "SetColorEffect";

  }

}
