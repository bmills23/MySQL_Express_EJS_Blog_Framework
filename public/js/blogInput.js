//** For blog.ejs **//

//Content Editable Div 
//Editable declared in drag.js

const contentEditable = document.querySelector('.content-editable');
const submitBlog = document.querySelector('.submit-blog');

//Submission of Content Editable Divs 

function submit() {

    document.querySelector('.hidden-textarea').value = contentEditable.innerHTML;

}

submitBlog.addEventListener('click', submit);

//Counter for Date Submits
function refreshTime() {
    const timeDisplay = document.getElementById("date");
    const dateString = Date.now().toString();
    timeDisplay.value = dateString;
    timeDisplay.textContent = dateString;
}

setInterval(refreshTime, 1000);