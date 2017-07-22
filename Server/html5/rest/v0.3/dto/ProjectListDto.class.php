<?php

class ProjectListDto {

    public $offset;
    public $limit;
    public $mask;

    public $featured = array();
    public $items = array();
    public $totalProjects;

    public function __construct($offset, $limit, $mask, $total) {
        $this->offset = $offset;
        $this->limit = $limit;
        $this->mask = $mask;
        $this->totalProjects = $total;
    }
}
