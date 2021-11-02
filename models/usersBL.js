const User = require('./usersModel');
const jsonfile = require('jsonfile')
const jsonDAL = require('../dals/jsonDAL')

function getAllUsers() {
    return new Promise((resolve, reject) => {
        User.find({}, function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    })
}
function getUserById(id) {
    return new Promise((resolve, reject) => {
        User.findById(id, function (err, docs) {
            if (err) {
                reject(err);
            }
            else {
                resolve(docs);
            }
        });
    })
}

async function addUser(userObj) {
    return new Promise((resolve, reject) => {
        let newUser = new User({
            UserName: userObj.UserName,
            Password: userObj.Password
        })
        User.findOne({
            UserName: userObj.UserName
        },
            function (err, dbObj) {
                if (err) console.log(err)
                if (!(dbObj !== null)) {
                    newUser.save(function (err, result) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            console.log("User Inserted successfully")
                            resolve("User Inserted successfully")
                        }
                    })
                } else {
                    console.log("Such username already exist")
                    reject("Such username already exist")
                }


            })
    })



}

async function checkCreds(creds) {

    let allUsers = await getAllUsers()
    let user = allUsers.find(user => { return (user.UserName === creds.UserName && user.Password === creds.Password) })
    return (user ? true : false)
}

async function getIdByUserName(username) {
    let allUsers = await getAllUsers()
    let user = allUsers.find(user => user.UserName === username)
    return user._id
}
async function checkUsername(username) {
    let allUsers = await getAllUsers()
    let user = allUsers.find(user => { return (user.UserName === username) })
    return (user ? true : false)
}

async function saveUserPassword(creds) {
    let allUsers = await getAllUsers()
    let user = allUsers.find(user => { return (user.UserName === creds.UserName) })
    return new Promise((resolve, reject) => {
        User.findByIdAndUpdate(user._id,
            {
                UserName: creds.UserName,
                Password: creds.Password
            }, function (err) {

                if (err) {
                    reject(err);
                }
                else {
                    resolve('Updated');
                }
            });
    })

}

async function savePermissions(userObj) {
    User.findOne({
        UserName: userObj.UserName
    },
        function (err, dbObj) {
            if (err) console.log(err)
            else {
                const file = './jsons/permissions.json'
                jsonfile.readFile(file, function (err, obj) {
                    if (err) console.error(err)
                    let newObj = obj
                    let isExist = newObj.find(obj => obj.id === dbObj.id)
                    if (isExist === undefined) {
                        newObj.push({ id: dbObj._id, permissions: userObj.Permissions })
                        jsonfile.writeFile(file, newObj, function (err) {
                            if (err) console.error(err)
                            else console.log("Permissions saved")
                        })
                    } else console.log("Such username already exist")

                })
            }
        })
}

async function saveInUsersJson(userObj) {
    User.findOne({
        UserName: userObj.UserName
    },
        function (err, dbObj) {
            if (err) console.log(err)
            else {
                const file = './jsons/users.json'
                jsonfile.readFile(file, function (err, obj) {
                    if (err) console.error(err)
                    let newObj = obj
                    let isExist = newObj.find(object => {
                        return (object.Id === String(dbObj._id))
                    })
                    if (isExist === undefined) {
                        newObj.push({
                            Id: dbObj._id,
                            FirstName: userObj.FirstName,
                            LastName: userObj.LastName,
                            CreatedDate: new Date().toLocaleString() + "",
                            SessionTimeOut: userObj.SessionTimeOut
                        })
                        jsonfile.writeFile(file, newObj, function (err) {
                            if (err) console.error(err)
                            console.log("New user Inserted to Users Json")

                        })
                    } else console.log("Such username already exist")
                })
            }
        })
}

