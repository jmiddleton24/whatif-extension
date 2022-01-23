fetchPlayerDataFromStorage(['allPlayers', 'lastPlayer', 'isSearching']).then(playerData => {
  if (canSearch()) {
    let matchCount = getMatchCount();
    if (!matchCount || !getNextButton() && !playerData.isSearching) {
      beginSearch();
    }
    else if (matchCount) {
      let allPlayers = [];
      if (playerData.allPlayers) {
        allPlayers = playerData.allPlayers;
      }
      const parsedPlayerData = parsePlayerData();
      let playersToAdd = parsedPlayerData;
      let playerFound = false;
      if (playerData.lastPlayer) {
        const lastPlayerIndex = parsedPlayerData.findIndex(player => arePlayersEqual(player, playerData.lastPlayer));
        if (lastPlayerIndex !== -1) {
          // this page contains the last player when searching in ascending order
          // so we only need to include the players up to that player (we have the rest)
          playersToAdd = playersToAdd.slice(lastPlayerIndex);
          playerFound = true;
        }
      }

      allPlayers = allPlayers.concat(playersToAdd);
      const nextPage = getNextButton();
      if (nextPage && !playerFound) {
        chrome.storage.local.set({allPlayers: allPlayers, isSearching: true});
        setTimeout(() => nextPage.click(), 4000);
      }
      else {
        // WhatIf searches are limited to a max of 500 records
        // account for that there may be more players than 500
        if (matchCount !== 500 || playerFound) {
          makeCsvFile(allPlayers);
          resetStorage();
        }
        else {
          chrome.storage.local.set({allPlayers: allPlayers, lastPlayer: parsedPlayerData[parsedPlayerData.length -1]});
          beginReverseSearch();
        }
      }
    }
  }
})

function canSearch() {
  let canSearch = true;
  seasonSelected = document.getElementById('season').value;
  season2Selected = document.getElementById('season2').value;
  if (seasonSelected !== season2Selected || seasonSelected === 'Any Season') {
    alert('Multi-season is not supported at this time. Please set seasons to same year');
    resetStorage();
    canSearch = false;
  }
  if (!seasonSelected || seasonSelected === 'Any Season') {
    alert('Please select a single season before continuing');
    resetStorage();
    canSearch = false;
  }

  return canSearch;
};

function getMatchCount() {
  const matches = Array.from(document.getElementsByClassName('wis_centeredContent'));
  let matchCount = matches.filter(match => match.innerText.includes(' matches were found'))[0];
  if (matchCount) {
    matchCount = matchCount.innerText.match(/([0-9]+) matches were found.*/)[1];
    matchCount = Number.parseInt(matchCount);
  }
  return matchCount;
}

function beginSearch()  {
  setSearchParameters();
  document.getElementById('cmdSearch').click();
}

function setSearchParameters() {
  chrome.storage.local.set({isSearching: true});
  document.getElementById('max').value = '500';
  document.getElementById('sb').value = '9'; // 'Def'
  document.getElementById('format').value = '4'; // 'Advanced'
  document.getElementById('showsecondary').checked = true;
  document.querySelector('input[type="radio"][name="order"][value="1"]').checked = true; // 'Ascending' order
}

function beginReverseSearch() {
  setSearchParameters();
  // below specific to reverse search
  document.querySelector('input[type="radio"][name="order"][value="2"]').checked = true; // 'Descending' order
  document.getElementById('cmdSearch').click();
}

function parsePlayerData() {
  const playerRows = Array.from(document.querySelectorAll('tbody > tr:not(.wis_header):not(.wis_footer)'));
  if (!playerRows || playerRows.length === 0)
  {
    console.error('No names parsed')
  }
  let players = [];
  // 2 rows correspond to 1 player
  for(let i = 0; i < playerRows.length; i+=2) {
    const playerStats = playerRows[i].innerText.split('\t');
    const playerPositions = playerRows[i+1].innerText.split('\t');
    players.push(extractPlayerFromRowPair(playerStats, playerPositions));
  }

  return players;
}

function extractPlayerFromRowPair(playerStats, playerPositions) {
  let player = {};
  player['name'] = playerStats[1];
  player['min'] = playerStats[4];
  player['usg'] = playerStats[8];
  player['efg'] = playerStats[11];
  player['oreb'] = playerStats[12];
  player['dreb'] = playerStats[13];
  player['ast'] = playerStats[14];
  player['stl'] = playerStats[16];
  player['blk'] = playerStats[17];
  player['to%'] = playerStats[18];
  player['def'] = playerStats[19];
  player['salary'] = playerStats[20];
  player['pg'] = playerPositions[4].split(':')[1].trim();
  player['sg'] = playerPositions[5].split(':')[1].trim();
  player['sf'] = playerPositions[6].split(':')[1].trim();
  player['pf'] = playerPositions[7].split(':')[1].trim();
  player['c'] = playerPositions[8].split(':')[1].trim();
  return player;
}

function arePlayersEqual(player1, player2) {
  return Object.keys(player1).every(playerKey => player1[playerKey] === player2[playerKey]);
}

function fetchPlayerDataFromStorage(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, result => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result);
    });
  });
}

function getNextButton() {
  return document.querySelector('a.wis_buttonSecondary[title="Next"]');
};

function makeCsvFile(playerData) {
  if (!playerData || playerData.length === 0) {
    console.error('No players to create file from!');
    return;
  }

  const headerColumns = ['Name', 'Min', 'Usg', 'eFG', 'OReb', 'DReb', 'Ast', 'Stl', 'Blk', 'TO%', 'Def', 'PG', 'SG', 'SF', 'PF', 'C', 'Salary'];
  const orderedPlayers = playerData.sort((player1, player2) => player1.name < player2.name ? -1 : 1);
  let csvContent = 'data:text/csv;charset=utf-8,' + addCsvHeaderRow(headerColumns);
  csvContent += orderedPlayers.map(player => playerToCsv(player, headerColumns)).join('\n');
  const encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}

function addCsvHeaderRow(headerColumns) {
  return headerColumns.join(';') + '\n';
}

function playerToCsv(player, headerColumns) {
  let orderedPlayerData = [];
  headerColumns.forEach(headerColumn => {
    if (headerColumn === 'Name') {
      orderedPlayerData.push(player[headerColumn.toLowerCase()].split(',').reverse().join(' ').trim());
    }
    else {
      orderedPlayerData.push(player[headerColumn.toLowerCase()]);
    }
  });
  return orderedPlayerData.join(';');
}

function resetStorage() {
  chrome.storage.local.remove(['allPlayers', 'isSearching', 'lastPlayer']);
}
