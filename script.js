// script.js
const prompt = `
Objective:

You are an AI tasked with creating new and unique SVG (Scalable Vector Graphics) shapes. You will be given two SVG shapes as input. Your goal is to analyze these shapes, identify their distinctive features, and combine elements from both to generate a novel SVG shape. The resulting shape should be creative, cohesive, and aesthetically pleasing.

Input Description:

You will receive two shape objects, each representing an SVG shape with specific properties. Each shape object will contain the following:

1. shape1 and shape2: These are objects containing details of the first and second shapes respectively.

2. Properties of Each Shape Object:
   - element: A string indicating the SVG element type, which can be one of the following: 'rect', 'ellipse', 'polygon', 'path', or 'circle'.
   - attributes: An object containing the necessary attributes for the specific SVG element type. The attributes include:
     - rect:
       - "x": The x-coordinate of the rectangle.
       - "y": The y-coordinate of the rectangle.
       - "width": The width of the rectangle.
       - "height": The height of the rectangle.
     - circle:
       - "cx": The x-coordinate of the circle's center.
       - "cy": The y-coordinate of the circle's center.
       - "r": The radius of the circle.
     - ellipse:
       - "cx": The x-coordinate of the ellipse's center.
       - "cy": The y-coordinate of the ellipse's center.
       - "rx": The x-axis radius of the ellipse.
       - "ry": The y-axis radius of the ellipse.
     - polygon:
       - "points": A string containing a list of points defining the polygon.
     - path:
       - "d": A string containing path data that defines the shape.

Example Input:

{
  "shape1": {
    "element": "rect",
    "attributes": {
      "x": "10",
      "y": "10",
      "width": "30",
      "height": "30"
    }
  },
  "shape2": {
    "element": "circle",
    "attributes": {
      "cx": "25",
      "cy": "75",
      "r": "20"
    }
  }
}

Guidelines:

Shape Analysis:

- Identify Key Features:
  - Examine the structure, curves, lines, and angles of each shape.
  - Identify notable characteristics such as symmetry, complexity, and style (e.g., geometric, organic, abstract).

Combination Strategy:

- Fusion of Elements:
  - Merge prominent features from both shapes. For example, you might combine the curves from one shape with the angular features of another.
  - Ensure that the combination is seamless and the elements from both shapes integrate well.

- Proportion and Balance:
  - Maintain a sense of proportion and balance. The new shape should not appear disjointed or disproportionate.

- Innovation:
  - Introduce innovative elements inspired by the input shapes but not directly copied. Aim to create something new while still being influenced by the original shapes.

Aesthetic Quality:

- Creativity:
  - Aim for a design that is visually interesting and appealing.

- Consistency:
  - Ensure that the new shape is consistent in style and theme with the input shapes.

- Complexity:
  - Adjust the complexity of the new shape to be appropriate for the intended use. It should neither be too simple nor overly intricate.

Technical Specifications:

- SVG Format:
  - Output the new shape in SVG format, as shown below.

- Attributes:
  - Maintain proper use of SVG attributes such as path, fill, stroke, stroke-width, and others as needed.

- Scalability:
  - The resulting shape should be scalable without losing quality or detail.

Output:

Provide the SVG code for the new, novel shape that combines elements from both input shapes in JSON format.
OUTPUT ONLY THE JSON REPRESENTATION AS DETAILED BELOW. DO NOT EXPLAIN THE OUTPUT.

Use only the required attributes for the specific SVG element:

{
  "unique_identifier (replace this with a creative name that describes the new object": {
    "element": "(one of 'rect', 'ellipse', 'polygon', 'path', or 'circle')",
    "attributes": {
      "x": "(required for 'rect')",
      "y": "(required for 'rect')",
      "width": "(required for 'rect')",
      "height": "(required for 'rect')",
      "cx": "(required for 'circle' and 'ellipse')",
      "cy": "(required for 'circle' and 'ellipse')",
      "r": "(required for 'circle')",
      "rx": "(required for 'ellipse')",
      "ry": "(required for 'ellipse')",
      "points": "(required for 'polygon') - should be numbers separated by commas that represent the points on the polygon",
      "d": A string containing path data that defines the shape. Ensure the 'd' attribute follows the SVG path data specification, including commands like M (move to), L (line to), C (cubic Bézier curve), Q (quadratic Bézier curve), Z (close path), and others as necessary.

    }
  }
}
`;

