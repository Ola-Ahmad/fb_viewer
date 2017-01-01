/**
 * Created by Hp on 27/12/2016.
 */
let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let bodyParser = require('body-parser');
let mongodb = require("mongodb");
let ObjectID = mongodb.ObjectID;
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let debug = require('debug')('myproject:server');
let http = require('http');
// var index = require('./routes/index');
// var contacts = require('./routes/contacts');
// let contact = require('./routes/contact');
let CONTACTS_COLLECTION = "contacts";
let app = express();
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/', index);
// app.use('/contacts', contacts);
// app.use('/contacts/:id', contact);
// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//     // render the error page
//     res.status(err.status || 500);
//     alert('error');
// });

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
let db;
// Connect to the database before starting the application server.
// let url  = "mongodb://admin:olaeng3loosh@ds145128.mlab.com:45128/fb_profile_viewer_db"
mongodb.MongoClient.connect(process.env.MONGOLAB_URI, function(err, database) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    // Save database object from the callback for reuse.
    db = database;
    console.log("Database connection ready");
});

/********
 * API ROUTES
 ********/

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({
        "error": message
    });
}
/*  "/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */
app.get("/contacts", function(req, res) {
    console.log('in server GET');
    //console.log(req.body);

    db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json(docs);
        }
    });

});

app.post("/contacts", function(req, res) {
    console.log('in server POST');
    console.log(req.body);

    let newContact = req.body;
    newContact.createDate = new Date();
    //newContact.name='ola';
    console.log(newContact);


    // if (!(req.body.fullName)) {
    //     handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
    // }
    db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to create new contact.");
        } else {
            // res.status(201).json(doc.ops[0]);
            console.log(doc.ops[0]);
            res.status(201).json(doc.ops[0]);
        }
    });
    // res.send('in server POST');

    // res.send(newContact);
});

/*  "/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/contacts/:id", function(req, res) {
    db.collection(CONTACTS_COLLECTION).findOne({
        _id: new ObjectID(req.params.id)
    }, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get contact");
        } else {
            res.status(200).json(doc);
        }
    });
});

app.put("/contacts/:id", function(req, res) {
    var updateDoc = req.body;
    delete updateDoc._id;

    db.collection(CONTACTS_COLLECTION).updateOne({
        _id: new ObjectID(req.params.id)
    }, updateDoc, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to update contact");
        } else {
            res.status(204).end();
            // res.status(204).json(doc);
            // res.status(204).json(doc.ops[0]);

        }
    });
});
app.delete("/contacts/:id", function(req, res) {
    console.log(req.params.id);
    db.collection(CONTACTS_COLLECTION).deleteOne({
        _id: new ObjectID(req.params.id)
    }, function(err, result) {
        if (err) {
            handleError(res, err.message, "Failed to delete contact");
        } else {
            res.status(204).end();
        }
    });
});

/**************
 * Start Server
 **************/

let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
/**
 * Create HTTP server.
 */
let server = http.createServer(app);
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    let bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
    console.log('Example app listening on:' + bind);
    debug('Listening on ' + bind);
}