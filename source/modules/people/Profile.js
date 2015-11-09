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
                        <em>Head Of School-Historical &amp; Philosophical Studies</em>
                    </div>
                    <div className="contact">
                      <p><a href="tel:03 83446886">03 83446886</a><br /><a href="mailto:tburnard@unimelb.edu.au">tburnard@unimelb.edu.au</a>
                    </p>

                    </div>
                </li>
            );
        }
    })


module.exports = Profile;
