package com.spendlens

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class SpendLensAccessibilityService : AccessibilityService() {

  private val client = OkHttpClient()
  private val rupeeRegex = Regex("₹\\s?([\\d,]+\\.?\\d{0,2})")
  private val upiPaidTo = Regex("(?:paid to|sent to|to:?)\\s+([A-Za-z][A-Za-z0-9 &'.\\-]{2,40})", RegexOption.IGNORE_CASE)
  private val cigKeywords = listOf("marlboro", "gold flake", "classic milds", "navy cut", "wills", "cigarette", "bidi")
  private val completion = listOf("paid", "successful", "delivered", "ordered", "placed", "sent successfully", "order placed", "payment successful", "transaction successful")
  private val apps = mapOf(
    "com.application.zomato" to Triple("Zomato", "Food", false),
    "in.swiggy.android" to Triple("Swiggy", "Food", false),
    "com.grofers.customerapp" to Triple("Blinkit", "Groceries", false),
    "com.zeptoconsumerapp" to Triple("Zepto", "Groceries", false),
    "com.bigbasket.mobileapp" to Triple("BigBasket", "Groceries", false),
    "in.amazon.mShop.android.shopping" to Triple("Amazon", "Shopping", false),
    "com.flipkart.android" to Triple("Flipkart", "Shopping", false),
    "net.one97.paytm" to Triple("Paytm", "UPI", true),
    "com.phonepe.app" to Triple("PhonePe", "UPI", true),
    "com.google.android.apps.nbu.paisa.user" to Triple("Google Pay", "UPI", true)
  )
  private val seen = LinkedHashMap<String, Long>()
  private val supabaseUrl = "https://nvqexvasfaklclsuotza.supabase.co"
  private val anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cWV4dmFzZmFrbGNsc3VvdHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNzc4NjEsImV4cCI6MjA5Mjg1Mzg2MX0.o5L-B9zVJPlGZrL2B46rn_osXBz5DxG-Q1ZYcus-BOc"
  private val userId = "mock_user_1"

  override fun onServiceConnected() { super.onServiceConnected(); upsertConnected("Accessibility") }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    val pkg = event?.packageName?.toString() ?: return
    val cfg = apps[pkg] ?: return
    val (appName, defaultCat, isUpi) = cfg
    val texts = mutableListOf<String>()
    collectText(rootInActiveWindow ?: return, texts)
    val joined = texts.joinToString(" | ")
    val lower = joined.lowercase(Locale.ROOT)
    if (completion.none { lower.contains(it) }) return
    val amounts = rupeeRegex.findAll(joined).map { it.groupValues[1].replace(",", "").toDoubleOrNull() ?: 0.0 }.filter { it in 10.0..50000.0 }.toList()
    if (amounts.isEmpty()) return
    val amount = amounts.max()
    val key = "$pkg:$amount"
    val now = System.currentTimeMillis()
    seen.entries.removeAll { now - it.value > 300000 }
    if (seen.containsKey(key)) return
    seen[key] = now
    val isCig = cigKeywords.any { lower.contains(it) }
    val merchant = if (isUpi) upiPaidTo.find(joined)?.groupValues?.get(1)?.trim() else null
    val category = if (isCig) "Cigarettes" else defaultCat
    val subcategory = merchant ?: appName
    postOrder(appName, amount, texts, category, subcategory)
  }

  override fun onInterrupt() {}

  private fun collectText(n: AccessibilityNodeInfo?, out: MutableList<String>) {
    if (n == null) return
    n.text?.toString()?.takeIf { it.isNotBlank() }?.let { out.add(it) }
    n.contentDescription?.toString()?.takeIf { it.isNotBlank() }?.let { out.add(it) }
    for (i in 0 until n.childCount) collectText(n.getChild(i), out)
  }

  private fun postOrder(appName: String, amount: Double, items: List<String>, category: String, subcategory: String) {
    val iso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }.format(Date())
    val itemsArr = JSONArray()
    items.take(10).forEach { itemsArr.put(JSONObject().put("name", it.take(120))) }
    val body = JSONObject().put("user_id", userId).put("app_name", appName).put("order_date", iso).put("total_amount", amount).put("items", itemsArr).toString()
    val req = Request.Builder().url("$supabaseUrl/rest/v1/orders").addHeader("apikey", anonKey).addHeader("Authorization", "Bearer $anonKey").addHeader("Content-Type", "application/json").addHeader("Prefer", "return=representation").post(body.toRequestBody("application/json".toMediaType())).build()
    try {
      client.newCall(req).execute().use { r ->
        val arr = JSONArray(r.body?.string() ?: "[]")
        if (arr.length() > 0) postCategory(arr.getJSONObject(0).getString("id"), category, subcategory, amount)
      }
    } catch (_: Exception) {}
  }

  private fun postCategory(orderId: String, category: String, subcategory: String, amount: Double) {
    val body = JSONObject().put("order_id", orderId).put("category", category).put("subcategory", subcategory).put("amount", amount).toString()
    val req = Request.Builder().url("$supabaseUrl/rest/v1/categories").addHeader("apikey", anonKey).addHeader("Authorization", "Bearer $anonKey").addHeader("Content-Type", "application/json").addHeader("Prefer", "return=minimal").post(body.toRequestBody("application/json".toMediaType())).build()
    try { client.newCall(req).execute().use { it.body?.close() } } catch (_: Exception) {}
  }

  private fun upsertConnected(appName: String) {
    val body = JSONObject().put("user_id", userId).put("app_name", appName).toString()
    val req = Request.Builder().url("$supabaseUrl/rest/v1/connected_apps").addHeader("apikey", anonKey).addHeader("Authorization", "Bearer $anonKey").addHeader("Content-Type", "application/json").addHeader("Prefer", "return=minimal,resolution=merge-duplicates").post(body.toRequestBody("application/json".toMediaType())).build()
    try { client.newCall(req).execute().use { it.body?.close() } } catch (_: Exception) {}
  }
}
