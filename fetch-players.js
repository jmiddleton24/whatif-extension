fetchPlayerDataFromStorage(['allNames', 'lastPlayer', 'isSearching']).then(playerData => {
  if (canSearch()) {
    let matchCount = getMatchCount();
    if (!matchCount || !getNextButton() && !playerData.isSearching) {
      beginSearch();
    }
    else if (matchCount) {
      let allNames = [];
      if (playerData.allNames) {
        allNames = playerData.allNames;
      }
      const parsedPlayerData = parsePlayerData();
      const pageOfNames = new Set();
      let playersToAdd = parsedPlayerData;
      let playerFound = false;
      if (playerData.lastPlayer) {
        const lastPlayerIndex = parsedPlayerData.findIndex(playerName => playerName === playerData.lastPlayer);
        if (lastPlayerIndex !== -1) {
          // this page contains the last player when searching in ascending order
          // so we only need to include the players up to that player (we have the rest)
          playersToAdd = playersToAdd.slice(lastPlayerIndex);
          playerFound = true;
        }
      }
      playersToAdd.forEach(playerName => pageOfNames.add(playerName.trim()));

      allNames = allNames.concat(Array.from(pageOfNames));
      const nextPage = getNextButton();
      if (nextPage && !playerFound) {
        chrome.storage.local.set({allNames: allNames, isSearching: true});
        setTimeout(() => nextPage.click(), 4000);
      }
      else {
        // WhatIf searches are limited to a max of 500 records
        // account for that there may be more players than 500
        if (matchCount !== 500 || playerFound) {
          makeCsvFile(allNames);
          resetStorage();
        }
        else {
          chrome.storage.local.set({allNames: allNames, lastPlayer: parsedPlayerData[parsedPlayerData.length -1]});
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
  matchCount = matchCount.innerText.match(/([0-9]+) matches were found.*/)[1];
  if (matchCount) {
    matchCount = Number.parseInt(matchCount);
  }
  return matchCount;
}

function beginSearch()  {
  chrome.storage.local.set({isSearching: true});
  document.getElementById('max').value = '500';
  document.getElementById('sb').value = '1'; // 'Name'
  document.querySelector('input[type="radio"][name="order"][value="1"]').checked = true; // 'Ascending' order
  document.getElementById('cmdSearch').click();
}

function parsePlayerData() { 
  const playerNames = Array.from(document.querySelectorAll('td.wis_left > a:not(.RefLink)')).map(row => row.innerText.trim());
  if (!playerNames || playerNames.length === 0)
  {
    console.error('No names parsed')
  }

  return playerNames;
}

function beginReverseSearch() {
  chrome.storage.local.set({isSearching: true});
  document.getElementById('max').value = '500';
  document.getElementById('sb').value = '1'; // 'Name'
  document.querySelector('input[type="radio"][name="order"][value="2"]').checked = true; // 'Descending' order
  document.getElementById('cmdSearch').click();
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

  const csvContent = 'data:text/csv;charset=utf-8,' + playerData.join('\n');
  const encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}

function resetStorage() {
  chrome.storage.local.remove(['allNames', 'isSearching', 'lastPlayer']);
}
