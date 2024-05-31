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

  const shapeButtons = document.querySelectorAll('.shape-btn')
  shapeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const shapeType = button.getAttribute('data-shape')
      createShape(shapeType)
    })
  })

  function createShape (shapeType) {
    const svgNS = 'http://www.w3.org/2000/svg'
    const smallShape = document.createElementNS(svgNS, 'svg')
    smallShape.setAttribute('width', '50')
    smallShape.setAttribute('height', '50')
    smallShape.classList.add('small-shape')

    let shapeElement
    if (shapeType === 'square') {
      shapeElement = document.createElementNS(svgNS, 'rect')
      shapeElement.setAttribute('width', '50')
      shapeElement.setAttribute('height', '50')
    } else if (shapeType === 'circle') {
      shapeElement = document.createElementNS(svgNS, 'circle')
      shapeElement.setAttribute('cx', '25')
      shapeElement.setAttribute('cy', '25')
      shapeElement.setAttribute('r', '25')
    }

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
      const newShape = createShape('circle')
      newShape.firstChild.setAttribute('fill', newColor)
      newShape.style.left = `${combinedLeft}px`
      newShape.style.top = `${combinedTop}px`

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
      }
    }

    document.querySelector('.main-content').appendChild(smallShape)
    return smallShape
  }
})
