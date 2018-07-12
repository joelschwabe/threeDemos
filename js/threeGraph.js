var renderer, scene, camera, controls, info, graphGroup, coin, light;

var objCounter = 0;

var barCounter = 0;
var barSpacer = 20, barX = 10, barZ = 10, barCountMax=15;
var barOriginX = 0 + barX/2, barOriginY = 0, barOriginZ = 0 + barZ/2;
var planeW = 0, planeH = 250, headroom = 10, markerNum = 10;

var loader = new THREE.FontLoader();

var cryptos = {   
	BTC:"Bitcoin", 
	ETH:"Ethereum",
	XRP:"Ripple",
	BCH:"BitcoinCash",
	EOS:"EOS",
	LTC:"Litecoin",
	XLM:"Stellar",
	ADA:"Cardano",
	IOTA:"IOTA",
	USDT:"Tether",
	TRX:"Tron",
	NEO:"Neo",
	DASH:"Dash",
	XEM:"Nem",
	BNB:"BinanceCoin",
	VEN:"VeChain",
	OMG:"OmiseGO",
	XVG:"Verge",
	NANO:"Nano",
	DOGE:"Dogecoin",
	GRLC:"Garlicoin"
};

var fiats = {
	CAD:"Canadian Dollar",
	USD:"American Dollar",
	AUD:"Australian Dollar",
	GBP:"British Pound",
	EUR:"Euro",
	JPY:"Japanese Yen",
	CNY:"Chinese Yuan"
};

var timePeriods = {
	day:"Day",
	hour:"Hour",
	minute:"Minute"
};
var graphTypes = {
	scale:"Absolute",
	trim:"Trimmed"
};

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

init();
getPriceData();
animate();

