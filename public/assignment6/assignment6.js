const RED_HEX = "#FF0000"
const RED_RGB = webglUtils.hexToRgb(RED_HEX)
const BLUE_HEX = "#0000FF"
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX)
const RECTANGLE = "RECTANGLE"
const TRIANGLE = "TRIANGLE"

const origin = {x: 0, y: 0, z: 0}
const sizeOne = {width: 1, height: 1, depth: 1}
const CUBE = "CUBE"


const up = [0, 1, 0]
let target = [0, 0, 0]
let lookAt = true
// declare up to be in +y direction
// declare the origin as the target we'll look at
// we'll toggle lookAt on and off


let shapes = [
  {
    type: RECTANGLE,
    position: origin,
    dimensions: sizeOne,
    color: BLUE_RGB,
    translation: {x: -15, y:  0, z: -20},
    scale:       {x:  10, y: 10, z:  10},
    rotation:    {x:   0, y:  0, z:   0}
  },
  {
    type: TRIANGLE,
    position: origin,
    dimensions: sizeOne,
    color: RED_RGB,
    translation: {x: 15, y:  0, z: -20},
    scale:       {x: 10, y: 10, z:  10},
    rotation:    {x:  0, y:  0, z: 180}
  },
  {
    type: CUBE,
    position: origin,
    dimensions: sizeOne,
    color: GREEN_RGB,
    translation: {x: -15, y: -15, z: -75},
    scale:       {x:   1, y:   1, z:   1},
    rotation:    {x:   0, y:  45, z:   0},
  }
]

let gl
let attributeCoords
let uniformColor
let bufferCoords
let selectedShapeIndex = 0

const doMouseDown = (event) => {
  const boundingRectangle = canvas.getBoundingClientRect();
  const x =  Math.round(event.clientX
      - boundingRectangle.left
      - boundingRectangle.width/2);
  const y = -Math.round(event.clientY
      - boundingRectangle.top
      - boundingRectangle.height/2);
  const translation = {x, y, z: -150}
  const rotation = {x: 0, y: 0, z: 180}
  const shapeType = document.querySelector("input[name='shape']:checked").value
  const shape = {
    translation, rotation, type: shapeType
  }
  addShape(shape, shapeType)
}



const addShape = (newShape, type) => {
  const colorHex = document.getElementById("color").value
  const colorRgb = webglUtils.hexToRgb(colorHex)
  let tx = 0
  let ty = 0
  let tz = 0

  const shape = {
    type: type,
    position: origin,
    dimensions: sizeOne,
    color: colorRgb,
    translation: {x: tx, y: ty, z: 0},
    rotation: {x: 0, y: 0, z: 0},
    scale: {x: 20, y: 20, z: 20}
  }
  if (newShape) {
    Object.assign(shape, newShape)
  }
  shapes.push(shape)
  render()
}


// ---------------------------------------------------------------------------------------------------

