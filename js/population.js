
var renderer, scene, camera, controls, info, noInfo, loading, dataGroup, sphere;
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
var cycleFrameLimiter = 10;
var currentYear = 0;
var allCountryYears = [];
var years = function(){ //new api has less historic year data
	var y = [];
	for(var i = 1990; i < 2020; i++){
		y.push(i)
	}
	return y;
}(); 
				
getCountries(); //also calls init 

function init() {
	// html overlay
	info = document.createElement( 'span' );
	info.style.position = 'absolute';
	info.style.top = '0px';
	info.style.width = '550px';
	info.style.height = '150px';
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
	camera.position.set( -20, 20, -200 );
	
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
	
	
	/*//axis lines
	makeLine(-1000,0,0,1000,0,0,0xff1300);
	makeLine(0,-1000,0,0,1000,0,0xffe800);	
	makeLine(0,0,-1000,0,0,1000,0x000fff);*/
	
	loading = document.getElementById('loading');
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
		loading.setAttribute('style','display:block');
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
		loading.setAttribute('style','display:none');
		if(counter > cycleFrameLimiter){		//delay between drawing new cones
			if(currentYear < (years.length-1)){		//current place in array is not the end
				cleanUp();
				if(allCountryYears[currentYear]){
					drawCylinder(allCountryYears[currentYear]);
				}
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
	var writeup = document.createElement("span");
	writeup.innerText = "Blue: Male , Pink: Female | Age 0 (bottom) -> 100 (top)";
	noInfo = document.createElement("div");
	noInfo.innerText = "No information for country/year.";
	noInfo.setAttribute('style','display:none');

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
	div.appendChild(writeup);
	div.appendChild(countrySelect);
	div.appendChild(yearSelect);
	div.appendChild(cycleButton);
	div.appendChild(yearCounter);
	div.appendChild(noInfo);
}

function createSelect(id, _class, options){
	var select = document.createElement("select");
	select.id = id;
	select.className = _class;
	var defaultOpt = document.createElement("option");
	defaultOpt.text = "Select Value:";
	defaultOpt.value = "";
	defaultOpt.selected = true;
	select.add(defaultOpt);
	for (var property in options) {
		if (options.hasOwnProperty(property)) {
			var option = document.createElement("option");
			if(options[property].name){
				option.text = options[property].name;
				option.value = encodeURI(options[property].code);
			}else{
				option.text = options[property];
				option.value = encodeURI(options[property]);				
			}
			select.add(option);
		}
	}
	select.addEventListener('change', function() {
		allCountryYears = [];
		var country = document.getElementById("countrySelect").value;
		var year = document.getElementById("yearSelect").value;
		if(country && year){
			loading.setAttribute('style','display:block');
			noInfo.setAttribute('style','display:none');
			cleanUp();
			var yearCounter = document.getElementById("yearCounter");
			var cycleButton = document.getElementById("cycleButton");
			cycleButton.disabled = false;
			yearCounter.innerText = "----";
			var data = getPopulationData(country,year, function(data) {
				cleanUp();
				var cleanData = processData(data);
				if(cleanData){
					drawCylinder(cleanData);
				}else{
					noInfo.setAttribute('style','"display:block');
				}
				loading.setAttribute('style','display:none');
			});
		}

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
		if(country){
			cycleYears(country,button);
		}
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
	$.getJSON("js/census_country_codes.json", function(json) {
		countries = json;
		init();
		animate(0,0);
	});
}

function processData(data){
	var totalPopYear = 0;
	var cleanedData = [];

	/* Data Structure:
	[
	  [
		"POP",
		"MPOP0_4",
		"MPOP5_9",
		"MPOP10_14",
		"MPOP15_19",
		"MPOP20_24",
		"MPOP25_29",
		"MPOP30_34",
		"MPOP35_39",
		"MPOP40_44",
		"MPOP45_49",
		"MPOP50_54",
		"MPOP55_59",
		"MPOP60_64",
		"MPOP65_69",
		"MPOP70_74",
		"MPOP75_79",
		"MPOP80_84",
		"MPOP85_89",
		"MPOP90_94",
		"MPOP95_99",
		"MPOP100_",
		"FPOP0_4",
		"FPOP5_9",
		"FPOP10_14",
		"FPOP15_19",
		"FPOP20_24",
		"FPOP25_29",
		"FPOP30_34",
		"FPOP35_39",
		"FPOP40_44",
		"FPOP45_49",
		"FPOP50_54",
		"FPOP55_59",
		"FPOP60_64",
		"FPOP65_69",
		"FPOP70_74",
		"FPOP75_79",
		"FPOP80_84",
		"FPOP85_89",
		"FPOP90_94",
		"FPOP95_99",
		"FPOP100_",
		"YR",
		"FIPS"
	  ],
	  [
		"3881436",
		"326138",
		"267599",
		"223608",
		"194530",
		"173321",
		"156106",
		"109094",
		"81311",
		"74581",
		"67082",
		"60223",
		"50751",
		"39194",
		"28337",
		"17275",
		"9574",
		"4590",
		"1629",
		"364",
		"44",
		"3",
		"333978",
		"280299",
		"234746",
		"204924",
		"184329",
		"168280",
		"111339",
		"82190",
		"88013",
		"83113",
		"70399",
		"56665",
		"39702",
		"26935",
		"15788",
		"8626",
		"4569",
		"1733",
		"401",
		"50",
		"3",
		"1995",
		"SL"
	  ]
	] */
	
	totalPopYear = parseFloat(data[1][0]);
	var indexGap = 21;
	var coneSizeMod = 800;
	var percent100 = 100;
	
	for(var i=1; i <= indexGap; i++){ //21 age ranges starting at [1], males then females
		var thisSlice = {};
		var maleAmount = parseFloat(data[1][i]);
		var femaleAmount = parseFloat(data[1][i+indexGap]);
		if(!maleAmount){
			//probably no data for this year
			return null;
		}

		var totalAgeAmount = femaleAmount + maleAmount;
		var femalePercent = femaleAmount/totalAgeAmount * percent100;
		var malePercent = maleAmount/totalAgeAmount * percent100;
		femaleAmount = femaleAmount/totalPopYear * coneSizeMod;
		maleAmount = maleAmount/totalPopYear * coneSizeMod;
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

	var baseUrl = "https://www.census.gov/popclock/apiData_pop.php?get=POP%2CMPOP0_4%2CMPOP5_9%2CMPOP10_14%2CMPOP15_19%2CMPOP20_24%2CMPOP25_29%2CMPOP30_34%2CMPOP35_39%2CMPOP40_44%2CMPOP45_49%2CMPOP50_54%2CMPOP55_59%2CMPOP60_64%2CMPOP65_69%2CMPOP70_74%2CMPOP75_79%2CMPOP80_84%2CMPOP85_89%2CMPOP90_94%2CMPOP95_99%2CMPOP100_%2CFPOP0_4%2CFPOP5_9%2CFPOP10_14%2CFPOP15_19%2CFPOP20_24%2CFPOP25_29%2CFPOP30_34%2CFPOP35_39%2CFPOP40_44%2CFPOP45_49%2CFPOP50_54%2CFPOP55_59%2CFPOP60_64%2CFPOP65_69%2CFPOP70_74%2CFPOP75_79%2CFPOP80_84%2CFPOP85_89%2CFPOP90_94%2CFPOP95_99%2CFPOP100_&key=&YR=";
	baseUrl += (year + "&FIPS=" + country);
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
