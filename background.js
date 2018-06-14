setupContextMenu = () => {
	chrome.contextMenus.create({
		type: 'normal',
		id: 'test',
		title: 'Test!'
	});

	chrome.contextMenus.onClicked.addListener(() => console.log('1 clicky boi'));
}

chrome.runtime.onInstalled.addListener(function() {
	setupContextMenu();
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {hostEquals: 'www.whatifsports.com'},
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});