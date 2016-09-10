<?php

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

  protected function parseDataBricks($brickType, $script)
  {
    switch($brickType)
    {
      case "SetVariableBrick":
        $id = null;
        if(property_exists($script, "userVariable"))
        {
            $var = $this->getObject($script->userVariable, $this->cpp);
            $id = $this->getVariableId((string)$var);
        }
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $brick = new SetVariableBrickDto($id, $this->parseFormula($fl->formula));
        array_pop($this->cpp);
        break;

      case "ChangeVariableBrick":
        $id = null;
        if(property_exists($script, "userVariable"))
        {
            $var = $this->getObject($script->userVariable, $this->cpp);
            $id = $this->getVariableId((string)$var);
        }
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $brick = new ChangeVariableBrickDto($id, $this->parseFormula($fl->formula));
        array_pop($this->cpp);
        break;

      case "AddItemToUserListBrick":
        $id = null;
        if(property_exists($script, "userList"))
        {
            $lst = $this->getList($script->userList);
            $id = $this->getListId((string)$lst);
        }
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $brick = new AppendToListBrickDto($id, $this->parseFormula($fl->formula));
        array_pop($this->cpp);
        break;

      case "DeleteItemOfUserListBrick":
        $id = null;
        if(property_exists($script, "userList"))
        {
            $lst = $this->getList($script->userList);
            $id = $this->getListId((string)$lst);
        }
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $brick = new DeleteAtListBrickDto($id, $this->parseFormula($fl->formula));
        array_pop($this->cpp);
        break;

      case "InsertItemIntoUserListBrick":
        $id = null;
        if(property_exists($script, "userList"))
        {
            $lst = $this->getList($script->userList);
            $id = $this->getListId((string)$lst);
        }
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);

        $index = null;
        $value = null;

        foreach($fl->children() as $formula)
        {
          if($formula["category"] == "INSERT_ITEM_INTO_USERLIST_INDEX")
          {
            $index = $this->parseFormula($formula);
          }
          if($formula["category"] == "INSERT_ITEM_INTO_USERLIST_VALUE")
          {
            $value = $this->parseFormula($formula);
          }
        }

        if(! $index || ! $value)
          throw new InvalidProjectFileException("InsertItemIntoUserListBrick: invalid properties");

        $brick = new InsertAtListBrickDto($id, $index, $value);
        array_pop($this->cpp);
        break;

      case "ReplaceItemInUserListBrick":
        $id = null;
        if(property_exists($script, "userList"))
        {
            $lst = $this->getList($script->userList);
            $id = $this->getListId((string)$lst);
        }
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);

        $index = null;
        $value = null;

        foreach($fl->children() as $formula)
        {
          if($formula["category"] == "REPLACE_ITEM_IN_USERLIST_INDEX")
          {
            $index = $this->parseFormula($formula);
          }
          if($formula["category"] == "REPLACE_ITEM_IN_USERLIST_VALUE")
          {
            $value = $this->parseFormula($formula);
          }
        }

        if(! $index || ! $value)
          throw new InvalidProjectFileException("InsertItemIntoUserListBrick: invalid properties");

        $brick = new ReplaceAtListBrickDto($id, $index, $value);
        array_pop($this->cpp);
        break;

      case "ShowTextBrick":
        $id = null;
        if(property_exists($script, "userVariable"))
        {
            $var = $this->getObject($script->userVariable, $this->cpp);
            $id = $this->getVariableId((string)$var);
        }
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);

        $x = null;
        $y = null;

        foreach($fl->children() as $formula)
        {
          if($formula["category"] == "X_POSITION")
          {
            $x = $this->parseFormula($formula);
          }
          if($formula["category"] == "Y_POSITION")
          {
            $y = $this->parseFormula($formula);
          }
        }

        if(! $x || ! $y)
          throw new InvalidProjectFileException("ShowTextBrick: invalid properties");

        $brick = new ShowVariableBrickDto($id, $x, $y);
        array_pop($this->cpp);
        break;

      case "HideTextBrick":
        $id = null;
        if(property_exists($script, "userVariable"))
        {
            $var = $this->getObject($script->userVariable, $this->cpp);
            $id = $this->getVariableId((string)$var);
        }
        $fl = $script->formulaList;
        $brick = new HideVariableBrickDto($id);
        break;

      default:
        return false;
    }

    return $brick;
  }

  protected function parseFormula($formula)
  {
    $type = (string)$formula->type;
    if($type === "USER_VARIABLE")
    {
      $value = $this->getVariableId((string)$formula->value);
    }
    else if($type === "USER_LIST")
    {
      $value = $this->getListId((string)$formula->value);
    }
    else
    {
      $value = (string)$this->getProperty($formula, "value");
    }

    $f = new FormulaDto($type, $value);

    if(property_exists($formula, "leftChild"))
    {
      $f->left = $this->parseFormula($formula->leftChild);
    }
    if(property_exists($formula, "rightChild"))
    {
      $f->right = $this->parseFormula($formula->rightChild);
    }

    return $f;
  }
}