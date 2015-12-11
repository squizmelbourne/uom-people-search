var Promise = require('es6-promise').Promise;
var CheckImage = function(url) {
        return new Promise(function (resolve, reject) {
            var img = new Image()
            img.onload = function(){
                resolve(url);
            }
            img.onerror = function(){
                reject(url);
            }
            img.src = url;
        })
}

module.exports = CheckImage;
