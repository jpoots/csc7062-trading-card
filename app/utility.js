const slicer = async (list) => {
    const rowSize = 5;
    let sliced = [];
    // https://medium.com/@drdDavi/split-a-javascript-array-into-chunks-d90c90de3a2d breaks cards into arrays of length rowSize
    for (let i = 0; i < list.length; i += rowSize) {
        const chunk = list.slice(i, i + rowSize);
        sliced.push(chunk);
    }
    // end of reference
    return sliced;
}

module.exports = slicer;