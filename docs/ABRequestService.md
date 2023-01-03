<a name="ABRequestService"></a>

## ABRequestService
**Kind**: global class  

* [ABRequestService](#ABRequestService)
    * [new ABRequestService(req, controller)](#new_ABRequestService_new)
    * [.broadcast(packets, cb)](#ABRequestService+broadcast)
        * [.inboxCreate(users, roles, item, [cb])](#ABRequestService+broadcast.inboxCreate) ⇒ <code>Promise</code>
        * [.dcCreate(id, newItem, [key], [cb])](#ABRequestService+broadcast.dcCreate) ⇒ <code>Promise</code>
        * [.dcDelete(id, itemID, [key], [cb])](#ABRequestService+broadcast.dcDelete) ⇒ <code>Promise</code>
        * [.dcUpdate(id, updatedItem, [key], [cb])](#ABRequestService+broadcast.dcUpdate) ⇒ <code>Promise</code>
    * [.config()](#ABRequestService+config) ⇒ <code>object</code>
    * [.configDB()](#ABRequestService+configDB)
    * [.connections()](#ABRequestService+connections) ⇒ <code>object</code>
    * [.dbConnection(create, isolate)](#ABRequestService+dbConnection) ⇒ <code>Mysql.conn</code> \| <code>null</code>
    * [.languageCode()](#ABRequestService+languageCode) ⇒ <code>string</code>
    * [.log(...args)](#ABRequestService+log)
        * [.verbose(...args)](#ABRequestService+log.verbose)
    * [.logError(message, error)](#ABRequestService+logError)
    * [.model(name)](#ABRequestService+model) ⇒ <code>Model</code> \| <code>null</code>
    * [.param(key)](#ABRequestService+param) ⇒ <code>\*</code> \| <code>undefined</code>
    * [.allParams(...params)](#ABRequestService+allParams) ⇒ <code>object</code>
    * [.params([ignoreList])](#ABRequestService+params) ⇒ <code>object</code>
    * [.query(query, values, cb, [dbConn])](#ABRequestService+query)
    * [.queryIsolate(query, values, cb)](#ABRequestService+queryIsolate)
    * [.queryIsolateClose()](#ABRequestService+queryIsolateClose)
    * [.queryTenantDB(reject)](#ABRequestService+queryTenantDB) ⇒ <code>false</code> \| <code>string</code>
    * [.queryWhereCondition(cond)](#ABRequestService+queryWhereCondition) ⇒ <code>obj</code>
    * [.retry(fn)](#ABRequestService+retry) ⇒ <code>Promise</code>
    * [.shouldRetry(error)](#ABRequestService+shouldRetry)
    * [.serviceSubscribe(key, handler)](#ABRequestService+serviceSubscribe) ⇒ [<code>ABServiceSubscriber</code>](./ABServiceSubscriber.md#ABServiceSubscriber)
    * [.socketKey(key)](#ABRequestService+socketKey) ⇒ <code>string</code>
    * [.tenantDB()](#ABRequestService+tenantDB) ⇒ <code>string</code>
    * [.tenantID()](#ABRequestService+tenantID) ⇒ <code>string</code>
    * [.toABFactoryReq()](#ABRequestService+toABFactoryReq) ⇒ [<code>ABRequestService</code>](#ABRequestService)
    * [.toObj()](#ABRequestService+toObj) ⇒ <code>obj</code>
    * [.userDefaults()](#ABRequestService+userDefaults) ⇒ <code>obj</code>
    * [.username()](#ABRequestService+username) ⇒ <code>string</code>
    * [.usernameReal()](#ABRequestService+usernameReal) ⇒ <code>string</code> \| <code>null</code>
    * [.validateData(description)](#ABRequestService+validateData) ⇒ <code>undefined</code> \| <code>Error</code>
    * [.notify(domain, error, [info])](#ABRequestService+notify)
        * [.builder(...params)](#ABRequestService+notify.builder)
        * [.developer(...params)](#ABRequestService+notify.developer)
    * [.servicePublish(key, data)](#ABRequestService+servicePublish)
    * [.serviceRequest(key, data, [options], [cb])](#ABRequestService+serviceRequest) ⇒ <code>Promise</code>

<a name="new_ABRequestService_new"></a>

### new ABRequestService(req, controller)

| Param | Type |
| --- | --- |
| req | <code>object</code> | 
| controller | [<code>ABServiceController</code>](./ABServiceController.md#ABServiceController) | 

<a name="ABRequestService+broadcast"></a>

### req.broadcast(packets, cb)
An interface for communicating real time data updates to our clients.

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type | Description |
| --- | --- | --- |
| packets | <code>Array.&lt;object&gt;</code> | An array of broadcast packets to post to our clients. |
| packets[].room | <code>string</code> | A unique identifier of the group of clients to receive the notifications. Usually this is a multi-tenant identified id, generated by: req.socketKey(id) |
| packets[].event | <code>string</code> | a unique "key" that tells the client what data they are receiving. |
| packets[].data | <code>json</code> | the data delivery for the .event |
| cb | <code>fn</code> | a node style callback(error, results) can be provided to notify when the packet has been sent. |


* [.broadcast(packets, cb)](#ABRequestService+broadcast)
    * [.inboxCreate(users, roles, item, [cb])](#ABRequestService+broadcast.inboxCreate) ⇒ <code>Promise</code>
    * [.dcCreate(id, newItem, [key], [cb])](#ABRequestService+broadcast.dcCreate) ⇒ <code>Promise</code>
    * [.dcDelete(id, itemID, [key], [cb])](#ABRequestService+broadcast.dcDelete) ⇒ <code>Promise</code>
    * [.dcUpdate(id, updatedItem, [key], [cb])](#ABRequestService+broadcast.dcUpdate) ⇒ <code>Promise</code>

<a name="ABRequestService+broadcast.inboxCreate"></a>

#### broadcast.inboxCreate(users, roles, item, [cb]) ⇒ <code>Promise</code>
A shortcut method to post our "ab.inbox.create" messages to our Clients.

**Kind**: static method of [<code>broadcast</code>](#ABRequestService+broadcast)  

| Param | Type | Description |
| --- | --- | --- |
| users | <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;SiteUser&gt;</code> | An array of SiteUser.uuid(s) that should receive this message. Can also work with [{SiteUser}] objects. |
| roles | <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Role&gt;</code> | An array of Role.uuid(s) that should receive this message. Can also work with [{Role}] objects. |
| item | <code>obj</code> | The newly created Inbox Item definition. |
| [cb] | <code>fn</code> | (optional) for legacy code api, a node style callback(error) can be provided for the response. |

<a name="ABRequestService+broadcast.dcCreate"></a>

#### broadcast.dcCreate(id, newItem, [key], [cb]) ⇒ <code>Promise</code>
A shortcut method for posting our "ab.datacollection.create" messages

**Kind**: static method of [<code>broadcast</code>](#ABRequestService+broadcast)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | The {ABObject.id} of the ABObject definition that we are going to post an update for. The incoming newItem should be data managed by this ABObject. |
| newItem | <code>obj</code> |  | The row data of the new Item that was created. Usually fully populated so the clients can work with them as usual. |
| [key] | <code>string</code> | <code>&quot;broadcast.dc.create.id&quot;</code> | a specific internal performance marker key for tracking how long this broadcast operation took. |
| [cb] | <code>function</code> |  | (optional) for legacy code api, a node style callback(error) can be provided for the response. |

<a name="ABRequestService+broadcast.dcDelete"></a>

#### broadcast.dcDelete(id, itemID, [key], [cb]) ⇒ <code>Promise</code>
A shortcut method for posting our "ab.datacollection.delete" messages

**Kind**: static method of [<code>broadcast</code>](#ABRequestService+broadcast)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | The {ABObject.id} of the ABObject definition that we are going to post a delete for. The deleted item should be data managed by this ABObject. |
| itemID | <code>string</code> |  | The uuid of the row being deleted. |
| [key] | <code>string</code> | <code>&quot;broadcast.dc.delete.id&quot;</code> | a specific internal performance marker key for tracking how long this broadcast operation took. |
| [cb] | <code>function</code> |  | for legacy code api, a node style callback(error) can be provided for the response. |

<a name="ABRequestService+broadcast.dcUpdate"></a>

#### broadcast.dcUpdate(id, updatedItem, [key], [cb]) ⇒ <code>Promise</code>
A shortcut method for posting our "ab.datacollection.update" messages

**Kind**: static method of [<code>broadcast</code>](#ABRequestService+broadcast)  
**King**: function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | The {ABObject.id} of the ABObject definition that we are going to post an update for. The incoming newItem should be data managed by this ABObject. |
| updatedItem | <code>obj</code> |  | The row data of the new Item that was updated. Can be fully populated, or just the updated values. |
| [key] | <code>string</code> | <code>&quot;broadcast.dc.update.id&quot;</code> | a specific internal performance marker key for tracking how long this broadcast operation took. |
| [cb] | <code>function</code> |  | for legacy code api, a node style callback(error) can be provided for the response. |

<a name="ABRequestService+config"></a>

### req.config() ⇒ <code>object</code>
**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
**Returns**: <code>object</code> - config from the controller  
<a name="ABRequestService+configDB"></a>

### req.configDB()
return the proper DB connection data for the current request.

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
<a name="ABRequestService+connections"></a>

### req.connections() ⇒ <code>object</code>
**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
**Returns**: <code>object</code> - connections from the controller  
<a name="ABRequestService+dbConnection"></a>

### req.dbConnection(create, isolate) ⇒ <code>Mysql.conn</code> \| <code>null</code>
return a connection to our mysql DB for the current request

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| create | <code>bool</code> | <code>true</code> | create a new DB connection if we are not currently connected. |
| isolate | <code>bool</code> | <code>false</code> | return a unique DB connection not shared by other requests. |

<a name="ABRequestService+languageCode"></a>

### req.languageCode() ⇒ <code>string</code>
return the current language settings for this request.

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
<a name="ABRequestService+log"></a>

### req.log(...args)
print out a log entry for the current request

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>\*</code> | array of possible log entries |

<a name="ABRequestService+log.verbose"></a>

#### log.verbose(...args)
A shortcut method for logging "verbose" messages. There needs to be

**Kind**: static method of [<code>log</code>](#ABRequestService+log)  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>\*</code> | anything to log |

<a name="ABRequestService+logError"></a>

### req.logError(message, error)
**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 
| error | <code>Error</code> | 

<a name="ABRequestService+model"></a>

### req.model(name) ⇒ <code>Model</code> \| <code>null</code>
Return a Model() instance from the model/name.js definition

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name of the model/[name].js definition to return a Model for. |

<a name="ABRequestService+param"></a>

### req.param(key) ⇒ <code>\*</code> \| <code>undefined</code>
return the parameter value specified by the provided key

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | name of the req.param[key] value to return |

<a name="ABRequestService+allParams"></a>

### req.allParams(...params) ⇒ <code>object</code>
**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
**Returns**: <code>object</code> - `{ paramName: value }`  

| Param | Type | Description |
| --- | --- | --- |
| ...params | <code>string</code> | any number of parameters to ignore |

<a name="ABRequestService+params"></a>

### req.params([ignoreList]) ⇒ <code>object</code>
**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
**Returns**: <code>object</code> - `{ paramName: value }`  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [ignoreList] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | parameters to ignore |

<a name="ABRequestService+query"></a>

### req.query(query, values, cb, [dbConn])
perform an sql query directly on our dbConn.

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | the sql query to perform.  Use "?" for placeholders. |
| values | <code>array</code> | the array of values that correspond to the placeholders in the sql |
| cb | <code>fn</code> | a node style callback with 3 paramaters (error, results, fields) these are the same values as returned by the mysql library .query() |
| [dbConn] | <code>MySQL</code> | the DB Connection to use for this request. If not provided the common dbConnection() will be used. |

<a name="ABRequestService+queryIsolate"></a>

### req.queryIsolate(query, values, cb)
Perform a query on it's own DB Connection. Not shared with other requests.

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | the sql query to perform. Use "?" for placeholders. |
| values | <code>array</code> | the array of values that correspond to the placeholders in the sql |
| cb | <code>fn</code> | a node style callback with 3 paramaters (error, results, fields) these are the same values as returned by the mysql library .query() |

<a name="ABRequestService+queryIsolateClose"></a>

### req.queryIsolateClose()
Ensure the temporary isolated db connection is closed out properly.

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
<a name="ABRequestService+queryTenantDB"></a>

### req.queryTenantDB(reject) ⇒ <code>false</code> \| <code>string</code>
return the tenantDB value for this req object.

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
**Returns**: <code>false</code> \| <code>string</code> - false if tenantDB not found, otherwise the tenantDB

| Param | Type | Description |
| --- | --- | --- |
| reject | <code>Promise.reject</code> | a reject() handler to be called if a tenantDB is not found. |

<a name="ABRequestService+queryWhereCondition"></a>

### req.queryWhereCondition(cond) ⇒ <code>obj</code>
evaluate a given {cond} hash and generate an SQL condition string from it.

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
**Returns**: <code>obj</code> - <br>.condition {string}  the proper sql "WHERE ${condition}"

| Param | Type | Description |
| --- | --- | --- |
| cond | <code>obj</code> | a value hash of the desired condition. |

<a name="ABRequestService+retry"></a>

### req.retry(fn) ⇒ <code>Promise</code>
Attempt to retry the provided fn() if it results in an interrupted

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | The promise based network operation |

<a name="ABRequestService+shouldRetry"></a>

### req.shouldRetry(error)
**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type |
| --- | --- |
| error | <code>Error</code> | 

<a name="ABRequestService+serviceSubscribe"></a>

### req.serviceSubscribe(key, handler) ⇒ [<code>ABServiceSubscriber</code>](./ABServiceSubscriber.md#ABServiceSubscriber)
Create a Cote service subscriber that can parse our data interchange

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | the service handler's key we are responding to. |
| handler | <code>function</code> | a function to handle the incoming request. See [ABServiceSubscriber](./ABServiceSubscriber.md#ABServiceSubscriber) constructor for details |

<a name="ABRequestService+socketKey"></a>

### req.socketKey(key) ⇒ <code>string</code>
make sure any socket related key is prefixed by our tenantID

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The socket key we are wanting to reference. |

<a name="ABRequestService+tenantDB"></a>

### req.tenantDB() ⇒ <code>string</code>
return the database reference for the current Tenant

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
<a name="ABRequestService+tenantID"></a>

### req.tenantID() ⇒ <code>string</code>
return the tenantID of the current request

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
<a name="ABRequestService+toABFactoryReq"></a>

### req.toABFactoryReq() ⇒ [<code>ABRequestService</code>](#ABRequestService)
**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
**Returns**: [<code>ABRequestService</code>](#ABRequestService) - new instance  
<a name="ABRequestService+toObj"></a>

### req.toObj() ⇒ <code>obj</code>
return a simplified {obj} hash of this request's data.

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
<a name="ABRequestService+userDefaults"></a>

### req.userDefaults() ⇒ <code>obj</code>
return a data structure used by our ABModel.find() .create() .update()

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
**Returns**: <code>obj</code> - <br>         .languageCode: {string} the default language code of the user
<a name="ABRequestService+username"></a>

### req.username() ⇒ <code>string</code>
**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
**Returns**: <code>string</code> - the req user's username or "_system_"  
<a name="ABRequestService+usernameReal"></a>

### req.usernameReal() ⇒ <code>string</code> \| <code>null</code>
**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
**Returns**: <code>string</code> \| <code>null</code> - the req userReal's username or null  
<a name="ABRequestService+validateData"></a>

### req.validateData(description) ⇒ <code>undefined</code> \| <code>Error</code>
validate the req data and return any errors

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
**Returns**: <code>undefined</code> \| <code>Error</code> - see [ABRequestValidation.errors](ABRequestValidation.errors)  

| Param | Type | Description |
| --- | --- | --- |
| description | <code>object</code> | see [ABRequestValidation.validate](ABRequestValidation.validate) |

<a name="ABRequestService+notify"></a>

### req.notify(domain, error, [info])
**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| domain | <code>string</code> |  | Normally "builder" or "developer" |
| error | <code>Error</code> \| <code>Array.&lt;Error&gt;</code> \| <code>string</code> \| <code>object</code> |  |  |
| [info] | <code>object</code> | <code>{}</code> |  |


* [.notify(domain, error, [info])](#ABRequestService+notify)
    * [.builder(...params)](#ABRequestService+notify.builder)
    * [.developer(...params)](#ABRequestService+notify.developer)

<a name="ABRequestService+notify.builder"></a>

#### notify.builder(...params)
A shortcut method for notifying builders of configuration errors.

**Kind**: static method of [<code>notify</code>](#ABRequestService+notify)  

| Param | Type | Description |
| --- | --- | --- |
| ...params | <code>\*</code> | see [ABRequestService.notify](ABRequestService.notify) |

<a name="ABRequestService+notify.developer"></a>

#### notify.developer(...params)
A shortcut method for notifying developer of operational errors.

**Kind**: static method of [<code>notify</code>](#ABRequestService+notify)  

| Param | Type | Description |
| --- | --- | --- |
| ...params | <code>\*</code> | see [ABRequestService.notify](ABRequestService.notify) |

<a name="ABRequestService+servicePublish"></a>

### req.servicePublish(key, data)
Publish an update to other subscribed services.

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | the channel we are updating. |
| data | <code>json</code> | the data packet to send to the subscribers. |

<a name="ABRequestService+serviceRequest"></a>

### req.serviceRequest(key, data, [options], [cb]) ⇒ <code>Promise</code>
Send a request to another micro-service using the cote protocol. Accept an

**Kind**: instance method of [<code>ABRequestService</code>](#ABRequestService)  
**Returns**: <code>Promise</code> - resolves with the response from the service  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  | the service handler's key we are sending a request to. |
| data | <code>json</code> |  | the data packet to send to the service. |
| [options] | <code>object</code> |  | optional options |
| [options.timeout] | <code>number</code> | <code>5000</code> | ms to wait before timing out |
| [options.maxAttempts] | <code>number</code> | <code>5</code> | how many times to try the request if  it fails |
| [options.longRequest] | <code>boolean</code> | <code>false</code> | timeout after 90 seconds, will be ignored if timeout was set |
| [cb] | <code>function</code> |  | optional node.js style callback(err, result) for when the response is received. |

**Example**  
```js
// async/await
```