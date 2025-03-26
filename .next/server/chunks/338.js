"use strict";
exports.id = 338;
exports.ids = [338];
exports.modules = {

/***/ 6338:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   JZ: () => (/* binding */ Case),
/* harmony export */   a1: () => (/* binding */ AudioGear),
/* harmony export */   aX: () => (/* binding */ GearCaseMatch)
/* harmony export */ });
/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1185);
/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);

// Audio Gear schema
const AudioGearSchema = new mongoose__WEBPACK_IMPORTED_MODULE_0__.Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    dimensions: {
        length: {
            type: Number,
            required: true
        },
        width: {
            type: Number,
            required: true
        },
        height: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true
        }
    },
    weight: {
        value: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true
        }
    },
    imageUrl: {
        type: String
    },
    productUrl: {
        type: String
    },
    description: {
        type: String
    },
    popularity: {
        type: Number
    },
    releaseYear: {
        type: Number
    },
    discontinued: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Case schema
const CaseSchema = new mongoose__WEBPACK_IMPORTED_MODULE_0__.Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    dimensions: {
        interior: {
            length: {
                type: Number,
                required: true
            },
            width: {
                type: Number,
                required: true
            },
            height: {
                type: Number,
                required: true
            },
            unit: {
                type: String,
                required: true
            }
        },
        exterior: {
            length: {
                type: Number
            },
            width: {
                type: Number
            },
            height: {
                type: Number
            },
            unit: {
                type: String
            }
        }
    },
    // Add internalDimensions to schema to match interface
    internalDimensions: {
        length: {
            type: Number
        },
        width: {
            type: Number
        },
        height: {
            type: Number
        },
        unit: {
            type: String
        }
    },
    externalDimensions: {
        length: {
            type: Number
        },
        width: {
            type: Number
        },
        height: {
            type: Number
        },
        unit: {
            type: String
        }
    },
    weight: {
        value: {
            type: Number
        },
        unit: {
            type: String
        }
    },
    features: [
        {
            type: String
        }
    ],
    price: {
        type: Number
    },
    currency: {
        type: String
    },
    rating: {
        type: Number
    },
    reviewCount: {
        type: Number
    },
    imageUrl: {
        type: String
    },
    productUrl: {
        type: String
    },
    description: {
        type: String
    },
    protectionLevel: {
        type: String,
        enum: [
            "low",
            "medium",
            "high"
        ]
    },
    waterproof: {
        type: Boolean,
        default: false
    },
    shockproof: {
        type: Boolean,
        default: false
    },
    hasPadding: {
        type: Boolean,
        default: false
    },
    hasCompartments: {
        type: Boolean,
        default: false
    },
    hasHandle: {
        type: Boolean,
        default: false
    },
    hasWheels: {
        type: Boolean,
        default: false
    },
    hasLock: {
        type: Boolean,
        default: false
    },
    material: {
        type: String
    },
    color: {
        type: String
    },
    marketplace: {
        type: String
    },
    url: {
        type: String
    },
    imageUrls: [
        {
            type: String
        }
    ],
    availability: {
        type: String
    },
    seller: {
        name: {
            type: String
        },
        url: {
            type: String
        },
        rating: {
            type: Number
        }
    }
}, {
    timestamps: true
});
// Gear-Case Match schema
const GearCaseMatchSchema = new mongoose__WEBPACK_IMPORTED_MODULE_0__.Schema({
    gearId: {
        type: String,
        required: true
    },
    caseId: {
        type: String,
        required: true
    },
    compatibilityScore: {
        type: Number,
        required: true
    },
    dimensionScore: {
        type: Number,
        required: true
    },
    featureScore: {
        type: Number,
        required: true
    },
    userFeedbackScore: {
        type: Number,
        default: 0
    },
    totalFeedback: {
        type: Number,
        default: 0
    },
    positiveCount: {
        type: Number,
        default: 0
    },
    negativeCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
// Create index for unique gear-case combinations
GearCaseMatchSchema.index({
    gearId: 1,
    caseId: 1
}, {
    unique: true
});
// Create and export models
const AudioGear = mongoose__WEBPACK_IMPORTED_MODULE_0__.models.AudioGear || (0,mongoose__WEBPACK_IMPORTED_MODULE_0__.model)("AudioGear", AudioGearSchema);
const Case = mongoose__WEBPACK_IMPORTED_MODULE_0__.models.Case || (0,mongoose__WEBPACK_IMPORTED_MODULE_0__.model)("Case", CaseSchema);
const GearCaseMatch = mongoose__WEBPACK_IMPORTED_MODULE_0__.models.GearCaseMatch || (0,mongoose__WEBPACK_IMPORTED_MODULE_0__.model)("GearCaseMatch", GearCaseMatchSchema);


/***/ })

};
;