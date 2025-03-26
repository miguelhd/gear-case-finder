"use strict";
exports.id = 939;
exports.ids = [939];
exports.modules = {

/***/ 5939:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  bZ: () => (/* reexport */ components_Alert),
  Ct: () => (/* reexport */ components_Badge),
  zx: () => (/* reexport */ components_Button),
  Zb: () => (/* reexport */ components_Card),
  XZ: () => (/* reexport */ components_Checkbox),
  tl: () => (/* reexport */ components_Pagination),
  Ph: () => (/* reexport */ components_Select),
  $j: () => (/* reexport */ components_Spinner)
});

// UNUSED EXPORTS: Input, RangeSlider

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(5893);
// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(6689);
var external_react_default = /*#__PURE__*/__webpack_require__.n(external_react_);
// EXTERNAL MODULE: ./node_modules/next/link.js
var next_link = __webpack_require__(1664);
var link_default = /*#__PURE__*/__webpack_require__.n(next_link);
// EXTERNAL MODULE: ./node_modules/next/image.js
var next_image = __webpack_require__(5675);
var image_default = /*#__PURE__*/__webpack_require__.n(next_image);
;// CONCATENATED MODULE: ./src/components/ui/components/Card.tsx




const Card = ({ title, image, description, link, badges, price, rating, reviewCount })=>{
    return /*#__PURE__*/ jsx_runtime.jsx((link_default()), {
        href: link,
        children: /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
            className: "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col",
            children: [
                image && /*#__PURE__*/ jsx_runtime.jsx("div", {
                    className: "relative h-48 w-full",
                    children: /*#__PURE__*/ jsx_runtime.jsx((image_default()), {
                        src: image,
                        alt: title,
                        layout: "fill",
                        objectFit: "cover",
                        className: "transition-opacity duration-300 hover:opacity-90"
                    })
                }),
                /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                    className: "p-4 flex-grow",
                    children: [
                        /*#__PURE__*/ jsx_runtime.jsx("h3", {
                            className: "text-lg font-semibold text-gray-900 dark:text-white mb-2",
                            children: title
                        }),
                        badges && badges.length > 0 && /*#__PURE__*/ jsx_runtime.jsx("div", {
                            className: "flex flex-wrap gap-1 mb-2",
                            children: badges.map((badge, index)=>/*#__PURE__*/ jsx_runtime.jsx("span", {
                                    className: "px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
                                    children: badge
                                }, index))
                        }),
                        price && /*#__PURE__*/ jsx_runtime.jsx("p", {
                            className: "text-sm font-medium text-gray-900 dark:text-white mb-1",
                            children: price
                        }),
                        rating !== undefined && /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                            className: "flex items-center mb-1",
                            children: [
                                /*#__PURE__*/ jsx_runtime.jsx("div", {
                                    className: "flex items-center",
                                    children: [
                                        ...Array(5)
                                    ].map((_, i)=>/*#__PURE__*/ jsx_runtime.jsx("svg", {
                                            className: `w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`,
                                            fill: "currentColor",
                                            viewBox: "0 0 20 20",
                                            children: /*#__PURE__*/ jsx_runtime.jsx("path", {
                                                d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                            })
                                        }, i))
                                }),
                                reviewCount !== undefined && /*#__PURE__*/ (0,jsx_runtime.jsxs)("span", {
                                    className: "text-xs text-gray-500 dark:text-gray-400 ml-1",
                                    children: [
                                        "(",
                                        reviewCount,
                                        ")"
                                    ]
                                })
                            ]
                        }),
                        description && /*#__PURE__*/ jsx_runtime.jsx("p", {
                            className: "text-sm text-gray-600 dark:text-gray-300",
                            children: description
                        })
                    ]
                })
            ]
        })
    });
};
/* harmony default export */ const components_Card = (Card);

;// CONCATENATED MODULE: ./src/components/ui/components/Button.tsx


