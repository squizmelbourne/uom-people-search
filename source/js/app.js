'use strict';

// function to grab query string
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var React = require('react'),
    Profile = require('modules/people/Profile.js'),
    requestProfileId = getParameterByName('id'),
    profileData = {};

(function($) {
    //define staff API URL
    var staffAPI = "http://staff.unimelb.edu.au/dev/people-search-new/staff-details-api-call?id=" + requestProfileId;
    //ajax and grab json object

    $.getJSON( staffAPI, {
      format: "json"
    })
    .done(function( data ) {
      profileData = data;
      //render react profile component
      console.log(profileData);
      $('.profile-div').each(function(){
          var div = this,
              profile = React.createElement( Profile, { profile: profileData});
              React.render(profile, div);
      });
      window.UOMbind('icons');
    });

})(jQuery);
