document.addEventListener('keydown', Keyboard, false);

// Mouse Events
document.addEventListener('mousedown', MouseDown, false);
document.addEventListener('mouseup', MouseUp, false);
document.addEventListener('wheel', Wheel, false);
document.addEventListener('mousemove', MouseMove, false );

// Touch Events

window.addEventListener('contextmenu', function(event){event.preventDefault();}, false );
window.addEventListener('resize', Resize, false );


const MAXZOOM = 1E+3;
const MINZOOM = 1E-3;
const ZOOMSTEP = 1.1;

var mouse = new THREE.Vector2();
var last_mouse = new THREE.Vector2();

var mouse_delta = new THREE.Vector2();

function toggle_camera(){
	ORTHO = !ORTHO;

	if (ORTHO){
		ortho_camera.position.copy(persp_camera.position);
		ortho_camera.rotation.copy(persp_camera.rotation);
		ortho_camera.zoom = persp_camera.zoom;

		scene.remove(camera);
		camera = ortho_camera;
		scene.add(camera);
	}
	else{
		persp_camera.position.copy(ortho_camera.position);
		persp_camera.rotation.copy(ortho_camera.rotation);
		persp_camera.zoom = ortho_camera.zoom;

		scene.remove(camera);
		camera = persp_camera;
		scene.add(camera);
	}
}

function mouse_coords(x, y){
	let w = width;
	let h = height;

	let m = Vec2(x - (w/2), -(y - (h/2)));
	m.x /= camera.zoom;
	m.y /= camera.zoom;
	return m;
}

function Wheel(event){
	let zoom = camera.zoom;

	if (event.deltaY > 0) {zoom /= ZOOMSTEP;}
	if (event.deltaY < 0) {zoom *= ZOOMSTEP;}

	if (zoom != camera.zoom && (zoom <= MAXZOOM && zoom >= MINZOOM)){
		camera.zoom = zoom;
		camera.updateProjectionMatrix();
	}
}

function Keyboard(event){
	switch(event.key){
		case " ":
			universe.change_texture();
			break;
		case "c":
			toggle_camera();
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

	renderer.setSize(width, height);

if (ORTHO){
	camera.left   = -width/CAM;
	camera.right  =  width/CAM;
	camera.top    =  height/CAM;
	camera.bottom = -height/CAM;
} else{
	camera.aspect = width/height;
}
	camera.updateProjectionMatrix();
}
