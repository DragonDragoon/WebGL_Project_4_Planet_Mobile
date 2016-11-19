/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*****
 * 
 * GLOBALS
 * 
 *****/

/*
 * modelviewStack serves as a modelView matrix stack
 * 
 * This should be initialize in main().
 * @type Mat3Stack
 */
var modelViewStack;

/*****
 * 
 * Object Prototypes
 * 
 *****/

/*
 * Constructor for Shader specific Exception
 * @returns {ShaderException}
 */
function ShaderException() {   
   this.name = "ShaderException";
}

/* @author Zachary Wartell
 * Constructor new Shader Object
 * 
 * Shader is a minimalist Object that encapsulates a GLSL Shader Program.
 * A Shader Object is used and shared by one or more Renderable's.
 * 
 * @param {Object} gl - WebGLContext
 * @param {String} vshaderID - vertex shader source code's HTML Element ID
 * @param {String} fshaderID - fragment shader source code's HTML Element ID
 */
var Shader = function(gl,vshaderID,fshaderID)
{    
    /*
     *  create GLSL Program
     */     
    var vertElem = document.getElementById(vshaderID);
    if (!vertElem) {
        alert("Unable to load vertex shader " + vshaderID);
        return false;
    }

    var fragElem = document.getElementById(fshaderID);
    if (!fragElem) {
        alert("Unable to load vertex shader " + fshaderID);
        throw new ShaderException();        
    }

    this.program = createProgram(gl, vertElem.text, fragElem.text);
    if (!this.program) {
        alert('Failed to create program');
        throw new ShaderException();
    }
    
    /*
     *  get GL shader variable locations
     */ 
    this.a_Position = gl.getAttribLocation(this.program, 'a_Position');
    if (this.a_Position < 0) {
        alert('Failed to get the storage location of a_Position');
        throw new ShaderException();
    }
    
    /*
     *  This uniform is designed to be manipulated by a Mat3Stack Object, rather than
     *  directly by methods in Shader or SimpleRenderable
     */
    this.u_modelView = gl.getUniformLocation(this.program, 'u_modelView');
    if (this.u_modelView < 0) {
        alert('Failed to get the storage location of u_modelView');
        throw new ShaderException();
    }    

    this.u_FragColor = gl.getUniformLocation(this.program, 'u_FragColor');
    if (!this.u_FragColor) {
        alert('Failed to get the storage location of u_FragColor');
        throw new ShaderException();
    }    

    this.gl = gl;
};

/* @author Zachary Wartell
 * Constructor new Renderable Object
 * 
 * Renderable is an abstract class.  It has a method, 'render()' which draws something to the OpenGL Canvas
 *   
 */
var Renderable = function()
{    
};

/* @author Zachary Wartell
 * 
 * render this Renderable
 */
Renderable.prototype.render = function ()
{
    throw new Error("Unimplemented abstract class method");
    return;
};

/* @author Zachary Wartell
 * Constructor new ShaderRenderable Object
 * 
 * ShaderRenderable is a minimalist Object that uses a GL Shader Program encapsulated in a Shader Object
 * and a global Mat3Stack, called modelViewMatrix, for managing the model view transform.
 * 
 * Multiple ShaderRenderable's can share a common Shader object.
 * 
 * A ShaderRenderable's Shader must:
 *      - contain a property .u_modelView that is a WebGLUniformLocation
 *      - this WebGLUniformLocation must be associated with a uniform mat3 called u_modelView in the vertex shader
 *        that is used for the model view transform 
 * 
 * Sub-classes .render method must call the ShaderRenderable.render_begin() method.
 * 
 * @param {Object} shader - a Shader object
 */
var ShaderRenderable = function(shader)
{    
    Renderable.call(this);
    this.shader = shader;
};
ShaderRenderable.prototype = Object.create(Renderable.prototype);

/* @author Zachary Wartell
 * 
 * This method must be called by ShaderRenderable sub-classes .render method.
 */
ShaderRenderable.prototype.render_begin = function ()
{        
    modelViewStack.updateShader(this.shader.u_modelView);
};

