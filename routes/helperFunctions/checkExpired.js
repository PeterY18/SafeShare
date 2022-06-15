const file = require("../file");

function checkExpired(a){
    if(Date.now() > a)
    {
        return true;
    }
}

module.exports = {checkExpired}