function init(){
	// html overlay
	info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '0px';
	info.style.paddingLeft = '5px';
	info.style.width = '185px';
	info.style.height = '215px';
	info.style.textAlign = 'left';
	info.style.color = '#000';
	info.style.fontWeight = 'bold';
	info.style.fontSize = '16';
	info.style.backgroundColor = '#a28c4a';
	info.style.zIndex = '1';

	buildMenu(info);
	document.body.appendChild( info );

	// renderer
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor(0x000000, 0);
	document.body.appendChild( renderer.domElement );

	// scene
	scene = new THREE.Scene();
	//scene.background = new THREE.Color( 0x000000 );
	
	// camera
	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( planeW/2, planeH/2, barCountMax * 30 );
	camera.lookAt(planeW/2,planeH/2,0);

	//controls
	controls = new THREE.OrbitControls( camera, renderer.domElement ); //need that second param otherwise the controls are based off the window instead of the canvas
	controls.update();	
	
	//grouping
	graphGroup = new THREE.Group();
	graphGroup.name = 'graph';
	scene.add(graphGroup);
	/*
	//group pivotPoint
	var material2 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
	var sphere2 = new THREE.Mesh( geometry, material2 );
	sphere2.name = "pivotPoint";
	graphGroup.add( sphere2 ); //center of pivot
	
	//axis lines
	makeLine(-1000,0,0,1000,0,0,0xff1300);
	makeLine(0,-1000,0,0,1000,0,0xffe800);	
	makeLine(0,0,-1000,0,0,1000,0x000fff);	
	*/
	
	//clear centerpoint for camera pivot
	var geometry = new THREE.SphereGeometry( 1, 3, 2 );
	var material = new THREE.ShadowMaterial();
	var sphere = new THREE.Mesh( geometry, material );
	sphere.name = "origin";
	scene.add( sphere ); //don't add centerpoint to group
	
	var light = new THREE.PointLight( 0xffffff, 1, 0 );
	light.position.set( 150, 50, 50 );
    scene.add(light);

	makeBackdrop();
	
	window.addEventListener( 'mousedown', onDocumentMouseDown );
	window.addEventListener( 'resize', onWindowResize, false );
}

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	controls.update();
	if(coin){
		coin.rotation.z += 0.015;	
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function makeBackdrop(){
	planeW = (barX +barSpacer/2) * (barCountMax + 1); 
	
	var backdrop = new THREE.Group();
	backdrop.name = 'backdrop';
	
	//clean up last scene
	var backdropGroup = scene.getObjectByName("backdrop");
	backdropGroup = scene.children.indexOf(backdropGroup);
	if(scene.children[backdropGroup]){
		for( var i = scene.children[backdropGroup].children.length - 1; i >= 0; i--) { 				
			scene.children[backdropGroup].children[i].geometry.dispose();
			scene.children[backdropGroup].children[i].material.dispose();
			scene.remove( scene.children[backdropGroup].children[i] );
		}
		scene.remove(scene.children[backdropGroup]); 
	}
	
	var planeXY = makePlane(planeW,planeH,0xc9a740,"XY"); //y axis graph
	var planeXZ = makePlane(planeW,15,0xc9a740,"XZ"); //bottom holder of graph
	planeXZ.rotateX(Math.PI / 2); //flip to make a platform
	_translate(planeXZ,planeXZ.geometry.parameters.width/2,planeXZ.geometry.parameters.height/2,1);
	_translate(planeXY,planeXY.geometry.parameters.width/2,planeXY.geometry.parameters.height/2,-1);
	
	var planeYAB = makePlane(35,planeH,0xa28c4a,"YAB"); //-y axis back drop
	var planeXAB = makePlane(planeW,30,0xa28c4a,"XAB"); //x axis back drop
	_translate(planeYAB,(-planeYAB.geometry.parameters.width/2),planeYAB.geometry.parameters.height/2,-1);
	_translate(planeXAB,planeXAB.geometry.parameters.width/2,-planeXAB.geometry.parameters.height/2,-1);
	
	var origin = scene.getObjectByName("origin");
	//_translate(origin,planeXZ.geometry.parameters.width/2,planeH/2,1);
	origin.position.x = planeXZ.geometry.parameters.width/2;
	origin.position.y = planeH/2;
	origin.position.z = 1;
	controls.target= origin.position;
	controls.update();
	
	backdrop.add( planeYAB );
	backdrop.add( planeXAB );	
	backdrop.add( planeXY );
	backdrop.add( planeXZ );
	scene.add(backdrop);
}

function makePlane(x,y,color,id){
	var geo = new THREE.PlaneGeometry( x, y );
	var mat = new THREE.MeshBasicMaterial( {color: color, side: THREE.DoubleSide} );
	plane = new THREE.Mesh( geo, mat );
	plane.name = "plane" + id;
	return plane;
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
		line.name = "line" + objCounter;
	}
	scene.add( line );
	objCounter++;
}
//
function makeCoin(rad,thick,xt,yt,zt,size,coinType){
	var coin_sides_geo =  new THREE.CylinderGeometry( rad, rad, thick, 30, 30, true );
	var coin_cap_geo = new THREE.Geometry();
	var r = rad; 
	for (var i=0; i<100; i++) {
	  var a = i * 1/100 * Math.PI * 2;
	  var z = Math.sin(a);
	  var x = Math.cos(a);
	  var a1 = (i+1) * 1/100 * Math.PI * 2;
	  var z1 = Math.sin(a1);
	  var x1 = Math.cos(a1);
	  coin_cap_geo.vertices.push(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(x*r, 0, z*r),
		new THREE.Vector3(x1*r, 0, z1*r)
	  );
	  coin_cap_geo.faceVertexUvs[0].push([
		new THREE.Vector2(0.5, 0.5),
		new THREE.Vector2(x/2+0.5, z/2+0.5),
		new THREE.Vector2(x1/2+0.5, z1/2+0.5)
	  ]);
	  coin_cap_geo.faces.push(new THREE.Face3(i*3, i*3+1, i*3+2));
	}
	coin_cap_geo.computeVertexNormals();
	coin_cap_geo.computeFaceNormals();

	var coin_sides_texture =  new THREE.TextureLoader().load('img/side.png', function ( coin_sides_texture ) {
		coin_sides_texture.wrapS = coin_sides_texture.wrapT = THREE.RepeatWrapping;
		coin_sides_texture.offset.set( 0, 0 );
		coin_sides_texture.repeat.set( 2, 2 );
	} );
	
	var coin_cap_texture =  new THREE.TextureLoader().load('img/'+ coinType +'.png');

	var coin_sides_mat =  new THREE.MeshBasicMaterial({map:coin_sides_texture});
	var coin_sides =  new THREE.Mesh( coin_sides_geo, coin_sides_mat );

	var coin_cap_mat = new THREE.MeshBasicMaterial({map:coin_cap_texture});
	var coin_cap_top = new THREE.Mesh( coin_cap_geo, coin_cap_mat );
	var coin_cap_bottom = new THREE.Mesh( coin_cap_geo, coin_cap_mat );

	coin_cap_top.position.y = 0.5;
	coin_cap_bottom.position.y = -0.5;
	coin_cap_bottom.rotation.y = Math.PI;
	coin_cap_top.rotation.x = Math.PI;

	coin = new THREE.Object3D();
	coin.add(coin_sides);
	coin.add(coin_cap_top);
	coin.add(coin_cap_bottom);
	_translate(coin,xt,yt,zt);
	coin.rotateX(Math.PI / 2); 
	scene.add(coin);
}

