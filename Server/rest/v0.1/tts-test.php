<?php

require_once("controller/TtsController.class.php");

$tts = new TtsController();
$text = "hello my friend";
$file = $tts->convertTTS($text);
?>

<!DOCTYPE html>
<html>
<body>
<audio controls>
  <source src="<?php echo $file ?>" type="audio/mpeg">
  Your browser does not support the audio element.
</audio>

</body>
</html>