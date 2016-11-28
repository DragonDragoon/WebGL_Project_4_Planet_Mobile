/**
 * @author Zachary Wartell, ...
 * 
 * math2D.js is a set of 2D geometry related math functions and classes.
 * 
 * Students are given a initial set of classes and functions are expected to extend these and add
 * additional functions to this file.
 * 
 */

/*
 * test equality of 2 floating point numbers
 * @param {Number} a - double
 * @param {Number} b - double (default Number)
 * @returns {Function|equal.Mat3}
 */
function equal(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}

/*
 * test equality of a 32 bit float and 64 bit float
 * @param {Number} a - 32 bit float
 * @param {Number} b - 64 bit float
 * @returns {Function|equal.Mat3}
 */
function equalfd(a, b) {
  // \todo [Wartell] find better way to do this ... 
  /* AFIK - Javascript lacks a 32bit float EPISLON
          - JS seems to lack any proper float to double conversion
  */
  var stupid = new Float32Array([b]);
  return Math.abs(a - stupid[0]) < Number.EPSILON;
}

/**
 * @author Zachary Wartell
 * Constructor of Mat3, a 3x3 matrix 
 * 
 * For efficiency we use a Typed Array.  Elements are stored in 'column major' layout, i.e.
 * for matrix M with math convention M_rc
 *    this.array = [ M_00, M_10, M_20   // first column
 *                   M_01, M_11, M_12,  // second column
 *                   M_02, M_12, M_22 ];// third column
 *                                     
 * column major order is consistent with OpenGL and GLSL
 *                   
 * @param {null | Array | Mat3} - initial value for this Mat3               
 * @returns {Mat3}
 */
var Mat3 = function () {
  if (arguments.length === 1) {
    if (arguments[0] instanceof Array) {
      this.array = new Float32Array(9);
      this.array.set(arguments[0]);
    } else if (arguments[0] instanceof Float32Array) {
      this.array = new Float32Array(9);
      this.array.set(arguments[0]);
    } else if (arguments[0] instanceof Mat3) {
      this.array = new Float32Array(9);
      this.array.set(arguments[0].array);
    } else {
      throw new Error("Mat3: Error: Argument not instance of Array or Mat3.");
    }
  } else {
    this.array = new Float32Array(9);
    this.array.set([1.0, 0.0, 0.0,
                    0.0, 1.0, 0.0,
                    0.0, 0.0, 1.0]);
  }
};

/**
 * @author Zachary Wartell
 * 'get' returns element in column c, row r of this Mat3
 * @param {Number} r - row
 * @param {Number} c - column
 * @returns {Number}
 */
Mat3.prototype.get = function (r, c) {
  return this.array[c * 3 + r];
};

/**
 * @author Zachary Wartell
 * 'set' sets element at column c, row r to value 'val'.
 * @param {Number} r - row 
 * @param {Number} c - column
 * @param {Number} val - value
 * @returns {Number}
 */
Mat3.prototype.set = function (r, c, val) {
  this.array[c * 3 + r] = val;
};

/**
 * @author Zachary Wartell
 * 'det' return the determinant of this Mat3
 * @returns {Number}
 */
Mat3.prototype.det = function () {
  return  this.array[0] * (this.array[4] * this.array[8] - this.array[5] * this.array[7]) +
         -this.array[3] * (this.array[1] * this.array[8] - this.array[2] * this.array[7]) +
          this.array[6] * (this.array[1] * this.array[5] - this.array[2] * this.array[4]);
};

/**
 * @author Zachary Wartell
 * right multiply this Mat3 (denoted 'M') by a matrix M1, e.g.
 * 
 * M = M * M1
 * 
 * @param {Mat3} matrix
 */
