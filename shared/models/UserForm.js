/**
 * UserForm.js
 * Manages the UserForm Requests by different Process Instance tasks.
 *
 * A UserForm is a request for a User to View some data, and respond to it.
 */
const AB = require("ab-utils");

module.exports = {
   table_name: "process_userform",
   attributes: {
      uuid: { type: "uuid", required: true },

      name: "string",
      // {string} : a name for this form, probably the Task Definition.name

      status: "string",
      // {string} : "pending", "processed"
      //   "pending" : still in Queue waiting for someone to respond
      //   "processed" : a User has responded to this Form

      process: "string",
      // process: {
      //    model: "ProcessInstance"
      // },
      // {string} : processInstance.uuid of the instance that created this request

      ui: "string",
      options: "string",

      response: "string",
      // {string} : should match one of the options.id values defined above
      //   this is where we store the Form response

      //
      // A UserForm can be related to Users in 2 ways:
      // Role: Anyone with a certain Role can respond,
      // User: specific specified Users can respond.

      roles: {
         collection: "Role",
         via: "userForms"
      },

      users: {
         collection: "User",
         via: "userForms"
      }
   },
   beforeCreate: function(values, cb) {
      if (!values.uuid) {
         values.uuid = AB.uuid();
      }

      cb();
   }
};
