const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const {authenticateUserInfo,generateRandomString } =require("./helpers/helpers.js");
// const cookieParser = require('cookie-parser')
let cookieSession = require('cookie-session');
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
 name: 'session',
  keys: ['lknt42fnoh90hn2hf90w8fhofnwe0'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieSession({
  name: 'tinyapp',
  keys: ["user_id"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000
}));

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// app.get("/", (req, res) => {
//   res.render("login");
// });

app.get("/", (req, res) => {
  res.send("Hello!");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  console.log(req.session.user_id);
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]],
  };

  console.log(templateVars);
  res.render("urls_index", templateVars);
});       

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  const {longURL} = req.body;
  const shortURL = generateRandomString();
  //console.log(shortURL);
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
  const {shortURL} = req.params;
  const {data} = validateShortURLForUser(user["id"],shortURL, urlDatabase);
    if (shortURL === data) {
  delete urlDatabase[shortURL];
  res.redirect('/urls');
} else {
  res.status(400).send(`You are not Authorized to delete. <a href="/urls">URLs</a>`);
}
}

});

app.post("/urls/:shortURL/edit", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL , username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const {id} = req.params;
  const {longURL} = req.body;
  urlDatabase[id] = longURL;
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
 const userid = req.session.user_id;
 const user= users[req.session.user_id]
 if (!user) {
   res.redirect('/login');
}
  const templateVars = { user: user };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
  const shortURL = req.params.shortURL;
  const {data} = validateShortURLForUser(user["id"], shortURL,urlDatabase);
    if (shortURL === data) {
    const {longURL,userID} = urlDatabase[shortURL];
  //console.log(req.params.shortURL, urlDatabase, longURL);
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL ,"user":user};
  //console.log(templateVars);
  res.render("urls_show", templateVars);
} else {
  res.status(400).send(`You are not Authorized to edit. <a href="/urls">URLs</a>`);
    }
  }
  
});


app.get("/u/:shortURL", (req, res) => {
  
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL,"HI",req.params.shortURL);
   res.redirect(longURL);
});
 
app.post("/login", (req, res) => {
  const {email,password} = req.body;
  console.log("users",users);

  const user = authenticateUserInfo(email,users);
  // console.log("login failed", error);
  if (user === null) {
    console.log("1")
    res.status(403).send("user not found");
      } else {
    console.log("2")
    //  const {id,password} = authenticateUserInfo(email,users);
     if (bcrypt.compareSync(password,user.password)) {
      console.log("3")
      //set cookie
          req.session.user_id =user.id;
          console.log("id" , user.id);
          res.redirect("/urls");
     } else {
      console.log("4")
      res.status(403);
     }
     
  }
});

app.post("/register", (req,res) => {
  const {email,password} = req.body;
  console.log(users);
  if( email==='' || password ==='') {
    return res.status(400).send('email or password should not be empty : <a href="/register">Register</a>'); 
  }

  const user = authenticateUserInfo(email,users);
  if (user) {
    const error = "user already registered";
    return res.status(400).send(`${error}. Please try again : <a href="/register">Register</a>`);
  } else {
    const id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {"id":id,"email":email,"password":hashedPassword};
    console.log(users);
    res.cookie('user_id', id);
    req.session.user_id =  id; //install cookie-session 
    res.redirect("/urls");
  }

  });

app.post("/logout", (req, res) => { 
  res.clearCookie("user");
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {user};
  res.render("login",templateVars);
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {user};
  res.render("register_user",templateVars);
});

//   const {username} = req.body; {
//   res.cookie('username', username);
//   res.redirect("/urls");
// };
//HI

app.post("/logout", (req, res) => {
  res.clearCookie('username');
   res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

