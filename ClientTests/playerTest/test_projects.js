/**
 * Created by Michael Pittner on 27.02.2016.
 */



'use strict';

QUnit.module("projectTester.js");


QUnit.test("*", function(assert)
{

  /* ************************************************************************* */
  /* ******************************* CONFIG ********************************** */
  /* ************************************************************************* */

  /*                          1. Limit of tests                                */
  /* if 0, fetch all */
  var limit = 0,
    offset = 0; //TODO: retest this
  //

  /*              2. just test JSON or also test uf object works               */
  /* if true, gameEngine will test project */
  var JsonToGameEngine = false;   //true;//
  //

  /*          3. timeout when project will be canceled in game Engine          */
  // timeout in ms to cancel current projecttest
  var timeout_time = 20000;
  //

  /* 4. Only test listed programs in server_known_errors or client_known_errors (and don't skip them) */
  /* Works only, if JsonToGameEngine = false! */
  var test_only_listed_programs = "server";   //"server", "client", false;

  /*                          known server errors                              */
  /* will be skipped if test_only_listed_programs = false */
  var server_known_errors = {
    3416 : "ForeverBrick: missing LoopEndlessBrick",
    3853 : "ForeverBrick: missing LoopEndlessBrick",
    3923 : "ForeverBrick: missing LoopEndlessBrick",
    3926 : "ForeverBrick: missing LoopEndlessBrick",
    4612 : "ForeverBrick: missing LoopEndlessBrick",
    5020 : "ForeverBrick: missing LoopEndlessBrick",
    6215 : "ForeverBrick: missing LoopEndlessBrick",
    6218 : "ForeverBrick: missing LoopEndlessBrick",
    6337 : "ForeverBrick: missing LoopEndlessBrick",
    6788 : "ForeverBrick: missing LoopEndlessBrick",
    6846 : "ForeverBrick: missing LoopEndlessBrick",

    2578 : "IfLogicBeginBrick: missing IfLogicEndBrick",
    3163 : "IfLogicBeginBrick: missing IfLogicEndBrick",
    3230 : "IfLogicBeginBrick: missing IfLogicEndBrick",
    3908 : "IfLogicBeginBrick: missing IfLogicEndBrick",
    4379 : "IfLogicBeginBrick: missing IfLogicEndBrick",
    4419 : "IfLogicBeginBrick: missing IfLogicEndBrick",
    4691 : "IfLogicBeginBrick: missing IfLogicEndBrick",
    5183 : "IfLogicBeginBrick: missing IfLogicEndBrick",
    5184 : "IfLogicBeginBrick: missing IfLogicEndBrick",
    5189 : "IfLogicBeginBrick: missing IfLogicEndBrick",
    5286 : "IfLogicBeginBrick: missing IfLogicEndBrick",
    5448 : "IfLogicBeginBrick: missing IfLogicEndBrick",
    5518 : "IfLogicBeginBrick: missing IfLogicEndBrick",
    6515 : "IfLogicBeginBrick: missing IfLogicEndBrick",

    4824 : "RepeatBrick: missing LoopEndBrick",
    6236 : "RepeatBrick: missing LoopEndBrick",
    6241 : "RepeatBrick: missing LoopEndBrick",
    6966 : "RepeatBrick: missing LoopEndBrick",

    864 : "image file 'd57ad7a32797568b4b8d3f8a928e204c_look.png' does not exist",
    874 : "image file 'c5919a3ece9b684acec2d49759ff8e77_Strichmännchen.png' does not exist",
    875 : "image file '1c7de6675b2bea547f6856f94d758ca7_Böser Smily.png' does not exist",
    902 : "image file 'a16b5a29cf52bb1c1ea2590e40b245dd_mülleimer.png' does not exist",
    903 : "image file 'd800ba309931eb23dc5193ce785d3833_PascalFrühwirthcompanylogo Kopie.png' does not exist",
    976 : "image file '2358897cb677a3b445554c41f955371e_Happy.jpg' does not exist",
    1608 : "image file '495a1ab2399cef82bac6c87115689a06_Background.png' does not exist",
    1609 : "image file '36c578bf175da7fff3fdd3d6bd201e9b_cartoon-landschaft_17-1106170012.jpg' does not exist",
    1737 : "image file '1f186d7ab2dd84cb48dc377841daad6f_Background.png' does not exist",
    1750 : "image file '2a3120dd06aa3932bdfad7202713ad0f_automatic_screenshot.png' does not exist",
    1752 : "image file 'd8fb3e7ab2e5c5d42c8e4b270366eb6b_Background.png' does not exist",
    1753 : "image file 'd8fb3e7ab2e5c5d42c8e4b270366eb6b_Background.png' does not exist",
    1755 : "image file 'd8fb3e7ab2e5c5d42c8e4b270366eb6b_Background.png' does not exist",
    1758 : "image file 'd8fb3e7ab2e5c5d42c8e4b270366eb6b_Background.png' does not exist",
    1813 : "image file '725a4efa635206d270a9780ba9f2b371_Background.png' does not exist",
    1867 : "image file '8ef36a643ba853662309c57e3b647634_Background.png' does not exist",
    1875 : "image file '5a567fcec0566a370ee8d6815308218a_Background.png' does not exist",
    1877 : "image file 'b9399cef691313dfdcc012b8a2abb128_Background.png' does not exist",
    1881 : "image file 'b15417480597557cb42a7abf09476268_Background.png' does not exist",
    1885 : "image file '9b2b5adf78f0e5efce9a2a53a333e4b1_Background.png' does not exist",
    1890 : "image file '7BBC2E9502BB61FC1C9CE9DC0B2A8FAF_human starts.png' does not exist",
    1905 : "image file 'b13276409f1ee876a4381bcf8401487c_look.png' does not exist",
    1933 : "image file '59159c5861a26e1ad1eb6c907766acba_cutout-1409585740.png' does not exist",
    1961 : "image file 'b3db13df1e35acfd6ad2c89429a8c78a_Background.png' does not exist",
    1970 : "image file 'b3db13df1e35acfd6ad2c89429a8c78a_Background.png' does not exist",
    1975 : "image file '827829F8866ACCF1050373EC6DFBAD98_Space_Background_bigger.gif' does not exist",
    1987 : "image file 'c9de75f498b6c7bf36166935aa670422_look.png' does not exist",
    2004 : "image file 'ac682ffc6d31c66d8ba016b78bf1befe_793653166247315443_303720576.jpg' does not exist",
    2026 : "image file '7BBC2E9502BB61FC1C9CE9DC0B2A8FAF_human starts.png' does not exist",
    2075 : "image file 'a1652c7d94a844216cd731d29f1daadb_Background.png' does not exist",
    2076 : "image file 'a1652c7d94a844216cd731d29f1daadb_Background.png' does not exist",
    2078 : "image file 'a1652c7d94a844216cd731d29f1daadb_Background.png' does not exist",
    2079 : "image file 'a1652c7d94a844216cd731d29f1daadb_Background.png' does not exist",
    2083 : "image file 'a1652c7d94a844216cd731d29f1daadb_Background.png' does not exist",
    2084 : "image file 'a1652c7d94a844216cd731d29f1daadb_Background.png' does not exist",
    2086 : "image file 'a1652c7d94a844216cd731d29f1daadb_Background.png' does not exist",
    2144 : "image file '1283b8506802a42df3d7f32668bf334f_Background.png' does not exist",
    2148 : "image file 'b3db13df1e35acfd6ad2c89429a8c78a_Background.png' does not exist",
    2178 : "image file 'a1652c7d94a844216cd731d29f1daadb_Background.png' does not exist",
    2192 : "image file 'a1652c7d94a844216cd731d29f1daadb_Background.png' does not exist",
    2223 : "image file '9d377f4a5f99c8ee32b0cc56341e1d1e_Mol.png' does not exist",
    2228 : "image file '5A95239B6A85E986B047C8FCE446F01E_ship_right.png' does not exist",
    2229 : "image file '5A95239B6A85E986B047C8FCE446F01E_ship_right.png' does not exist",
    2289 : "image file 'a0e57502ebd1bc61b3cfcd3d5744b367_Background.png' does not exist",
    2290 : "image file 'a0e57502ebd1bc61b3cfcd3d5744b367_Background.png' does not exist",
    2291 : "image file 'a0e57502ebd1bc61b3cfcd3d5744b367_Background.png' does not exist",
    2334 : "image file 'e967cbe62fc9acc91602cdc6244ef2f5_Background.png' does not exist",
    2337 : "image file 'ce4e092491106b4d47317b07d831e325_0392543df79a7a19d2dc8b5202235a81.jpg' does not exist",
    2361 : "image file 'a804cec58f66e4d0fe73280a1b36f204_Фон.png' does not exist",
    2364 : "image file 'f8ee46fff7de5cdad4a9ba4a7ab033d1_foxy_142000538285.jpg.png' does not exist",
    2385 : "image file 'f88ff88e639188bfcb1ce1e99821198f_latest.png' does not exist",
    2389 : "image file '800deb0aeb3afa520d48256acf630099_Background.png' does not exist",
    2406 : "image file '725a4efa635206d270a9780ba9f2b371_Hintergrund.png' does not exist",
    2447 : "image file '8efec7cd2d5fc4813ad641f655b01013_Moving Mole.png' does not exist",
    2448 : "image file 'c52a51d0e2705442fb0a4489c4f01794_Sfondo.png' does not exist",
    2449 : "image file '3b75d0e29f032cbb0b6697fb68669846_Background.png' does not exist",
    2555 : "image file '3a54777ea6b32fd6f72f1bec20ee1b7e_background2.PNG' does not exist",
    2563 : "image file 'a01fe44213ec2e7cbc53e1b0731f4278_Fondo.png' does not exist",
    2569 : "image file 'ca8acb8a12a5ccd30b420fffa0011fc3_images(2).jpeg' does not exist",
    2587 : "image file '099015ad90e18fd6da4909eaa30d8643_Köstebek taşıma.png' does not exist",
    2729 : "image file 'f5d7a189f9de7c4e207ab02be93e3952_picsay-1426618601035.jpg' does not exist",
    2745 : "image file '6cda9bf1a3ca19e2942060042df3895d_look.png' does not exist",
    2755 : "image file '2aeeb13347bb54f102b3a7b6e78e132b_Acierto-1º excel.PNG' does not exist",
    2767 : "image file '699a9988437575b4007dbfba368d951e_HUESOS.jpg' does not exist",
    2877 : "image file '2673d6fb4a96de40be570ed8dba19447_Background.png' does not exist",
    2898 : "image file '827829F8866ACCF1050373EC6DFBAD98_Space_Background_bigger.gif' does not exist",
    2900 : "image file '827829F8866ACCF1050373EC6DFBAD98_Space_Background_bigger.gif' does not exist",
    2948 : "image file 'b86a99895c8e17a945039bf2d095a1ae_Whacked Mole.png' does not exist",
    2950 : "image file '77f76545546e0dd847580d4736220de8_look.jpg.png' does not exist",
    2974 : "image file '9b3ece190da6e5851f61973cb18f9abb_IMG_20150326_144223.jpg' does not exist",
    3118 : "image file '2673d6fb4a96de40be570ed8dba19447_Фон.png' does not exist",
    3120 : "image file '2673d6fb4a96de40be570ed8dba19447_Фон.png' does not exist",
    3132 : "image file '5e1eb3138b5ce23be4c32f70b262aed9_Steamworkshop_webupload_previewfile_346907511_preview~2~2~3~2~2~2~2~2.jpg' does not exist",
    3133 : "image file '5e1eb3138b5ce23be4c32f70b262aed9_Steamworkshop_webupload_previewfile_346907511_preview~2~2~3~2~2~2~2~2.jpg' does not exist",
    3165 : "image file 'eb8262ff628fea6cf014698f421f4bf2_look.png' does not exist",
    3166 : "image file 'c2b8298d2f7f11cd11b1ed9a2595e949_Fondo.png' does not exist",
    3168 : "image file '4f2d8855c49838062991e9701be2a693_look.png' does not exist",
    3181 : "image file 'a91b09f6b09f16e937e66149d17cd7e0_GreySlatsMap.png' does not exist",
    3207 : "image file 'b3db13df1e35acfd6ad2c89429a8c78a_Background.png' does not exist",
    3214 : "image file '80aa23589731124b9d3bc333cc840dff_indicator1.gif' does not exist",
    3229 : "image file 'f6d06c2cd38e35447698f577dac6b565_Hintergrund.png' does not exist",
    3298 : "image file 'fa3bb3a8a46f7bc641e71693bb6d7c78_Background.png' does not exist",
    3302 : "image file '37180d5c92263bc7d77d82e16728eee6_Background.png' does not exist",
    3303 : "image file '37180d5c92263bc7d77d82e16728eee6_Background.png' does not exist",
    3304 : "image file '37180d5c92263bc7d77d82e16728eee6_Background.png' does not exist",
    3305 : "image file '37180d5c92263bc7d77d82e16728eee6_Background.png' does not exist",
    3306 : "image file '37180d5c92263bc7d77d82e16728eee6_Background.png' does not exist",
    3307 : "image file '37180d5c92263bc7d77d82e16728eee6_Background.png' does not exist",
    3308 : "image file '37180d5c92263bc7d77d82e16728eee6_Background.png' does not exist",
    3311 : "image file 'fa3bb3a8a46f7bc641e71693bb6d7c78_Background.png' does not exist",
    3329 : "image file '1e09b1421536c4f0cc9e1a3023c00e0a_look.png' does not exist",
    3351 : "image file '2673d6fb4a96de40be570ed8dba19447_Arka plan.png' does not exist",
    3354 : "image file '2673d6fb4a96de40be570ed8dba19447_Arka plan.png' does not exist",
    3388 : "image file 'b0644fdd57bff0092813282bebf4cda1_end_screen.png' does not exist",
    3420 : "image file '2a3f4f9128742e82aa2927d1ec3879af_2015_05_24_064439.png' does not exist",
    3447 : "image file 'a1e55432c86e3578caac0aa3b1be44c2_look.jpg.png' does not exist",
    3450 : "image file 'fc20476acb62ef6a1bc6560935887e3c_Moving Mole.png' does not exist",
    3467 : "image file '0a1ad0b03f72125872cffa529e446f46_Fondo.png' does not exist",
    3546 : "image file 'ddc4c22fb07b2ab7b6c273563b14a3eb_2015_06_18_092123.png' does not exist",
    3552 : "image file 'c6a11be685bbcd4161a76319c18382b0_live-wallpaper-radar-366779-l-280x280.png' does not exist",
    3558 : "image file '80aa23589731124b9d3bc333cc840dff_indicator1.gif' does not exist",
    3611 : "image file '4728a2ce6b682ac056b8f8185353108d_Moving Mole.png' does not exist",
    3626 : "image file '5a567fcec0566a370ee8d6815308218a_Background.png' does not exist",
    3627 : "image file '5a567fcec0566a370ee8d6815308218a_Background.png' does not exist",
    3628 : "image file '5a567fcec0566a370ee8d6815308218a_Background.png' does not exist",
    3629 : "image file '5a567fcec0566a370ee8d6815308218a_Background.png' does not exist",
    3631 : "image file '5a567fcec0566a370ee8d6815308218a_Background.png' does not exist",
    3634 : "image file '5a567fcec0566a370ee8d6815308218a_Background.png' does not exist",
    3734 : "image file '3e00549ba642a9e7c30ff24ee86a707e_Background.png' does not exist",
    3802 : "image file '6bf7b9546c9b3b877457aa7492172f96_형태.png' does not exist",
    3872 : "image file '0174618cbed4a3a3c28eed059d9e7128_Bewegender Maulwurf.png' does not exist",
    3911 : "image file 'fa3bb3a8a46f7bc641e71693bb6d7c78_Background.png' does not exist",
    3970 : "image file 'ddc4c22fb07b2ab7b6c273563b14a3eb_2015_06_18_092123.png' does not exist",
    3971 : "image file 'ddc4c22fb07b2ab7b6c273563b14a3eb_2015_06_18_092123.png' does not exist",
    4001 : "image file 'd602893e2c5f90ddd99fafe3390a9276_Background.png' does not exist",
    4003 : "image file 'c2b8298d2f7f11cd11b1ed9a2595e949_Фон.png' does not exist",
    4005 : "image file '0cfab2ecce41a79b4d7ab68bcac9720b_Background.png' does not exist",
    4053 : "image file '08f2272b400c4c55462e0d79d4a5b91c_костюм.jpg.png' does not exist",
    4054 : "image file 'a64f8da38184199ff4dd7d3bec4be6fb_look.png' does not exist",
    4109 : "image file '2c2da547f590734ab7caccad3d410953_Fundo.png' does not exist",
    4147 : "image file '0d3f88f8e2c36002a493361f1649ead7_alpha_iguazufalls_rainbow.jpg' does not exist",
    4148 : "image file '784899085b0828e3aa53bcc26e133db9_Background.png' does not exist",
    4385 : "image file '856824522e8bddce48f79ac05818e9ae_Run__000.png' does not exist",
    4476 : "image file '784899085b0828e3aa53bcc26e133db9_Fondo.png' does not exist",
    4489 : "image file 'e84ea00174c4b91618563f4cd5eb8a8b_Aspetto.png' does not exist",
    4516 : "image file '9b2b5adf78f0e5efce9a2a53a333e4b1_Background.png' does not exist",
    4528 : "image file '5b5b2dcd74c80d3d5486a807f9061758_images.png' does not exist",
    4544 : "image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
    4562 : "image file 'f411ae15d60928bea7e2599ac1d8787c_Hintergrund.png' does not exist",
    4575 : "image file 'e3e7acd53295548c2f7786895e9e774a_Fondo.png' does not exist",
    4577 : "image file '725a4efa635206d270a9780ba9f2b371_Фон.png' does not exist",
    4676 : "image file '4db5496acd68f08066495e94d75ac9fe_Moving Mole.png' does not exist",
    4704 : "image file '4ca628e26a2c5d21ad6ca85eb82a128d_lechuga-1.jpg' does not exist",
    4729 : "image file 'b9399cef691313dfdcc012b8a2abb128_Фон.png' does not exist",
    4740 : "image file '44ef4382c2f0f6eac43e7886b123db80_F.jpg' does not exist",
    4873 : "image file 'fccc190cbe44ec0415faa971e826ced2_look.png' does not exist",
    4904 : "image file '3a54777ea6b32fd6f72f1bec20ee1b7e_background2.PNG' does not exist",
    4908 : "image file 'c955a9c72ba1586233c0340d1bbdb0d0_pacghost1-small.png' does not exist",
    4958 : "image file '784899085b0828e3aa53bcc26e133db9_Fondo.png' does not exist",
    4981 : "image file 'a64f8da38184199ff4dd7d3bec4be6fb_look.png' does not exist",
    5018 : "image file '9dcb3d280b1edc5656c661b24060df67_Aussehen.png' does not exist",
    5034 : "image file 'bbae5a570b2930b327da89b44f24dbf3_Toupeira movendo.png' does not exist",
    5128 : "image file 'd9ee78cb35122a3f21eb4a98814495e8_level1.png' does not exist",
    5137 : "image file 'f411ae15d60928bea7e2599ac1d8787c_Фон.png' does not exist",
    5176 : "image file '9b2b5adf78f0e5efce9a2a53a333e4b1_Background.png' does not exist",
    5180 : "image file '14cf694459dff613406fac08b350649e_Background.png' does not exist",
    5181 : "image file '698c8442352eae7f3cb5f0e079e2c8ca_背景.png' does not exist",
    5182 : "image file '37180d5c92263bc7d77d82e16728eee6_Background.png' does not exist",
    5188 : "image file 'c7d8acd8a3b9e0e5e0e4a0b88b55206e_look.png' does not exist",
    5232 : "image file '14cf694459dff613406fac08b350649e_Background.png' does not exist",
    5234 : "image file 'd9ee78cb35122a3f21eb4a98814495e8_level1.png' does not exist",
    5272 : "image file 'b77dc9b63165aaef86e829984693f456_text-m3-endmission_transition-text.png' does not exist",
    5291 : "image file 'e3e7acd53295548c2f7786895e9e774a_Arka plan.png' does not exist",
    5307 : "image file 'b98bac0e6dc0e52f6ae2c03e83300663_FB_IMG_1447296278100.jpg' does not exist",
    5412 : "image file 'f26cbf79372f08620945708906287207_grassland.jpg' does not exist",
    5425 : "image file '037aa096f985236928a9e260bd676c09_1-Start.png' does not exist",
    5426 : "image file '0db6866c6358074553e4bb9cfc37bb40_2014_11_04_014918.png' does not exist",
    5472 : "image file 'c52a51d0e2705442fb0a4489c4f01794_Background.png' does not exist",
    5536 : "image file 'bd1406e16257756adae2f7cba49d6d5b_down_cyl.PNG' does not exist",
    5554 : "image file '21b328177b7ed39f12917801e7baaad9_coin.jpg' does not exist",
    5559 : "image file 'cde7370f9b1606579a224d1d8b40506c_look.png' does not exist",
    5563 : "image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
    5568 : "image file 'd602893e2c5f90ddd99fafe3390a9276_Hintergrund.png' does not exist",
    5570 : "image file 'ab1f944dd4de8fdc24b0940d3fea1475_Background.png' does not exist",
    5576 : "image file 'beb8fde0ed8fd060641710254d493d37_Moving Mole.png' does not exist",
    5596 : "image file 'c4c58c872c86d2f21900ccec1a08c1ca_C4C58C872C86D2F21900CCEC1A08C1CA_green-0.png' does not exist",
    5609 : "image file '3a54777ea6b32fd6f72f1bec20ee1b7e_background2.PNG' does not exist",
    5618 : "image file '99afe9ba4142c9d99863ff68edd0baf9_1416564188149.png' does not exist",
    5624 : "image file '9e7c705bb977601926ec22a334d92f2d_greencar.png' does not exist",
    5625 : "image file 'b3db13df1e35acfd6ad2c89429a8c78a_Background.png' does not exist",
    5638 : "image file 'b3db13df1e35acfd6ad2c89429a8c78a_Background.png' does not exist",
    5665 : "image file '248622cf728165276b8ac249a8cccb1e_Topo que se mueve.png' does not exist",
    5679 : "image file 'd4473b246fc67bc072a5f76d13c33b42_Background.png' does not exist",
    5693 : "image file '666ca1a0c6185f16a98c565cc84a7dda_Hintergrund.png' does not exist",
    5704 : "image file '95ed85730daed35cf524c756b035a51d_Háttér.png' does not exist",
    5736 : "image file '4f99b8dbb9f98421aa56a22705814e8b_地鼠.png' does not exist",
    5763 : "image file '7c7125df7e6c50d562240a71fb67ab75_minecraft_background_graphics_green_21194_1920x1200.jpg' does not exist",
    5787 : "image file '238294ed2f7e80864081aff9c2b7791b_2016_01_09_035351.png' does not exist",
    5797 : "image file 'c2b8298d2f7f11cd11b1ed9a2595e949_Background.png' does not exist",
    5835 : "image file 'd9ad8aea9e76c96b565fd582415c9728_bluecar.png' does not exist",
    5860 : "image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
    5892 : "image file '2c2da547f590734ab7caccad3d410953_Background.png' does not exist",
    5929 : "image file 'b3db13df1e35acfd6ad2c89429a8c78a_Hintergrund.png' does not exist",
    5940 : "image file '139843B4866929D6E32C91DEFC627378_look.png' does not exist",
    5941 : "image file 'cd8eac76b519dec405593a1d4da84a17_Mole.png' does not exist",
    5949 : "image file '3a54777ea6b32fd6f72f1bec20ee1b7e_background2.PNG' does not exist",
    5962 : "image file 'bd1406e16257756adae2f7cba49d6d5b_down_cyl.PNG' does not exist",
    5965 : "image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
    5970 : "image file '0c285075b545fb1283360283ed40d7ca_Moving Mole.png' does not exist",
    5978 : "image file '0053c8b33c8f537e4f5ccabc16ff4165_IMG-20151206-WA0001.jpg' does not exist",
    5988 : "image file '26e54a2cdfa4e101df15dba2416a55b1_birdyellow1.PNG.png' does not exist",
    5991 : "image file 'ea276d81cbf7229736a75208a900bc7d_look.jpg' does not exist",
    5992 : "image file 'ea276d81cbf7229736a75208a900bc7d_look.jpg' does not exist",
    6007 : "image file 'ea276d81cbf7229736a75208a900bc7d_look.jpg' does not exist",
    6012 : "image file 'ea276d81cbf7229736a75208a900bc7d_look.jpg' does not exist",
    6035 : "image file '7c7125df7e6c50d562240a71fb67ab75_minecraft_background_graphics_green_21194_1920x1200.jpg' does not exist",
    6039 : "image file '7c7125df7e6c50d562240a71fb67ab75_minecraft_background_graphics_green_21194_1920x1200.jpg' does not exist",
    6049 : "image file 'de160fe6e0ac9620267f3f2aa2c69c5d_look.png' does not exist",
    6057 : "image file 'f1f84e674be6034a2164473e391dad6b_20150213_001023-1.jpg.png' does not exist",
    6062 : "image file '9c46cc3ba8420e9e7d9df2b08ec1f397_костюм.png' does not exist",
    6115 : "image file '158bab9d2dfc64e91409c2e160419e64_20160103_130614.jpg' does not exist",
    6116 : "image file '158bab9d2dfc64e91409c2e160419e64_20160103_130614.jpg' does not exist",
    6174 : "image file '2e8829170ef31dd0f67e27321cbd0420_IMG-20160129-WA0201.jpg' does not exist",
    6217 : "image file '7c7125df7e6c50d562240a71fb67ab75_minecraft_background_graphics_green_21194_1920x1200.jpg' does not exist",
    6235 : "image file 'f765b38ee21fd02aed97ab83ac3a6721_Aussehen.png' does not exist",
    6244 : "image file '5684fc71e74d7f77edde4521a4b7f1e4_Utseende.png' does not exist",
    6246 : "image file '9b3ece190da6e5851f61973cb18f9abb_IMG_20150326_144223.jpg' does not exist",
    6267 : "image file '0a1ad0b03f72125872cffa529e446f46_พื้นหลัง.png' does not exist",
    6286 : "image file 'c52a51d0e2705442fb0a4489c4f01794_Hintergrund.png' does not exist",
    6304 : "image file '0a1ad0b03f72125872cffa529e446f46_พื้นหลัง.png' does not exist",
    6319 : "image file '07a2ab373c4a625f7bba454b43af63f9_Moving Mole.png' does not exist",
    6324 : "image file '778894e84ca9d8a490039b820986e658_platform.png' does not exist",
    6325 : "image file '6152f3d80a5e0b6af7c57f1c8904e810_Hintergrund.png' does not exist",
    6347 : "image file '279f570f19733514172f87eefe2ec609_IMG-20160206-WA0002.jpg' does not exist",
    6357 : "image file 'dcd67133f3e176357e4c9b21dfbc0441_pantunnel3-small.png' does not exist",
    6382 : "image file 'e3df60f688229f3364251d6961d52d3b_Bewegender Maulwurf.png' does not exist",
    6418 : "image file '09ac4cc33e6785da87940f43275cef73_look.png' does not exist",
    6427 : "image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
    6434 : "image file 'fe9fc8af9f5b76af9058e212e7a62681_Screenshot_2015-11-14-14-33-50.png' does not exist",
    6444 : "image file '5684fc71e74d7f77edde4521a4b7f1e4_Utseende.png' does not exist",
    6455 : "image file 'b68dad916076aaaf4f553e9be5896316_2027be49d082a7c9878431bbb9333d86.jpg' does not exist",
    6472 : "image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
    6478 : "image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
    6479 : "image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
    6490 : "image file 'e87f1bdebbebcbbee43579edb4505db1_外見.png' does not exist",
    6500 : "image file 'fa1073f75f3f3d24f65c9a109ea1aa1c_bird-b.png' does not exist",
    6600 : "image file 'e3df60f688229f3364251d6961d52d3b_موش کور متحرک.png' does not exist",
    6608 : "image file '725a4efa635206d270a9780ba9f2b371_Fundal.png' does not exist",
    6617 : "image file 'd4473b246fc67bc072a5f76d13c33b42_Hintergrund.png' does not exist",
    6636 : "image file '0c285075b545fb1283360283ed40d7ca_Moving Mole.png' does not exist",
    6637 : "image file '6b3ba82ee5c21751a760a61c50b18ffe_Hintergrund.png' does not exist",
    6659 : "image file '2673d6fb4a96de40be570ed8dba19447_Hintergrund.png' does not exist",
    6668 : "image file 'd602893e2c5f90ddd99fafe3390a9276_Фон.png' does not exist",
    6675 : "image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
    6678 : "image file 'a4126c80460a0b98933598567712d8ed_Latar belakang.png' does not exist",
    6699 : "image file '2673d6fb4a96de40be570ed8dba19447_Hintergrund.png' does not exist",
    6747 : "image file '0FE096333242A2A86C4F09C3A6634C15_tiles.png' does not exist",
    6763 : "image file '9eb91177d3dffb4acec24ecbdbb61c3e_Pano de fundo.png' does not exist",
    6794 : "image file '9dca3f2239d9870c158065a030b07670_Aussehen.png' does not exist",
    6811 : "image file 'c1ae164a333c19d221e6ff9f39dc66ef_0.png' does not exist",
    6874 : "image file '3a54777ea6b32fd6f72f1bec20ee1b7e_background2.PNG' does not exist",
    6885 : "image file 'ec7257ee8252ddc94e76776588968a52_look.png' does not exist",
    6893 : "image file 'ec7257ee8252ddc94e76776588968a52_look.png' does not exist",
    6946 : "image file 'aef79cc8f417a868db0598f261e983ba_Screenshot_2016-02-22-05-49-09.png' does not exist",
    6949 : "image file '3a54777ea6b32fd6f72f1bec20ee1b7e_background2.PNG' does not exist",
    6961 : "image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
    6985 : "image file 'c4c58c872c86d2f21900ccec1a08c1ca_C4C58C872C86D2F21900CCEC1A08C1CA_green-0.png' does not exist",
    6987 : "image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
    7038 : "image file 'fd2bccb1a209bdaaa80ea6ed291782e1_Screenshot_2016-03-05-18-50-08.png' does not exist",
    7045 : "image file '54f8689bc523b057402bd1ecc1d35e38_1457141470812.jpg' does not exist",
    7106 : "image file '685050cbb10a3ce00c2e13b79bf69e96_Screenshot_2016-02-22-17-08-33.jpeg' does not exist",
    7123 : "image file '827829F8866ACCF1050373EC6DFBAD98_Space_Background_bigger.gif' does not exist",
    7164 : "image file 'c4c58c872c86d2f21900ccec1a08c1ca_C4C58C872C86D2F21900CCEC1A08C1CA_green-0.png' does not exist",
    7179 : "image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
    7202 : "image file '41f124e7ed37b3dac8ccaeb17b2156b8_birdyellow1.PNG' does not exist",
    7205 : "image file '3a54777ea6b32fd6f72f1bec20ee1b7e_background2.PNG' does not exist",
    7213 : "image file '3a54777ea6b32fd6f72f1bec20ee1b7e_background2.PNG' does not exist",
    7216 : "image file 'c60c458f464528bd9fa1b063059761b9_Вид.png' does not exist",
    7227 : "image file '3a54777ea6b32fd6f72f1bec20ee1b7e_background2.PNG' does not exist",
    7231 : "image file '3a54777ea6b32fd6f72f1bec20ee1b7e_background2.PNG' does not exist",

    1002 : "sound file 'c006f161e41acb98a9eb7b1e22405971_Raak' does not exist",
    1860 : "sound file '4eda5e4f6599b5d3eb1c9fdf15a9f377_10-02 The Long Delayed Reunion.mp3' does not exist",
    1892 : "sound file 'b2b211bb1d7ed0f03db40af1a9237312_打字机.mp3' does not exist",
    2209 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Hit1.m4a' does not exist",
    2225 : "sound file '9fb111c07e3bdae5ee7f6546a44f1ddd_Evolution FX4.wav' does not exist",
    2345 : "sound file 'aad6a11c281309e2c96531019cb2b922_leps_grigorij-v_gorode_dojd__plus-msk.ru_.mp3' does not exist",
    2533 : "sound file '34631984F52E51EDD974F0130D6F46A2_8-Bit Betty - Spooky Loop_cut.mp3' does not exist",
    2543 : "sound file '0370b09e8cd2cd025397a47e24b129d5_Hit2.m4a' does not exist",
    2628 : "sound file '2d187cddeab697e7a294491ed8f8945c_record.m4a' does not exist",
    2664 : "sound file '42f49bbba84ef3c2d41a8cab450cb440_ - Another One Bites The Dust (mArKkOmIxX Remaster).mp3' does not exist",
    2693 : "sound file '8eb9509a392c2d2726f116ad79560c53_Ocupado.wav' does not exist",
    2917 : "sound file 'd054944f2e1e5ed9fd99c8afd94d0f79_registro.m4a' does not exist",
    3190 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Hit1.m4a' does not exist",
    3282 : "sound file 'a5d20edab14b642fbe0642cd57224363_Happy - Pharrel Williams.mp3' does not exist",
    3326 : "sound file 'f1db78df24365904de378341efe1b2b6_05 - Adele - Set Fire To The Rain[mp3lemon.net] (1).mp3' does not exist",
    3457 : "sound file '0370b09e8cd2cd025397a47e24b129d5_Golpear2.m4a' does not exist",
    3458 : "sound file '029bfe13d2096fc7a256e3a4285ec832_ThroatGulp.mp3' does not exist",
    3463 : "sound file 'd7930c4d559400ade892545d5fe73669_record.m4a' does not exist",
    3523 : "sound file '1a97ba096e386072962f26587a26b0b4_hangouts_message.ogg' does not exist",
    3644 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Hit1.m4a' does not exist",
    3648 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Hit1.m4a' does not exist",
    3660 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Hit1.m4a' does not exist",
    3717 : "sound file '6aacce178f7f398786413ce705737651_record.m4a' does not exist",
    3859 : "sound file '96fbe129a4463ec099d77495ba448380_hangouts_message.ogg' does not exist",
    3883 : "sound file '03745c075d7e01813bf564de016af4c6_explode.mpga' does not exist",
    3910 : "sound file '03745c075d7e01813bf564de016af4c6_explode.mpga' does not exist",
    3938 : "sound file '8c76ef726dc0e88f2a2417a95fabc1ec_Hit3.m4a' does not exist",
    4064 : "sound file 'd3710073686e4fb04c16bb006f73c614_record.m4a' does not exist",
    4233 : "sound file '7b7734e2cbbad82c62eea43bf04103f8_Hit4.m4a' does not exist",
    4512 : "sound file 'b305b72dd959acbe4ca9cf4dbfde8d10_AlienPortal.wav' does not exist",
    4525 : "sound file '23187c548e79756a0f2f12ea17d14e3e_00_lalala.mp3' does not exist",
    4649 : "sound file '0370b09e8cd2cd025397a47e24b129d5_Hit2.m4a' does not exist",
    4901 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Hit1.m4a' does not exist",
    4913 : "sound file 'f698d4f877171071a44799e7400b23b8_liam5.wav' does not exist",
    4969 : "sound file 'f9253556ba4981c908495dcf6b942b5a_record.m4a' does not exist",
    4994 : "sound file '7b7734e2cbbad82c62eea43bf04103f8_Hit4.m4a' does not exist",
    5255 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Treffer1.m4a' does not exist",
    5296 : "sound file '22421b4d9818ca10bad5d88447edf61d_Ugh-notification_sound-815525.mp3' does not exist",
    5299 : "sound file '03745c075d7e01813bf564de016af4c6_explode.mpga' does not exist",
    5550 : "sound file 'fa664ec193607f56f9faf82ea347b917_FlameScore.wav' does not exist",
    5551 : "sound file '4913ada15cb716c6c5d6d0325a4ccc09_laser.wav' does not exist",
    5747 : "sound file 'cb92566e1337f36f90f7c511876a52a3_bling-2.wav' does not exist",
    5828 : "sound file '9ba9ca6ff3d8ab0201ce35b1f1143093_piano-2016-01-11-21-33.mp3' does not exist",
    5891 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Pukul1.m4a' does not exist",
    5893 : "sound file 'a49fd671df65fb1c1b5f93bb56b53c85_record.mp3' does not exist",
    5912 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Treffer1.m4a' does not exist",
    5918 : "sound file '7b7734e2cbbad82c62eea43bf04103f8_Hit4.m4a' does not exist",
    5937 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Treffer1.m4a' does not exist",
    6036 : "sound file '7b7734e2cbbad82c62eea43bf04103f8_Hit4.m4a' does not exist",
    6098 : "sound file '1e8ee0c48a91195e0ed2ac7edd4287ca_record.m4a' does not exist",
    6155 : "sound file '3183cafa6d1edb49ff62334b3865f092_record.m4a' does not exist",
    6167 : "sound file '32f1747af98f7135f1628940cdbf1014_Dikke_bmw-notification_sound-1841419.mp3' does not exist",
    6169 : "sound file 'a7573569e2fce7ad23456bf7391b1141_gravação.m4a' does not exist",
    6173 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Hit1.m4a' does not exist",
    6321 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Treffer1.m4a' does not exist",
    6323 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Treffer1.m4a' does not exist",
    6415 : "sound file 'c79caef3cb19241c3e2f35e990ea8c46_record.m4a' does not exist",
    6691 : "sound file '6f231e6406d3554d691f3c9ffb37c043_Hit1.m4a' does not exist",
    6960 : "sound file 'd69867a4600d590c41c8379d325392cc_Aufnahme.m4a' does not exist",
    6981 : "sound file 'e8b755dee4f1c174987d38f79650645b_Bubbles-ringtone-5251.mp3' does not exist",
    7130 : "sound file '33924ed4af7713b8645d837e2f81c5c4_record.m4a' does not exist",
    7131 : "sound file '33924ed4af7713b8645d837e2f81c5c4_record.m4a' does not exist",
    7240 : "sound file 'd69867a4600d590c41c8379d325392cc_Aufnahme.m4a' does not exist",

    782 : "IfLogicElseBrick: referenced brick",
    793 : "IfLogicBeginBrick: referenced brick",
    826 : "IfLogicBeginBrick: referenced brick",
    946 : "SetLookBrick: referenced brick",
    1884 : "IfLogicBeginBrick: referenced brick",
    2028 : "ForeverBrick: referenced brick",
    2610 : "IfLogicBeginBrick: referenced brick",
    3402 : ": referenced brick",
    6339 : ": referenced brick",
    6385 : ": referenced brick",
    6387 : ": referenced brick",
    6768 : ": referenced brick",
    6775 : ": referenced brick",
    6784 : ": referenced brick",
    6785 : ": referenced brick",
    6787 : ": referenced brick",
    6791 : ": referenced brick",
    6793 : ": referenced brick",
    6796 : ": referenced brick",
    6797 : ": referenced brick",
    6801 : ": referenced brick",
    6827 : ": referenced brick",
    6828 : ": referenced brick",
    6848 : ": referenced brick",
    6849 : ": referenced brick",
    6858 : ": referenced brick",
    6859 : ": referenced brick",
    6876 : ": referenced brick",
    6882 : ": referenced brick",
    6898 : ": referenced brick",
    6901 : ": referenced brick",
    6917 : ": referenced brick",
    6918 : ": referenced brick",
    6921 : ": referenced brick",
    6922 : ": referenced brick",
    6925 : ": referenced brick",
    6926 : ": referenced brick",
    6932 : ": referenced brick",
    6941 : ": referenced brick",
    6948 : ": referenced brick",
    6952 : ": referenced brick",
    6954 : ": referenced brick",
    6962 : ": referenced brick",
    6979 : ": referenced brick",
    6992 : ": referenced brick",
    6993 : ": referenced brick",
    7000 : ": referenced brick",
    7002 : ": referenced brick",
    7008 : ": referenced brick",
    7011 : ": referenced brick",
    7013 : ": referenced brick",
    7014 : ": referenced brick",
    7016 : ": referenced brick",
    7017 : ": referenced brick",
    7018 : ": referenced brick",
    7020 : ": referenced brick",
    7023 : ": referenced brick",
    7024 : ": referenced brick",
    7028 : ": referenced brick",
    7036 : ": referenced brick",
    7046 : ": referenced brick",
    7061 : ": referenced brick",
    7081 : ": referenced brick",
    7083 : ": referenced brick",
    7088 : ": referenced brick",
    7089 : ": referenced brick",
    7090 : ": referenced brick",
    7120 : ": referenced brick",
    7127 : ": referenced brick",
    7128 : ": referenced brick",
    7134 : ": referenced brick",
    7144 : ": referenced brick",
    7146 : ": referenced brick",
    7147 : ": referenced brick",
    7150 : ": referenced brick",
    7155 : ": referenced brick",
    7159 : ": referenced brick",
    7162 : ": referenced brick",
    7174 : ": referenced brick",
    7175 : ": referenced brick",
    7176 : ": referenced brick",
    7186 : ": referenced brick",
    7197 : ": referenced brick",
    7200 : ": referenced brick",
    7212 : ": referenced brick",
    7215 : ": referenced brick",
    7218 : ": referenced brick",
    7228 : ": referenced brick",
    7229 : ": referenced brick",
    7232 : ": referenced brick",
    7236 : ": referenced brick",
    7237 : ": referenced brick",
    7242 : ": referenced brick"
  };

  var known_invalid_projects = {
    4824 : "RepeatBrick: missing LoopEndBrick [forever { repeat { endForever } endRepeat }]",
    6236 : "RepeatBrick: missing LoopEndBrick [forever { repeat { endForever } endRepeat }]",
    6241 : "RepeatBrick: missing LoopEndBrick [forever { repeat { endForever } endRepeat }]",
    6966 : "RepeatBrick: missing LoopEndBrick [forever { repeat { endForever } endRepeat }]",

    782 : "IfLogicElseBrick: referenced brick [brick with invalid ref]",
    793 : "IfLogicBeginBrick: referenced brick [brick with invalid ref]",
    826 : "IfLogicBeginBrick: referenced brick [brick with invalid ref]",
    946 : "SetLookBrick: referenced brick [brick with invalid ref]",
    1884 : "IfLogicBeginBrick: referenced brick [brick with invalid ref]",
    2028 : "ForeverBrick: referenced brick [brick with invalid ref]",
    2610 : "IfLogicBeginBrick: referenced brick [brick with invalid ref]",
    3402 : ": referenced brick [brick with invalid ref]",
    6339 : ": referenced brick [brick with invalid ref]",
    6385 : ": referenced brick [brick with invalid ref]",
    6387 : ": referenced brick [brick with invalid ref]",
    6768 : ": referenced brick [brick with invalid ref]",
    6775 : ": referenced brick [brick with invalid ref]",
    6784 : ": referenced brick [brick with invalid ref]",
    6785 : ": referenced brick [brick with invalid ref]",
    6787 : ": referenced brick [brick with invalid ref]",
    6791 : ": referenced brick [brick with invalid ref]",
    6793 : ": referenced brick [brick with invalid ref]",
    6796 : ": referenced brick [brick with invalid ref]",
    6797 : ": referenced brick [brick with invalid ref]",
    6801 : ": referenced brick [brick with invalid ref]",
    6827 : ": referenced brick [brick with invalid ref]",
    6828 : ": referenced brick [brick with invalid ref]",
    6848 : ": referenced brick [brick with invalid ref]",
    6849 : ": referenced brick [brick with invalid ref]",
    6858 : ": referenced brick [brick with invalid ref]",
    6859 : ": referenced brick [brick with invalid ref]",
    6876 : ": referenced brick [brick with invalid ref]",
    6882 : ": referenced brick [brick with invalid ref]",
    6898 : ": referenced brick [brick with invalid ref]",
    6901 : ": referenced brick [brick with invalid ref]",
    6917 : ": referenced brick [brick with invalid ref]",
    6918 : ": referenced brick [brick with invalid ref]",
    6921 : ": referenced brick [brick with invalid ref]",
    6922 : ": referenced brick [brick with invalid ref]",
    6925 : ": referenced brick [brick with invalid ref]",
    6926 : ": referenced brick [brick with invalid ref]",
    6932 : ": referenced brick [brick with invalid ref]",
    6941 : ": referenced brick [brick with invalid ref]",
    6948 : ": referenced brick [brick with invalid ref]",
    6952 : ": referenced brick [brick with invalid ref]",
    6954 : ": referenced brick [brick with invalid ref]",
    6962 : ": referenced brick [brick with invalid ref]",
    6979 : ": referenced brick [brick with invalid ref]",
    6992 : ": referenced brick [brick with invalid ref]",
    6993 : ": referenced brick [brick with invalid ref]",
    7000 : ": referenced brick [brick with invalid ref]",
    7002 : ": referenced brick [brick with invalid ref]",
    7008 : ": referenced brick [brick with invalid ref]",
    7011 : ": referenced brick [brick with invalid ref]",
    7013 : ": referenced brick [brick with invalid ref]",
    7014 : ": referenced brick [brick with invalid ref]",
    7016 : ": referenced brick [brick with invalid ref]",
    7017 : ": referenced brick [brick with invalid ref]",
    7018 : ": referenced brick [brick with invalid ref]",
    7020 : ": referenced brick [brick with invalid ref]",
    7023 : ": referenced brick [brick with invalid ref]",
    7024 : ": referenced brick [brick with invalid ref]",
    7028 : ": referenced brick [brick with invalid ref]",
    7036 : ": referenced brick [brick with invalid ref]",
    7046 : ": referenced brick [brick with invalid ref]",
    7061 : ": referenced brick [brick with invalid ref]",
    7081 : ": referenced brick [brick with invalid ref]",
    7083 : ": referenced brick [brick with invalid ref]",
    7088 : ": referenced brick [brick with invalid ref]",
    7089 : ": referenced brick [brick with invalid ref]",
    7090 : ": referenced brick [brick with invalid ref]",
    7120 : ": referenced brick [brick with invalid ref]",
    7127 : ": referenced brick [brick with invalid ref]",
    7128 : ": referenced brick [brick with invalid ref]",
    7134 : ": referenced brick [brick with invalid ref]",
    7144 : ": referenced brick [brick with invalid ref]",
    7146 : ": referenced brick [brick with invalid ref]",
    7147 : ": referenced brick [brick with invalid ref]",
    7150 : ": referenced brick [brick with invalid ref]",
    7155 : ": referenced brick [brick with invalid ref]",
    7159 : ": referenced brick [brick with invalid ref]",
    7162 : ": referenced brick [brick with invalid ref]",
    7174 : ": referenced brick [brick with invalid ref]",
    7175 : ": referenced brick [brick with invalid ref]",
    7176 : ": referenced brick [brick with invalid ref]",
    7186 : ": referenced brick [brick with invalid ref]",
    7197 : ": referenced brick [brick with invalid ref]",
    7200 : ": referenced brick [brick with invalid ref]",
    7212 : ": referenced brick [brick with invalid ref]",
    7215 : ": referenced brick [brick with invalid ref]",
    7218 : ": referenced brick [brick with invalid ref]",
    7228 : ": referenced brick [brick with invalid ref]",
    7229 : ": referenced brick [brick with invalid ref]",
    7232 : ": referenced brick [brick with invalid ref]",
    7236 : ": referenced brick [brick with invalid ref]",
    7237 : ": referenced brick [brick with invalid ref]",
    7242 : ": referenced brick [brick with invalid ref]"
  };

  /*                          known client errors                              */
  /* will be skipped if test_only_listed_programs = false */
  var client_known_errors = {
    821: "sound issue",
    881: "sound issue: chrome, valid in firefox",
    3926: "timeout 120s: 67 mb project, possibly missing bricks: stops loading after 744 out of 753 bricks ",
    //1811: "timeout 120s",
    2732: "(uncatched Error) ILLEGAL TOKEN within parser problem in the speak brick, possibly because of a spanish text",
    //6038: "timeout 120s",
    //3406: "timeout 120s",
    2578: "timeout 120s, stops loading after 816 out of 820 bricks",
    873: "sound issue",
    //957: "?",
    3284: "sound issue",
    //2733: "timeout 120s",
    //1868: "timeout 120s",
    //3469: "timeout 120s",
    3738: "timeout 120s, completely empty project with nothing to load",
    1799: "Uncaught IndexSizeError: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The source width is 0. (fabricjs set brightness filter)",
    1808: "timeout 120s, loads 90 out of 94 bricks",
    3249: "sound issue",
    1792: "timeout 120s, loads 275 out of 286 bricks",
    5286: "timeout 120s, loads 277 out of 279 bricks",
    3270: "timeout 120s, large project: loading works but may take a while",
    3923: "timeout 120s, same project as 3926",
    //2376: "timeout 120s",
    1801: "timeout 120s, loads 2338 out of 2758 bricks",
    3853: "timeout 120s, loads 66 out of 138 bricks, Missing bricks in Pinwheel4 (missing loops)",
    //2689: "timeout 120s",
    3240: "sound issue",
    //6067: "(uncatched Error) Problem parsing the value '05.0' in a set volume brick: Uncaught SyntaxError: Unexpected number",    //LOADING FIXED BUT NOT RUNNING YET
    //4049: "timeout 120s", //LOADING fixed but: Uncaught Error: invalid argument: position when changing pos y
    3381: "timeout 120s, large project: loading works but may take a while",
    //1823: "timeout 120s",
    2673: "sound issue? FF: encoding issue in formula/parser",
    //5237: "timeout 120s",
    3230: "timeout 120s, loads 768 out of 772 bricks",
    1793: "timeout 120s, loads 21 out of 43 bricks missing forever loop in json on sprite: 'furbys mouth'",
    //2226: "timeout 120s",
    //4028: "timeout 120s",
    1958: "timeout 120s, large project: loading works but may take a while",
    1791: "timeout 120s, loads 68 out of 99 bricks",
    1445: "sound issue: chrome, valid in firefox",
    2196: "sound issue: chrome, valid in firefox",
    980: "sound issue: chrome, valid in firefox",
    965: "sound issuee: chrome, valid in firefox",
    3147: "sound issue: chrome, valid in firefox",
    1578: "sound issue: chrome, valid in firefox",
    //4142: "timeout 120s: loading stopped",
  };
  //

  /* ************************************************************************* */
  /* ************************************************************************* */
  /* ************************************************************************* */

  if(test_only_listed_programs !== false)
  {
    if(test_only_listed_programs == "server")
      limit = Object.keys(server_known_errors).length;
    else if(test_only_listed_programs == "client")
      limit = Object.keys(client_known_errors).length;
  }

  // init
  var i = 0;
  var done = {};
  // define number of projects, which will be tested in Listener
  for(i = 0; i < limit; i++)
  {
    done[i + 1] = assert.async();
  }
  // add "last" test, to see if its finished and
  // to prevent early finishing on testing all projects
  done[0] = assert.async();
  var receivedObject;
  var currentProjectIdx = 1;
  var id = 0;
  var limit_txt;
  var receivedResult;
  if(limit != 0)
    limit_txt = limit;
  else
    limit_txt = "all";
  var timeout_timer;

  assert.ok(true, "Try to test " + limit_txt + " projects");


  if(test_only_listed_programs == false)
  {
    // Fetch a list of Projects and save them to "receivedObject"
    var url = PocketCode.Services.PROJECT_SEARCH;
    var srAllProjects = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {
      limit: limit,
      mask: "downloads"
    });


    var onSuccessProjectsHandler = function(e) {
      receivedObject = e.responseJson;
      //var allProjectsCount = receivedObject.items.length;
      var allProjectsCount = receivedObject.totalProjects;

      if(limit == 0)
      {
        // resend request to test all Projects
        limit = allProjectsCount;
        for(i = 0; i < limit; i++)
        {
          done[i + 1] = assert.async();
        }
        //console.log(limit);
        srAllProjects = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {
          limit: limit,
          offset: offset,
          mask: "downloads" //downloads/views/recent/random
        });
        srAllProjects.onLoad.addEventListener(new SmartJs.Event.EventListener(onSuccessProjectsHandler, this));
        srAllProjects.onError.addEventListener(new SmartJs.Event.EventListener(onErrorProjectsHandler, this));
        PocketCode.Proxy.send(srAllProjects);
      }
      else
      {
        assert.ok(true, "get List of " + limit + " projects (total Projects: " + allProjectsCount + " / test " + limit + " projects)");
        getSingleTestProject();
      }
    };

    var onErrorProjectsHandler = function(e) {
      //console.log("---- ERROR ----");
      //console.log(e);
      assert.ok(true, "Fetch of all projects failed");
    };

    srAllProjects.onLoad.addEventListener(new SmartJs.Event.EventListener(onSuccessProjectsHandler, this));
    srAllProjects.onError.addEventListener(new SmartJs.Event.EventListener(onErrorProjectsHandler, this));
    PocketCode.Proxy.send(srAllProjects);
    // ---
  }
  else
  {
    //receivedObject = {"items":[
    var item_arr = [];
    var errors = {};
    if(test_only_listed_programs == "server")
      errors = server_known_errors;
    else if(test_only_listed_programs == "client")
      errors = client_known_errors;


    for(var key in errors)
    {
      // skip loop if the property is from prototype
      if(!errors.hasOwnProperty(key))
        continue;

      var el = {};
      el.id = key;
      item_arr.push(el);
    }
    receivedObject = {};
    receivedObject.items = item_arr;

    //console.log(receivedObject);

    assert.ok(true, "only test " + limit + " projects from list.");
    getSingleTestProject();
  }


  // GAME ENGINE TESTS
  var gameEngineOnLoad = function(e) {
    stopTimeOut();
    assert.ok(true, "Project " + id + " valid");
    done[currentProjectIdx - 1]();

    // Free Memory
    gameEngine.dispose();
    gameEngine = new PocketCode.GameEngine();

    getSingleTestProject();
  };


  var gameEngine;
  var gameEngineOnLoadListener = new SmartJs.Event.EventListener(gameEngineOnLoad, this);
  // ---

  function startTimeOut()
  {
    timeout_timer = setTimeout(function() {
      startNextTest()
    }, timeout_time);
  }

  function stopTimeOut()
  {
    clearTimeout(timeout_timer);
  }

  function startNextTest()
  {
    assert.ok(false, "Project " + id + " timeout");
    done[currentProjectIdx - 1]();

    // Free Memory
    gameEngine.dispose();
    gameEngine = new PocketCode.GameEngine();

    getSingleTestProject();
  }

  // Test function
  function getSingleTestProject()
  {

    // termination condition
    if(receivedObject.items.length + 1 == currentProjectIdx)
    {
      // Last assert (to prevent early finish)
      assert.ok(true, "finished all");
      done[0]();
      return;
    }

    var url = PocketCode.Services.PROJECT;
    id = receivedObject.items[currentProjectIdx - 1].id;

    //console.log("start to test " + id + " (Nr." + currentProjectIdx + ")");
    currentProjectIdx++;

    if(test_only_listed_programs == false)
    {
      if(id in server_known_errors && id in known_invalid_projects)
      {
        assert.ok(true, "Project " + id + " passed, error in project: \"" + known_invalid_projects[id] + "\"");
        done[currentProjectIdx - 1]();
        getSingleTestProject();
        return;
      }

      if(id in server_known_errors)
      {
        assert.ok(true, "[KNOWN ERROR] " + id + " FAILED \"" + server_known_errors[id] + "\"");
        done[currentProjectIdx - 1]();
        getSingleTestProject();
        return;
      }
    }

    var sr = new PocketCode.ServiceRequest(url, SmartJs.RequestMethod.GET, {id: id});
    var onSuccessProjectHandler = function(e) {

      var json = e.responseJson;

      if(JsonToGameEngine == true)
      {

        if(id in client_known_errors && test_only_listed_programs !== "client")
        {
          assert.ok(true, "Project " + id + " skipped (" + client_known_errors[id] + ")");
          done[currentProjectIdx - 1]();
          getSingleTestProject();
          return;
        }

        // Test Loading Project Errors
        if(gameEngine)
        {
          gameEngine.onLoad.removeEventListener(gameEngineOnLoadListener);
          gameEngine = undefined;
        }
        gameEngine = new PocketCode.GameEngine();
        // define 2 EventListener
        gameEngine.onLoad.addEventListener(gameEngineOnLoadListener);

        // load Project with json data
        try
        {
          startTimeOut();
          gameEngine.loadProject(json);
        }
        catch(error)
        {

          var receivedObject = error;
          var type = "";
          if((receivedObject instanceof Object))
          {
            type = "uncatched Error"; // receivedObject.target.keys()[0]; // e.g. ProjectNotFoundException
          }
          else
          {
            type = "Unknown target";
          }

          assert.ok(false, "Project ERROR " + id + " (" + type + ")");
          done[currentProjectIdx - 1]();

          // Free Memory
          receivedObject = null;
          e = null;
          //gameEngine.dispose();
          getSingleTestProject();
        }
      }
      else
      {
        assert.ok(true, "Project " + id + " valid");
        done[currentProjectIdx - 1]();
        getSingleTestProject();
      }
    };

    var onErrorProjectHandler = function(e) {
      var receivedObject = e.responseJson;
      var type = "", msg = "";
      if((receivedObject instanceof Object))
      {
        type = receivedObject.type; // e.g. ProjectNotFoundException
        msg = receivedObject.message;
      }
      else
      {
        type = "Unknown Error (no Json Exception)";
      }

      var filter = "";

      if(msg.indexOf(filter) > -1)
        console.log( id + " : " + "\"[" + type + "] " + msg + "\",");

      if(id in server_known_errors && id in known_invalid_projects)
      {
        assert.ok(true, "Project " + id + " passed, error in project: \"" + known_invalid_projects[id] + "\"");
        done[currentProjectIdx - 1]();
        getSingleTestProject();
        return;
      }

      assert.ok(false, "Project " + id + " not valid (" + type + "): " + msg);

      done[currentProjectIdx - 1]();

      getSingleTestProject();

    };
    sr.onLoad.addEventListener(new SmartJs.Event.EventListener(onSuccessProjectHandler, this));
    sr.onError.addEventListener(new SmartJs.Event.EventListener(onErrorProjectHandler, this));
    PocketCode.Proxy.send(sr);
  }

  // ---


});
