var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var debug = require('debug')('lib:daily');
var nconf = require('nconf');
 
var mongo = require('./mongo');

function byDayStats(req) {
    /* it is clear this is not they way, but this is just legacy alpha */
    var what = _.get(req.params, 'what');
    var queryMap = {
        'basicReport': [
            { 
                'name': 'version2',
                'column': nconf.get('schema').phantom,
                'timevar': '$requestTime',
                'filter': { "version" : 2}, // { requestTime : { $gt: new Date('2016-12-08') }},
                'aggext': { }
            },
            { 
                'name': 'servers',
                'column': nconf.get('schema').phantom,
                'timevar': '$requestTime',
                'filter': { }, // { requestTime : { $gt: new Date('2016-12-08') }},
                'aggext': { R: "$Server" }
            },
            { 
                'name': 'tasks',
                'column': nconf.get('schema').phantom,
                'timevar': '$requestTime',
                'filter': { }, // { requestTime : { $gt: new Date('2016-12-08') }},
                'aggext': { P: "$promiseId" }
            },
            { 
                'name': 'subjects',
                'column': nconf.get('schema').phantom,
                'timevar': '$requestTime',
                'filter': { "target": { $exists: true} }, // { requestTime : { $gt: new Date('2016-12-08') }},
                'aggext': { S: "$subjectId" }
            },
            {
                'name': 'domains',
                'column': nconf.get('schema').phantom,
                'timevar': '$requestTime',
                'filter': {}, // { requestTime : { $gt: new Date('2016-12-08') }},
                'aggext': { D: "$domainId" }
            }
        ]
    };

    var statsMap  = queryMap[what];

    if(!statsMap) {
        debug("%s byDayStats invalid request %s", req.randomUnicode, what);
        throw new Error("Invalid request to /daily/(.*) ");
    }

    debug("%s byDayStats %s", req.randomUnicode, what);
    return dailyQuery(statsMap)
        .then(function(result) {
            return { "json": result };
        });
};

function dailyQuery(queryMap) {
    
    return Promise.map(queryMap, function(qM) {
        debug("Executing query aggregated by %j", qM.aggext);
        return mongo
            .countByDay(qM.column, qM.timevar, qM.filter, qM.aggext);
    }, { concurrency: 1} )
    .map(function(unnamed, i) {
        return _.map(unnamed, function(dateObj) {
            dateObj.name = queryMap[i].name;
            return dateObj;
        });
    })
    .then(function(layered) {
        return _.flatten(layered);
    })
    .reduce(aggregateByDate, {})
    .then(function(collection) {
        return _.orderBy(collection, function(stOb) {
            return moment(stOb.date, "YYYY-M-D");
        });
    });
};


/* invoked by Promise.reduce above */
function aggregateByDate(memo, stOb) {

    /* remind, TODO, with aggext I've to extract an additional info from the ID to the 
     * object initialization below */
    var date = [ stOb["_id"].year, stOb["_id"].month, stOb["_id"].day].join('-');

    if(_.isUndefined(memo[date]))
        memo[date] = { date: date };

    _.set(memo[date], stOb.name, stOb.count);
    return memo;
};


module.exports = {
    byDayStats: byDayStats
};
