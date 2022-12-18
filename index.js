const panoElement = document.getElementById("pano");
const inputElement = document.getElementById("filesInput");
const screenLog = document.getElementById("screen-log");
const preview = document.getElementById("preview");
const linkButton = document.getElementById("link-button");
const infoButton = document.getElementById("info-button");
let imgUrls = [];
let scenes = [];
let currentScene = 0;
let isAddingInfoHotspot = false;
let isAddingLinkHotspot = false;
let dragging = false;
let testTool;

//var rect = { relativeWidth: 0.6, relativeHeight: 0.3, relativeX: 0.6 };
inputElement.addEventListener("change", addPano, false);

panoElement.addEventListener("mousemove", logKey);

panoElement.addEventListener("click", addInfoHotspot);

panoElement.addEventListener("click", addLinkHotspot);

//initialize viewer
let viewerOpts = {
  controls: {
    mouseViewMode: "drag",
  },
};
let viewer = new Marzipano.Viewer(panoElement, viewerOpts);
let geometry = new Marzipano.EquirectGeometry([{ width: 5000 }]);
let limiter = Marzipano.RectilinearView.limit.traditional(
  5000,
  (100 * Math.PI) / 180
);
let view = new Marzipano.RectilinearView({ yaw: Math.PI }, limiter);

function addPano() {
  const image = this.files[0];
  imgUrls.push(window.URL.createObjectURL(image));
  addScene();
  imgUrls.pop();
}

function addScene() {
  const source = new Marzipano.ImageUrlSource.fromString(imgUrls[0]);
  let scene = viewer.createScene({
    source: source,
    geometry: geometry,
    view: view,
    pinFirstLevel: true,
  });

  if (scenes.length > 0) {
    currentScene++;
  }
  scenes.push(scene);
  scene.switchTo();
}

function nextScene() {
  if (scenes.length == 0) {
    alert("No scene has been added yet!");
  } else if (scenes.length == 1) {
    alert("There's no next scene!");
  }
  if (currentScene == scenes.length - 1) {
    currentScene = 0;
  } else currentScene++;
  scenes[currentScene].switchTo();
}

function previousScene() {
  if (scenes.length == 0) {
    alert("No scene has been added yet!!");
  } else if (scenes.length == 1) {
    alert("There's no previous scene!");
  }
  if (currentScene == 0) {
    currentScene = scenes.length - 1;
  } else currentScene--;
  scenes[currentScene].switchTo();
}

function prepareAddInfoHotspot() {
  switchButtonState("info-button");
}
function prepareAddLinkHotspot() {
  switchButtonState("link-button");
}

function addInfoHotspot(e) {
  while (scenes.length != 0) {
    if (!isAddingInfoHotspot) return;
    let hotspot = createInfoHotspotElement();
    position = getPosition(e);

    scenes[currentScene].hotspotContainer().createHotspot(hotspot, position);

    switchButtonState("info-button");
  }
}

function addLinkHotspot(e) {
  if (scenes.length == 0) {
    alert("No scene has been added yet!!!");
  }
  while (scenes.length != 0) {
    if (!isAddingLinkHotspot) return;
    let hotspot = createLinkHotspotElement();
    position = getPosition(e);

    scenes[currentScene].hotspotContainer().createHotspot(hotspot, position);

    switchButtonState("link-button");
  }
}

