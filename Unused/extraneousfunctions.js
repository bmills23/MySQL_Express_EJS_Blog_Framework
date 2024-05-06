//Unused but potentially useful in the future

// Removes Trailing Forward Slash
app.use((req, res, next) => {
	if (req.path.substr(-1) == '/' && req.path.length > 1) {
		const query = req.url.slice(req.path.length)
		res.redirect(301, req.path.slice(0, -1) + query)
	} else {
		next()
	}
})

/* Temporary About Me Seed (Can Use This Format to Seed Any
    Empty Database or just use console/workbench) */

app.post('/aboutMePost', checkAuthenticated, (req, res) => {
    try {
        const content = req.body.aboutMePost
        const date = Date.now().toString()
        const updatedDate = Date.now().toString()

        db.getConnection( async (err, connection) => {
        if (err) throw (err)
        const sqlInsert = "INSERT INTO aboutme VALUES (?,?,?)"
        const insertQuery = mysql.format(sqlInsert,[content, date, updatedDate]) //update doesn't work, rename
    
        await connection.query (insertQuery, (err, result)=> {
            connection.release()
            if (err) throw (err)
            console.log('About Me posted!')
        })
        }) //end of connection.query()
        //end of db.getConnection()
        res.redirect('/aboutMe')
    } catch {
    res.redirect('/editAboutMe')
    console.log('ERROR')
    }
})

//Optional Registration Form
app.post('/register', async (req, res) => { //bcrypt is async library
  
    try {
      
      const fName = req.body.firstName
      const lName = req.body.lastName
      const email = req.body.email
      const password = await bcrypt.hash(req.body.password, 10)
  
      db.getConnection( async (err, connection) => {
  
        if (err) throw (err)
  
        const sqlSearch = "SELECT * FROM user WHERE fName = ?"
        const searchQuery = mysql.format(sqlSearch, [fName])
        const sqlInsert = "INSERT INTO user (fName, lName, email, password) VALUES (?,?,?,?)"
        const insertQuery = mysql.format(sqlInsert,[fName, lName, email, password])
  
        connection.query (searchQuery, async (err, result) => {
         if (err) throw (err)
         console.log("------> Search Results")
         console.log(result.length)
         if (result.length != 0) {
          connection.release()
          console.log("------> User already exists")
         } 
  
         else {
          connection.query (insertQuery, (err, result)=> {
          connection.release()
          if (err) throw (err)
          console.log ("--------> Created new User")
          console.log(result.insertId)
         })
        }
  
       }) //end of connection.query()
       }) //end of db.getConnection()
      res.redirect('/login')
    } catch
    res.redirect('/register')
    }
  })

//   *this section is intended to parse out x and y coordinates for each image
//   *as mentioned later, this functionality is temporarily unavailable
//Start of BlogImages Database Query
const inputs = {}

for (let key in req.body) {
    // * If the Key matches this complex Regex Pattern, insert
    // * ^ start of string
    // * () group
    // * | alternative, matches either expression before or after
    // * \d+ matches one or more digits
    // * $ end of string
    if (key.match(/^(x|y)\d+$/)) {
        // * Slice the First bit of prop and index
        // * prop will be left, right, etc.
        // * index will be the number attached to the prop
        let [prop, index] = key.match(/^(x|y)(\d+)$/).slice(1)
        
        if (!inputs[index]) inputs[index] = {}

        inputs[index][prop] = req.body[key]
    }
}

// this section is supposed to add x and y coordinates for each image, but
// I've left the columns x and y at 0 for now.  The intended functionality is 
// solely for rendering the images for the index page featured blogs so that the 
// leftest and uppermost image renders on the preview of the blog                
// 
// * Prepare image values insert into BlogImages DB

for (let i = 0; i < filesLength; i++) {
    const imageInsert = `UPDATE blogImages 
    SET 
    x = ?,
    y = ?,
    WHERE DATE = ?;`

}

const imageValues = []
for (let index in inputs) {
    let input = inputs[index]
    values.push([
    parseInt(input.x), 
    parseInt(input.y)
    ])
}

//BlogImages Insert
connection.query(imageInsertQuery, (err, result) => {
    connection.release();
    console.log(err);
    console.log('Image Content Inserted');
    if (err) reject(err);
})