function addBar(x,y,z,w,l,h,name,color){
	geometry = new THREE.BoxGeometry(w, l, h );
	material = new THREE.MeshPhongMaterial({color: color});
	bar = new THREE.Mesh( geometry, material );
	_translate(bar,x,y,z);
	/*
	if(name){
		var nameExists = scene.getObjectByName(name);
		if(!nameExists){
			bar.name = name;
		}else{
			bar.name = name + "-" + objCounter;
		}
	}else{
		bar.name = "bar-" + objCounter;
	}
	*/
	
	bar.name = "bar";
	
	graphGroup.add( bar );
	objCounter++;
}

function renderedText(text,x,y,z,colorFill,size){
	loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font  ) {
		var geometry = new THREE.TextGeometry( text.toString(), {
			font: font,
			size: size,
			height: 0.5,
			curveSegments: 8

		} );
		
		var material = new THREE.MeshPhongMaterial( { color: colorFill, flatShading: true } );
	
		
		textMesh = new THREE.Mesh( geometry, material );
		textMesh.name = text;
		_translate(textMesh,x,y,z);
		graphGroup.add(textMesh);
	} );
}

function _translate(object,x,y,z){
	object.translateX(x);
	object.translateY(y);
	object.translateZ(z);
}

function addDataAlongXaxis(barY, price, date){
	var thisX,thisY,thisZ;
	thisX = barOriginX + (barCounter * barSpacer);
	thisY = barOriginY + (barY/2);
	thisZ = barOriginZ;
	addBar(	thisX,thisY,thisZ,barX,barY,barZ + 1, 'bar'+thisX ,0xFFD700);
	renderedText(date,(thisX-barX/2),1,11,0x000000,2.5); //date
	renderedText(price,(thisX-barX/2),(barY + 5),1,0x000000,3); //value 
	barCounter++;
}

function createYaxisLegend(scaleType, high, low, markers){
	var x = -25, z = -1;
	var markInd = (planeH - headroom) / markers; //y value of indicator
	var priceInc = 0;
	var priceScale = 0;
	var markScale = 0;
	if(scaleType=='trim'){
		priceInc = (high - low) / markers; //num value of each marker segment
		priceScale = low;
	}else{
		priceInc = high / markers; //num value of each marker segment
	}

	for(i=0; i < markers + 1; i++){ //start at 0 origin, so add 1
		var adjustedPrice;
		if(priceInc > 0.1){
			adjustedPrice = priceScale.toFixed(2);
		}else{
			adjustedPrice = priceScale.toPrecision(4);
		}
		var cur = document.getElementById("fiatSelect").value;
		switch(cur){
			case "CAD":
				adjustedPrice = "$" + adjustedPrice;
				break;
			case "USD":
				adjustedPrice = "$" + adjustedPrice;
				break;
			case "AUD":
				adjustedPrice = "$" + adjustedPrice;				
				break;
			case "GBP":
				adjustedPrice = "£" + adjustedPrice;	
				break;
			case "EUR":
				adjustedPrice = "€" + adjustedPrice;	
				break;
			case "JPY":
				adjustedPrice = "¥" + adjustedPrice;	
				break;
			case "CNY":
				adjustedPrice = "¥" + adjustedPrice;	
				break;				
		}
		renderedText(adjustedPrice,0-(barX*3),markScale,0,0x000000,3);
		makeLine(0,markScale,1,planeW,markScale,1,0xff1300,'line_'+i);
		
		priceScale += priceInc;
		markScale += markInd;
	}
}

function createXaxisLegend(crypto,fiat,timing ){
	var x = 10, y = -18, z = 10;
	var text = "Price of " + crypto + " in " + fiat + " over last " + barCountMax + " " + timing + "s"
	renderedText(text,x,y,z,0x000000,10);
}

function buildMenu(div){
	//create title
	var title = document.createElement("p");
	title.innerText = "Crypto Price Chart";
	
	//create crypto choices
	var cryptoChoice = createSelect("cryptoSelect","selectOption",cryptos);
	//create fiat choices
	var fiatChoice = createSelect("fiatSelect","selectOption",fiats);
	
	//create time choices
	var timeChoice = createSelect("measureSelect","selectOption",timePeriods);
	
	//create time choices
	var displayChoice = createSelect("displaySelect","selectOption",graphTypes);	
	
	var timespan = document.createElement("input");
	timespan.id= "timespan",
	timespan.placeholder = "Unit of time (default: 15)";
	timespan.addEventListener('focusout', checkTimespan);
	
	div.appendChild(title);
	div.appendChild(cryptoChoice);
	div.appendChild(fiatChoice);
	div.appendChild(timeChoice);
	div.appendChild(displayChoice);
	div.appendChild(timespan);
}

