const axios = require('axios')

exports.getUsers = function()
{
    return axios.get("http://jsonplaceholder.typicode.com/users")
};