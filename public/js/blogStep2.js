//** For blogStep2.ejs **//

//Content Editable Div 
//Editable declared in drag.js
const contentEditable = document.querySelector('.content-editable');

//About Me Specific Script
const bannerContent = document.querySelector('#banner-content');
const indexImages = document.querySelector('.index-images');

/* 
    This event fires if the user accidentally navigates away from the webpage and auto
    submits the form in the last spot the user left it
*/

window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = ''; //This is required for Chrome and newer browsers
  
    const form = document.querySelector('.auto-submit');
    if (form) {
      const formData = new FormData(form);
  
      fetch(form.action, {
        method: form.method,
        body: formData
      }).catch(console.error);
    }
});

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