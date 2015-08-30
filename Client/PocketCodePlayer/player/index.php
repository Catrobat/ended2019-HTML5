<?php
$project_id = 0;

if( isset( $_GET["projectId"]) ) {
  $project_id = $_GET["projectId"];
}
?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" class="pc-webBody">
<head>
  <meta charset="UTF-8" />
  <meta name="description" content="PocketCode HTML5 Player" />
  <meta name="author" content="Catrobat HTML5 team: https://github.com/Catrobat/HTML5" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-touch-fullscreen" content="yes" />
  <link rel="shortcut icon" href="images/favicon.png" type="image/png" />

  <link href="pocketCodePlayer.css" rel="stylesheet" />
  <script src="pocketCodePlayer.js"></script>
  <script type="text/javascript">
    launchProject(<?php echo $project_id; ?>);
  </script>
  <title>PocketCode HTML5 Player</title>
</head>
<body class="pc-webBody pc-webBodyMobile">
<noscript>This application needs javascript to be enabled!</noscript>
</body>
</html>
