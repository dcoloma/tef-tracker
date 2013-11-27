// Configuration Params to make this app easy to be updated to different FFOS versions
var versionNumbers = ["1_2", "1_3", "1_4"];
var versionNames = ["stable", "develop", "plan"];
var versionCodes = ["koi", "1.3", "1.4"];
var keys = ["StableVersion", "DevVersion", "PlanVersion"];
var colors = ["blue", "pink", "green"]

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
var manifestUrl = 'http://dcoloma.github.io/tef-tracker/dashboard/package/manifest.webapp';


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
  document.getElementById("homebutton").onclick = makeShowElementCallback("index");
  configure(); // Create basic config parameters for versions
  createMainMenu(); // DOM Navigation structure
  for (i in versionNumbers) // DOM For every version
    createVersionTiles(versionNumbers[i], versionNames[i], links[i], ids[i], names, colors[i]);
  showElement('index'); // Show only navigation structure
  installMessage();
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
        {
          document.getElementById(domnodes[x]).innerHTML = "<h1>"+value+"</h1>";
          document.getElementById("badge"+domnodes[x]).innerHTML = "<i class='icon-link-2'></i>";
        }
      }
    }
  }
}

// Closure for adding listeners to every node when retrieving info from LocalStorage
function createLocalStorageCB(domnode)
{
  return function(value){
    console.log("*** METHOD LocalStorageCB: Item " + domnode + " value " + value);
    document.getElementById(domnode).innerHTML = "<h1>"+value+"</h1>"; 
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
  console.log("INVOKED FB CALLBACK")
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
  console.log("INVOKED showElement")
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
      content += "<div class='tile bg-color-orange icon'><b class='check'></b><div class='tile-content'>";
      content += "<img src='images/Firefox-" + versionNames[x] + ".png'></img></div><div class='brand'><span class='name'>";
      content += "<h4>" + versionNumbers[x] + " (" + versionNames[x] + ")</h4></span><span class='badge'> </span> </div> </div> </a>";
   }  
   content += "</div>"
   wrapper.innerHTML = content;
   document.getElementById("page-index").appendChild(wrapper);

   for (var x in versionNames)
   {
     var hr = document.getElementById("link"+versionNames[x]);
     hr.onclick = makeShowElementCallback(versionNames[x]);
   }
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

  content = "<div class='page-region-content'>";
  for (var x in identities)
  {
    content+= "<a href='" +  anchors[x]  + "' target='_blank'>";
    content+= "<div class='tile ";
    if (identities[x].substring(0, 8) == "blockers")
     content += "bg-color-" + color + "Dark icon'><b class='check'></b>";
    else
     content += "bg-color-" + color + " icon'><b class='check'></b>";
    content+= "<div class='tile-content' id='" + identities[x] + "'></div>";
    content+= "<div class='brand'><span class='name'>" + version + " " + names[x]
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

function installMessage()
{
  if (isChrome)
   {
     if (chrome.app.isInstalled) {
       document.getElementById('installText').innerHTML = "You have already installed this app to Chrome";
       document.getElementById('installLink').style.display = 'none';
     }
     else
     {
       document.getElementById('installText').innerHTML = "Click on the icon above to install it as a Chrome App";
     }
   }
   else if (navigator.mozApps != null)
   {
     if (navigator.mozApps.checkInstalled(manifestUrl)) {
       document.getElementById('installText').innerHTML = "You have already installed this app to Firefox as a Packaged App. ";
       document.getElementById('installLink').style.display = 'none';
     }
     else
     {
       document.getElementById('installText').innerHTML = "Click on the icon above to install it as a Chrome App. You can also add a Bookmark or include it in your FFOS Homescreen.";
     }
   }

}

function install()
{
  if (isChrome)
  { 
    console.log("Using Chrome");
    chrome.webstore.install("https://chrome.google.com/webstore/detail/mbpjgoggfhknoknpdobcmglakceigodh",
                            function(){alert("FirefoxOS Tracker Successfully installed");installMessage();},
                            function(error){alert("App could not be installed " + error);});
  }
  else if (navigator.mozApps != null)
  {
    console.log("Using Firefox")
    // This URL must be a full url.
    var req = navigator.mozApps.installPackage(manifestUrl);
    req.onsuccess = function() {
      alert("FirefoxOS Tracker Successfully installed");
      installMessage();
    };
    req.onerror = function() {
      alert("App could not be installed " + this.error.name);
    };
  }
  else
  {
    alert("Your Browser does")
  }
}