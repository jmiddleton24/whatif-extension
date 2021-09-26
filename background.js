setupContextMenu = () => {
	chrome.contextMenus.create({
		type: 'normal',
		id: 'base',
		title: 'WhatIf Extension'
	});
	chrome.contextMenus.create({
		type: 'normal',
		id: 'fetch-names',
		parentId: 'base',
		title: 'Fetch Names for Season'
	});

};

chrome.contextMenus.onClicked.addListener((info, tab) => {
	chrome.tabs.executeScript(tab.id, { file: 'fetch-players.js'});
});

chrome.runtime.onInstalled.addListener(function() {
	setupContextMenu();
});

chrome.webNavigation.onCompleted.addListener(details => {
	if (details.url.includes('playersearch')) {
		new Promise((resolve, reject) => {
			chrome.storage.local.get(['isSearching'], result => {
				if (chrome.runtime.lastError) {
					return reject(chrome.runtime.lastError);
				}
				resolve(result.isSearching);
			})
		}).then(isSearching => {
			if (isSearching) {
				chrome.tabs.executeScript(details.tabId, {file: "fetch-players.js"})
			}
		});
	}
});
