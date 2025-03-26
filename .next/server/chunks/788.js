"use strict";
exports.id = 788;
exports.ids = [788];
exports.modules = {

/***/ 5934:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   v: () => (/* binding */ FeatureMatcher)
/* harmony export */ });
class FeatureMatcher {
    /**
   * Match audio gear with cases based on features beyond dimensions
   */ matchFeatures(gear, cases, options = {}) {
        return cases.map((caseItem)=>{
            const featureScore = this.calculateFeatureScore(gear, caseItem, options);
            return {
                ...caseItem.toObject(),
                featureScore
            };
        }).sort((a, b)=>b.featureScore - a.featureScore);
    }
    /**
   * Calculate a feature compatibility score between gear and case
   */ calculateFeatureScore(gear, caseItem, options) {
        let score = 0;
        let totalFactors = 0;
        // Check for required features
        if (options.requireWaterproof) {
            totalFactors++;
            if (caseItem.waterproof) {
                score += 100;
            }
        }
        if (options.requireShockproof) {
            totalFactors++;
            if (caseItem.shockproof) {
                score += 100;
            }
        }
        if (options.requireHandle) {
            totalFactors++;
            if (caseItem.hasHandle) {
                score += 100;
            }
        }
        if (options.requireWheels) {
            totalFactors++;
            if (caseItem.hasWheels) {
                score += 100;
            }
        }
        // Check for padding (important for sensitive equipment)
        if (options.requirePadding) {
            totalFactors++;
            const hasPadding = this.checkForPadding(caseItem);
            if (hasPadding) {
                score += 100;
            }
        }
        // Check for compartments (useful for accessories)
        if (options.requireCompartments) {
            totalFactors++;
            const hasCompartments = this.checkForCompartments(caseItem);
            if (hasCompartments) {
                score += 100;
            }
        }
        // Check for preferred materials
        if (options.preferredMaterial && options.preferredMaterial.length > 0 && caseItem.material) {
            totalFactors++;
            const materialMatches = options.preferredMaterial.some((material)=>caseItem.material?.toLowerCase().includes(material.toLowerCase()));
            if (materialMatches) {
                score += 100;
            }
        }
        // Check for preferred colors
        if (options.preferredColor && options.preferredColor.length > 0 && caseItem.color) {
            totalFactors++;
            const colorMatches = options.preferredColor.some((color)=>caseItem.color?.toLowerCase().includes(color?.toLowerCase()));
            if (colorMatches) {
                score += 100;
            }
        }
        // Check weight (if gear is heavy, case should be sturdy)
        if (gear.weight && gear.weight.value && caseItem.weight && caseItem.weight.value) {
            totalFactors++;
            // Convert weights to the same unit if necessary
            const gearWeightLb = this.convertWeightToLb(gear.weight.value, gear.weight.unit || "lb");
            const caseWeightLb = this.convertWeightToLb(caseItem.weight.value, caseItem.weight.unit || "lb");
            // Case should be sturdy enough for the gear (we assume sturdier cases are heavier)
            // But not too heavy (ideally less than 50% of gear weight added)
            const weightRatio = caseWeightLb / gearWeightLb;
            if (weightRatio <= 0.5) {
                // Ideal weight ratio
                score += 100;
            } else if (weightRatio <= 0.75) {
                // Acceptable weight ratio
                score += 75;
            } else if (weightRatio <= 1.0) {
                // Heavy but still reasonable
                score += 50;
            } else {
                // Too heavy
                score += 25;
            }
        }
        // Check protection level based on gear value/category
        totalFactors++;
        const recommendedProtection = this.getRecommendedProtectionLevel(gear);
        if (caseItem.protectionLevel === recommendedProtection) {
            score += 100;
        } else if (recommendedProtection === "high" && caseItem.protectionLevel === "medium" || recommendedProtection === "medium" && caseItem.protectionLevel === "high") {
            // Close match
            score += 75;
        } else if (recommendedProtection === "medium" && caseItem.protectionLevel === "low" || recommendedProtection === "low" && caseItem.protectionLevel === "medium") {
            // Less ideal match
            score += 50;
        } else {
            // Poor match (high protection needed but low provided, or vice versa)
            score += 25;
        }
        // If no factors were checked, return a default score
        if (totalFactors === 0) {
            return 75; // Default moderate score
        }
        // Return the average score across all factors
        return Math.round(score / totalFactors);
    }
    /**
   * Check if a case has padding based on description and features
   */ checkForPadding(caseItem) {
        const paddingKeywords = [
            "padded",
            "padding",
            "foam",
            "cushion",
            "soft interior",
            "plush"
        ];
        // Check in description
        if (caseItem.description) {
            if (paddingKeywords.some((keyword)=>caseItem.description?.toLowerCase().includes(keyword))) {
                return true;
            }
        }
        // Check in features
        if (caseItem.features) {
            if (caseItem.features.some((feature)=>paddingKeywords.some((keyword)=>feature?.toLowerCase().includes(keyword)))) {
                return true;
            }
        }
        // Check in name
        if (paddingKeywords.some((keyword)=>caseItem.name?.toLowerCase().includes(keyword))) {
            return true;
        }
        return false;
    }
    /**
   * Check if a case has compartments based on description and features
   */ checkForCompartments(caseItem) {
        const compartmentKeywords = [
            "compartment",
            "pocket",
            "divider",
            "section",
            "organizer"
        ];
        // Check in description
        if (caseItem.description) {
            if (compartmentKeywords.some((keyword)=>caseItem.description?.toLowerCase().includes(keyword))) {
                return true;
            }
        }
        // Check in features
        if (caseItem.features) {
            if (caseItem.features.some((feature)=>compartmentKeywords.some((keyword)=>feature?.toLowerCase().includes(keyword)))) {
                return true;
            }
        }
        // Check in name
        if (compartmentKeywords.some((keyword)=>caseItem.name?.toLowerCase().includes(keyword))) {
            return true;
        }
        return false;
    }
    /**
   * Convert weight to pounds for comparison
   */ convertWeightToLb(value, unit) {
        switch(unit.toLowerCase()){
            case "kg":
                return value * 2.20462;
            case "g":
                return value * 0.00220462;
            case "oz":
                return value * 0.0625;
            case "lb":
            default:
                return value;
        }
    }
    /**
   * Determine recommended protection level based on gear type and characteristics
   */ getRecommendedProtectionLevel(gear) {
        // High-value or sensitive equipment needs high protection
        if (gear.category === "Synthesizer" || gear.category === "Mixer" || gear.type?.includes("Analog") || gear.type?.includes("Vintage")) {
            return "high";
        }
        // Medium-value equipment needs medium protection
        if (gear.category === "Drum Machine" || gear.category === "Audio Interface" || gear.type?.includes("Digital")) {
            return "medium";
        }
        // Lower-value or robust equipment can use low protection
        if (gear.category === "Effects Pedal" || gear.type?.includes("Pedal")) {
            return "low";
        }
        // Default to medium protection
        return "medium";
    }
}


