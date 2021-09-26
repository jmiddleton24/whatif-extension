var matches = Array.from(document.getElementsByClassName('wis_centeredContent'));
var matchCount = matches.filter(match => match.innerText.includes(' matches were found'))[0]
  .innerText.match(/([0-9]+) matches were found.*/)[1];
matchCount = Number.parseInt(matchCount);
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
  const playerNames = Array.from(document.querySelectorAll('td.wis_left.wis_highlight > a')).map(row => row.innerText.trim());
  allNames = allNames.concat(playerNames);
  matchCount -= allNames.length;
  if (matchCount > 0) {
    const currentSearch = window.location.search;
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
