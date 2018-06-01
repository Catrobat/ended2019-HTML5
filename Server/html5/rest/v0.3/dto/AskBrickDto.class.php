<?php

class AskBrickDto extends BaseBrickDto {

    public $question;
    public $resourceId;

    public function __construct($question, $resourceId, $commentedOut = false) {
        parent::__construct("Ask", $commentedOut);

        $this->question = $question;
        $this->resourceId = $resourceId;
    }
}
