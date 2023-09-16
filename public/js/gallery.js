//Just Adds BootStrap classes dynamically; why clutter the page even more?

//Div of Gallery Images
const imageParent = document.querySelectorAll('.img')

//Logic for Dynamic Gallery Content

//Designate a modal target for the clicked image
const modal = document.querySelector(".modal");

//Designate constant for all other potential modals to remove active class
const modals = document.querySelectorAll(".modal");

//Designate constant for image div containers 
const carouselItems = document.querySelectorAll(".carousel-item");

//Designate constant for all gallery images outside of carousel functionality
const galleryImages = document.querySelectorAll('.gallery-image');

galleryImages.forEach(galleryImage => {
    galleryImage.addEventListener('click', () => {
        let matchFound = false; //Flag variable to track if a match has been found
        carouselItems.forEach(carouselItem => {
            if (!matchFound && galleryImage.src === carouselItem.firstElementChild.src) {
                carouselItem.classList.add('active'); //Add 'active' class to the matching item
                matchFound = true; //Set the flag to true to indicate a match has been found
            } else {
                carouselItem.classList.remove('active'); //Remove 'active' class from other items
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

