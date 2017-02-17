/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * @author Zachary Wartell 
 * Constructor of Mat3Stack. Argument 'gl' must be a valid WebGLContext
 * 
 * Mat3Stack mimics the classic OpenGL Matrix Stack functions described in:
 *    http://www.glprogramming.com/red/chapter03.html#name6
 *    
 * Mat3Stack, however, is only a stack of 3x3 matrices not 4x4.
 *    
 * @param {Object} gl - valid GL context
 */
var Mat3Stack = function (gl) {
  this.array = new Array();
  this.array.push(new Mat3());
  this.u_modelView = null;
  this.gl = gl;
};

/**
 * @author Zachary Wartell
 * Assign the GLSL Uniform mat3 variable, u_modelView, the top Mat3 on this Mat3Stack.
 * @param {WebGLUniformLocaiton} u_modelView
 */
Mat3Stack.prototype.updateShader = function (u_modelView) {
  if (!(u_modelView instanceof WebGLUniformLocation)) {
    throw new Error("Bad Type");
  }
  this.gl.uniformMatrix3fv(u_modelView, false, this.array[this.array.length - 1].array);
};

/**
 * @author Zachary Wartell 
 * Push a copy of the current top Mat3 onto the Mat3Stack
 * @param {null}
 */
Mat3Stack.prototype.push = function () {
  this.array.push(this.array[this.array.length - 1]);
};

/**
 * @author Zachary Wartell 
 * Pop the current top of stack
 * @param {null}
 */
Mat3Stack.prototype.pop = function () {
  this.array.pop();
};

/* @author Zachary Wartell
 * set the top Mat3 to the identity matrix
 * 
 * @param {null} 
 */
Mat3Stack.prototype.loadIdentity = function () {
  this.array[this.array.length - 1].setIdentity();
};

/* @author Zachary Wartell
 * translate the top Mat3 by translation [x,y]
 * 
 * @param {[x,y]} - translation vector coordinates
 * @returns {undefined}
 */
Mat3Stack.prototype.translate = function () {
  if (this.array.length === 0) {
    throw new Error("Mat3Stack: Empty");
  }

  if (arguments[0] instanceof Array) {
    /* compute new top matrix */
    var M = new Mat3(this.array[this.array.length - 1]);
    M = M.translate(arguments[0]);
    this.array[this.array.length - 1] = M;
  } else {
    throw new Error("Mat3Stack.translate: Error: Argument not instance of Array.");
  }
};

/* @author
 * scale the top Mat3 by scale matrix with scale factors [sx,sy]
 * @param {[sx,sy]}
 */
Mat3Stack.prototype.scale = function () {
  /* \todo implement this */
  if (this.array.length === 0) {
    throw new Error("Mat3Stack: Empty");
  }

  if (arguments[0] instanceof Array) {
    /* compute new top matrix */
    var M = new Mat3(this.array[this.array.length - 1]);
    M = M.scale(arguments[0]);
    this.array[this.array.length - 1] = M;
  } else {
    throw new Error("Mat3Stack.scale: Error: Argument not instance of Array.");
  }
};

/* @author
 * rotate the top Mat3 by rotate matrix with rotation angle 'angle'
 * @param {Number : angle}
 */
Mat3Stack.prototype.rotate = function () {
  /* \todo implement this */
  if (this.array.length === 0) {
    throw new Error("Mat3Stack: Empty");
  }

  if (typeof arguments[0] == "number") {
    /* compute new top matrix */
    var M = new Mat3(this.array[this.array.length - 1]);
    M = M.rotate(arguments[0]);
    this.array[this.array.length - 1] = M;
  } else {
    throw new Error("Mat3Stack.rotate: Error: Argument not a Number.");
  }
};

/* Student Note: You may add additional methods to Mat3Stack based on the classic OpenGL matrix stack API
 * as you see fit.
 */

/* Apply the full transformation matrix (just multiply) to the top Mat3 */
Mat3Stack.prototype.transform = function () {
  /* \todo implement this */
  if (this.array.length === 0) {
    throw new Error("Mat3Stack: Empty");
  }

  if (arguments[0] instanceof Mat3) {
    /* compute new top matrix */
    var M = new Mat3(this.array[this.array.length - 1]);
    M = M.multiply(arguments[0]);
    this.array[this.array.length - 1] = M;
  } else {
    throw new Error("Mat3Stack.translate: Error: Argument not instance of Mat3.");
  }
};
