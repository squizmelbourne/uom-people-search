# Matrix Configuration

This directory is for version control of Matrix assets, such as:

* [designs](designs): Design parse files
* [nested-assets](nested-assets): Nested design components within parse files
* [paint-layouts](paint-layouts): Paint layouts
* [asset-listings](nested-assets/asset-listings): Asset listings
* [rest](web-services/rest): REST assets, including any templates such as Handlebars templates
* [php](scripts/php): Custom PHP scripts (if not packaged as a proper Matrix package for some reason)

Usually only the parse file needs to be in here, but anything with a complex implementation should have its components under version control.