const init = () => {

  const canvas = document.querySelector("#canvas");

  canvas.addEventListener(
      "mousedown",
      doMouseDown,
      false);

  gl = canvas.getContext("webgl");

  // const program = webglUtils.createProgramFromScripts(gl, "#vertex-shader-2d", "#fragment-shader-2d");
  const program = webglUtils
      .createProgramFromScripts(gl, "#vertex-shader-3d", "#fragment-shader-3d");
  gl.useProgram(program);

  // get reference to GLSL attributes and uniforms
  attributeCoords = gl.getAttribLocation(program, "a_coords");
  uniformColor = gl.getUniformLocation(program, "u_color");
  uniformMatrix = gl.getUniformLocation(program, "u_matrix");

  // initialize coordinate attribute
  gl.enableVertexAttribArray(attributeCoords);

  // initialize coordinate buffer
  bufferCoords = gl.createBuffer();

  // configure canvas resolution
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  document.getElementById("tx").onchange = event => updateTranslation(event, "x")
  document.getElementById("ty").onchange = event => updateTranslation(event, "y")
  document.getElementById("tz").onchange = event => updateTranslation(event, "z")

  document.getElementById("sx").onchange = event => updateScale(event, "x")
  document.getElementById("sy").onchange = event => updateScale(event, "y")
  document.getElementById("sz").onchange = event => updateScale(event, "z")

  document.getElementById("rx").onchange = event => updateRotation(event, "x")
  document.getElementById("ry").onchange = event => updateRotation(event, "y")
  document.getElementById("rz").onchange = event => updateRotation(event, "z")

  document.getElementById("fv").onchange = event => updateFieldOfView(event)

  document.getElementById("color").onchange = event => updateColor(event)

  document.getElementById("lookAt").onchange = event => webglUtils.toggleLookAt(event)
  document.getElementById("ctx").onchange = event => webglUtils.updateCameraTranslation(event, "x")
  document.getElementById("cty").onchange = event => webglUtils.updateCameraTranslation(event, "y")
  document.getElementById("ctz").onchange = event => webglUtils.updateCameraTranslation(event, "z")
  document.getElementById("crx").onchange = event => webglUtils.updateCameraRotation(event, "x")
  document.getElementById("cry").onchange = event => webglUtils.updateCameraRotation(event, "y")
  document.getElementById("crz").onchange = event => webglUtils.updateCameraRotation(event, "z")
  document.getElementById("ltx").onchange = event => webglUtils.updateLookAtTranslation(event, 0)
  document.getElementById("lty").onchange = event => webglUtils.updateLookAtTranslation(event, 1)
  document.getElementById("ltz").onchange = event => webglUtils.updateLookAtTranslation(event, 2)

  document.getElementById("lookAt").checked = lookAt
  document.getElementById("ctx").value = camera.translation.x
  document.getElementById("cty").value = camera.translation.y
  document.getElementById("ctz").value = camera.translation.z
  document.getElementById("crx").value = camera.rotation.x
  document.getElementById("cry").value = camera.rotation.y
  document.getElementById("crz").value = camera.rotation.z

  selectShape(0)
}


const updateTranslation = (event, axis) => {
  const value = event.target.value
  shapes[selectedShapeIndex].translation[axis] = value
  render()
}

const updateScale = (event, axis) => {
  const value = event.target.value
  shape[selectedShapeIndex].scale[axis] = value
}

const updateFieldOfView = (event) => {
  fieldOfViewRadians = m4.degToRad(event.target.value);
  render();
}

const updateRotation = (event, axis) => {
  shapes[selectedShapeIndex].rotation[axis] = event.target.value
  render();
}

const updateColor = (event) => {
  const value = event.target.value
  const rgb = webglUtils.hexToRgb(value)
  shapes[selectedShapeIndex].color = rgb
  render()
}



const computeModelViewMatrix = (shape, viewProjectionMatrix) => {
  M = m4.translate(viewProjectionMatrix,
      shape.translation.x,
      shape.translation.y,
      shape.translation.z)
  M = m4.xRotate(M, m4.degToRad(shape.rotation.x))
  M = m4.yRotate(M, m4.degToRad(shape.rotation.y))
  M = m4.zRotate(M, m4.degToRad(shape.rotation.z))
  M = m4.scale(M, shape.scale.x, shape.scale.y, shape.scale.z)
  return M
}