Mat3.prototype.multiply = function (matrix) {
  if (matrix instanceof Mat3) {
    var r, c;
    var Mr = new Float32Array(9); /* 'MatrixResult' */
    for (r = 0; r <= 2; r++) {
      for (c = 0; c <= 2; c++) {
        Mr[c * 3 + r] = this.get(r, 0) * matrix.get(0, c) + this.get(r, 1) * matrix.get(1, c) + this.get(r, 2) * matrix.get(2, c);
      }
    }
    return new Mat3(Mr);
  } else if (typeof matrix == "number") {
    var r, c;
    var Mr = new Float32Array(9); /* 'MatrixResult' */
    for (r = 0; r <= 2; r++) {
      for (c = 0; c <= 2; c++) {
        Mr[c * 3 + r] = matrix * this.get(r, c);
      }
    }
    return new Mat3(Mr);
  } else {
    throw new Error("Mat3.multiply: Error: Argument not instance of Mat3.");
  }
};

/**
 * left multiply this Mat3 (denoted 'M') by a matrix M1, e.g.
 * 
 * M = M1 * M
 * 
 * @param {Mat3} matrix
 */
Mat3.prototype.leftMultiply = function (matrix) {
  /* Implemented */
  if (matrix instanceof Mat3) {
    var r, c;
    var Mr = new Float32Array(9); /* 'MatrixResult' */
    for (r = 0; r <= 2; r++) {
      for (c = 0; c <= 2; c++) {
        Mr[c * 3 + r] = matrix.get(0, c) * this.get(r, 0) + matrix.get(1, c) * this.get(r, 1) + matrix.get(2, c) * this.get(r, 2);
      }
    }
    return new Mat3(Mr);
  } else {
    throw new Error("Mat3.leftMultiply: Error: Argument not instance of Mat3.");
  }
};

/**
 * @author Zachary Wartell
 * set this Mat3 to be a 2D translation matrix that translates by vector [x,y]
 * 
 * @param {[Number, Number]} translate
 */
Mat3.prototype.setTranslate = function (translate) {
  if (translate instanceof Array) {
    this.array[0] = 1.0; this.array[3] = 0.0; this.array[6] = translate[0];
    this.array[1] = 0.0; this.array[4] = 1.0; this.array[7] = translate[1];
    this.array[2] = 0.0; this.array[5] = 0.0; this.array[8] = 1.0;
  } else {
    throw new Error("Mat3.setTranslate: Error: Argument not instance of Array.");
  }
};

/**
 * @author Zachary Wartell
 * right multiply this Mat3 by the 2D translation matrix that translates by vector [x,y], e.g.
 * 
 * M = M * t(x,y)
 * 
 * @param {[Number, Number]} translate
 */
Mat3.prototype.translate = function (translate) {
  if (translate instanceof Array) {
    /*
    ... correct version, but less efficient ..
    */
    var M_t = new Mat3([1.0, 0.0, 0.0,
                        0.0, 1.0, 0.0,
                        translate[0], translate[1], 1.0]);
    return this.multiply(M_t);
    /*
    var m02,m12,m22;
    m02 =  this.array[0]*arguments[0][0] + this.array[3]*arguments[0][1] + this.array[6];
    m12 =  this.array[1]*arguments[0][0] + this.array[4]*arguments[0][1] + this.array[7];
    m22 =  this.array[2]*arguments[0][0] + this.array[5]*arguments[0][1] + this.array[8];
    this.array[6]=m02;
    this.array[7]=m12;
    this.array[8]=m22;    
    */
  } else {
    throw new Error("Mat3.translate: Error: Argument not instance of Array.");
  }
};

/**
 * @author Zachary Wartell
 * left multiply this Mat3 by the 2D translation matrix that translates by vector [x,y], e.g.
 * 
 * M = t(x,y) * M 
 * 
 * @param {[Number, Number]} translate
 */
Mat3.prototype.leftTranslate = function (translate) {
  if (translate instanceof Array) {
    var M_t = new Mat3([1.0, 0.0, 0.0,
                        0.0, 1.0, 0.0,
                        translate[0], translate[1], 1.0]);
    return this.leftMultiply(M_t);
  } else {
    throw new Error("Mat3.leftTranslate: Error: Argument not instance of Array.");
  }
};

/**
 * @author
 * set this Mat3 to be a 2D scale matrix that translates by scale factors [sx,sy]
 * 
 * @param {[Number, Number]} scale_factors
 */
