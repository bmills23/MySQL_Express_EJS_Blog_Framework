//Scripts for Photo Editing & Total HTML Output

const newImages = document.querySelectorAll('.draggable-resizable-image')

let imgArr = []

function submit() {

    for (let i = 1; i <= newImages.length; i++) {

        //Location
        const x = document.getElementById(`x_${i}`)
        const y = document.getElementById(`x_${i}`)

        //Storage Name
        const src = document.getElementById(`src_${i}`)
     
        x.value = newImages[i-1].x
        y.value = newImages[i-1].y

        const srcName = newImages[i-1].src
        src.value = srcName.slice(srcName.lastIndexOf('/')+1)
        
    }

}

addEventListener('submit', (event) => {
    submit()
})