const render = () => {
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
  gl.vertexAttribPointer(
    attributeCoords,
    3,           // size = 2 components per iteration
    gl.FLOAT,    // type = gl.FLOAT; i.e., the data is 32bit floats
    false,       // normalize = false; i.e., don't normalize the data
    0,           // stride = 0; ==> move forward size * sizeof(type)
    // each iteration to get the next position
    0);          // offset = 0; i.e., start at the beginning of the buffer

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 1;
  const zFar = 2000;

  gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);

  let cameraMatrix = m4.identity()
  if(lookAt) {

    cameraMatrix = m4.translate(
        cameraMatrix,
        camera.translation.x,
        camera.translation.y,
        camera.translation.z)
    const cameraPosition = [
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14]]
    cameraMatrix = m4.lookAt(
        cameraPosition,
        target,
        up)
    cameraMatrix = m4.inverse(cameraMatrix)
  } else {
    cameraMatrix = m4.zRotate(
        cameraMatrix,
        m4.degToRad(camera.rotation.z));
    cameraMatrix = m4.xRotate(
        cameraMatrix,
        m4.degToRad(camera.rotation.x));
    cameraMatrix = m4.yRotate(
        cameraMatrix,
        m4.degToRad(camera.rotation.y));
    cameraMatrix = m4.translate(
        cameraMatrix,
        camera.translation.x,
        camera.translation.y,
        camera.translation.z);
  }

  const projectionMatrix = m4.perspective(
        fieldOfViewRadians, aspect, zNear, zFar)
    const viewProjectionMatrix = m4.multiply(
        projectionMatrix, cameraMatrix)
  }


  const $shapeList = $("#object-list")
  $shapeList.empty()
  shapes.forEach((shape, index) => {
    const $li = $(`
        <li>
           <label>
               <input
                type="radio"
                id="${shape.type}-${index}"
                name="shape-index"
                    ${index === selectedShapeIndex ? "checked": ""}
                onclick="selectShape(${index})"
                value="${index}"/>
                
                <button onclick="deleteShape(${index})">
                  Delete
                </button>

                ${shape.type};
                 X: ${shape.translation.x};
                 Y: ${shape.translation.y}
           </label>
        </li>
     `)
    $shapeList.append($li)

    gl.uniform4f(uniformColor,
      shape.color.red,
      shape.color.green,
      shape.color.blue, 1);

    // apply view projection matrix to all the shapes
    let M = computeModelViewMatrix(
        shape, viewProjectionMatrix)

    // apply transformation matrix
    gl.uniformMatrix4fv(uniformMatrix, false, M);

    if(shape.type === RECTANGLE) {
      renderRectangle(shape)
    } else if(shape.type === TRIANGLE) {
      renderTriangle(shape)
    }
    else if (shape.type === CUBE) {
      renderCube(shape)
    }
    else if(shape.type === STAR) {
      renderStar(shape)
    }
    else if(shape.type === CIRCLE) {
      renderCircle(shape)
    }

  })
}



const deleteShape = (shapeIndex) => {
  shapes.splice(shapeIndex, 1)
  render()
}

const selectShape = (selectedIndex) => {
  selectedShapeIndex = selectedIndex
  document.getElementById("tx").value = shapes[selectedIndex].translation.x
  document.getElementById("ty").value = shapes[selectedIndex].translation.y
  document.getElementById("tz").value = shapes[selectedIndex].translation.z
  document.getElementById("sx").value = shapes[selectedIndex].scale.x
  document.getElementById("sy").value = shapes[selectedIndex].scale.y
  document.getElementById("sz").value = shapes[selectedIndex].scale.z
  document.getElementById("rx").value = shapes[selectedIndex].rotation.x
  document.getElementById("ry").value = shapes[selectedIndex].rotation.y
  document.getElementById("rz").value = shapes[selectedIndex].rotation.z
  document.getElementById("fv").value = m4.radToDeg(fieldOfViewRadians)
  const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color)
  document.getElementById("color").value = hexColor
}


const renderCube = (cube) => {
  const geometry = [
    0,  0,  0,    0, 30,  0,   30,  0,  0,
    0, 30,  0,   30, 30,  0,   30,  0,  0,
    0,  0, 30,   30,  0, 30,    0, 30, 30,
    0, 30, 30,   30,  0, 30,   30, 30, 30,
    0, 30,  0,    0, 30, 30,   30, 30, 30,
    0, 30,  0,   30, 30, 30,   30, 30,  0,
    0,  0,  0,   30,  0,  0,   30,  0, 30,
    0,  0,  0,   30,  0, 30,    0,  0, 30,
    0,  0,  0,    0,  0, 30,    0, 30, 30,
    0,  0,  0,    0, 30, 30,    0, 30,  0,
    30,  0, 30,   30,  0,  0,   30, 30, 30,
    30, 30, 30,   30,  0,  0,   30, 30,  0
  ]
  const float32Array = new Float32Array(geometry)
  gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW)
  var primitiveType = gl.TRIANGLES;
  gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
}
