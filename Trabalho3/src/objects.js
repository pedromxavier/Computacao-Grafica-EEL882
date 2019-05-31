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

        // this.texture = textures[name];
        // this.cage_texture = cage_textures[name];

        // this.geometry = new THREE.SphereGeometry(this.r, 2*SPHERE_DIVS, 2*SPHERE_DIVS);
        // this.material = new THREE.MeshBasicMaterial({map: this.texture});
        // this.material.side = THREE.BackSide;

        this.quat = Quat4(1,0,0,0);

        this.wrapping = new WrappingSphere(1.0);
        this.wrapping.body = this;

        this.pos = this.wrapping.position;

        scene.add(this.group);

        this.audio.setMediaElementSource(this.source);
        this.audio.setMediaElementSource(this.cage_source);

        this.source.play();
	}

	add(body){
        this.bodies.push(body);
        this.group.add(body.mesh);
	}

	update(){
        let i;
		for(i=0;i<this.bodies.length;i++){
			this.bodies[i].update();
		}
    }

    mouse_xyz(x, y){ // mouse over surface
        let pos = this.wrapping.position;

        let dx = (x - pos.x);
        let dy = (y - pos.y);
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
        let v = Vec3(dx, dy, dz);
        v.normalize();
        return v;
    }

    // ROTATING YEAHH
    rgrab(x, y){
        this.hook = this.mouse_xyz(x, y);
        this.ghost = Quat4().copy(this.group.quaternion);
    }

    rotateto(x, y){
        let u = this.hook;
        let v = this.mouse_xyz(x, y);
        this.quat.setFromUnitVectors(u, v);
        this.group.quaternion.copy(this.ghost);
        this.group.quaternion.premultiply(this.quat);
    }

    wrap(){
      this.wrapping.position = this.get_center();
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
		let i; let x = Vec3(0,0,0);
		for(i=0;i<this.bodies.length;i++){
			x.add(this.bodies[i].pos);
		}
		x.divideScalar(this.bodies.length);
		return x;
	}

	get_sphere_radius(){
		let i; let x = this.get_center();
		let R = 0;
		for(i=0;i<this.bodies.length;i++){
			let r = x.distanceTo(this.bodies[i].pos) + this.bodies[i].r;
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

		this.mesh.rotation.x = PI/2;
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
	constructor(universe, r, name, pos=null, tau=1, ring=null, lean=0.1){
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
		this.wr *= 1.1;

		// this.mesh.rotation.x = lean

		this.wrapping = new WrappingSphere(this.wr);

        this.universe.add(this);
  }

  update(){
      // oops
  }

  mouse_xyz(x, y){ // mouse over surface
      // console.log(`x = ${x} (${this.pos.x})`);
      // console.log(`y = ${y} (${this.pos.y})`);
      let dx = (x - this.pos.x);
      let dy = (y - this.pos.y);
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
      let v = Vec3(dx, dy, dz);
      console.log(v.x, v.y, v.z);
      v.normalize();
      return v;
  }

  grab(x, y){
      this.hook = Vec3(x, y, 0);
      this.ghost = Vec3(this.pos.x, this.pos.y, this.pos.z);
  }

  moveto(x, y){
      let dp = Vec3(x - this.hook.x, y - this.hook.y, 0);
      this.pos.addVectors(this.ghost, dp);
  }

  rgrab(x, y){
      this.hook = this.mouse_xyz(x, y);
      this.ghost = Quat4().copy(this.mesh.quaternion);
  }

  rotateto(x, y){
      let u = this.hook;
      let v = this.mouse_xyz(x, y);
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
