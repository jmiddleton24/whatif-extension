let changeColor = document.getElementById('changeColor');

docQuery = `
	window.create('stats.asp?teamid=509102&view=5');
	// let teamWindow = window.open('stats.asp?teamid=509102&view=5');
	// teamWindow.blur();
	// window.focus();
`

changeColor.onclick = function(element) {
	// console.log(document);
	let color = element.target.value;
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.executeScript(
			tabs[0].id,
			{code: docQuery});
	});
};