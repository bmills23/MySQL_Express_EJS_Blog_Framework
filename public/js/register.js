// Registration Code

const password = document.getElementById('password');
const passwordConfirm = document.getElementById('password-confirm');

const submit = document.getElementById('submit-register');
const error = document.getElementById('error-message');

const website = document.getElementById('website');

let url = window.location.href;

submit.addEventListener('click', (e) => {
    if (password.value != passwordConfirm.value) {
        e.preventDefault();
        error.removeAttribute('hidden');
        error.innerText('Passwords do not match!');
    } else {
        // Split into arrayed substrings using / as a delimiter
        // example : https://bryangmills.com/registration
        // split second index, in this case bryangmills.com
        website.value = url.split("/")[2];
    }
})