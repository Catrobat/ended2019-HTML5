<?php

class FormulaDto {

  public $type;		//NUMBER, OPERATOR, SENSOR, BRACKET, USER_VARIABLE, FUNCTION, ...
  public $value;	//dependency on type, e.g. (type, value) = OPERATOR -> EQUAL
  //public $stringOperator;	//insert: <, <=, ==, >, >=, &&, ||		//???
  
  public $left;		//type of FormulaDto
  public $right;	//type of FormulaDto
  
  
  public function __construct($type, $value) {
	$this->type = $type;
	$this->value = $value;
  }
  
}