Mat3.prototype.setScale = function (scale_factors) {
  /* Implemented */
  if (scale_factors instanceof Array) {
    this.array[0] = scale_factors[0]; this.array[3] = 0.0;              this.array[6] = 0.0;
    this.array[1] = 0.0;              this.array[4] = scale_factors[1]; this.array[7] = 0.0;
    this.array[2] = 0.0;              this.array[5] = 0.0;              this.array[8] = 1.0;
  } else {
    throw new Error("Mat3.setScale: Error: Argument not instance of Array.");
  }
};

/**
 * @author
 * right multiply this Mat3 by the 2D translation matrix that translates by vector [x,y], e.g.
 * 
 * M = M * s(x,y)
 * 
 * @param {[Number, Number]} scale_factors
 */
Mat3.prototype.scale = function (scale_factors) {
  /* Implemented */
  if (scale_factors instanceof Array) {
    var M_t = new Mat3(
           [scale_factors[0], 0.0,              0.0,
            0.0,              scale_factors[1], 0.0,
            0.0,              0.0,              1.0]);
    return this.multiply(M_t);
  } else {
    throw new Error("Mat3.scale: Error: Argument not instance of Array.");
  }
};

/**
 * @author
 * left multiply this Mat3 by the 2D translation matrix that translates by scale factors [sx,sy], e.g.
 * 
 * M = s(sx,sy) * M 
 * 
 * @param {[Number, Number]} 
 */
Mat3.prototype.leftScale = function (scale_factors) {
  /* Implemented */
  if (scale_factors instanceof Array) {
    var M_t = new Mat3(
           [scale_factors[0], 0.0,              0.0,
            0.0,              scale_factors[1], 0.0,
            0.0,              0.0,              1.0]);
    return this.leftMultiply(M_t);
  } else {
    throw new Error("Mat3.leftScale: Error: Argument not instance of Array.");
  }
};

/**
 * @author
 * set this Mat3 to be the 2D rotation matrix that rotates by angle 'angle'
 * 
 * @param {Number} 
 */
Mat3.prototype.setRotate = function (angle) {
  /* Implemented */
  if (typeof angle == "number") {
    angle = angle / 180 * Math.PI;
    this.array[0] = Math.cos(angle); this.array[3] = -Math.sin(angle); this.array[6] = 0.0;
    this.array[1] = Math.sin(angle); this.array[4] = Math.cos(angle);  this.array[7] = 0.0;
    this.array[2] = 0.0;             this.array[5] = 0.0;              this.array[8] = 1.0;
  } else {
    throw new Error("Mat3.setRotate: Error: Argument not a Number.");
  }
};

/**
 * @author
 * right multiply this Mat3 multiply this Mat3 by the 2D rotation matrix that rotates by angle 'angle', e.g.
 * 
 * M = M * R(angle)
 * 
 * @param {Number} 
 */
Mat3.prototype.rotate = function (angle) {
  /* Implemented */
  if (typeof angle == "number") {
    angle = angle / 180 * Math.PI;
    var M_t = new Mat3(
           [Math.cos(angle), -Math.sin(angle), 0.0,
            Math.sin(angle),  Math.cos(angle), 0.0,
            0.0,              0.0,             1.0]);
    return this.multiply(M_t);
  } else {
    throw new Error("Mat3.rotate: Error: Argument not a Number.");
  }
};

/**
 * @author
 * left multiply this Mat3 by the 2D rotation matrix that rotates by angle 'angle', e.g.
 * 
 * M = R(angle) * M 
 * 
 * @param {Number} 
 */
Mat3.prototype.leftRotate = function (angle) {
  /* Implemented*/
  if (typeof angle == "number") {
    angle = angle / 180 * Math.PI;
    var M_t = new Mat3(
           [Math.cos(angle), -Math.sin(angle), 0.0,
            Math.sin(angle),  Math.cos(angle), 0.0,
            0.0,              0.0,             1.0]);
    return this.leftMultiply(M_t);
  } else {
    throw new Error("Mat3.leftRotate: Error: Argument not a Number.");
  }
};

