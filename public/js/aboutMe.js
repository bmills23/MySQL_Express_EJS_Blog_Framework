//** For editAboutMe.ejs **//

//Button and Input for Edits WITH New Photos
const submitEdits = document.querySelector('.submit-edits');
const contentEditable = document.querySelector('.content-editable');

const bannerContent = document.querySelector('#banner-content');
const indexImages = document.querySelector('.index-images');

//Select Undo Upload Button to Reset Value of File Upload to Null
const undoBannerUpload = document.getElementById('undo-banner-upload');
const bannerImagesUpload = document.getElementById('banner-images');

const undoContentUpload = document.getElementById('undo-content-upload');
const contentImagesUpload = document.getElementById('content-images');

undoBannerUpload.addEventListener('click', (e) => {
    e.preventDefault();

    bannerImagesUpload.value = '';
})

undoContentUpload.addEventListener('click', (e) => {
    e.preventDefault();

    contentImagesUpload.value = '';
})

//Submission of Content Editable Divs 
function submit() {

    bannerContent.value = indexImages.innerHTML;

    document.querySelector('.hidden-textarea').value = contentEditable.innerHTML;

}

submitEdits.addEventListener('click', submit);

//Counter for Date Submits
function refreshTime() {
    const timeDisplay = document.getElementById("date");
    const dateString = Date.now().toString();
    timeDisplay.value = dateString;
    timeDisplay.textContent = dateString;
}

setInterval(refreshTime, 1000);
