function create2048Scene() {
	var world = new $$.SubWorld({
		clearColor: 0xaaddff,
		alpha:0.5
	}, {
		fov: 75,
		near: 0.0001
	});
	var scene = world.scene;
	var camera = world.camera;

	var geometry, material;
	var wireGeometry, wireMaterial;
	var grid;
	var score;
	var topScore = 2;
	var scoreBox;
	var topScoreBox;
	var scoreTexture;
	var topScoreTexture;
	var scoreMaterial;
	var topScoreMaterial
	var FullBoxSize;
	//var debug = false;

	//2 4 8 16 32 64 128 256 1024 2048
	var material2048;

	//Added for performance
	var Block2048;
	var empty;

	document.onkeydown = inputKey;

	init();

	function init() {
		"use strict";

		//Memory Optimization
		FullBoxSize = new THREE.Vector3(0.9, 0.9, 0.01);
		score = 2;
		//Scene setup
		camera.position.z = 5;
		camera.position.x = 1.5;
		camera.position.y = 1.5;

		//Geometry
		geometry = new THREE.BoxGeometry(0.9, 0.9, 0.01);

		//Text Textures
		var dynamicTexture = [];
		for(var i = 0; i < 13; i++) {

			dynamicTexture[i] = new THREEx.DynamicTexture(128, 128);
			dynamicTexture[i].clear('white');

			if((Math.pow(2, i) > 0) && (Math.pow(2, i) < 10)) {
				//1 digit text
				dynamicTexture[i].context.font = "120px monospace";
				dynamicTexture[i].drawText(Math.pow(2, i), 30, 100, 'black');
			} else if((Math.pow(2, i) > 10) && (Math.pow(2, i) < 100)) {
				//2 digit text
				dynamicTexture[i].context.font = "100px monospace";
				dynamicTexture[i].drawText(Math.pow(2, i), 8, 96, 'black');
			} else if((Math.pow(2, i) > 100) && (Math.pow(2, i) < 1000)) {
				//3 digit text
				dynamicTexture[i].context.font = "70px monospace";
				dynamicTexture[i].drawText(Math.pow(2, i), 8, 86, 'black');
			} else if(Math.pow(2, i) > 1000) {
				//4 digit text
				dynamicTexture[i].context.font = "70px monospace";
				dynamicTexture[i].drawText(Math.pow(2, i), 8, 86, 'black');
			} else {
				//shouldn't happen, set to red if it does
				dynamicTexture[i].context.font = "50px monospace";
				dynamicTexture[i].drawText(Math.pow(2, i), 8, 80, 'red');
			}
			dynamicTexture[i].texture.needsUpdate = true;
		}

		//Block Materials
		material2048 = [];

		material2048[0] = new THREE.MeshBasicMaterial({
			color: 0x66FF66,
			map: dynamicTexture[1].texture
		});
		material2048[1] = new THREE.MeshBasicMaterial({
			color: 0x00CC00,
			map: dynamicTexture[2].texture
		});
		material2048[2] = new THREE.MeshBasicMaterial({
			color: 0x00FFCC,
			map: dynamicTexture[3].texture
		});
		material2048[3] = new THREE.MeshBasicMaterial({
			color: 0x00CCFF,
			map: dynamicTexture[4].texture
		});
		material2048[4] = new THREE.MeshBasicMaterial({
			color: 0x0099FF,
			map: dynamicTexture[5].texture
		});
		material2048[5] = new THREE.MeshBasicMaterial({
			color: 0x6666FF,
			map: dynamicTexture[6].texture
		});
		material2048[6] = new THREE.MeshBasicMaterial({
			color: 0xCC33FF,
			map: dynamicTexture[7].texture
		});
		material2048[7] = new THREE.MeshBasicMaterial({
			color: 0xCC0099,
			map: dynamicTexture[8].texture
		});
		material2048[8] = new THREE.MeshBasicMaterial({
			color: 0xFFFF66,
			map: dynamicTexture[9].texture
		});
		material2048[9] = new THREE.MeshBasicMaterial({
			color: 0xFF9966,
			map: dynamicTexture[10].texture
		});
		material2048[10] = new THREE.MeshBasicMaterial({
			color: 0x990000,
			map: dynamicTexture[11].texture
		});
		material2048[11] = new THREE.MeshBasicMaterial({
			color: 0x800000,
			map: dynamicTexture[12].texture
		});

		//Optimize: pre-generate blocks
		Block2048 = new Array(12);

		for(var i = 0; i < 13; i++) {

			Block2048[i] = new THREE.Mesh(geometry, material2048[i]);
			Block2048[i].name = Math.pow(2, i + 1) + "";
		}

		//Empty blocks
		wireGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.1);
		wireMaterial = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			wireframe: true
		});

		empty = new THREE.Mesh(wireGeometry, wireMaterial);
		empty.name = "empty";

		//Fill 4x4 array with blocks
		grid = new Array(4);
		for(var j = 0; j < 4; j++) {
			grid[j] = new Array(4);
			for(var i = 0; i < 4; i++) {
				grid[j][i] = empty.clone();
			}
		}

		//Backplanes
		var BackGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.01);
		var BackColor = new THREE.Color(0xcccccc);

		for(var j = 0; j < 4; j++) {
			for(var i = 0; i < 4; i++) {

				var BackMaterial = new THREE.MeshBasicMaterial({
					color: BackColor
				});
				var Backplane = new THREE.Mesh(BackGeometry, BackMaterial);

				Backplane.position.x = i;
				Backplane.position.y = j;
				Backplane.position.z = -0.05;
				scene.add(Backplane);
			}
		}

		//Score Boxes!

		//Geometry
		var scoreGeometry = new THREE.BoxGeometry(1.9, 1, 0.01);

		//Text Textures
		scoreTexture = new THREEx.DynamicTexture(256, 128);
		topScoreTexture = new THREEx.DynamicTexture(256, 128);
		//Materials
		scoreMaterial = new THREE.MeshBasicMaterial({
			map: scoreTexture.texture
		});
		topScoreMaterial = new THREE.MeshBasicMaterial({
			map: topScoreTexture.texture
		});

		//Make Meshs
		scoreBox = new THREE.Mesh(scoreGeometry, scoreMaterial);
		topScoreBox = new THREE.Mesh(scoreGeometry, topScoreMaterial);

		//Set Positions
		scoreBox.position.add(new THREE.Vector3(0.5, 4.5, 0));
		topScoreBox.position.add(new THREE.Vector3(2.5, 4.5, 0));

		//Add to Scene
		scene.add(scoreBox);
		scene.add(topScoreBox);

		document.getElementsByTagName("body");

		//Add initial block and update score board
		AddRandom();
		UpdateScore();
		UpdateTopScore();

		gest.start();

	}

	document.addEventListener('gest', function(gesture) {
		if(gesture.direction.toLowerCase().indexOf("left") > -1) {
			moveLeft();
		} else if(gesture.direction.toLowerCase().indexOf("right") > -1) {
			moveRight();
		} else if(gesture.direction.toLowerCase().indexOf("up") > -1) {
			moveUp();
		} else if(gesture.direction.toLowerCase().indexOf("down") > -1) {
			moveDown();
		}
	}, false);

	world.actionInjections.push(Update);

	//Block smooth move
	function Update() {

		for(var j = 0; j < 4; j++) {
			for(var i = 0; i < 4; i++) {

				if(grid[j][i] != null) {

					grid[j][i].position.lerp(new THREE.Vector3(i, j, 0), 0.2);
					grid[j][i].scale.lerp(FullBoxSize, 0.1);
				}
			}
		}
	}

	function moveLeft() {
		var change = 0;
		change += HorizontalMerge();
		change += MoveLeft();
		if(change > 0) {
			AddRandom();
		}
	}

	function moveUp() {
		var change = 0;
		change += VerticalMerge();
		change += MoveUp()
		if(change > 0) {
			AddRandom();
		}
	}

	function moveRight() {
		var change = 0;
		change += HorizontalMerge();
		change += MoveRight();
		if(change > 0) {
			AddRandom();
		}
	}

	function moveDown() {
		var change = 0;
		change += VerticalMerge();
		change += MoveDown()
		if(change > 0) {
			AddRandom();
		}
	}

	//Keyboard Inputs
	function inputKey(event) {
		"use strict";
		event = event || window.event;

		//keep track if any change has been done
		var change = 0;
		if(event.keyCode == '37') {
			//left arrow
			moveLeft();
		} else if(event.keyCode == '38') {
			//up arrow
			moveUp();
		} else if(event.keyCode == '39') {
			//right arrow
			moveRight();
		} else if(event.keyCode == '40') {
			//down arrow
			moveDown();
		} else if(event.keyCode == '13 ') {
			//Enter key
//			init();
			var mainScene = createWebsocketScene();
			worldArr.push(mainScene);
			var transition = new $$.Transition(mainScene, {}, $$.Loader.RESOURCE.textures["transition/transition5.png"]);
			$$.actionInjections.push(transition.render);
		}

		UpdateScore();

		if(score >= topScore) {
			topScore = score;
			UpdateTopScore();
		}

	}

	//Add block after each move
	function AddRandom() {
		"use strict";

		//Use simple array instead of Vector2
		var location = [];

		for(var j = 0; j < 4; j++) {
			for(var i = 0; i < 4; i++) {

				if(grid[j][i].name == "empty") {

					location.push([i, j]);
				}
			}
		}

		if(location.length > 0) {

			var random = location[Math.floor(Math.random() * location.length)];
			scene.remove(grid[random[1]][random[0]]);

			//grid[random[1]][random[0]] = new THREE.Mesh(geometry, material2048[0]);
			//grid[random[1]][random[0]].name = "2";

			grid[random[1]][random[0]] = Block2048[0].clone();

			grid[random[1]][random[0]].position.x = random[0];
			grid[random[1]][random[0]].position.y = random[1];
			grid[random[1]][random[0]].scale.x = 0.1;
			grid[random[1]][random[0]].scale.y = 0.1;
			scene.add(grid[random[1]][random[0]]);
			return 0;
		}

		return 1;

	}

	/*************************** Move Functions ********************************/

	function MoveLeft() {
		"use strict";
		var moveCount = 0;
		for(var j = 0; j < 4; j++) {

			for(var i = 1; i < 4; i++) {

				if(grid[j][i].name != "empty") {

					for(var c = 0; c < i; c++) {

						if(grid[j][c].name == "empty") {
							Swap([j, i], [j, c]);
							moveCount++;

						}
					}
				}
			}
		}
		return moveCount;
	}

	function MoveRight() {
		"use strict";
		var moveCount = 0;
		for(var j = 3; j >= 0; j--) {

			for(var i = 2; i >= 0; i--) {

				if(grid[j][i].name != "empty") {

					for(var c = 3; c > i; c--) {

						if(grid[j][c].name == "empty") {
							Swap([j, i], [j, c]);
							moveCount++;
						}
					}
				}
			}
		}
		return moveCount;
	}

	function MoveDown() {
		"use strict";
		var moveCount = 0;
		for(var i = 0; i < 4; i++) {

			for(var j = 1; j < 4; j++) {

				if(grid[j][i].name != "empty") {

					for(var c = 0; c < j; c++) {

						if(grid[c][i].name == "empty") {
							Swap([j, i], [c, i]);
							moveCount++;
						}
					}
				}
			}
		}
		return moveCount;
	}

	function MoveUp() {
		"use strict";
		var moveCount = 0;
		for(var j = 3; j >= 0; j--) {

			for(var i = 3; i >= 0; i--) {

				if(grid[j][i].name != "empty") {

					for(var c = 3; c > j; c--) {

						if(grid[c][i].name == "empty") {
							Swap([j, i], [c, i]);
							moveCount++;
						}
					}
				}
			}
		}
		return moveCount;
	}

	/*************************** Merge Functions ********************************/

	function HorizontalMerge() {
		"use strict";

		//this shouldn't go over 2 because we only get 2 merge per line
		var mergeCount = 0;

		for(var j = 0; j < 4; j++) {

			for(var i = 0; i < 3; i++) {

				if(grid[j][i].name != "empty") {

					for(var z = i + 1; z < 4; z++) {
						if(grid[j][z].name != "empty") {

							if(grid[j][i].name == grid[j][z].name) {
								mergeBlock([j, i], [j, z]);
								mergeCount++;
							}
							break;
						}
					}
				}
			}
		}
		return mergeCount;
	}

	function VerticalMerge() {
		"use strict";

		//this shouldn't go over 2 because we only get 2 merge per line
		var mergeCount = 0;

		for(var i = 0; i < 4; i++) {

			for(var j = 0; j < 3; j++) {

				if(grid[j][i].name != "empty") {

					for(var z = j + 1; z < 4; z++) {
						if(grid[z][i].name != "empty") {

							if(grid[j][i].name == grid[z][i].name) {
								mergeBlock([j, i], [z, i]);
								mergeCount++;
							}
							break;
						}
					}
				}
			}
		}
		return mergeCount;
	}

	function mergeBlock(a, b) {

		//Save last position
		var positionA = grid[a[0]][a[1]].position;
		var positionB = grid[b[0]][b[1]].position;
		//Remove from scene
		scene.remove(grid[a[0]][a[1]]);
		scene.remove(grid[b[0]][b[1]]);

		if(grid[a[0]][a[1]].name == "2") {

			grid[a[0]][a[1]] = Block2048[1].clone();

		} else if(grid[a[0]][a[1]].name == "4") {

			grid[a[0]][a[1]] = Block2048[2].clone();

		} else if(grid[a[0]][a[1]].name == "8") {

			grid[a[0]][a[1]] = Block2048[3].clone();

		} else if(grid[a[0]][a[1]].name == "16") {

			grid[a[0]][a[1]] = Block2048[4].clone();

		} else if(grid[a[0]][a[1]].name == "32") {

			grid[a[0]][a[1]] = Block2048[5].clone();

		} else if(grid[a[0]][a[1]].name == "64") {

			grid[a[0]][a[1]] = Block2048[6].clone();

		} else if(grid[a[0]][a[1]].name == "128") {

			grid[a[0]][a[1]] = Block2048[7].clone();

		} else if(grid[a[0]][a[1]].name == "256") {

			grid[a[0]][a[1]] = Block2048[8].clone();

		} else if(grid[a[0]][a[1]].name == "512") {

			grid[a[0]][a[1]] = Block2048[9].clone();

		} else if(grid[a[0]][a[1]].name == "1024") {

			grid[a[0]][a[1]] = Block2048[10].clone();

			//player win

		}

		grid[b[0]][b[1]] = empty.clone();

		//Scaledown Effect
		grid[a[0]][a[1]].scale.x = 1.2;
		grid[a[0]][a[1]].scale.y = 1.2;
		//Re-assign positions
		grid[a[0]][a[1]].position.add(positionA);
		grid[b[0]][b[1]].position.add(positionB);
		//Add to scene
		scene.add(grid[a[0]][a[1]]);

		//if (debug == true) {
		//    scene.add(grid[b[0]][b[1]]);
		//}
	}

	/******************************* Score function *****************************/

	function UpdateScore() {
		"use strict";
		score = 0;

		//Add up current score
		grid.forEach(function(array) {
			array.forEach(function(box) {
				if(box.name != "empty") {
					score += parseInt(box.name);
				}
			});
		});

		//Update Score text
		scoreTexture.clear('white');
		scoreTexture.context.font = "30px monospace";
		scoreTexture.drawText("Score:", 32, 52, 'black');
		scoreTexture.drawText(score, 32, 90, 'black');
		scoreTexture.texture.needsUpdate = true;
		//Assign Color
		scoreBox.material.color = ScoreColor(score);

	}

	function UpdateTopScore() {

		//Set Top Score
		//Moved into if statement of optimization
		//topScore = score;

		//Update Top Score text
		topScoreTexture.clear('white');
		topScoreTexture.context.font = "30px monospace";
		topScoreTexture.drawText("Best Score:", 32, 52, 'black');
		topScoreTexture.drawText(topScore, 32, 90, 'black');
		topScoreTexture.texture.needsUpdate = true;

		//Assign Color
		topScoreBox.material.color = ScoreColor(topScore);

	}

	//Get color according to score
	function ScoreColor(findscore) {

		for(var i = 1; i < 12; i++) {
			if(findscore < Math.pow(2, i) + 1) {
				return material2048[i - 1].color;
			}
		}
	}

	/********************** Helper/debug functions ****************************/

	function makeBlock(str) {

		var block;
		if(str == "full") {

			block = new THREE.Mesh(wireGeometry, wireMaterial);
			block.name = "empty";

			return block;
		}

	}

	function lerp(v0, v1, t) {
		"use strict";
		return(1 - t) * v0 + t * v1;
	}

	function Swap(a, b) {

		var tmp = grid[a[0]][a[1]];
		grid[a[0]][a[1]] = grid[b[0]][b[1]];
		grid[b[0]][b[1]] = tmp;

	}

	function CheckGridName(x, y) {

		return grid[y][x].name;
	}

	return world;
}