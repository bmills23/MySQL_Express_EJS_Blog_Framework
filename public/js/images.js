//Dynamic Image Stuff for Blogs Mostly
window.addEventListener('load', () => {

    const imgs = document.querySelectorAll('.img-fluid')
    
    //Adds Margin to Images that are Touching; will be called with editing and non-editing blog pages
    function imageMargin() {
        for (let i = 0; i <= imgs.length - 1; i++) {

            imgs[i].style.marginTop = "0.75rem";
            imgs[i].style.marginBottom = "0.75rem";

            //If Float is left or right, adds opposite margin
            if (window.getComputedStyle(imgs[i]).getPropertyValue('float') == 'left') {
                imgs[i].style.marginRight = "1.5rem"
            } 
            if (window.getComputedStyle(imgs[i]).getPropertyValue('float') == 'right') {
                imgs[i].style.marginLeft = "1.5rem"
            }
        }
    }

    //Called immediately on window load
    imageMargin()

    //Will Call the function when the mouse moves, like when moving or resizing images
    window.addEventListener('mousemove', imageMargin)

    /*Adds Responsive Margins on Resize in case images end up touching
    that weren't previous*/
    window.addEventListener('resize', imageMargin)

})

