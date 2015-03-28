<<<<<<< HEAD
<?php

class SetBrightnessBrickDto extends SetGraphicEffectBrickDto {

  public function __construct($percentage) {
		parent::__construct(EGraphicEffect.BRIGHTNESS, $percentage);
		
		$this->type = "SetBrightness";
		
  }

}

=======
<?php

class SetBrightnessBrickDto extends SetGraphicEffectBrickDto {

  public function __construct($value) {
		parent::__construct(EGraphicEffect::BRIGHTNESS, $value);
		
		$this->type = "SetBrightness";
		
  }

}

>>>>>>> 18967ba9f0cd729500ca8b280af758be3d774944
?>