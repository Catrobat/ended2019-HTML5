<?php

class ChangeColorEffectBrickDto extends ChangeGraphicEffectBrickDto {

  public function __construct($value) {
		parent::__construct(EGraphicEffect::COLOR, $value);
		
		$this->type = "ChangeColorEffect";
		
  }

}