function createInfoHotspotElement() {
  // Create wrapper element to hold icon and tooltip.
  var wrapper = document.createElement("div");
  //wrapper.classList.add('hotspot');
  wrapper.classList.add("info-hotspot");

  // Create hotspot/tooltip header.
  var header = document.createElement("div");
  header.classList.add("info-hotspot-header");

  // Create image element.
  var iconWrapper = document.createElement("div");
  iconWrapper.classList.add("info-hotspot-icon-wrapper");
  var icon = document.createElement("img");
  icon.src = "img/icon/info.png";
  icon.classList.add("info-hotspot-icon");
  iconWrapper.appendChild(icon);

  // Create title element.
  var titleWrapper = document.createElement("div");
  titleWrapper.classList.add("info-hotspot-title-wrapper");
  var title = document.createElement("p");
  title.classList.add("info-hotspot-title");
  title.innerHTML = "Title";
  title.setAttribute("contenteditable", "true");
  titleWrapper.appendChild(title);

  // Create close element.
  var closeWrapper = document.createElement("div");
  closeWrapper.classList.add("info-hotspot-close-wrapper");
  var closeIcon = document.createElement("img");
  closeIcon.src = "img/icon/close.png";
  closeIcon.classList.add("info-hotspot-close-icon");
  closeWrapper.appendChild(closeIcon);

  // Construct header element.
  header.appendChild(iconWrapper);
  header.appendChild(titleWrapper);
  header.appendChild(closeWrapper);

  // Create text element.
  var text = document.createElement("p");
  text.setAttribute("contenteditable", "true");
  text.classList.add("info-hotspot-text");
  text.innerHTML = "description";

  // Place header and text into wrapper element.
  wrapper.appendChild(header);
  wrapper.appendChild(text);

  // Create a modal for the hotspot content to appear on mobile mode.
  var modal = document.createElement("div");
  modal.innerHTML = wrapper.innerHTML;
  modal.classList.add("info-hotspot-modal");

  var toggle = function () {
    wrapper.classList.toggle("visible");
    modal.classList.toggle("visible");
  };

  // Show/hide content when hotspot is clicked.
  icon.addEventListener("click", toggle);
  closeWrapper.addEventListener("click", toggle);

  //dragable hotspot
  function onDrag(event) {
    let getStyle = window.getComputedStyle(wrapper);
    let left = parseInt(getStyle.left);
    let top = parseInt(getStyle.top);

    wrapper.style.left = left + event.movementX + "px";
    wrapper.style.top = top + event.movementY + "px";
    dragging = true;
  }

  icon.addEventListener("mousedown", () => {
    icon.addEventListener("mousemove", onDrag);
  });
  icon.addEventListener("mouseup", () => {
    icon.removeEventListener("mousemove", onDrag);
    if (dragging) {
      icon.removeEventListener("click", toggle);
    } else {
      icon.addEventListener("click", toggle);
    }
    dragging = false;
  });

  stopTouchAndScrollEventPropagation(wrapper);

  return wrapper;
}

function createLinkHotspotElement() {
  // Create wrapper element to hold icon and tooltip.
  var wrapper = document.createElement("div");
  wrapper.classList.add("hotspot");
  wrapper.classList.add("link-hotspot");

  // Create image element.
  var icon = document.createElement("img");
  icon.src = "img/icon/link.png";
  icon.classList.add("link-hotspot-icon");

  // Add click event handler.
  // wrapper.addEventListener('click', function() {
  //   switchScene(findSceneById(hotspot.target));
  // });

  // Prevent touch and scroll events from reaching the parent element.
  // This prevents the view control logic from interfering with the hotspot.
  //stopTouchAndScrollEventPropagation(wrapper);

  //Create tooltip element.
  var tooltip = document.createElement("input");
  tooltip.classList.add("hotspot-tooltip");
  tooltip.classList.add("link-hotspot-tooltip");
  tooltip.value = 0;

  // Drag link hotspot.
  function onDrag(event) {
    let getStyle = window.getComputedStyle(wrapper);
    let left = parseInt(getStyle.left);
    let top = parseInt(getStyle.top);

    console.log(event);

    wrapper.style.left = left + event.movementX + "px";
    wrapper.style.top = top + event.movementY + "px";
  }
  function switchScene(event) {
    if (tooltip.value <= scenes.length) {
      currentScene = tooltip.value;
      scenes[currentScene].switchTo();
    }
  }
  wrapper.appendChild(icon);
  wrapper.appendChild(tooltip);

  icon.addEventListener("click", switchScene);

  icon.addEventListener("mousedown", () => {
    icon.addEventListener("mousemove", onDrag);
  });

  icon.addEventListener("mouseup", () => {
    icon.removeEventListener("mousemove", onDrag);
    if (dragging) {
      icon.removeEventListener("click", switchScene);
    } else {
      icon.addEventListener("click", switchScene);
    }
    dragging = false;
  });

  stopTouchAndScrollEventPropagation(wrapper);

  return wrapper;
}

function logKey(e) {
  relX = e.clientX - panoElement.offsetLeft;
  relY = e.clientY - panoElement.offsetTop;
  panoPosition = view.screenToCoordinates({ x: relX, y: relY });
  screenLog.innerText = `
    Screen X/Y: ${e.screenX}, ${e.screenY}
    Client X/Y: ${relX}, ${relY}
    Pano Yaw/Pitch: ${panoPosition.yaw}, ${panoPosition.pitch}`;
  return panoPosition;
}

function getPosition(e) {
  relX = e.clientX - panoElement.offsetLeft;
  relY = e.clientY - panoElement.offsetTop;
  panoPosition = view.screenToCoordinates({ x: relX, y: relY });
  return panoPosition;
}

