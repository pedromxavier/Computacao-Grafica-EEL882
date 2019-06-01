// OBJECTS.JS

function Vec2(x, y){
    return new THREE.Vector2(x, y);
}

function Vec3(x, y, z){
    return new THREE.Vector3(x, y, z);
}

function Quat4(x, y, z, w){
    return new THREE.Quaternion(x, y, z, w);
}

class Universe{
	constructor(far, name){
        this.far = far;

        this.audio = new THREE.Audio(listener);

        this.source = audios[name];
		this.source.loop = true;

        this.cage_source = cage_audios[name];
		this.cage_source.loop = true;

        this.group = new THREE.Group;
		this.bodies = [];

		this.cage = false;

        this.wrapping = new WrappingSphere(1.0);
        this.wrapping.body = this;

        this.pos = this.group.position;
		this.rot = this.group.quaternion;

        this.audio.setMediaElementSource(this.source);
        this.audio.setMediaElementSource(this.cage_source);

        this.source.play();
	}

	add(body){
		this.bodies.push(body);
		scene.add(body.mesh);
	}

	mkgroup(){
		this.pos.copy(this.get_center());
		this.rot.copy(Quat4());

		for(let i=0;i<this.bodies.length;i++){
			let obj = this.bodies[i]
			obj.pos.sub(this.pos);
			scene.remove(obj.mesh);
			this.group.add(obj.mesh);
		}
		scene.add(this.group);
	}

	ungroup(){
		for(let i=0;i<this.bodies.length;i++){
			let pos = Vec3();
			let rot = Quat4();

			let obj = this.bodies[i];

			obj.mesh.getWorldQuaternion(rot);
			obj.mesh.getWorldPosition(pos);

			this.group.remove(obj.mesh);
			scene.add(obj.mesh);

			obj.pos.copy(pos);
			obj.rot.copy(rot);
		}
		scene.remove(this.group);
	}

    mouse_xyz(x, y){ // screen coordinates
        let dx = (x - this.pos.x);
        let dy = (y - this.pos.y);
        let dz = 0;
        let dr = (this.wrapping.r);

        let dx2 = dx*dx;
        let dy2 = dy*dy;
        let dr2 = dr*dr;
        let dw2 = dx2 + dy2;

        if (dw2 > dr2){
            let a = dr / Math.sqrt(dw2);
            dx *= a;
            dy *= a;
        } else{
            dz = Math.sqrt(dr2 - dw2);
        }

        let z = this.pos.z + dz;
        let v = Vec3(x, y, z);
        return v;
    }

    umouse_xyz(x, y){ // unitary vector from planet center to surface
        let v = this.mouse_xyz(x, y);
        v.sub(this.pos);
        v.normalize();
        return v;
    }

	update(){
        let i;
		for(i=0;i<this.bodies.length;i++){
			this.bodies[i].update();
		}
    }

    // ROTATING YEAHH
    rgrab(x, y){
		this.mkgroup();
		this.wrap();
        this.hook = this.umouse_xyz(x, y);
        this.ghost = Quat4().copy(this.rot);
    }

	rungrab(){
		this.unwrap();
		this.ungroup();
		this.update();
	}

    rotateto(x, y){
        let u = this.hook;
        let v = this.umouse_xyz(x, y);
		let q = Quat4().setFromUnitVectors(u, v);
        this.rot.copy(this.ghost);
        this.rot.premultiply(q);
    }


    wrap(){
      this.wrapping.setpos(this.pos);
      this.wrapping.setr(this.get_sphere_radius());
  	  this.group.add(this.wrapping.mesh);
    }

    unwrap(){
  	  this.group.remove(this.wrapping.mesh);
    }
    // ROTATING YEAHH

	change_texture(){
		this.cage = !this.cage;
		let i;
		for(i=0;i<this.bodies.length;i++){
			this.bodies[i].change_texture(this.cage);
		}

        if (this.cage){
            this.source.pause();
            this.cage_source.play();
        }
        else{
            this.cage_source.pause();
            this.source.play();
        }
	}

	get_center(){
		let x = Vec3(0,0,0);
		let pos = Vec3();
		for(let i=0;i<this.bodies.length;i++){
			let obj = this.bodies[i];
			obj.mesh.getWorldPosition(pos);
			x.add(pos);
		}
		x.divideScalar(this.bodies.length);
		return x;
	}

	get_sphere_radius(){
		let i;
		let R = 0;
		for(i=0;i<this.bodies.length;i++){
			let r = (this.pos.distanceTo(this.bodies[i].pos) + this.bodies[i].wr);
			if (r > R){
				R = r;
			}
		}
		return R;
	}
}

