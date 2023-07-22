// Select Parent Container of Images
const container = document.querySelector('.index-images');
const bannerImages = document.querySelectorAll('.index-image');
const trashCan = document.getElementById('trash-can');

// Position the trash-can element for varying scenarios

    // Resizing
    window.addEventListener('resize', () => {
        //Get Rect of the Banner
        const containerRect = container.getBoundingClientRect();
        trashCan.style.top = containerRect.bottom + 'px';
        trashCan.style.right = window.innerWidth - containerRect.right + 'px';
    })

    // On Load of window
    window.addEventListener('load', () => {
        //Get Rect of the Banner
        const containerRect = container.getBoundingClientRect();
        trashCan.style.top = containerRect.bottom + 'px';
        trashCan.style.right = window.innerWidth - containerRect.right + 'px';
    })

// Add events to the banner images
bannerImages.forEach(image => {
    image.addEventListener('dragstart', drag);
    image.addEventListener('dragover', allowDrop);
    image.addEventListener('drop', drop);
});

// Also add events for the trash can div
trashCan.addEventListener('dragover', allowDrop);
trashCan.addEventListener('drop', dropTrash);

let sourceImage = null;

function drag(e) {
    console.log('Drag event:', e.target.id);
    sourceImage = e.target;
    e.dataTransfer.setData('text', e.target.id);

    trashCan.classList.remove('hidden');
    trashCan.classList.add('show');
}

function drop(e) {
    e.preventDefault();

    const data = e.dataTransfer.getData('text');
    const sourceImg = document.getElementById(data);
    const targetImg = e.target.closest('.index-image');

    if (sourceImg && targetImg && sourceImg !== targetImg) {
        container.insertBefore(sourceImg, targetImg.nextSibling);
    }

    trashCan.classList.add('hidden');
    trashCan.classList.remove('show');
}
  
  
function dropTrash(e) {
    e.preventDefault();
    console.log('Trash Drop event:', e.target.id);

    const data = e.dataTransfer.getData('text');
    const sourceImg = document.getElementById(data);

    if (sourceImg) {
        removeImage(sourceImg);
    }

    trashCan.classList.add('hidden');
    trashCan.classList.remove('show');
}

function allowDrop(e) {
    e.preventDefault();
    console.log('Allow Drop event:', e.target.id);
}

// Remove Image Functionality
let inputIds = [];

function removeImage(image) {
    // Remove the image from HTML
    image.remove();

    // Extract the source of the removed image
    const source = image.src;
    const lastSlashIndex = source.lastIndexOf('/');
    let fileName = source.slice(lastSlashIndex + 1);
    fileName = fileName.replace(/%20/g, ' ');

    // Create a new input element to hold info about the deleted image
    const backEndInput = document.createElement('input');
    backEndInput.type = 'text';

    // Find the relevant form, in this case, the about me update form
    const aboutMeUpdateForm = document.querySelector('.editing-form');

    // Give the input a unique ID
    backEndInput.id = `${fileName}-hidden-input`;

    // Check if the input has already been added
    if (!inputIds.includes(backEndInput.id)) {
        backEndInput.value = fileName;
        //fileName input name is taken by content images
        backEndInput.name = 'fileNameBanner';
        backEndInput.classList.add('hidden');
        aboutMeUpdateForm.insertBefore(backEndInput, aboutMeUpdateForm.lastElementChild);
        inputIds.push(backEndInput.id);
    }
}


