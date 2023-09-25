// reqNotification.js
const { serializeError /*, deserializeError */ } = require("serialize-error");
const Sentry = require("@sentry/node");

const UserFields = ["uuid", "username", "email", "languageCode"];
// {array}
// a subset of User fields that we want to include in our notification data.

/**
 * @class
 * @param {object} req
 */
class ABNotification {
   constructor(req) {
      this.req = req;
   }

   /**
    * @param {string} domain Normally "builder" or "developer"
    * @param {Error|Error[]|string|object} error
    * @param {object} [info={}]
    */
   async notify(domain, error, info = {}) {
      var serError = this.stringifyErrors(error);

      var errStack = new Error("just getting my stack");

      info.tenantID = info.tenantID || this.req ? this.req._tenantID : "??";
      info.jobID = info.jobID || this.req ? this.req.jobID : "??";
      info.requestID = info.requestID || this.req ? this.req.requestID : "??";
      info.serviceKey = this.req ? this.req.serviceKey : "??";
      info.user = {};
      if (this.req._user) {
         UserFields.forEach((k) => {
            if (typeof this.req._user[k] == "undefined") {
               info.user[k] = "??";
               return;
            }
            info.user[k] = this.req._user[k];
         });
      }

      if (info.AB) {
         var AB = info.AB;
         delete info.AB;
         info = AB._notifyInfo(info);
      }
      var errorData = {
         domain,
         error: serError,
         info,
         callStack: errStack.stack,
      };

      // Also log to the console
      if (typeof this.req.log == "function") {
         this.req.log(errorData);
      } else if (error instanceof Error) {
         console.error(errorData);
      } else {
         console.log(errorData);
      }
      const sentryError =
         error instanceof Error
            ? error
            : typeof error == "string"
            ? new Error(error)
            : serError;
      /**
       * @const sentryError {Error|string} error to send to sentry
       * If we recieved an Error use that, if we recieved a string
       * ceate an Error from that. For more complex inputs use the
       * result of stringifyErrors.
       */
      Sentry.captureException(sentryError, (scope) => {
         // Consider builder errors as warnings
         if (domain == "builder") scope.setLevel("warning");
         scope.setContext("info", info);
         scope.setUser(info.user);
         scope.setTag("domain", domain);
         scope.setTag("tenant", info?.tenantID);
      });
   }

   stringifyErrors(param) {
      if (param instanceof Error) {
         return serializeError(param);
      }

      // traverse given data structure:
      if (Array.isArray(param)) {
         for (var i = 0; i < param.length; i++) {
            param[i] = this.stringifyErrors(param[i]);
         }
      } else if (param && typeof param === "object") {
         // maybe one of my Keys are an Error Object:
         Object.keys(param).forEach((k) => {
            param[k] = this.stringifyErrors(param[k]);
         });
      }

      return param;
   }
}

module.exports = function (...params) {
   return new ABNotification(...params);
};
