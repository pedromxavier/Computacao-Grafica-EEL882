var INTERSECTED = null;
var GRABBED = null;
var RGRABBED = null;

function animate() {
	requestAnimationFrame(animate);

	// find intersections
	raycaster.setFromCamera( mouse, camera );
	let intersects = raycaster.intersectObjects(universe.group.children);

	if ( intersects.length > 0 ) {
		if ( INTERSECTED != intersects[ 0 ].object) {
			INTERSECTED = intersects[ 0 ].object;
		}
	} else {
		INTERSECTED = null;
	}
	render();
}

function render(){
	renderer.clear();
	renderer.render( scene, camera );
}

animate();
