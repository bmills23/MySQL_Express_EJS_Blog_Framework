//** For blogEdit.ejs **//

//Button and Input for Edits WITH New Photos
const submitOldEdits = document.querySelector('#old-edits')
const submitOldEditsInput = document.querySelector('#old-edits-input')

//Button and Input for Edits WITH New Photos
const submitNewEdits = document.querySelector('#new-edits')
const submitNewEditsInput = document.querySelector('#new-edits-input')

const chooseFile = document.querySelector('#chooseFile')

//Content Editable Div 
//Editable declared in drag.js
const contentEditable = document.querySelector('.content-editable')

//Choose File Button Switch
function switchButtons() {
    submitOldEdits.classList.add('hidden');
    submitNewEdits.classList.remove('hidden');
}

//Submission of Content Editable Divs 
function submit() {

    document.getElementById('html-with-images').value = contentEditable.innerHTML;
    document.querySelector('.hidden-textarea').value = contentEditable.innerText;
}

//Counter for Date Submits
function refreshTime() {
    const timeDisplay = document.getElementById("date");
    const dateString = Date.now().toString();
    timeDisplay.value = dateString;
    timeDisplay.textContent = dateString;
}

setInterval(refreshTime, 1000);

/*Event Handler for File Choice Button Change, i.e. if no new photos, do submitOldEdits, else
    do submitEdits to move to step 2 of blogging process*/
chooseFile.addEventListener('change', switchButtons);

//The only ways to carry the signature of the button is with xml or jquery/AJAX
submitOldEdits.addEventListener('click', (event) => {
    submitOldEditsInput.value = 1;
    submitNewEditsInput.value = 0;
    submit();
})

submitNewEdits.addEventListener('click', () => {
    submitNewEditsInput.value = 1;
    submitOldEditsInput.value = 0;
    submit();
});

