<?php

class UuidDto extends SessionIdDto {

    public $uuid;

    public function __construct($sid, $uuid) {
        parent::__construct($sid);

        $this->uuid = $uuid;
    }

}