/**
 * @author Zachary Wartell
 * set this Mat3 to be the identity matrix
 *  
 */
Mat3.prototype.setIdentity = function () {
  this.array[0] = 1.0; this.array[3] = 0.0; this.array[6] = 0.0;
  this.array[1] = 0.0; this.array[4] = 1.0; this.array[7] = 0.0;
  this.array[2] = 0.0; this.array[5] = 0.0; this.array[8] = 1.0;
};

/**********************************************************************************************************************************************************************************************************************************************************************************************************
 * ADDED
 */
/* For displaying in console */
Mat3.prototype.toString = function () {
  return "| " + this.array[0] + " " + this.array[1] + " " + this.array[2] + " |\n"
       + " | " + this.array[3] + " " + this.array[4] + " " + this.array[5] + " |\n"
       + " | " + this.array[6] + " " + this.array[7] + " " + this.array[8] + " |";
};

/* Return M^-1 */
Mat3.prototype.inverse = function () {
  return (new Mat3([(new Mat2([this.get(1, 1), this.get(2, 1), this.get(1, 2), this.get(2, 2)])).det(), (new Mat2([this.get(2, 0), this.get(1, 0), this.get(2, 2), this.get(1, 2)])).det(), (new Mat2([this.get(1, 0), this.get(2, 0), this.get(1, 1), this.get(2, 1)])).det(),
                   (new Mat2([this.get(2, 1), this.get(0, 1), this.get(2, 2), this.get(0, 2)])).det(), (new Mat2([this.get(0, 0), this.get(2, 0), this.get(0, 2), this.get(2, 2)])).det(), (new Mat2([this.get(2, 0), this.get(0, 0), this.get(2, 1), this.get(0, 1)])).det(),
                   (new Mat2([this.get(0, 1), this.get(1, 1), this.get(0, 2), this.get(1, 2)])).det(), (new Mat2([this.get(1, 0), this.get(0, 0), this.get(1, 2), this.get(0, 2)])).det(), (new Mat2([this.get(0, 0), this.get(1, 0), this.get(0, 1), this.get(1, 1)])).det()])).multiply(1 / this.det());
};
/**********************************************************************************************************************************************************************************************************************************************************************************************************/

/**
 * @author Zachary Wartell 
 * Constructor of Vec3. Vec3 is is used to represent homogenous coordinates of 2D geometric points or vectors, stored as (x,y,w)
 * or 3D geometric points or vectors, stored as (x,y,z).
 * 
 * For Mat3 operations, Vec3 is treated as a column matrix.
 * 
 * @param {null | Vec3 | [Number, Number, Number]}
 */
var Vec3 = function () {
  if (arguments.length === 0) {// no arguements, so initial to 0's
    this.array = new Float32Array(3);
    this.array.set([0.0, 0.0, 0.0]);
  } else if (arguments.length === 1) {// 1 argument, ...
    if (arguments[0] instanceof Vec3) {// argument is Vec3, so copy it
      this.array = new Float32Array(arguments[0].array);
    } else if (arguments[0] instanceof Array) {// argument is Array, so copy it
      this.array = new Float32Array(arguments[0]);
    }
  }
};

/**
 * @author Zachary Wartell 
 *  Vec3 - provide alternate syntax for setting/getting x and y coordinates (see math2d_test for examples).
 */
var v = Vec3.prototype;
Object.defineProperties(Vec3.prototype, {
  "x": {
    get: function () {
      return this.array[0];
    },
    set: function (v) {
      this.array[0] = v;
    }
  },
  "y": {
    get: function () {
      return this.array[1];
    },
    set: function (v) {
      this.array[1] = v;
    }
  },
  /* use when Vec3 is used for storing 3D point/vector (non-homogenous) coordinates */
  "z": {
    get: function () {
      return this.array[2];
    },
    set: function (v) {
      this.array[2] = v;
    }
  },
  /* use when Vec3 is used for storing 2D point/vector homogenous coordinates */
  "w": {
    get: function () {
      return this.array[2];
    },
    set: function (v) {
      this.array[2] = v;
    }
  }
});

