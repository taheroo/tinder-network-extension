var port = chrome.extension.connect({
  name: "Sample Communication",
});
port.onMessage.addListener(function (msg) {
  switch (msg.action) {
    case "updateTinderAccessToken":
      var tinderAccessTokenSpan = document.querySelector(
        "#tinder-access-token"
      );
      tinderAccessTokenSpan.innerHTML = msg.source;
      break;
    case "swipedLeftAction":
      var swipedLeftCountSpan = document.querySelector("#swiped-left");
      var swipedLeftCount = parseInt(swipedLeftCountSpan.innerHTML) + 1;
      swipedLeftCountSpan.innerHTML = swipedLeftCount;

      var swipedLeftListDiv = document.querySelector("#swiped-left-list");
      swipedLeftListDiv.innerHTML +=
        `<img src="` + msg.source[0] + `" width="125" height="125" >` + "<br>";
      break;
    case "swipedRightAction":
      var swipedRightCountSpan = document.querySelector("#swiped-right");
      var swipedRightCount = parseInt(swipedRightCountSpan.innerHTML) + 1;
      swipedRightCountSpan.innerHTML = swipedRightCount;

      var swipedRightListDiv = document.querySelector("#swiped-right-list");
      swipedRightListDiv.innerHTML +=
        `<img src="` + msg.source[0] + `" width="125" height="125" >` + "<br>";
      break;

    default:
      break;
  }
});
