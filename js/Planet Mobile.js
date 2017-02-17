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
var asteroids = {};

var paused = false;

var earth_orbit_speed = 5.0;
var speed = 1.0;

var num_asteroids = 25;
var asteroid_belt_radius = 0.475;

var detail = 1.0;

var selectables = new Array();

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
  createHeiarchy(gl, shader, renderables, true); // Create hearchy of CoordinateSystems

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

  /* Reset button -> Resets to defaults and creates new heiarchy of CoordinateSystems */
  document.getElementById("ResetButton").addEventListener("click", function () {
    console.log("Reset");
    lastTimestamp = null;
    rootCS = null;
    asteroids = {};
    paused = false;
    earth_orbit_speed = 5.0;
    speed = 1.0;
    num_asteroids = 10;
    asteroid_belt_radius = 0.475;
    detail = 1.0;
    selectables = new Array();
    createHeiarchy(gl, shader, renderables, true);

    document.getElementById("SpeedRange").value = speed;
    document.getElementById("SpeedRangeText").innerHTML = speed;
    document.getElementById("DetailRange").value = detail;
    document.getElementById("DetailRangeText").innerHTML = detail;
    document.getElementById("AsteroidsRange").value = num_asteroids;
    document.getElementById("AsteroidsRangeText").innerHTML = num_asteroids;
    document.getElementById("SelectedText").innerHTML = "None";
  });

  /* Speed Range -> Multiplies the speed of the rotations (animations) */
  document.getElementById("SpeedRange").value = speed;
  document.getElementById("SpeedRange").addEventListener("input", function () {
    speed = document.getElementById("SpeedRange").value;
    document.getElementById("SpeedRangeText").innerHTML = speed;
  });

  /* Detail Range -> Multiply the number of verticies by a factor to control how many vertices are created for circles */
  document.getElementById("DetailRange").value = detail;
  document.getElementById("DetailRange").addEventListener("input", function () {
    var pastDetail = detail;
    detail = document.getElementById("DetailRange").value;
    document.getElementById("DetailRangeText").innerHTML = detail;

    /* Create new heiarchy, no need to create new asteroids */
    if (detail != pastDetail) {
      createHeiarchy(gl, shader, renderables, false);
    }
  });

  /* Asteroids Range -> Control the number of asteroids in the heiarchy */
  document.getElementById("AsteroidsRange").value = num_asteroids;
  document.getElementById("AsteroidsRange").addEventListener("input", function () {
    num_asteroids = document.getElementById("AsteroidsRange").value;
    document.getElementById("AsteroidsRangeText").innerHTML = num_asteroids;

    /* Create new heiarchy with new asteroids */
    if (num_asteroids !== Object.keys(rootCS.children.solarSystemCS.children.asteroidBeltOrbitCS.children).length) {
      createHeiarchy(gl, shader, renderables, true);
    }
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

      rootCS.animate(delta, speed); // Animate CoordinateSystem recursively

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

  //console.log("click\n" +
  //            "  GUI: " + ev.clientX + ", " + ev.clientY + "\n" +
  //            "  NDC: " + x + ", " + y);

  // \todo test all Shape objects for selection using their point_inside method's
  var selected = false;
  selectables.forEach(function (shape) {
    if (shape.point_inside(new Vec2([x, y]))) {
      selected = shape;
    }
  });

  if (selected) {
    //console.log("User selected: " + selected.name);
    document.getElementById("SelectedText").innerHTML = selected.name;
  } else {
    //console.log("User did not select anything.");
    document.getElementById("SelectedText").innerHTML = "None";
  }
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

/**
 * @author William Woodard
 * Creates a heiarchy of CoordinateSystems in an easily visualizable data structure.
 * @param {gl, shader, renderables, createAsteroids}
 * @returns {None}
 */
function createHeiarchy(gl, shader, renderables, createAsteroids) {
  var keepOrientation = (rootCS instanceof CoordinateSystem) ? true : false;

  renderables.pop(); // Pop last renderable off array (rootCS if applicable)

  /* Create the number of asteroids specified */
  if (createAsteroids) {
    asteroids = {};
    for (var i = 0; i < num_asteroids; i++) {
      var asteroid_shapes = {};
      var num_asteroid = i + 1;
      var angle = (360 * Math.random()) * (i / 180 * Math.PI);
      /* asteroidBeltCS -> asteroidX */
      asteroid_shapes["asteroid" + num_asteroid] = new UnitSquare(gl, shader, {
        name: "Asteroid " + num_asteroid,
        center: new Vec2([0.0, 0.0]),
        width: 1.0,
        height: 1.0,
        color: [Math.random() * (1.0 - 0.25) + 0.25, Math.random() * (1.0 - 0.25) + 0.25, Math.random() * (1.0 - 0.25) + 0.25, 1.0],
        selectable: true
      }) // asteroidX
      /* asteroidBeltOrbitCS -> asteroidXCS */
      asteroids["asteroid" + num_asteroid + "CS"] = new CoordinateSystem({
        name: "Asteroid " + num_asteroid + " Coordinate System",
        origin: new Vec2([0.0 + asteroid_belt_radius * Math.sin(angle), 0.0 + asteroid_belt_radius * Math.cos(angle)]),
        scale: new Vec2([Math.random() * (0.015 - 0.01) + 0.01, Math.random() * (0.04 - 0.01) + 0.01]),
        orientation: 360 * Math.random(),
        rotation_speed: Math.random() * (90.0 - -90.0) + -90.0,
        children: false,
        shapes: asteroid_shapes
      }) // asteroidXCS
    }
  }

  /* rootCS */
  rootCS = new CoordinateSystem({
    name: "Root Coordinate System",
    origin: new Vec2([0.0, 0.0]),
    scale: new Vec2([1.0, 1.0]),
    orientation: 0.0,
    children: {
      /* rootCS -> solarSystemCS */
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
                numVertices: Math.floor(20 * detail),
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
            orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.mercuryOrbitCS.orientation : 0.0,
            rotation_speed: 365 / 88 * earth_orbit_speed,
            children: {
              /* mercuryOrbitCS -> mercuryCS */
              mercuryCS: new CoordinateSystem({
                name: "Mercury Coordinate System",
                origin: new Vec2([0.1, 0.0]),
                scale: new Vec2([0.035, 0.030]),
                orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.mercuryOrbitCS.children.mercuryCS.orientation : 0.0,
                rotation_speed: 0.0,
                children: false,
                shapes: {
                  /* mercuryCS -> mercury */
                  mercury: new UnitDisc(gl, shader, {
                    name: "Mercury",
                    center: new Vec2([0.0, 0.0]),
                    radius: 0.5,
                    numVertices: Math.floor(14 * detail),
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
            orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.venusOrbitCS.orientation : 0.0,
            rotation_speed: 365 / 225 * earth_orbit_speed,
            children: {
              /* venusOrbitCS -> venusCS */
              venusCS: new CoordinateSystem({
                name: "Venus Coordinate System",
                origin: new Vec2([0.175, 0.0]),
                scale: new Vec2([0.055, 0.065]),
                orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.venusOrbitCS.children.venusCS.orientation : 0.0,
                rotation_speed: 365 / 116 * earth_orbit_speed,
                children: false,
                shapes: {
                  /* venusCS -> venus */
                  venus: new UnitDisc(gl, shader, {
                    name: "Venus",
                    center: new Vec2([0.0, 0.0]),
                    radius: 0.5,
                    numVertices: Math.floor(14 * detail),
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
            orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.earthOrbitCS.orientation : 0.0,
            rotation_speed: earth_orbit_speed,
            children: {
              /* earthOrbitCS -> earthCS */
              earthCS: new CoordinateSystem({
                name: "Earth Coordinate System",
                origin: new Vec2([0.3, 0.0]),
                scale: new Vec2([0.075, 0.075]),
                orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.earthOrbitCS.children.earthCS.orientation : 0.0,
                rotation_speed: 0.0,
                children: false,
                shapes: {
                  /* earthCS -> earth */
                  earth: new UnitDisc(gl, shader, {
                    name: "Earth",
                    center: new Vec2([0.0, 0.0]),
                    radius: 0.5,
                    numVertices: Math.floor(14 * detail),
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
                orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.earthOrbitCS.children.moonOrbitCS.orientation : 0.0,
                rotation_speed: 365 / 27 * earth_orbit_speed,
                children: {
                  /* moonOrbitCS -> moonCS */
                  moonCS: new CoordinateSystem({
                    name: "Moon Coordinate System",
                    origin: new Vec2([0.075, 0.0]),
                    scale: new Vec2([0.0425, 0.0425]),
                    orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.earthOrbitCS.children.moonOrbitCS.children.moonCS.orientation : 0.0,
                    rotation_speed: 0.0,
                    children: {
                      /* moonOrbitCS -> satelliteOrbitCS */
                      satelliteOrbitCS: new CoordinateSystem({
                        name: "Satellite Orbit Coordinate System",
                        origin: new Vec2([0.0, 0.0]),
                        scale: new Vec2([1.0, 1.0]),
                        orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.earthOrbitCS.children.moonOrbitCS.children.moonCS.children.satelliteOrbitCS.orientation : 0.0,
                        rotation_speed: 365 / -2 * earth_orbit_speed,
                        children: {
                          /* satelliteOrbitCS -> satelliteCS */
                          satellite1CS: new CoordinateSystem({
                            name: "Satellite 1 Coordinate System",
                            origin: new Vec2([0.615, 0.0]),
                            scale: new Vec2([0.15, 0.35]),
                            orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.earthOrbitCS.children.moonOrbitCS.children.moonCS.children.satelliteOrbitCS.children.satellite1CS.orientation : 0.0,
                            rotation_speed: 0.0,
                            children: {
                            },
                            shapes: {
                              /* satelliteCS -> satellite */
                              satellite1: new UnitDisc(gl, shader, {
                                name: "Satellite 1",
                                center: new Vec2([0.0, 0.0]),
                                radius: 0.5,
                                numVertices: Math.floor(7 * detail),
                                color: [1.0, 1.0, 1.0, 1.0],
                                selectable: true
                              }) // satellite
                            }
                          }), // satelliteCS
                          /* satelliteOrbitCS -> satellite2CS */
                          satellite2CS: new CoordinateSystem({
                            name: "Satellite 2 Coordinate System",
                            origin: new Vec2([-0.615, 0.3]),
                            scale: new Vec2([0.15, 0.35]),
                            orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.earthOrbitCS.children.moonOrbitCS.children.moonCS.children.satelliteOrbitCS.children.satellite2CS.orientation : 0.0,
                            rotation_speed: 0.0,
                            children: {
                            },
                            shapes: {
                              /* satelliteCS -> satellite */
                              satellite2: new UnitDisc(gl, shader, {
                                name: "Satellite 2",
                                center: new Vec2([0.0, 0.0]),
                                radius: 0.5,
                                numVertices: Math.floor(7 * detail),
                                color: [1.0, 1.0, 1.0, 1.0],
                                selectable: true
                              }) // satellite
                            }
                          }) // satelliteCS
                        },
                        shapes: false
                      }) // satelliteOrbitCS
                    },
                    shapes: {
                      /* moonCS -> moon */
                      moon: new UnitDisc(gl, shader, {
                        name: "Moon",
                        center: new Vec2([0.0, 0.0]),
                        radius: 0.5,
                        numVertices: Math.floor(14 * detail),
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
            orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.marsOrbitCS.orientation : 0.0,
            rotation_speed: 365 / 687 * earth_orbit_speed,
            children: {
              /* marsOrbitCS -> marsCS */
              marsCS: new CoordinateSystem({
                name: "Mars Coordinate System",
                origin: new Vec2([0.4, 0.0]),
                scale: new Vec2([0.0225, 0.0425]),
                orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.marsOrbitCS.children.marsCS.orientation : 0.0,
                rotation_speed: 365 / 2 * earth_orbit_speed,
                children: false,
                shapes: {
                  /* marsCS -> mars */
                  mars: new UnitDisc(gl, shader, {
                    name: "Mars",
                    center: new Vec2([0.0, 0.0]),
                    radius: 0.5,
                    numVertices: Math.floor(14 * detail),
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
            orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.asteroidBeltOrbitCS.orientation : 0.0,
            rotation_speed: 365 / 400 * earth_orbit_speed,
            /* asteroidBeltOrbitCS -> asteroidXCS */
            children: asteroids, // <----------------- Asteroids are added here
            shapes: false
          }), // asteroidBeltOrbitCS
          /* solarSystemCS -> jupiterOrbitCS */
          jupiterOrbitCS: new CoordinateSystem({
            name: "Jupiter Orbit Coordinate System",
            origin: new Vec2([0.0, 0.0]),
            scale: new Vec2([1.0, 1.0]),
            orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.jupiterOrbitCS.orientation : 0.0,
            rotation_speed: 365 / 4380 * earth_orbit_speed,
            children: {
              /* jupiterOrbitCS -> jupiterCS */
              jupiterCS: new CoordinateSystem({
                name: "Jupiter Coordinate System",
                origin: new Vec2([0.6, 0.0]),
                scale: new Vec2([0.1, 0.1]),
                orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.jupiterOrbitCS.children.jupiterCS.orientation : 0.0,
                rotation_speed: 0.0,
                children: false,
                shapes: {
                  /* jupiterCS -> jupiter */
                  jupiter: new UnitDisc(gl, shader, {
                    name: "Jupiter",
                    center: new Vec2([0.0, 0.0]),
                    radius: 0.5,
                    numVertices: Math.floor(20 * detail),
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
                orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.jupiterOrbitCS.children.europaOrbitCS.orientation : 0.0,
                rotation_speed: 365 / 3.5 * earth_orbit_speed,
                children: {
                  /* europaOrbitCS -> europaCS */
                  europaCS: new CoordinateSystem({
                    name: "Europa Coordinate System",
                    origin: new Vec2([0.075, 0.0]),
                    scale: new Vec2([0.0325, 0.0325]),
                    orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.jupiterOrbitCS.children.europaOrbitCS.children.europaCS.orientation : 0.0,
                    rotation_speed: 0.0,
                    children: false,
                    shapes: {
                      /* europaCS -> europa */
                      europa: new UnitDisc(gl, shader, {
                        name: "Europa",
                        center: new Vec2([0.0, 0.0]),
                        radius: 0.5,
                        numVertices: Math.floor(12 * detail),
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
                orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.jupiterOrbitCS.children.euporieOrbitCS.orientation : 0.0,
                rotation_speed: 365 / -538 * earth_orbit_speed,
                children: {
                  /* euporieOrbitCS -> euporieCS */
                  euporieCS: new CoordinateSystem({
                    name: "Euporie Coordinate System",
                    origin: new Vec2([0.125, 0.0]),
                    scale: new Vec2([0.0225, 0.0225]),
                    orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.jupiterOrbitCS.children.euporieOrbitCS.children.euporieCS.orientation : 0.0,
                    rotation_speed: 0.0,
                    children: {
                      /* jupiterOrbitCS -> junoOrbitCS */
                      junoOrbitCS: new CoordinateSystem({
                        name: "Juno Orbit Coordinate System",
                        origin: new Vec2([0.0, 0.0]),
                        scale: new Vec2([1.0, 1.0]),
                        orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.jupiterOrbitCS.children.euporieOrbitCS.children.euporieCS.children.junoOrbitCS.orientation : 0.0,
                        rotation_speed: 365 / -36 * earth_orbit_speed,
                        children: {
                          /* junoOrbitCS -> junoCS */
                          junoCS: new CoordinateSystem({
                            name: "Juno Coordinate System",
                            origin: new Vec2([0.925, 0.0]),
                            scale: new Vec2([0.45, 0.95]),
                            orientation: (keepOrientation) ? rootCS.children.solarSystemCS.children.jupiterOrbitCS.children.euporieOrbitCS.children.euporieCS.children.junoOrbitCS.children.junoCS.orientation : 0.0,
                            rotation_speed: 0.0,
                            children: {
                            },
                            shapes: {
                              /* junoCS -> juno */
                              juno: new UnitDisc(gl, shader, {
                                name: "Juno",
                                center: new Vec2([0.0, 0.0]),
                                radius: 0.5,
                                numVertices: Math.floor(7 * detail),
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
                        numVertices: Math.floor(14 * detail),
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

  //console.log(rootCS);

  renderables.push(rootCS); // Push root coordinate system to renderables
  selectables = rootCS.selectables(new Array()); // Recursively return array of selectables
}
