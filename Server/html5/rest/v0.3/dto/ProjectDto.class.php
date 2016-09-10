<?php

class ProjectDto {

    public $id;
    public $header;

    public $scenes = array();
    public $resourceBaseUrl;

    public $images = array();
    public $sounds =  array();
    public $variables = array();
    public $lists = array();
    public $broadcasts = array();

    public function __construct($id, $resourceBaseUrl) {
        $this->id = $id;
        $this->resourceBaseUrl = $resourceBaseUrl;
    }

}