/**
 * @author Zachary Wartell 
 * Treat this Vec3 as a column matrix and multiply it by Mat3 'M' on left of 'v', i.e.
 * 
 * v = M * v
 * 
 * @param {Mat3} m    
 */
Vec3.prototype.multiply = function (M) {
  if (M instanceof Mat3) {
    return new Vec3([this.array[0] * M.array[0] + this.array[1] * M.array[3] + this.array[2] * M.array[6],
                     this.array[0] * M.array[1] + this.array[1] * M.array[4] + this.array[2] * M.array[7],
                     this.array[0] * M.array[2] + this.array[1] * M.array[5] + this.array[2] * M.array[8]]);
  } else {
    throw new Error("Vec3.multiply: Error: Argument not instance of Mat3.");
  }
};

/**
 * @author Zachary Wartell
 * Treat this Vec3 as a row matrix and multiply it by Mat3 'M' on right of 'v', i.e.
 * 
 * v = v * M
 * 
 * @param {Mat3} m
 */
Vec3.prototype.rightMultiply = function (M) {
  if (M instanceof Mat3) {
    return new Vec3([this.array[0] * M.array[0] + this.array[1] * M.array[1] + this.array[2] * M.array[2],
                     this.array[0] * M.array[3] + this.array[1] * M.array[4] + this.array[2] * M.array[5],
                     this.array[0] * M.array[6] + this.array[1] * M.array[7] + this.array[2] * M.array[8]]);
  } else {
    throw new Error("Vec3.rightMultiply: Error: Argument not instance of Mat3.");
  }
};

/*
 * Set this Vec3 coordinates to values stored in 'v'
 * @param {Array | Vec3} v
 * @returns {undefined}
 */
Vec3.prototype.set = function (v) {
  if (v instanceof Array) {
    this.array.set(v);
  } else if (v instanceof Float32Array) {
    this.array.set(v);
  } else if (v instanceof Vec3) {
    this.array.set(v.array);
  } else {
    throw new Error("Vec3.set: Error: Argument not instance of Array.");
  }
};

/* \todo implement the following functions using the similar Vec2 functions as examples */
Vec3.prototype.add = function (v) {
  /* Implemented */
  if (v instanceof Vec3) {
    return new Vec3([this.array[0] + v.array[0], this.array[1] + v.array[1], this.array[2] + v.array[2]]);
  } else {
    throw new Error("Vec3.add: Error: Argument not instance of Vec3.");
  }
};

Vec3.prototype.sub = function (v) {
  /* Implemented */
  if (v instanceof Vec3) {
    return new Vec3([this.array[0] - v.array[0], this.array[1] - v.array[1], this.array[2] - v.array[2]]);
  } else {
    throw new Error("Vec3.sub: Error: Argument not instance of Vec3.");
  }
};

//Vec3.prototype.mag = function (v) { // Was accepting an argument?
Vec3.prototype.mag = function () {
  /* Implemented */
  return Math.sqrt(Math.pow(this.array[0], 2) + Math.pow(this.array[1], 2) + Math.pow(this.array[2], 2));
};

Vec3.prototype.dot = function (v) {
  /* Implemented */
  if (v instanceof Vec3) {
    return this.array[0] * v.array[0] + this.array[1] * v.array[1] + this.array[2] * v.array[2];
  } else {
    throw new Error("Vec3.dot: Error: Argument not instance of Vec3.");
  }
};


/**
 * @author Zachary Wartell
 * Constructor of Mat2, a 2x2 matrix 
 * 
 * For efficiency we use a Typed Array.  Elements are stored in 'column major' layout, i.e.
 * for matrix M with math convention M_rc
 *    this.array = [ M_00, M_10,    // first column
 *                   M_01, M_11 ];  // second column
 *                   
 *                   
 * column major order is consistent with OpenGL and GLSL
 *                   
 * @param {null}                  
 * @returns {Mat2}
 */
