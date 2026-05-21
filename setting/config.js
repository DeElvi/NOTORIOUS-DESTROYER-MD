const fs = require('fs')

global.owner = ""
global.ownername = "SupremeS"
global.botname = "SupremeV4" // you can replace with your botname 
global.version = "1.0.0"
global.status = false

global.mess = {
  owner: "This command is only for the owner",
  admin: "This command is only for group admins",
  botAdmin: "The bot must be an admin first",
  group: "This command can only be used in groups",
  wait: "Please wait… processing your request",
  done: "Success!",
  error: "Something went wrong, please try again later",
  invalid: "Invalid input, please check and try again",
  limit: "Your daily limit has been reached, try again tomorrow"
}

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})
