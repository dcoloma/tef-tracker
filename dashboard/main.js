chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('home.html', {
          id: "FirefoxOS",
    bounds: {
      width: 500,
      height: 320
    }
  });
});