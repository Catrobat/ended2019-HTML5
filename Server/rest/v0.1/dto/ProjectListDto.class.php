<?php

class ProjectListDto {

  public $offset;
  public $limit;
  public $mask;
  //public $order;
  
  public $featured = array();
  public $items = array();
  public $totalProjects;
  
  public function __construct($offset, $limit, $mask, /*$order,*/ $total) {
    $this->offset = $offset;
    $this->limit = $limit;
    $this->mask = $mask;
    //$this->order = $order;
	$this->totalProjects = $total;
  }
    
}