async function fetchAnswer(shape1, shape2) {
    const url = 'http://localhost:11434/api/generate';
    const headers = {
        'Content-Type': 'application/json'
    };
    const shapeData = {
        shape1: {
            element: shape1.getAttribute('data-shape-type'),
            attributes: extractAttributes(shape1.firstChild)
        },
        shape2: {
            element: shape2.getAttribute('data-shape-type'),
            attributes: extractAttributes(shape2.firstChild)
        }
    };
    const data = {
        model: 'phi3:mini',
        prompt: prompt + "\nInput:\n" + JSON.stringify(shapeData, null, 2)
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        const responseData = await response.text();
        const lines = responseData.split('\n');
        let answer = '';

        lines.forEach(line => {
            if (line.trim()) {
                try {
                    const lineJson = JSON.parse(line);
                    if (lineJson.response) {
                        answer += lineJson.response;
                    }
                } catch (e) {
                    console.log('an error occurred rip')
                }
            }
        });
        console.log("RAW AI RESPONSE:")
        console.log(answer)
        //in case phi3 likes to elaborate, this should remove most issues
        const extraExplanationMark = Math.max(0, answer.indexOf('=='));
        const reducedAns = extraExplanationMark == 0 ? answer : answer.substring(0, extraExplanationMark);
        const lastBrace = reducedAns.lastIndexOf('}');
        return JSON.parse(reducedAns.substring(0,lastBrace+1));
    } catch (error) {
        console.error('Failed to get a response. Error:', error);
        return null;
    }
}

function extractAttributes(element) {
    const attributes = {};
    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attributes[attr.name] = attr.value;
    }
    return attributes;
}

function nameFromCombinedKey(combinedKey) {
  const [name1, name2] = combinedKey.split("-");
  const half1 = Math.ceil(name1.length / 2);
  const half2 = Math.floor(name2.length / 2);
  const mixed = name1.slice(0, half1) + name2.slice(half2);
  return mixed.charAt(0).toUpperCase() + mixed.slice(1);
}

async function createButtons(shapeItems) {
  // Wait for shapesData to be loaded
  await waitForShapesData();

  // Clear existing buttons
  shapeItems.innerHTML = '';

  // Create and append the buttons
  shapes.forEach(({ shape, label }) => {
    const button = document.createElement('button');
    button.classList.add('shape-btn');
    button.dataset.shape = shape;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '32');
    svg.setAttribute('height', '32');
    svg.setAttribute('viewBox', '0 0 64 64'); // Initial viewBox for initial rendering

    const shapeInfo = shapesData[shape];
    console.log("Shape Info:", shapeInfo);
    const shapeElement = document.createElementNS(svgNS, shapeInfo.element);

    Object.keys(shapeInfo.attributes).forEach(attr => {
      shapeElement.setAttribute(attr, shapeInfo.attributes[attr]);
    });

    shapeElement.setAttribute('fill', selectedColor);
    svg.appendChild(shapeElement);

    // Append SVG to the DOM temporarily to calculate bounding box
    document.body.appendChild(svg);
    const bbox = shapeElement.getBBox();
    document.body.removeChild(svg);

    // Center the content in the viewBox
    const padding = 10; // Optional padding around the shape
    const viewBoxX = bbox.x - padding;
    const viewBoxY = bbox.y - padding;
    const viewBoxWidth = bbox.width + 2 * padding;
    const viewBoxHeight = bbox.height + 2 * padding;

    svg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);

    // Append SVG and label to button
    button.appendChild(svg);
    const span = document.createElement('span');
    span.textContent = label;
    button.appendChild(span);

    shapeItems.appendChild(button);
  });

  // Add event listeners to the buttons
  const shapeButtons = document.querySelectorAll('.shape-btn');
  shapeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const shapeType = button.getAttribute('data-shape');
      createShape(shapeType);
    });
  });
}

