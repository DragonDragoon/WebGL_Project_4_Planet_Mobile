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

var lastTimestamp=null;

var debug = {showDelta : false};
var repaint;

/*****
 * 
 * MAIN
 * 
 *****/
function main() {
    
    /* uncomment to just run unit tests */
    var unitTest=false;
    //unitTest=true;
    if (unitTest)
    {
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
    
    if (1)
        SimpleRenderable_test1(renderables,shader);
    if (1)
        TestStack_test1(renderables,shader);
    /* enable these to test implementation of CoordinateSystem, etc. */
    if (0)
        CoordinateSystem_test1(renderables,shader,gl);
    if (0)
        CoordinateSystem_test2(renderables,shader,gl);        
        
    var skeleton=true;
    if(skeleton)
    {
        document.getElementById("App_Title").innerHTML += "-Skeleton";
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
    document.getElementById("PauseButton").addEventListener(
            "click",
            function () {
                console.log("PauseButton");
            });                                     
                    
    // Register function (event handler) to be called on a mouse press
    canvas.addEventListener(
            "mousedown",
            function (ev) {
                handleMouseDown(ev, gl, canvas, renderables);
                });
                
                
    /**
     **   Initiate Animation Loop
     **/
    repaint = function(timestamp)
    {
        if (lastTimestamp !== null) 
        {
            var
                delta = timestamp-lastTimestamp;
            lastTimestamp = timestamp;
            
            // Student Note: remove this line once you get orbiting animation working
            animation_test1(renderables,delta);

            drawFrame(gl,renderables);  
            
            
            if (debug.showDelta)
                console.log("Delta: "+delta);
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
    for(var i=0;i<renderables.length;i++)
        renderables[i].render();    
}

/**
 * Converts 1D or 2D array of Number's 'v' into a 1D Float32Array.
 * @param {Number[] | Number[][]} v
 * @returns {Float32Array}
 */
function flatten(v)
{
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

