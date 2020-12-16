const RED_HEX = "#FF0000"
const RED_RGB = webglUtils.hexToRgb(RED_HEX)
const BLUE_HEX = "#0000FF"
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX)
const RECTANGLE = "RECTANGLE"
const TRIANGLE = "TRIANGLE"

const origin = {x: 0, y: 0, z: 0}
const sizeOne = {width: 1, height: 1, depth: 1}
const CUBE = "CUBE"
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
  const x = event.clientX - boundingRectangle.left;
  const y = event.clientY - boundingRectangle.top;
  const translation = {x, y}
  const shape = document.querySelector("input[name='shape']:checked").value

  addShape(translation, shape)
}


const addShape = (translation, type) => {
  const colorHex = document.getElementById("color").value
  const colorRgb = webglUtils.hexToRgb(colorHex)
  let tx = 0
  let ty = 0
  if (translation) {
    tx = translation.x
    ty = translation.y
  }
  const shape = {
    type: type,
    position: origin,
    dimensions: sizeOne,
    color: colorRgb,
    translation: {x: tx, y: ty, z: 0},
    rotation: {x: 0, y: 0, z: 0},
    scale: {x: 20, y: 20, z: 20}
  }
  shapes.push(shape)
  render()
}


// ---------------------------------------------------------------------------------------------------

const init = () => {

  const program = webglUtils
      .createProgramFromScripts(gl, "#vertex-shader-3d", "#fragment-shader-3d");

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  document.getElementById("tx").onchange = event => updateTranslation(event, "x")
  document.getElementById("ty").onchange = event => updateTranslation(event, "y")

  document.getElementById("sx").onchange = event => updateScale(event, "x")
  document.getElementById("sy").onchange = event => updateScale(event, "y")

  document.getElementById("rz").onchange = event => updateRotation(event, "z")

  document.getElementById("color").onchange = event => updateColor(event)

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

const updateRotation = (event, axis) => {
  const value = event.target.value
  const angleInDegrees = (360 - value) * Math.PI / 180;
  shapes[selectedShapeIndex].rotation[axis] = angleInDegrees
  render();
}

const updateColor = (event) => {
  const value = event.target.value
  const rgb = webglUtils.hexToRgb(value)
  shapes[selectedShapeIndex].color = rgb
  render()
}


const render = () => {
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
  gl.vertexAttribPointer(
    attributeCoords,
    2,           // size = 2 components per iteration
    gl.FLOAT,    // type = gl.FLOAT; i.e., the data is 32bit floats
    false,       // normalize = false; i.e., don't normalize the data
    0,           // stride = 0; ==> move forward size * sizeof(type)
    // each iteration to get the next position
    0);          // offset = 0; i.e., start at the beginning of the buffer


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

    //compute transformation matrix
    let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
    matrix = m3.translate(matrix, shape.translation.x, shape.translation.y);
    matrix = m3.rotate(matrix, shape.rotation.z);
    matrix = m3.scale(matrix, shape.scale.x, shape.scale.y);

    // apply transformation matrix
    gl.uniformMatrix3fv(uniformMatrix, false, matrix);


    if(shape.type === RECTANGLE) {
      renderRectangle(shape)
    } else if(shape.type === TRIANGLE) {
      renderTriangle(shape)
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
  document.getElementById('sx').value = shapes[selectedIndex].scale.x
  document.getElementById('sy').value = shapes[selectedIndex].scale.y
  document.getElementById('rz').value = shapes[selectedIndex].rotation.z
  const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color)
  document.getElementById("color").value = hexColor
}


const renderTriangle = (triangle) => {
  const x1 = triangle.position.x
    - triangle.dimensions.width / 2
  const y1 = triangle.position.y
    + triangle.dimensions.height / 2
  const x2 = triangle.position.x
    + triangle.dimensions.width / 2
  const y2 = triangle.position.y
    + triangle.dimensions.height / 2
  const x3 = triangle.position.x
  const y3 = triangle.position.y
    - triangle.dimensions.height / 2

  const float32Array = new Float32Array([
    x1, y1,   x2, y2,   x3, y3
  ])

  gl.bufferData(gl.ARRAY_BUFFER,
    float32Array, gl.STATIC_DRAW);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

const renderRectangle = (rectangle) => {
  const x1 = rectangle.position.x
    - rectangle.dimensions.width/2;
  const y1 = rectangle.position.y
    - rectangle.dimensions.height/2;
  const x2 = rectangle.position.x
    + rectangle.dimensions.width/2;
  const y2 = rectangle.position.y
    + rectangle.dimensions.height/2;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1, x2, y1, x1, y2,
    x1, y2, x2, y1, x2, y2,
  ]), gl.STATIC_DRAW);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
