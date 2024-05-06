let images = document.querySelectorAll(".draggable-resizable-image")

let imageObjects = []

//First Dropdown (Resize, Drag, Margin)
const dropdown = document.getElementById("dropdown");

//Resizing and Moving/Dragging
const resizeButton = document.getElementById("resize-button");
const moveButton = document.getElementById("move-button");
const deleteButton = document.getElementById("delete-button");

//Div Parent
const editable = document.getElementById("editable");
//Select All Divs that are the children of editable
const paragraphs = editable.querySelectorAll('p, div');

//Content Editable Div Variables
let editableRect = editable.getBoundingClientRect();
let middleX = editableRect.left + (editableRect.width / 2);

//Redefines Editable Rect On Resize 
window.addEventListener("resize", () => {
    images = document.querySelectorAll(".draggable-resizable-image");
    editableRect = editable.getBoundingClientRect();
    middleX = editableRect.left + (editableRect.width / 2);
})

let addedInputIds = []; // store the IDs of the inputs that have been added for handleDelete
                       // declare it globally to store all potential inputs

class Image {
    constructor(image, //Image DOM Element
        
                resizing = false, aspectRatio = 0, initialX = 0, initialY = 0, initialWidth = 0, initialHeight = 0, //Resizing

                draggable = false, offsetX = 0, offsetY = 0, isSnappedLeft = false, isSnappedRight = false, isPlaced = false) //Dragging
 
    {

        this.image = image;

        this.resizing = resizing
        this.aspectRatio = aspectRatio;
        this.initialX = initialX;
        this.initialY = initialY;
        this.initialWidth = initialWidth;
        this.initialHeight = initialHeight;

        this.draggable = draggable;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.isSnappedLeft = isSnappedLeft;
        this.isSnappedRight = isSnappedRight;
        this.isPlaced = isPlaced;

        //Mouse Move Handler for Event Listening Matchup
        this.handleMMRef = event => this.handleMouseMove(event);

    }

    //Arrow Functions Inherit 'this' From Parent Scope

    //Handle Mouse Down Function
    handleMouseDown = (event) => {

        /* Create event handler functions that add listeners for the actions themselves in the end
            AND more importantly, remove event listeners for actions that aren't invoked so that when 
            the next button is pressed, multiple event listeners don't go off simulataneously; I am 
            proud of this lol
        */  
        
         const handleResizeButton = event => {
            this.handleResize(event)
            deleteButton.removeEventListener("click", handleDeleteButton);
            moveButton.removeEventListener("click", handleMoveButton);
        }
        const handleMoveButton = event => {
            this.handleMove(event)
            deleteButton.removeEventListener("click", handleDeleteButton);
            resizeButton.removeEventListener("click", handleResizeButton);
        }
        const handleDeleteButton = event => {
            this.handleDelete(event)
            moveButton.removeEventListener("click", handleMoveButton);
            resizeButton.removeEventListener("click", handleResizeButton);
        }

        if (!this.resizing && 
            !this.draggable) {
       
              //Dropdown Activated
              dropdown.classList.remove("hidden");

              dropdown.style.top = this.image.offsetTop + this.image.offsetHeight + "px";
              dropdown.style.left = this.image.offsetLeft + this.image.offsetWidth + "px";

              // Add event listeners to the buttons
              resizeButton.addEventListener("click", handleResizeButton, { once: true });
              moveButton.addEventListener("click", handleMoveButton, { once: true });
              deleteButton.addEventListener("click", handleDeleteButton, console.log('Listener Added'), { once : true });
      
            } else if (this.resizing || this.draggable) {
            
                this.resizing = false;
                this.draggable = false;
              
            }
         
    }
    
    //If mousedown occurs while resizing/dragging within parent, cancels the action
    handleMouseDownDiv = (event) => {

        //Reset all Boolean Values
        if (this.resizing || this.draggable) {
        
            this.resizing = false;
            this.draggable = false;
            dropdown.classList.add("hidden");
    
        }
    }
      
