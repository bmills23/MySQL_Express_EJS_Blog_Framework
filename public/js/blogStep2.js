//** For blogStep2.ejs **//

//Content Editable Div 
//Editable declared in drag.js
const contentEditable = document.querySelector('.content-editable');

//About Me Specific Script
const bannerContent = document.querySelector('#banner-content');
const indexImages = document.querySelector('.index-images');

//Submit Edits Button
const submitEdits = document.querySelector('.submit-edits');

//Submission of Content Editable Divs 
function submit() {

    if (bannerContent && indexImages) {
        bannerContent.value = indexImages.innerHTML;
    } 

    // These elements are shared between aboutMe and blog
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

// Else form is submitted normally

submitEdits.addEventListener('click', submitForms);
