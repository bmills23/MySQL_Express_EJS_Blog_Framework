# Mysql EJS Express Blogging Framework  

Node.js based blogging framework using Mysql, Express and EJS 

# Setup 

## Database Setup 

### MySQL Workbench Setup

- Download MySQL Workbench

- Setup New Default Connection 
<img width="801" alt="Screen Shot 2023-05-05 at 10 27 38 PM" src="https://user-images.githubusercontent.com/58231400/236599721-14a53bd3-be2a-48f6-a8cf-1bca049fb4dc.png">

- Click schemas, right click 'Create Schema', make schema name whatever you like, but something blog-related
<img width="576" alt="Screen Shot 2023-05-05 at 10 30 32 PM" src="https://user-images.githubusercontent.com/58231400/236599859-85c2c192-8361-4e1b-9eab-5bc0fc249353.png">

- Create Tables 

  1. Table 1 : user 
   Columns
      1. id : int, primary key, auto-incrementing 
      2. fName : varchar(45)
      3. lName : varchar(45)
      4. email : varchar(45)
      5. password : varchar(255)
  2. Table 2 : post 
    Columns
      1. id : int, primary key, auto-incrementing
      2. content : longtext 
      3. trueContent : longtext
      4. uploadedAt : int
      5. updatedDate : int
      6. title : text
      7. fileAmount : tinyint
      8. feature : tinyint(1)
  3. Table 3 : gallery
    Columns 
      1. id : int, primary key, auto-incrementing 
      2. uploadedAt : int 
      3. name : varchar(1000)
      4. caption : varchar(1000)
  4. Table 4 : blogImages
    Columns
      1. id : int, primary key, auto-incrementing
      2. x : int
      3. y : int (x and y are pending proper functionality)
      4. src : varchar(1000)
      5. uploadedAt : int
  5. Table 5 : aboutme 
    Columns 
      1. content : longtext
      2. uploadedAt : int
      3. updatedDate : int
      4. fileAmount : int
      5. aboutMeFiles : int 