var Mat2 = function (arr) {
  this.array = new Float32Array(4);
  if (arr instanceof Array) {
    this.array.set([arr[0], arr[1],
                    arr[2], arr[3]]);
  } else {
    this.array.set([1.0, 0.0,
                    0.0, 1.0]);
  }
};

/**
 * @author Zachary Wartell
 * 'get' returns element in column c, row r of this Mat2
 * @param {Number} r - row 
 * @param {Number} c - column 
 * @returns {Number}
 */
Mat2.prototype.get = function (r, c) {
  return this.array[c * 2 + r];
};

/**
 * @author Zachary Wartell
 * 'set' sets element at column c, row r to value 'val'.
 * @param {Number} r - row 
 * @param {Number} c - column 
 * @param {Number} val - value
 * @returns {Number}
 */
Mat2.prototype.set = function (r, c, val) {
  this.array[c * 2 + r] = val;
};

/**
 * @author Zachary Wartell
 * 'det' return the determinant of this Mat2
 * @returns {Number}
 */
Mat2.prototype.det = function () {
  return this.array[0] * this.array[3] - this.array[1] * this.array[2];
};

/**
 * @author Zachary Wartell 
 * Constructor of Vec2. Vec2 is is used to represent coordinates of geometric points or vectors. 
 * 
 * @param {null | Vec2 | [Number, Number]}
 */
var Vec2 = function () {
  if (arguments.length === 0) {// no arguements, so initial to 0's
    this.array = new Float32Array(2);
    this.array.set([0.0, 0.0]);
  } else if (arguments.length === 1) {// 1 argument, ...
    if (arguments[0] instanceof Vec2) {// argument is Vec2, so copy it
      this.array = new Float32Array(arguments[0].array);
    } else if (arguments[0] instanceof Array) {// argument is Array, so copy it
      this.array = new Float32Array(arguments[0]);
    }
  }
};

/**
 * @author Zachary Wartell 
 *  Vec2 - provide alternate syntax for setting/getting x and y coordinates (see math2d_test for examples).
 */
var v = Vec2.prototype;
Object.defineProperties(Vec2.prototype, {
  "x": {
    get: function () {
      return this.array[0];
    },
    set: function (v) {
      this.array[0] = v;
    }
  },
  "y": {
    get: function () {
      return this.array[1];
    },
    set: function (v) {
      this.array[1] = v;
    }
  }
});

/*
 * Set this Vec2 coordinates to values stored in 'v'
 * @param {Array | Vec3} v
 * @returns {undefined}
 */
Vec2.prototype.set = function (v) {
  if (v instanceof Array) {
    this.array.set(v);
  } else if (v instanceof Float32Array) {
    this.array.set(v);
  } else if (v instanceof Vec2) {
    this.array.set(v.array);
  } else {
    throw new Error("Vec2.set: Error: Argument not instance of Array, Float32Array, or Vec2.");
  }
};

/**
 * @author Zachary Wartell 
 * Add Vec2 'v' to this Vec2
 * @param {Vec2} v    
 */
Vec2.prototype.add = function (v) {
  if (v instanceof Vec2) {
    return new Vec2([this.array[0] + v.array[0], this.array[1] + v.array[1]]);
  } else {
    throw new Error("Vec2.add: Error: Argument not instance of Vec2.");
  }
};

/**
 * Subtract Vec2 'v' from this Vec2
 * @param {Vec2} v    
 */
Vec2.prototype.sub = function (v) {
  /* Implemented */
  if (v instanceof Vec2) {
    return new Vec2([this.array[0] - v.array[0], this.array[1] - v.array[1]]);
  } else {
    throw new Error("Vec2.sub: Error: Argument not instance of Vec2.");
  }
};

/**
 * @author Zachary Wartell 
 * Treat this Vec2 as a column matrix and multiply it by Mat2 'm' to it's left, i.e.
 * 
 * v = m * v
 * 
 * @param {Mat2} m    
 */
