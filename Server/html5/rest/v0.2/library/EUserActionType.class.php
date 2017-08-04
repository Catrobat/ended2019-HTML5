<?php

  abstract class EUserActionType {  //important: equivalent to clients enum
    const SPRITE_TOUCHED = 0;
    const TOUCH_START = 1;
    const TOUCH_MOVE = 2;
    const TOUCH_END = 3;
  }
