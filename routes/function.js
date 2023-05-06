module.exports = {
    //Time Converter Function for Converting Date String to Readable Format in About Me and Blog Pages
    timeConverter: function timeConverter(UNIX_timestamp) { 
        var a = new Date(UNIX_timestamp); 
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; 
        var year = a.getFullYear(); 
        var month = months[a.getMonth()]; 
        var date = a.getDate(); 
        var hour = a.getHours() < 10 ? '0' + a.getHours() : a.getHours(); 
        var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes(); 
        var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds(); 
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ; 
        return time; 
    },

    // AUTHENTICATION Functions
   checkAuthenticated: function checkAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
        return next()
        }
        res.redirect('/login')
    },
    
    checkNotAuthenticated: function checkNotAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
        res.redirect('/')
        } 
        next()
    }

}


