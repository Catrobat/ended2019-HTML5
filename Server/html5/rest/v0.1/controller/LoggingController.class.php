<?php
require(str_replace("/", DIRECTORY_SEPARATOR, "../../libraries/phpmailer/class.phpmailer.php"));
require(str_replace("/", DIRECTORY_SEPARATOR, "../../libraries/phpmailer/class.smtp.php"));

class LoggingController extends BaseController
{
   public function __construct($request)
   {
      parent::__construct($request);
      if (session_id() == "")
         session_start();
   }
   
   public function post()
   {
      return $this->sendMail();
   }
   
   private function sendMail()
   {
      $id        = "";
      $jsonError = "";
      $type      = "";
      $projectId = "";
      $subject   = "[PocketCodeHTML5Log]";
      $mailbody  = "";
      
      if (isset($this->request->requestParameters['id'])) {
         $id = utf8_decode($this->request->requestParameters['id']);
         if (isset($_SESSION["LoggingId"]) && $_SESSION["LoggingId"] == $id) {
            $_SESSION["LoggingId"] = "";
         } else {
            return new SuccessDto(false);
         }
      } 
      else {
         return new SuccessDto(false);
      }
      
      $jsonError = utf8_decode($this->request->requestParameters['jsonError']);
      $mailbody  = $jsonError;
      $type      = utf8_decode($this->request->requestParameters['type']);
      $projectId = utf8_decode($this->request->requestParameters['projectId']);
      $subject   = $subject . " " . $type . ": ProjectId: " . $projectId;
      $mail      = new PHPMailer(true);
      $mail->IsSMTP(); // telling the class to use SMTP
      //$mail->SMTPDebug = 4;
      $mail->SMTPAuth   = true;     // enable SMTP authentication
      $mail->SMTPSecure = "tls";    // sets the prefix to the servier
      $mail->Host       = EMAIL_SMTP;   // sets GMAIL as the SMTP server
      $mail->Port       = EMAIL_SMTP_PORT; // set the SMTP port for the GMAIL server
      $mail->Username   = EMAIL_USER;   // GMAIL username
      $mail->Password   = EMAIL_PWD;    // GMAIL password
      $mail->AddAddress(EMAIL_TO, EMAIL_NAME_TO);
      $mail->SetFrom(EMAIL_FROM, EMAIL_NAME_FROM);
      $mail->Subject = $subject;
      $mail->Body    = $mailbody;
      try {
         $mail->Send();
         return new SuccessDto(true);
      }
      catch (Exception $e) {
         //Something went bad
         return new ExceptionDto("phpmailerException", $e->getMessage(), $e->getCode(), $e->getFile(), $e->getLine());
      }
   }
   
   public function get()
   {
      if (count($this->request->serviceSubInfo) == 0) {
         return $this->sendMail();
      } else if ($this->request->serviceSubInfo[0] != "id") {
         return new ServicePathViolationException("Parameter id is not set");
      }
      $uuid                  = uniqid();
      $_SESSION["LoggingId"] = $uuid;
      return new UuidDto($uuid);
   }
}