/***/ }),

/***/ 2755:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   o: () => (/* binding */ ProductMatcher)
/* harmony export */ });
/* harmony import */ var _models_gear_models__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6338);

class ProductMatcher {
    /**
   * Find compatible cases for a specific audio gear item
   */ async findCompatibleCases(gear, options = {}) {
        // If gear is a string (ID), fetch the gear details
        let gearItem;
        if (typeof gear === "string") {
            const foundGear = await _models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .AudioGear */ .a1.findById(gear);
            if (!foundGear) {
                throw new Error(`Audio gear with ID ${gear} not found`);
            }
            gearItem = foundGear;
        } else {
            gearItem = gear;
        }
        // Set default options
        const defaultOptions = {
            minCompatibilityScore: 70,
            maxResults: 20,
            sortBy: "compatibilityScore",
            sortDirection: "desc"
        };
        const mergedOptions = {
            ...defaultOptions,
            ...options
        };
        // Build the query for finding compatible cases
        const query = {};
        // Ensure the internal dimensions of the case are larger than the gear dimensions
        // Add a small buffer (0.5 inches) to account for padding
        const buffer = 0.5;
        query["internalDimensions.length"] = {
            $gte: gearItem.dimensions.length + buffer
        };
        query["internalDimensions.width"] = {
            $gte: gearItem.dimensions.width + buffer
        };
        query["internalDimensions.height"] = {
            $gte: gearItem.dimensions.height + buffer
        };
        // Apply additional filters based on options
        if (mergedOptions.maxPriceUSD) {
            query.price = {
                $lte: mergedOptions.maxPriceUSD
            };
            query.currency = "USD"; // Only consider USD prices for simplicity
        }
        if (mergedOptions.preferredProtectionLevel) {
            query.protectionLevel = mergedOptions.preferredProtectionLevel;
        }
        if (mergedOptions.allowWaterproof !== undefined) {
            query.waterproof = mergedOptions.allowWaterproof;
        }
        if (mergedOptions.allowShockproof !== undefined) {
            query.shockproof = mergedOptions.allowShockproof;
        }
        if (mergedOptions.requireHandle) {
            query.hasHandle = true;
        }
        if (mergedOptions.requireWheels) {
            query.hasWheels = true;
        }
        if (mergedOptions.preferredBrands && mergedOptions.preferredBrands.length > 0) {
            query.brand = {
                $in: mergedOptions.preferredBrands
            };
        }
        // Find cases that match the criteria
        const cases = await _models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .Case */ .JZ.find(query);
        // Calculate compatibility score for each case
        const scoredCases = cases.map((caseItem)=>{
            const score = this.calculateCompatibilityScore(gearItem, caseItem, mergedOptions);
            return {
                ...caseItem.toObject(),
                compatibilityScore: score
            };
        });
        // Filter by minimum compatibility score
        const filteredCases = scoredCases.filter((caseItem)=>caseItem.compatibilityScore >= (mergedOptions.minCompatibilityScore || 70));
        // Sort the results
        const sortField = mergedOptions.sortBy || "compatibilityScore";
        const sortDirection = mergedOptions.sortDirection === "asc" ? 1 : -1;
        filteredCases.sort((a, b)=>{
            if (sortField === "compatibilityScore") {
                return sortDirection * (b.compatibilityScore - a.compatibilityScore);
            } else if (sortField === "price") {
                return sortDirection * (a.price - b.price);
            } else if (sortField === "rating") {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                return sortDirection * (ratingB - ratingA);
            }
            return 0;
        });
        // Limit the number of results
        const limitedResults = filteredCases.slice(0, mergedOptions.maxResults);
        // Save the matches to the database
        await this.saveMatches(gearItem, limitedResults);
        return limitedResults;
    }
    /**
   * Calculate compatibility score between gear and case
   */ calculateCompatibilityScore(gear, caseItem, options = {}) {
        // Calculate dimension fit percentages
        const lengthFit = gear.dimensions.length / caseItem.internalDimensions.length * 100;
        const widthFit = gear.dimensions.width / caseItem.internalDimensions.width * 100;
        const heightFit = gear.dimensions.height / caseItem.internalDimensions.height * 100;
        // Calculate overall fit (average of all dimensions)
        const overallFit = (lengthFit + widthFit + heightFit) / 3;
        // Ideal fit is between 70% and 90% of the case's internal dimensions
        // Too small means the gear will move around, too tight means it might not fit
        let dimensionScore = 0;
        if (overallFit >= 70 && overallFit <= 90) {
            dimensionScore = 100; // Perfect fit
        } else if (overallFit < 70) {
            // Too small, score decreases as fit percentage decreases
            dimensionScore = 70 + overallFit / 70 * 30;
        } else if (overallFit > 90 && overallFit <= 100) {
            // Too tight, but still fits
            dimensionScore = 100 - (overallFit - 90) * 10;
        } else {
            // Won't fit
            dimensionScore = 0;
        }
        // Protection level score
        let protectionScore = 0;
        if (caseItem.protectionLevel === "high") {
            protectionScore = 100;
        } else if (caseItem.protectionLevel === "medium") {
            protectionScore = 75;
        } else if (caseItem.protectionLevel === "low") {
            protectionScore = 50;
        }
        // Feature score
        let featureScore = 0;
        const desiredFeatures = options.preferredFeatures || [];
        if (desiredFeatures.length > 0 && caseItem.features && Array.isArray(caseItem.features)) {
            const matchedFeatures = desiredFeatures.filter((feature)=>caseItem.features.some((caseFeature)=>caseFeature?.toLowerCase().includes(feature?.toLowerCase())));
            featureScore = matchedFeatures.length / desiredFeatures.length * 100;
        } else {
            featureScore = 75; // Default if no specific features are requested
        }
        // Rating score
        let ratingScore = 0;
        if (caseItem.rating) {
            ratingScore = caseItem.rating / 5 * 100;
        } else {
            ratingScore = 50; // Default if no rating
        }
        // Calculate final score with different weights
        const finalScore = dimensionScore * 0.4 + // Dimension fit is most important
        protectionScore * 0.25 + // Protection level is important
        featureScore * 0.2 + // Features are somewhat important
        ratingScore * 0.15 // Rating is least important
        ;
        return Math.round(finalScore);
    }
    /**
   * Calculate dimension fit between gear and case
   */ calculateDimensionFit(gear, caseItem) {
        return {
            length: gear.dimensions.length / caseItem.internalDimensions.length * 100,
            width: gear.dimensions.width / caseItem.internalDimensions.width * 100,
            height: gear.dimensions.height / caseItem.internalDimensions.height * 100,
            overall: (gear.dimensions.length / caseItem.internalDimensions.length + gear.dimensions.width / caseItem.internalDimensions.width + gear.dimensions.height / caseItem.internalDimensions.height) / 3 * 100
        };
    }
    /**
   * Determine price category for a case
   */ determinePriceCategory(caseItem) {
        let priceCategory = "mid-range";
        if (caseItem.price !== undefined) {
            if (caseItem.price < 50) {
                priceCategory = "budget";
            } else if (caseItem.price > 150) {
                priceCategory = "premium";
            }
        }
        return priceCategory;
    }
    /**
   * Save matches to the database for future reference
   */ async saveMatches(gear, cases) {
        const bulkOps = cases.map((caseItem)=>{
            const dimensionFit = this.calculateDimensionFit(gear, caseItem);
            const priceCategory = this.determinePriceCategory(caseItem);
            return {
                updateOne: {
                    filter: {
                        gearId: gear._id,
                        caseId: caseItem._id
                    },
                    update: {
                        $set: {
                            compatibilityScore: caseItem.compatibilityScore,
                            dimensionFit,
                            priceCategory,
                            protectionLevel: caseItem.protectionLevel || "medium",
                            features: caseItem.features || []
                        }
                    },
                    upsert: true
                }
            };
        });
        if (bulkOps.length > 0) {
            await _models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .GearCaseMatch */ .aX.bulkWrite(bulkOps);
        }
    }
    /**
   * Find audio gear by name, brand, or type
   */ async findAudioGear(searchTerm, options = {}) {
        const query = {};
        if (searchTerm) {
            query.$or = [
                {
                    name: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                },
                {
                    brand: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                },
                {
                    type: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                }
            ];
        }
        if (options.category) {
            query.category = options.category;
        }
        if (options.brand) {
            query.brand = options.brand;
        }
        return _models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .AudioGear */ .a1.find(query).limit(options.limit || 20).sort({
            popularity: -1
        });
    }
    /**
   * Find cases by name, brand, or type
   */ async findCases(searchTerm, options = {}) {
        const query = {};
        if (searchTerm) {
            query.$or = [
                {
                    name: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                },
                {
                    brand: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                },
                {
                    type: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                }
            ];
        }
        if (options.type) {
            query.type = options.type;
        }
        if (options.brand) {
            query.brand = options.brand;
        }
        if (options.minPrice !== undefined || options.maxPrice !== undefined) {
            query.price = {};
            if (options.minPrice !== undefined) {
                query.price.$gte = options.minPrice;
            }
            if (options.maxPrice !== undefined) {
                query.price.$lte = options.maxPrice;
            }
        }
        if (options.protectionLevel) {
            query.protectionLevel = options.protectionLevel;
        }
        return _models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .Case */ .JZ.find(query).limit(options.limit || 20).sort({
            rating: -1
        });
    }
    /**
   * Get popular matches (most viewed or highest compatibility)
   */ async getPopularMatches(limit = 10) {
        const matches = await _models_gear_models__WEBPACK_IMPORTED_MODULE_0__/* .GearCaseMatch */ .aX.find().sort({
            compatibilityScore: -1
        }).limit(limit).populate("gearId").populate("caseId");
        return matches.map((match)=>({
                gear: match.gearId,
                case: match.caseId,
                compatibilityScore: match.compatibilityScore,
                dimensionFit: match.dimensionFit,
                priceCategory: match.priceCategory,
                protectionLevel: match.protectionLevel
            }));
    }
}


