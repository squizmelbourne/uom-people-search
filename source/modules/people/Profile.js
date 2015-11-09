'use strict';
/*eslint no-unused-vars: 0*/

var React = require('react'),

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
        checkImage: function(src, imgload, imgfail) {
            var img = new Image();
            img.onload = imgload;
            img.onerror = imgfail;
            img.src = src;
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
              <h3>this.props.name</h3>
              <ul>
              {this.props.people.constructor === Array ?
                  this.props.people.map(function(person) {
                      return <Person personData={person} />
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
        render: function() {
            var personData = this.props.personData;
            return (
                <li>
                    <div className="profile">
                        <div className="frame">

                            <img alt={personData.givenName} src="/assets/images/people-search/placeholder.png" />
                        </div>
                    </div>
                    <div className="details">
                        <a href="#">{personData.givenName}</a><br />
                        <em>{personData.position}</em>
                        <p>{personData.affiliation}</p>
                    </div>
                    <div className="contact">
                      <p>
                          { personData.telephone ? <a href='{personData.telephone}'>{personData.telephone}</a> : "" }

                      </p>
                    </div>
                </li>
            );
        }
    })


module.exports = Profile;
