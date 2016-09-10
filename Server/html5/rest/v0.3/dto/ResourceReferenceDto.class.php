<?php

class ResourceReferenceDto {

    public $resourceId;
    public $name;

    public function __construct($resourceId, $name) {
        $this->resourceId = $resourceId;
        $this->name = $name;
    }
}
