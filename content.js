const styncFcsStyles = (doc, iframe) => {
  const nonVideoList = Array.from(doc.body.children).filter(
    (c) => !c.querySelector(".video-js")
  );
  const videoWrap = doc.querySelector(".video-js");

  if (document.fullscreenElement === iframe) {
    nonVideoList.forEach((c) => {
      c.style.visibility = "hidden";
    });
    doc.body.style.overflow = "hidden";
    videoWrap.classList.add("vjs-fullscreen");
    videoWrap.style.cssText =
      "position: fixed; top: 0; left: 0; background-color: black; z-index: 10000;";
  } else {
    videoWrap.style.cssText = "";
    videoWrap.classList.remove("vjs-fullscreen");
    nonVideoList.forEach((c) => {
      c.style.visibility = "visible";
    });
    doc.body.style.overflow = "auto";
  }
};

const play = (doc, iframe) => {
  const video = doc.querySelector(".video-js video");

  styncFcsStyles(doc, iframe);

  iframe.style.visibility = "visible";

  video.play();
};

const fscChanged = () => {
  const iframe = document.querySelector("iframe");
  const doc = iframe.contentDocument || iframe.contentWindow.document;

  styncFcsStyles(doc, iframe);
};

const prepPlayer = (doc, iframe) => {
  const swtchFsc = () => {
    if (document.fullscreenElement === iframe) {
      document.exitFullscreen();
    } else {
      iframe.requestFullscreen();
    }
  };

  const fscBtn = doc.querySelector("button.vjs-fullscreen-control");
  const videoWrap = doc.querySelector(".video-js");

  fscBtn.addEventListener(
    "click",
    (e) => {
      e.stopPropagation();
      swtchFsc();
    },
    true
  );

  videoWrap.addEventListener(
    "dblclick",
    (e) => {
      e.stopPropagation();
      swtchFsc();
    },
    true
  );

  videoWrap.addEventListener(
    "keydown",
    (e) => {
      if (e.code === "KeyF") {
        e.stopPropagation();
        swtchFsc();
      }
    },
    true
  );
};

const init = () => {
  if (!document.querySelector(".video-js video")) return;

  let lastClicked;

  const url = window.location.href;

  const iframe = document.createElement("iframe");

  iframe.src = url;

  iframe.style.cssText =
    "position: absolute; top: 0; left: 0; width: 100%; min-height: 100vh; border: none;";

  const blackScreen = document.createElement("div");
  blackScreen.style.cssText =
    "position: fixed; top: 0; left: 0; width: 100%; height: 100hv; background-color: black;";

  document.body.appendChild(blackScreen);
  document.body.appendChild(iframe);

  Array.from(document.body.children).forEach((c) => {
    if (![blackScreen, iframe].includes(c)) c.remove();
  });

  document.addEventListener("fullscreenchange", fscChanged);

  iframe.addEventListener("load", () => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;

      const isPlayPage = !!doc.querySelector(".video-js video");

      if (!isPlayPage) {
        window.location.href = iframe.contentWindow.location.href;
      }

      window.history.pushState({}, "", iframe.contentWindow.location.href);
      document.title = doc.title;

      const isAutoPlay = !!doc.querySelector(".ps_class_autoplay input")
        ?.checked;

      if (isAutoPlay) {
        play(doc, iframe);
        prepPlayer(doc, iframe);

        iframe.contentWindow.addEventListener("beforeunload", () => {
          if (document.fullscreenElement === iframe) {
            iframe.style.visibility = "hidden";
          }
        });

        iframe.contentWindow.addEventListener("click", (e) => {
          lastClicked = e.target;
        });
      }
    } catch (e) {
      const isBlocked = e.toString().includes("Blocked a frame");
      if (isBlocked && lastClicked.href) {
        window.location.href = lastClicked.href;
      }
    }
  });
};

init();
