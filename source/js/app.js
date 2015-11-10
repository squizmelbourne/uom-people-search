'use strict';

var React = require('react'),
    Profile = require('modules/people/Profile.js'),

    //this array will be fetched from a JSAPI call when that is integrated
    profileData = {
        "data" : {
          "givenName" : "MICHAEL",
          "additionalName" : null,
          "familyName" : "LO",
          "preferredName" : "MICHAEL",
          "honorificPrefix" : "MR",
          "jobTitle" : "INTEGRATION DESIGNER",
          "peopleGroup" : "Professional Continuing",
          "affiliation" : "Project Services",
          "memberOf" : null,
          "locationCampus" : null,
          "workLocation" : null,
          "buildingNumber" : null,
          "locationFloor" : null,
          "locationRoom" : null,
          "email" : "as-testsupport@unimelb.edu.au",
          "isExpert" : "N",
          "supervisor" : {
            "givenName" : "HANS",
            "additionalName" : "TOMMY",
            "familyName" : "HOEGLUND",
            "preferredName" : "TOMMY",
            "honorificPrefix" : "MR",
            "position" : "MANAGER, IT SYSTEMS INTEGRATION",
            "affiliation" : "Professional Continuing",
            "telephone" : [ "+61390355806" ],
            "mobile" : [ "0414967502" ],
            "email" : [ "as-testsupport@unimelb.edu.au" ],
            "personID" : "079181"
          },
          "colleagues" : [ {
            "givenName" : "GAGANDEEP",
            "additionalName" : null,
            "familyName" : "SINGH",
            "preferredName" : "GAGANDEEP SINGH",
            "honorificPrefix" : "MR",
            "position" : "INTEGRATION DEVELOPER",
            "affiliation" : "Professional Continuing",
            "email" : [ "as-testsupport@unimelb.edu.au" ],
            "personID" : "57084"
          }, {
            "givenName" : "MANEESHA",
            "additionalName" : null,
            "familyName" : "MANI",
            "preferredName" : "MANEESHA",
            "honorificPrefix" : "MRS",
            "position" : "INTEGRATION DEVELOPER",
            "affiliation" : "Professional Continuing",
            "telephone" : [ "+61390355196" ],
            "email" : [ "as-testsupport@unimelb.edu.au" ],
            "personID" : "080442"
          }, {
            "givenName" : "ALIAKBAR",
            "additionalName" : null,
            "familyName" : "VOHRA",
            "preferredName" : null,
            "honorificPrefix" : "MR",
            "position" : null,
            "affiliation" : "Non Payroll",
            "email" : [ "as-testsupport@unimelb.edu.au" ],
            "personID" : "111538"
          } ]
        }
      };

//instantiating top level components
$('.profile').each(function(){
    var div         = this,
        profile = React.createElement( Profile, { profile: profileData});

    React.render(profile, div);


});