//params: id,class, options
function createSelect(id, _class, options){
	var wrapper = document.createElement("p");
	var select = document.createElement("select");
	select.id = id;
	select.className = _class;
	
	for (var property in options) {
		if (options.hasOwnProperty(property)) {
			var option = document.createElement("option");
			option.text = options[property];
			option.value = property;
			select.add(option);
		}
	}
	select.addEventListener('change', getPriceData);
	wrapper.appendChild(select);
	return wrapper;
}

function checkTimespan(){
	var timespan = parseInt(document.getElementById("timespan").value);
	if(barCountMax != timespan){
		barCountMax = timespan;
		makeBackdrop();
		getPriceData();
	}
}

function getPriceData(){
	//clear old data
	scene.remove(graphGroup);
	scene.remove(coin);
	graphGroup = new THREE.Group();
	scene.add(graphGroup);
	graphGroup.name = 'graph';
	barCounter = 0;
	objCounter = 0;
	
	var crypt = document.getElementById("cryptoSelect");
	var cur = document.getElementById("fiatSelect");
	var measure = document.getElementById("measureSelect");
	var displayType = document.getElementById("displaySelect");
	
	var baseUrl = "https://min-api.cryptocompare.com/data/histo";
	baseUrl += measure.value + "?fsym=" + crypt.value + "&tsym=" + cur.value + "&limit=" + barCountMax;
	
	restCall(baseUrl).then(
		function(response) {
			var data = JSON.parse(response);
			var info = data.Data;
			var newData = [];
			var highPoint = 0;
			var lowPoint = -1;
			
			for(i=0; i < info.length;i++){
				var fullDate = new Date(info[i].time * 1000); //wew fuck you api
				var month = months[fullDate.getMonth()];
				var day = fullDate.getDate() + 1;
				var hours = fullDate.getHours();
				var minutes = fullDate.getMinutes();
				if(minutes < 10){
					minutes = "0" + minutes.toString();
				}
				var year = fullDate.getFullYear();
				var date = '';
				switch (measure.value) {
					case "minute":
						date = hours + ":" + minutes;
						break;
					case "hour":
						date = fullDate.getMonth()+1 + "/" +day + " " + hours + "h";
						break
					case "day":
						date = month + " " + day;
						break;
				}
				var closePrice = info[i].close;
				var bar = { price:closePrice, date:date};
				newData.push(bar);
				
				if(closePrice > highPoint){
					highPoint = closePrice;
				}
				if(closePrice < lowPoint||lowPoint < 0){
					lowPoint = closePrice;
				}
			}
			
			var spread = highPoint - lowPoint;  
			var scaleMod = (planeH - headroom)/highPoint; //leave a little head room
			
			createYaxisLegend(displayType.value,highPoint,lowPoint, markerNum); 
			createXaxisLegend(crypt.value,cur.value,measure.value);
			makeCoin(15,1,-17,-17,0,10,crypt.selectedOptions[0].innerText);
			
			for(i=0; i < newData.length;i++){
				var barHeight = 0;
				switch(displayType.value){
					case "trim":
						barHeight = newData[i].price * scaleMod * ((newData[i].price - lowPoint)/spread);
						break;
					case "scale":
						barHeight = newData[i].price * scaleMod;
						break;
				}
				addDataAlongXaxis(barHeight, newData[i].price, newData[i].date);
			}
		}
	);
}

function restCall(url) { return new Promise(function(resolve, reject) {
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", url);
	xhttp.timeout = 8000;
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

function onDocumentMouseDown( event ) {    
	event.preventDefault();
	var mouse3D = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   
							-( event.clientY / window.innerHeight ) * 2 + 1,  
							0.5 );     
	var raycaster =  new THREE.Raycaster();                                        
	raycaster.setFromCamera( mouse3D, camera );
	var g = scene.getObjectByName("graph");
	var intersects = raycaster.intersectObjects( g.children );
	if ( intersects.length > 0 ) {
		if(intersects[0].object.material.color.getHex() == 0xff3300){
			intersects[ 0 ].object.material.color.setHex( 0xFFD700 );
		}else{
			intersects[ 0 ].object.material.color.setHex( 0xff3300 );
		}
	}
}