const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const bcrypt = require("bcryptjs") 
const cookieSession = require('cookie-session')
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["key"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
const authenticateUserInfo = (email,password,users) => {
  for (const user_id in users){
   console.log(user_id); 
   const user= users[user_id]
   if (user.email === email){
     return user;
   }
  }
  return null;
}
function generateRandomString() {
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user: user,users: users };
  
  res.render("urls_index", templateVars);
});       

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  const {longURL} = req.body;
  const shortURL = generateRandomString();
  //console.log(shortURL);
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const {shortURL} = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
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

  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  //console.log(req.params.shortURL, urlDatabase, longURL);
  const templateVars = { shortURL: req.params.shortURL, longURL: longURL , username: req.cookies["username"]};
  //console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { "user":user};
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL,templateVars);
});
 
app.post("/login", (req, res) => {
  const {email,password} = req.body;
  const { error } = authenticateLoginUser(email,password,users);
  console.log("login failed", error);
  if (error) {
    res.status(403);
  } else {
     const {id} = getUseIdBasedOnEmail(email,users);
     console.log("id" , id);
     
    res.redirect("/urls");
  }
});

app.post("/register", (req,res) => {
  const {email,password} = req.body;
  console.log(users);
  if( email==='' || password ==='') {
    return res.status(400).send('email or password should not be empty : <a href="/register">Register</a>'); 
  }
  const user = authenticateUserInfo(email,password,users);
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
  res.render("login");
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
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