async function returnFullUsersData() {
    let allUsersnames = await getAllUsers()
    let objectsToReturn = []
    let permissionsObj = await jsonDAL.returnPermissionsData()
    let usersObj = await jsonDAL.returnUsersData()
    allUsersnames.forEach(user => {
        let permObj = permissionsObj.find(permObj => String(user._id) === permObj.id)
        let userObj = usersObj.find(userObj => String(user._id) === userObj.Id)
        if (permObj !== undefined && userObj !== undefined) {
            objectsToReturn.push({
                id: userObj.Id,
                FirstName: userObj.FirstName,
                LastName: userObj.LastName,
                UserName: user.UserName,
                SessionTimeOut: userObj.SessionTimeOut,
                CreatedDate: userObj.CreatedDate,
                Permissions: permObj.permissions
            })
        }

    })
    return objectsToReturn
}

async function returnUserTime(userId) {
    let usersObj = await jsonDAL.returnUsersData()
    let userObj = usersObj.find(userObj => String(userObj.Id) === String(userId))
    return userObj.SessionTimeOut
}

async function isUserIdIsAdmin(userId) {
    let allUsers = await getAllUsers()
    if (String(allUsers[0]._id) === String(userId)) return true
    else return false
}

 function editUser(userObj, userId) {
    return new Promise(async(resolve, reject) => {
        let isEditable = false
        let allUsers = await getAllUsers()
        let user = allUsers.find(user => user.UserName === userObj.UserName)
        console.log(user);
        console.log(userObj.UserName);
        if (!user || String(user._id) === userId) {
            isEditable = true
        }
        if (isEditable) {
            editPermission(userObj, userId)
            editUserJson(userObj, userId)
            User.findByIdAndUpdate(userId,
                {
                    UserName: userObj.UserName,
                }, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        resolve('Updated user');
                    }
                });
        } else reject('Such username already exist')

    })

}

function editPermission(userObj, userId) {
    const file = './jsons/permissions.json'
    let userDetailsToInsert = {
        id: userId,
        permissions: userObj.Permissions
    }
    jsonfile.readFile(file, function (err, obj) {
        if (err) console.error(err)
        let index = obj.findIndex(userDetails => String(userDetails.id) === String(userId))
        obj[index] = userDetailsToInsert
        jsonfile.writeFile(file, obj, function (err) {
            if (err) console.error(err)
        })
    })

}

function editUserJson(userObj, userId) {
    const file = './jsons/users.json'
    userDetailsToInsert = {
        Id: userId,
        FirstName: userObj.FirstName,
        LastName: userObj.LastName,
        CreatedDate: userObj.CreatedDate,
        SessionTimeOut: userObj.SessionTimeOut
    }
    jsonfile.readFile(file, function (err, obj) {
        if (err) console.error(err)
        let index = obj.findIndex(userDetails => String(userDetails.Id) === String(userId))
        obj[index] = userDetailsToInsert
        jsonfile.writeFile(file, obj, function (err) {
            if (err) console.error(err)
        })
    })

}

async function deleteUser(username) {
    let allUsers = await getAllUsers()
    let user = allUsers.find(user => { return (user.UserName === username) })
    if (user !== undefined) {
        deleteUserPermissions(user._id)
        deleteUserFromUserJson(user._id)
        User.findByIdAndRemove(String(user._id), (err, record) => {
            if (err) console.log(err)
            else console.log("Removed successfully")
        })
    }

}

function deleteUserPermissions(id) {
    const file = './jsons/permissions.json'
    jsonfile.readFile(file, function (err, obj) {
        if (err) console.error(err)
        let index = obj.findIndex(userDetails => String(userDetails.id) === String(id))
        obj.splice(index, 1)
        jsonfile.writeFile(file, obj, function (err) {
            if (err) console.error(err)
        })
    })
}

function deleteUserFromUserJson(id) {
    const file = './jsons/users.json'
    jsonfile.readFile(file, function (err, obj) {
        if (err) console.error(err)
        let index = obj.findIndex(userDetails => String(userDetails.Id) === String(id))
        obj.splice(index, 1)
        jsonfile.writeFile(file, obj, function (err) {
            if (err) console.error(err)
        })
    })
}

module.exports = {
    saveUserPassword, checkCreds, checkUsername, addUser, savePermissions, returnUserTime, isUserIdIsAdmin,
    saveInUsersJson, returnFullUsersData, editUser, deleteUser, getAllUsers, getUserById, getIdByUserName
}
