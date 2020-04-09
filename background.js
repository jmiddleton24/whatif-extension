setupContextMenu = () => {
	chrome.contextMenus.create({
		type: 'normal',
		id: 'base',
		title: 'WhatIf Extension'
	});
	chrome.contextMenus.create({
		type: 'normal',
		id: 'rookie-id',
		parentId: 'base',
		title: 'Identify Rookie'
	});

};

chrome.contextMenus.onClicked.addListener((info, tab) => {
	chrome.tabs.executeScript(tab.id, { file: 'rookie-id.js'});
});

chrome.runtime.onInstalled.addListener(function() {
	setupContextMenu();
});
