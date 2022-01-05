#!/bin/bash
now=$(date +"%Y%m%d-%H%M%s")
 tar czf cablix-p-$now.tgz \
 *.js \
 *.pl \
 config/ \
 db/  \
 middleware/  \
 models/ \
 public/ \
 RackElements/ \
 routes/  \
 views/ \
 package.json \
 README.md