class WrappingSphere{
	constructor(r){
		this.r = r;
		this.geometry = new THREE.SphereGeometry(this.r, SPHERE_DIVS, SPHERE_DIVS);
		this.material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0x777777})
		this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.pos = this.mesh.position;
	}

	setpos(pos){
		this.pos.copy(pos);
	}

    setr(r){
        let s = r/this.r;
        this.mesh.scale.x *= s;
        this.mesh.scale.y *= s;
        this.mesh.scale.z *= s;
        this.r = r;
    }
}

class Ring{
	constructor(inner, outer, name){
		this.texture = ring_textures[name];

		this.texture.wrapS = THREE.MirroredRepeatWrapping //U
		this.texture.wrapT = THREE.MirroredRepeatWrapping //V
		this.texture.repeat.set(1, 2);

		this.cage_texture = cage_textures['rings'];

		this.cage_texture.wrapS = THREE.MirroredRepeatWrapping //U
		this.cage_texture.wrapT = THREE.MirroredRepeatWrapping //V
		this.cage_texture.repeat.set(1, 2);

		this.inner = inner;
		this.outer = outer;

		this.r = (inner + outer) / 2;
		this.width = outer - inner;

		this.geometry = new THREE.TorusGeometry(this.r, this.width/2, 2, 2*RING_DIVS);

		this.material = new THREE.MeshBasicMaterial({map: this.texture});
		this.material.side = THREE.DoubleSide;

		this.mesh = new THREE.Mesh(this.geometry, this.material);

		this.mesh.rotation.x = Math.PI/2;
	}

	change_texture(cage){
  	  if (cage){
  		  this.material.map = this.cage_texture;
  	  }
  	  else{
  		  this.material.map = this.texture;
  	  }
    }
}

class Planet{
	constructor(universe, r, name, pos=null, ring=null){
		this.universe = universe;

    	this.r = r;

		this.spin = 0; //0.01/tau;

		this.ring = ring;

    	this.texture = textures[name];
		this.cage_texture = cage_textures[name];

		this.geometry = new THREE.SphereGeometry(this.r, SPHERE_DIVS, SPHERE_DIVS)

		if(name == 'earth'){
			this.geometry.applyMatrix(new THREE.Matrix4().makeScale( 1.0, 1.0, 0.05));
		}

		this.material = new THREE.MeshBasicMaterial({map: this.texture});
		this.material.needsUpdate = true;

		this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.mesh.body = this;

        this.pos = this.mesh.position;
		this.rot = this.mesh.quaternion;

        this.quat = Quat4(1,0,0,0);

		if (pos !== null) this.translateV3(pos);

		if (this.ring){
			this.ring = rings[name];
            this.ring.mesh.body = this;
			this.mesh.add(this.ring.mesh);
			this.wr = this.ring.outer;
		}
		else{
			this.ring = null;
			this.wr = this.r;
		}

		// this.mesh.rotation.x = lean

		this.wrapping = new WrappingSphere(this.wr*1.1);

		scene.add(this.mesh);

        this.universe.add(this);

        this.translateV3(Vec3(-600, 0, 0));
  }

	update(){
      // oops
	}

	globalpos(){
		let pos = Vec3();
		this.mesh.getWorldPosition(pos);
		return pos;
	}


	mouse_xyz(x, y){ // screen coordinates
		let pos = this.globalpos();

		let dx = (x - pos.x);
		let dy = (y - pos.y);
		let dz = 0;
		let dr = (this.r);

		let dx2 = dx*dx;
		let dy2 = dy*dy;
		let dr2 = dr*dr;
		let dw2 = dx2 + dy2;

		if (dw2 > dr2){
		  let a = dr / Math.sqrt(dw2);
		  dx *= a;
		  dy *= a;
		} else{
		  dz = Math.sqrt(dr2 - dw2);
		}

		let z = pos.z + dz;
		let v = Vec3(x, y, z);
		return v;
	}

	umouse_xyz(x, y){ // unitary vector from planet center to surface
		let pos = this.globalpos();

		let v = this.mouse_xyz(x, y);
		v.sub(pos);
		v.normalize();
		return v;
	}


	grab(x, y){
	  this.hook = this.mouse_xyz(x, y);
	  this.ghost = this.globalpos();
	}

	ungrab(){
	}

	moveto(x, y){
	  let v = this.mouse_xyz(x, y);
	  let w = Vec3(x - this.hook.x, y - this.hook.y, 0);
	  this.pos.addVectors(this.ghost, w);
	}



	rgrab(x, y){
		this.wrap();
		this.hook = this.umouse_xyz(x, y);
		this.ghost = Quat4().copy(this.mesh.quaternion);
	}

