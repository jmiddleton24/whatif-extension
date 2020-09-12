const resultTable = document.getElementById('tbl_results');
const resultRows = resultTable.getElementsByTagName('tr');
const CELL_POS = {
    FGM: 6,
    FGA: 7,
    TPM: 8,
    FTA: 11,
    TOV: 15
};

const createHeaderElement = (name) => {
    const headerElement = document.createElement('th');
    headerElement.innerText = name;
    return headerElement;
};

const getValuesFromRow = (rowInTable, ...cellNodePositions) => {
    const cellArray = Array.from(rowInTable.children);
    return cellNodePositions.map(cnp => Number.parseInt(cellArray[cnp].innerText));
};

const generateTableCell = (value) => {
    const cellElement = document.createElement('td');
    cellElement.innerText = `${value.toFixed(1)}%`;
    cellElement.className = 'stat';
    return cellElement;
};

const injectTovPercentage = (rowInTable) => {
    
    const [fga, fta, tov] = getValuesFromRow(rowInTable,
        CELL_POS.FGA,
        CELL_POS.FTA,
        CELL_POS.TOV
    );
    const tovPercentage = 100 * tov / (fga + .44 * fta + tov);
    rowInTable.appendChild(generateTableCell(tovPercentage));
};

const injectEfgPercentage = (rowInTable) => {
    const [fieldGoalsMade, threePointsMade, fga] = getValuesFromRow(rowInTable,
        CELL_POS.FGM,
        CELL_POS.TPM,
        CELL_POS.FGA
    );
    const efgPercentage = 100 * (fieldGoalsMade + .5 * threePointsMade) / fga;
    rowInTable.appendChild(generateTableCell(efgPercentage));
};

for (var row of resultRows) {
    if (row.className === 'header') {
        row.appendChild(createHeaderElement('TOV%'));
        row.appendChild(createHeaderElement('eFG%'));
    } else if (!!row.className) {
        injectTovPercentage(row);
        injectEfgPercentage(row);
    }
}