/* @author Zachary Wartell
 * Construct new SimpleRenderable Object
 * 
 * SimpleRenderable is a minimalist Object that encapsulates a GL Shader Program and a GL Vertex Buffer.
 * Multiple SimpleRenderable's can share a common Shader object.
 * 
 * Student Note:  Feel free to modify this class OR create a new sub-class of Rendererable using SimpleRenderable as an example.
 *  
 * @param {Object} shader - a Shader object
 */
var SimpleRenderable = function(shader)
{    
    ShaderRenderable.call(this,shader);
    
    var gl = this.shader.gl;
    
    /* color to use for this SimpleRenderable */
    this.color = new Float32Array(4);
    /* Array of 2D vertex coordinates (each coordinate is Array size 2) */
    this.vertices = new Array();   
    /* default GL primitive type */
    this.primitive = gl.TRIANGLES;
        
    /*
     *  create GL buffer (but don't transfer data into it, see updateBuffers).
     */     
    this.vertexBuffer = gl.createBuffer();
    if (!this.vertexBuffer) {
        alert('Failed to create the buffer object');
        throw new ShaderException();
    }      
};
SimpleRenderable.prototype = Object.create(ShaderRenderable.prototype);

/* @author Zachary Wartell
 * update the GL buffers based on the current JS vertex data
 * 
 * This only has to be called when the JS vertex data changes.
 * Further, for GL efficiency it should only be called when needed.
 * 
 * preconditions:  GLSL program and vertex buffer are already created
 */
SimpleRenderable.prototype.updateBuffers = function ()
{
    var gl = this.shader.gl;
        
    // bind to the GL ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    // copy vertex data into ARRAY_BUFFER
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);
};

/* @author Zachary Wartell
 * draw this SimpleRenderable
 * 
 * preconditions:  GLSL program and vertex buffer are already created
 * @returns {undefined}
 */
SimpleRenderable.prototype.render = function ()
{
    this.render_begin();
    
    var gl = this.shader.gl;
    
    // enable shader
    gl.useProgram(this.shader.program);
    
    // draw primitives
    if (this.vertices.length) 
    {	                
        // bind the vertex buffer to the GL ARRAY_BUFFER 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        // use the vertexBuffer for the vertex attribute variable 'a_Position'
        gl.vertexAttribPointer(this.shader.a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.shader.a_Position);
        
        // set the various uniform variables
        gl.uniform4fv(this.shader.u_FragColor,this.color);    
       
        // draw the triangles
        gl.drawArrays(this.primitive, 0, this.vertices.length);
    }    
};

/* @author Zachary Wartell && ...
 * Construct new CoordinateRenderable Object
 * 
 * CoordinateRenderable is a abstract class. It is Renderable whose geometric coordinates are all measured relative to a single 
 * coordinate system.  The coordinate system is described by an object of type CoordinateSystem, stored in this.parent.
*/
var CoordinateRenderable = function()
{
    Renderable.call(this);
    this.parent = null;
};
CoordinateRenderable.prototype = Object.create(Renderable.prototype);

/* @author Zachary Wartell && ...
 * Construct new CoordinateSystem Object
 * 
 * Details of this class are described in the assignment description.
*/
var CoordinateSystem = function()
{
    CoordinateRenderable.call(this);
    this.origin = new Vec2();
    this.scale = new Vec2([1,1]);
    this.orientation = 0.0;
    
    /* \todo add code as need to implement CoordinateSystem class */
};
CoordinateSystem.prototype = Object.create(CoordinateRenderable.prototype);

/* @author Zachary Wartell
 *
 * Return a Mat3 transform that maps local to parent coordinates, i.e. using the course's notation:
 * 
 *       M
 *        parent<-local
 *  
 *  Remark: the method name "parent_x_local" is meant to be a visual approximation to "parent<-local"
 *  
 *  Student Note:  Use this implementation as a guide for the other CoordinateSystem functions
 *  
 *  @returns {Mat3}
 */
CoordinateSystem.prototype.parent_x_local = function ()
{
    var M = new Mat3();
    M.setTranslate([this.origin.x,this.origin.y]);
    M.rotate(this.orientation);
    M.scale([this.scale.x,this.scale.y]);
    return M;          
};

/* @author 
 * 
 * Return a Mat3 transform that maps parent to local coordinates, i.e. using the course's notation:
 * 
 *       M
 *        local<-parent
 *        
 * @returns {Mat3}
 */