Vec2.prototype.multiply = function (m) {
  if (m instanceof Mat2) {
    return new Vec2([this.array[0] * m.array[0] + this.array[1] * m.array[2],
                     this.array[0] * m.array[1] + this.array[1] * m.array[3]]);
  } else {
    throw new Error("Vec2.multiply: Error: Argument not instance of Mat2.");
  }
};

/**
 * @author Zachary Wartell
 * Treat this Vec2 as a row matrix and multiply it by Mat2 'm' to it's right, i.e.
 * 
 * v = v * m
 * 
 * @param {Mat2} m
 */
Vec2.prototype.rightMultiply = function (m) {
  if (m instanceof Mat2) {
    return new Vec2([this.array[0] * m.array[0] + this.array[1] * m.array[1],
                     this.array[0] * m.array[2] + this.array[1] * m.array[3]]);
  } else {
    throw new Error("Vec2.rightMultiply: Error: Argument not instance of Vec2.");
  }
};

/**
 * Return the dot product of this Vec2 with Vec2 'v'
 * @param {Vec2} v    
 * @return {Number}
 */
Vec2.prototype.dot = function (v) {
  /* Implemented */
  if (v instanceof Vec2) {
    return this.array[0] * v.array[0] + this.array[1] * v.array[1];
  } else {
    throw new Error("Vec2.dot: Error: Argument not instance of Vec2.");
  }
};

/**
 * Return the magnitude (i.e. length) of of this Vec2 
 * @return {Number}
 */
Vec2.prototype.mag = function () {
  /* Implemented */
  return Math.sqrt(Math.pow(this.array[0], 2) + Math.pow(this.array[1], 2));
};

/**
 * Compute the barycentric coordinate of point 'p' with respect to barycentric coordinate system
 * defined by points p0,p1,p2.
 * 
 * @param {Vec2} p0 - first point of barycentric coordinate system
 * @param {Vec2} p1 - second point of barycentric coordinate system
 * @param {Vec2} p2 - third point of barycentric coordinate system
 * @param {Vec2} p  - point to compute the barycentric coordinate of
 * @returns {[Number, Number, Number]} - array with barycentric coordinates of 'p'
 */
function barycentric(p0, p1, p2, p) {
  /* Implemented */
  // Hold vector p1 - p0
  var v0 = new Vec2([p1.x - p0.x, p1.y - p0.y]);
  // Hold vector p2 - p0
  var v1 = new Vec2([p2.x - p0.x, p2.y - p0.y]);
  // Hold vector p - p0
  var v2 = new Vec2([p.x - p0.x, p.y - p0.y]);
  // Dot products to set up u, v, and w
  var v0_dot_v0 = v0.dot(v0);
  var v0_dot_v1 = v0.dot(v1);
  var v1_dot_v1 = v1.dot(v1);
  var v2_dot_v0 = v2.dot(v0);
  var v2_dot_v1 = v2.dot(v1);
  // b_coord to set up u, v, and w
  var b_coord = v0_dot_v0 * v1_dot_v1 - v0_dot_v1 * v0_dot_v1;
  // alpha = ((v1 (dot) v1) * (v2 (dot) v0) - (v1 (dot) v0) * (v2 (dot) v1)) / ((v0 (dot) v0) * (v1 (dot) v1) - (v0 (dot) v1) * (v1 (dot) v0))
  var a = (v1_dot_v1 * v2_dot_v0 - v0_dot_v1 * v2_dot_v1) / b_coord;
  // beta = ((v0 (dot) v0) * (v2 (dot) v1) - (v0 (dot) v1) * (v2 (dot) v0)) / ((v0 (dot) v0) * (v1 (dot) v1) - (v0 (dot) v1) * (v1 (dot) v0))
  var b = (v0_dot_v0 * v2_dot_v1 - v0_dot_v1 * v2_dot_v0) / b_coord;
  // gamma
  var g = 1.0 - a - b;
  return [a, b, g];
}

