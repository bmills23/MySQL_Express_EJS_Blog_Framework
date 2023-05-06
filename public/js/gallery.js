//Just Adds BootStrap classes dynamically; why clutter the page even more?

//Div of Gallery Images
const imageParent = document.querySelectorAll('.img')

//For Each Div of ImageParent, add these confusing bootstrap classes
for (let div of imageParent) {
    div.classList.add('col-xl-4', 'col-lg-6', 'col-md-6', 'col-sm-10', 'col-9')
}

const images = document.querySelectorAll('img');

const modal = document.querySelector(".modal");
const modalImg = document.querySelector(".modal-content");
const modalCaption = document.querySelector(".caption");

//This function is called in-line with each image to allow full-screen image clicking
function showImage(src, caption) {
  
    modal.style.display = "block";
    modalImg.src = src;
    modalCaption.innerHTML = caption;
  
}

function shrinkImage() {
    modal.style.display = "none";
}