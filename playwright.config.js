module.exports = {
  use: {
    channel: 'chrome',
  },
  // Serve the static site for the tests; reuses one already running on 8765.
  webServer: {
    command: 'python3 -m http.server 8765 --bind 127.0.0.1',
    url: 'http://127.0.0.1:8765/',
    reuseExistingServer: true,
    timeout: 15000,
  },
};
