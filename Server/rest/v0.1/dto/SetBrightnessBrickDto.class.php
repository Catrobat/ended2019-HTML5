<?php

class SetBrightnessBrickDto extends SetGraphicEffectBrickDto {

  public function __construct($value) {
		parent::__construct(EGraphicEffect.BRIGHTNESS, $value);
		
		$this->type = "SetBrightness";
		
  }

}

?>