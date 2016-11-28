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
          scale: new Vec2([1.0, 1.0]),
          orientation: 0.0,
          children: {
            /* solarSystemCS -> solCS */
            solCS: new CoordinateSystem({
              name: "Sol Coordinate System",
              origin: new Vec2([0.0, 0.0]),
              scale: new Vec2([0.25, 0.25]),
              orientation: 0.0,
              children: false,
              shapes: {
                /* sunCS -> sun */
                sun: new UnitDisc(gl, shader, {
                  name: "Sol",
                  center: [0.0, 0.0],
                  radius: 0.5,
                  numVertices: 7,
                  color: [1.0, 1.0, 0.0, 1.0]
                })
              }
            }),
            /* solarSystemCS -> earthOrbitCS */
            earthOrbitCS: new CoordinateSystem({
              name: "Earth Orbit Coordinate System",
              origin: new Vec2([0.0, 0.0]),
              scale: new Vec2([1.0, 1.0]),
              orientation: 0.0,
              children: {
                /* earthOrbitCS -> earthCS */
                earthCS: new CoordinateSystem({
                  name: "Earth Coordinate System",
                  origin: new Vec2([0.5, 0.0]),
                  scale: new Vec2([0.125, 0.125]),
                  orientation: 0.0,
                  children: false,
                  shapes: {
                    /* earthCS -> earth */
                    earth: new UnitDisc(gl, shader, {
                      name: "Earth",
                      center: [0.0, 0.0],
                      radius: 0.5,
                      numVertices: 7,
                      color: [0.0, 0.0, 1.0, 1.0]
                    }) // earth
                  }
                }), // earthCS
                /* earthOrbitCS -> moonOrbitCS */
                moonOrbitCS: new CoordinateSystem({
                  name: "Moon Orbit Coordinate System",
                  origin: new Vec2([0.5, 0.0]),
                  scale: new Vec2([1.0, 1.0]),
                  orientation: 0.0,
                  children: {
                    /* moonOrbitCS -> moonCS */
                    moonCS: new CoordinateSystem({
                      name: "Moon Coordinate System",
                      origin: new Vec2([0.125, 0.0]),
                      scale: new Vec2([0.0625, 0.0625]),
                      orientation: 0.0,
                      children: false,
                      shapes: {
                        /* moonCS -> moon */
                        moon: new UnitDisc(gl, shader, {
                          name: "Moon",
                          center: [0.0, 0.0],
                          radius: 0.5,
                          numVertices: 7,
                          color: [0.5, 0.5, 0.5, 1.0]
                        }) // moon
                      }
                    }) // moonCS
                  },
                  shapes: false
                }) // moonOrbitCS
              },
              shapes: false
            }) // earthOrbitCS
          },
          shapes: false
        }) // solarSystemOrbitCS
      },
      shapes: false
    }); // rootCS
    console.log(rootCS);
    renderables.push(rootCS);
    //selectables.push(rootCS.children.solarSystemCS.children.solCS.shapes.sun);
    //selectables.push(rootCS.children.solarSystemCS.children.earthOrbitCS.children.earthCS.shapes.earth);
    //selectables.push(rootCS.children.solarSystemCS.children.earthOrbitCS.children.moonOrbitCS.children.moonCS.shapes.moon);
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

      //rootCS.children.solarSystemCS.orientation = (rootCS.orientation + (15.0 * delta) / 1000.0) % 360;
      rootCS.children.solarSystemCS.children.earthOrbitCS.orientation = (rootCS.children.solarSystemCS.children.earthOrbitCS.orientation + (45.0 * delta) / 1000.0) % 360;
      //rootCS.children.solarSystemCS.children.earthOrbitCS.children.moonOrbitCS.orientation = (rootCS.children.solarSystemCS.children.earthOrbitCS.children.moonOrbitCS.orientation + (45.0 * delta) / 1000.0) % 360;

      drawFrame(gl, renderables);


      if (debug.showDelta)
        console.log("Delta: " + delta);
    }
    lastTimestamp = timestamp;
    requestAnimationFrame(repaint);
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

