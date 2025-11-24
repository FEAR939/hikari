package com.hikari.app  // Update to match your actual package name

import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.webkit.*
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var okHttpClient: OkHttpClient
    private lateinit var assetLoader: WebViewAssetLoader
    private val coroutineScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Enable edge-to-edge display (Android 15 best practice)
        enableEdgeToEdge()

        // Setup fullscreen mode using WindowInsetsController (modern approach for SDK 35)
        setupFullscreenMode()

        // Initialize OkHttp client with custom configuration
        okHttpClient = OkHttpClient.Builder()
            .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .writeTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .followRedirects(true)
            .followSslRedirects(true)
            .build()

        // Setup WebView Asset Loader
        assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .addPathHandler("/res/", WebViewAssetLoader.ResourcesPathHandler(this))
            .build()

        // Create and configure WebView
        webView = WebView(this).apply {
            layoutParams = android.widget.FrameLayout.LayoutParams(
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT
            )

            // Handle system window insets for edge-to-edge
            ViewCompat.setOnApplyWindowInsetsListener(this) { view, insets ->
                // Let the WebView draw under system bars
                insets
            }

            // WebView settings optimized for SDK 35
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = true
                allowContentAccess = true

                // Modern mixed content handling
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                }

                cacheMode = WebSettings.LOAD_NO_CACHE
                useWideViewPort = true
                loadWithOverviewMode = true
                setSupportZoom(true)
                builtInZoomControls = true
                displayZoomControls = false

                // Modern WebView settings for SDK 35
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    safeBrowsingEnabled = false  // Disable if you trust your content
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    isAlgorithmicDarkeningAllowed = false  // Support for dark mode
                }

                // Support for modern web features
                databaseEnabled = true
                setGeolocationEnabled(true)
                javaScriptCanOpenWindowsAutomatically = false
                setSupportMultipleWindows(false)
            }

            // Add JavaScript interface
            addJavascriptInterface(AndroidBridge(), "Android")

            // Setup WebViewClient with AssetLoader
            webViewClient = LocalContentWebViewClient(assetLoader)

            // Setup WebChromeClient for console logging and permissions
            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
                    Log.d("WebView Console", "${consoleMessage.message()} -- From line " +
                            "${consoleMessage.lineNumber()} of ${consoleMessage.sourceId()}")
                    return true
                }

                // Handle geolocation permissions if needed
                override fun onGeolocationPermissionsShowPrompt(
                    origin: String?,
                    callback: GeolocationPermissions.Callback?
                ) {
                    callback?.invoke(origin, true, false)
                }

                // Handle permission requests
                override fun onPermissionRequest(request: PermissionRequest?) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        request?.grant(request.resources)
                    }
                }
            }
        }

        setContentView(webView)

        // Load HTML with injected proxy JavaScript
        loadHtmlWithInjectedProxy()
    }

    private fun setupFullscreenMode() {
        // Modern approach for SDK 35 using WindowInsetsController
        WindowCompat.setDecorFitsSystemWindows(window, false)

        val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
        windowInsetsController?.let {
            // Hide system bars
            it.hide(WindowInsetsCompat.Type.systemBars())
            // Configure behavior - bars appear on swipe and hide again
            it.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }

        // Keep screen on
        window.addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    private fun loadHtmlWithInjectedProxy() {
        try {
            // Read the index.html from assets
            val indexHtmlStream = assets.open("index.html")
            val indexHtmlContent = indexHtmlStream.bufferedReader().use { it.readText() }
            indexHtmlStream.close()

            // Read the proxy JavaScript file from assets
            // Option 1: If your proxy file is at assets/proxy.js
            val proxyJsStream = assets.open("proxy.js")
            // Option 2: If your proxy file is at assets/dist/proxy_fetch_xhr.js
            // val proxyJsStream = assets.open("dist/proxy_fetch_xhr.js")

            val proxyJsContent = proxyJsStream.bufferedReader().use { it.readText() }
            proxyJsStream.close()

            // Inject the proxy JS into the HTML's <head> section
            val modifiedHtmlContent = indexHtmlContent.replace(
                "<head>",
                """<head>
<script type="text/javascript">
// Injected proxy JavaScript
$proxyJsContent
</script>"""
            )

            Log.d("MainActivity", "Injected proxy.js into index.html")

            // Load the modified HTML with the correct base URL for asset loading
            webView.loadDataWithBaseURL(
                "https://appassets.androidplatform.net/assets/",
                modifiedHtmlContent,
                "text/html",
                "UTF-8",
                null
            )

            Log.d("MainActivity", "Loaded modified index.html with injected proxy JS")

        } catch (e: IOException) {
            Log.e("MainActivity", "Failed to read HTML or proxy JS from assets for injection", e)
            // Fallback to loading the original HTML if injection fails
            webView.loadUrl("https://appassets.androidplatform.net/assets/index.html")
        }
    }

    inner class AndroidBridge {
        @JavascriptInterface
        fun makeHttpRequest(
            requestId: String,
            url: String,
            method: String,
            headersJson: String,
            body: String?
        ) {
            Log.d("AndroidBridge", "Request received - ID: $requestId, URL: $url, Method: $method")

            coroutineScope.launch(Dispatchers.IO) {
                try {
                    // Parse headers
                    val headers = JSONObject(headersJson)
                    val requestBuilder = Request.Builder().url(url)

                    // Add headers to request
                    headers.keys().forEach { key ->
                        requestBuilder.addHeader(key, headers.getString(key))
                    }

                    // Add body if present
                    when (method.uppercase()) {
                        "POST", "PUT", "PATCH", "DELETE" -> {
                            val contentType = headers.optString("Content-Type", "application/json")
                            val mediaType = contentType.toMediaType()
                            val requestBody = (body ?: "").toRequestBody(mediaType)

                            when (method.uppercase()) {
                                "POST" -> requestBuilder.post(requestBody)
                                "PUT" -> requestBuilder.put(requestBody)
                                "PATCH" -> requestBuilder.patch(requestBody)
                                "DELETE" -> {
                                    if (body.isNullOrEmpty()) {
                                        requestBuilder.delete()
                                    } else {
                                        requestBuilder.delete(requestBody)
                                    }
                                }
                            }
                        }
                        "GET" -> requestBuilder.get()
                        "HEAD" -> requestBuilder.head()
                        else -> requestBuilder.method(method, null)
                    }

                    // Execute request
                    val request = requestBuilder.build()
                    okHttpClient.newCall(request).enqueue(object : Callback {
                        override fun onFailure(call: Call, e: IOException) {
                            Log.e("AndroidBridge", "Request failed: ${e.message}")
                            sendErrorToJs(requestId, e.message ?: "Network error")
                        }

                        override fun onResponse(call: Call, response: Response) {
                            try {
                                val responseBody = response.body?.string() ?: ""
                                val responseHeaders = JSONObject()

                                response.headers.forEach { (name, value) ->
                                    responseHeaders.put(name, value)
                                }

                                val responseJson = JSONObject().apply {
                                    put("status", response.code)
                                    put("statusText", response.message)
                                    put("headers", responseHeaders)
                                    put("body", responseBody)
                                }

                                Log.d("AndroidBridge", "Response received for $requestId - Status: ${response.code}")
                                sendResponseToJs(requestId, responseJson)
                            } catch (e: Exception) {
                                Log.e("AndroidBridge", "Error processing response: ${e.message}")
                                sendErrorToJs(requestId, "Error processing response: ${e.message}")
                            } finally {
                                response.close()
                            }
                        }
                    })
                } catch (e: Exception) {
                    Log.e("AndroidBridge", "Error making request: ${e.message}")
                    sendErrorToJs(requestId, "Error: ${e.message}")
                }
            }
        }

        private fun sendResponseToJs(requestId: String, responseJson: JSONObject) {
            coroutineScope.launch(Dispatchers.Main) {
                val jsCode = """
                    (function() {
                        if (window.androidBridgeCallback) {
                            window.androidBridgeCallback('$requestId', ${responseJson.toString()}, null);
                        } else {
                            console.error('androidBridgeCallback not found');
                        }
                    })();
                """.trimIndent()

                webView.evaluateJavascript(jsCode) { result ->
                    Log.d("AndroidBridge", "JS callback executed for $requestId: $result")
                }
            }
        }

        private fun sendErrorToJs(requestId: String, errorMessage: String) {
            coroutineScope.launch(Dispatchers.Main) {
                // Escape the error message for JavaScript
                val escapedError = errorMessage
                    .replace("\\", "\\\\")
                    .replace("'", "\\'")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t")

                val jsCode = """
                    (function() {
                        if (window.androidBridgeCallback) {
                            window.androidBridgeCallback('$requestId', null, '$escapedError');
                        } else {
                            console.error('androidBridgeCallback not found');
                        }
                    })();
                """.trimIndent()

                webView.evaluateJavascript(jsCode) { result ->
                    Log.d("AndroidBridge", "JS error callback executed for $requestId: $result")
                }
            }
        }
    }

    private class LocalContentWebViewClient(private val assetLoader: WebViewAssetLoader) : WebViewClient() {
        override fun shouldInterceptRequest(
            view: WebView,
            request: WebResourceRequest
        ): WebResourceResponse? {
            return assetLoader.shouldInterceptRequest(request.url)
        }

        // Updated for SDK 35 - use new method signature
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            // Let the WebView handle all URLs
            return false
        }

        override fun onPageFinished(view: WebView?, url: String?) {
            super.onPageFinished(view, url)
            Log.d("WebViewClient", "Page finished loading: $url")
        }

        override fun onReceivedError(
            view: WebView?,
            request: WebResourceRequest?,
            error: WebResourceError?
        ) {
            super.onReceivedError(view, request, error)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Log.e("WebViewClient", "Error loading page: ${error?.description}")
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        coroutineScope.cancel()
        webView.removeJavascriptInterface("Android")
        webView.destroy()
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
        // Re-apply fullscreen mode when resuming
        setupFullscreenMode()
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }
}
