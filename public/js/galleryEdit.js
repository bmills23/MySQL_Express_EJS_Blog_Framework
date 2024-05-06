//** Gallery Scripts **//

//Photo Delete Button Activates Checkboxes
const photoDelete = document.querySelector('#delete');
//True Delete Removes the Images that were Selected with Class Checkbox
const trueDelete = document.querySelector('#true-delete');

const checkBoxes = document.querySelectorAll('.checkbox');

const images = document.querySelectorAll('img');

//Function Positions Textareas to their corresponding images
function positionTextarea() {

    images.forEach(image => {
        let rect = image.getBoundingClientRect();
        let top = rect.top + window.scrollY;
        let left = rect.left + window.scrollX;
        let width = rect.width;

        //Get the identifier from the image's data attribute
        let imageIdentifier = image.dataset.identifier;

        //Select the corresponding textarea element
        let correspondingTextarea = document.querySelector(`div[data-identifier="${imageIdentifier}"]`);

        //Position the textarea to the top right corner of the image
        correspondingTextarea.style.position = "absolute";
        correspondingTextarea.style.top = top + "px";
        correspondingTextarea.style.left = left + width + "px";

    })

}

//Handles Resizing of Textareas/Content Editable Divs
window.addEventListener('mousemove', positionTextarea);

window.addEventListener('load', positionTextarea);

window.addEventListener('resize', positionTextarea);

//**Update Scripting

//Button
const capUpdate = document.querySelector('.captions-update');

//False Caption, i.e. each visible CED
const falseCaptions = document.querySelectorAll('.false-caption');

//True Caption, i.e. each hidden textarea
const captions = document.querySelectorAll('.gallery-caption');

//Give the Caption Divs Value of Textareas
function update() {
    captions.forEach((caption, index) => {
      const falseCaption = falseCaptions[index];
      caption.value = falseCaption.innerHTML;
    });
}

//Update Caps on Submit/Click
capUpdate.addEventListener('click', () => {
    update()
})

//Counter for Date Submits
function refreshTime() {
    const timeDisplay = document.getElementById("date");
    const dateString = Date.now().toString();
    timeDisplay.value = dateString;
    timeDisplay.textContent = dateString;
}

setInterval(refreshTime, 1000);

//***Below this line crashes on non-editing pages so put all the other stuff above***//

photoDelete.addEventListener('click', () => {

    checkBoxes.forEach(b=>b.removeAttribute('hidden'))
    trueDelete.removeAttribute('hidden')
    photoDelete.hidden = true

})