CoordinateSystem.prototype.local_x_parent = function ()
{
    /* \todo implement */
};

/* @author 
 *
 * Return a Mat3 transform that maps local to world coordinates, i.e. using the course's notation:
 * 
 *     M
 *      world<-local
 *  
 * @returns {Mat3}
 */
CoordinateSystem.prototype.world_x_local = function ()
{
    /* \todo implement */
};

/* @author 
 *
 * Return a Mat3 transform that maps world to local coordinates, i.e. using the course's notation:
 * 
 *       M
 *        local<-world
 *        
 *  * @returns {Mat3}
 */
CoordinateSystem.prototype.local_x_world = function ()
{
    /* \todo implement */
};

/*
 * Recursively traverse the tree structure rendering all children coordinate systems and all shapes.
 * @returns {undefined}
 */
CoordinateSystem.prototype.render = function ()
{
    /* \todo implement */
};

/*
 * Attach the shape 'shape' to this CoordinateSystem's shapes
 * @param {Shape} shape
 * @returns {undefined}
 */
CoordinateSystem.prototype.add_shape = function (shape)
{
    /* \todo implement */    
};

/*
 * Attach the CoordinateSystem 'child' to this CoordinateSystem's children
 * @param {CoordinateSystem} child
 * @returns {undefined}
 */
CoordinateSystem.prototype.add_child = function (child)
{
    /* \todo implement */        
};

/* \todo add other CoordinateSystem methods as needed */

/* @author Zachary Wartell && ...
 * Constructor new Shape Object
 * 
 * Shape is an abstract class that implements CoordinateRenderable
 * further it has several additional methods.
*/
var Shape = function()
{
    CoordinateRenderable.call(this);
    /* \todo add code as need to implement CoordinateSystem class */
};
Shape.prototype = Object.create(CoordinateRenderable.prototype);

/*
 * Return whether the point 'point_wcs' given in World Coordinates is inside
 * the boundaries of this Shape (which of course are stored in local parent coordinates)
 * 
 * @param {Vec2} point_wcs
 * @returns {Boolean}
 */
Shape.prototype.point_inside = function (point_wcs)
{
    throw new Error("Unimplemented abstract class method");
    return false;    
};

/* \todo add Shape methods if needed */

/* @author Zachary Wartell && ...
 * Constructor new UnitSquare Object
 * 
 * Student Note: This is a simple example design as a template for how to build other
 * Shape sub-classes (such as UnitDisc).
 * 
 * @param {Object} gl - a WebGLContext object
*/
var UnitSquare = function(gl,shader)
{
    Shape.call(this);
    
    this.renderable = new SimpleRenderable (shader);//new Shader(gl, "vertex-shader", "fragment-shader"));
    this.renderable.vertices.push([-0.5,-0.5]);
    this.renderable.vertices.push([ 0.5,-0.5]);
    this.renderable.vertices.push([ 0.5, 0.5]);
    this.renderable.vertices.push([-0.5,-0.5]);
    this.renderable.vertices.push([-0.5, 0.5]);
    this.renderable.vertices.push([ 0.5, 0.5]); 
    this.renderable.updateBuffers();    
    this.renderable.color.set([1.0,1.0,1.0,1.0]); 
};
UnitSquare.prototype = Object.create(Shape.prototype);

UnitSquare.prototype.render = function ()
{
    this.renderable.render();
};

/*
 * Return whether the point 'point_wcs' given in World Coordinates is inside
 * the boundaries of this Shape.
 * @param {Vec2} point_wcs
 * @returns {Boolean}
 */
UnitSquare.prototype.point_inside = function (point_wcs)
{
    // compute point coordinate in local coordinate system 
    var point_lcs = new Vec3();
    point_lcs.x = point_wcs.x; point_lcs.y = point_wcs.y;  point_lcs.w = 1.0;
    if (this.parent !== null)
        point_lcs.multiply(this.parent.local_x_world());
    
    // perform containment test in local coordinate space
    //console.log("  lcs: " + point_lcs.x + ", " + point_lcs.y);
    return point_lcs.x <= 0.5 && point_lcs.x >= -0.5 &&
           point_lcs.y <= 0.5 && point_lcs.y >= -0.5;
};

