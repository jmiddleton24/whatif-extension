saveOptions = () => {
    const eidElement = document.getElementById('eid');
    const eid = eidElement.value.match(/(eid=)?([0-9]+)/i);
    const leagueNumber = eid ? eid[2] : null;
    const spanElement = document.createElement('span');
    spanElement.id = 'user-feedback';
    if (leagueNumber !== null) {
        chrome.storage.local.set({
            leagueNumber: leagueNumber
        }, () => {
            eidElement.value = leagueNumber;
            spanElement.className = 'success';
            spanElement.innerText = 'League number set';
        });
    } else {
        eidElement.value = '';
        spanElement.className = 'error';
        spanElement.innerText = 'League Number could not be found (eid=??)';
    }
    if (document.getElementById('user-feedback')) {
        document.getElementById('main').removeChild(document.getElementById('user-feedback'));
    }
    document.getElementById('main').appendChild(spanElement);
};

restoreOptions = () => {
    chrome.storage.local.get({
        leagueNumber: '000000'
    }, (items) => {
        document.getElementById('eid').value = items.leagueNumber;
    });
};
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);