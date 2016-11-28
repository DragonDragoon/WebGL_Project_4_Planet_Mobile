/**
 * @author Zachary Wartell, Jialei Li, K.R. Subrmanian
 * 
 * 
 */




/*****
 * 
 * GLOBALS
 * 
 *****/

var lastTimestamp = null;

var debug = { showDelta: false };
var repaint;

/* Added */
var rootCS;
var paused = false;
var earth_orbit_speed = 10.0;
var speed = 1.0;

/*****
 * 
 * MAIN
 * 
 *****/
function main() {

  /* uncomment to just run unit tests */
  var unitTest = false;
  //unitTest=true;
  if (unitTest) {
    math2d_test();
    return;
  }

  /**
   **      Initialize WebGL Components
   **/

  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  /**
   **    Initialize some test Drawable's
   **/
  var shader = new Shader(gl, "vertex-shader", "fragment-shader");
  var renderables = new Array();

  modelViewStack = new Mat3Stack(gl);

  if (0) {
    SimpleRenderable_test1(renderables, shader);
  }
  if (0) {
    TestStack_test1(renderables, shader);
  }
  /* enable these to test implementation of CoordinateSystem, etc. */
  if (0) {
    CoordinateSystem_test1(renderables, shader, gl);
  }
  if (0) {
    CoordinateSystem_test2(renderables, shader, gl);
  }
  if (0) {
    UnitDisc_test(renderables, shader, gl);
  }

  var skeleton = false;
  if (skeleton) {
    document.getElementById("App_Title").innerHTML += "-Skeleton";
  }

  /* Added */
  /* rootCS */
  var main = true;
  if (main) {
    rootCS = new CoordinateSystem({
      name: "Root Coordinate System",
      origin: new Vec2([0.0, 0.0]),
      scale: new Vec2([1.0, 1.0]),
      orientation: 0.0,
      children: {
        solarSystemCS: new CoordinateSystem({
          name: "Solar System Coordinate System",
          origin: new Vec2([0.0, 0.0]),
          scale: new Vec2([1.3, 1.3]),
          orientation: 0.0,
          children: {
            /* solarSystemCS -> solCS */
            solCS: new CoordinateSystem({
              name: "Sol Coordinate System",
              origin: new Vec2([0.0, 0.0]),
              scale: new Vec2([0.15, 0.15]),
              orientation: 0.0,
              rotation_speed: 0.0,
              children: false,
              shapes: {
                /* sunCS -> sun */
                sun: new UnitDisc(gl, shader, {
                  name: "Sol",
                  center: new Vec2([0.0, 0.0]),
                  radius: 0.5,
                  numVertices: 7,
                  color: [1.0, 1.0, 0.0, 1.0],
                  selectable: true
                })
              }
            }),
            /* solarSystemCS -> mercuryOrbitCS */
            mercuryOrbitCS: new CoordinateSystem({
              name: "Mercury Orbit Coordinate System",
              origin: new Vec2([0.0, 0.0]),
              scale: new Vec2([1.0, 1.0]),
              orientation: 0.0,
              rotation_speed: 365 / 88 * earth_orbit_speed,
              children: {
                /* mercuryOrbitCS -> mercuryCS */
                mercuryCS: new CoordinateSystem({
                  name: "Mercury Coordinate System",
                  origin: new Vec2([0.1, 0.0]),
                  scale: new Vec2([0.035, 0.030]),
                  orientation: 0.0,
                  rotation_speed: 0.0,
                  children: false,
                  shapes: {
                    /* mercuryCS -> mercury */
                    mercury: new UnitDisc(gl, shader, {
                      name: "Mercury",
                      center: new Vec2([0.0, 0.0]),
                      radius: 0.5,
                      numVertices: 7,
                      color: [1.0, 0.60, 0.0, 1.0],
                      selectable: true
                    }) // mercury
                  }
                }) // mercuryCS
              },
              shapes: false
            }), // mercuryOrbitCS
            /* solarSystemCS -> venusOrbitCS */
            venusOrbitCS: new CoordinateSystem({
              name: "Venus Orbit Coordinate System",
              origin: new Vec2([0.0, 0.0]),
              scale: new Vec2([1.0, 1.0]),
              orientation: 0.0,
              rotation_speed: 365 / 225 * earth_orbit_speed,
              children: {
                /* venusOrbitCS -> venusCS */
                venusCS: new CoordinateSystem({
                  name: "Venus Coordinate System",
                  origin: new Vec2([0.175, 0.0]),
                  scale: new Vec2([0.055, 0.065]),
                  orientation: 0.0,
                  rotation_speed: 365 / 116 * earth_orbit_speed,
                  children: false,
                  shapes: {
                    /* venusCS -> venus */
                    venus: new UnitDisc(gl, shader, {
                      name: "Venus",
                      center: new Vec2([0.0, 0.0]),
                      radius: 0.5,
                      numVertices: 7,
                      color: [1.0, 0.6, 0.6, 1.0],
                      selectable: true
                    }) // venus
                  }
                }) // venusCS
              },
              shapes: false
            }), // venusOrbitCS
            /* solarSystemCS -> earthOrbitCS */
            earthOrbitCS: new CoordinateSystem({
              name: "Earth Orbit Coordinate System",
              origin: new Vec2([0.0, 0.0]),
              scale: new Vec2([1.0, 1.0]),
              orientation: 0.0,
              rotation_speed: earth_orbit_speed,
              children: {
                /* earthOrbitCS -> earthCS */
                earthCS: new CoordinateSystem({
                  name: "Earth Coordinate System",
                  origin: new Vec2([0.3, 0.0]),
                  scale: new Vec2([0.075, 0.075]),
                  orientation: 0.0,
                  rotation_speed: 0.0,
                  children: false,
                  shapes: {
                    /* earthCS -> earth */
                    earth: new UnitDisc(gl, shader, {
                      name: "Earth",
                      center: new Vec2([0.0, 0.0]),
                      radius: 0.5,
                      numVertices: 7,
                      color: [0.0, 0.0, 1.0, 1.0],
                      selectable: true
                    }) // earth
                  }
                }), // earthCS
                /* earthOrbitCS -> moonOrbitCS */
                moonOrbitCS: new CoordinateSystem({
                  name: "Moon Orbit Coordinate System",
                  origin: new Vec2([0.3, 0.0]),
                  scale: new Vec2([1.0, 1.0]),
                  orientation: 0.0,
                  rotation_speed: 365 / 27 * earth_orbit_speed,
                  children: {
                    /* moonOrbitCS -> moonCS */
                    moonCS: new CoordinateSystem({
                      name: "Moon Coordinate System",
                      origin: new Vec2([0.075, 0.0]),
                      scale: new Vec2([0.0425, 0.0425]),
                      orientation: 0.0,
                      rotation_speed: 0.0,
                      children: false,
                      shapes: {
                        /* moonCS -> moon */
                        moon: new UnitDisc(gl, shader, {
                          name: "Moon",
                          center: new Vec2([0.0, 0.0]),
                          radius: 0.5,
                          numVertices: 7,
                          color: [0.5, 0.5, 0.5, 1.0],
                          selectable: true
                        }) // moon
                      }
                    }) // moonCS
                  },
                  shapes: false
                }) // moonOrbitCS
              },
              shapes: false
            }), // earthOrbitCS
            /* solarSystemCS -> marsOrbitCS */
            marsOrbitCS: new CoordinateSystem({
              name: "Mars Orbit Coordinate System",
              origin: new Vec2([0.0, 0.0]),
              scale: new Vec2([1.0, 1.0]),
              orientation: 0.0,
              rotation_speed: 365 / 687 * earth_orbit_speed,
              children: {
                /* marsOrbitCS -> marsCS */
                marsCS: new CoordinateSystem({
                  name: "Mars Coordinate System",
                  origin: new Vec2([0.4, 0.0]),
                  scale: new Vec2([0.0225, 0.0425]),
                  orientation: 0.0,
                  rotation_speed: 365 / 1 * earth_orbit_speed,
                  children: false,
                  shapes: {
                    /* marsCS -> mars */
                    mars: new UnitDisc(gl, shader, {
                      name: "Mars",
                      center: new Vec2([0.0, 0.0]),
                      radius: 0.5,
                      numVertices: 7,
                      color: [1.0, 0.0, 0.0, 1.0],
                      selectable: true
                    }) // mars
                  }
                }) // marsCS
              },
              shapes: false
            }), // marsOrbitCS
            /* solarSystemCS -> asteroidBeltOrbitCS */
            asteroidBeltOrbitCS: new CoordinateSystem({
              name: "Asteroid Belt Orbit Coordinate System",
              origin: new Vec2([0.0, 0.0]),
              scale: new Vec2([1.0, 1.0]),
              orientation: 0.0,
              rotation_speed: 365 / 400 * earth_orbit_speed,
              children: {
                /* asteroidBeltOrbitCS -> asteroid1CS */
                asteroid1CS: new CoordinateSystem({
                  name: "Asteroid 1 Coordinate System",
                  origin: new Vec2([0.475, 0.0]),
                  scale: new Vec2([0.0225, 0.0425]),
                  orientation: 0.0,
                  rotation_speed: 0.0,
                  children: false,
                  shapes: {
                    /* asteroidBeltCS -> asteroid1 */
                    asteroid1: new UnitSquare(gl, shader, {
                      name: "Asteroid 1",
                      center: new Vec2([0.0, 0.0]),
                      width: 1.0,
                      height: 1.0,
                      color: [0.8, 0.8, 0.8, 1.0],
                      selectable: true
                    }) // asteroid1
                  }
                }), // asteroid1CS
                /* asteroidBeltOrbitCS -> asteroid2CS */
                asteroid2CS: new CoordinateSystem({
                  name: "Asteroid 2 Coordinate System",
                  origin: new Vec2([0.0, 0.475]),
                  scale: new Vec2([0.0725, 0.0125]),
                  orientation: 0.0,
                  rotation_speed: 0.0,
                  children: false,
                  shapes: {
                    /* asteroidBeltCS -> asteroid2 */
                    asteroid2: new UnitSquare(gl, shader, {
                      name: "Asteroid 2",
                      center: new Vec2([0.0, 0.0]),
                      width: 1.0,
                      height: 1.0,
                      color: [0.8, 0.8, 0.8, 1.0],
                      selectable: true
                    }) // asteroid2
                  }
                }), // asteroid2CS
                /* asteroidBeltOrbitCS -> asteroid3CS */
                asteroid3CS: new CoordinateSystem({
                  name: "Asteroid 3 Coordinate System",
                  origin: new Vec2([0.0, -0.475]),
                  scale: new Vec2([0.0325, 0.0125]),
                  orientation: 0.0,
                  rotation_speed: 0.0,
                  children: false,
                  shapes: {
                    /* asteroidBeltCS -> asteroid3 */
                    asteroid3: new UnitSquare(gl, shader, {
                      name: "Asteroid 3",
                      center: new Vec2([0.0, 0.0]),
                      width: 1.0,
                      height: 1.0,
                      color: [0.8, 0.8, 0.8, 1.0],
                      selectable: true
                    }) // asteroid3
                  }
                }), // asteroid3CS
                /* asteroidBeltOrbitCS -> asteroid4CS */
                asteroid4CS: new CoordinateSystem({
                  name: "Asteroid 4 Coordinate System",
                  origin: new Vec2([-0.475, 0.0]),
                  scale: new Vec2([0.0225, 0.0225]),
                  orientation: 0.0,
                  rotation_speed: 0.0,
                  children: false,
                  shapes: {
                    /* asteroidBeltCS -> asteroid4 */
                    asteroid4: new UnitSquare(gl, shader, {
                      name: "Asteroid 4",
                      center: new Vec2([0.0, 0.0]),
                      width: 1.0,
                      height: 1.0,
                      color: [0.8, 0.8, 0.8, 1.0],
                      selectable: true
                    }) // asteroid4
                  }
                }) // asteroid4CS
                /* asteroidBeltOrbitCS -> asteroidXCS */
                // Other asteroids are added here
              },
              shapes: false
            }), // asteroidBeltOrbitCS
            /* solarSystemCS -> jupiterOrbitCS */
            jupiterOrbitCS: new CoordinateSystem({
              name: "Jupiter Orbit Coordinate System",
              origin: new Vec2([0.0, 0.0]),
              scale: new Vec2([1.0, 1.0]),
              orientation: 0.0,
              rotation_speed: 365 / 4380 * earth_orbit_speed,
              children: {
                /* jupiterOrbitCS -> jupiterCS */
                jupiterCS: new CoordinateSystem({
                  name: "Jupiter Coordinate System",
                  origin: new Vec2([0.6, 0.0]),
                  scale: new Vec2([0.1, 0.1]),
                  orientation: 0.0,
                  rotation_speed: 0.0,
                  children: false,
                  shapes: {
                    /* jupiterCS -> jupiter */
                    jupiter: new UnitDisc(gl, shader, {
                      name: "Jupiter",
                      center: new Vec2([0.0, 0.0]),
                      radius: 0.5,
                      numVertices: 7,
                      color: [1.0, 0.8, 0.6, 1.0],
                      selectable: true
                    }) // jupiter
                  }
                }), // jupiterCS
                /* jupiterOrbitCS -> europaOrbitCS */
                europaOrbitCS: new CoordinateSystem({
                  name: "Europa Orbit Coordinate System",
                  origin: new Vec2([0.6, 0.0]),
                  scale: new Vec2([1.0, 1.0]),
                  orientation: 0.0,
                  rotation_speed: 365 / 3.5 * earth_orbit_speed,
                  children: {
                    /* europaOrbitCS -> europaCS */
                    europaCS: new CoordinateSystem({
                      name: "Europa Coordinate System",
                      origin: new Vec2([0.075, 0.0]),
                      scale: new Vec2([0.0325, 0.0325]),
                      orientation: 0.0,
                      rotation_speed: 0.0,
                      children: false,
                      shapes: {
                        /* europaCS -> europa */
                        europa: new UnitDisc(gl, shader, {
                          name: "Europa",
                          center: new Vec2([0.0, 0.0]),
                          radius: 0.5,
                          numVertices: 7,
                          color: [0.5, 0.5, 0.5, 1.0],
                          selectable: true
                        }) // europa
                      }
                    }) // europaCS
                  },
                  shapes: false
                }), // europaOrbitCS
                /* jupiterOrbitCS -> euporieOrbitCS */
                euporieOrbitCS: new CoordinateSystem({
                  name: "Euporie Orbit Coordinate System",
                  origin: new Vec2([0.6, 0.0]),
                  scale: new Vec2([1.0, 1.0]),
                  orientation: 0.0,
                  rotation_speed: 365 / -538 * earth_orbit_speed,
                  children: {
                    /* euporieOrbitCS -> euporieCS */
                    euporieCS: new CoordinateSystem({
                      name: "Euporie Coordinate System",
                      origin: new Vec2([0.125, 0.0]),
                      scale: new Vec2([0.0225, 0.0225]),
                      orientation: 0.0,
                      rotation_speed: 0.0,
                      children: {
                        /* jupiterOrbitCS -> junoOrbitCS */
                        junoOrbitCS: new CoordinateSystem({
                          name: "Juno Orbit Coordinate System",
                          origin: new Vec2([0.0, 0.0]),
                          scale: new Vec2([1.0, 1.0]),
                          orientation: 0.0,
                          rotation_speed: 365 / -36 * earth_orbit_speed,
                          children: {
                            /* junoOrbitCS -> junoCS */
                            junoCS: new CoordinateSystem({
                              name: "Juno Coordinate System",
                              origin: new Vec2([0.925, 0.0]),
                              scale: new Vec2([0.45, 0.95]),
                              orientation: 0.0,
                              rotation_speed: 0.0,
                              children: {
                              },
                              shapes: {
                                /* junoCS -> juno */
                                juno: new UnitDisc(gl, shader, {
                                  name: "Juno",
                                  center: new Vec2([0.0, 0.0]),
                                  radius: 0.5,
                                  numVertices: 7,
                                  color: [1.0, 1.0, 1.0, 1.0],
                                  selectable: true
                                }) // juno
                              }
                            }) // junoCS
                          },
                          shapes: false
                        }) // junoOrbitCS
                      },
                      shapes: {
                        /* euporieCS -> euporie */
                        euporie: new UnitDisc(gl, shader, {
                          name: "Euporie",
                          center: new Vec2([0.0, 0.0]),
                          radius: 0.5,
                          numVertices: 7,
                          color: [0.5, 0.5, 0.5, 1.0],
                          selectable: true
                        }) // euporie
                      }
                    }) // euporieCS
                  },
                  shapes: false
                }) // euporieOrbitCS
              },
              shapes: false
            }) // jupiterOrbitCS
          },
          shapes: false
        }) // solarSystemOrbitCS
      },
      shapes: false
    }); // rootCS

    var num_asteroids = 4;
    var asteroid_belt_radius = 0.475;

    for (var i = 0; i <= num_asteroids; i++) {
      var num_asteroid = i + 5;
      var angle = (360 * Math.random()) * ((i + 1) / 180 * Math.PI);
      //[this.center.x + this.radius * Math.sin(angle), this.center.y + this.radius * Math.cos(angle)]
      /* asteroidBeltOrbitCS -> asteroidXCS */
      rootCS.children.solarSystemCS.children.asteroidBeltOrbitCS.children["asteroid" + num_asteroid + "CS"] = new CoordinateSystem({
        name: "Asteroid " + num_asteroid + " Coordinate System",
        origin: new Vec2([0.0 + asteroid_belt_radius * Math.sin(angle), 0.0 + asteroid_belt_radius * Math.cos(angle)]),
        scale: new Vec2([0.06 * Math.random(), 0.06 * Math.random()]),
        orientation: 360 * Math.random(),
        rotation_speed: Math.random() * (90 - -90) + -90,
        children: false,
        shapes: {
        }
      }) // asteroidXCS);
      /* asteroidBeltCS -> asteroidX */
      rootCS.children.solarSystemCS.children.asteroidBeltOrbitCS.children["asteroid" + num_asteroid + "CS"].shapes["asteroid" + num_asteroid] = new UnitSquare(gl, shader, {
        name: "Asteroid " + num_asteroid,
        center: new Vec2([0.0, 0.0]),
        width: 1.0,
        height: 1.0,
        color: [Math.random(), Math.random(), Math.random(), 1.0],
        selectable: true
      }) // asteroidX
    }

    console.log(rootCS);

    renderables.push(rootCS);
    selectables = rootCS.selectables(new Array());
  }

  /**
   **    Initialize Misc. OpenGL state
   **/
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  /**
   **      Set Event Handlers
   **
   **  Student Note: the WebGL book uses an older syntax. The newer syntax, explicitly calling addEventListener, is preferred.
   **  See https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   **/
  // set event handlers buttons
  document.getElementById("PauseButton").addEventListener("click", function () {
    console.log("PauseButton");
    if (paused) {
      paused = false;
      lastTimestamp = null;
      document.getElementById("PauseButton").innerHTML = "Pause";
      requestAnimationFrame(repaint);
    } else {
      paused = true;
      document.getElementById("PauseButton").innerHTML = "Play";
    }
  });

  document.getElementById("SpeedRange").value = speed;
  document.getElementById("SpeedRange").addEventListener("input", function () {
    speed = document.getElementById("SpeedRange").value;
    document.getElementById("SpeedRangeText").innerHTML = speed;
  });

  // Register function (event handler) to be called on a mouse press
  canvas.addEventListener("mousedown", function (ev) {
    handleMouseDown(ev, gl, canvas, renderables);
  });


  /**
   **   Initiate Animation Loop
   **/
  repaint = function (timestamp) {
    if (lastTimestamp !== null) {
      var delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Student Note: remove this line once you get orbiting animation working
      //animation_test1(renderables, delta);

      rootCS.animate(delta, speed);

      drawFrame(gl, renderables);

      if (debug.showDelta) {
        console.log("Delta: " + delta);
      }
    }

    if (paused == false) {
      lastTimestamp = timestamp;
      requestAnimationFrame(repaint);
    } else {
      lastTimestamp = null;
    }
  };

  requestAnimationFrame(repaint);
}



