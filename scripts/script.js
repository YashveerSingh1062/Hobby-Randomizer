const Scene = require('Scene');
const Time = require('Time');
const Patches = require('Patches');
const Instruction = require('Instruction');
const Audio = require('Audio');
const Diagnostics = require('Diagnostics');
const Materials = require('Materials');
const Textures = require('Textures');
const Random = require('Random');
const { getAudioPlaybackController } = require('Audio');

//  objects

(async function () {
    const spShuffle = await Scene.root.findFirst('spShuffle');
    const apBlip = Audio.getAudioPlaybackController('apBlip'); // we need to control the playback 
    spShuffle.volume = 0;
  })();

  (async function() {
    const matRandomizer = await Promise.all(Materials.findFirst('matRandomizer')
  )});
//  variables

var status = 0; // 0 = no started, 1 = on going (shuffle), 2 = stop randomizer, 3 = end of the play
var randInterval1 = null;

Instruction.bind(true, 'tap_to_play');

Patches.outputs.getPulse('pulseScreenTap').then(value => value.subscribe(() => {

    if (status === 2) {
        // ending shuffling, don't allow to click
        return;
    }

    Instruction.bind(false, 'tap_to_play');
    Instruction.bind(false, 'tap_to_advance');
    Instruction.bind(false, 'tap_to_reply');

    if (status === 0) {
        // start randomizer (shuffle)

        (async function () {
            const spShuffle = await Scene.root.findFirst('spShuffle');
            spShuffle.volume = 1;
          })();

        randInterval1 = Time.setInterval(function () {
            setRandomImage();
        }, 100);

        Time.setTimeout(function () {
            Instruction.bind(false, 'tap_to_advance');
            Instruction.bind(true, 'tap_to_advance');
        }, 500);

        status = 1;
    }
    else if (status === 1) {
        // stop
        (async function () {
            const spShuffle = await Scene.root.findFirst('spShuffle'); 
            spShuffle.volume = 0;
          })();

        Time.clearInterval(randInterval1);
        status = 2;

        Instruction.bind(false, 'tap_to_advance');

        blip();
        // 1
        Time.setTimeout(function () {
            setRandomImage();
            blip();
        }, 300);
        // 2
        Time.setTimeout(function () {
            setRandomImage();
        }, 600);
        // 3
        Time.setTimeout(function () {
            setRandomImage();
        }, 1000);

        //  tap to try play again
        Time.setTimeout(function () {
            Instruction.bind(true, 'tap_to_reply');
            status = 3;  // 3 = end of play 
        }, 2000);

    }
    else if (status == 3)  // game ended
    {
        (async function() {
            // Locate the material and texture in the Assets
            const [matRandomizer, texture] = await Promise.all([
              Materials.findFirst('matRandomizer'),
              Textures.findFirst('which')
            ]);
            matRandomizer.diffuse = texture;
          })();
        Instruction.bind(false, 'tap_to_reply');
        Instruction.bind(true,'tap_to_play');
        status = 0;
    }

}));

function blip() 
{
    (async function () {
        const apBlip = await Audio.getAudioPlaybackController('apBlip'); // we need to control the playback 
        apBlip.reset();
        apBlip.setPlaying(true);
      })();
}

function setRandomImage() {
    // generate a random number and assign a texture base on that number
    var randomNumber = randomBetween(1, 9);  // we have 8 images in total
    let str = randomNumber + "";
    (async function() {
        // Locate the material and texture in the Assets
        const [matRandomizer, texture] = await Promise.all([
          Materials.findFirst('matRandomizer'),
          Textures.findFirst(str)
        ]);
        matRandomizer.diffuse = texture;
      })();
}

function randomBetween(min, max) 
{
    // generate random number between min and max (included)
    return Math.floor(Random.random() * (max - min + 1) + min);
}
