
var _ = require('lodash'),
    Promise = require('bluebird'),
    debug = require('debug')('plugin.jsonLoad'),
    moment = require('moment'),
    importer = require('../lib/importer'),
    dirToJson = require('dir-to-json');


module.exports = function(datainput) {

    return new Promise.map(datainput.source, function(siteEntry) {
        return {
            phantomFile: siteEntry._ls_dir.location + siteEntry._ls_dir.timeString + '.json',
            logFile : siteEntry._ls_dir.location + 'executions.log'
        };
    })
    .then(function(fileEntries) {
        debug("Here is the possiblilty to filter the %d files (not implemented)",
        _.size(fileEntries));
        return fileEntries;
    })
    .map(importer.importLog)
    .map(importer.importPhantput)
    .then(function(fileEntries) {

        return _.reduce(fileEntries, function(memo, jFE) {

            if (_.isUndefined(jFE.fetchInfo) || _.isUndefined(jFE.rr)) {
                debug("Incomplete content from %s (or missing log!): loading skipped", jFE.log);
                return memo;
            }
            memo.push({
                rr: jFE.rr,
                stats: importer.computeStats(jFE.rr),
                phantomFile: jFE.phantomFile,
                fetchInfo: jFE.fetchInfo
            });
            return memo;
        }, []);
    })
    .then(function(scanData) {
        return {
            companies: datainput.companies,
            source: datainput.source,
            data: scanData,
            stats: datainput.stats
        }
    })
};

module.exports.argv = {
    'json.source': {
        nargs: 1,
        type: 'string',
        default: 'tempdump',
        desc: 'Read URL directories from this directory.'
    },
    'json.detail': {
        nargs: 1,
        type: 'string',
        default: null,
        desc: 'Specify the sub-directory [default: now(YYMMDD)]'
    },
    'json.day': {
        nargs: 1,
        type: 'string',
        default: "0",
        desc: 'Day in the past to look at.'
    },
    'json.sitefilter': {
        nargs: 1,
        type: 'string',
        default: "",
        desc: 'Filter string for file (e.g. "vice".)'
    }
};

/*

  This is (Edit: WAS)
  an interesting double check, but is bad that urlops is not providing
  all these info in the pipeline for good, ignoring recursive operationg like this.
  maybe this can be reused for a different source of input , urlops become
  "confInput" and this "checkDir" and they both produce in the envelope "source"

var recursiveLook = function(objectWithChild, basePath, siteFilter)
{
    var p = objectWithChild.path,
        nextP = ( (p.split("/").length - 1) > 1) ? (basePath + "/" + p) : basePath,
        retVal = "";

    if (objectWithChild.type === "file") {
        if (_.endsWith(objectWithChild.name, '.json')) {
            if (siteFilter !== "") {
                if (nextP.indexOf(siteFilter) !== -1) {
                    debug("sitefilter %s in %s", siteFilter, objectWithChild.name);
                    retVal += nextP + ",";
                } else {
                    debug ("Ignored website path %s because has not the pattern %s", nextP, siteFilter);
                }
            }
            else  {
                retVal += nextP + ",";
            }
        }
    } else { // is a directory, then, recursion
        _.each(objectWithChild.children, function(elem) {
            retVal += recursiveLook(elem, nextP, siteFilter) + ",";
        });
    }
    return retVal;
};


    if(process.env.JSON_DETAILS) {
      whenWant = process.env.JSON_DETAILS;
      debug("Imported option --json.detail %s", whenWant);
    } else if(process.env.JSON_DAY !== "0") {
      whenWant = moment(whenWant-(process.env.JSON_DAY*24*3600000)).format('YYMMDD');
      debug("Imported option --json.day %s", whenWant);
    }

    var sourceDir = process.env.JSON_SOURCE + "/" + whenWant;
    debug("Reading from directory %s", sourceDir);

        var urlMatch = function(jsonPath) {
            var hash = jsonPath.split('/')[3], retVal = false;
            _.each(datainput.source, function(siteEntry) {
                if ( _.trunc( siteEntry._ls_links[0]._ls_id_hash,
                                { length: 6, omission: '' }) === hash) {
                    retVal = true;
                }
            });
            return retVal;
        },
            whenWant = moment();


    --- pipeline

    return dirToJson( sourceDir)
        .then( function( dirTree ) {
            var jsonIoList = recursiveLook(dirTree, sourceDir, process.env.JSON_SITEFILTER)
                .split(",");
            return _.remove(jsonIoList, function(e) { return e !== ""; });
        })
        .catch( function( err ){
            throw err;
        })
        .then(function(jsonFiles) {
            debug("found %d phantom output files, filtering...", jsonFiles.length);
            return _.partition(jsonFiles, urlMatch)[0];
        })
        .tap(function(filterJF) {
            debug("The source specified let kept %d files", filterJF.length);
        })
        .then(function(jsonFiles) {
            debug("found %d phantom/JSON output files to be imported...", jsonFiles.length);
            return Promise.map(jsonFiles, importer.importJson);
        })
        .then(function(scanData) {
            return {
                companies: datainput.companies,
                source: datainput.source,
                data: scanData,
                stats: datainput.stats
            }
        })
    */