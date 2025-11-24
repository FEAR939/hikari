// proxy.js - Android WebView HTTP Proxy
// This file should be placed in app/src/main/assets/proxy.js

// Define a deferred promise that resolves when the Android bridge is confirmed ready
window._androidProxyReadyDeferred = {};
window._androidProxyReadyDeferred.promise = new Promise((resolve, reject) => {
    window._androidProxyReadyDeferred.resolve = resolve;
    window._androidProxyReadyDeferred.reject = reject;
});

// Function for other JS scripts to wait for the proxy
window.ensureAndroidProxyReady = function() {
    return window._androidProxyReadyDeferred.promise;
};

// Ensure the Android bridge object exists
if (typeof Android === 'undefined' || typeof Android.makeHttpRequest !== 'function') {
    console.error("Android bridge not found or makeHttpRequest method is missing. Proxying will not work.");
    window._androidProxyFailed = true;
    window._androidProxyReadyDeferred.reject(new Error("Android bridge not available.")); // Reject the promise
} else {
    console.log("Android bridge detected. Overriding fetch and XMLHttpRequest.");
    window._androidProxyFailed = false; // Set flag to indicate success
    window._androidProxyReadyDeferred.resolve(); // Resolve the promise immediately if bridge is found

    // --- Global callback function for Android to call back to JS ---
    window.androidBridgeCallback = function(requestId, responseJson, errorMessage) {
        console.log(`JS Callback received for ID: ${requestId}`);
        const request = window._pendingAndroidRequests[requestId];
        if (!request) {
            console.warn(`AndroidBridge: Callback for unknown requestId: ${requestId}`);
            return;
        }

        delete window._pendingAndroidRequests[requestId];

        if (errorMessage) {
            console.error(`AndroidBridge: Request ID ${requestId} failed: ${errorMessage}`);
            if (request.type === 'fetch') {
                request.reject(new TypeError(errorMessage));
            } else if (request.type === 'xhr') {
                request.xhr._status = 0;
                request.xhr._statusText = errorMessage;
                if (request.xhr.onerror) {
                    request.xhr.onerror(new Event('error'));
                }
                request.xhr.readyState = XMLHttpRequest.DONE;
                if (request.xhr.onreadystatechange) {
                    request.xhr.onreadystatechange();
                }
            }
            return;
        }

        if (responseJson) {
            console.log(`AndroidBridge: Request ID ${requestId} successful. Status: ${responseJson.status}`);
            if (request.type === 'fetch') {
                const headers = new Headers(responseJson.headers);
                const response = new Response(responseJson.body, {
                    status: responseJson.status,
                    statusText: responseJson.statusText,
                    headers: headers
                });
                request.resolve(response);
            } else if (request.type === 'xhr') {
                request.xhr._status = responseJson.status;
                request.xhr._statusText = responseJson.statusText;
                request.xhr._responseHeaders = responseJson.headers;
                request.xhr._responseText = responseJson.body;

                request.xhr.readyState = XMLHttpRequest.DONE;
                if (request.xhr.onreadystatechange) {
                    request.xhr.onreadystatechange();
                }
                if (request.xhr.onload) {
                    request.xhr.onload(new Event('load'));
                }
            }
        }
    };

    window._pendingAndroidRequests = {};
    let _requestIdCounter = 0;

    function generateRequestId() {
        return `android-proxy-${_requestIdCounter++}-${Date.now()}`;
    }

    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
        const url = typeof input === 'string' ? input : input.url;
        const method = (init && init.method) ? init.method.toUpperCase() : 'GET';
        const headers = (init && init.headers) ? Object.fromEntries(new Headers(init.headers).entries()) : {};
        let body = null;

        if (init && init.body && (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')) {
            if (typeof init.body === 'string') {
                body = init.body;
            } else if (init.body instanceof URLSearchParams) {
                body = init.body.toString();
                headers['Content-Type'] = headers['Content-Type'] || 'application/x-www-form-urlencoded';
            } else if (init.body instanceof FormData) {
                console.warn("FormData detected. Converting to plain string for proxy. Full FormData support requires more complex bridge.");
                const formDataEntries = [];
                for (const pair of init.body.entries()) {
                    formDataEntries.push(`${pair[0]}=${pair[1]}`);
                }
                body = formDataEntries.join('&');
                headers['Content-Type'] = headers['Content-Type'] || 'application/x-www-form-urlencoded';
            } else {
                try {
                    body = JSON.stringify(init.body);
                    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
                } catch (e) {
                    console.warn("Could not stringify fetch body to JSON. Sending as plain string.", init.body);
                    body = String(init.body);
                }
            }
        }

        console.log(`[JS Proxy Debug] Checking URL for proxy: "${url}"`);

        const isProxiedUrl = url.startsWith('https://');

        if (isProxiedUrl) {
            console.log(`[JS Proxy] Intercepting fetch request for ${url}. Method: ${method}, Headers:`, headers, "Body:", body ? body.substring(0, 100) + "..." : "none");
            const requestId = generateRequestId();
            return new Promise((resolve, reject) => {
                window._pendingAndroidRequests[requestId] = { type: 'fetch', resolve, reject };
                Android.makeHttpRequest(requestId, url, method, JSON.stringify(headers), body);
            });
        } else {
            console.log(`[JS Native] Allowing native fetch for non-proxied URL: ${url}`);
            return originalFetch(input, init);
        }
    };

    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        xhr._customXHR = this;

        this.open = function(method, url, async = true, user = null, password = null) {
            xhr._customXHR._method = method.toUpperCase();
            xhr._customXHR._url = url;
            xhr._customXHR._async = async;
            xhr._customXHR._user = user;
            xhr._customXHR._password = password;
            xhr._customXHR._requestHeaders = {};
            xhr._customXHR.readyState = XMLHttpRequest.OPENED;
            if (xhr._customXHR.onreadystatechange) xhr._customXHR.onreadystatechange();
        };

        this.setRequestHeader = function(header, value) {
            xhr._customXHR._requestHeaders[header] = value;
        };

        this.send = function(body = null) {
            const url = xhr._customXHR._url;
            const method = xhr._customXHR._method;
            const headers = xhr._customXHR._requestHeaders;
            let requestBody = null;

            if (body !== null && (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')) {
                requestBody = typeof body === 'string' ? body : JSON.stringify(body);
            }

            console.log(`[JS Proxy Debug] Checking URL for proxy: "${url}"`);

            const isProxiedUrl = url.startsWith('https://');

            if (isProxiedUrl) {
                console.log(`[JS Proxy] Intercepting XHR request for ${url}. Method: ${method}, Headers:`, headers, "Body:", requestBody ? requestBody.substring(0, 100) + "..." : "none");
                const requestId = generateRequestId();
                window._pendingAndroidRequests[requestId] = { type: 'xhr', xhr: xhr._customXHR };
                Android.makeHttpRequest(requestId, url, method, JSON.stringify(headers), requestBody);
            } else {
                console.log(`[JS Native] Allowing native XHR for non-proxied URL: ${url}`);
                xhr.open(method, url, xhr._customXHR._async, xhr._customXHR._user, xhr._customXHR._password);
                for (const header in headers) {
                    xhr.setRequestHeader(header, headers[header]);
                }
                xhr.send(body);
            }
        };

        Object.defineProperty(this, 'readyState', { get: () => xhr.readyState });
        Object.defineProperty(this, 'status', { get: () => xhr._status || 0 });
        Object.defineProperty(this, 'statusText', { get: () => xhr._statusText || '' });
        Object.defineProperty(this, 'responseText', { get: () => xhr._responseText || '' });
        Object.defineProperty(this, 'response', { get: () => xhr._responseText || '' });
        Object.defineProperty(this, 'responseType', { get: () => xhr._responseType || '' });
        this.getResponseHeader = function(name) {
            return xhr._responseHeaders ? xhr._responseHeaders[name] : null;
        };
        this.getAllResponseHeaders = function() {
            if (!xhr._responseHeaders) return '';
            return Object.entries(xhr._responseHeaders).map(([key, value]) => `${key}: ${value}`).join('\r\n');
        };

        this.onreadystatechange = null;
        this.onload = null;
        this.onerror = null;
        this.onabort = null;
        this.ontimeout = null;
        this.onloadend = null;
        this.onloadstart = null;
        this.onprogress = null;

        return this;
    };

    for (const prop in originalXHR) {
        if (typeof originalXHR[prop] !== 'function') {
            window.XMLHttpRequest[prop] = originalXHR[prop];
        }
    }
    window.XMLHttpRequest.UNSENT = originalXHR.UNSENT;
    window.XMLHttpRequest.OPENED = originalXHR.OPENED;
    window.XMLHttpRequest.HEADERS_RECEIVED = originalXHR.HEADERS_RECEIVED;
    window.XMLHttpRequest.LOADING = originalXHR.LOADING;
    window.XMLHttpRequest.DONE = originalXHR.DONE;
}