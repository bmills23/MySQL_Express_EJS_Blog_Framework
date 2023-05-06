//** For blogStep2.ejs **//

//Content Editable Div 
//Editable declared in drag.js
const contentEditable = document.querySelector('.content-editable');

//Submission of Content Editable Divs 
function submit() {

    document.getElementById('html-with-images').value = contentEditable.innerHTML;

    document.getElementById('html-without-images').value =
    contentEditable.innerHTML.replace(/<img[^>]*>/g, '');
}

//Form Submission Logic
let formSubmitted = false;

function submitForms() {
    formSubmitted = true;
    submit();
}