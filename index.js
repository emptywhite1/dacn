const panoElement = document.getElementById("pano");
const inputElement = document.getElementById("filesInput");
const screenLog = document.getElementById("screen-log");
const preview = document.getElementById("preview");
let imgUrls = [];
let scenes = [];
let currentScene = 0;
var rect = { relativeWidth: 0.6, relativeHeight: 0.3, relativeX: 0.6 };

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

inputElement.addEventListener("change", addPano, false);

panoElement.addEventListener("mousemove", logKey);

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
  if (currentScene == scenes.length - 1) {
    currentScene = 0;
  } else currentScene++;
  scenes[currentScene].switchTo();
}

function previousScene() {
  if (currentScene == 0) {
    currentScene = scenes.length - 1;
  } else currentScene--;
  scenes[currentScene].switchTo();
}

function addInfoHotspot() {
  // var imgHotspot = document.createElement('img');
  // imgHotspot.src = 'img/info.png';
  // imgHotspot.classList.add('hotspot');
  // imgHotspot.addEventListener('click', function() {
  //   switchScene(findSceneById(hotspot.target));
  // });
  let hotspot = createInfoHotspotElement();
  let position = { yaw: 0, pitch: 0 };

  scenes[currentScene].hotspotContainer().createHotspot(hotspot, position);
}

function addLinkHotspot() {
  
  let hotspot = createLinkHotspotElement();
  let position = { yaw: 0, pitch: 0 };

  scenes[currentScene].hotspotContainer().createHotspot(hotspot, position);

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
  var title = document.createElement("div");
  title.classList.add("info-hotspot-title");
  title.innerHTML = "Title";
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
  var text = document.createElement("div");
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

  // Show content when hotspot is clicked.
  wrapper
    .querySelector(".info-hotspot-header")
    .addEventListener("click", toggle);

  // Hide content when close icon is clicked.
  modal
    .querySelector(".info-hotspot-close-wrapper")
    .addEventListener("click", toggle);

  // Prevent touch and scroll events from reaching the parent element.
  // This prevents the view control logic from interfering with the hotspot.

  return wrapper;
}

function createLinkHotspotElement(hotspot) {

  // Create wrapper element to hold icon and tooltip.
  var wrapper = document.createElement('div');
  wrapper.classList.add('hotspot');
  wrapper.classList.add('link-hotspot');

  // Create image element.
  var icon = document.createElement('img');
  icon.src = 'img/icon/link.png';
  icon.classList.add('link-hotspot-icon');

  // Set rotation transform.
  // var transformProperties = [ '-ms-transform', '-webkit-transform', 'transform' ];
  // for (var i = 0; i < transformProperties.length; i++) {
  //   var property = transformProperties[i];
  //   icon.style[property] = 'rotate(' + hotspot.rotation + 'rad)';
  // }

  // Add click event handler.
  // wrapper.addEventListener('click', function() {
  //   switchScene(findSceneById(hotspot.target));
  // });

  // Prevent touch and scroll events from reaching the parent element.
  // This prevents the view control logic from interfering with the hotspot.
  //stopTouchAndScrollEventPropagation(wrapper);

  // Create tooltip element.
  // var tooltip = document.createElement('div');
  // tooltip.classList.add('hotspot-tooltip');
  // tooltip.classList.add('link-hotspot-tooltip');
  // tooltip.innerHTML = findSceneDataById(hotspot.target).name;

  wrapper.appendChild(icon);
  //wrapper.appendChild(tooltip);

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
}
