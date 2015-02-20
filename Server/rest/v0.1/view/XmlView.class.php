<?php

  class XmlView extends BaseView {
  
    public function __construct($request) {
      parent::__construct($request);
    }
  
    public function writeResponseString($outputObject) {
	  
	  var_dump($outputObject);

      //UNTESTED CODE: DO NOT USE IT
/*      $xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
      $xml .= '<program>';
      $xml .= $this->xml_encode($outputObject);
      $xml .= '</program>';
      
      echo $xml;
	}
    
    private function xml_encode($object, $tagName) {
        
      if (is_array($object) || is_object($object)) {
        foreach ($object as $key=>$value) {
          if (is_numeric($key)) {
            $key = $tagName;
          }

          $xml .= '<' . $key . '>' . $this->xml_encode($value, $tagName) . '</' . $key . '>';
        }
      } 
      else {
        $xml = htmlspecialchars($array, ENT_QUOTES);
      }
      
      return $xml;
*/
    }
    
  }

?>