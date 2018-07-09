var renderer, scene, camera, controls, info, dataGroup, sphere;
var leftSideThetaStart = Math.PI;
var rightSideThetaStart = 0;
var cylHeight = 2;
var cylSegs = 32;
var maxRad = 100;
var blueColor = 0x0a0dce;
var pinkColor = 0xe5099c;
var yearBracketingAmount = 5; //group by 5 years (0-4, 5-9, 10-14 etc)
var countries;
var years = [	1950,
				1951,
				1952,
				1953,
				1954,
				1955,
				1956,
				1957,
				1958,
				1959,
				1960,
				1961,
				1962,
				1963,
				1964,
				1965,
				1966,
				1967,
				1968,
				1969,
				1970,
				1971,
				1972,
				1973,
				1974,
				1975,
				1976,
				1977,
				1978,
				1979,
				1980,
				1981,
				1982,
				1983,
				1984,
				1985,
				1986,
				1987,
				1988,
				1989,
				1990,
				1991,
				1992,
				1993,
				1994,
				1995,
				1996,
				1997,
				1998,
				1999,
				2000,
				2001,
				2002,
				2003,
				2004,
				2005,
				2006,
				2007,
				2008,
				2009,
				2010,
				2011,
				2012,
				2013,
				2014,
				2015,
				2016,
				2017,
				2018,
				2019,
				2020];
				
getCountries();

function init() {
	// html overlay
	info = document.createElement( 'span' );
	info.style.position = 'absolute';
	info.style.top = '0px';
	info.style.width = '355px';
	info.style.height = '70px';
	info.style.textAlign = 'left';
	info.style.color = '#ffffff';
	info.style.fontWeight = 'bold';
	info.style.backgroundColor = 'transparent';
	info.style.zIndex = '1';

	buildMenu(info);
	document.body.appendChild( info );
	
	// renderer
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x000000 );
	// camera
	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( 0, 0, -250 );
	
	
	dataGroup = new THREE.Group();
		
	//add lighting
    var light = new THREE.PointLight(0x2f3c7f);
    light.position.set(-100,200,100);
    scene.add(light);
	
	controls = new THREE.OrbitControls( camera, renderer.domElement ); 
	controls.update();
	
	//clear centerpoint for camera pivot
	var geometry = new THREE.SphereGeometry( 0.01, 4, 4 );
	var material = new THREE.ShadowMaterial();
	sphere = new THREE.Mesh( geometry, material );
	sphere.name = "origin";
	scene.add( sphere ); //don't add centerpoint to group
	_translate(sphere,0,cylHeight*15,0);
	
	camera.lookAt( sphere.position);
	controls.target= sphere.position;
	
	/*
	//axis lines
	makeLine(-1000,0,0,1000,0,0,0xff1300);
	makeLine(0,-1000,0,0,1000,0,0xffe800);	
	makeLine(0,0,-1000,0,0,1000,0x000fff);	
	*/

}

// animate
function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

function buildMenu(div){
	//create title
	var title = document.createElement("p");
	title.innerText = "World Population Cone";
	
	//create choices
	var countrySelect = createSelect("countrySelect","selectOption", countries);
	
	//create choices
	var yearSelect = createSelect("yearSelect","selectOption", years);	
	
	div.appendChild(title);
	div.appendChild(countrySelect);
	div.appendChild(yearSelect);
}

function createSelect(id, _class, options){
	var select = document.createElement("select");
	select.id = id;
	select.className = _class;
	
	for (var property in options) {
		if (options.hasOwnProperty(property)) {
			var option = document.createElement("option");
			option.text = options[property];
			option.value = encodeURI(options[property]);
			select.add(option);
		}
	}
	select.addEventListener('change', getPopulationData);
	return select;
}

function makeLine(x1,y1,z1,x2,y2,z2, color, name){
	var geometryLine = new THREE.Geometry();
	geometryLine.vertices.push(new THREE.Vector3( x1, y1, z1) );
	geometryLine.vertices.push(new THREE.Vector3( x2, y2, z2) );
	var materialLine = new THREE.LineDashedMaterial( {
		color: color,
		dashSize: 3,
		gapSize: 5
	} );

	var line = new THREE.LineSegments( geometryLine,  materialLine );
	if(name){
		line.name = name;
	}else{
		line.name = "line" + Math.random();
	}
	scene.add( line );
}

function makeCylinder(radius, percentOf, color, height, radSegs, thetaStart){
	var thetaLength = Math.PI * percentOf / 50; 
	var geometry = new THREE.CylinderGeometry( radius, radius, height, radSegs, 1, false, thetaStart, thetaLength); //top == bottom (cyl not cone)
	var material = new THREE.MeshBasicMaterial( {color: color} );
	var cylinder = new THREE.Mesh( geometry, material );
	if(thetaStart > 0){
		cylinder.rotateX(thetaStart);
	}
	return cylinder;
}

function _translate(object,x,y,z){
	object.translateX(x);
	object.translateY(y);
	object.translateZ(z);
}
function getCountries(){
	$.ajax({
		url: 'http://api.population.io/1.0/countries',
		dataType: "json",
		method: "GET",
		success: function(response) {
			countries = response.countries;
			init();
			animate();
		}
	})
}
function getPopulationData(){
	//clear old date
	scene.remove(dataGroup);
	dataGroup = new THREE.Group();
	var country = document.getElementById("countrySelect").value;
	var year = document.getElementById("yearSelect").value;
	var baseUrl = "http://api.population.io/1.0/population/";
	baseUrl += year+ "/" + country;

	$.ajax({
		url: baseUrl,
		dataType: "json",
		method: "GET",
		success: function(data) {
			var totalPopYear = 0;
			for(i=0; i < data.length; i++){
				var femaleAmount = data[i].females;
				var maleAmount = data[i].males;
				var totalAgeAmount = femaleAmount + maleAmount;
				totalPopYear += totalAgeAmount;
			}
			for(i=0; i < data.length; i++){
				var femaleAmount = data[i].females;
				var maleAmount = data[i].males;
				var totalAgeAmount = femaleAmount + maleAmount;
				var femalePercent = femaleAmount/totalAgeAmount * 100;
				var malePercent = maleAmount/totalAgeAmount * 100;
				
				var maleCyl = makeCylinder( maleAmount/totalPopYear * 5000, malePercent, blueColor, cylHeight,cylSegs, rightSideThetaStart); 
				var femaleCyl = makeCylinder( maleAmount/totalPopYear * 5000, femalePercent, pinkColor, cylHeight,cylSegs, leftSideThetaStart); 
				
				var cylY = cylHeight/2 * (i * 1);
				_translate(maleCyl,0, cylY,0);
				_translate(femaleCyl,0, -cylY,0);
				
				dataGroup.add( maleCyl );
				dataGroup.add( femaleCyl );
			}
			scene.add(dataGroup);
		}

	});
}

/*

function restCall(url) { return new Promise(function(resolve, reject) {
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", url);
	xhttp.timeout = 20000;
	xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');

	xhttp.onload = function() {
		if(xhttp.status == 200) {
			resolve(xhttp.response);
		}
		else {
			reject(Error(xhttp.statusText));
		}
	};
	xhttp.ontimeout = function() {
		reject(Error("Timeout Error"));
	};
	xhttp.onerror = function() {
		reject(Error("Network Error"));
	};
	xhttp.send();
}).catch(function(err){
		console.log("Could not get contact server" + err);
})}
*/