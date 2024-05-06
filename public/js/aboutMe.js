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

//Color selection of content-editable div background
const colorInput = document.getElementById('about-me-color');

//Color selection for navbar 
const navbar = document.getElementById('navbar');

//Navbar Color Input
const navColor = document.getElementById('navbar-color');

//True Navbar Color Input 
const trueColor = document.getElementById('true-color');

//Navbar Color Label
const colorLabel = document.getElementById('navbar-color-label');

//Also change color for everything else lol why tf not; why am I doing this to myself

//Because choose file buttons are not stricly separate elements, we have to do some jenky shit
//Select inline styling tag that represents file-selector-button
const stylings = document.getElementById('choose-file-stylings');

//Let's just declare another constant for H1s why the fuck not
const heading = document.querySelector('h1');

undoBannerUpload.addEventListener('click', (e) => {
    e.preventDefault();

    bannerImagesUpload.value = '';
})

undoContentUpload.addEventListener('click', (e) => {
    e.preventDefault();

    contentImagesUpload.value = '';
})

colorInput.addEventListener('input', (e) => {   
    e.preventDefault;

    let color = colorInput.value;
    contentEditable.style.backgroundColor = color;
})

navColor.addEventListener('input', (e) => {   
    e.preventDefault;

    let color = navColor.value;

    trueColor.value = navColor.value;

    //Background Color for Navbar
    navbar.style.backgroundColor = color;

    //Background Color and Colors for Buttons, buttons defined in inline styling
    buttons.forEach((button) => {
        button.style.backgroundColor = color;
        button.style.color = getTextColor(color);
    });

    //Text Colors, if H1 is white, you can't see it! need logic for this
    h1.style.color = color;

    isolatedNavLinks.forEach((link) => {
        link.style.color = getTextColor(color);
    });

    colorLabel.style.color = getTextColor(color);

    //Dual Text and Background
    stylings.innerHTML = `.chooseFile::file-selector-button{background-color:${color};color:${getTextColor(color)}}`;

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