	rungrab(){
		this.unwrap();
	}

	rotateto(x, y){
	  let u = this.hook;
	  let v = this.umouse_xyz(x, y);
	  this.quat.setFromUnitVectors(u, v);
	  this.mesh.quaternion.copy(this.ghost);
	  this.mesh.quaternion.premultiply(this.quat);
	}

	wrap(){
	  this.mesh.add(this.wrapping.mesh);
	}

	unwrap(){
	  this.mesh.remove(this.wrapping.mesh);
	}

	change_texture(cage){
	  if (cage){
		  this.material.map = this.cage_texture;
	  }
	  else{
		  this.material.map = this.texture;
	  }

	  if(this.ring !== null){
		  this.ring.change_texture(cage);
	  }
	}

	translateV3(v){
	  this.pos.add(v);
	}

	translateV2(v){
	  this.pos.add(Vec3(v.x, v.y, 0));
	}
}


// LOADER.JS

var scene = new THREE.Scene();

var width = window.innerWidth;
var height = window.innerHeight;

const NEAR = 0;
const FAR = 10000;

var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, NEAR, FAR);

var loader = new THREE.TextureLoader();

var raycaster = new THREE.Raycaster();

var listener = new THREE.AudioListener();

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const SPHERE_DIVS = 32;
const RING_DIVS = 32;

var INTERSECTED = null;
var GRABBED     = null;
var RGRABBED    = null;

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

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2000;

scene.add(camera);

// EVENTS.JS

document.addEventListener('keydown', Keyboard, false);
document.addEventListener('mousedown', MouseDown, false);
document.addEventListener('mouseup', MouseUp, false);
document.addEventListener('wheel', Wheel, false);
document.addEventListener('mousemove', MouseMove, false );

document.addEventListener('contextmenu', function(event){event.preventDefault();}, false );

window.addEventListener('resize', Resize, false );


const MAXZOOM = 1E+3;
const MINZOOM = 1E-3;

var mouse = new THREE.Vector2();
var last_mouse = new THREE.Vector2();

var mouse_delta = new THREE.Vector2();

function mouse_coords(x, y){
	let w = width;
	let h = height;

	let m = Vec2(x - (w/2), -(y - (h/2)));
	m.x /= camera.zoom;
	m.y /= camera.zoom;
	return m;
}

function Wheel(event){
	let zoom = (camera.zoom / (2 ** (event.deltaY/30.0)));
	if (zoom <= MAXZOOM && zoom >= MINZOOM){
		camera.zoom = zoom;
		camera.updateProjectionMatrix();
	}
}

function Keyboard(event){
	switch(event.key){
		case " ":
			universe.change_texture();
			break;
		default:
			break;
	}
}

function MouseDown(event){
    let m = mouse_coords(event.clientX, event.clientY);
	switch(event.buttons){
        case 1:
            if (INTERSECTED){
                GRABBED = INTERSECTED.body;
                GRABBED.grab(m.x, m.y);
            }
            break;
        case 2:
			if (INTERSECTED){
				RGRABBED = INTERSECTED.body;
			}
			else{
				RGRABBED = universe;
			}
			RGRABBED.rgrab(m.x, m.y);
            break;
    }
}

function MouseUp(event){
    switch(event.buttons){
        case 0:
			if (GRABBED){
				GRABBED.ungrab();
            	GRABBED = null;
			}
			else if (RGRABBED){
				RGRABBED.rungrab();
				RGRABBED = null;
			}
            break;
    }
}

function MouseMove(event){
    event.preventDefault();

    mouse.x =   ( event.clientX / width  ) * 2 - 1;
	mouse.y = - ( event.clientY / height ) * 2 + 1;

	let m = mouse_coords(event.clientX, event.clientY);

    if(GRABBED){
        // Move grabbed
        GRABBED.moveto(m.x, m.y);
    }
	else if (RGRABBED){
		RGRABBED.rotateto(m.x, m.y);
	}
}

function Resize(event){
	width = window.innerWidth;
	height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

}

// SCRIPT.JS

function find_intersections(){
	raycaster.setFromCamera(mouse, camera);
	let intersects = raycaster.intersectObjects(scene.children);

	if (intersects.length > 0) {
		let obj = intersects[0].object;
		if (INTERSECTED != obj) {
			INTERSECTED = obj;
		}
	} else {
		INTERSECTED = null;
	}
}

function animate() {
	requestAnimationFrame(animate);

	find_intersections();

	render();
}

function render(){
	renderer.clear();
	renderer.render(scene, camera);
}

animate();
