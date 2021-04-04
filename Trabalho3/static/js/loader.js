var scene = new THREE.Scene();

var width = window.innerWidth;
var height = window.innerHeight;

const NEAR = 1;
const FAR = 20000;
const FOV = 45;


var ORTHO = true;

const CAM = 2;

var ortho_camera = new THREE.OrthographicCamera( width/(-CAM), width/CAM, height/CAM, height/(-CAM), NEAR, FAR);

var persp_camera = new THREE.PerspectiveCamera(FOV, width / height, NEAR, FAR);

var camera;

if(ORTHO){
    camera = ortho_camera;
} else{
    camera = persp_camera;
}

var ambient_light = new THREE.AmbientLight(0xffffee, 0.05); // soft yellow light
scene.add(ambient_light);

var loader = new THREE.TextureLoader();

var raycaster = new THREE.Raycaster();

var listener = new THREE.AudioListener();

var renderer = new THREE.WebGLRenderer();
//renderer.physicallyCorrectLights = true;
renderer.gammaInput = true;
renderer.gammaOutput = true;
renderer.shadowMap.enabled = true;
//renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const SPHERE_DIVS = 32;
const RING_DIVS = 32;

var INTERSECTED = null;
var GRABBED     = null;
var RGRABBED    = null;

const PI = Math.PI;
const TAU = 2*Math.PI;


const audios = {
    universe : new Audio("../Trabalho3/audio/pavene.mp3")
};

const cage_audios = {
    universe : new Audio("../Trabalho3/audio/sopro.mp3")
};

const textures = {
    // Plantes
    mercury : loader.load("../Trabalho3/images/mercury.png"),
	venus   : loader.load("../Trabalho3/images/venus.png"),
	earth   : loader.load("../Trabalho3/images/earth.png"),
	mars    : loader.load("../Trabalho3/images/mars.png"),
	jupiter : loader.load("../Trabalho3/images/jupiter.png"),
    saturn  : loader.load("../Trabalho3/images/saturn.png"),
    uranus  : loader.load("../Trabalho3/images/uranus.png"),
	neptune : loader.load("../Trabalho3/images/neptune.png"),
	pluto   : loader.load("../Trabalho3/images/pluto.png"),

    // Universe
    universe : loader.load("../Trabalho3/images/universe.png")
};

const ring_textures = {
    // Rings
    saturn : loader.load("../Trabalho3/images/saturn_ring.png"),
    uranus : loader.load("../Trabalho3/images/uranus_ring.png")
};

const cage_textures = {
    mercury : loader.load("../Trabalho3/images/cage_earth.png"),
	venus   : loader.load("../Trabalho3/images/cage_earth.png"),
	earth   : loader.load("../Trabalho3/images/cage_earth.png"),
	mars    : loader.load("../Trabalho3/images/cage_earth.png"),
	jupiter : loader.load("../Trabalho3/images/cage_earth.png"),
    saturn  : loader.load("../Trabalho3/images/cage_earth.png"),
    uranus  : loader.load("../Trabalho3/images/cage_earth.png"),
	neptune : loader.load("../Trabalho3/images/cage_earth.png"),
	pluto   : loader.load("../Trabalho3/images/cage_earth.png"),

    rings   : loader.load("../Trabalho3/images/rainbow.png"),

    // Universe
    universe : loader.load("../Trabalho3/images/universe.png")
};

var universe = new Universe(FAR, 'universe');

const rings = {
//  name   : new Ring(inner, outer,   'name')
    saturn : new Ring(  140,   202, 'saturn'),
    uranus : new Ring(   42,    70, 'uranus')
};

const planets = {
//  name    : new Planet(universe,   r,    'name', Vec3(position),  ring),
    mercury : new Planet(universe,   4, 'mercury', Vec3(   0,0,0), false),
	venus   : new Planet(universe,   9,   'venus', Vec3(  20,0,0), false),
	earth   : new Planet(universe,  10,   'earth', Vec3(  50,0,0), false),
	mars    : new Planet(universe,   5,    'mars', Vec3(  80,0,0), false),
	jupiter : new Planet(universe, 112, 'jupiter', Vec3( 240,0,0), false),
    saturn  : new Planet(universe,  90,  'saturn', Vec3( 600,0,0),  true),
    uranus  : new Planet(universe,  40,  'uranus', Vec3( 930,0,0),  true),
	neptune : new Planet(universe,  38, 'neptune', Vec3(1080,0,0), false),
	pluto   : new Planet(universe,   2,   'pluto', Vec3(1160,0,0), false)
};

const stars = {
    sun : new Star(universe, 500)
};

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = FAR/8;

scene.add(camera);