function updateShapeColors(selectedColor) {
  // Update the fill color of all shapes
  const shapeButtons = document.querySelectorAll('.shape-btn');
  shapeButtons.forEach(button => {
    const svg = button.querySelector('svg');
    const shapeElement = svg.firstElementChild;
    if (shapeElement) {
      shapeElement.setAttribute('fill', selectedColor);
    }
  });
}

let shapesData = {};
const combinedShapesCache = {};

fetch('shapes.json')
  .then(response => {
    console.log('Response:', response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    shapesData = data;
    console.log('Shapes data loaded successfully:', shapesData);
  })
  .catch(error => {
    if (error instanceof SyntaxError) {
      console.error('JSON Parse Error:', error.message);
    } else if (error instanceof TypeError) {
      console.error('Fetch Error:', error.message);
    } else {
      console.error('Unknown Error:', error.message);
    }
    console.error('Error loading shapes.json:', error);
  });

document.addEventListener('DOMContentLoaded', function () {
  var colorItems = document.querySelector('.color-items')
  var checkmarks = document.querySelectorAll('.checkmark')
  var selectedColor = 'black'

  colorItems.querySelectorAll('.grid-item').forEach(item => {
    const color = item.getAttribute('data-color')
    const textColor = getInverseColor(color)
    item.style.color = textColor
    item.style.backgroundColor = color
  })

  const existingColors = new Set([
    'rgb(255, 0, 0)',
    'rgb(255, 255, 0)',
    'rgb(0, 0, 255)',
    'rgb(255, 255, 255)',
    'rgb(0, 0, 0)'
  ])

  function colorExists (color) {
    return existingColors.has(color)
  }

  function getInverseColor (color) {
    const rgbValues = color.match(/\d+/g).map(Number)
    const [red, green, blue] = rgbValues;
    return red*0.299 + green*0.587 + blue*0.114 > 148 ? "rgb(0,0,0)" : "rgb(255,255,255)";
  }

  colorItems.addEventListener('click', event => {
    const targetItem = event.target.closest('.grid-item')
    if (!targetItem) return

    colorItems.querySelectorAll('.grid-item').forEach(item => {
      item.classList.remove('color-selected')
    })

    checkmarks.forEach(checkmark => {
      checkmark.style.display = 'none'
    })

    targetItem.classList.add('color-selected')
    targetItem.querySelector('.checkmark').style.display = 'inline'

    selectedColor = targetItem.getAttribute('data-color')
    console.log(`Selected color: ${selectedColor}`)
    updateShapeColors(selectedColor);
  })


  // Create the buttons with the default color
  const shapeItems = document.querySelector('.shape-items')
  createButtons(shapeItems);

  async function combineShapes (shape1, shape2) {
    const rect1 = shape1.getBoundingClientRect()
    const rect2 = shape2.getBoundingClientRect()
    const combinedLeft = (rect1.left + rect2.left) / 2
    const combinedTop = (rect1.top + rect2.top) / 2

    const color1 = getComputedStyle(shape1.firstChild).fill
    const color2 = getComputedStyle(shape2.firstChild).fill

    const rgbToArray = color => color.match(/\d+/g).map(Number)
    const rgb1 = rgbToArray(color1)
    const rgb2 = rgbToArray(color2)

    const avgRgb = rgb1.map((value, index) =>
      Math.round((value + rgb2[index]) / 2)
    )
    const htmlColorName = getNearestColorCode(avgRgb)
    const newColor = `rgb(${COLORS[htmlColorName].join(', ')})`
    console.log(existingColors, newColor, colorExists(newColor));

    shape1.remove()
    shape2.remove()

    const shapeType1 = shape1.getAttribute('data-shape-type')
    const shapeType2 = shape2.getAttribute('data-shape-type')
    const combinedKey = `${shapeType1}-${shapeType2}`
    
    let uniqueIdentifier
    if (combinedShapesCache[combinedKey]) {
      uniqueIdentifier = combinedShapesCache[combinedKey]
    } else {
      console.log(`Shape combination ${combinedKey} does not exist yet.`)
      const aiResponse = await fetchAnswer(shape1, shape2)
      console.log("AI responded:")
      console.log(aiResponse)
      if (aiResponse) {
          uniqueIdentifier = Object.keys(aiResponse)[0]
          combinedShapesCache[combinedKey] = uniqueIdentifier
          shapesData[uniqueIdentifier] = aiResponse[uniqueIdentifier]
      } else {
          console.error('Failed to create new shape.')
          return;
      }
    }

    const newShapeData = shapesData[uniqueIdentifier]
    const newShape = createShapeFromData(newShapeData, uniqueIdentifier)
    newShape.firstChild.setAttribute('fill', newColor)
    newShape.style.left = `${combinedLeft}px`
    newShape.style.top = `${combinedTop}px`

    createButtons(shapeItems)

    if (!colorExists(newColor)) {
      existingColors.add(newColor)
      const newColorItem = document.createElement('div')
      newColorItem.setAttribute('class', 'grid-item')
      newColorItem.setAttribute('data-color', newColor)
      newColorItem.textContent = htmlColorName
      newColorItem.style.backgroundColor = newColor
      newColorItem.style.color = getInverseColor(newColor)
      newColorItem.addEventListener('click', event => {
        selectedColor = newColor
        console.log(`Selected color: ${selectedColor}`)
      })

      const newCheckmark = document.createElement('span')
      newCheckmark.className = 'checkmark'
      newCheckmark.textContent = '\u2713'
      newColorItem.appendChild(newCheckmark)

      colorItems.appendChild(newColorItem)

      checkmarks = document.querySelectorAll('.checkmark')

      const shapeItems = document.querySelector('.shape-items');

      shapeItems.appendChild(newShapeButton);
    }
  }

  function createShape (shapeType) {
    if (!shapesData[shapeType]) {
      console.error(`Shape type "${shapeType}" not found in shapesData`);
      return null;
    }

    const svgNS = 'http://www.w3.org/2000/svg'
    const smallShape = document.createElementNS(svgNS, 'svg')
    smallShape.setAttribute('width', '200')
    smallShape.setAttribute('height', '250')
    smallShape.classList.add('small-shape')
    smallShape.setAttribute('data-shape-type', shapeType);
    
    const shapeInfo = shapesData[shapeType];
    const shapeElement = document.createElementNS(svgNS, shapeInfo.element);

    Object.keys(shapeInfo.attributes).forEach(attr => {
      shapeElement.setAttribute(attr, shapeInfo.attributes[attr]);
    });

    shapeElement.setAttribute('fill', selectedColor)
    smallShape.appendChild(shapeElement)
    
    setPositionAndDrag(smallShape)

    document.querySelector('.main-content').appendChild(smallShape)
    return smallShape
  }

  function createShapeFromData(shapeData, uniqueIdentifier) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const smallShape = document.createElementNS(svgNS, 'svg');
    smallShape.setAttribute('width', '200');
    smallShape.setAttribute('height', '250');
    smallShape.classList.add('small-shape');
    smallShape.setAttribute('data-shape-type', uniqueIdentifier);

    const shapeElement = document.createElementNS(svgNS, shapeData.element);

    for (const attr in shapeData.attributes) {
        shapeElement.setAttribute(attr, shapeData.attributes[attr]);
    }

    shapeElement.setAttribute('fill', selectedColor);
    smallShape.appendChild(shapeElement);
    document.querySelector('.main-content').appendChild(smallShape);

    setPositionAndDrag(smallShape);
    return smallShape;
  }

  function setPositionAndDrag(smallShape) {
    const mainContent = document.querySelector('.main-content');
    const mainRect = mainContent.getBoundingClientRect();
    const centerX = mainRect.left + mainRect.width / 2;
    const centerY = mainRect.top + mainRect.height / 2;
    const maxDistance = 100;
    const randomX = centerX - maxDistance + Math.random() * (maxDistance * 2);
    const randomY = centerY - maxDistance + Math.random() * (maxDistance * 2);

    smallShape.style.position = 'absolute';
    smallShape.style.left = `${randomX}px`;
    smallShape.style.top = `${randomY}px`;

    let isDragging = false;
    let offsetX, offsetY;

    smallShape.addEventListener('mousedown', startDrag);
    smallShape.addEventListener('mouseup', endDrag);

    function startDrag(e) {
      isDragging = true;
      offsetX = e.clientX - parseFloat(getComputedStyle(smallShape).left);
      offsetY = e.clientY - parseFloat(getComputedStyle(smallShape).top);
      window.addEventListener('mousemove', drag);
      window.addEventListener('mouseup', endDrag);
    }

    function drag(e) {
      if (isDragging) {
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        smallShape.style.left = `${newX}px`;
        smallShape.style.top = `${newY}px`;
      }
    }

    async function endDrag() {
      isDragging = false;
      window.removeEventListener('mousemove', drag);
      const mainContent = document.querySelector('.main-content');
      const mainRect = mainContent.getBoundingClientRect();
      const shapeRect = smallShape.getBoundingClientRect();

      if (
        shapeRect.left < mainRect.left ||
        shapeRect.right > mainRect.right ||
        shapeRect.top < mainRect.top ||
        shapeRect.bottom > mainRect.bottom
      ) {
        smallShape.remove();
      } else {
        const shapes = document.querySelectorAll('.small-shape');
        for (const shape of shapes) {
          if (shape !== smallShape && isOverlapping(shape, smallShape)) {
            await combineShapes(shape, smallShape);
          }
        }
      }
      window.removeEventListener('mouseup', endDrag);
    }

    function isOverlapping(shape1, shape2) {
      const rect1 = shape1.getBoundingClientRect();
      const rect2 = shape2.getBoundingClientRect();
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    }
  }
  async function createButtons(shapeItems) {
    // Wait for shapesData to be loaded
    await waitForShapesData();
  
    // Create and append the buttons
    Object.keys(shapesData).forEach(shape => {
      const button = document.createElement('button');
      button.classList.add('shape-btn');
      button.dataset.shape = shape;
  
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', '32');
      svg.setAttribute('height', '25');
      svg.setAttribute('viewBox', '0 0 64 64'); // Initial viewBox for initial rendering
  
      const shapeInfo = shapesData[shape];
      const shapeElement = document.createElementNS(svgNS, shapeInfo.element);
  
      Object.keys(shapeInfo.attributes).forEach(attr => {
        shapeElement.setAttribute(attr, shapeInfo.attributes[attr]);
      });
  
      shapeElement.setAttribute('fill', selectedColor);
      svg.appendChild(shapeElement);
  
      // Append SVG to the DOM temporarily to calculate bounding box
      document.body.appendChild(svg);
      const bbox = shapeElement.getBBox();
      document.body.removeChild(svg);
  
      // Center the content in the viewBox
      const padding = 10; // Optional padding around the shape
      const viewBoxX = bbox.x - padding;
      const viewBoxY = bbox.y - padding;
      const viewBoxWidth = bbox.width + 2 * padding;
      const viewBoxHeight = bbox.height + 2 * padding;
  
      svg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
  
      // Append SVG and label to button
      button.appendChild(svg);
      const span = document.createElement('span');
      span.textContent = shape;
      button.appendChild(span);
  
      shapeItems.appendChild(button);
    });
    // Add event listeners to the buttons
    const shapeButtons = document.querySelectorAll('.shape-btn');
    shapeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const shapeType = button.getAttribute('data-shape');
        createShape(shapeType);
      });
    });
  }

  function waitForShapesData() {
    return new Promise((resolve, reject) => {
      const checkShapesData = () => {
        if (shapesData !== null && Object.keys(shapesData).length !== 0) {
          resolve();
        } else {
          setTimeout(checkShapesData, 100); // Check again after 100ms
        }
      };
      checkShapesData();
    });
  }
});