"use strict";
exports.id = 377;
exports.ids = [377];
exports.modules = {

/***/ 8377:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TE: () => (/* binding */ mongooseConnection),
/* harmony export */   vO: () => (/* binding */ connectToDatabase),
/* harmony export */   xd: () => (/* binding */ clientPromise)
/* harmony export */ });
/* harmony import */ var mongodb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8013);
/* harmony import */ var mongodb__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongodb__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1185);
/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_1__);


// MongoDB connection string
// For production, this would be stored in environment variables
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/musician-case-finder";
// MongoDB client
let client;
let clientPromise;
// Mongoose connection
let mongooseConnection;
if (false) {} else {
    // In production mode, it's best to not use a global variable.
    client = new mongodb__WEBPACK_IMPORTED_MODULE_0__.MongoClient(uri, {
        serverApi: {
            version: mongodb__WEBPACK_IMPORTED_MODULE_0__.ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
        }
    });
    clientPromise = client.connect();
    mongooseConnection = (mongoose__WEBPACK_IMPORTED_MODULE_1___default());
    mongoose__WEBPACK_IMPORTED_MODULE_1___default().connect(uri);
}
// Export a module-scoped MongoClient promise and Mongoose connection

// Add connectToDatabase function for backward compatibility
async function connectToDatabase() {
    if ((mongoose__WEBPACK_IMPORTED_MODULE_1___default().connection).readyState !== 1) {
        await mongoose__WEBPACK_IMPORTED_MODULE_1___default().connect(uri);
    }
    return {
        client,
        mongoose: (mongoose__WEBPACK_IMPORTED_MODULE_1___default())
    };
}


/***/ })

};
;