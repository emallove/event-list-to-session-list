/**
 * Get JSON data from a URL using XMLHttpRequest() and promises
 */
let getJSON = url => {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('get', url, true); // asynchronous
    xhr.responseType = 'json';
    xhr.onload = () => {
      if (xhr.status === 200) resolve(xhr.response); // then
      else reject(xhr.status); // catch
    };
    xhr.send();
  });
};

getJSON('https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=6c868c7f46556d2012e08686ee5b')
  .then(p => {
  	
    q = p["events"];
    h = {};
    var vid = "";
    
    // Gather all events by vistorId
    for (var i = 0; i < q.length; i++) {

				// console.log("obj = " + obj);
        vid = q[i]["visitorId"];
        delete q[i]["visitorId"];
        if (! h[vid]) {
          h[vid] = [];
        }
        h[vid].push(q[i]);
    }
    
    // Sort events by timestamp
    for (var vid in h) {

      // sort list of timestamps per vid
      h[vid].sort(function (a, b) {
          return (a["timestamp"] > b["timestamp"]);
      });
    }
    
    // Collate events into sessions ...
    var sessions = { "sessionsByUser" : {} };
		var s = sessions["sessionsByUser"];
    
    for (var vid in h) {
    
    	var min_per_session = 10;
    	var prev_timestamp = 0;
      var curr_timestamp = Infinity;
      var startTime = 0;
      var curr_session = {};
      var pages = [];
			var url;

    	for (var i = 0; i < h[vid].length; i++) {

				// Initialize a new list of sessions for this user
				if (! s[vid]) {
        	s[vid] = [];
          curr_session = {};
          pages = [];
        }

				url = h[vid][i]["url"];
      	curr_timestamp = h[vid][i]["timestamp"];
        
        // If we don't have a start time, make the current timestamp the start
        // of the session
        if (! curr_session["startTime"]) {
        	startTime = curr_timestamp;
          prev_timestamp = curr_timestamp;
        	curr_session["startTime"] = curr_timestamp;
          pages = [];
        }

        // New session
    		if (((curr_timestamp - prev_timestamp) / (1000)) > (60 * min_per_session))  {

				  // Record the previous session
        	curr_session["pages"] = pages;
        	s[vid].push(curr_session);
          
          // Start the new session
        	curr_session = {};
          curr_session["startTime"] = curr_timestamp;
          curr_session["duration"] = 0;
          pages = [];
          pages.push(url);

				// Continued session
        } else {
			
      		pages.push(url);
          curr_session["duration"] = prev_timestamp - startTime;

        }
        prev_timestamp = curr_timestamp;
    	}
      
      console.log(sessions);
    }
    
   (async () => {
      const rawResponse = await fetch('https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=6c868c7f46556d2012e08686ee5b', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessions)
      });
      const content = await rawResponse.json();
    
      console.log(content);
    })();            

  });