/***/ }),

/***/ 8788:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $: () => (/* binding */ RecommendationEngine)
/* harmony export */ });
/* harmony import */ var _product_matcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2755);
/* harmony import */ var _feature_matcher__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5934);


class RecommendationEngine {
    constructor(){
        this.productMatcher = new _product_matcher__WEBPACK_IMPORTED_MODULE_0__/* .ProductMatcher */ .o();
        this.featureMatcher = new _feature_matcher__WEBPACK_IMPORTED_MODULE_1__/* .FeatureMatcher */ .v();
    }
    /**
   * Generate alternative case recommendations beyond the primary matches
   */ async generateAlternativeRecommendations(gear, primaryMatch, options = {}) {
        // Set default options
        const defaultOptions = {
            maxAlternatives: 5,
            includeUpgrades: true,
            includeBudgetOptions: true,
            includeAlternativeSizes: true,
            maxPriceDifferencePercent: 50,
            minCompatibilityScore: 70
        };
        const mergedOptions = {
            ...defaultOptions,
            ...options
        };
        const recommendations = [];
        // Find budget alternatives (similar protection but lower price)
        if (mergedOptions.includeBudgetOptions) {
            const budgetOptions = await this.findBudgetAlternatives(gear, primaryMatch, mergedOptions);
            recommendations.push(...budgetOptions.map((item)=>({
                    ...item,
                    recommendationType: "budget"
                })));
        }
        // Find premium upgrades (better protection or features)
        if (mergedOptions.includeUpgrades) {
            const upgradeOptions = await this.findPremiumUpgrades(gear, primaryMatch, mergedOptions);
            recommendations.push(...upgradeOptions.map((item)=>({
                    ...item,
                    recommendationType: "premium"
                })));
        }
        // Find alternative sizes (different form factors)
        if (mergedOptions.includeAlternativeSizes) {
            const sizeAlternatives = await this.findSizeAlternatives(gear, primaryMatch, mergedOptions);
            recommendations.push(...sizeAlternatives.map((item)=>({
                    ...item,
                    recommendationType: "alternative_size"
                })));
        }
        // Filter by brand preferences if specified
        let filteredRecommendations = recommendations;
        if (mergedOptions.preferredBrands && mergedOptions.preferredBrands.length > 0) {
            filteredRecommendations = filteredRecommendations.filter((item)=>item.brand && mergedOptions.preferredBrands.includes(item.brand));
        }
        if (mergedOptions.excludedBrands && mergedOptions.excludedBrands.length > 0) {
            filteredRecommendations = filteredRecommendations.filter((item)=>!item.brand || !mergedOptions.excludedBrands.includes(item.brand));
        }
        // Sort by compatibility score and limit results
        filteredRecommendations.sort((a, b)=>b.compatibilityScore - a.compatibilityScore);
        return filteredRecommendations.slice(0, mergedOptions.maxAlternatives);
    }
    /**
   * Find budget alternatives to the primary match
   */ async findBudgetAlternatives(gear, primaryMatch, options) {
        // Calculate the minimum price (e.g., 20% lower than primary match)
        const minPrice = primaryMatch.price * 0.6;
        const maxPrice = primaryMatch.price * 0.9;
        // Find cases with similar protection level but lower price
        const matchingOptions = {
            minCompatibilityScore: options.minCompatibilityScore,
            preferredProtectionLevel: primaryMatch.protectionLevel,
            maxPriceUSD: maxPrice,
            maxResults: 3,
            sortBy: "price",
            sortDirection: "asc"
        };
        const budgetAlternatives = await this.productMatcher.findCompatibleCases(gear, matchingOptions);
        // Filter out cases that are too cheap (might be poor quality)
        return budgetAlternatives.filter((item)=>item.price >= minPrice && item.price < primaryMatch.price);
    }
    /**
   * Find premium upgrades to the primary match
   */ async findPremiumUpgrades(gear, primaryMatch, options) {
        // Calculate the maximum price (e.g., up to 50% more than primary match)
        const maxPriceDiff = options.maxPriceDifferencePercent / 100;
        const maxPrice = primaryMatch.price * (1 + maxPriceDiff);
        const minPrice = primaryMatch.price * 1.1; // At least 10% more expensive
        // Determine if we should upgrade the protection level
        let preferredProtectionLevel = primaryMatch.protectionLevel;
        if (primaryMatch.protectionLevel === "low") {
            preferredProtectionLevel = "medium";
        } else if (primaryMatch.protectionLevel === "medium") {
            preferredProtectionLevel = "high";
        }
        // Find cases with better protection level and higher price
        const matchingOptions = {
            minCompatibilityScore: options.minCompatibilityScore,
            preferredProtectionLevel,
            maxResults: 3,
            sortBy: "compatibilityScore",
            sortDirection: "desc"
        };
        const premiumAlternatives = await this.productMatcher.findCompatibleCases(gear, matchingOptions);
        // Filter by price range
        return premiumAlternatives.filter((item)=>item.price >= minPrice && item.price <= maxPrice);
    }
    /**
   * Find alternatives with different form factors
   */ async findSizeAlternatives(gear, primaryMatch, options) {
        // Find cases with different dimensions but still compatible
        const matchingOptions = {
            minCompatibilityScore: options.minCompatibilityScore,
            maxResults: 5,
            sortBy: "compatibilityScore",
            sortDirection: "desc"
        };
        const allCompatibleCases = await this.productMatcher.findCompatibleCases(gear, matchingOptions);
        // Filter out cases that are too similar to the primary match
        return allCompatibleCases.filter((item)=>{
            // Skip the primary match itself
            if (item.id === primaryMatch.id) return false;
            // Calculate dimension differences
            const lengthDiff = Math.abs(item.internalDimensions.length - primaryMatch.internalDimensions.length);
            const widthDiff = Math.abs(item.internalDimensions.width - primaryMatch.internalDimensions.width);
            const heightDiff = Math.abs(item.internalDimensions.height - primaryMatch.internalDimensions.height);
            // Consider it different if any dimension differs by more than 20%
            const lengthDiffPercent = lengthDiff / primaryMatch.internalDimensions.length * 100;
            const widthDiffPercent = widthDiff / primaryMatch.internalDimensions.width * 100;
            const heightDiffPercent = heightDiff / primaryMatch.internalDimensions.height * 100;
            return lengthDiffPercent > 20 || widthDiffPercent > 20 || heightDiffPercent > 20;
        });
    }
    /**
   * Calculate confidence score for a match
   * This indicates how confident we are that this case is a good match for the gear
   */ calculateConfidenceScore(gear, caseItem) {
        let confidenceScore = 0;
        // Base confidence on compatibility score (50% weight)
        confidenceScore += caseItem.compatibilityScore * 0.5;
        // Check if the case is explicitly designed for this type of gear (20% weight)
        const gearTypeKeywords = [
            gear.type?.toLowerCase(),
            gear.category?.toLowerCase(),
            ...gear.name?.toLowerCase().split(" ")
        ];
        const caseDescription = caseItem.description?.toLowerCase() || "";
        const caseName = caseItem.name?.toLowerCase() || "";
        const isExplicitlyDesigned = gearTypeKeywords.some((keyword)=>keyword && (caseDescription.includes(keyword) || caseName.includes(keyword)) && (caseDescription.includes("case") || caseName.includes("case")));
        if (isExplicitlyDesigned) {
            confidenceScore += 20;
        }
        // Check if dimensions are a very close fit (15% weight)
        const lengthFit = gear.dimensions.length / caseItem.internalDimensions.length * 100;
        const widthFit = gear.dimensions.width / caseItem.internalDimensions.width * 100;
        const heightFit = gear.dimensions.height / caseItem.internalDimensions.height * 100;
        const dimensionFitScore = (this.getDimensionFitScore(lengthFit) + this.getDimensionFitScore(widthFit) + this.getDimensionFitScore(heightFit)) / 3;
        confidenceScore += dimensionFitScore * 0.15;
        // Check if the case has appropriate features for this gear (15% weight)
        const featureScore = this.getFeatureAppropriatenessScore(gear, caseItem);
        confidenceScore += featureScore * 0.15;
        // Ensure the score is between 0 and 100
        return Math.min(100, Math.max(0, Math.round(confidenceScore)));
    }
    /**
   * Get a score for how well a dimension fits (0-100)
   */ getDimensionFitScore(fitPercentage) {
        // Ideal fit is between 75% and 90%
        if (fitPercentage >= 75 && fitPercentage <= 90) {
            return 100;
        } else if (fitPercentage > 90 && fitPercentage <= 95) {
            return 80; // A bit tight but still good
        } else if (fitPercentage >= 70 && fitPercentage < 75) {
            return 80; // A bit loose but still good
        } else if (fitPercentage > 95 && fitPercentage <= 100) {
            return 60; // Very tight fit
        } else if (fitPercentage >= 60 && fitPercentage < 70) {
            return 60; // Very loose fit
        } else {
            return 30; // Poor fit
        }
    }
    /**
   * Get a score for how appropriate the case features are for this gear
   */ getFeatureAppropriatenessScore(gear, caseItem) {
        let score = 0;
        // Synthesizers and mixers need padding and possibly compartments
        if (gear.category === "Synthesizer" || gear.category === "Mixer") {
            if (this.hasFeature(caseItem, [
                "padded",
                "padding",
                "foam"
            ])) score += 40;
            if (this.hasFeature(caseItem, [
                "compartment",
                "pocket"
            ])) score += 30;
            if (caseItem.hasHandle) score += 30;
        } else if (gear.category === "Drum Machine") {
            if (this.hasFeature(caseItem, [
                "padded",
                "padding",
                "foam"
            ])) score += 30;
            if (caseItem.shockproof) score += 40;
            if (this.hasFeature(caseItem, [
                "compartment",
                "pocket"
            ])) score += 30;
        } else if (gear.category === "Effects Pedal") {
            if (this.hasFeature(caseItem, [
                "pedalboard",
                "pedal board"
            ])) score += 50;
            if (this.hasFeature(caseItem, [
                "loop",
                "velcro",
                "hook and loop"
            ])) score += 30;
            if (this.hasFeature(caseItem, [
                "power",
                "supply"
            ])) score += 20;
        } else if (gear.category === "Audio Interface") {
            if (this.hasFeature(caseItem, [
                "padded",
                "padding",
                "foam"
            ])) score += 30;
            if (this.hasFeature(caseItem, [
                "cable",
                "compartment",
                "pocket"
            ])) score += 40;
            if (caseItem.waterproof) score += 30;
        } else {
            if (this.hasFeature(caseItem, [
                "padded",
                "padding",
                "foam"
            ])) score += 40;
            if (caseItem.hasHandle) score += 30;
            if (this.hasFeature(caseItem, [
                "compartment",
                "pocket"
            ])) score += 30;
        }
        return Math.min(100, score);
    }
    /**
   * Check if a case has specific features
   */ hasFeature(caseItem, keywords) {
        // Check in description
        if (caseItem.description) {
            if (keywords.some((keyword)=>caseItem.description?.toLowerCase().includes(keyword))) {
                return true;
            }
        }
        // Check in features
        if (caseItem.features) {
            if (caseItem.features.some((feature)=>keywords.some((keyword)=>feature?.toLowerCase().includes(keyword)))) {
                return true;
            }
        }
        // Check in name
        if (keywords.some((keyword)=>caseItem.name?.toLowerCase().includes(keyword))) {
            return true;
        }
        return false;
    }
}


/***/ })

};
;