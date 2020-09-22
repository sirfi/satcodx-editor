function parseLine(line) {
    if (!line || line.length === 0 || line.indexOf("SATCODX") !== 0) return null;
    var lineNumbers = line.match(/[0-9]/g);
    return {
        id: lineNumbers.join(""),
        name: (line.substr(43, 8) + line.substr(115, 12)).trim().replace(/\05/g, "").replace(/\0/g, ""),
        satelliteName: line.substr(10, 18),
        channelType: line.substr(28, 1),
        broadCastSystem: line.substr(29, 4),
        frequency: line.substr(33, 9),
        frequencyNumber: parseInt(line.substr(33, 6)),
        polarization: line.substr(42, 1),
        symbolRate: line.substr(69, 5),
        fec: line.substr(74, 1),
        vpid: line.substr(75, 4),
        apid: line.substr(79, 4),
        pcrp: line.substr(83, 4),
        sid: line.substr(87, 5),
        nid: line.substr(92, 5),
        tsid: line.substr(97, 5),
        language: line.substr(102, 3),
        countryCode: line.substr(106, 2),
        languageCode: line.substr(108, 3),
        crypto: line.substr(111, 4),
        rawLine: line
    };
}
function parseText(textSdx) {
    var lines = textSdx ? textSdx.match(/[^\r\n]+/g) : [];
    return lines.map(function (line) {
        return parseLine(line);
    }).filter(function (line) {
        return line;
    });
}
function changeName(line, newName) {
    newName = newName + " ".repeat(20 - newName.length);
    return line.substr(0, 43) + newName.substr(0, 8) + line.substr(51, 64) + newName.substr(8, 12) + line.substr(127);
}
export default {
    parseLine,
    parseText,
    changeName
}