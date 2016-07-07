<?php

require_once("BaseController.class.php");

class I18nController extends BaseController
{
    private $api = "https://api.crowdin.com/api/project/catrobat/download/";
    private $apiKey = CROWDIN_API_KEY;

    public function __construct($request)
    {
        parent::__construct($request);
    }

    public function get()
    {
        $len = count($this->request->serviceSubInfo);
        $langCode = null;

        if($len == 0) {   // fallback: get language from request
            $requestLangs = explode(",", $_SERVER["HTTP_ACCEPT_LANGUAGE"]);
            $requestLang = substr($requestLangs[0], 0, 5);
            $langCode = $requestLang;
        }
        else if($len == 1)
            $langCode = $this->request->serviceSubInfo[0];
        else {
            $servicePathViolation = ": " . implode("/", $this->request->serviceSubInfo);
            return new ServicePathViolationException($this->request->serviceName . $servicePathViolation);
        }

        //handle sub paths (supported, update)
        if($langCode == "supported")  //return a list of supported languages
        {
            $file = getcwd() . str_replace("/", DIRECTORY_SEPARATOR, "/i18nResources/supported.json");
            if(! file_exists($file))
            {
                return new ServiceNotImplementedException($this->request->serviceName . ": no supported languages found");
            }

            $string = file_get_contents($file);
            //delete comments from file
            $string = preg_replace("#(/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/)|([\s\t]//.*)|(^//.*)#", '', $string);
            $data = json_decode($string);

            //delete invisible from list
            for ($i = 0; $i < count($data->languages); $i++) {
                if(!$data->languages[$i]->visible) {
                    array_splice($data->languages, $i, 1);
                    $i--;
                }
                unset($data->languages[$i]->visible);   //do net transfer the visisble property as it will always be true
                unset($data->languages[$i]->crowdinRequestCode);
                unset($data->languages[$i]->crowdinZipCode);    //files in the zip archive may have other names than the zip itsenf, e.g. de.zip and de-DE.json
            }
            return new I18nSupportedLanguagesDto($data->languages);
        }
        else if($langCode == "update")    //update dictionaries from crowdin
        {
            if(!$this->updateTranslations())
            {
                return new I18nDictionaryDto($langCode, "", "error updating languages...");
            }
            return new I18nDictionaryDto($langCode, "", "all languages successfully updated");
        }

        else
            return $this->loadLanguageFile($langCode);
    }

    private function updateTranslations()
    {
        $file = getcwd() . str_replace("/", DIRECTORY_SEPARATOR, "/i18nResources/supported.json");
        if(! file_exists($file))
            return false;

        $string = file_get_contents($file);
        //delete comments from file
        $string = preg_replace("#(/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/)|([\s\t]//.*)|(^//.*)#", '', $string);
        $data = json_decode($string);

        //get files from crowdin
        $crowdinLangCodes = array();
        foreach($data->languages as $language) {
            $code = $language->crowdinRequestCode;
            if (!in_array($code, $crowdinLangCodes))
                array_push($crowdinLangCodes, $code);
        }

        $zipDir = getcwd() . str_replace("/", DIRECTORY_SEPARATOR, "/i18nResources/zips/");
        if (!file_exists($zipDir)) {
            mkdir($zipDir, 0777, true);
        }
        foreach($crowdinLangCodes as $langCode) {
            $url = $this->api . $langCode. ".zip" . $this->apiKey;
            $zip = file_get_contents($url);
            $file = $zipDir . $langCode. ".zip";
            file_put_contents($file, $zip);

            $zip = new ZipArchive;
            if ($zip->open($file) === true)
            {
                $zip->extractTo($zipDir);
                $zip->close();
            }
            else
                return false;

            unlink($file);  //delete zip file
        }

        foreach ($data->languages as $language) {
            $code = $language->languageCode;
            $crowdinZipCode = $language->crowdinZipCode;


            $cFile = $zipDir. str_replace("/", DIRECTORY_SEPARATOR, "html5/player/$crowdinZipCode.json");
            $file = getcwd() . str_replace("/", DIRECTORY_SEPARATOR, "/i18nResources/$code.json");
            if (!copy($cFile, $file))
                return false;
        }
        FileHelper::deleteDirectory($zipDir);

        return true;
    }

    private function loadLanguageFile($langCode)
    {
        $file = getcwd() . str_replace("/", DIRECTORY_SEPARATOR, "/i18nResources/supported.json");
        if(! file_exists($file))
        {
            return new ServiceNotImplementedException($this->request->serviceName . ": no supported languages found");
        }

        $string = file_get_contents($file);
        //delete comments from file
        $string = preg_replace("#(/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/)|([\s\t]//.*)|(^//.*)#", '', $string);
        $data = json_decode($string);

        //search for language
        $language = null;
        for ($i = 0; $i < count($data->languages); $i++) {
            if($data->languages[$i]->languageCode == $langCode) {
                $language = $data->languages[$i];
                break;
            }
        }
        if (!isset($language)) {
            $langCode = "en";   //fallback
            for ($i = 0; $i < count($data->languages); $i++) {
                if($data->languages[$i]->languageCode == $langCode) {
                    $language = $data->languages[$i];
                    break;
                }
            }
            if (!isset($language))  //even "en" not found: obviously crowdin-server issue
                return new ServiceNotImplementedException($this->request->serviceName . ": language resource file not found");
        }

        $file = getcwd() . str_replace("/", DIRECTORY_SEPARATOR, "/i18nResources/" . $langCode . ".json");
        if(! file_exists($file))
        {
            return new ServiceNotImplementedException($this->request->serviceName . ": language resource file not found");
        }

        $string = file_get_contents($file);
        $dict = json_decode($string);

        return new I18nDictionaryDto($langCode, $language->direction, $dict);
    }

}
