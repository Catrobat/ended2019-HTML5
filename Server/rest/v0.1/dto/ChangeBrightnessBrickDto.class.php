<<<<<<< HEAD
<?php

class ChangeBrightnessBrickDto extends ChangeGraphicEffectBrickDto {

  public function __construct($value) {
		parent::__construct(EGraphicEffect.BRIGHTNESS, $value);
		
		$this->type = "ChangeBrightness";

  }

}

=======
<?php

class ChangeBrightnessBrickDto extends ChangeGraphicEffectBrickDto {

  public function __construct($value) {
		parent::__construct(EGraphicEffect::BRIGHTNESS, $value);
		
		$this->type = "ChangeBrightness";

  }

}

>>>>>>> 18967ba9f0cd729500ca8b280af758be3d774944
?>