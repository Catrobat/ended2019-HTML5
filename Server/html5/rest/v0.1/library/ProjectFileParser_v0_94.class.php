<?php

require_once __DIR__ . DIRECTORY_SEPARATOR . "ProjectFileParser_v0_93.class.php";

class ProjectFileParser_v0_94 extends ProjectFileParser_v0_93
{

  public function __construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml)
  {
    parent::__construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml);
  }

  protected function includeGlobalData()
  {
    $data = $this->simpleXml->data;
    array_push($this->cpp, $data);

    // parse global lists
    array_push($this->cpp, $data->programListOfLists);
    foreach($data->programListOfLists->children() as $userList)
    {
      $userList = $this->getList($userList);
      array_push($this->lists, new ListDto($this->getNewId(), (string)$userList));
    }
    array_pop($this->cpp);

    // parse global vars
    array_push($this->cpp, $data->programVariableList);
    foreach($data->programVariableList->children() as $userVar)
    {
      $userVar = $this->getObject($userVar, $this->cpp);
      array_push($this->variables, new VariableDto($this->getNewId(), (string)$userVar));
    }
    array_pop($this->cpp);

    array_pop($this->cpp);
  }

  // parses list from userList-ref
  protected function getList($userList)
  {
    if(isset($userList->name))
    {
      //list init
      return (string)$userList->name[0];
    }
    else
    {
      //list ref
      $lst = $this->getObject($userList, $this->cpp);
      return (string)$lst->name[0];
    }
  }

  //search global and local lists by name and add local list if not found
  protected function getListId($name)
  {
    //handle unset list = "New..:" = null
    if(!isset($name) || (string)$name === "")
    {
      return null;
    }

    // global search
    $res = $this->findItemInArrayByName($name, $this->lists);
    if($res === false)
    {
      //dto to insert
      $obj = $this->currentSprite;
      //local search
      $res = $this->findItemInArrayByName($name, $obj->lists);
      if($res === false)
      {
        //not defined yet
        $id = $this->getNewId();
        array_push($obj->lists, new ListDto($id, $name));

        return $id;
      }
    }

    return $res->id;
  }

  protected function parseScript($script)
  {
    try
    {
      array_push($this->cpp, $script);

      switch($this->getBrickName($script))
      {
        /*1st level bricks*/
        case "StartScript":
          $brick = new ProgramStartBrickDto();
          $brickList = $script->brickList;
          array_push($this->cpp, $brickList);

          $this->bricksCount += count($brickList->children()) + 1;
          $brick->bricks = $this->parseInnerBricks($brickList->children());

          array_pop($this->cpp);
          break;

        case "BroadcastScript":
          $msg = (string)$script->receivedMessage;
          $res = $this->findItemInArrayByName($msg, $this->broadcasts);
          if($res === false)
          {
            $id = $this->getNewId();
            array_push($this->broadcasts, new VariableDto($id, $msg));
          }
          else
          {
            $id = $res->id;
          }

          $brick = new BroadcastReceiveBrickDto($id);

          $brickList = $script->brickList;
          array_push($this->cpp, $brickList);

          $this->bricksCount += count($brickList->children()) + 1;
          $brick->bricks = $this->parseInnerBricks($brickList->children());

          array_pop($this->cpp);
          break;

        case "WhenScript":
          $brick = new WhenActionBrickDto((string)$script->action);
          $brickList = $script->brickList;
          array_push($this->cpp, $brickList);

          $this->bricksCount += count($brickList->children()) + 1;
          $brick->bricks = $this->parseInnerBricks($brickList->children());

          array_pop($this->cpp);
          break;


        /*other control bricks*/
        case "WaitBrick":
          $duration = $script->formulaList;
          array_push($this->cpp, $duration);
          $brick = new WaitBrickDto($this->parseFormula($duration->formula));
          array_pop($this->cpp);
          break;

        case "BroadcastBrick":
          $msg = (string)$script->broadcastMessage;
          $res = $this->findItemInArrayByName($msg, $this->broadcasts);
          if($res === false)
          {
            $id = $this->getNewId();
            array_push($this->broadcasts, new VariableDto($id, $msg));
          }
          else
          {
            $id = $res->id;
          }

          $brick = new BroadcastBrickDto($id);
          break;

        case "BroadcastWaitBrick":
          $msg = (string)$script->broadcastMessage;
          $res = $this->findItemInArrayByName($msg, $this->broadcasts);
          if($res === false)
          {
            $id = $this->getNewId();
            array_push($this->broadcasts, new VariableDto($id, $msg));
          }
          else
          {
            $id = $res->id;
          }

          $brick = new BroadcastAndWaitBrickDto($id);
          break;

        case "NoteBrick":
          $brick = new NoteBrickDto((string)$script->note);
          break;

        /*motion bricks*/
        case "PlaceAtBrick":
          $x = null;
          $y = null;
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          foreach($fl->children() as $formula)
          {
            $cat = (string)$formula["category"];
            if($cat === "X_POSITION")
            {
              $x = $this->parseFormula($formula);
            }
            else
            {
              if($cat === "Y_POSITION")
              {
                $y = $this->parseFormula($formula);
              }
            }
          }
          array_pop($this->cpp);
          $brick = new PlaceAtBrickDto($x, $y);
          break;

        case "SetXBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $x = $this->parseFormula($fl->formula);
          array_pop($this->cpp);
          $brick = new SetXBrickDto($x);
          break;

        case "SetYBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $y = $this->parseFormula($fl->formula);
          array_pop($this->cpp);
          $brick = new SetYBrickDto($y);
          break;

        case "ChangeXByNBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $x = $this->parseFormula($fl->formula);
          array_pop($this->cpp);
          $brick = new ChangeXBrickDto($x);
          break;

        case "ChangeYByNBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $y = $this->parseFormula($fl->formula);
          array_pop($this->cpp);
          $brick = new ChangeYBrickDto($y);
          break;

        case "IfOnEdgeBounceBrick":
          $brick = new IfOnEdgeBounceBrickDto();
          break;

        case "MoveNStepsBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $steps = $this->parseFormula($fl->formula);
          array_pop($this->cpp);
          $brick = new MoveNStepsBrickDto($steps);
          break;

        case "TurnLeftBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $degrees = $this->parseFormula($fl->formula);
          array_pop($this->cpp);
          $brick = new TurnLeftBrickDto($degrees);
          break;

        case "TurnRightBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $degrees = $this->parseFormula($fl->formula);
          array_pop($this->cpp);
          $brick = new TurnRightBrickDto($degrees);
          break;

        case "PointInDirectionBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $degrees = $this->parseFormula($fl->formula);
          array_pop($this->cpp);
          $brick = new PointInDirectionBrickDto($degrees);
          break;

        case "Vibration":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $duration = $this->parseFormula($fl->formula);
          array_pop($this->cpp);
          $brick = new VibrationBrickDto($duration);
          break;

        case "PointToBrick":
          if(property_exists($script, "pointedObject"))
          {
            //type of Sprite = <object />
            $pointedTo = $this->getObject($script->pointedObject, $this->cpp);
            $name = $this->getName($pointedTo);

            //detect id by object name (unique): all sprites are already pre-parsed with id and name
            foreach($this->sprites as $s)
            {
              if($s->name === $name)
              {
                $spriteId = $s->id;
                break;
              }
            }
          }
          else
          {
            $spriteId = null;
          }

          /** @noinspection PhpUndefinedVariableInspection */
          $brick = new PointToBrickDto($spriteId);
          break;

        case "GlideToBrick":
          $duration = null;
          $xDestination = null;
          $yDestination = null;

          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          foreach($fl->children() as $formula)
          {
            $cat = (string)$formula["category"];
            if($cat === "X_DESTINATION")
            {
              $xDestination = $this->parseFormula($formula);
            }
            else
            {
              if($cat === "Y_DESTINATION")
              {
                $yDestination = $this->parseFormula($formula);
              }
              else
              {
                if($cat === "DURATION_IN_SECONDS")
                {
                  $duration = $this->parseFormula($formula);
                }
              }
            }
          }

          array_pop($this->cpp);
          $brick = new GlideToBrickDto($xDestination, $yDestination, $duration);
          break;

        case "GoNStepsBackBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $layers = $this->parseFormula($fl->formula);

          array_pop($this->cpp);
          $brick = new GoBackBrickDto($layers);
          break;

        case "ComeToFrontBrick":
          $brick = new ComeToFrontBrickDto();
          break;


        /*sound bricks*/
        case "PlaySoundBrick":
          $id = null;
          if(property_exists($script, "sound"))
          {
            //play sound brick is initial set to "New.." and has no child tags per default
            $sound = $this->getObject($script->sound, $this->cpp);

            $res = $this->findItemInArrayByUrl("sounds/" . (string)$sound->fileName, $this->sounds);
            if($res === false)	//will only return false on invalid projects, as resources are registered already
              throw new InvalidProjectFileException("sound file '" . (string)$sound->fileName . "' does not exist");
            $id = $res->id;
          }
          $brick = new PlaySoundBrickDto($id);
          break;

        case "StopAllSoundsBrick":
          $brick = new StopAllSoundsBrickDto();
          break;

        case "SetVolumeToBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $volume = $fl->formula;
          $brick = new SetVolumeBrickDto($this->parseFormula($volume));
          array_pop($this->cpp);
          break;

        case "ChangeVolumeByNBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $volume = $fl->formula;
          $brick = new ChangeVolumeBrickDto($this->parseFormula($volume));
          array_pop($this->cpp);
          break;

        case "SpeakBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $brick = new SpeakBrickDto($this->parseFormula($fl->formula));
          array_pop($this->cpp);
          break;


        /*look bricks*/
        case "SetLookBrick":
          $look = $this->getObject($script->look, $this->cpp);
          $res = $this->findItemInArrayByUrl("images/" . (string)$look->fileName, $this->images);
          if($res === false)	//will only return false on invalid projects, as resources are registered already
            throw new InvalidProjectFileException("image file '" . (string)$look->fileName . "' does not exist");

          //the image has already been included in the resources
          $id = $res->id;
          $brick = new SetLookBrickDto($id);
          break;

        case "NextLookBrick":
          $brick = new NextLookBrickDto();
          break;

        case "SetSizeToBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $size = $fl->formula;
          $brick = new SetSizeBrickDto($this->parseFormula($size));
          array_pop($this->cpp);
          break;

        case "ChangeSizeByNBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $size = $fl->formula;
          $brick = new ChangeSizeBrickDto($this->parseFormula($size));
          array_pop($this->cpp);
          break;

        case "HideBrick":
          $brick = new HideBrickDto();
          break;

        case "ShowBrick":
          $brick = new ShowBrickDto();
          break;

        case "SetGhostEffectBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $transparency = $fl->formula;
          $brick = new SetTransparencyBrickDto($this->parseFormula($transparency));
          array_pop($this->cpp);
          break;

        case "ChangeGhostEffectByNBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $transparency = $fl->formula;
          $brick = new ChangeTransparencyBrickDto($this->parseFormula($transparency));
          array_pop($this->cpp);
          break;

        case "SetBrightnessBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $brightness = $fl->formula;
          $brick = new SetBrightnessBrickDto($this->parseFormula($brightness));
          array_pop($this->cpp);
          break;

        case "ChangeBrightnessByNBrick":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $brightness = $fl->formula;
          $brick = new ChangeBrightnessBrickDto($this->parseFormula($brightness));
          array_pop($this->cpp);
          break;

        case "ClearGraphicEffectBrick":
          $brick = new ClearGraphicEffectBrickDto();
          break;

        case "LedOffBrick":
          $brick = new LedOffBrickDto();
          break;

        case "LedOnBrick":
          $brick = new LedOnBrickDto();
          break;

        /*data bricks*/
        case "SetVariableBrick":
          $var = $this->getObject($script->userVariable, $this->cpp);
          $id = $this->getVariableId((string)$var);

          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $brick = new SetVariableBrickDto($id, $this->parseFormula($fl->formula));
          array_pop($this->cpp);
          break;

        case "ChangeVariableBrick":
          $var = $this->getObject($script->userVariable, $this->cpp);
          $id = $this->getVariableId((string)$var);

          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $brick = new ChangeVariableBrickDto($id, $this->parseFormula($fl->formula));
          array_pop($this->cpp);
          break;

        case "AddItemToUserListBrick":
          $lst = $this->getList($script->userList);
          $id = $this->getListId((string)$lst);

          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $brick = new AppendToListBrickDto($id, $this->parseFormula($fl->formula));
          array_pop($this->cpp);
          break;

        case "DeleteItemOfUserListBrick":
          $lst = $this->getList($script->userList);
          $id = $this->getListId((string)$lst);

          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $brick = new DeleteAtListBrickDto($id, $this->parseFormula($fl->formula));
          array_pop($this->cpp);
          break;

        case "InsertItemIntoUserListBrick":
          $lst = $this->getList($script->userList);
          $id = $this->getListId((string)$lst);

          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $brick = new InsertAtListBrickDto($id, $this->parseFormula($fl->formula[0]), $this->parseFormula($fl->formula[1]));
          array_pop($this->cpp);
          break;

        case "ReplaceItemInUserListBrick":
          $lst = $this->getList($script->userList);
          $id = $this->getListId((string)$lst);

          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $brick = new ReplaceAtListBrickDto($id, $this->parseFormula($fl->formula[1]),
                                                     $this->parseFormula($fl->formula[0]));
          array_pop($this->cpp);
          break;

        case "ShowTextBrick":
          $var = $this->getObject($script->userVariable, $this->cpp);
          $id = $this->getVariableId((string)$var);

          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $brick = new ShowTextBrickDto($id, $this->parseFormula($fl->formula[1]),
            $this->parseFormula($fl->formula[0]));
          array_pop($this->cpp);
          break;

        case "HideTextBrick":
          $var = $this->getObject($script->userVariable, $this->cpp);
          $id = $this->getVariableId((string)$var);

          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $brick = new HideTextBrickDto($id);
          array_pop($this->cpp);
          break;

        //default: return xml to verify which brick implementation is missing without generating a parser error
        default:
          $brick = new UnsupportedBrickDto($script->asXML(), (string)$script["type"]);
      }

      array_pop($this->cpp);

      return $brick;

    }
    catch(FileParserException $e)
    {
      throw $e;
    }
    catch(InvalidProjectFileException $e)
    {
      throw $e;
    }
    catch(Exception $e)
    {
      throw new FileParserException($e . ", xml: " . $script->asXML());
    }
  }
}