    handleResize = (event) => {

        //Computer Compatability
        editable.addEventListener("mousedown", this.removeMouseMove, { once : true });
        this.image.addEventListener("mousedown", this.removeMouseMove, { once : true });

        // //Mobile Compatability
        // editable.addEventListener("touchend", this.removeMouseMove, { once : true })
        // this.image.addEventListener("touchend", this.removeMouseMove, { once : true })
        
        // Set up resizing variables
        this.resizing = true;
        this.draggable = false;
        this.aspectRatio = this.image.clientWidth / this.image.clientHeight;
        this.initialX = event.clientX;
        this.initialY = event.clientY;

        this.initialWidth = this.image.clientWidth;
        this.initialHeight = this.image.clientHeight;
        dropdown.classList.add("hidden");

    }

    //Removes Mouse Move in handleMove method while creating new listeners for mousedown
    //The handleMMRef is essential for making sure that the added and subtracted listeners are equal

    removeMouseMove = () => {

        editable.removeEventListener("mousemove", this.handleMMRef);

        editable.removeEventListener("touchend", this.handleMMRef);

    }

   handleMove = (event) => {  

        //Computer Compatability
        editable.addEventListener("mousedown", this.removeMouseMove, { once : true })
        this.image.addEventListener("mousedown", this.removeMouseMove, { once : true })

        // //Mobile Compatability
        // editable.addEventListener("touchend", this.removeMouseMove, { once : true })
        // this.image.addEventListener("touchend", this.removeMouseMove, { once : true })

        // Set up draggable variables
        this.draggable = true;
        this.resizing = false;
        this.offsetX = event.clientX - this.image.offsetLeft;
        this.offsetY = event.clientY - this.image.offsetTop;
        dropdown.classList.add("hidden");
        
    }
    
    handleMouseMove = (event) => {
          
        if (this.resizing) {
        
            let imageRect = this.image.getBoundingClientRect()
              
            let left = event.clientX - this.offsetX;
            let top = event.clientY - this.offsetY;
            this.image.style.left = left + "px";
            this.image.style.top = top + "px";

            let newWidth = this.aspectRatio * (event.clientY - this.initialY + this.initialHeight);
            let newHeight = event.clientY - this.initialY + this.initialHeight;

            /*Add logic to handle the resizing issue; i.e. when cursor keeps moving past the min-width limit,
            the width will continue to get smaller, even though the physical image is staying the same size*/

            let containerWidth = editable.offsetWidth
            //Since min image width is expressed as a percentage, this should calculate the width of the image at min-width limit
            
            //Percentage
            let minImageWidth = containerWidth * parseFloat(window.getComputedStyle(this.image).minWidth)/100

            if(newWidth > editableRect.width) {
                newWidth = editableRect.width 
            }

            if(newHeight > editableRect.height) {
                newHeight = editableRect.height;
            }

            if(newWidth < minImageWidth) {
                newWidth = minImageWidth;
            }
            
            this.image.style.width = newWidth + "px";
        
            if (imageRect.left < editableRect.left) {
                this.image.style.left = editableRect.left;
            }
            if (imageRect.top < editableRect.top) {
                this.image.style.top = editableRect.top;
            }
            if (imageRect.right > editableRect.right) {
                this.image.style.left = editableRect.right - imageRect.width + "px";
            } 
            if (imageRect.bottom > editableRect.bottom) {
                this.image.style.top = editableRect.bottom - imageRect.height + "px";
            }   

        }    
          
        if (this.draggable) {

            event.target.style.cursor = "pointer";

            let left = event.clientX - this.offsetX;
            let top = event.clientY - this.offsetY;

            this.image.style.left = left + "px";
            this.image.style.top = top + "px";
    
            // Check if cursor is within left or right half of parent div
            if (event.clientX < middleX) {
                this.image.style.cssFloat = "left";
                this.image.style.marginLeft = "0";
                this.image.style.marginRight = "1.5rem";
                this.isSnappedLeft = true;
                this.isSnappedRight = false;

            } else if (event.clientX >= middleX) {
                this.image.style.cssFloat = "right";
                this.image.style.marginLeft = "1.5rem";
                this.image.style.marginRight = "0";
                this.isSnappedLeft = false;
                this.isSnappedRight = true;
            }
    
            for (let i = 0; i < paragraphs.length; i++) {
                let rect = paragraphs[i].getBoundingClientRect();
            
                let top = rect.top;
                let bottom = rect.bottom;
                let midline = (top + bottom) / 2;
              
                //Prepend Images after cursor crosses midline
                if (event.clientY > top && event.clientY < bottom) {
                    if (event.clientY < midline) {
                        paragraphs[i].prepend(this.image);
                    } 
                }
                //Append only to last paragraph
                if (event.clientY > paragraphs[paragraphs.length-1].getBoundingClientRect().bottom) {
                    paragraphs[paragraphs.length-1].append(this.image);           
                }
            }
            
        }
        
    }

