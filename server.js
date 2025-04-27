const express = require('express')
const path = require('path')
const app = express()
const port = 1000;
const { convert, router } = require('./controller/converter.js');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add this to parse JSON bodies

// Use the router from converter.js
app.use('/', router);

app.get("/", (req, res)=>{
    res.render(path.join(__dirname, '/public/index.ejs'));
})

app.post("/convert", convert)

app.listen(port,  ()=>{
    console.log(`Server running at http://localhost:${port}/`);
})