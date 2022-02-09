# cablixv2
Cablix v2 js version
This is a working version.

A web page to manage data cabling, like patches in patch pannels before to turn crazy.


Just added
- some clean in how cfg & templates are managed
- a checker, very simple, for config and data in database (mongo)

Pending
- automic index adding when creating a collection
- cfg files clean
- more template
Future

Yob/task/docs
multiple printing options

Some warm
This is not a clone & play, you need to arrage a lot of things to have this working, like a https frontend (i use ngnix), a local mongo engine, some perl (oMG) to generate license)
a process manager to restart the server inca caso of failure, i use PM2.
I not realy sure my NPM collection is complete, maybe some dependencies are not in packages.json

