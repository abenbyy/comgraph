import * as THREE from "./three/build/three.module.js";
import {OrbitControls} from "./three/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "./three/examples/jsm/loaders/GLTFLoader.js";

var activeCamera;
var camera, camera2, scene, renderer;
var plane, sun;
var mouse, raycaster, isShiftDown = false;
var controls;
var skyBox

var useSkyBox = true;
var useModel = true;


var rollOverMesh, rollOverMaterial;
var cubeGeo, cubeMaterial;

var objects = [];

init();
render();

function init() {
    alert('Click to place\nShift + Click to delete\nSpace to toggle camera');
    alert('Kalau mau coba liat light lebih enak, matiin skybox dan 3D model aja di app.js line 12 & 13')

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 1000, 800, 1300 );
    camera.lookAt( 0, 0, 0 );

    camera2 = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera2.position.set( 0, 1300, 0 );
    camera2.lookAt( 0, 0, 0 );

    activeCamera = camera;
    

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000 );


    var rollOverGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
    rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
    rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    scene.add( rollOverMesh );

    cubeGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
    var cubeTexture = [
        new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('./images/img4.png'), side: THREE.DoubleSide}),
        new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('./images/img4.png'), side: THREE.DoubleSide}),
        new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('./images/img2.png'), side: THREE.DoubleSide}),
        new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('./images/img10.png'), side: THREE.DoubleSide}),
        new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('./images/img4.png'), side: THREE.DoubleSide}),
        new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('./images/img4.png'), side: THREE.DoubleSide}),

    ]
    cubeMaterial = new THREE.MeshFaceMaterial(cubeTexture)


    var gridHelper = new THREE.GridHelper( 1000, 20 );
    scene.add( gridHelper );


    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    var geometry = new THREE.PlaneGeometry( 1000, 1000 );
    geometry.rotateX( - Math.PI / 2 );

    plane = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
    plane.receiveShadow = true;
    scene.add(plane);
    objects.push( plane );

    geometry = new THREE.SphereGeometry(50, 10, 10);
    let material = new THREE.MeshLambertMaterial({
        color: 0xf9d71c,
    });
    sun = new THREE.Mesh(geometry, material);
    sun.position.set(0,800,0);
    scene.add(sun)

    


    var ambientLight = new THREE.AmbientLight( 0xFFFD00 );
    ambientLight.intensity = 0.1;
    ambientLight.position.set(0, 800, 0);
    //ambientLight.add(sun)
    scene.add( ambientLight );

    var pointLight = new THREE.PointLight( 0xffffff );
    let pointHelper = new THREE.PointLightHelper(pointLight);
    pointLight.add(pointHelper);
    pointLight.distance = 1000;
    pointLight.intensity = 2;
    pointLight.position.set( 0, 100, 0 );
    pointLight.castShadow = true;
    scene.add( pointLight );


    let loader = new THREE.TextureLoader();
    let textures = [
        loader.load('./images/px.png'),
        loader.load('./images/nx.png'),
        loader.load('./images/py.png'),
        loader.load('./images/ny.png'),
        loader.load('./images/pz.png'),
        loader.load('./images/nz.png'),
    ];

    

    if(useSkyBox){
        geometry = new THREE.BoxGeometry(1000, 1000, 1000);
    
        material = [];
        textures.forEach(texture => {
            material.push(new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide,
            }));
        });
        skyBox = new THREE.Mesh(geometry, material);
        skyBox.position.set(0,500,0);
        skyBox.receiveShadow = true;
        
        scene.add(skyBox); 
    }

    if(useModel){
        loader = new GLTFLoader();
        loader.loadAsync('./models/scene.gltf')
            .then(gltf => {
                console.log(gltf.scene)
                gltf.scene.scale.set(8, 8, 8);
                gltf.scene.castShadow = true;
                gltf.scene.receiveShadow = true;
                scene.add(gltf.scene);
                
        })
    }

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;

    controls = new OrbitControls(activeCamera, renderer.domElement);

    document.body.appendChild( renderer.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'keyup', onDocumentKeyUp, false );

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    raycaster.setFromCamera( mouse, activeCamera );
    var intersects = raycaster.intersectObjects( objects );
    if ( intersects.length > 0 ) {
        var intersect = intersects[0];
        rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
        rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    }

    render();

}

function onDocumentMouseDown( event ) {
    event.preventDefault();
    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    raycaster.setFromCamera( mouse, activeCamera );
    var intersects = raycaster.intersectObjects( objects );
    if ( intersects.length > 0 ) {
        var intersect = intersects[0];
        if ( isShiftDown ) {
            if ( intersect.object !== plane ) {
                scene.remove( intersect.object );
                objects.splice( objects.indexOf( intersect.object ), 1 );

            }
        } else {
            var bitcube = new THREE.Mesh( cubeGeo, cubeMaterial );
            bitcube.position.copy( intersect.point ).add( intersect.face.normal );
            bitcube.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
            bitcube.receiveShadow = true;
            bitcube.castShadow = true;
            scene.add( bitcube );

            objects.push( bitcube );
        }

        render();
    }

}

function changeCamera(){
    if(activeCamera == camera){
        activeCamera = camera2;
        controls.object = null;
    }else if(activeCamera == camera2){
        activeCamera = camera;
        controls.object = camera;
    }
}

function onDocumentKeyDown( event ) {
    switch ( event.keyCode ) {
        case 16: isShiftDown = true; break;
        case 32: changeCamera(); break;
    }

}

function onDocumentKeyUp( event ) {
    switch ( event.keyCode ) {
        case 16: isShiftDown = false; break;
    }

}

function render() {
    renderer.render( scene, activeCamera );
}