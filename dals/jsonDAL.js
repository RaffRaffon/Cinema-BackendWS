const jsonfile = require('jsonfile')

function returnPermissionsData() {
  return new Promise((resolve, reject) => {
    const file = './jsons/permissions.json'
    jsonfile.readFile(file, function (err, obj) {
      if (err) reject(err)
      resolve(obj)
    })
  })
}


function returnUsersData() {
  return new Promise((resolve, reject) => {
    const file = './jsons/users.json'
    jsonfile.readFile(file, function (err, obj) {
      if (err) reject(err)
      resolve(obj)
    })
  })
}

module.exports = { returnPermissionsData, returnUsersData }
