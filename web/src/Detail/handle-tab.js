function resolveCurrentLine(lines, cursorPosition) {

    let currentLineNumber = 0
    let currentLineEnd = 0
    for (; currentLineNumber < lines.length; currentLineNumber++) {
        currentLineEnd += lines[currentLineNumber].length + 1
        if (currentLineEnd > cursorPosition) {
            break
        }
    }
    const currentLineLength = lines[currentLineNumber].length
    const currentLineStart = currentLineEnd - currentLineLength - 1

    return {
        currentLineNumber,
        "currentLineContent": lines[currentLineNumber],
        currentLineLength,
        currentLineStart,
        currentLineEnd,
    }
}

function shiftTabSingleLine(content, start) {
    const lines = content.split("\n")

    const lineGroup = resolveCurrentLine(lines, start)
    const currentContent = lineGroup.currentLineContent;

    var { newLine, spaceCount } = shiftTab(currentContent);

    lines[lineGroup.currentLineNumber] = newLine
    let result = {
        value: lines.join("\n"),
        start: start - spaceCount,
        end: start - spaceCount
    };

    return result;
}

function shiftTab(currentContent) {
    let spaceCount = 0;
    const hasTab = currentContent.startsWith("\t");
    if (hasTab) {
        spaceCount = 1;
    } else {
        for (let i = 0; i < currentContent.length && i < 4; i++) {
            if (currentContent[i] === ' ') spaceCount++;
            else break;
        }
    }
    const newLine = currentContent.substring(spaceCount);
    return { newLine, spaceCount };
}

function shiftTabMultiLine(content, start, end) {
    const lines = content.split("\n")

    const startGroup = resolveCurrentLine(lines, start)
    const endGroup = resolveCurrentLine(lines, end)
    console.log(startGroup)
    console.log(endGroup)
    let startOffset
    let endOffset = 0
    if (startGroup.currentLineNumber !== endGroup.currentLineNumber) {
        for (let i = startGroup.currentLineNumber; i <= endGroup.currentLineNumber; i++) {
            var { newLine, spaceCount } = shiftTab(lines[i])
            lines[i] = newLine
            if (i === startGroup.currentLineNumber) {
                startOffset = spaceCount
            }
            endOffset += spaceCount
        }
    }
    return {
        value: lines.join("\n"),
        start: start - startOffset,
        end: end - endOffset
    }
}

function handleTab(start, end, tempValue, inputShift) {
    let result
    if (start === end) {
        if (!inputShift) {
            const before = tempValue.substring(0, start)
            const after = tempValue.substring(end)

            result = {
                value: before + "\t" + after,
                start: start + 1,
                end: start + 1
            }
        } else if (start === end) {
            result = shiftTabSingleLine(tempValue, start)
        }
    } else {
        if (inputShift)
            result = shiftTabMultiLine(tempValue, start, end)
    }
    return result
}

export default handleTab;
