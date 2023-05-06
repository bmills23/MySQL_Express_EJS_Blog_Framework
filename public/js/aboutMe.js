//** For editAboutMe.ejs **//

//Button and Input for Edits WITH New Photos
const submitEdits = document.querySelector('.submit-edits')
const contentEditable = document.querySelector('.content-editable')

//Submission of Content Editable Divs 
function submit() {

    document.querySelector('.hidden-textarea').value = contentEditable.innerText

}

submitEdits.addEventListener('click', submit)

//Counter for Date Submits
function refreshTime() {
    const timeDisplay = document.getElementById("date");
    const dateString = Date.now().toString();
    timeDisplay.value = dateString;
    timeDisplay.textContent = dateString;
}

setInterval(refreshTime, 1000);
