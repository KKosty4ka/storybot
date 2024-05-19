const path = require("path");
const fs = require("fs");

var wordlistDir = path.join(__dirname, "wordlists");
var wordlistFiles = fs.readdirSync(wordlistDir);
var wordlists = new Map();

for (var file of wordlistFiles)
{
    var filePath = path.join(wordlistDir, file);
    var wordlist = fs.readFileSync(filePath, { encoding: "utf-8" }).split("\n"); // .filter(word => word !== "");

    wordlists.set(file, wordlist)
}

console.log("Loaded wordlists");

module.exports = {
    wordlists
};