// Configuration Params to make this app easy to be updated to different FFOS versions
var versionNumbers = ["1_2", "1_3", "1_4"];
var versionNames = ["stable", "develop", "plan"];
var versionCodes = ["koi", "1.3", "1.4"];
var keys = ["StableVersion", "DevVersion", "PlanVersion"];
var colors = ["blue", "pink", "green"];
var hostedApp = true;

// Bugzilla base links
baseLinkClosedUS = "https://bugzilla.mozilla.org/buglist.cgi?resolution=FIXED&bug_status=RESOLVED&bug_status=VERIFIED&" +
                  "bug_status=CLOSED&status_whiteboard_type=allwordssubstr&query_format=advanced&status_whiteboard=ucid%3A%20";
baseLinkOpenUS = "https://bugzilla.mozilla.org/buglist.cgi?resolution=---&" + 
                 "status_whiteboard_type=allwordssubstr&query_format=advanced&status_whiteboard=ucid%3A%20";
baseLinkAllBlockers = "https://bugzilla.mozilla.org/buglist.cgi?bug_status=UNCONFIRMED&bug_status=NEW&bug_status=ASSIGNED&" +
                      "bug_status=REOPENED&f1=cf_blocking_b2g&o1=equals&query_format=advanced&v1="
var links = new Array (3);
for (var i = 0; i < 3; i++) 
    links[i] = new Array(7);

// Page Areas, index plus one per version handled
var regions = ["index"];
regions = regions.concat(versionNames);

// Firebase base URL and nodes that contain Bug info
var baseURL = "https://owd.firebaseio.com/";
var nodes = ["UserStories/StableVersion/P1/", "UserStories/StableVersion/P2/", "UserStories/DevVersion/P1/", "UserStories/DevVersion/P2/", 
             "UserStories/PlanVersion/P1/", "UserStories/PlanVersion/P2/", "blockers/StableVersion/", "blockers/DevVersion/", "blockers/PlanVersion/"];
var manifestUrl = 'http://dcoloma.github.io/tef-tracker/dashboard/manifest.webapp';

// Boxes Titles
names = ["P1 Open US", "P2 Open US", "P1 Closed US", "P2 Closed US", "Total Blockers", "Gaia Blockers", "Platform Blockers"];

// List with DOM Nodes that show Bug Information. These are used also for local storage keys to work offline 
ids = [["UserStories/StableVersion/P1/OPEN", "UserStories/StableVersion/P2/OPEN", "UserStories/StableVersion/P1/CLOSED",
             "UserStories/StableVersion/P2/CLOSED", "blockers/StableVersion/all", "blockers/StableVersion/Gaia", "blockers/StableVersion/platform"],
       ["UserStories/DevVersion/P1/OPEN", "UserStories/DevVersion/P2/OPEN", "UserStories/DevVersion/P1/CLOSED", 
             "UserStories/DevVersion/P2/CLOSED", "blockers/DevVersion/all", "blockers/DevVersion/Gaia", "blockers/DevVersion/platform"],
       ["UserStories/PlanVersion/P1/OPEN", "UserStories/PlanVersion/P2/OPEN", "UserStories/PlanVersion/P1/CLOSED", 
             "UserStories/PlanVersion/P2/CLOSED", "blockers/PlanVersion/all", "blockers/PlanVersion/Gaia", "blockers/PlanVersion/platform"]];

var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isChrome = !!window.chrome && !!window.chrome.webstore;  

$(window).ready(function() {
  makeAppInstallable();
  document.getElementById("homebutton").onclick = makeShowElementCallback("index");

  configure(); // Create basic config parameters for versions
  createMainMenu(); // DOM Navigation structure
  for (i in versionNumbers) // DOM For every version
    createVersionTiles(versionNumbers[i], versionNames[i], links[i], ids[i], names, colors[i]);
  showElement('index'); // Show only navigation structure
  //installMessage();
  configureInstallation();
  readFromLS(); // Read From Local Storage the info just in case there is no connection
  readFromFB(); // Read Data from FireBase
});  

