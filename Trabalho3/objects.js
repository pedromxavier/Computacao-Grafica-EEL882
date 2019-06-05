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
        this.stars  = [];

		this.cage = false;

        this.wrapping = new WrappingSphere(1.0);
        this.wrapping.body = this;

        this.pos = this.group.position;
		this.rot = this.group.quaternion;

        this.audio.setMediaElementSource(this.source);
        this.audio.setMediaElementSource(this.cage_source);

        this.source.play();
	}

    update(){
		for(let i=0;i<this.bodies.length;i++){
			this.bodies[i].update();
		}

        for(let j=0;j<this.stars.length;j++){
			this.stars[j].update();
		}
    }

    globalpos(){
		let pos = Vec3();
		this.group.getWorldPosition(pos);
		return pos;
	}

    globalrot(){
		let rot = Quat4();
		this.group.getWorldQuaternion(rot);
		return rot;
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

    addstar(star){
        this.stars.push(star);
        scene.add(star.light);
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
			let obj = this.bodies[i];

            let pos = obj.globalpos();
			let rot = obj.globalrot();

			this.group.remove(obj.mesh);
			scene.add(obj.mesh);

			obj.pos.copy(pos);
			obj.rot.copy(rot);
		}
		scene.remove(this.group);
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
	}

    rotateto(x, y){
        let u = this.hook;
        let v = this.umouse_xyz(x, y);
		let q = Quat4().setFromUnitVectors(u, v);
        this.rot.copy(this.ghost);
        this.rot.premultiply(q);
    }


    wrap(){
        this.wrapping.setpos(this.get_center());
        this.wrapping.setr(this.get_sphere_radius()*1.1);

        scene.add(this.wrapping.mesh);
    }

    unwrap(){
        scene.remove(this.wrapping.mesh);
    }
    // ROTATING YEAHH

	change_texture(){
		this.cage = !this.cage;

		for(let i=0;i<this.bodies.length;i++){
			this.bodies[i].change_texture(this.cage);
		}

        for(let j=0;j<this.stars.length;j++){
			this.stars[j].change_texture(this.cage);
		}

        this.wrapping.change_texture(this.cage);

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
		for(let i=0;i<this.bodies.length;i++){
			x.add(this.bodies[i].globalpos());
		}
		x.divideScalar(this.bodies.length);
		return x;
	}

	get_sphere_radius(){
		let R = 0;
        let x = this.get_center();
		for(let i=0;i<this.bodies.length;i++){
			let r = (x.distanceTo(this.bodies[i].globalpos()) + this.bodies[i].wr);
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

        this.rgeometry = new THREE.SphereGeometry(this.r/10, SPHERE_DIVS, SPHERE_DIVS);
		this.rmaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
		this.rmesh = new THREE.Mesh(this.rgeometry, this.rmaterial);
	}

    change_texture(cage){
        if (cage){
            this.mesh.add(this.rmesh);
        } else{
            this.mesh.remove(this.rmesh);
        }
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

		this.material = new THREE.MeshStandardMaterial({
            map: this.texture,
            metalness: 0.05
        });
		this.material.side = THREE.DoubleSide;

		this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;

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

class Star{
    constructor(universe, r, steps=2400){
        this.STEPS = steps;


        this.universe = universe;
        this.r = r;

        this.color = 0xffffee;

        this.light = new THREE.PointLight(0xffffee, 1, 0, 0.1);
        // this.castShadow = true;

        this.geometry = new THREE.SphereGeometry(this.r, SPHERE_DIVS, SPHERE_DIVS);
		this.material = new THREE.MeshStandardMaterial({
					emissive: 0xffffee,
					emissiveIntensity: 1,
                    color: 0x000000
				});
		this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.light.add(this.mesh);

        this.randpos();
        this.randvel();

        this.universe.addstar(this);
    }

    change_texture(cage){

    }

    move(){
        this.rho += this.vrho;
        this.setpos();
    }

    update(){
        this.move();
    }

    randvel(){
        this.vrho = (TAU*Math.random())/this.STEPS;
    }

    setpos(){
        let x = this.far*Math.cos(this.rho);
        let z = this.far*Math.sin(this.rho);

        this.light.position.set(x, 0, z);
    }

    randpos(){
        this.far = this.universe.far/2;
        this.rho = TAU*Math.random();

        this.setpos();
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

		this.material = new THREE.MeshStandardMaterial({
            map: this.texture,
            metalness: 0.05
        });
		this.material.needsUpdate = true;

		this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.receiveShadow = true;
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

    globalrot(){
        let rot = Quat4();
        this.mesh.getWorldQuaternion(rot);
        return rot;
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
	  let q = Quat4().setFromUnitVectors(u, v);
	  this.mesh.quaternion.copy(this.ghost);
	  this.mesh.quaternion.premultiply(q);
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
