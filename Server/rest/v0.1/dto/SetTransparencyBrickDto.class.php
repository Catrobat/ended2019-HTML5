<<<<<<< HEAD
<?php
//SetGhostEffect

class SetTransparencyBrickDto extends SetGraphicEffectBrickDto {

  public function __construct($percentage) {
		parent::__construct(EGraphicEffect.GHOST, $percentage);
		
		$this->type = "SetTransparency";

  }

}

=======
<?php
//SetGhostEffect

class SetTransparencyBrickDto extends SetGraphicEffectBrickDto {

  public function __construct($value) {
		parent::__construct(EGraphicEffect::GHOST, $value);
		
		$this->type = "SetTransparency";

  }

}

>>>>>>> 18967ba9f0cd729500ca8b280af758be3d774944
?>