// Retrieves information from Local Storage
function readFromLS()
{
  console.log("*** METHOD readFromLS");
  domnodes = []; domnodes = domnodes.concat(ids[0]).concat(ids[1]).concat(ids[2]);

  if (window.indexedDB)
  { 
    for (var i in ids)
      for (var j in ids[i])
        asyncStorage.getItem(ids[i][j], createLocalStorageCB(ids[i][j]));
  }
  else // Thanks Apple for not supporting indexedDB
  {
    for (var i in ids)
    {
      for (var j in ids[i])
      {  
        var value = localStorage.getItem(ids[i][j]);
        if (value != null)
          document.getElementById(ids[i][j]).innerHTML = "<h1>"+value+"</h1>";
        else
          document.getElementById(ids[i][j]).innerHTML = "<h1>?</h1>";
        document.getElementById("badge"+ids[i][j]).innerHTML = "<i class='icon-link-2'></i>";
      }
    }
  }
}

// Closure for adding listeners to every node when retrieving info from LocalStorage
function createLocalStorageCB(domnode)
{
  return function(value){
    console.log("*** METHOD LocalStorageCB: Item " + domnode + " value " + value);
    if (value != null)
      document.getElementById(domnode).innerHTML = "<h1>"+value+"</h1>"; 
    else
      document.getElementById(domnode).innerHTML = "<h1>?</h1>"; 
    document.getElementById("badge"+domnode).innerHTML = "<i class='icon-link-2'></i>";
  }
}

// Retrieves information from Firebase
function readFromFB()
{
  console.log("*** METHOD readFromFirebase");
  for (var x in nodes)
  {
    fb = new Firebase(baseURL + nodes[x]);
    fb.on('value', createFirebaseCB(nodes[x]));
  }
}

// Closure for adding listeners to every node
function createFirebaseCB(node)
{
  return function(snapshot){
    snapshot.forEach(function(childSnapshot) {
      console.log("*** METHOD FirebaseCB: Item " + node + childSnapshot.name() + " value " + childSnapshot.val());
      if (window.indexedDB)
        asyncStorage.setItem(node + childSnapshot.name(),childSnapshot.val()); 
      else
        localStorage.setItem(node + childSnapshot.name(),childSnapshot.val()); 
      var d = document.getElementById(node + childSnapshot.name());
      if (d != null)
      {
        d.innerHTML = "<h1>"+childSnapshot.val()+"</h1>";
        document.getElementById("badge"+node + childSnapshot.name()).innerHTML = "<i class='icon-link'></i>";
      }
    });
  }
}

// Menu handler
function showElement(elementToShow)
{
  console.log("INVOKED showElement " + elementToShow);

  if(elementToShow == "all")
  {
    for (var element in versionNames)
    {  
      document.getElementById(versionNames[element]).style.visibility="visible";
      document.getElementById(versionNames[element]).style.display="inline-block";    
    }
    document.getElementById("index").style.visibility="hidden";
    document.getElementById("index").style.display="none";
  }
  else
  {
    for (var element in regions)
    { 
      if(regions[element] == elementToShow)
      {
        document.getElementById(elementToShow).style.visibility="visible";
        document.getElementById(elementToShow).style.display="inline-block";
      }
      else
      {
        document.getElementById(regions[element]).style.visibility="hidden";
        document.getElementById(regions[element]).style.display="none";
      }
    }
  }

  if (elementToShow == "index")
  {
     $(titleText).html("FirefoxOS Dashboard");
     document.getElementById("install").style.visibility="visible";
     document.getElementById("install").style.display="inline-block";
     document.getElementById("homebutton").style.visibility="hidden";
     document.getElementById("homebutton").style.display="none";
  }
  else
  {
     if (elementToShow == "all")
       $(titleText).html("All Versions");
     else
       $(titleText).html("Version " + versionNumbers[versionNames.indexOf(elementToShow)]);
     document.getElementById("install").style.visibility="hidden";
     document.getElementById("install").style.display="none";
     document.getElementById("homebutton").style.visibility="visible";
     document.getElementById("homebutton").style.display="inline-block";
  }
}

function hidePackageddApp()
{
  if (!hostedApp) 
  {
      document.getElementById("hostedApp").style.visibility="hidden";
      document.getElementById("hostedApp").style.display="none";
  }
}

