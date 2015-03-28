<?php

class SetBrightnessBrickDto extends SetGraphicEffectBrickDto {

  public function __construct($percentage) {
		parent::__construct(EGraphicEffect.BRIGHTNESS, $percentage);
		
		$this->type = "SetBrightness";
		
  }

}

?>