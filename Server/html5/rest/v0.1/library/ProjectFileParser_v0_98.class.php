<?php

require_once __DIR__ . DIRECTORY_SEPARATOR . "ProjectFileParser_v0_94.class.php";

class ProjectFileParser_v0_98 extends ProjectFileParser_v0_94
{

  public function __construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml)
  {
    parent::__construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml);
  }

  protected function parseMotionBricks($brickType, $script)
  {
    switch($brickType)
    {
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

      case "VibrationBrick":    /*name changed?*/
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

      default:
        return false;
    }
    return $brick;
  }

  protected function parseLookBricks($brickType, $script)
  {
    switch($brickType)
    {
      case "SetLookBrick":
        if(!property_exists($script, "look"))
        {
            // when no look set, look => empty
            $brick = new SetLookBrickDto(null);
            break;
        }

        $look = $this->getObject($script->look, $this->cpp);
        $res = $this->findItemInArrayByUrl("images/" . (string)$look->fileName, $this->images, true);

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

      case "SetTransparencyBrick":    /*name changed*/
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $transparency = $fl->formula;
        $brick = new SetTransparencyBrickDto($this->parseFormula($transparency));
        array_pop($this->cpp);
        break;

      case "ChangeTransparencyByNBrick":    /*name changed*/
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

      case "SetColorBrick":
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $color = $fl->formula;
        $brick = new SetColorBrickDto($this->parseFormula($color));
        array_pop($this->cpp);
        break;

      case "ChangeColorByNBrick":
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $color = $fl->formula;
        $brick = new ChangeColorBrickDto($this->parseFormula($color));
        array_pop($this->cpp);
        break;

      case "ClearGraphicEffectBrick":
        $brick = new ClearGraphicEffectBrickDto();
        break;

      case "FlashBrick":    /*name changed*/
        $brick = new FlashBrickDto();   //spinnerSelectionID = 0/1 (off/on)
        $brick->selected = (string)$script->spinnerSelectionID;
        break;

      // case "LedOnBrick":    /*name changed*/
        // $brick = new LedOnBrickDto();
        // break;

      case "CameraBrick":    /*new*/
        $brick = new CameraBrickDto();   //spinnerSelectionID = 0/1 (off/on)
        $brick->selected = (string)$script->spinnerSelectionID;
        break;

      case "ChooseCameraBrickBrick":    /*new*/
        $brick = new SelectCameraBrickDto();   //spinnerSelectionID = 0/1 (back/front)
        $brick->selected = (string)$script->spinnerSelectionID;
        break;

      default:
        return false;
    }
    return $brick;
  }
}
  
