const bcrypt = require('bcryptjs');

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const getUserByEmail = function(email,usersDB) {
  
    for (let user in usersDB) {
      if (usersDB[user]["email"] === email)
        return  usersDB[user];
    }
    return undefined;
  };
  
const urlsForUser = function(userId , urlsDB) {
    const userURLs = {};
  
    for (let shorturl in urlsDB) {
      const {longURL , userID} = urlsDB[shorturl];
      if (userId === userID)
        userURLs[shorturl] = urlsDB[shorturl];
    }
    return userURLs;
  };
  const validateShortURLForUser = function(userId, shortUrl,urlsDB) {
    const userURLs = urlsForUser(userId,urlsDB);
    for (let key of Object.keys(userURLs)) {
      if (shortUrl === key)
        return {data : key};
    }
    return {data: null};
  };

  const generateRandomString = function() {
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const authenticateUserInfo =function(email,users) {
    for (const user_id in users){
     console.log(user_id); 
     const user= users[user_id]
     if (user.email === email){
       return user;
     }
    }
    return null;
  }

  module.exports = {generateRandomString,authenticateUserInfo,getUserByEmail,urlsForUser,validateShortURLForUser};