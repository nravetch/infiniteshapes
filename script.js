// script.js
const colorItems = document.querySelector('.color-items');

colorItems.addEventListener('click', (event) => {
  const targetItem = event.target.closest('.grid-item');
  if (!targetItem) return; // Exit if clicked outside a grid-item

  // Remove previous selection
  colorItems.querySelectorAll('.grid-item').forEach(item => {
    item.classList.remove('color-selected');
  });

  // Add selected class to the clicked item
  targetItem.classList.add('color-selected');

  // Example: Get the selected color
  const selectedColor = targetItem.getAttribute('data-color');
  console.log(`Selected color: ${selectedColor}`);
});

// script.js
document.addEventListener('DOMContentLoaded', function() {
    const shapeButtons = document.querySelectorAll('.shape-btn');
  
    shapeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const shapeType = button.getAttribute('data-shape');
        createShape(shapeType);
      });
    });
    function createShape(shapeType) {
      const smallShape = document.createElement('div');
      smallShape.classList.add('small-shape');
      smallShape.classList.add(shapeType); // Add a class for the specific shape
    
      // Calculate random coordinates near the center of the main content area
      const mainContent = document.querySelector('.main-content');
      const mainRect = mainContent.getBoundingClientRect();
      const centerX = mainRect.left + mainRect.width / 2;
      const centerY = mainRect.top + mainRect.height / 2;
    
      // Calculate random coordinates within a smaller range around the center
      const maxDistance = 100; // Maximum distance from the center
      const randomX = centerX - maxDistance + Math.random() * (maxDistance * 2);
      const randomY = centerY - maxDistance + Math.random() * (maxDistance * 2);
    
      // Set position using random coordinates
      smallShape.style.left = `${randomX}px`;
      smallShape.style.top = `${randomY}px`;
    
        // Make the shape draggable
      let isDragging = false;
      let offsetX, offsetY;

      smallShape.addEventListener('mousedown', startDrag);
      smallShape.addEventListener('mouseup', endDrag);

      function startDrag(e) {
        isDragging = true;
        offsetX = e.clientX - parseFloat(getComputedStyle(smallShape).left);
        offsetY = e.clientY - parseFloat(getComputedStyle(smallShape).top);
        window.addEventListener('mousemove', drag);
      }

      function drag(e) {
        if (isDragging) {
          const newX = e.clientX - offsetX;
          const newY = e.clientY - offsetY;
          smallShape.style.left = `${newX}px`;
          smallShape.style.top = `${newY}px`;
        }
      }

      function endDrag() {
        isDragging = false;
        window.removeEventListener('mousemove', drag);

        // Check if the shape was dropped outside the main content area
        const mainContent = document.querySelector('.main-content');
        const mainRect = mainContent.getBoundingClientRect();
        const shapeRect = smallShape.getBoundingClientRect();

        if (
          shapeRect.left < mainRect.left ||
          shapeRect.right > mainRect.right ||
          shapeRect.top < mainRect.top ||
          shapeRect.bottom > mainRect.bottom
        ) {
          // Shape was dropped outside the main content area, so delete it
          smallShape.remove();
        } else {
          // Check for overlapping shapes and combine them if needed
          const shapes = document.querySelectorAll('.small-shape');
          shapes.forEach(shape => {
            if (shape !== smallShape && isOverlapping(shape, smallShape)) {
              combineShapes(shape, smallShape);
            }
          });
        }
      }

      // Function to check if two shapes overlap
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

      // Function to combine two shapes into a white circle
      function combineShapes(shape1, shape2) {
        // Calculate combined position and size
        const rect1 = shape1.getBoundingClientRect();
        const rect2 = shape2.getBoundingClientRect();
        const combinedLeft = Math.min(rect1.left, rect2.left);
        const combinedTop = Math.min(rect1.top, rect2.top);
        const combinedWidth = Math.max(rect1.right, rect2.right) - combinedLeft;
        const combinedHeight = Math.max(rect1.bottom, rect2.bottom) - combinedTop;

        // Create a new white circle shape
        const combinedShape = document.createElement('div');
        combinedShape.classList.add('small-shape');
        combinedShape.classList.add('circle');
        combinedShape.style.left = `${combinedLeft}px`;
        combinedShape.style.top = `${combinedTop}px`;
        combinedShape.style.width = `${combinedWidth}px`;
        combinedShape.style.height = `${combinedHeight}px`;
        combinedShape.style.backgroundColor = 'white'; // Set background color to white

        // Remove the original shapes
        shape1.remove();
        shape2.remove();
        document.body.appendChild(combinedShape);
        // ^ change to call createShape
      }
      document.body.appendChild(smallShape);
    }
    
});
  