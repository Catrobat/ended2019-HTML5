<?php

/**
 * Created by IntelliJ IDEA.
 * User: dinokeskic
 * Date: 16.10.16
 * Time: 22:51
 */
class ID3TagsReader
{
    var $aTV23 = array( // array of possible sys tags (for last version of ID3)
        'TIT2',
        'TALB',
        'TPE1',
        'TPE2',
        'TRCK',
        'TYER',
        'TLEN',
        'USLT',
        'TPOS',
        'TCON',
        'TENC',
        'TCOP',
        'TPUB',
        'TOPE',
        'WXXX',
        'COMM',
        'TCOM'
    );
    var $aTV23t = array( // array of titles for sys tags
        'Title',
        'Album',
        'Author',
        'AlbumAuthor',
        'Track',
        'Year',
        'Lenght',
        'Lyric',
        'Desc',
        'Genre',
        'Encoded',
        'Copyright',
        'Publisher',
        'OriginalArtist',
        'URL',
        'Comments',
        'Composer'
    );
    var $aTV22 = array( // array of possible sys tags (for old version of ID3)
        'TT2',
        'TAL',
        'TP1',
        'TRK',
        'TYE',
        'TLE',
        'ULT'
    );
    var $aTV22t = array( // array of titles for sys tags
        'Title',
        'Album',
        'Author',
        'Track',
        'Year',
        'Lenght',
        'Lyric'
    );

    // constructor
    function ID3TagsReader() {}

    // functions
    function getTagsInfo($sFilepath) {
        // read source file
        $iFSize = filesize($sFilepath);
        $vFD = fopen($sFilepath,'r');
        $sSrc = fread($vFD,$iFSize);
        fclose($vFD);
        $aInfo = array();

        // obtain base info
        if (substr($sSrc,0,3) == 'ID3') {
            $aInfo['FileName'] = $sFilepath;
            $aInfo['Version'] = hexdec(bin2hex(substr($sSrc,3,1))).'.'.hexdec(bin2hex(substr($sSrc,4,1)));
        }

        else {
            return false;
        }

        // passing through possible tags of idv2 (v3 and v4)
        if ($aInfo['Version'] == '4.0' || $aInfo['Version'] == '3.0') {
            for ($i = 0; $i < count($this->aTV23); $i++) {
                if (strpos($sSrc, $this->aTV23[$i].chr(0)) != FALSE) {

                    $s = '';
                    $iPos = strpos($sSrc, $this->aTV23[$i].chr(0));
                    $iLen = hexdec(bin2hex(substr($sSrc,($iPos + 5),3)));

                    $data = substr($sSrc, $iPos, 9 + $iLen);
                    for ($a = 0; $a < strlen($data); $a++) {
                        $char = substr($data, $a, 1);
                        if ($char >= ' ' && $char <= '~')
                            $s .= $char;
                    }
                    if (substr($s, 0, 4) == $this->aTV23[$i]) {
                        $iSL = 4;
                        if ($this->aTV23[$i] == 'USLT') {
                            $iSL = 7;
                        } elseif ($this->aTV23[$i] == 'TALB') {
                            $iSL = 5;
                        } elseif ($this->aTV23[$i] == 'TENC') {
                            $iSL = 6;
                        }
                        $aInfo[$this->aTV23t[$i]] = substr($s, $iSL);
                    }
                }
            }
        }

        // passing through possible tags of idv2 (v2)
        if($aInfo['Version'] == '2.0') {
            for ($i = 0; $i < count($this->aTV22); $i++) {
                if (strpos($sSrc, $this->aTV22[$i].chr(0)) != FALSE) {

                    $s = '';
                    $iPos = strpos($sSrc, $this->aTV22[$i].chr(0));
                    $iLen = hexdec(bin2hex(substr($sSrc,($iPos + 3),3)));

                    $data = substr($sSrc, $iPos, 6 + $iLen);
                    for ($a = 0; $a < strlen($data); $a++) {
                        $char = substr($data, $a, 1);
                        if ($char >= ' ' && $char <= '~')
                            $s .= $char;
                    }

                    if (substr($s, 0, 3) == $this->aTV22[$i]) {
                        $iSL = 3;
                        if ($this->aTV22[$i] == 'ULT') {
                            $iSL = 6;
                        }
                        $aInfo[$this->aTV22t[$i]] = substr($s, $iSL);
                    }
                }
            }
        }
        return $aInfo;
    }
}