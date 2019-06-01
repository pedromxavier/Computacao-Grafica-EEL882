document.addEventListener('keydown', Keyboard, false);
document.addEventListener('mousedown', MouseDown, false);
document.addEventListener('mouseup', MouseUp, false);
document.addEventListener('wheel', Wheel, false);
document.addEventListener('mousemove', MouseMove, false );

document.addEventListener('contextmenu', function(event){event.preventDefault();}, false );

// window.addEventListener('resize', Resize, false );


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
	if (zoom <= 1E+12 && zoom >= 1E-12){
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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
	width = window.innerWidth;
	height = window.innerHeight;
}
