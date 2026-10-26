(function () {
  function itemUrl(key) {
    return "/__shelf/item?key=" + encodeURIComponent(key);
  }
  var storage = {
    getItem: function (key) {
      return fetch(itemUrl(key)).then(function (response) {
        if (response.status === 204) return null;
        return response.text();
      });
    },
    setItem: function (key, value) {
      return fetch(itemUrl(key), { method: "PUT", body: String(value) });
    },
    removeItem: function (key) {
      return fetch(itemUrl(key), { method: "DELETE" });
    },
  };
  window.shelf = {
    storage: storage,
    pickExe: function () {
      return fetch("/__shelf/pick", { method: "POST" }).then(function (response) {
        if (response.status === 204) return null;
        return response.text();
      });
    },
    play: function (filePath) {
      return fetch("/__shelf/play", { method: "POST", body: String(filePath) }).then(function (response) {
        return response.ok;
      });
    },
    onExeExit: function (callback) {
      var timer = window.setInterval(function () {
        fetch("/__shelf/exited")
          .then(function (response) {
            if (response.status === 204) return "";
            return response.text();
          })
          .then(function (filePath) {
            if (filePath) callback(filePath);
          })
          .catch(function () {});
      }, 1000);
      return function () {
        window.clearInterval(timer);
      };
    },
  };
})();
