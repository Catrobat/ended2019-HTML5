<?php

class SetColorBrickDto extends SetGraphicEffectBrickDto {

  public function __construct($value) {
		parent::__construct(EGraphicEffect::COLOR, $value);
		
		$this->type = "SetColor";

  }

}
