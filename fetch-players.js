if (canSearch()) {
  var matches = Array.from(document.getElementsByClassName('wis_centeredContent'));
  var matchCount = matches.filter(match => match.innerText.includes(' matches were found'))[0];
  if (!matchCount || !getNextButton()) {
    beginSearch();
  }
  else {
    matchCount = matchCount.innerText.match(/([0-9]+) matches were found.*/)[1];
    matchCount = Number.parseInt(matchCount);
  }
  if (matchCount) {
    new Promise((resolve, reject) => {
      chrome.storage.local.get(['allNames'], result => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(result.allNames);
      });
    }).then(allNames => {
      if (!allNames) {
        allNames = [];
      }
      const playerNames = Array.from(document.querySelectorAll('td.wis_left > a:not(.RefLink)')).map(row => row.innerText.trim());
      if (!playerNames || playerNames.length === 0)
      {
        console.error('No names parsed')
      }
      const pageOfNames = new Set();
      playerNames.map(playerName => playerName.split(',').reverse().join(' '))
        .forEach(playerName => pageOfNames.add(playerName.trim()));
      matchCount -= playerNames.length;
      allNames = allNames.concat(Array.from(pageOfNames));
      const nextPage = getNextButton();
      if (nextPage) {
        chrome.storage.local.set({allNames, isSearching: true});
        setTimeout(() => nextPage.click(), 4000);
      }
      else {
        makeCsvFile(allNames);
        chrome.storage.local.remove(['allNames', 'isSearching']);
      }
    })
  }
}

function canSearch() {
  let canSearch = true;
  seasonSelected = document.getElementById('season').value;
  season2Selected = document.getElementById('season2').value;
  if (seasonSelected !== season2Selected || seasonSelected === 'Any Season') {
    alert('Multi-season is not supported at this time. Please set seasons to same year');
    chrome.storage.local.remove(['allNames', 'isSearching']);
    canSearch = false;
  }
  if (!seasonSelected || seasonSelected === 'Any Season') {
    alert('Please select a single season before continuing');
    chrome.storage.local.remove(['allNames', 'isSearching']);
    canSearch = false;
  }

  return canSearch;
};

function beginSearch()  {
  chrome.storage.local.set({isSearching: true});
  document.getElementById('max').value = '500';
  document.getElementById('sb').value = '1'; // 'Name'
  document.querySelector('input[type="radio"][name="order"][value="1"]').checked = true; // 'Ascending' order
  document.getElementById('cmdSearch').click();
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
