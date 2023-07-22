//Just Adds BootStrap classes dynamically; why clutter the page even more?

//Div of Gallery Images
const imageParent = document.querySelectorAll('.img')

//For Each Div of ImageParent, add these confusing bootstrap classes
for (let div of imageParent) {
    div.classList.add('col-xl-4', 'col-lg-6', 'col-md-6', 'col-sm-10', 'col-9')
}

const modal = document.querySelector(".modal");

const modals = document.querySelectorAll(".modal");

const carouselItems = document.querySelectorAll(".carousel-item");

const modalImg = document.querySelector(".modal-content");

const modalCaption = document.querySelector(".caption");

const galleryImages = document.querySelectorAll('.gallery-image');

galleryImages.forEach(galleryImage => {
    galleryImage.addEventListener('click', () => {
        let matchFound = false; // Flag variable to track if a match has been found
        carouselItems.forEach(carouselItem => {
            if (!matchFound && galleryImage.src === carouselItem.firstElementChild.src) {
                carouselItem.classList.add('active'); // Add 'active' class to the matching item
                matchFound = true; // Set the flag to true to indicate a match has been found
            } else {
                carouselItem.classList.remove('active'); // Remove 'active' class from other items
            }
        });
    });
});

//This function is called in-line with each image to allow full-screen image clicking
function showImage() {
  
    modal.style.display = "block";

}

function shrinkImage() {
    modal.style.display = "none";

    modals.forEach(modal => {
        modal.classList.remove('active');
    })
}

