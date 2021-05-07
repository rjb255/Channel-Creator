function doStuff(n /* `n` is expected to be a positive number */) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(n * 10);
        }, Math.floor(Math.random() * 1000));
    }).then(function (result) {
        if (result > 100) {
            console.log(result + " is greater than 100");
        } else {
            console.log(result + " is not greater than 100");
        }
        // `return` `result` or other value here
        // to avoid `undefined` at chained `.then()`
        return "hhey";
    });
}
var hey = doStuff(60);
doStuff(9).then(function (data) {
    console.log("data is: " + data); // `data` is not `undefined`
});
console.log(hey);
