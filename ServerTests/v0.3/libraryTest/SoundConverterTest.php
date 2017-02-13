<?php

/**
 * Created by IntelliJ IDEA.
 * User: dinokeskic
 * Date: 21.01.17
 * Time: 14:31
 */
class SoundConverterTest extends PHPUnit_Framework_TestCase
{
        public function testShouldConvert() {
            $inputPath = "libraryTest/cache/testAirplane/sounds/5952a60f91ed000cf2c46f645698c018_record.mp3";
            $outputPath = "output.mp3";
            $soundConverter = new SoundConverter($inputPath, "output.mp3");
            $this->assertTrue($soundConverter->shouldConvertFile() , true);
        }

        public function testShouldNotConvert() {
            $inputPath = "libraryTest/cache/testAirplane/sounds/5952a60f91ed000cf2c46f645698c018_record.mp3";
            $outputPath = "output.mp3";
            $soundConverter = new SoundConverter($inputPath, $outputPath);
}