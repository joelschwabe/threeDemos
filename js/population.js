(function(){
var renderer, scene, camera, controls, info, dataGroup, sphere;
var leftSideThetaStart = Math.PI;
var rightSideThetaStart = 0;
var cylHeight = 3;
var cylSegs = 32;
var maxRad = 100;
var blueColor = 0x0a0dce;
var pinkColor = 0xe5099c;
var countries;
var cycle = null;
var cycleTrip = false;
var cycleFrameLimiter = 5;
var currentYear = 0;
var allCountryYears = [];
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
				
getCountries(); //also calls init 

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
	camera.position.set( 0, 25, -350 );
	
	dataGroup = new THREE.Group();
	dataGroup.name = "dataGroup";
	
	controls = new THREE.OrbitControls( camera, renderer.domElement ); 
	controls.update();
	
	var light = new THREE.PointLight( 0xffffff, 1, 0 );
	light.position.set( 15, 150, -300 );
    scene.add(light);
	
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
	
	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

// animate
function animate(timestamp,counter) {
	renderer.render( scene, camera );
	
	if(cycle && allCountryYears.length == 0 && cycleTrip == false){ //cycling is on and we haven't started the population call for the years array
		console.log("cycle is on");
		cycleTrip = true;
		for(i=years[0]; i < (years[years.length-1]); i++){
			var country = document.getElementById("countrySelect").value;
			var yearData = getPopulationData(country, i,function(data) {
				var cleanData = processData(data);
				allCountryYears.push(cleanData);	
			});
		}
	}
	if(cycle && allCountryYears.length == years.length-1){ //cycling is on and the array is completely populated
		if(counter > cycleFrameLimiter){		//delay between drawing new cones
			if(currentYear < (years.length-1)){		//current place in array is not the end
				cleanUp();

				drawCylinder(allCountryYears[currentYear]);
				//modCylinder(allCountryYears[currentYear]);
				currentYear++;
				var yearCounter = document.getElementById("yearCounter");
				yearCounter.innerText = years[currentYear].toString();
			}else{
				currentYear = 0;			//reset array position
			}
			counter = 0;					//reset delay counter
		}else{
			counter++;
		}		
	}
	requestAnimationFrame( function(timestamp){
		starttime = timestamp || new Date().getTime() //if browser doesn't support requestAnimationFrame, generate our own timestamp using Date
		animate(timestamp, counter) // 400px over 1 second
	})
}

function cleanUp(){
	// clean up	
	var group = scene.children.indexOf(dataGroup);
	if(scene.children[group]){ //group exists
		for( var i = scene.children[group].children.length - 1; i >= 0; i--) { 				
			scene.children[group].children[i].geometry.dispose();
			scene.children[group].children[i].material.dispose();
			scene.remove( scene.children[group].children[i] );

		}
		scene.remove(scene.children[group]); 
	}
}

function buildMenu(div){
	//create title
	var title = document.createElement("p");
	title.innerText = "World Population Cone";
	
	//create choices
	var countrySelect = createSelect("countrySelect","selectOption", countries);
	
	//create choices
	var yearSelect = createSelect("yearSelect","selectOption", years);	
	
	//button
	var cycleButton = createButton("cycleButton","button");	
	var yearCounter = document.createElement("span");
	yearCounter.id = "yearCounter";
	yearCounter.style.paddingLeft = '10px';
	yearCounter.innerText = "----";
	
	div.appendChild(title);
	div.appendChild(countrySelect);
	div.appendChild(yearSelect);
	div.appendChild(cycleButton);
	div.appendChild(yearCounter);
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
	select.addEventListener('change', function() {
		allCountryYears = [];
		cleanUp();
		var country = document.getElementById("countrySelect").value;
		var year = document.getElementById("yearSelect").value;
		var yearCounter = document.getElementById("yearCounter");
		var cycleButton = document.getElementById("cycleButton");
		cycleButton.disabled = false;
		yearCounter.innerText = "----";
		var data = getPopulationData(country,year, function(data) {
			cleanUp();
			var cleanData = processData(data);
			drawCylinder(cleanData);
		});

	});
	return select;
}

function createButton(id, _class){
	var button = document.createElement("button");
	button.id = id;
	button.className = _class;
	button.innerText = "Cycle All Years";
	button.disabled = true;
	button.addEventListener('click', function() {
		var country = document.getElementById("countrySelect").value;
		var button = document.getElementById("cycleButton");
		cycleYears(country,button);
	});
	return button;
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

function makeCylinder(radiusTop, radiusBottom, percentOf, color, height, radSegs, thetaStart){
	var thetaLength = Math.PI * percentOf / 50; 
	var geometry = new THREE.CylinderGeometry( radiusTop, radiusBottom, height, radSegs, 1, false, thetaStart, thetaLength); //top == bottom (cyl not cone) //try true?
	//var material = new THREE.MeshBasicMaterial( {color: color} );
	//var material = new THREE.MeshPhongMaterial( { color: color, flatShading: true } );
	var material = new THREE.MeshLambertMaterial( {
													color:color,
													emissive: new THREE.Color( 'black'),
													flatShading: false
													}
	);													
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

function cycleYears(country,button){
	console.log("Toggle Cycle");
	var year = document.getElementById("yearSelect");
	if(cycle == true){
		cycle = false;
		button.style.backgroundColor = 'lime';
		button.innerText = "Cycle All Years";
		year.disabled = false;
		cycleTrip = false;
	}else{
		cycle = true;
		button.style.backgroundColor = 'red';
		button.innerText = "Stop Cycling";
		currentYear = 0;
		year.disabled = true;
	}
}

function getCountries(){
	$.ajax({
		url: 'http://api.population.io/1.0/countries',
		dataType: "json",
		method: "GET",
		success: function(response) {
			countries = response.countries;
			init();
			animate(0,0);
		}
	})
}

function processData(data){
	var totalPopYear = 0;
	var cleanedData = [];
	for(i=0; i < data.length; i++){
		var femaleAmount = data[i].females;
		var maleAmount = data[i].males;
		var totalAgeAmount = femaleAmount + maleAmount;
		totalPopYear += totalAgeAmount;
	}
	for(i=0; i < data.length; i++){
		var thisSlice = {};
		var femaleAmount = data[i].females;
		var maleAmount = data[i].males ;

		var totalAgeAmount = femaleAmount + maleAmount;
		var femalePercent = femaleAmount/totalAgeAmount * 100;
		var malePercent = maleAmount/totalAgeAmount * 100;
		femaleAmount = femaleAmount/totalPopYear * 5000;
		maleAmount = maleAmount/totalPopYear * 5000;
		thisSlice.maleAmount= maleAmount;
		thisSlice.malePercent = malePercent;
		thisSlice.femalePercent = femalePercent;
		cleanedData.push(thisSlice);
	}
	return cleanedData;
}

function drawCylinder(data){
	dataGroup = new THREE.Group();
	dataGroup.name= "dataGroup";
	
	for(i=0; i < data.length -1; i++){ //don't do the last one because I'm lazy for index checks

		var maleCyl = makeCylinder( data[i+1].maleAmount,data[i].maleAmount,  data[i].malePercent, blueColor, cylHeight,cylSegs, rightSideThetaStart); 
		var femaleCyl = makeCylinder(  data[i].maleAmount ,data[i+1].maleAmount, data[i].femalePercent, pinkColor, cylHeight,cylSegs, leftSideThetaStart); 		
		
		var cylY = cylHeight/2 * (i * 1);
		_translate(maleCyl,0, cylY,0);
		_translate(femaleCyl,0, -cylY,0);
		
		dataGroup.add( maleCyl );
		dataGroup.add( femaleCyl );
	
	}
	scene.add(dataGroup);
}

function modCylinder(data){
	/*
	var totalPopYear = 0;
	for(i=0; i < data.length; i++){
		var femaleAmount = data[i].females;
		var maleAmount = data[i].males;
		var totalAgeAmount = femaleAmount + maleAmount;
		totalPopYear += totalAgeAmount;
	}
	*/
	for(i=0; i < (data.length-1 * 2) ; i +=2){ //don't do the last two because I'm lazy for index checks
		var scale = dataGroup.children[i].geometry.parameters.radiusBottom / data[i].maleAmount;
		var thetaLengthM = Math.PI * data[i].malePercent / 50; 
		var thetaLengthF = (Math.PI * 2) - thetaLengthM;
		//change the theta.....how?
		dataGroup.children[i].scale.x = scale;
		dataGroup.children[i].scale.z = scale;
		dataGroup.children[i+1].scale.x = scale;
		dataGroup.children[i+1].scale.z = scale;
			
	}
	
}

function pad(n) { return ("000" + n).slice(-3); }

function getPopulationData(country, year,callback){

	var baseUrl = "http://api.population.io/1.0/population/";
	baseUrl += year+ "/" + country;
	return $.ajax({
		url: baseUrl,
		dataType: "json",
		method: "GET" 
	})
	.done(callback)
    .fail(function(jqXHR, textStatus, errorThrown) {
        // Handle error
    });
}

}());