saveOptions = () => {
    const url = document.getElementById('eid').value;
    const eid = url.match(/(eid=)?([0-9]+)/);
    // TODO: Create real error message for this case
    const leagueNumber = eid ? eid[2] : 'ERROR';
    chrome.storage.local.set({
        leagueNumber: leagueNumber
    }, () => console.log('saved'));
};

restoreOptions = () => {
    chrome.storage.local.get({
        leagueNumber: '000000'
    }, (items) => {
        document.getElementById('eid').value = items.leagueNumber;
    });
};
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click',
    saveOptions);