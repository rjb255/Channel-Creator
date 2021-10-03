import { DataResolver } from "discord.js";

var X = [1, 2, 3, 4, 5];
var j = 0;

for (var i of X) {
    let y = 0;
    j += i;
    var he = await hero();
    console.log(he);
    while (y < 1000000000) {
        y++;
    }
    console.log(y);
}
var a = await Promise.all([
    X.map(async (i) => {
        let y = 0;
        j += i;
        he = await hero();
        console.log(he);
        while (y < 1000000000) {
            y++;
        }
        console.log(y);
    }),
]);

console.log("hey");
console.log(j);

function hero() {
    let str = new Promise((resolve, reject) => {
        let y = 0;
        while (y < 1000000000) {
            y++;
        }
        console.log("boo");
        resolve("yolo");
    });
    return str;
}
