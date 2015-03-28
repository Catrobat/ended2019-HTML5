<<<<<<< HEAD
<?php
//ChangeGhostEffect

class ChangeTransparencyBrickDto extends ChangeGraphicEffectBrickDto {

  public function __construct($value) {
		parent::__construct(EGraphicEffect.GHOST, $value);
		
		$this->type = "ChangeTransparency";
		
  }

}

=======
<?php
//ChangeGhostEffect

class ChangeTransparencyBrickDto extends ChangeGraphicEffectBrickDto {

  public function __construct($value) {
		parent::__construct(EGraphicEffect::GHOST, $value);
		
		$this->type = "ChangeTransparency";
		
  }

}

>>>>>>> 18967ba9f0cd729500ca8b280af758be3d774944
?>