<?php

require_once("BaseController.class.php");
require_once("ProjectsController.class.php");

/** @noinspection PhpInconsistentReturnPointsInspection */

/** @noinspection PhpUndefinedClassInspection */
class FileController extends BaseController
{
  const GOOGLE_TTS_SERVICE = "http://translate.google.com/translate_tts?";
  const MAX_LETTER_COUNT = 100;

  public $text;
  public $language;
  public $mp3;

  public function __construct($request)
  {
    parent::__construct($request); // call parent constructor to set request method
    $this->language = "en"; //default lang
    $request->responseType = "application/file"; // Override default responseType => to get FileView
  }

  public function get()
  {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Allow-Headers: X-Requested-With");

    // Variable Initialization
    $text = "";
    if(isset($_GET['text']))
    {
      $text = utf8_decode($_GET['text']);
    }
    if(isset($_GET['lang']))
    {
      $this->language = $_GET['lang'];
    }

    // Error handling if only ../file/ is given
    $len = count($this->request->serviceSubInfo);
    if($len == 0)
    {
      return new ServicePathViolationException("No Parameter is set after 'file'");
    }

    // type of file params
    switch($this->request->serviceSubInfo[0])
    {
      case "tts":
        $this->convertTTS($text);

        return $this->mp3;
        break;
      case "screenshot":
        return $this->convertImage();
        break;
      default:
        return new ServiceFileMethodNotImplementedException("File-Method not found: " . implode("/",
                                                                                                $this->request->serviceSubInfo));
        break;
    }
  }

  public function post()
  {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: X-Requested-With");

    // Variable Initialization
    $text = "";
    if(isset($_POST['text']))
    {
      $text = utf8_decode($_POST['text']);
    }
    if(isset($_POST['lang']))
    {
      $this->language = $_POST['lang'];
    }

    // Error handling if only ../file/ is given
    $len = count($this->request->serviceSubInfo);
    if($len == 0)
    {
      return new ServicePathViolationException("No Parameter is set after 'file'");
    }

    // type of file params
    switch($this->request->serviceSubInfo[0])
    {
      case "tts":
        $this->convertTTS($text);

        return $this->mp3;
        break;
      case "screenshot":
        return $this->convertImage();
        break;
      default:
        return new ServiceFileMethodNotImplementedException("File-Method not found: " . implode("/",
                                                                                                $this->request->serviceSubInfo));
        break;
    }
  }

  private function convertImage()
  {
    $base64string = "";
    if(isset($_GET['base64string']))
    {
      $base64string = $_GET['base64string'];
    }

    if(isset($_POST['base64string']))
    {
      $base64string = $_POST['base64string'];
    }

    //var_dump( $base64string );

    if(empty($base64string))
    {
      throw new Exception('missing request parameter: base64string');
    }

    //$encodedData = str_replace(' ','+',$base64string);
    //return base64_decode($encodedData);
    $base64string
      = 'data://' . substr($base64string, 5);  //php needs "data://" canvas toDataURL() provides "data:" only
    //return base64_decode($base64string);
    //var_dump( $base64string );
    //If you want to save data that is derived from a Javascript canvas.toDataURL() function, you have to convert blanks into pluses. If you do not do that, the decoded data is corrupted
    $encodedData = str_replace(' ', '+', $base64string);
    //var_dump( base64_decode($encodedData) );
    //$decodedData =
    return $encodedData;
    //return base64_decode($encodedData);

    /*		$extensions = array(
          IMAGETYPE_GIF => "gif",
          IMAGETYPE_JPEG => "jpg",
          IMAGETYPE_PNG => "png",
          IMAGETYPE_SWF => "swf",
          IMAGETYPE_PSD => "psd",
          IMAGETYPE_BMP => "bmp",
          IMAGETYPE_TIFF_II => "tiff",
          IMAGETYPE_TIFF_MM => "tiff",
          IMAGETYPE_JPC => "jpc",
          IMAGETYPE_JP2 => "jp2",
          IMAGETYPE_JPX => "jpx",
          IMAGETYPE_JB2 => "jb2",
          IMAGETYPE_SWC => "swc",
          IMAGETYPE_IFF => "iff",
          IMAGETYPE_WBMP => "wbmp",
          IMAGETYPE_XBM => "xbm",
          IMAGETYPE_ICO => "ico"
        );

        $file_info = new finfo(FILEINFO_MIME);
        $mime_type = $file_info->buffer($decodedData);
    echo $mime_type;

        $split = explode( '/', $mime_type );
        $type = $split[1];
        //$ext = '';
        //if (array_key_exists( $extensions[$mime_type] ))
        //	$ext = $extensions[$mime_type];

        $fp = fopen( 'screenshot.' . $type, 'wb' );
        fwrite( $fp, $decodedData);
        fclose( $fp );
        return $fp;
    */
  }

  private function getParsedUrl()
  {
    // get Google Speech
    $encoded = urlencode($this->text);
    $url = self::GOOGLE_TTS_SERVICE . "tl={$this->language}&q={$encoded}";

    return $url;
  }

  public function convertTTS($txt)
  {
    $this->text = $this->tokenTruncate(trim($txt), self::MAX_LETTER_COUNT);
    if(empty($this->text))
    {
      return "";
    }
    $this->mp3 = file_get_contents($this->getParsedUrl());

    return null;
  }

  // Cut words, that text is under 100 letter
  public function tokenTruncate($string, $your_desired_width)
  {
    $parts = preg_split('/([\s\n\r]+)/', $string, null, PREG_SPLIT_DELIM_CAPTURE);
    $parts_count = count($parts);

    $length = 0;
    $last_part = 0;
    for(; $last_part < $parts_count; ++$last_part)
    {
      $length += strlen($parts[$last_part]);
      if($length > $your_desired_width)
      {
        break;
      }
    }

    return implode(array_slice($parts, 0, $last_part));
  }
}
