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

if(requestProfileId) { //if id is not empty, display loading spinner
    $(".profile-div").html('<div class="loading"><span>Loading...</span><div class="cube"></div></div>');
    //define staff API URL
    var staffAPI = "https://staff.unimelb.edu.au/staff-details-api-call?id=" + requestProfileId;
    //ajax and grab json object

    $.getJSON( staffAPI, {
      format: "json"
    })
    .done(function( data ) {
      profileData = data;
      //render react profile component
      if(profileData.data){
          $('.profile-div').each(function(){
              var div = this,
                  profile = React.createElement( Profile, { profile: profileData});
                  React.render(profile, div);
          });
          window.UOMbind('icons');
      }
      else { //if no data is returned, display something went wrong message.
        $(".profile-div").html('  <section class="alt"><h2 class="title">Something went wrong</h2><p class="center">We are sorry, but something just went wrong.</p><p class="center"><a class="button-hero-reverse" href="/">Go back to homepage</a></p></section><section><figure class="full-width"><img alt="Something is broken. Barry swears it wasn’t him." src="http://web.unimelb.edu.au/assets/images/500.jpg" /><figcaption>Something is broken. Barry swears it wasn’t him.</figcaption></figure></section>');
      }

    })
    .fail(function() { //if JSON failed, display something went wrong message.
        $(".profile-div").html('  <section class="alt"><h2 class="title">Something went wrong</h2><p class="center">We are sorry, but something just went wrong.</p><p class="center"><a class="button-hero-reverse" href="/">Go back to homepage</a></p></section><section><figure class="full-width"><img alt="Something is broken. Barry swears it wasn’t him." src="http://web.unimelb.edu.au/assets/images/500.jpg" /><figcaption>Something is broken. Barry swears it wasn’t him.</figcaption></figure></section>');
    })
}
