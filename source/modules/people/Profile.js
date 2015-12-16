'use strict';
/*eslint no-unused-vars: 0*/

function toTitleCase(str)
{
   if(str)
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var React = require('react'),
    CheckImage = require('../check-image/CheckImage.js'),
    EmailMasks = require('../email-masks/EmailMasks.js'),

// Profile Module
//--------------------------------------------------------------------------------------
    Profile = React.createClass({
        //function to append markup if condition is true
        appendIfTrue: function(base, toAppend, test) {
            if (!test) { return base; }
            return [base].concat(toAppend).join(' ');
        },
        getInitialState: function(){
          //set profile image and building Map url states
          return {
            profileImage: '',
            buildingMapCoord: ''
          }
        },
        componentWillMount: function(){
            var profileID = this.props.profile.data.personId;
            var buildingID = this.props.profile.data.buildingNumber;
            var profileImageURL = 'https://findanexpert.unimelb.edu.au/pictures/thumbnail'+profileID+'picture';
            var profile = this;
            //Check if image exists, else use placeholder image
            CheckImage(profileImageURL).then(
                function(url){
                  profile.setState({profileImage: profileImageURL })
                }).catch(function(url){
                  profile.setState({profileImage: "https://staff.unimelb.edu.au/directory/images/placeholder.png"})
                })

            //ajax map API
            //define map API URL
            var mapAPI = "https://api.its.unimelb.edu.au/services/maps?service=WFS&version=1.0&outputFormat=json&request=GetFeature&maxFeatures=2000&typeName=uom:by-building&viewparams=bldgid:" + buildingID;
            //ajax and grab json object
            $.getJSON(mapAPI)
            .done(function( data ) {
                if(data.features[0].geometry.coordinates){ //set google map coordinates
                    profile.setState({buildingMapCoord: data.features[0].geometry.coordinates})
                }
            });
        },
        render: function() { //render profile
            var profileData = this.props.profile.data, //grab profile data from property
                profileName = profileData.givenName +" "+ profileData.familyName,
                profilePhotoStyle = {backgroundImage: 'url('+ this.state.profileImage +')'},
                buildingMapURL = "http://www.google.com.au/maps?hl=en&q="+this.state.buildingMapCoord[0]+","+this.state.buildingMapCoord[1];
            return (
              <div>
                <header className="profile-header">
                    <div className="profile-header__summary">
                        <div className="profile-header__photo" style={profilePhotoStyle}></div>
                        <h1>{toTitleCase(profileName)}</h1>
                        <p><em>{toTitleCase(profileData.position)}</em></p>
                        <p>{toTitleCase(profileData.departmentName)}</p>
                    </div>
                    <div className="profile-header__info">
                        <ul className="profile-header__contact">
                            {profileData.phone ?
                                <li>
                                  <span className="icon--hide-label" data-icon="phone">Phone number</span>
                                  <a href={"tel:"+profileData.phone}> {profileData.phone}</a>
                                </li>
                            :''}
                            {profileData.mobile ?
                                <li>
                                  <span className="icon--hide-label" data-icon="smartphone">Mobile number</span>
                                  <a href={"tel:"+profileData.mobile}> {profileData.mobile}</a>
                                </li>
                            :''}
                            {profileData.email ?
                                <li>
                                  <span className="icon--hide-label" data-icon="mail">Email</span>
                                  <a href={"mailto:"+EmailMasks(profileData.email)}> {EmailMasks(profileData.email)}</a>
                                </li>
                            :''}
                            {profileData.faeExists === 'Y' ?
                                <li>
                                  <span data-icon="profile"></span> <a href={"http://findanexpert.unimelb.edu.au/display/person"+profileData.personId}>Find an Expert profile</a>
                                </li>
                            :''}
                        </ul>
                        <ul className="profile-header__location">
                          {/* display location information */}
                          {profileData.locationRoom ? <li><em>Room:</em> {profileData.locationRoom}</li> :''}
                          {profileData.locationFloor ? <li><em>Floor:</em> {profileData.locationFloor}</li> :''}
                          {profileData.buildingNumber ? <li><em>Building:</em> <a href={buildingMapURL}>{profileData.workLocation}</a></li> : ''}
                          {profileData.locationCampus ? <li><em>Campus:</em> {profileData.locationCampus}</li> :''}
                        </ul>
                    </div>
                </header>
                <PeopleList name="Supervisor" people={profileData.supervisor} />
                <PeopleList name="Direct Reports" people={profileData.reports} />
                <PeopleList name="Colleagues" people={profileData.colleagues} />
              </div>
            );
        }
    }),

// PeopleList Module
//--------------------------------------------------------------------------------------

    PeopleList = React.createClass({
        render: function() {
            return (
              <div>
                  { this.props.people ? //check if people list is not empty
                        this.props.people.constructor === Array ?
                            this.props.people.length > 1 ?
                              <h2>{this.props.name} ({this.props.people.length})</h2>
                           :  <h2>{this.props.name}</h2>
                         : <h2>{this.props.name}</h2>
                    : ''
                  }

                  <ol className='search-results'>
                  {this.props.people ? //check if people list is not empty
                    this.props.people.constructor === Array ? //check if list contains more than one person (array)
                      this.props.people.map(function(person, i) { //if array, process each object
                          return <Person personData={person} key={i} />
                      })
                    :<Person personData={this.props.people} />
                  : ''
                  }
                  </ol>
              </div>
            );
        }
    }),

// Person Module
//--------------------------------------------------------------------------------------

    Person = React.createClass({
        getInitialState: function(){
          return {
            profileImage: '' //set profile image state
          }
        },
        componentWillMount: function(){
          //Check if image exists, else use placeholder image
          var profileID = this.props.personData.personId;
          var profileImageURL = 'https://findanexpert.unimelb.edu.au/pictures/thumbnail'+profileID+'picture';
          var person = this;
          CheckImage(profileImageURL).then(
              function(url){
                person.setState({profileImage: profileImageURL })
              }).catch(function(url){
                person.setState({profileImage: "https://staff.unimelb.edu.au/directory/images/placeholder.png"})
              })
        },
        render: function() {
            var personData = this.props.personData;
            // set div background image style as object
            var profilePhotoStyle = {backgroundImage: 'url('+ this.state.profileImage +')'};
            //get current URL
            var profileUrl = '//' + location.host + location.pathname+"?id="+personData.personId;
            //return person listing markup
            return (
                <li className="person">
                    <div className="person__photo" style={profilePhotoStyle}></div>
                    <div className="person__info">
                        <div className="person__profile">
                            <h3><a href={profileUrl} data-bound="true">{toTitleCase(personData.givenName)} {toTitleCase(personData.familyName)}</a></h3>
                            <p><em>{toTitleCase(personData.position)}</em></p><p>{toTitleCase(personData.departmentName)}</p>
                        </div>
                        <div className="person__contact">
                            {personData.phone ? <p className="person__phone"><a href={"tel:"+personData.phone}>{personData.phone}</a></p>:''}
                            {personData.email ?  <p className="person__email"><a href={"mailto:"+EmailMasks(personData.email)}>{EmailMasks(personData.email)}</a></p>:''}
                        </div>
                    </div>
                </li>
            );
        }
    })

module.exports = Profile;