function createMainMenu()
{
   var wrapper= document.createElement('div');
   wrapper.setAttribute("class", "page-region");
   wrapper.setAttribute("align", "center");
   wrapper.setAttribute("id", "index");

   content = "<div class='page-region-content'>";
   for (var x in versionNumbers)
   {
      content += "<a id='link" + versionNames[x] + "' >";
      content += "<div class='tile bg-color-orange icon'><b class='check'><h3>" + versionNumbers[x] + "</h3></b><div class='tile-content'>";
      content += "<img src='images/Firefox-" + versionNames[x] + ".png'></img></div><div class='brand'>";
      content += "<span class='badge'> </span> </div> </div> </a>";
   }  

   content += "<a id='linkall'>";
   content += "<div class='tile bg-color-orange icon'><b class='check'><h3>All Versions</h3></b><div class='tile-content'>";
   content += "<img src='images/Firefox-all.png'></img></div><div class='brand'>";
   content += "<span class='badge'> </span> </div> </div> </a>";

   content += "</div>"
   wrapper.innerHTML = content;
   document.getElementById("page-index").appendChild(wrapper);

   for (var x in versionNames)
   {
     var hr = document.getElementById("link"+versionNames[x]);
     hr.onclick = makeShowElementCallback(versionNames[x]);
   }

   var hr = document.getElementById("linkall");
   hr.onclick = makeShowElementCallback("all");
}

function makeShowElementCallback(name)
{
  return function(){
    showElement(name);
  }
}

// Creates DOM Structure for the 3 versions
function createVersionTiles(version, tag, anchors, identities, names, color)
{
  var wrapper= document.createElement('div');
  wrapper.setAttribute("class", "page-region");
  wrapper.setAttribute("align", "center");
  wrapper.setAttribute("id", tag);

  broken = false;

  content = "<div class='page-region-content'>";
  for (var x in identities)
  {
    if ((identities[x].substring(0, 8) == "blockers") && (!broken))
    {
      content+="<br>";
      broken = true;
    }  

    content+= "<a href='" +  anchors[x]  + "' target='_blank'>";
    content+= "<div class='tile ";
    if (identities[x].substring(0, 8) == "blockers")
     content += "bg-color-" + color + "Dark icon'><p class='check'>" + names[x] +"</p>";
    else
     content += "bg-color-" + color + " icon'><p class='check'>" + names[x] + "</p>";
    content+= "<div class='tile-content' id='" + identities[x] + "'></div>";
    content+= "<div class='brand'><span class='name'>";
    content+= "</span><div class='badge' id='badge" + identities[x] +"'></div></div></div></a>"
  }  
  content += "</div>"
  wrapper.innerHTML = content;
  document.getElementById("page-index").appendChild(wrapper);
}

function configure()
{
  for (var i in ids)
    for (var j in ids[i])
      ids[i][j] = ids[i][j].split(keys[i]).join(versionNumbers[i]);

  for (var i in nodes)
  {
    nodes[i] = nodes[i].split('StableVersion').join(versionNumbers[0]);
    nodes[i] = nodes[i].split('DevVersion').join(versionNumbers[1]);
    nodes[i] = nodes[i].split('PlanVersion').join(versionNumbers[2]);
  }

  baseURLs = [baseLinkOpenUS, baseLinkOpenUS, baseLinkClosedUS, baseLinkClosedUS, baseLinkAllBlockers, baseLinkAllBlockers, baseLinkAllBlockers]
  prefixURLs= ["%3Ap1", "%3Ap2", "%3Ap1", "%3Ap2", "%2B", "%2B&v2=Gaia&o2=anywords&f2=component", "%2B&v2=Gaia&o2=nowords&f2=component"]
  for (i=0; i<3; i++)
    for (j=0; j<7; j++)
      links[i][j] = baseURLs[j]+versionCodes[i]+prefixURLs[j];
}

