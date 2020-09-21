function parseLine(line) {
    if (!line || line.length === 0 || line.indexOf("SATCODX") !== 0) return null;
    var lineNumbers = line.match(/[0-9]/g);
    return {
        id: lineNumbers.join(""),
        name: (line.substr(43, 8) + line.substr(115, 12)).trim().replace(/\05/g,"").replace(/\0/g,""),
        rawLine: line
    };
}
function parseText(textSdx) {
    var lines = textSdx ? textSdx.match(/[^\r\n]+/g) : [];
    return lines.map(function (line) {
        return parseLine(line);
    }).filter(function(line){
        return line;
    });
}
export default {
    parseLine,
    parseText
}