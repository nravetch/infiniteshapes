// script.js
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
    const inverseRgbValues = rgbValues.map(value => 255 - value)
    return `rgb(${inverseRgbValues.join(',')})`
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
  })


  // Original Shapes
  const shapes = [
    { shape: 'square', label: 'Square' },
    { shape: 'circle', label: 'Circle' },
    { shape: 'ellipse', label: 'Ellipse' },
    { shape: 'polygon', label: 'Star' },
    { shape: 'polygon', label: 'Sine' }
  ];

  // Get the container where the buttons will be appended
  const shapeItems = document.querySelector('.shape-items');

  // Create and append the buttons
  shapes.forEach(({ shape, label }) => {
    const button = document.createElement('button');
    button.classList.add('shape-btn');
    button.dataset.shape = shape;
    button.textContent = label;
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


  function createShape (shapeType) {
    // complain if we're trying to create a shape without an applicable ID
    if (!shapesData[shapeType]) {
      console.error(`Shape type "${shapeType}" not found in shapesData`);
      return null;
    }

    const svgNS = 'http://www.w3.org/2000/svg'
    const smallShape = document.createElementNS(svgNS, 'svg')
    smallShape.setAttribute('width', '200')
    smallShape.setAttribute('height', '250')
    smallShape.classList.add('small-shape')
    // add in the shapeType (the ID, so we can reference it later)
    smallShape.setAttribute('data-shape-type', shapeType);
    
    // Element Specific Attributes
    // pulling types from shape.json

    // shapeInfo represents the shape whose ID is shapeType
    const shapeInfo = shapesData[shapeType];

    // create the initial SVG, abstracted
    const shapeElement = document.createElementNS(svgNS, shapeInfo.element);

    // Set attributes for the shape (iterates through all attributes for a ShapeInfo's element)
    Object.keys(shapeInfo.attributes).forEach(attr => {
      shapeElement.setAttribute(attr, shapeInfo.attributes[attr]);
    });


    
    // Element Mutual Attributes
    shapeElement.setAttribute('fill', selectedColor)
    smallShape.appendChild(shapeElement)
    
    const mainContent = document.querySelector('.main-content')
    const mainRect = mainContent.getBoundingClientRect()
    const centerX = mainRect.left + mainRect.width / 2
    const centerY = mainRect.top + mainRect.height / 2
    const maxDistance = 100
    const randomX = centerX - maxDistance + Math.random() * (maxDistance * 2)
    const randomY = centerY - maxDistance + Math.random() * (maxDistance * 2)

    smallShape.style.position = 'absolute'
    smallShape.style.left = `${randomX}px`
    smallShape.style.top = `${randomY}px`

    let isDragging = false
    let offsetX, offsetY

    smallShape.addEventListener('mousedown', startDrag)
    smallShape.addEventListener('mouseup', endDrag)

    function startDrag (e) {
      isDragging = true
      offsetX = e.clientX - parseFloat(getComputedStyle(smallShape).left)
      offsetY = e.clientY - parseFloat(getComputedStyle(smallShape).top)
      window.addEventListener('mousemove', drag)
      window.addEventListener('mouseup', endDrag)
    }

    function drag (e) {
      if (isDragging) {
        const newX = e.clientX - offsetX
        const newY = e.clientY - offsetY
        smallShape.style.left = `${newX}px`
        smallShape.style.top = `${newY}px`
      }
    }

    function endDrag () {
      isDragging = false
      window.removeEventListener('mousemove', drag)
      const mainContent = document.querySelector('.main-content')
      const mainRect = mainContent.getBoundingClientRect()
      const shapeRect = smallShape.getBoundingClientRect()

      if (
        shapeRect.left < mainRect.left ||
        shapeRect.right > mainRect.right ||
        shapeRect.top < mainRect.top ||
        shapeRect.bottom > mainRect.bottom
      ) {
        smallShape.remove()
      } else {
        const shapes = document.querySelectorAll('.small-shape')
        shapes.forEach(shape => {
          if (shape !== smallShape && isOverlapping(shape, smallShape)) {
            combineShapes(shape, smallShape)
          }
        })
      }
      window.removeEventListener('mouseup', endDrag) // Ensure mouseup listener is removed
    }

    function isOverlapping (shape1, shape2) {
      const rect1 = shape1.getBoundingClientRect()
      const rect2 = shape2.getBoundingClientRect()
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      )
    }

    function combineShapes (shape1, shape2) {
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
      const newColor = `rgb(${avgRgb.join(',')})`

      shape1.remove()
      shape2.remove()

      // Create a unique key for the combination of shape1 and shape2
      const shapeType1 = shape1.getAttribute('data-shape-type')
      const shapeType2 = shape2.getAttribute('data-shape-type')
      const combinedKey = `${shapeType1}-${shapeType2}`
      
      // check to see if a shape has been made using shape1 and shape2
      // if so, use the cached result to create the new shape

      // TODO: Read / Write to a cache instead of keeping in-memory

      // Check if a shape has been made using shape1 and shape2 (using their unique IDs)
      if (combinedShapesCache[combinedKey]) {
        // If so, use the cached result to create the new shape
        const cachedShapeType = combinedShapesCache[combinedKey]
        const newShape = createShape(cachedShapeType)
        newShape.firstChild.setAttribute('fill', newColor)
        newShape.style.left = `${combinedLeft}px`
        newShape.style.top = `${combinedTop}px`
      } else {
        // Log that shape product doesn't exist yet
        console.log(`Shape combination ${combinedKey} does not exist yet.`)

        // TODO: Integrate and Call LLM API to acquire new shape
        // current placeholder
        const newShape = createShape('circle')
        newShape.firstChild.setAttribute('fill', newColor)
        newShape.style.left = `${combinedLeft}px`
        newShape.style.top = `${combinedTop}px`
        // Store the new combination result in the cache
        combinedShapesCache[combinedKey] = 'circle' // Replace 'circle' with the actual shape type
      }

      if (!colorExists(newColor)) {
        existingColors.add(newColor)
        const newColorItem = document.createElement('div')
        newColorItem.setAttribute('class', 'grid-item')
        newColorItem.setAttribute('data-color', newColor)
        newColorItem.textContent = `New Color ${existingColors.size - 5}`
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

        // Get the container where the buttons will be appended
        const shapeItems = document.querySelector('.shape-items');

        // Started creation process for new shapes 
        // Create a new button for the new shape
        const newShapeButton = document.createElement('button');
        newShapeButton.classList.add('shape-btn');
        newShapeButton.dataset.shape = 'newShape'; // replace 'newShape' with the actual shape type
        newShapeButton.textContent = `New Shape ${existingColors.size - 5}`; // replace the text content as needed

        // Add an event listener to the new button
        newShapeButton.addEventListener('click', () => {
          const shapeType = newShapeButton.getAttribute('data-shape');
          createShape(shapeType);
        });

        // Append the new button to the shape items
        shapeItems.appendChild(newShapeButton);
      }
    }

    document.querySelector('.main-content').appendChild(smallShape)
    return smallShape
  }
})