const Button = ({ children, onClick, variant = "primary", size = "md", fullWidth = false, disabled = false, type = "button", className = "" })=>{
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
    const variantClasses = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
        outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
    };
    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
    };
    const widthClass = fullWidth ? "w-full" : "";
    const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
    return /*#__PURE__*/ jsx_runtime.jsx("button", {
        type: type,
        onClick: onClick,
        disabled: disabled,
        className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`,
        children: children
    });
};
/* harmony default export */ const components_Button = (Button);

;// CONCATENATED MODULE: ./src/components/ui/components/Badge.tsx


const Badge = ({ children, color = "blue", size = "md" })=>{
    const colorClasses = {
        blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    };
    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-base"
    };
    return /*#__PURE__*/ jsx_runtime.jsx("span", {
        className: `inline-flex items-center rounded-full font-medium ${colorClasses[color]} ${sizeClasses[size]}`,
        children: children
    });
};
/* harmony default export */ const components_Badge = (Badge);

;// CONCATENATED MODULE: ./src/components/ui/components/Input.tsx


const Input = ({ id, label, type = "text", placeholder, value, onChange, error, required = false, disabled = false, className = "" })=>{
    return /*#__PURE__*/ _jsxs("div", {
        className: className,
        children: [
            label && /*#__PURE__*/ _jsxs("label", {
                htmlFor: id,
                className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                children: [
                    label,
                    " ",
                    required && /*#__PURE__*/ _jsx("span", {
                        className: "text-red-500",
                        children: "*"
                    })
                ]
            }),
            /*#__PURE__*/ _jsx("input", {
                id: id,
                type: type,
                placeholder: placeholder,
                value: value,
                onChange: onChange,
                disabled: disabled,
                required: required,
                className: `block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm ${error ? "border-red-500" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`
            }),
            error && /*#__PURE__*/ _jsx("p", {
                className: "mt-1 text-sm text-red-600 dark:text-red-400",
                children: error
            })
        ]
    });
};
/* harmony default export */ const components_Input = ((/* unused pure expression or super */ null && (Input)));

;// CONCATENATED MODULE: ./src/components/ui/components/Select.tsx


const Select = ({ id, label, options, value, onChange, error, required = false, disabled = false, className = "" })=>{
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
        className: className,
        children: [
            label && /*#__PURE__*/ (0,jsx_runtime.jsxs)("label", {
                htmlFor: id,
                className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                children: [
                    label,
                    " ",
                    required && /*#__PURE__*/ jsx_runtime.jsx("span", {
                        className: "text-red-500",
                        children: "*"
                    })
                ]
            }),
            /*#__PURE__*/ jsx_runtime.jsx("select", {
                id: id,
                value: value,
                onChange: onChange,
                disabled: disabled,
                required: required,
                className: `block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm ${error ? "border-red-500" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`,
                children: options.map((option)=>/*#__PURE__*/ jsx_runtime.jsx("option", {
                        value: option.value,
                        children: option.label
                    }, option.value))
            }),
            error && /*#__PURE__*/ jsx_runtime.jsx("p", {
                className: "mt-1 text-sm text-red-600 dark:text-red-400",
                children: error
            })
        ]
    });
};
/* harmony default export */ const components_Select = (Select);

;// CONCATENATED MODULE: ./src/components/ui/components/Checkbox.tsx


const Checkbox = ({ id, label, checked, onChange, disabled = false, className = "", indeterminate = false })=>{
    const inputRef = external_react_default().useRef(null);
    external_react_default().useEffect(()=>{
        if (inputRef.current) {
            inputRef.current.indeterminate = indeterminate;
        }
    }, [
        indeterminate
    ]);
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
        className: `flex items-center ${className}`,
        children: [
            /*#__PURE__*/ jsx_runtime.jsx("input", {
                ref: inputRef,
                id: id,
                type: "checkbox",
                checked: checked,
                onChange: onChange,
                disabled: disabled,
                className: `h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`
            }),
            /*#__PURE__*/ jsx_runtime.jsx("label", {
                htmlFor: id,
                className: `ml-2 block text-sm text-gray-700 dark:text-gray-300 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`,
                children: label
            })
        ]
    });
};
/* harmony default export */ const components_Checkbox = (Checkbox);

;// CONCATENATED MODULE: ./src/components/ui/components/RangeSlider.tsx


const RangeSlider = ({ id, label, min, max, step = 1, value, onChange, showValue = true, disabled = false, className = "" })=>{
    return /*#__PURE__*/ _jsxs("div", {
        className: className,
        children: [
            /*#__PURE__*/ _jsxs("div", {
                className: "flex justify-between items-center",
                children: [
                    label && /*#__PURE__*/ _jsx("label", {
                        htmlFor: id,
                        className: "block text-sm font-medium text-gray-700 dark:text-gray-300",
                        children: label
                    }),
                    showValue && /*#__PURE__*/ _jsx("span", {
                        className: "text-sm text-gray-500 dark:text-gray-400",
                        children: value
                    })
                ]
            }),
            /*#__PURE__*/ _jsx("input", {
                id: id,
                type: "range",
                min: min,
                max: max,
                step: step,
                value: value,
                onChange: onChange,
                disabled: disabled,
                className: `w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`
            })
        ]
    });
};
/* harmony default export */ const components_RangeSlider = ((/* unused pure expression or super */ null && (RangeSlider)));

;// CONCATENATED MODULE: ./src/components/ui/components/Spinner.tsx


const Spinner = ({ size = "md", color = "primary", className = "" })=>{
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    };
    const colorClasses = {
        primary: "text-indigo-600",
        secondary: "text-gray-600",
        white: "text-white"
    };
    return /*#__PURE__*/ jsx_runtime.jsx("div", {
        className: `inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`,
        role: "status",
        children: /*#__PURE__*/ jsx_runtime.jsx("span", {
            className: "sr-only",
            children: "Loading..."
        })
    });
};
/* harmony default export */ const components_Spinner = (Spinner);

;// CONCATENATED MODULE: ./src/components/ui/components/Alert.tsx


const Alert = ({ children, title, type = "info", onClose, className = "" })=>{
    const typeClasses = {
        info: "bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        success: "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200",
        warning: "bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        error: "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    const iconClasses = {
        info: "text-blue-400 dark:text-blue-300",
        success: "text-green-400 dark:text-green-300",
        warning: "text-yellow-400 dark:text-yellow-300",
        error: "text-red-400 dark:text-red-300"
    };
    return /*#__PURE__*/ jsx_runtime.jsx("div", {
        className: `rounded-md p-4 ${typeClasses[type]} ${className}`,
        role: "alert",
        children: /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
            className: "flex",
            children: [
                /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                    className: "flex-shrink-0",
                    children: [
                        type === "info" && /*#__PURE__*/ jsx_runtime.jsx("svg", {
                            className: `h-5 w-5 ${iconClasses[type]}`,
                            xmlns: "http://www.w3.org/2000/svg",
                            viewBox: "0 0 20 20",
                            fill: "currentColor",
                            children: /*#__PURE__*/ jsx_runtime.jsx("path", {
                                fillRule: "evenodd",
                                d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
                                clipRule: "evenodd"
                            })
                        }),
                        type === "success" && /*#__PURE__*/ jsx_runtime.jsx("svg", {
                            className: `h-5 w-5 ${iconClasses[type]}`,
                            xmlns: "http://www.w3.org/2000/svg",
                            viewBox: "0 0 20 20",
                            fill: "currentColor",
                            children: /*#__PURE__*/ jsx_runtime.jsx("path", {
                                fillRule: "evenodd",
                                d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                                clipRule: "evenodd"
                            })
                        }),
                        type === "warning" && /*#__PURE__*/ jsx_runtime.jsx("svg", {
                            className: `h-5 w-5 ${iconClasses[type]}`,
                            xmlns: "http://www.w3.org/2000/svg",
                            viewBox: "0 0 20 20",
                            fill: "currentColor",
                            children: /*#__PURE__*/ jsx_runtime.jsx("path", {
                                fillRule: "evenodd",
                                d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
                                clipRule: "evenodd"
                            })
                        }),
                        type === "error" && /*#__PURE__*/ jsx_runtime.jsx("svg", {
                            className: `h-5 w-5 ${iconClasses[type]}`,
                            xmlns: "http://www.w3.org/2000/svg",
                            viewBox: "0 0 20 20",
                            fill: "currentColor",
                            children: /*#__PURE__*/ jsx_runtime.jsx("path", {
                                fillRule: "evenodd",
                                d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
                                clipRule: "evenodd"
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                    className: "ml-3",
                    children: [
                        title && /*#__PURE__*/ jsx_runtime.jsx("h3", {
                            className: "text-sm font-medium",
                            children: title
                        }),
                        /*#__PURE__*/ jsx_runtime.jsx("div", {
                            className: "text-sm mt-1",
                            children: children
                        })
                    ]
                }),
                onClose && /*#__PURE__*/ jsx_runtime.jsx("div", {
                    className: "ml-auto pl-3",
                    children: /*#__PURE__*/ jsx_runtime.jsx("div", {
                        className: "-mx-1.5 -my-1.5",
                        children: /*#__PURE__*/ (0,jsx_runtime.jsxs)("button", {
                            type: "button",
                            onClick: onClose,
                            className: `inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${type === "info" ? "focus:ring-blue-500" : type === "success" ? "focus:ring-green-500" : type === "warning" ? "focus:ring-yellow-500" : "focus:ring-red-500"}`,
                            children: [
                                /*#__PURE__*/ jsx_runtime.jsx("span", {
                                    className: "sr-only",
                                    children: "Dismiss"
                                }),
                                /*#__PURE__*/ jsx_runtime.jsx("svg", {
                                    className: "h-5 w-5",
                                    xmlns: "http://www.w3.org/2000/svg",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: /*#__PURE__*/ jsx_runtime.jsx("path", {
                                        fillRule: "evenodd",
                                        d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                                        clipRule: "evenodd"
                                    })
                                })
                            ]
                        })
                    })
                })
            ]
        })
    });
};
/* harmony default export */ const components_Alert = (Alert);

;// CONCATENATED MODULE: ./src/components/ui/components/Pagination.tsx


const Pagination = ({ currentPage, totalPages, onPageChange, className = "" })=>{
    // Generate page numbers to display
    const getPageNumbers = ()=>{
        const pageNumbers = [];
        const maxPagesToShow = 5;
        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is less than max to show
            for(let i = 1; i <= totalPages; i++){
                pageNumbers.push(i);
            }
        } else {
            // Always include first page
            pageNumbers.push(1);
            // Calculate start and end of page range
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);
            // Adjust if at the beginning
            if (currentPage <= 2) {
                endPage = 4;
            }
            // Adjust if at the end
            if (currentPage >= totalPages - 1) {
                startPage = totalPages - 3;
            }
            // Add ellipsis after first page if needed
            if (startPage > 2) {
                pageNumbers.push("...");
            }
            // Add middle pages
            for(let i = startPage; i <= endPage; i++){
                pageNumbers.push(i);
            }
            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
                pageNumbers.push("...");
            }
            // Always include last page
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };
    if (totalPages <= 1) return null;
    return /*#__PURE__*/ jsx_runtime.jsx("nav", {
        className: `flex justify-center mt-8 ${className}`,
        children: /*#__PURE__*/ (0,jsx_runtime.jsxs)("ul", {
            className: "flex items-center space-x-1",
            children: [
                /*#__PURE__*/ jsx_runtime.jsx("li", {
                    children: /*#__PURE__*/ jsx_runtime.jsx("button", {
                        onClick: ()=>onPageChange(currentPage - 1),
                        disabled: currentPage === 1,
                        className: `px-3 py-2 rounded-md text-sm font-medium ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`,
                        "aria-label": "Previous page",
                        children: /*#__PURE__*/ jsx_runtime.jsx("svg", {
                            className: "h-5 w-5",
                            xmlns: "http://www.w3.org/2000/svg",
                            viewBox: "0 0 20 20",
                            fill: "currentColor",
                            children: /*#__PURE__*/ jsx_runtime.jsx("path", {
                                fillRule: "evenodd",
                                d: "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z",
                                clipRule: "evenodd"
                            })
                        })
                    })
                }),
                getPageNumbers().map((page, index)=>/*#__PURE__*/ jsx_runtime.jsx("li", {
                        children: page === "..." ? /*#__PURE__*/ jsx_runtime.jsx("span", {
                            className: "px-3 py-2 text-gray-500 dark:text-gray-400",
                            children: "..."
                        }) : /*#__PURE__*/ jsx_runtime.jsx("button", {
                            onClick: ()=>typeof page === "number" && onPageChange(page),
                            className: `px-3 py-2 rounded-md text-sm font-medium ${currentPage === page ? "bg-indigo-600 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`,
                            "aria-current": currentPage === page ? "page" : undefined,
                            children: page
                        })
                    }, index)),
                /*#__PURE__*/ jsx_runtime.jsx("li", {
                    children: /*#__PURE__*/ jsx_runtime.jsx("button", {
                        onClick: ()=>onPageChange(currentPage + 1),
                        disabled: currentPage === totalPages,
                        className: `px-3 py-2 rounded-md text-sm font-medium ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`,
                        "aria-label": "Next page",
                        children: /*#__PURE__*/ jsx_runtime.jsx("svg", {
                            className: "h-5 w-5",
                            xmlns: "http://www.w3.org/2000/svg",
                            viewBox: "0 0 20 20",
                            fill: "currentColor",
                            children: /*#__PURE__*/ jsx_runtime.jsx("path", {
                                fillRule: "evenodd",
                                d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z",
                                clipRule: "evenodd"
                            })
                        })
                    })
                })
            ]
        })
    });
};
/* harmony default export */ const components_Pagination = (Pagination);

;// CONCATENATED MODULE: ./src/components/ui/index.tsx
// UI Components index file
// This file imports and re-exports all UI components to prevent clipping issues
// Each component is in its own file for better maintainability










// Export all UI components



/***/ })

};
;