const resultTable = document.getElementById('tbl_results');
const resultRows = resultTable.getElementsByTagName('tr');
const CELL_POS = {
    FGA: 7,
    FTA: 11,
    TOV: 15
};
for (var row of resultRows) {
    if (row.className === 'header') {
        const tovHeaderElement = document.createElement('th');
        tovHeaderElement.innerText = 'TOV%';
        row.appendChild(tovHeaderElement);
    } else if (!!row.className) {
        // calculate tov% for each row
        const cellArray = Array.from(row.children);
        const fga = Number.parseInt(cellArray[CELL_POS.FGA].innerText);
        const fta = Number.parseInt(cellArray[CELL_POS.FTA].innerText);
        const tov = Number.parseInt(cellArray[CELL_POS.TOV].innerText);
        const tovPercentage = 100 * tov / (fga + .44 * fta + tov);
        const tovPercentageElement = document.createElement('td');
        tovPercentageElement.innerText = `${tovPercentage.toFixed(1)}%`;
        tovPercentageElement.className = 'stat';
        row.appendChild(tovPercentageElement);
    }
}