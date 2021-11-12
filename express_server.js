const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const users = {};
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
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
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], };
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
  const templateVars = { username: req.cookies["username"] };
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
    res.cookie('user_id', id);
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

