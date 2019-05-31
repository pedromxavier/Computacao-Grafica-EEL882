var scene = new THREE.Scene();

var width = window.innerWidth;
var height = window.innerHeight;

const NEAR = 0;
const FAR = 10000;

// var camera = new THREE.PerspectiveCamera( 75, width / height, 1, 10000 );

var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, NEAR, FAR);

var loader = new THREE.TextureLoader();

var raycaster = new THREE.Raycaster();

var listener = new THREE.AudioListener();

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);

const SPHERE_DIVS = 32;
const RING_DIVS = 32;
const G = 6.674083E-11;
const PI = 3.141592653;

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
    saturn : new Ring(140, 202, 'saturn'),
    uranus : new Ring( 42,  70, 'uranus')
};

const planets = {
    mercury : new Planet(universe,   4, 'mercury', Vec3(   0,0,0),  58.60, false, 0.2),
	venus   : new Planet(universe,   9, 'venus',   Vec3(  20,0,0), 243.00, false, 0.2),
	earth   : new Planet(universe,  10, 'earth',   Vec3(  50,0,0),   0.99, false, 0.2),
	mars    : new Planet(universe,   5, 'mars',    Vec3(  80,0,0),   1.03, false, 0.2),
	jupiter : new Planet(universe, 112, 'jupiter', Vec3( 240,0,0),   0.41, false, 0.2),
    saturn  : new Planet(universe,  90, 'saturn',  Vec3( 600,0,0),   0.45,  true, 0.2),
    uranus  : new Planet(universe,  40, 'uranus',  Vec3( 930,0,0),   0.72,  true, 0.2),
	neptune : new Planet(universe,  38, 'neptune', Vec3(1080,0,0),   0.67, false, 0.2),
	pluto   : new Planet(universe,   2, 'pluto',   Vec3(1160,0,0),   6.39, false, 0.2)
};

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 1000;

scene.add(camera);
