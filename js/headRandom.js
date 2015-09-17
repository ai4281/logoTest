var container;

var camera, scene, renderer;
var camAngle = 0;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var mouseX = 0, mouseY = 0, mouseXRatio = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var headMesh;
var headMeshGroup = new THREE.Object3D();
var logoPointMeshGroup = new THREE.Object3D();
var lineMeshGroup = new THREE.Object3D();
var lineMeshGroup2 = new THREE.Object3D();
var linkPlanets = new THREE.Object3D();
var texts = new THREE.Object3D();

var origPositionArray = [];
var glitchPositionArray = [];
var vectorPosArray = [];

var shuffle = false;

var scale = 10;
var logoX = 0, 
	logoY = 0, 
	logoZ = 0;

init();


function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.z = 100;

	// scene

	scene = new THREE.Scene();

	// var ambient = new THREE.AmbientLight( 0x303030 );
	// scene.add( ambient );

	// var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	// directionalLight.position.set( 0, 1, 0.5 );
	// scene.add( directionalLight );

	// texture

	

	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {

		console.log( item, loaded, total );
		initHeadMesh();

	};

	var texture = new THREE.Texture();

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}

		console.log("loading");
	};

	var onError = function ( xhr ) {
		console.log("error");
	};

	// model

	var loader = new THREE.OBJLoader( manager );
	loader.load( 'obj/nut2.obj', function ( object ) {

		object.scale.set (15, 15, 15);
		object.name = "head";
		//console.log(object.children[1]);
		headMesh = object.children[0];
		//scene.add( object );

	}, onProgress, onError );

	//

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0x000000);
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'touchstart', onTouchStart, false );
	document.addEventListener( 'touchmove', onTouchMove, false );

	//
	//window.addEventListener( 'onorientationchange', onWindowResize, false );
	window.addEventListener( 'resize', onWindowResize, false );

	
}

function initHeadMesh() {

	var p = headMesh.geometry.attributes.position.array;
	var posSkip = 1;
	var lineSkip = 4;
	var distSkip = 10000000;
	var horizSkip = 1;
	var lineMinDist = 7,
	 	lineMaxDist = 7.5;
	var material = new THREE.MeshBasicMaterial({color: 0xffffff});

	console.log("loading every "+ posSkip/3 +" points");

	for (var e = 0; e < 100; e++)
	{
		var range = 90;

		var x = Math.random() * range - range/2,
			y = Math.random() * range - range/2,
			z = Math.random() * range - range/2;

		var geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
		var mesh = new THREE.Mesh(geo, material);
		mesh.position.set(x, y, z);
		scene.add(mesh);
	}

	for (var a = 0; a < p.length / 3; a += posSkip)
	{
		vectorPosArray.push( new THREE.Vector3( p[a * 3] * scale + logoX, p[a * 3 + 1] * scale + logoY, p[a * 3 + 2] * scale + logoZ) );
	}

	console.log(vectorPosArray.length);

	var distVec = new THREE.Vector3();

	var sameXY = 0;

	for (var b = 0; b < vectorPosArray.length; b+= lineSkip)
	{
		var firstNode = vectorPosArray[b];

		for (var d = 0; d < vectorPosArray.length; d+= horizSkip)
		{
			var secondNode = vectorPosArray[d];

			if (firstNode.x == secondNode.x && firstNode.y == secondNode.y && b != d)
			{

				//if (firstNode.distanceTo(secondNode) < 8 && firstNode.distanceTo(secondNode) > 7)
				{
					sameXY += 1;
					var geometry = new THREE.Geometry();
					var lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});
					geometry.vertices.push( firstNode );
					geometry.vertices.push( secondNode );
					var line = new THREE.Line(geometry, lineMaterial);
					lineMeshGroup.add(line);

					d += vectorPosArray.length;
				}
			}
		}
	}

	for (var f = 0; f < lineMeshGroup.children.length; f+=1)
	{
		var firstNode = lineMeshGroup.children[f].geometry.vertices[0];

		for (var g = 0; g < lineMeshGroup.children.length; g+=1)
		{
			var secondNode = lineMeshGroup.children[g].geometry.vertices[0]

			if (firstNode.distanceTo(secondNode) < 7 && firstNode.distanceTo(secondNode) > 6.3)
			{
				var geometry = new THREE.Geometry();
				var lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});
				geometry.vertices.push(firstNode);
				geometry.vertices.push(secondNode);
				var line = new THREE.Line(geometry, lineMaterial);
				lineMeshGroup2.add(line);
			}
			
		}

		
	}

	console.log(lineMeshGroup2);
	
	console.log("sameXY is " + sameXY);

	scene.add(lineMeshGroup);
	scene.add(lineMeshGroup2);

	var sphereGeo = new THREE.SphereGeometry(1.5, 32, 32);
	
	var link1 = new THREE.Mesh(sphereGeo, material);
	link1.position.set(2, 20, 10);
	link1.name = "contact";
	linkPlanets.add(link1);

	var link2 = new THREE.Mesh(sphereGeo, material);
	link2.position.set(-25, -20, 0);
	link2.name = "pricing";
	linkPlanets.add(link2);

	var link3 = new THREE.Mesh(sphereGeo, material);
	link3.position.set(25, 0, -20);
	link3.name = "portfolio";
	linkPlanets.add(link3);

	var sizeNum = 2;
	var heightNum = 0.2;
	var textX = -5, 
		textY = -5, 
		textZ = 0;

	var link1Geo = new THREE.TextGeometry("contact", {size: sizeNum, height: heightNum, weight:'normal'});
	var link1Mat = new THREE.MeshBasicMaterial({color: 0xffffff});
	var link1TextMesh = new THREE.Mesh(link1Geo, link1Mat);
	link1TextMesh.position.set( link1.position.x + textX, link1.position.y + textY, link1.position.z + textZ );
	texts.add(link1TextMesh);

	var link2Geo = new THREE.TextGeometry("pricing", {size: sizeNum, height: heightNum, weight:'normal'});
	var link2Mat = new THREE.MeshBasicMaterial({color: 0xffffff});
	var link2TextMesh = new THREE.Mesh(link2Geo, link2Mat);
	link2TextMesh.position.set( link2.position.x + textX, link2.position.y + textY, link2.position.z + textZ );
	texts.add(link2TextMesh);

	var link3Geo = new THREE.TextGeometry("portfolio", {size: sizeNum, height: heightNum, weight:'normal'});
	var link3Mat = new THREE.MeshBasicMaterial({color: 0xffffff});
	var link3TextMesh = new THREE.Mesh(link3Geo, link3Mat);
	link3TextMesh.position.set( link3.position.x + textX, link3.position.y + textY, link3.position.z + textZ );
	texts.add(link3TextMesh);

	scene.add(linkPlanets);
	scene.add(texts);

	// headMesh.scale.set(10, 10, 10);
	// headMeshGroup.add(headMesh);

	//scene.add(headMeshGroup);

	animate();

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

	mouseX = ( event.clientX - windowHalfX ) / 2;
	mouseY = ( event.clientY ) / 2;
	mouseXRatio = ( event.clientY / window.innerHeight );

	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	//console.log(mouseY);
}

