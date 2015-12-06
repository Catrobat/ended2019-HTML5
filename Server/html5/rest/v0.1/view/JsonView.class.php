<?php

class JsonView extends BaseView
{
   public function __construct($request)
   {
     parent::__construct($request);
   }

   public function writeResponseString($outputObject)
   {
         try {
             echo json_encode($outputObject);
         }
         catch (Exception $e) {
             echo 'Exception: ',  $e->getMessage(), "\n";
             print_r($outputObject);
         }
   }
}