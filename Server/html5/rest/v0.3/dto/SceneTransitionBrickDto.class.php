<?php

class SceneTransitionBrickDto extends BaseBrickDto {

    public $sceneId;

    public function __construct($sceneId, $commentedOut = false) {
        parent::__construct("SceneTransition", $commentedOut);

        $this->sceneId = $sceneId;
    }
}
