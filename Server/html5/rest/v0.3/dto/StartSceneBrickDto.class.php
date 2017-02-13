<?php

class StartSceneBrickDto extends BaseBrickDto {

    public $sceneId;

    public function __construct($sceneId, $commentedOut = false) {
        parent::__construct("StartScene", $commentedOut);

        $this->sceneId = $sceneId;
    }
}
