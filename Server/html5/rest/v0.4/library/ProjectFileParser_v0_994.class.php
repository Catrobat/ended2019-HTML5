<?php

class ProjectFileParser_v0_994 extends ProjectFileParser_v0_992
{

    public function __construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml)
    {
        parent::__construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml);
    }

    protected function parsePenBricks($brickType, $script)
    {
        switch($brickType)
        {
            case "PenDownBrick":
                $brick = new PenDownBrickDto();
                break;

            case "PenUpBrick":
                $brick = new PenUpBrickDto();
                break;

            case "SetPenSizeBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $brick = new SetPenSizeBrickDto($this->parseFormula($fl->formula));
                array_pop($this->cpp);
                break;

            case "SetPenColorBrick":    //changed in v.0994
                $r = null;
                $g = null;
                $b = null;

                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                foreach($fl->children() as $formula)
                {
                    $cat = (string)$formula["category"];
                    if($cat == "PEN_COLOR_RED")
                    {
                        $r = $this->parseFormula($formula);
                    }
                    else if($cat == "PEN_COLOR_GREEN")
                    {
                        $g = $this->parseFormula($formula);
                    }
                    else if($cat == "PEN_COLOR_BLUE")
                    {
                        $b = $this->parseFormula($formula);
                    }
                }

                array_pop($this->cpp);
                if(!$r || !$g|| !$b)
                    throw new InvalidProjectFileException("InsertItemIntoUserListBrick: invalid properties");
                $brick = new SetPenColorBrickDto($r, $g, $b);
                break;

            case "StampBrick":
                $brick = new StampBrickDto();
                break;

            case "ClearBackgroundBrick":
                $brick = new ClearBackgroundBrickDto();
                break;

            default:
                return false;
        }
        return $brick;
    }

}
