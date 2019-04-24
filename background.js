setupContextMenu = () => {
	chrome.contextMenus.create({
		type: 'normal',
		id: 'rookie-id',
		title: 'Identify Rookie'
	});

	chrome.contextMenus.onClicked.addListener((info, tab) => {
		chrome.tabs.executeScript(tab.id, { file: 'rookie-id.js'});
	});
};

chrome.runtime.onInstalled.addListener(function() {
	setupContextMenu();
});