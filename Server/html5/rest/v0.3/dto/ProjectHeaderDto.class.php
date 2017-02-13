<?php

class ProjectHeaderDto {

    public $languageVersion;
    public $description;

    public $title;
    public $url;
    public $author;
    public $bricksCount;
    public $device;
    public $cloud;

    public function __construct($title, $description, $languageVersion, $author, $url) {
        $this->title = $title;
        $this->description = $description;
        $this->languageVersion = $languageVersion;
        $this->author = $author;
        $this->url = $url;
        $this->cloud = new ProjectCloudDto();
    }
}