function configureInstallation()
{
  console.log("*** METHOD configureInstallation for UA " + navigator.userAgent);
  var nodeInstall = "";

  var pattern = /^((http|https|file):\/\/)/;
  if(!pattern.test(window.location.href))
    hostedApp = false;
  else
    hostedApp = true;

  console.log("For window.location.href " + window.location.href + " hostedApp " + hostedApp);

  if (hostedApp)
  {
    // Check Browser
    if(enyo.platform.ios)
    {
      nodeInstall += "<div class='span'></div> <div class='span4 bg-color-orangeDark text-center'>" +
                        "<a id='installer' class='bg-color-orangeDark span4 subheader text-center fg-color-white introduce_r download_link'> " +
                        "<h3 class='fg-color-white'>Click on the arrow below and select 'Add to Homescreen' to install this app</h3></a> </div>";
      document.getElementById("install").innerHTML = nodeInstall;
      $("install").html(nodeInstall);
    }
    else if (isChrome)
    {
       nodeInstall += "<div class='span'></div> <div class='span4 bg-color-orangeDark text-center'>" +
                      "<a id='installer' class='bg-color-orangeDark span4 subheader text-center fg-color-white introduce_r download_link'> " +
                      "<h3 class='fg-color-white'>Download as a Chrome App </h3><span class='icon-download-2'></span></a> </div>";
       document.getElementById("install").innerHTML = nodeInstall;
       var hr = document.getElementById("installer");
       hr.onclick = install;
    }
    else if (navigator.mozApps != null)
    {
      nodeInstall += "<div class='span'></div> <div class='span4 bg-color-orangeDark text-center'>" +
                      "<a id='installer' class='bg-color-orangeDark span4 subheader text-center fg-color-white introduce_r download_link'> " +
                      "<h3 class='fg-color-white'>Download as a Firefox App </h3><span class='icon-download-2'></span></a> </div>";
      document.getElementById("install").innerHTML = nodeInstall;
      var hr = document.getElementById("installer");
      hr.onclick = install;
      /*if(enyo.platform.firefoxOS)
      {
         nodeInstall += "<div class='span'></div> <div class='span4 bg-color-orangeDark text-center'>" +
                        "<a id='installer' class='bg-color-orangeDark span4 subheader text-center fg-color-white introduce_r download_link'> " +
                        "<h3 class='fg-color-white'>Click on the star <span class='icon-star'></span>below and select 'Add to Homescreen' to install this app</h3></a> </div>";
         document.getElementById("install").innerHTML = nodeInstall;
      }
      else
      {
        nodeInstall += "<div class='span'></div> <div class='span4 bg-color-orangeDark text-center'>" +
                      "<a id='installer' class='bg-color-orangeDark span4 subheader text-center fg-color-white introduce_r download_link'> " +
                      "<h3 class='fg-color-white'>Download as a Firefox App </h3><span class='icon-download-2'></span></a> </div>";
        document.getElementById("install").innerHTML = nodeInstall;
        var hr = document.getElementById("installer");
        hr.onclick = install;
      }*/
      
    }
  }
}

function install()
{
  if (isChrome)
  { 
    chrome.webstore.install("https://chrome.google.com/webstore/detail/mbpjgoggfhknoknpdobcmglakceigodh",
                            function(){alert("FirefoxOS Tracker Successfully installed");},
                            function(error){alert("App could not be installed " + error);});
  }
  else if (navigator.mozApps != null)
  {
    var req = navigator.mozApps.install(manifestUrl);
    req.onsuccess = function() {
      alert("FirefoxOS Tracker Successfully installed");
    };
    req.onerror = function() {
      alert("App could not be installed " + this.error.name);
    };
  }
}

function makeAppInstallable()
{
  // Installable as apps
  var appleMobileWeb = document.createElement('meta');
  appleMobileWeb.setAttribute('name', 'apple-mobile-web-app-capable');
  appleMobileWeb.setAttribute('content', 'yes');
  var html5MobileWeb = document.createElement('meta'); // Google
  html5MobileWeb.setAttribute('name', 'mobile-web-app-capable');
  html5MobileWeb.setAttribute('content', 'yes');
  // Icons 
  var appleIcon = document.createElement('link'); // Google
  appleIcon.setAttribute('rel', 'apple-touch-icon-precomposed');
  appleIcon.setAttribute('href', 'style/icons/firefox-128.png');
  var favIcon = document.createElement('link'); // Google
  favIcon.setAttribute('rel', 'shortcut icon');
  favIcon.setAttribute('href', 'favicon.ico');
  // Names
  var html5Name = document.createElement('meta'); // Google
  html5Name.setAttribute('name', 'application-name');
  html5Name.setAttribute('href', 'FFOS Tracker');
  var appleName = document.createElement('meta'); // Google
  appleName.setAttribute('name', 'application-mobile-web-app-title');
  appleName.setAttribute('href', 'FFOS Tracker');
  // Chrome Item
  var chromeStoreItem = document.createElement('link'); // Google
  chromeStoreItem.setAttribute('rel', 'chrome-webstore-item');
  chromeStoreItem.setAttribute('href', 'https://chrome.google.com/webstore/detail/mbpjgoggfhknoknpdobcmglakceigodh');

  document.getElementsByTagName('head')[0].appendChild(appleMobileWeb);
  document.getElementsByTagName('head')[0].appendChild(html5MobileWeb);
  document.getElementsByTagName('head')[0].appendChild(appleIcon);
  document.getElementsByTagName('head')[0].appendChild(favIcon);
  document.getElementsByTagName('head')[0].appendChild(html5Name);
  document.getElementsByTagName('head')[0].appendChild(appleName);
  document.getElementsByTagName('head')[0].appendChild(chromeStoreItem);
}