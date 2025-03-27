"use strict";
exports.id = 377;
exports.ids = [377];
exports.modules = {

/***/ 8377:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   No: () => (/* binding */ connectToMongoDB),
/* harmony export */   ZP: () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   hv: () => (/* binding */ collectionExists)
/* harmony export */ });
/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1185);
/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);

// Connection states
// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting
// 99 = uninitialized
// Track connection status
let isConnecting = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;
const CONNECTION_RETRY_DELAY = 1000; // ms
// Function to wait for a specified time
const wait = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
// Enhanced connection function with retry logic and proper state handling
async function connectToMongoDB() {
    try {
        // If already connected, return immediately
        if ((mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection).readyState === 1) {
            console.log("MongoDB already connected");
            return;
        }
        // If currently connecting, wait for it to complete
        if (isConnecting) {
            console.log("MongoDB connection in progress, waiting...");
            await wait(500);
            if ((mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection).readyState === 1) {
                console.log("MongoDB connection completed while waiting");
                return;
            }
        // If still not connected after waiting, continue with new connection attempt
        }
        // Track that we're attempting to connect
        isConnecting = true;
        connectionAttempts++;
        console.log(`MongoDB connection attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}`);
        console.log(`Attempting to connect to MongoDB with URI: ${process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")}`);
        // Connect with timeout
        const connectionPromise = mongoose__WEBPACK_IMPORTED_MODULE_0___default().connect(process.env.MONGODB_URI || "mongodb://localhost:27017/musician-case-finder");
        // Set a timeout for the connection attempt
        const timeoutPromise = new Promise((_, reject)=>{
            setTimeout(()=>reject(new Error("MongoDB connection timeout")), 10000);
        });
        // Wait for either connection or timeout
        await Promise.race([
            connectionPromise,
            timeoutPromise
        ]);
        // Wait a bit to ensure db property is fully initialized
        await wait(500);
        // Verify connection and db property
        if ((mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection).readyState !== 1) {
            throw new Error(`MongoDB connection failed, state: ${(mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection).readyState}`);
        }
        if (!(mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection).db) {
            throw new Error("MongoDB connection succeeded but db property is not available");
        }
        console.log("MongoDB connected successfully");
        console.log(`Database name: ${(mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection).db.databaseName}`);
        // Reset connection tracking
        isConnecting = false;
        connectionAttempts = 0;
        // Set up connection monitoring
        setupConnectionMonitoring();
        return (mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        isConnecting = false;
        // If we haven't exceeded max attempts, retry after delay
        if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
            console.log(`Retrying connection in ${CONNECTION_RETRY_DELAY}ms...`);
            await wait(CONNECTION_RETRY_DELAY);
            return connectToMongoDB();
        } else {
            console.error(`Failed to connect to MongoDB after ${MAX_CONNECTION_ATTEMPTS} attempts`);
            throw error;
        }
    }
}
// Function to safely check if a collection exists
async function collectionExists(collectionName) {
    try {
        // First ensure we're connected
        await connectToMongoDB();
        // Double-check connection and db property
        if ((mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection).readyState !== 1 || !(mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection).db) {
            console.warn(`Cannot check collection existence: MongoDB not fully connected (state: ${(mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection).readyState}, db: ${!!(mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection).db})`);
            return false;
        }
        // Try to list collections
        try {
            const collections = await mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection.db.listCollections().toArray();
            const collectionNames = collections.map((c)=>c.name);
            console.log(`Available collections: ${collectionNames.join(", ")}`);
            return collectionNames.includes(collectionName);
        } catch (error) {
            const listError = error instanceof Error ? error : new Error(String(error));
            console.error(`Error listing collections: ${listError.message}`);
            // Fallback: try to get the collection directly
            try {
                const collection = await mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection.db.collection(collectionName);
                const count = await collection.countDocuments();
                console.log(`Collection ${collectionName} exists with ${count} documents`);
                return true;
            } catch (error) {
                const collectionError = error instanceof Error ? error : new Error(String(error));
                console.error(`Error accessing collection ${collectionName}: ${collectionError.message}`);
                return false;
            }
        }
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`Error checking if collection ${collectionName} exists:`, err);
        return false;
    }
}
// Set up connection monitoring
function setupConnectionMonitoring() {
    if (global.mongoConnectionMonitored) {
        return;
    }
    console.log("Initializing MongoDB connection monitoring...");
    mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection.on("connected", ()=>{
        console.log("Mongoose connected to MongoDB");
    });
    mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection.on("error", (err)=>{
        console.error("Mongoose connection error:", err);
    });
    mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection.on("disconnected", ()=>{
        console.log("Mongoose disconnected from MongoDB");
    });
    // Handle process termination
    process.on("SIGINT", async ()=>{
        await mongoose__WEBPACK_IMPORTED_MODULE_0___default().connection.close();
        console.log("Mongoose connection closed due to application termination");
        process.exit(0);
    });
    global.mongoConnectionMonitored = true;
    console.log("MongoDB connection monitoring initialized");
}
// Default export for backward compatibility
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (connectToMongoDB);


/***/ })

};
;