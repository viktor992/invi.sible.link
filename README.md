# toolchain command reference

This is toolchain compsed by many small tools. The goal has been reduce 1 functionality per tool. below, or on the [website](https://invi.sible.link) you can find more contextual details

### Installation

clone the repository, `npm install`, have mongodb running on localhost.
There are two kind of scripts: listening services (they listen via HTTP and execute REST commands) and standalone scripts

## listening services

on the **command and control** server:

    npm run storyteller
    npm run vigile

special case, when there is a campaign to be managed:

    npm run social-pressure

on the vantage point:

    npm run exposer

## standalone scripts

one shot commands 

    DEBUG=*  bin/directionTool.js --csv ../amtrex/culture-list.csv --taskName culture

scheduled execution (crontab) on the command and control:


scheduled execution (crontab) on the vantage point:




# Below, some alpha stage notes:

## invi.sible.link architecture design

**storyteller**: web publisher of lists and results

There are different components because they might run in separated
machines, and because some of them are HTTP servers, other are cron-based
exectuion pipelines.

Additionally, to replicate the advocacy declined for CodingRights 
experiments, this might imply different boxes, management, etc.

### storyteller

**Runs in the public web**, 7000

 * publish the results
 * publish the project work-o-meter
 * report to vigile on the access stats
 * implement basic API
 * fetch the data from machete

### scheduled collectors 

Some high level data and visualisation takes sense only if computed separately.
I was thinking to generalize this sequence of tasks through the toll named
`machete` but it is proven an unproper planning, because the reduction process
changes too much to be generalized.

Therefore, the two scheduled execution currently implemented are:

### statusChecker

It look at the API `/api/v1/system/info` every hour, and keep track of the
load average, disk usage, memorized object in every machine contacted.

### campaingChecker

It look through all the Vantage Point to get information over the subject
of a specific investigation, and update a daily report on the subject.


### vigile

**Runs in one admin controller machine**, access restricted, 7200

execute activities in user time, no scheduled tasks

  * provide direction to chopsticks, it is where test list are stored
  * receive all the results of every promises resolved (choptstick, machete, socialpressure)
  * receive all the anomalies reported by all the components
  * provide stats for the admin on what is happening
  * is managed by the adminstrators and only by them

### chopsticks

**Runs on the vantage point**

perform web connection, is a pipeline, can be run in parallel, scheduled,
it constantly execute itself and look for operation to do.

composition pipeline:
  retriveLists,
    phantom | thug,
    (phantomNavigator?)
    phantomCleaner | thugCleaner,
    reportAnomalies,
    fullifyPromises,
    mongo


### exposer

**Runs where chopstick run**, 7300

expose via API in a raw version what the chopsticks exectutions, can't
be performed by chopstick itself because this is a webserver and chopstick
has different execution pattern.

### socialpressure

**Runs whenever**

Tooks input from scheduled resuls, generate output for the social media and
contains the logic to automatize activities

# How to setup a Vantage Point

```
git clone git@github.com:vecna/invi.sible.link.git
mkdir bin 
cd bin
ln -s ../invi.sible.link/bin/ISL-scheduled 

crontab -e

*/2 * * * * bin/ISL-scheduled --task chopsticks
```

## ISL-scheduled

```
bin/ISL-scheduled --task campaign --campaign Brasil --config config/brlocal.json --taskName Brasil
```

    * campaign: is looked in the config/brlocal as the campaign selector
    * taskName: is saved in the db (evidences and surface) field `task` used as selector in `/api/v1/mostUniqueTrackers/$taskName`
