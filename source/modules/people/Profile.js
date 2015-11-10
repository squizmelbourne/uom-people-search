'use strict';
/*eslint no-unused-vars: 0*/

var React = require('react'),
    CheckImage = require('../check-image/CheckImage.js'),

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
        render: function() {
            var profileData = this.props.profile.data; //grab profile data from property

            return (
                <div>
                    <h1>{profileData.givenName}</h1>
                    <div>

                    </div>
                    <PeopleList name="Supervisor" people={profileData.supervisor} />
                    <PeopleList name="Colleagues" people={profileData.colleagues} />
                </div>
            );
        }
    }),
    PeopleList = React.createClass({
        render: function() {
            return (
              <div>
              <h3>{this.props.name}</h3>
              <ul>
              {this.props.people.constructor === Array ?
                  this.props.people.map(function(person, i) {
                      return <Person key={i} personData={person} />
                  })
              :
                  this.props.people.givenName
              }
              </ul>
              </div>
            );
        }
    }),
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
                person.setState({profileImage: <img src={profileImageURL} alt="profile" />})
              }).catch(function(url){
                person.setState({profileImage: <img src="https://staff.unimelb.edu.au/directory/images/placeholder.png" alt="profile" />})
              })
        },
        render: function() {
            var personData = this.props.personData;
            return (
                <li>
                    <div className="profile">
                        <div className="frame">
                            {this.state.profileImage}
                        </div>
                    </div>
                    <div className="details">
                        <a href="#">{personData.givenName}</a><br />
                        <em>{personData.position}</em>
                        <p>{personData.affiliation}</p>
                    </div>
                    <div className="contact">
                      <p>
                          {personData.telephone ? <div><a href='tel:{personData.telephone}'>{personData.telephone}</a><br /></div>:''}

                    </p>

                    </div>
                </li>
            );
        }
    })


module.exports = Profile;