/**
 * Compute distance between point 'p' and the line through points 'p0' and 'p1'
 * @param {Vec2} p0 - first point on line
 * @param {Vec2} p1 - second point on line
 * @param {Vec2} p  - point for which we are computing distance
 * @returns {Number} - shortest distance from point P to line segment P1_P0
 */
function pointLineDist(p0, p1, p) {
  /* Implemented */
  // Hold Vec2 P, the point to find closest distance to
  var P = new Vec2([p.x, p.y]);
  // Hold Vec2 B, a point on the line segment
  var B = new Vec2([p0.x, p0.y]);
  // Hold Vec2 M, the direction of the line segment
  var M = new Vec2([p1.x - p0.x, p1.y - p0.y]);
  // Hold t0 = (M (dot) (P - B)) / (M (dot) M)
  var t0 = M.dot(P.sub(B)) / M.dot(M);
  // Set t0 to be within constraint [0, 1]
  t0 = Math.max(0, Math.min(1, t0));
  // Hold D = P - (B + t0 * M)
  var D = P.sub(B.add(M.scale(t0)));
  // Return magnitude of D (distance)
  return D.mag();
}

/**
 * @author Zachary Wartell && ... 
 * This contains misc. code for testing the functions in this file.
 * Note, the tests are not meant to be comprehensive, but rather only provide examples.
 * 
 * Students can add to this function for testing their code...
 * @returns {undefined}
 */
function math2d_test() {
  var M1 = new Mat2();
  var M2 = new Mat3();
  var v0 = new Vec2(), v1 = new Vec2([5.0, 5.0]), v2,
          vx = new Vec2([1.0, 0.0]),
          vy = new Vec2([0.0, 1.0]),
          vx_h = new Vec3([1.0, 0.0, 0.0]),  /* 'h' is for homogenous coordinate */
          vy_h = new Vec3([0.0, 1.0, 0.0]),
          po_h = new Vec3();

  var rad = 45 * Math.PI / 180;
  M1.set(0, 0, Math.cos(rad)); M1.set(0, 1, -Math.sin(rad));
  M1.set(1, 0, Math.sin(rad)); M1.set(1, 1, Math.cos(rad));

  M2.set(0, 0, Math.cos(rad)); M2.set(0, 1, -Math.sin(rad));
  M2.set(1, 0, Math.sin(rad)); M2.set(1, 1, Math.cos(rad));

  v0.x = 1.0;
  v0.y = 2.0;
  v0.y += 1.0;
  v2 = new Vec2(v0);
  v2 = v2.add(v1);
  console.assert(v2.x === 6 && v2.y === 8);

  vx = vx.multiply(M1);
  vy = vy.multiply(M1);

  console.assert(equalfd(vy.x, -Math.sin(rad)) && equalfd(vy.y, Math.cos(rad)) &&
                 equalfd(vx.x, Math.cos(rad)) && equalfd(vx.y, Math.sin(rad)));

  po_h.x = 0; po_h.y = 0; po_h.w = 1;

  vx_h = vx_h.multiply(M2);
  vy_h = vy_h.multiply(M2);
  po_h = po_h.multiply(M2);
  console.assert(equalfd(vy_h.x, -Math.sin(rad)) && equalfd(vy_h.y, Math.cos(rad)) &&
                 equalfd(vx_h.x, Math.cos(rad)) && equalfd(vx_h.y, Math.sin(rad)));

  var M3 = new Mat3();
  M3.setTranslate([10.0, 15.0]);
  M3 = M3.translate([5.0, 5.0]);
  po_h = po_h.multiply(M3);

  console.assert(equalfd(po_h.x, 15) && equalfd(po_h.y, 20));



  var M4 = new Mat3(), M5 = new Mat3();

  M4.setTranslate([10, 10]);
  M4 = M4.rotate(50);
  M4 = M4.scale([5, 10]);

  M5.setTranslate([-10, -10]);
  M5 = M5.leftRotate(-50);
  M5 = M5.leftScale([1 / 5, 1 / 10]);

  MI = new Mat3(M5);
  MI = MI.multiply(M4);

  console.log("math2d_test: Succesfully made it through tests.");

  /* \todo add more tests */
}
