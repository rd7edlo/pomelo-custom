/**
 * Filter for rpc log.
 * Reject rpc request when toobusy
 */
var rpcLogger = require('pomelo-logger').getLogger('rpc-log', __filename);
var toobusy = null;

var DEFAULT_MAXLAG = 70;

module.exports = function(maxLag) {
  return new Filter(maxLag || DEFAULT_MAXLAG);
};

var Filter = function(maxLag) {
  try {
    toobusy = require('toobusy-js');
  } catch(e) {
    console.error( e );
  }
  if(!!toobusy) {
    toobusy.maxLag(maxLag);
    // toobusy.interval(250);
  }
};

Filter.prototype.name = 'toobusy';

/**
 * Before filter for rpc
 */
 Filter.prototype.before = function(serverId, msg, opts, next) {
  opts = opts||{};
  if (!!toobusy && toobusy()) {
    console.error( "Server too busy for rpc request" );
    rpcLogger.warn('Server too busy for rpc request, serverId:' + serverId + ' msg: ' + msg);
    var err =  new Error('Backend server ' + serverId + ' is too busy now!');
    err.code = 500;
    next(err);
  } else {
    next();
  }
};
