/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*****
 * 
 * TEST FUNCTIONS
 * 
 * Student Note:  These are functions for testing various classes.  Feel free to modify and extended them
 * as you find useful.
 *****/

/* @author Zachary Wartell
 * Constructor new TestStack Object
 * 
 * TestStack is designed to test the functionality of the Mat3Stack
 *  
 * @param {Object} shader - a Shader object
 */
var TestStack = function (shader) {
  this.shader = shader;
  this.unitSquare = new SimpleRenderable(this.shader),

  this.unitSquare.vertices.push([-0.5, -0.5]);
  this.unitSquare.vertices.push([0.5, -0.5]);
  this.unitSquare.vertices.push([0.5, 0.5]);
  this.unitSquare.vertices.push([-0.5, -0.5]);
  this.unitSquare.vertices.push([-0.5, 0.5]);
  this.unitSquare.vertices.push([0.5, 0.5]);
  this.unitSquare.updateBuffers();

  this.unitSquare.color = [0.0, 0.0, 1.0, 1.0];
};

/*
 * Draw this TestStack object.
 * 
 * The code in here is designed purely for testing the Mat3Stack functions. 
 * 
 * \todo Students: Suggestion: Use/Extend this code as desired for testing the Mat3Stack functionality.
 */
TestStack.prototype.render = function () {
  switch (2) {
    case 1:
      /* test 1: Tests only the basic Mat3Stack functions that are provided with the skeleton code */
      modelViewStack.push();
      for (i = 0; i < 4; i++) {
        modelViewStack.translate([0.125, -0.125]);
        this.unitSquare.render();
      }
      modelViewStack.pop();
      break;
    case 2:
      /* Test 2: this is based on example shown in class lecture.
       * Test 2 requires most of the Mat3Stack code to be implemented to work properly.
       */
      modelViewStack.push();
      modelViewStack.loadIdentity();
      modelViewStack.translate([0.5, 0.5]);
      modelViewStack.scale([0.5, 0.5]);

      this.unitSquare.color[0] = 0; this.unitSquare.color[1] = 0; this.unitSquare.color[2] = 1;
      this.unitSquare.render();
      for (var angle = 0; angle < 360; angle += 90) {
        modelViewStack.push();
        modelViewStack.rotate(angle);
        modelViewStack.translate([1, 0]);
        modelViewStack.scale([0.25, 0.25]);

        this.unitSquare.color[0] = 1; this.unitSquare.color[1] = 0; this.unitSquare.color[2] = 0;
        this.unitSquare.render();
        modelViewStack.pop();
      }
      modelViewStack.pop();
      break;
  }
};

function SimpleRenderable_test1(renderables, shader) {
  var
      square = new SimpleRenderable(shader),
      triangle = new SimpleRenderable(shader);

  triangle.vertices.push([0, 0]);
  triangle.vertices.push([1, 0]);
  triangle.vertices.push([0, 1]);
  triangle.updateBuffers();

  triangle.color = [1.0, 0.0, 1.0, 1.0];

  square.vertices.push([0, 0]);
  square.vertices.push([-1, 0]);
  square.vertices.push([0, -1]);
  square.vertices.push([-1, -1]);
  square.vertices.push([-1, 0]);
  square.vertices.push([0, -1]);
  square.updateBuffers();

  square.color = [1.0, 0.0, 0.0, 1.0];

  renderables.push(square);
  renderables.push(triangle);
}

function TestStack_test1(renderables, shader) {
  var testStack = new TestStack(shader);
  renderables.push(testStack);
}

/*
 * Array of Shape's
 * Since this is used only for testing purposes I leave this as global.
 * @type Array
 */
var selectables = new Array();

/*
 * Test basics of CoordinateSystem
 * 
 * @param {type} renderables
 * @returns {undefined}
 */
function CoordinateSystem_test1(renderables, shader, gl) {
  /*
  var rootCS = new CoordinateSystem();
  var sqr = new UnitSquare(gl, shader);
  sqr.name = "sqr0";
  rootCS.add_shape(sqr);
  rootCS.origin.x = 0.5; rootCS.origin.y = 0.0;
  rootCS.orientation = 45.0;
  rootCS.scale.x = 0.5; rootCS.scale.y = 0.25;
  */

  var rootCS = new CoordinateSystem({
    name: "Root Coordinate System",
    origin: new Vec2([0.5, 0.0]),
    scale: new Vec2([0.5, 0.25]),
    orientation: 45.0,
    children: false,
    shapes: {
      /* rootCS -> sqr */
      sqr: new UnitSquare(gl, shader)
    }
  });

  renderables.push(rootCS);
  selectables.push(rootCS.shapes.sqr);
}

/*
 * Test tree structure of CoordinateSystem and aspects of recursive rendering
 * 
 * @param {type} renderables
 * @returns {undefined}
 */
function CoordinateSystem_test2(renderables, shader, gl) {
  var rootCS = new CoordinateSystem();
  rootCS.orientation = -45.0;
  rootCS.origin.x = 0.5; rootCS.origin.y = 0.5;

  var sqr = new UnitSquare(gl, shader);
  var sqrCS = new CoordinateSystem();
  sqr.name = "sqr";
  rootCS.add_child(sqrCS);
  sqrCS.scale.x = 0.5; sqrCS.scale.y = 0.25;
  sqrCS.add_shape(sqr);

  var CS2 = new CoordinateSystem();
  rootCS.add_child(CS2);

  CS2.origin.x = 0.5; CS2.origin.y = 0.5;
  CS2.orientation = 75.0;

  var sqr2 = new UnitSquare(gl, shader);
  var sqr2CS = new CoordinateSystem();
  sqr2.name = "sqr2";
  sqr2CS.scale.x = 0.5; sqrCS.scale.y = 0.25;
  sqr2CS.add_shape(sqr2);
  CS2.add_child(sqr2CS);

  selectables.push(sqr);
  selectables.push(sqr2);

  renderables.push(rootCS);
}

function UnitDisc_test(renderables, shader, gl) {
  var rootCS = new CoordinateSystem();
  var circ = new UnitDisc(gl, shader);
  circ.name = "circ0";
  rootCS.add_shape(circ);
  rootCS.orientation = 0.0;
  rootCS.scale.x = 1.0; rootCS.scale.y = 1.0;

  renderables.push(rootCS);
  selectables.push(circ);
}



/*
 *  Test code to visually indicate some visually animated property.
 */
function animation_test1(renderables, delta) {
  for (i = 0; i < renderables.length; i++)
    if (renderables[i] instanceof ShaderRenderable) {
      renderables[i].color[0] += delta * 0.001;
      //clle.log(renderables[i].color[0]);
      if (renderables[i].color[0] > 1.0)
        renderables[i].color[0] = 0.1;
    }
}

