'use strict';
/*eslint no-unused-vars: 0*/

var React = require('react'),
    CheckImage = require('../check-image/CheckImage.js'),

// Profile Module
//--------------------------------------------------------------------------------------
    Profile = React.createClass({

      /*  getInitialState: function() {
            return {
                discussionGroup: this.props.discussionGroup
            };
        },*/
        appendIfTrue: function(base, toAppend, test) {
            if (!test) { return base; }
            return [base].concat(toAppend).join(' ');
        },
        getInitialState: function(){
          return {
            profileImage: ''
          }
        },
        componentWillMount: function(){
          //check whether profile image exists
          var profileID = this.props.profile.data.personID;
          var profileImageURL = 'https://findanexpert.unimelb.edu.au/pictures/thumbnail'+profileID+'picture';
          var profile = this;
          CheckImage(profileImageURL).then(
              function(url){
                profile.setState({profileImage: profileImageURL })
              }).catch(function(url){
                profile.setState({profileImage: "https://staff.unimelb.edu.au/directory/images/placeholder.png"})
              })
        },
        render: function() {
            var profileData = this.props.profile.data; //grab profile data from property
            var profileName = profileData.givenName +" "+ profileData.familyName;
            return (
              <div>
                <header className="person">
                    <div className="avatar">
                        <img alt={profileName} src={this.state.profileImage} />
                    </div>
                    <div className="detail">
                        <h1>{profileData.givenName} {profileData.familyName}</h1>
                        <p><em>{profileData.position}</em></p>
                        <p className="last">{profileData.affiliation}</p>
                        <div className="contact">
                            {profileData.telephone ?<p>
                                <span className="small" data-icon="phone" data-bound="true">
                                    <span dangerouslySetInnerHTML={{__html: '<svg class="icon" role="img"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-phone"></use></svg>'}} />
                                    <span className="icon-over"></span>
                                </span>
                                <a href="tel:{profileData.telephone}">{profileData.telephone}</a>
                            </p>:''}
                            {profileData.mobile ?<p>
                                <span className="small" data-icon="smartphone" data-bound="true">
                                    <span dangerouslySetInnerHTML={{__html: '<svg class="icon" role="img"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-smartphone"></use></svg>'}} />
                                    <span className="icon-over"></span>
                                </span>
                                <a href="tel:{profileData.mobile}">{profileData.mobile}</a>
                            </p>:''}
                            {profileData.email ?<p>
                                <span className="small" data-icon="mail" data-bound="true">
                                    <span dangerouslySetInnerHTML={{__html: '<svg class="icon" role="img"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-mail"></use></svg>'}} />
                                    <span className="icon-over"></span>
                                </span>
                                <a href="mailto:{profileData.email}">{profileData.email}</a>
                            </p>: ''}
                            {profileData.isExpert === 'Y' ?<p>
                                <span className="small" data-icon="profile" data-bound="true">
                                  <span dangerouslySetInnerHTML={{__html: '<svg class="icon" role="img"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-profile"></use></svg>'}} />
                                  <span className="icon-over"></span>
                                </span>
                                <a href="http://findanexpert.unimelb.edu.au/display/person{profileData.isExpert}">Find an Expert profile</a>
                            </p>: ''}
                        </div>
                        <div className="location">
                            <p><span className="label">Room:</span> G16</p>
                            <p><span className="label">Floor:</span> GR</p>
                            <p><span className="label">Building:</span> <a href="http://www.google.com.au/maps?hl=en&amp;q=-37.79772,144.96075">33 Lincoln Square Sth</a></p>
                            <p><span className="label">Campus:</span> Parkville</p>
                        </div>
                    </div>
                </header>
                <PeopleList name="Supervisor" people={profileData.supervisor} />
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


              {this.props.people ?
                this.props.people.constructor === Array ?
                  this.props.people.map(function(person, i) {
                      return <div><h2>this.props.name</h2><ol className='search-results'><Person key={i} personData={person} /></ol></div>
                  })
                : <div><h2>this.props.name</h2><ol className='search-results'><Person personData={this.props.people} /></ol></div>
              : ''
              }

              </div>
            );
        }
    }),

// Person Module
//--------------------------------------------------------------------------------------

    Person = React.createClass({
        getInitialState: function(){
          return {
            profileImage: ''
          }
        },
        componentWillMount: function(){
          var profileID = this.props.personData.personID;
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
            return (
                <li className="person">
                    <img alt="" className="person__photo" height="85" src={this.state.profileImage} width="85" />
                    <div className="person__info">
                        <div className="person__profile">
                            <h3><a href="#" data-bound="true">{personData.givenName} {personData.additionalName} {personData.familyName}</a></h3>
                            <p><em>{personData.position}</em></p><p>{personData.affiliation}</p>
                        </div>
                        <div className="person__contact">
                            {personData.telephone ? <p className="person__phone"><a href="tel:{personData.telephone}">{personData.telephone}</a></p>:''}
                            {personData.email ?  <p className="person__email"><a href="mailto:{personData.email}">{personData.email}</a></p>:''}
                        </div>
                    </div>
                </li>
            );
        }
    })

module.exports = Profile;
