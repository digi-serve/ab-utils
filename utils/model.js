/*
 * reqAB
 * prepare a default set of data/utilities for our api request.
 */
const _ = require("lodash");
const async = require("async");

module.exports = class Model {
   constructor(config, dbConn, AB) {
      this.config = _.cloneDeep(config);
      this.dbConn = dbConn;

      this.AB = AB;

      this._key = null;
      // should be set by the req.model() to the File Name of the model.

      this.pk = null;
      // pk {string}
      // the attribute.attr_name of the primary key for this model.
      // (most likely "uuid")

      // defaults:
      this.config.attributes = this.config.attributes || {};

      if (typeof this.config.site_only == "undefined") {
         this.config.site_only = false;
      }

      this._parseAttributes(this.config.attributes);

      this._lifecycle(this.config);
   }

   _lifecycle(config) {
      function passThrough(v, cb) {
         cb();
      }

      this.beforeCreate = config.beforeCreate || passThrough;
      this.afterCreate = config.afterCreate || passThrough;
   }
   /*
    * attributes()
    * allows you to search for attributes that pass a given filter.
    * @param {fn} fn
    *        (optional) filter fn() that returns true if current attribute
    *        should be returned.  or false otherwise.
    * @return {array} of {attribute} definitions.
    */
   attributes(fn) {
      if (!fn)
         fn = function() {
            return true;
         };
      var allAttributes = Object.keys(this.config.attributes).map((k) => {
         return this.config.attributes[k];
      });
      return allAttributes.filter(fn);
   }

   /*
    * _parseAttributes()
    * normalizes the provided list of attributes into a full list of obj
    * definitions.
    * For example, the original definition might be a shortened:
    *    "attribute" : "string",
    * but this will fill it out to:
    *    "attribute" : {
    *       type: "string",
    *       column_name: "attribute",
    *       attr_name: "attribute"
    *    }
    *
    * @param {obj} attributes
    *        the attribute definition object.
    */
   _parseAttributes(attributes) {
      if (attributes.createdAt == "false") attributes.createdAt = false;
      if (attributes.updatedAt == "false") attributes.updatedAt = false;

      if (typeof attributes.createdAt == "undefined" || attributes.createdAt) {
         attributes.createdAt = {
            type: "datetime",
            column_name: "createdAt",
            attr_name: "createdAt"
         };
      } else {
         delete attributes.createdAt;
      }

      if (typeof attributes.updatedAt == "undefined" || attributes.updatedAt) {
         attributes.updatedAt = {
            type: "datetime",
            column_name: "updatedAt",
            attr_name: "updatedAt"
         };
      } else {
         delete attributes.updatedAt;
      }

      for (var c in attributes) {
         if (typeof attributes[c] == "string") {
            var type = attributes[c];
            // TODO: default settings based upon type:
            // switch (type) {
            //    case "uuid":
            //       attributes[c] = { type: type };
            //       break;
            //    default:
            //       attributes[c] = { type: type };
            //       break;
            // }
            attributes[c] = { type: type };
         }

         if (!attributes[c]["column_name"]) {
            attributes[c]["column_name"] = c;
         }

         // hard code the attribute name
         attributes[c]["attr_name"] = c;

         if (attributes[c].primaryKey && attributes[c].primaryKey != "false") {
            this.pk = c;
         }
      }

      // if no pk set, then default to our "uuid" field if we have one:
      if (!this.pk && attributes.uuid) {
         this.pk = "uuid";
      }
   }

   /*
    * tableName()
    * return the expected table name for this model instance.
    *
    * In our multi-tenant environment, this will return a
    * "tenantDatabase"."table_name" if it is appropriate.
    *
    * If a configuration error is detected, this fn will call the
    * provided reject handler and return NULL for the table name.
    *
    * @param {cb} reject
    *        a promise reject callback, to be used.
    * @return {string}
    */
   tableName(reject) {
      var tableName = this.dbConn.escapeId(this.config.table_name);
      var tenantID = this.AB.tenantID();
      if (tenantID && !this.config.site_only) {
         var connSettings = this.AB.configDB();
         if (connSettings && connSettings.database) {
            var tDB = this.dbConn.escapeId(
               `${connSettings.database}-${tenantID}`
            );
            tableName = `${tDB}.${tableName}`;
         } else {
            tableName = null;
            var msg =
               "!! Unable to decode database from our connection settings.";
            this.AB.log(msg, this.AB.configDB());
            var error = new Error(msg);
            error.code = "E_CONFIG_ERROR";
            reject(error);
         }
      }
      return tableName;
   }

   /*
    * _usefulValues()
    * an internal method for evaluating a set of given values and filtering
    * it down to only values useful for this model.
    *
    * and by useful we mean only values that match attributes that are
    * defined for this model.
    *
    * @param {obj} value
    *        an key:value hash representing data to be saved/updated by this
    *        Model.
    * @param {bool} includeCreatedAt
    *        do we include the createdAt field in our operations?
    * @param {bool} includeUpdatedAt
    *        do we include the updatedAt field in our operation?
    * @return {obj} key:value hash of relevant values.
    */
   _usefulValues(values, includeCreatedAt, includeUpdatedAt) {
      var usefulValues = {};

      var ignoreList = [];

      // get which fields are connections
      // if connection type is 1:1, 1:many then we can include in our usefulValues
      // else we ignore them.
      var connections = this.fieldsConnection();
      connections.forEach((field) => {
         var connInfo = this._connectionInfo(field.attr_name);
         switch (connInfo.type) {
            case "1:1":
            case "1:many":
               break;

            case "many:1":
            case "many:many":
               // ignore these values from our useful values list:
               ignoreList.push(field.attr_name);
               break;
         }
      });

      for (var v in values) {
         // make sure this field is one of our own:
         // and not a connection where we don't store the value
         if (this.config.attributes[v] && ignoreList.indexOf(v) == -1) {
            usefulValues[v] = values[v];
         }
      }

      // TODO: check to see if createdAt and updatedAt are disabled
      var now = new Date();
      if (includeCreatedAt && this.config.attributes.createdAt) {
         usefulValues.createdAt = now;
      }
      if (includeUpdatedAt && this.config.attributes.updatedAt) {
         usefulValues.updatedAt = now;
      }

      return usefulValues;
   }
   usefulCreateValues(values) {
      return this._usefulValues(values, true, true);
   }
   usefulUpdateValues(values) {
      return this._usefulValues(values, false, true);
   }

   /*
    * fieldsConnection()
    * return an array of attribute definitions from fields that define
    * connections to other Models.
    * @return {array}
    */
   fieldsConnection() {
      return this.attributes((a) => {
         return a.collection || a.model;
      });
   }

   /*
    * fieldsJson()
    * return an array of attribute definitions from fields are storing
    * JSON data as a string.
    * @return {array}
    */
   fieldsJson() {
      return this.attributes((a) => {
         return a.type == "json";
      });
   }

   /*
    * _normalizeResponse()
    * take the given raw data from the DB and make sure it is
    * properly converted/formatted before passing it on.
    * @param {Array|Obj} results
    *        the given set of results to process.
    * @return {Array|Obj}
    */
   _normalizeResponse(results) {
      var sendSingle = false;
      if (!Array.isArray(results)) {
         sendSingle = true;
         results = [results];
      }

      var finalResults = [];

      var allFields = this.attributes();

      // type:"json" => JSON.parse();
      var jsonFields = this.fieldsJson();

      results.forEach((r) => {
         if (r) {
            // convert JSON types to objects
            jsonFields.forEach((f) => {
               var value = r[f.column_name];
               if (!value) return;
               if (typeof value == "string") {
                  try {
                     r[f.column_name] = JSON.parse(value);
                  } catch (e) {
                     console.log(`error JSON.parse() [${value}]`);
                  }
               }
            });

            // copy into new entry with property names
            var entry = {};
            allFields.forEach((f) => {
               if (typeof r[f.column_name] != "undefined") {
                  entry[f.attr_name] = r[f.column_name];
               }
            });

            finalResults.push(entry);
         }
      });

      if (sendSingle) {
         finalResults = finalResults[0];
      }

      return finalResults;
   }

   /*
    * _connectionInfo()
    * an internal method to describe the connection information for one
    * of our attributes.
    *
    * NOTE: if the connection information cannot be determined due to
    * imporper configuration information, an ERROR will be THROWN.
    *
    * @param {strin} field
    *        the attribute name of the field we want connection info for.
    * @return {obj|NULL}
    */
   _connectionInfo(field) {
      var info = {};
      info.type = null;
      info.dominant = false;
      var otherModelKey = null;

      var attribute = this.config.attributes[field];
      info.attribute = attribute;
      if (attribute) {
         if (attribute.type) {
            // field wasn't a connection field
            // just return null
            return null;
         }
         if (attribute.collection) {
            // I can have many of them;
            info.type = "many:";
            otherModelKey = attribute.collection;
         } else {
            info.type = "1:";
            otherModelKey = attribute.model;
         }

         if (attribute.dominant) {
            info.dominant = true;
         }

         // now look at the other Model's connection field
         if (otherModelKey) {
            info.otherModel = this.AB.model(otherModelKey);
            info.otherAttribute = null;
            if (info.type == "many:") {
               info.otherAttribute = info.otherModel.attributes((a) => {
                  return a.attr_name == attribute.via;
               })[0];
               if (info.otherAttribute) {
                  if (info.otherAttribute.collection) {
                     info.type += "many";
                  } else {
                     info.type += "1";
                  }
                  return info;
               }
            } else {
               // see if there is a collection pointint to this field
               info.otherAttribute = info.otherModel.attributes((a) => {
                  return a.collection && a.via == field;
               })[0];
               if (!info.otherAttribute) {
                  // didn't find a collection so
                  // try to find a .model entry
                  info.otherAttribute = info.otherModel.attributes((a) => {
                     return a.model == this._key;
                  })[0];
               }
               if (info.otherAttribute) {
                  if (info.otherAttribute.collection) {
                     info.type += "many";
                  } else {
                     info.type += "1";
                  }
                  return info;
               }
            }
         }
      }
      // if we get to here, there is a problem with the settings of the Models:
      this.AB.log(
         `Error with Model[${this._key}] settings. Can't determine connection type of field [${field}]`
      );
      this.AB.log(`field : ${field}`);
      this.AB.log(
         `attribute : ${attribute ? JSON.stringify(attribute) : "null"}`
      );
      this.AB.log(`otherModelKey : ${otherModelKey}`);
      this.AB.log(
         `otherAttribute : ${
            info.otherAttribute ? JSON.stringify(info.otherAttribute) : "null"
         }`
      );

      throw new Error("Improper Model Definition!");
      // return null;
   }

   /*
    * _resolveConnectedConditions()
    * we convert any connected field conditions to their proper values
    * for performing our conditional action (UPDATE, DELETE, FIND);
    *
    * @param {obj} cond
    *        the key:value hash of condition
    * @return {Promise}
    *        resolved with the converted Condition value.
    */
   _resolveConnectedConditions(cond) {
      return new Promise((resolve, reject) => {
         var condConnections = [];
         async.series(
            [
               // determine which fields need to be converted
               (done) => {
                  var condFields = Object.keys(cond);
                  var connectionFields = this.fieldsConnection().map((f) => {
                     return f.attr_name;
                  });
                  condConnections = _.intersection(
                     condFields,
                     connectionFields
                  );
                  done();
               },

               (done) => {
                  // for each field, determine proper lookup type:
                  async.each(
                     condConnections,
                     (field, cb) => {
                        var connInfo = this._connectionInfo(field);
                        switch (connInfo.type) {
                           case "1:1":
                           case "1:many":
                              // nothing needs to happen here
                              // our field == their uuid value.
                              cb();
                              break;

                           case "many:1":
                              // they contain our UUID,
                              // cond.field => otherModel.uuid
                              // otherModel.find({uuid:cond.field})
                              // .then(pull our UUID from each entry's connection field);
                              // replace with cond.uuid = listUUIDs
                              this.resolveManyOne(cond, field, connInfo)
                                 .then(() => {
                                    cb();
                                 })
                                 .catch(cb);
                              break;

                           case "many:many":
                              // there is a lookup table that maps values between us
                              // cond.field => lookupTable.field
                              // lookupTable.find({field})
                              // .then( pull our UUID from each rows )
                              // replace with cond.uuid = listUUIDs
                              this.resolveManyMany(cond, field, connInfo)
                                 .then(() => {
                                    cb();
                                 })
                                 .catch(cb);
                              break;
                        }
                     },
                     (err) => {
                        done(err);
                     }
                  );
               }
            ],
            (err) => {
               if (err) {
                  reject(err);
                  return;
               }
               resolve(cond);
            }
         );
      });
   }

   /*
    * resolveManyOne()
    * they contain our UUID, so we need to find a list of those Models
    * that match our condition value, and pull our UUID from the results.
    *
    * this fn() updates the passed in cond in place ;
    *
    * @return {Promise}
    */
   resolveManyOne(cond, field, connInfo) {
      return new Promise((resolve /* , reject */) => {
         var foundUUIDs = [];

         // otherModel.find({uuid:cond.field})
         var otherModel = connInfo.otherModel;

         // cond.field => otherModel.uuid
         var otherCond = {};
         otherCond[otherModel.pk] = cond[field];

         otherModel.find(otherCond).then((list) => {
            list.forEach((row) => {
               // .then(pull our UUID from each entry's connection field);
               // in a many:one
               // this attribute.via  is the value in the returned row
               // that contains our uuid:
               foundUUIDs.push(row[connInfo.attribute.via]);
            });

            // replace with cond.uuid = listUUIDs
            cond.uuid = cond.uuid || []; // just in case there already are .uuid
            cond.uuid = _.uniq(_.concat(cond.uuid, foundUUIDs));

            delete cond[field];
            resolve();
         });
      });
   }

   /*
    * resolveManyMany()
    * we need to lookup the provided uuids in a join table,
    * and then get our UUIDs from those results.
    *
    * this fn() updates the passed in cond in place ;
    *
    * @return {Promise}
    */
   resolveManyMany(cond, field, connInfo) {
      return new Promise((resolve /*, reject */) => {
         // cond.field => otherModel.uuid

         var fieldName = connInfo.otherModel._key;
         var otherCond = {};
         otherCond[fieldName] = cond[field];
         // { User:["blah"] }

         var foundUUIDs = [];

         this._getJoinModel(connInfo)
            .find(otherCond)
            .then((list) => {
               list.forEach((row) => {
                  foundUUIDs.push(row[this._key]);
               });

               // replace with cond.uuid = listUUIDs
               cond.uuid = cond.uuid || []; // just in case there already are .uuid
               cond.uuid = _.uniq(_.concat(cond.uuid, foundUUIDs));

               delete cond[field];
               resolve();
            });
      });
   }

   /*
    * _getJoinModel()
    * On a many:many connection, there needs to be a joinTable to lookup the relations.
    * This method will return a Model obj that represents that joinTable.
    * @param {obj} connInfo
    *        the connection description returned from this._connectionInfo()
    * @return {Model} instance.
    */
   _getJoinModel(connInfo) {
      // lookupTable.find({field})
      var joinTableDefinition = {
         table_name: "",
         attributes: { createdAt: false, updatedAt: false }
      };
      if (connInfo.dominant) {
         joinTableDefinition.table_name = `${this._key}_${connInfo.otherModel._key}`;
      } else {
         joinTableDefinition.table_name = `${connInfo.otherModel._key}_${this._key}`;
      }
      joinTableDefinition.attributes[this._key] = "uuid";
      joinTableDefinition.attributes[connInfo.otherModel._key] = "uuid";

      return new Model(joinTableDefinition, this.dbConn, this.AB);
   }

   _linkManyMany(connInfo, myPk, value) {
      return new Promise((resolve, reject) => {
         // new Entry =
         var newLink = {};
         newLink[this._key] = myPk;
         newLink[connInfo.otherModel._key] = value;

         this._getJoinModel(connInfo)
            .create(newLink)
            .then(() => {
               resolve();
            })
            .catch(reject);
      });
   }

   /*
    * create()
    * Insert a new row of data for this Model.
    * @param {obj} values
    *        key:value hash of values to insert
    * @return {Promise}
    */
   create(values) {
      var insertedID = null;
      var returnValue = null;
      return new Promise((resolve, reject) => {
         // 1) generate proper table name
         // if we are told of a tenantID, then our tableName should be in
         // format: [tenantDB].[table_name]
         var tableName = this.tableName(reject);
         if (!tableName) {
            return;
         }

         try {
            async.series(
               [
                  (done) => {
                     // 1) process beforeCreate() lifecycle
                     this.beforeCreate(values, done);
                  },
                  (done) => {
                     // 2) insert the base record
                     var usefulValues = this.usefulCreateValues(values);
                     // console.log(usefulValues);
                     var queryIt = (retries = 0) => {
                        if (retries >= 3) {
                           var error = new Error(
                              "Too many timeouts when querying the DB."
                           );
                           error.code = "ETIMEDOUT";
                           error.numRetries = retries;
                           done(error);
                           return;
                        }

                        this.dbConn.query(
                           `INSERT INTO ${tableName} SET ?`,
                           usefulValues,
                           (error, results /*, fields */) => {
                              // error will be an Error if one occurred during the query
                              // results will contain the results of the query
                              // fields will contain information about the returned results fields (if any)

                              if (error) {
                                 // if this is a timeout error, try again:
                                 if (
                                    error.toString().indexOf("ETIMEDOUT") != -1
                                 ) {
                                    console.log(
                                       `[${retries}] db timeout error: retrying`
                                    );
                                    queryIt(retries++);
                                    return;
                                 } else {
                                    done(error);
                                    return;
                                 }
                              }

                              insertedID =
                                 results && results.insertId
                                    ? results.insertId
                                    : null;
                              done();
                           }
                        );
                     };
                     queryIt();
                  },
                  (done) => {
                     // pull full entry from DB?
                     var cond = {};
                     if (insertedID) {
                        cond.id = insertedID;
                     } else if (this.pk && values[this.pk]) {
                        cond[this.pk] = values[this.pk];
                     }
                     // if we couldn't set a condition, then skip the lookup
                     if (Object.keys(cond).length == 0) {
                        // we don't perform a lookup:
                        returnValue = values;
                        done();
                        return;
                     }
                     this.find(cond)
                        .then((values) => {
                           returnValue = values[0];
                           done();
                        })
                        .catch(done);
                  },
                  (done) => {
                     // update any connected records that should have our pk stored in them
                     // update any join tables

                     // get the connections that have population data passed in:
                     var valFields = Object.keys(values);
                     var connections = this.fieldsConnection().filter((f) => {
                        return valFields.indexOf(f.attr_name) != -1;
                     });

                     // for each connection value provided:
                     async.each(
                        connections,
                        (field, cb) => {
                           // determine the type of conneciton
                           var connInfo = this._connectionInfo(field.attr_name);
                           switch (connInfo.type) {
                              case "many:1":
                                 // find the other model, and then update that entry to have our pk
                                 var otherModel = connInfo.otherModel;

                                 // we look up that entry by:  otherModel.pk == value[field]
                                 var cond = {};
                                 cond[otherModel.pk] = values[field.attr_name];

                                 // what we store in that entry: otherModel[connection.via] = our.pk
                                 var value = {};
                                 value[connInfo.attribute.via] =
                                    returnValue[this.pk];

                                 // now perform the update
                                 otherModel
                                    .update(cond, value)
                                    .then(() => {
                                       // make sure our return values reflect this connection:
                                       returnValue[field.attr_name] =
                                          values[field.attr_name];
                                       cb();
                                    })
                                    .catch(cb);
                                 break;

                              case "many:many":
                                 // figure out our join table, and create another link between us and them

                                 var allValues = values[field.attr_name];
                                 if (!Array.isArray(allValues)) {
                                    allValues = [allValues];
                                 }

                                 async.each(
                                    allValues,
                                    (value, linkCB) => {
                                       this._linkManyMany(
                                          connInfo,
                                          returnValue[this.pk],
                                          value
                                       )
                                          .then(() => {
                                             linkCB();
                                          })
                                          .catch(linkCB);
                                    },
                                    (linkErr) => {
                                       // make sure our returned data includes these link ids
                                       returnValue[field.attr_name] =
                                          values[field.attr_name];
                                       cb(linkErr);
                                    }
                                 );
                                 break;

                              default:
                                 cb();
                                 break;
                           }
                        },
                        (err) => {
                           done(err);
                        }
                     );
                  },

                  (done) => {
                     // perform .afterCreate()
                     this.afterCreate(returnValue, done);
                  }
               ],
               (err) => {
                  if (err) {
                     reject(err);
                     return;
                  }
                  resolve(returnValue);
               }
            );
         } catch (e) {
            reject(e);
         }
      });
   }

   /*
    * destroy()
    * remove one or more rows for this Model.
    * @param {obj} cond
    *        key:value hash describing the rows to remove
    * @return {Promise}
    */
   destroy(cond) {
      if (!cond) {
         return Promise.reject(
            new Error("condition is required for .destroy()")
         );
      }
      return new Promise((resolve, reject) => {
         try {
            // 1) generate proper table name
            // if we are told of a tenantID, then our tableName should be in
            // format: [tenantDB].[table_name]
            var tableName = this.tableName(reject);
            if (!tableName) {
               return;
            }

            this.dbConn.query(`DELETE FROM ${tableName} WHERE ?`, cond, (
               error /* ,results, fields*/
            ) => {
               // error will be an Error if one occurred during the query
               // results will contain the results of the query
               // fields will contain information about the returned results fields (if any)

               if (error) {
                  // TODO: identify specific errors and handle them if we can.
                  reject(error);
                  return;
               }
               // TODO: should return the updated entry
               resolve();
            });
         } catch (e) {
            reject(e);
         }
      });
   }

   /*
    * find()
    * return a set of values for this Model.
    * @param {obj} orgCond
    *        key:value hash describing the rows to return
    * @return {Promise}
    */
   find(orgCond) {
      if (!orgCond) {
         return Promise.reject(new Error("condition is required for .find()"));
      }
      return new Promise((resolve, reject) => {
         try {
            var tableName = this.tableName(reject);
            if (!tableName) {
               return;
            }

            Promise.resolve()
               .then(() => {
                  return this._resolveConnectedConditions(orgCond);
               })
               .then((cond) => {
                  if (Object.keys(cond).length == 0) {
                     cond = null;
                  }
                  var query = `SELECT * FROM ${tableName} `;
                  if (cond) {
                     query += "WHERE ?";
                  }
                  this.AB.log(
                     `.find(): ${query}, [${
                        cond ? JSON.stringify(cond) : null
                     }]`
                  );
                  this.dbConn.query(query, cond, (
                     error,
                     results /*, fields*/
                  ) => {
                     // error will be an Error if one occurred during the query
                     // results will contain the results of the query
                     // fields will contain information about the returned results fields (if any)

                     if (error) {
                        // TODO: identify specific errors and handle them if we can.
                        reject(error);
                        return;
                     }

                     Promise.resolve()
                        .then(() => {
                           // update field values
                           return this._normalizeResponse(results);
                        })
                        .then((final) => {
                           // TODO: should return the updated entry
                           resolve(final);
                        })
                        .catch((err) => {
                           reject(err);
                        });
                  });
               })
               .catch((err) => {
                  reject(err);
               });
         } catch (e) {
            reject(e);
         }
      });
   }

   /*
    * update()
    * update the data in the table for this Model
    * @param {obj} cond
    *        key:value hash describing the rows to update
    * @param {obj} values
    *        a key:value hash of values to change
    * @return {Promise}
    */
   update(cond, values) {
      if (!cond) {
         return Promise.reject(
            new Error("condition is required for .update()")
         );
      }
      return new Promise((resolve, reject) => {
         try {
            var tableName = this.tableName(reject);
            if (!tableName) {
               return;
            }

            var usefulValues = this.usefulUpdateValues(values);

            this.dbConn.query(
               `UPDATE ${tableName} SET ? WHERE ?`,
               [usefulValues, cond],
               (error /* ,results, fields*/) => {
                  // error will be an Error if one occurred during the query
                  // results will contain the results of the query
                  // fields will contain information about the returned results fields (if any)

                  if (error) {
                     // TODO: identify specific errors and handle them if we can.
                     reject(error);
                     return;
                  }
                  // TODO: should return the updated entry
                  resolve();
               }
            );
         } catch (e) {
            reject(e);
         }
      });
   }
};