/*****
 * 
 * FUNCTIONS
 * 
 *****/


/*
 * Handle mouse button press event.
 * 
 * @param {MouseEvent} ev - event that triggered event handler
 * @param {Object} gl - gl context
 * @param {HTMLCanvasElement} canvas - canvas 
 * @param {Array} renderables - Array of Drawable objects
 * @returns {undefined}
 */
function handleMouseDown(ev, gl, canvas, renderables) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  // Student Note: 'ev' is a MouseEvent (see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)

  // convert from canvas mouse coordinates to GL normalized device coordinates
  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  console.log("click\n" +
              "  GUI: " + ev.clientX + ", " + ev.clientY + "\n" +
              "  NDC: " + x + ", " + y);

  // \todo test all Shape objects for selection using their point_inside method's    
  selectables.forEach(function (shape) {
    console.log(shape.point_inside(new Vec2([x, y])));
  });

  requestAnimationFrame(repaint);
}

/*
 * Draw all objects
 * @param {Object} gl - WebGL context
 * @param {Array} renderables - Array of Drawable objects
 * @returns {undefined}
 */
function drawFrame(gl, renderables) {

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // init model view stack
  modelViewStack.loadIdentity();

  // draw all Drawables
  for (var i = 0; i < renderables.length; i++)
    renderables[i].render();
}

/**
 * Converts 1D or 2D array of Number's 'v' into a 1D Float32Array.
 * @param {Number[] | Number[][]} v
 * @returns {Float32Array}
 */
function flatten(v) {
  var n = v.length;
  var elemsAreArrays = false;

  if (Array.isArray(v[0])) {
    elemsAreArrays = true;
    n *= v[0].length;
  }

  var floats = new Float32Array(n);

  if (elemsAreArrays) {
    var idx = 0;
    for (var i = 0; i < v.length; ++i) {
      for (var j = 0; j < v[i].length; ++j) {
        floats[idx++] = v[i][j];
      }
    }
  }
  else {
    for (var i = 0; i < v.length; ++i) {
      floats[i] = v[i];
    }
  }

  return floats;
}

