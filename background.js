var domains = [];
var domainWindow = [];


var SortHelper = {};

SortHelper.getURLParser = function (tab) {
  /*
    var parser = document.createElement('a');
    parser.href = "http://example.com:3000/pathname/?search=test#hash";

    parser.protocol; // => "http:"
    parser.hostname; // => "example.com"
    parser.port;     // => "3000"
    parser.pathname; // => "/pathname/"
    parser.search;   // => "?search=test"
    parser.hash;     // => "#hash"
    parser.host;     // => "example.com:3000"
  */

  parser = new URL(tab.url);
  parser.rootDomain = parser.hostname.split('.').slice(-2).join('.'); // www.pankeshang.com => pankeshang.com
  return parser;
};


SortHelper.sortBasedOnHost = function(tabs) {

  var resultTabs = [];

  // get domains
  var hosts = new Set();
  for (var i=0; i<tabs.length; i++) {
    hosts.add(tabs[i].parser.host);
  }

  // sort domains
  var sortedHosts = Array.from(hosts).sort();

  // sort tabs based on root domains
  for (let index in sortedHosts) {
    var host = sortedHosts[index];
    var _filterFunc = function(tab) {
      return tab.parser.host === host;
    };
    var tabsWithSameHost = tabs.filter(_filterFunc);
    
    for (let index in tabsWithSameHost) {
      var tab = tabsWithSameHost[index];
      resultTabs.push(tab);
    }
  }
  return resultTabs;

};

SortHelper.sortBasedOnDomain = function (tabs) {
  var resultTabs = [];

  // get domains
  var domains = new Set();
  for (var i=0; i<tabs.length; i++) {
    domains.add(tabs[i].parser.hostname);
  }

  // sort domains
  var sortedDomains = Array.from(domains).sort();

  // sort tabs based on root domains
  for (let index in sortedDomains) {
    var domain = sortedDomains[index];
    var _filterFunc = function(tab) {
      return tab.parser.hostname === domain;
    };
    var tabsWithSameDomain = tabs.filter(_filterFunc);
    
    var result = SortHelper.sortBasedOnHost(tabsWithSameDomain);

    for (let index in result) {
      var tab = result[index];
      resultTabs.push(tab);
    }
      
  }
  return resultTabs;

};

SortHelper.sortBasedOnRootDomain = function (tabs) {

  var resultTabs = [];

  // get root domains
  var rootDomains = new Set();
  for (var i=0; i<tabs.length; i++) {
    rootDomains.add(tabs[i].parser.rootDomain);
  }

  // sort root domains
  var sortedRootDomains = Array.from(rootDomains).sort();
  // sort tabs based on root domains
  for (let index in sortedRootDomains) {
    
    rootDomain = sortedRootDomains[index];

    var _filterFunc = function(tab) {
      return tab.parser.rootDomain === rootDomain;
    };
    var tabsWithSameRootDomain = tabs.filter(_filterFunc);
    
    var result = SortHelper.sortBasedOnDomain(tabsWithSameRootDomain);

    for (let index in result) {
      var tab = result[index];
      resultTabs.push(tab);
    }
  }

  return resultTabs;
};

SortHelper.sortTabs = function (tabs) {
  /*
  sort based on:
  1. root domain  (cool.pankeshang.com => pankeshang.com)
  2. domain       (cool.pankeshang.com)
  3. host         (cool.pankeshang.com:3000)
  */

  // get parsers
  for(var i=0; i<tabs.length; i++) {
    tabs[i].parser = SortHelper.getURLParser(tabs[i]);
  }

  var result = SortHelper.sortBasedOnRootDomain(tabs);

  for (let index in result) {
    var tab = result[index];
      chrome.tabs.move(tab.id, {index: parseInt(index, 10)});
  }
  
};

//Second
function PerformSortTab() {
  chrome.tabs.query({},
    function(tabs) {
      SortHelper.sortTabs(tabs);
    });
};

//First
chrome.action.onClicked.addListener(PerformSortTab);


// Command listener
chrome.commands.onCommand.addListener(function(command) {
    PerformSortTab();
});