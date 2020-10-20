chrome.extension.onConnect.addListener(function (port) {
  console.log("Connected .....");
});

var swipedLeftCount = 0;
var swipedRightCount = 0;
var profiles_photo_map = new Map(); // store profile photos: key: tinder profile id, [] array of photos

// Show Tinder Access Token

var onBeforeSendHeadersCallback = function (details) {
  for (let elem of details.requestHeaders) {
    if (elem.name == "X-Auth-Token") {
      console.log("X-Auth-Token", elem.value);
      var tinder_access_token = elem.value;
      chrome.extension.onConnect.addListener(function (port) {
        port.postMessage({
          action: "updateTinderAccessToken",
          source: tinder_access_token,
        });
      });
    }
  }
};

chrome.webRequest.onBeforeSendHeaders.addListener(
  onBeforeSendHeadersCallback,
  { urls: ["*://*.gotinder.com/*"] },
  ["blocking", "requestHeaders"]
);

// Use the chrome.webRequest API to observe and analyze traffic

var onCompleted_callback = function (details) {
  console.log("onCompleted_callback", details);
  // Fetch Tinder profile images
  var image_api = "images-ssl.gotinder.com/";
  if (details.url.includes(image_api)) {
    let profile_tinder_id = details.url.substring(
      details.url.lastIndexOf(image_api) + image_api.length,
      details.url.lastIndexOf("/")
    );
    if (profiles_photo_map.get(profile_tinder_id)) {
      let photos = profiles_photo_map.get(profile_tinder_id);
      photos.push(details.url);
      profiles_photo_map.set(profile_tinder_id, photos);
    } else {
      profiles_photo_map.set(profile_tinder_id, [details.url]);
    }
  }

  // analyze url pass/like
  var pass_api = "api.gotinder.com/pass/";
  var like_api = "api.gotinder.com/like/";
  if (details.url.includes(pass_api) && details.statusCode == 200) {
    var profile_tinder_id = details.url.substring(
      details.url.lastIndexOf(pass_api) + pass_api.length,
      details.url.lastIndexOf("?")
    );
    console.log("swiped left for user:", profile_tinder_id);

    chrome.extension.onConnect.addListener(function (port) {
      port.postMessage({
        action: "swipedLeftAction",
        source: profiles_photo_map.get(profile_tinder_id),
      });
    });
  } else if (details.url.includes(like_api) && details.statusCode == 200) {
    var profile_tinder_id = details.url.substring(
      details.url.lastIndexOf(like_api) + like_api.length,
      details.url.lastIndexOf("?")
    );
    console.log(
      "swiped right for user:",
      profile_tinder_id,
      profiles_photo_map.get(profile_tinder_id)
    );

    chrome.extension.onConnect.addListener(function (port) {
      port.postMessage({
        action: "swipedRightAction",
        source: profiles_photo_map.get(profile_tinder_id),
      });
    });
  }
};

// onCompleted: Fires when a request has been processed successfully
chrome.webRequest.onCompleted.addListener(
  onCompleted_callback,
  { urls: ["*://*.gotinder.com/*"] },
  ["responseHeaders", "extraHeaders"]
);
