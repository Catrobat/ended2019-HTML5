<?php

class ChangeBrightnessBrickDto extends ChangeGraphicEffectBrickDto {

  public function __construct($value) {
		parent::__construct(EGraphicEffect::BRIGHTNESS, $value);
		
		$this->type = "ChangeBrightness";

  }

}

?>