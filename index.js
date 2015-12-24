function createScene3d(domElement) {
	return {
		camera: undefined,
		scene: undefined,
		renderer: undefined,
		controls: undefined,
		mouse: new THREE.Vector2(),

		currGraphs: [],

		getOX: function() { // RED
			var material = new THREE.LineBasicMaterial({
				color: 0xff0000
			});
			var geometry = new THREE.Geometry();
			geometry.vertices.push(new THREE.Vector3(0, 0, 0));
			geometry.vertices.push(new THREE.Vector3(1000, 0, 0));
			return new THREE.Line(geometry, material);
		},
		getOY: function() { // GREEN
			var material = new THREE.LineBasicMaterial({
				color: 0x00ff00
			});
			var geometry = new THREE.Geometry();
			geometry.vertices.push(new THREE.Vector3(0, 0, 0));
			geometry.vertices.push(new THREE.Vector3(0, 1000, 0));
			return new THREE.Line(geometry, material);
		},
		getOZ: function() { // BLUE
			var material = new THREE.LineBasicMaterial({
				color: 0x0000ff
			});
			var geometry = new THREE.Geometry();
			geometry.vertices.push(new THREE.Vector3(0, 0, 0));
			geometry.vertices.push(new THREE.Vector3(0, 0, 1000));
			return new THREE.Line(geometry, material);
		},

		init: function() {
			this.renderer = new THREE.WebGLRenderer();
			this.renderer.setSize(800, 600);
			this.renderer.setClearColor( 0xffffff );
			domElement.appendChild(this.renderer.domElement);
			this.camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000);
			this.camera.position.set(1000, 1000, 1000);
			this.camera.lookAt(new THREE.Vector3(0, 0, 0));
			this.scene = new THREE.Scene();
			animate();
			controls = new THREE.OrbitControls(this.camera, this.renderer.domElement );
			controls.minDistance = 100;
			controls.maxDistance = 10000;
			this.scene.add(this.getOX());
			this.scene.add(this.getOY());
			this.scene.add(this.getOZ());

			this.render();
		},

		addGraph: function(points, color, toZero) {
			var material = new THREE.LineBasicMaterial({
				color: color
			});
			var geometry = new THREE.Geometry();
			for(var i = 0; i < points.length; i++) {
				var x = 1, y = 1, z = 1;
				switch(toZero) {
					case 'X': x = 0; break;
					case 'Y': y = 0; break;
					case 'Z': z = 0; break;
				}
				var v = new THREE.Vector3(points[i].x * x, points[i].y * y, points[i].z * z);
				geometry.vertices.push(v);
			}
			var line = new THREE.Line(geometry, material);
			this.currGraphs.push(line);
			this.scene.add(line);
		},

		removeGraphs: function() {
			for(var i = 0; i < this.currGraphs.length; i++) {
				this.scene.remove(this.currGraphs[i]);
			}
			this.currGraphs = [];
		},

		render: function() {
			this.renderer.clear();
			this.renderer.render(this.scene, this.camera);
		},
	};
}
var Scene3d = createScene3d(document.getElementById('scene3d'));
Scene3d.init();

function animate() {
	requestAnimationFrame(animate);
	Scene3d.render();
}
// GET PARAMETERS
var Parameters = {
	s: 1,
	r: 150,
	b: 1,

	read: function() {
		this.s = parseFloat(document.getElementById('inputS').value);
		this.r = parseFloat(document.getElementById('inputR').value);
		this.b = parseFloat(document.getElementById('inputB').value);
	}
};
var begin = {
	x: 13,
	y: 13,
	z: 33,

	read: function() {
		this.x = parseFloat(document.getElementById('inputX0').value);
		this.y = parseFloat(document.getElementById('inputY0').value);
		this.z = parseFloat(document.getElementById('inputZ0').value);
	}
};
var Time = {
	tmax: 10,
	h: 0.01,

	read: function() {
		this.tmax = parseFloat(document.getElementById('inputTMax').value);
		this.h = parseFloat(document.getElementById('inputH').value);
	}
};
// ЯМЕ

function YaME(params, begin, tmax, h) {
	function last(arr) {
		return arr[arr.length - 1];
	}
	var points = [];
	points.push({
		x: begin.x,
		y: begin.y,
		z: begin.z
	});

	for(var t = h; t < tmax; t += h) {
		var l = last(points);
		var p = {
			x: l.x + h * params.s * (l.y - l.x),
			y: l.y + h * (params.r * l.x - l.y - l.x * l.z),
			z: l.z + h * (-params.b * l.z + l.x * l.y)
		}
		points.push(p);
	}
	return points;
}

// EVENTS
document.getElementById('buttonBuild').addEventListener('click', function(event) {
	Scene3d.removeGraphs();

	Parameters.read();
	begin.read();
	Time.read();
	var points = YaME(Parameters, begin, Time.tmax, Time.h);

	if(document.getElementById('checkboxXY').checked) {
		Scene3d.addGraph(points, 0xffff00, 'Z');
	}
	if(document.getElementById('checkboxXZ').checked) {
		Scene3d.addGraph(points, 0xff00ff, 'Y');
	}
	if(document.getElementById('checkboxYZ').checked) {
		Scene3d.addGraph(points, 0x00ffff, 'X');
	}
	if(document.getElementById('checkboxXYZ').checked) {
		Scene3d.addGraph(points, 0x000000);
	}
	Scene3d.render();
});