function onKeyDown( event ) {


}

function onTouchStart(event) {

	shuffle = !shuffle;

	var touch = event.targetTouches[0];

	mouseX = ( touch.pageX - windowHalfX ) / 2;
	mouseY = ( touch.pageY ) / 2;
}

function onTouchMove( event ) {

	event.preventDefault();

	var touch = event.targetTouches[0];

	mouseX = ( touch.pageX - windowHalfX ) / 2;
	mouseY = ( touch.pageY ) / 2;


	//console.log(mouseY);
}

function drawLine() {

	for (var i = 0; i < lineMeshGroup.children.length; i++)
	{
		//if (i % 3 == 2)
		{
			if (Math.random() < mouseXRatio)
			{
				lineMeshGroup.children[i].material.color.setHex(0xffffff);
			}
			else
			{
				lineMeshGroup.children[i].material.color.setHex(0x000000);
			}
			// if (mouseXRatio > 0.95)
			// {
			// 	lineMeshGroup.children[i].material.color.setHex(0xffffff);
			// }
		}		
	}

	for (var i = 0; i < lineMeshGroup2.children.length; i++)
	{
		//if (i % 3 == 2)
		{
			if (Math.random() < mouseXRatio)
			{
				lineMeshGroup2.children[i].material.color.setHex(0xffffff);
			}
			else
			{
				lineMeshGroup2.children[i].material.color.setHex(0x000000);
			}
			// if (mouseXRatio > 0.95)
			// {
			// 	lineMeshGroup2.children[i].material.color.setHex(0xffffff);
			// }
		}		
	}

}

function animate() {
	drawLine();

	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( linkPlanets.children );

	var linkTouched = false;

	for ( var i = 0; i < intersects.length; i++ ) {

		if ( intersects[i].object.name == "contact" || intersects[i].object.name == "pricing" || intersects[i].object.name == "portfolio" )
		{
			linkTouched = true;
			i += intersects.length;
		}
	}

	//console.log(linkTouched);

	for (var ii = 0; ii < texts.children.length; ii++)
	{
		//texts.children[ii].rotation.y = Math.PI - camAngle;

		if (linkTouched)
		{
			texts.children[ii].material.color.setHex(0xffffff);
		}
		else
		{
			texts.children[ii].material.color.setHex(0x000000);
		}

	}


	//headMeshGroup.rotation.y += 0.03;
	requestAnimationFrame( animate );
	render();

}

function render() {

	camAngle += 0.001;
	//camAngle = Math.PI/2;

	camera.position.x = Math.cos(camAngle) * 50;
	camera.position.z = Math.sin(camAngle) * 50;

	camera.lookAt( scene.position );

	renderer.render( scene, camera );

}