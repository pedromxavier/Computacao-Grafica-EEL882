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
