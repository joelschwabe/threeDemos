var renderer, scene, camera, controls, info, graphGroup;

var planeXY;
var planeXZ;
var objCounter = 0;

var barCounter = 0;
var barSpacer = 20, barX = 10, barZ = 10;
var barOriginX = 0 + barX/2, barOriginY = 0, barOriginZ = 0 + barZ/2;
var planeW = 320, planeH = 180, headroom = 10;

var loader = new THREE.FontLoader();

var cryptos = {   
	LTC:"Litecoin",
	ETH:"Ethereum",
	XRP:"Ripple",
	BTC:"Bitcoin", 
	BCH:"BitcoinCash",
	XLM:"Stellar",
	ADA:"Cardano",
	IOTA:"IOTA",
	EOS:"EOS",
	USDT:"Tether",
	NEO:"Neo",
	XEM:"Nem",
	TRX:"Tron",
	DASH:"Dash",
	BNB:"BinanceCoin",
	VEN:"VeChain",
	OMG:"OmiseGO",
	NANO:"Nano",
	XVG:"Verge",
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
animate();
getPriceData();

function init(){
	// html overlay
	info = document.createElement( 'span' );
	info.style.position = 'absolute';
	info.style.top = '0px';
	info.style.width = '355px';
	info.style.height = '70px';
	info.style.textAlign = 'left';
	info.style.color = '#000';
	info.style.fontWeight = 'bold';
	info.style.backgroundColor = 'transparent';
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
	camera.position.set( 145, 205, 280 );
	//camera.lookAt(planeW/2,planeH/2,0);

	//controls
	controls = new THREE.OrbitControls( camera, renderer.domElement ); //need that second param otherwise the controls are based off the window instead of the canvas
	controls.update();	
	
	//grouping
	graphGroup = new THREE.Group();
	
	/*
	//sphere centerpoint
	var geometry = new THREE.SphereGeometry( 1, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	var sphere = new THREE.Mesh( geometry, material );
	sphere.name = "origin";
	scene.add( sphere ); //don't add centerpoint to group

	//sphere pivotPoint
	var material2 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
	var sphere2 = new THREE.Mesh( geometry, material2 );
	sphere2.name = "pivotPoint";
	graphGroup.add( sphere2 ); //center of pivot
	
	//axis lines
	makeLine(-1000,0,0,1000,0,0,0xff1300);
	makeLine(0,-1000,0,0,1000,0,0xffe800);	
	makeLine(0,0,-1000,0,0,1000,0x000fff);	
	*/

	//add lighting
    var light = new THREE.PointLight(0x2f3c7f);
    light.position.set(-100,200,100);
    scene.add(light);
	
	//plane geometry (graph)
	var geometryXY = new THREE.PlaneGeometry( planeW, planeH );
	var materialXY = new THREE.MeshBasicMaterial( {color: 0x519cad, side: THREE.DoubleSide} );
	planeXY = new THREE.Mesh( geometryXY, materialXY );
	planeXY.name = "planeXY";

	
	var geometryXZ = new THREE.PlaneGeometry( planeW, 20 );
	var materialXZ = new THREE.MeshBasicMaterial( {color: 0xa0ccd6, side: THREE.DoubleSide} );
	planeXZ = new THREE.Mesh( geometryXZ, materialXZ );
	planeXZ.name = "planeXZ";
	planeXZ.rotateX(Math.PI / 2);
	_translate(planeXZ,planeXZ.geometry.parameters.width/2,planeXZ.geometry.parameters.height/2,0);
	_translate(planeXY,planeXY.geometry.parameters.width/2,planeXY.geometry.parameters.height/2,0);
	
	scene.add( planeXY );
	scene.add( planeXZ );
	scene.add(graphGroup);
}

function animate() {

	requestAnimationFrame( animate );
	
	renderer.render( scene, camera );
	controls.update();	
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

function addBar(x,y,z,w,l,h,name){
	geometry = new THREE.BoxGeometry(w, l, h );
	material = new THREE.MeshNormalMaterial();
	bar = new THREE.Mesh( geometry, material );
	_translate(bar,x,y,z);

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
	graphGroup.add( bar );
	objCounter++;
}

function renderedText(text,x,y,z,colorFill){
	loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font  ) {
		var geometry = new THREE.TextGeometry( text.toString(), {
			font: font,
			size: 3,
			height: 2,
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
/*
function addDataAlongXaxis(barY, name, scaleMod){
	var thisX,thisY,thisZ;
	thisX = barOriginX + (barCounter * barSpacer);
	thisY = barOriginY + ((barY/2) * scaleMod);
	thisZ = barOriginZ;
	addBar(	thisX,thisY,thisZ,barX,(barY * scaleMod),barZ,name);
	renderedText(name,(thisX-barX/2),1,10,0xdf13f0); //date
	renderedText(barY,(thisX-barX/2),(barY* scaleMod + 5),1,0xff0000); //value 
	barCounter++;
}
*/
function addDataAlongXaxis(barY, price, date){
	var thisX,thisY,thisZ;
	thisX = barOriginX + (barCounter * barSpacer);
	thisY = barOriginY + (barY/2);
	thisZ = barOriginZ;
	addBar(	thisX,thisY,thisZ,barX,barY,barZ);
	renderedText(date,(thisX-barX/2),1,10,0xdf13f0); //date
	renderedText(price,(thisX-barX/2),(barY + 5),1,0xff0000); //value 
	barCounter++;
}

function createYaxisLegend(scaleType, high, low, markers){
	var x = -20, z = 0;
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
			adjustedPrice = priceScale.toFixed(5);
		}else{
			adjustedPrice = priceScale.toPrecision(6);
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
			case "€":
				adjustedPrice = "$" + adjustedPrice;	
				break;
			case "JPY":
				adjustedPrice = "¥" + adjustedPrice;	
				break;
			case "CNY":
				adjustedPrice = "¥" + adjustedPrice;	
				break;				
		}
		renderedText(adjustedPrice,0-(barX*3),markScale,0,0xff1300);
		makeLine(0,markScale,2,planeW,markScale,2,0xff1300);
		
		priceScale += priceInc;
		markScale += markInd;
	}
}
/*

function createYaxisLegend(scaleType, high, low, markers){
	var x = -20, z = 0;
	var markInd = (planeH - headroom) / markers; //y value of indicator
	var priceInc = 0;
	var priceScale = 0;
	var markScale = 0;
	if(scaleType=='trim'){
		priceInc = (high - low) / markers; //num value of each marker segment
		priceScale = low - priceInc;
	}else{
		priceInc = high / markers; //num value of each marker segment
		priceScale = priceInc;
	}

	for(i=0; i < markers; i++){
		
		var adjustedPrice;
		if(priceInc > 0.1){
			adjustedPrice = priceScale.toFixed(2);
		}else{
			adjustedPrice = priceScale.toPrecision(4);
		}
		
		renderedText(priceScale.toPrecision(7),0-(barX*3),markScale,0,0xff1300);
		makeLine(0,markScale,2,planeW,markScale,2,0xff1300);
		
		priceScale += priceInc;
		markScale += markInd;
	}
}

*/
function createXaxisLegend(scaleType, data){
	var y = -20, z = 20;
	
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
	
	div.appendChild(title);
	div.appendChild(cryptoChoice);
	div.appendChild(fiatChoice);
	div.appendChild(timeChoice);
	div.appendChild(displayChoice);
}

//params: id,class, options
function createSelect(id, _class, options){
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
	return select;
}

function getPriceData(){
	//clear old date
	scene.remove(graphGroup);
	graphGroup = new THREE.Group();
	scene.add(graphGroup);
	barCounter = 0;
	objCounter = 0;
	
	var crypt = document.getElementById("cryptoSelect").value;
	var cur = document.getElementById("fiatSelect").value;
	var measure = document.getElementById("measureSelect").value;
	var displayType = document.getElementById("displaySelect").value;
	
	var baseUrl = "https://min-api.cryptocompare.com/data/histo";
	baseUrl += measure+ "?fsym=" + crypt + "&tsym=" + cur + "&limit=15";
	
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
				var measure = document.getElementById("measureSelect").value;
				switch (measure) {
					case "minute":
						date = hours + ":" + minutes;
						break;
					case "hour":
						date = day + " " + hours + ":" + minutes;
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
				/*
				console.log("Date-in:" + new Date(fullDate));
				console.log("  Date-out:" + date);
				console.log("Price:" + info[i].close);
				console.log("   High:" + highPoint);
				console.log("   Low:" + lowPoint);
				*/
			}
			
			var spread = highPoint - lowPoint;  
			var scaleMod = (planeH - headroom)/highPoint; //leave a little head room
			
			createYaxisLegend(displayType,highPoint,lowPoint, 10); //10 markers
			//createXaxisLegend(displayType);

			for(i=0; i < newData.length;i++){
				var barHeight = 0;
				switch(displayType){
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

document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 65:
            planeXY.rotateX(Math.PI / 180);
            break;
		case 83:
			planeXY.rotateY(Math.PI / 180);
			break;			
		case 68:
            planeXY.rotateZ(Math.PI / 180);
            break;
	    case 90:
            planeXZ.rotateX(Math.PI / 180);
            break;
		case 88:
			planeXZ.rotateY(Math.PI / 180);
			break;			
		case 67:
            planeXZ.rotateZ(Math.PI / 180);
            break;
	    case 70:
            planeXY.translateX(2);
            break;
		case 71:
			planeXY.translateY(2);
			break;			
		case 72:
            planeXY.translateZ(2);
            break;
	    case 86:
            planeXZ.translateX(2);
            break;
		case 66:
			planeXZ.translateY(2);
			break;			
		case 78:
            planeXZ.translateZ(2);
            break;
	
    }
};