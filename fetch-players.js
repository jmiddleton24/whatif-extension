let currentSearch = window.location.search;
let canSearch = true;
const max = currentSearch.match(/max=([0-9]+)/);
if (!max) {
  currentSearch += 'max=500';
}
else if (max[1] !== '500') {
  currentSearch.replace(/max=[0-9]+/, `max=500`)
}
seasonSelected = document.getElementById('season').value;
season2Selected = document.getElementById('season2').value;
if (seasonSelected !== season2Selected || seasonSelected === 'Any Season') {
  alert('Multi-season is not supported at this time. Please set seasons to same year');
  chrome.storage.local.set({isSearching: false});
  canSearch = false;
}
if (!seasonSelected || seasonSelected === 'Any Season') {
  alert('Please select a single season before continuing');
  chrome.storage.local.set({isSearching: false});
  canSearch = false;
}
if (canSearch) {
  var matches = Array.from(document.getElementsByClassName('wis_centeredContent'));
  var matchCount = matches.filter(match => match.innerText.includes(' matches were found'))[0];
  if (!matchCount) {
    chrome.storage.local.set({isSearching: true});
    document.getElementById('max').value = '500';
    document.getElementById('cmdSearch').click();
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
      allNames = allNames.concat(playerNames);
      if (!allNames || allNames.length == 0)
      {
        console.error('no names parsed')
      }
      matchCount -= allNames.length;
      if (matchCount > 0 && allNames.length > 0) {
        let currentPage = Number.parseInt(currentSearch.match(/pg=([0-9]{1,2})/)[1]);
        const nextSearch = currentSearch.replace(/pg=[0-9]{1,2}/, `pg=${++currentPage}`);
        chrome.storage.local.set({allNames, isSearching: true});
        setTimeout(() => window.location.search = nextSearch, 4000);
      }
      else {
        console.log('make file!', allNames)
        chrome.storage.local.remove(['allNames', 'isSearching']);
      }
    })
  }
}