function switchButtonState(buttonType) {
  if (buttonType == "info-button") {
    if (isAddingLinkHotspot) {
      linkButton.classList.remove("active");
      isAddingLinkHotspot = !isAddingLinkHotspot;
    }

    if (!isAddingInfoHotspot) {
      infoButton.classList.add("active");
      isAddingInfoHotspot = !isAddingInfoHotspot;
    } else {
      infoButton.classList.remove("active");
      isAddingInfoHotspot = !isAddingInfoHotspot;
    }
  }

  if (buttonType == "link-button") {
    if (isAddingInfoHotspot) {
      infoButton.classList.remove("active");
      isAddingInfoHotspot = !isAddingInfoHotspot;
    }

    if (!isAddingLinkHotspot) {
      linkButton.classList.add("active");
      isAddingLinkHotspot = !isAddingLinkHotspot;
    } else {
      linkButton.classList.remove("active");
      isAddingLinkHotspot = !isAddingLinkHotspot;
    }
  }
}

// Prevent touch and scroll events from reaching the parent element.
function stopTouchAndScrollEventPropagation(element, eventList) {
  var eventList = [
    "touchstart",
    "touchmove",
    "touchend",
    "touchcancel",
    "pointerdown",
    "pointermove",
    "pointerup",
    "pointercancel",
    "wheel",
  ];
  for (var i = 0; i < eventList.length; i++) {
    element.addEventListener(eventList[i], function (event) {
      event.stopPropagation();
    });
  }
}

// Viewer
// DOM elements for view controls.
var viewUpElement = document.querySelector('#viewUp');
var viewDownElement = document.querySelector('#viewDown');
var viewLeftElement = document.querySelector('#viewLeft');
var viewRightElement = document.querySelector('#viewRight');
var viewInElement = document.querySelector('#viewIn');
var viewOutElement = document.querySelector('#viewOut');

// Dynamic parameters for controls.
var velocity = 0.7;
var friction = 3;

// Associate view controls with elements.
var controls = viewer.controls();
controls.registerMethod('upElement',    new Marzipano.ElementPressControlMethod(viewUpElement,     'y', -velocity, friction), true);
controls.registerMethod('downElement',  new Marzipano.ElementPressControlMethod(viewDownElement,   'y',  velocity, friction), true);
controls.registerMethod('leftElement',  new Marzipano.ElementPressControlMethod(viewLeftElement,   'x', -velocity, friction), true);
controls.registerMethod('rightElement', new Marzipano.ElementPressControlMethod(viewRightElement,  'x',  velocity, friction), true);
controls.registerMethod('inElement',    new Marzipano.ElementPressControlMethod(viewInElement,  'zoom', -velocity, friction), true);
controls.registerMethod('outElement',   new Marzipano.ElementPressControlMethod(viewOutElement, 'zoom',  velocity, friction), true);

// Preview
function viewerPov() {
  document.querySelector('.viewControlButton-1').style.display = "block"
  document.querySelector('.viewControlButton-2').style.display = "block"
  document.querySelector('.viewControlButton-3').style.display = "block"
  document.querySelector('.viewControlButton-4').style.display = "block"
  document.querySelector('.viewControlButton-5').style.display = "block"
  document.querySelector('.viewControlButton-6').style.display = "block"
  document.querySelector('#titleBar').style.display = "block"
  document.querySelector('#autorotateToggle').style.display = "block"
}

// Stop Preview
function stopViewerPov() {
  document.querySelector('.viewControlButton-1').style.display = "none"
  document.querySelector('.viewControlButton-2').style.display = "none"
  document.querySelector('.viewControlButton-3').style.display = "none"
  document.querySelector('.viewControlButton-4').style.display = "none"
  document.querySelector('.viewControlButton-5').style.display = "none"
  document.querySelector('.viewControlButton-6').style.display = "none"
  document.querySelector('#titleBar').style.display = "none"
  document.querySelector('#autorotateToggle').style.display = "none"
}

// Set up autorotate, if enabled.
var autorotate = Marzipano.autorotate({
  yawSpeed: 0.03,
  targetPitch: 0,
  targetFov: Math.PI/2
});

// Set handler for autorotate toggle.
autorotateToggleElement.addEventListener('click', toggleAutorotate);

function startAutorotate() {
  if (!autorotateToggleElement.classList.contains('enabled')) {
    return;
  }
  viewer.startMovement(autorotate);
  viewer.setIdleMovement(3000, autorotate);
}

function stopAutorotate() {
  viewer.stopMovement();
  viewer.setIdleMovement(Infinity);
}

function toggleAutorotate() {
  if (autorotateToggleElement.classList.contains('enabled')) {
    autorotateToggleElement.classList.remove('enabled');
    stopAutorotate();
  } else {
    autorotateToggleElement.classList.add('enabled');
    startAutorotate();
  }
}