    handleDelete = (event) => {

        //Remove the image for HTML, may need to add legacy logic since remove() is newer
        this.image.remove();

        //Remove Associated Inputs by Removing Whole Div
        const lastUnderScoreIndex = this.image.id.lastIndexOf('_');

        const imageNum = this.image.id.slice(lastUnderScoreIndex + 1);
        
        //Each Image has an associated div with inputs holding various data
        const selectedInputDiv = document.querySelector(`#image_input_${imageNum}`);

        //Not the case for aboutMeEditing
        if (selectedInputDiv) {
            selectedInputDiv.remove();
        }

        //Isolate the Src of the Removed Image
        const source = this.image.src;
        
        //Checks String Index of Last '/', indicating the file name of the image
        const lastSlashIndex = source.lastIndexOf('/');

        //Slices the bit to the right of last '/' 
        let fileName = source.slice(lastSlashIndex + 1);

        //Need Logic to Eliminate Space Characters, since js engine evaluates space as %20 in src
        fileName = fileName.replace(/%20/g,' ');

        //Create a new Input to Hold Info about the Deleted Image
        const backEndInput = document.createElement('input');
        backEndInput.type = 'text';

        //Isolate Desired Form, in this case deleteFiles delete method
        const submitForm = document.querySelector('.editing-form');

        //Give Input Unique ID 
        backEndInput.id = `${fileName}-hidden-input`;

        /* 
            *Check if Input has Already Been Added*
            Please note that this solution does not remove the event listeners for the removed
            images, so the event listeners for deleted images will fire off, but only one input 
            per image will be appended to the form, which is the desired behavior anyway.  It's 
            highly unlikely someone will have enough deleted images on the page to crash the 
            program with eventListeners.
        */
        
        if (!addedInputIds.includes(backEndInput.id)) {
            //Give Input and Name Value of the Src
            backEndInput.value = fileName;
            backEndInput.name = 'fileName';
            //Give Input Display None
            backEndInput.classList.add('hidden');
            //Append to Form But Before the Submit Button
            submitForm.insertBefore(backEndInput, submitForm.lastElementChild); 
            //Push Id to Array
            addedInputIds.push(backEndInput.id);
        }

        //Hide the Dropdown
        dropdown.classList.add('hidden');

    }

}

images.forEach((image) => {

    let imageObject = new Image(image);

    imageObjects.push(imageObject);

    image.addEventListener('click', event => {

        //Computer Compatability
        let handleMD = event => imageObject.handleMouseDown(event);
        let handleMDD = event => imageObject.handleMouseDownDiv(event);

        //Computer Handling
        image.addEventListener("mousedown", handleMD, { once : true });
        editable.addEventListener("mousedown", handleMDD, { once : true });
        editable.addEventListener("mousemove", imageObject.handleMMRef);

        //Mobile Handling
        image.addEventListener("touchstart", handleMD, { once: true });
        editable.addEventListener("touchmove", handleMDD, { once : true })
        
    })
    
});