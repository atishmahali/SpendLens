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
  private val cigKeywords = listOf("marlboro", "gold flake", "classic milds", "navy cut", "wills", "cigarette", "bidi")
  private val targets = setOf("com.application.zomato", "in.swiggy.android")
  private val seen = HashSet<String>()
  private val supabaseUrl = "https://nvqexvasfaklclsuotza.supabase.co"
  private val anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cWV4dmFzZmFrbGNsc3VvdHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNzc4NjEsImV4cCI6MjA5Mjg1Mzg2MX0.o5L-B9zVJPlGZrL2B46rn_osXBz5DxG-Q1ZYcus-BOc"
  private val userId = "mock_user_1"

  override fun onServiceConnected() {
    super.onServiceConnected()
    upsertConnected()
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    val pkg = event?.packageName?.toString() ?: return
    if (pkg !in targets) return
    val root = rootInActiveWindow ?: return
    val texts = mutableListOf<String>()
    collectText(root, texts)
    val joined = texts.joinToString(" | ").lowercase(Locale.ROOT)
    val match = rupeeRegex.find(joined) ?: return
    val amountStr = match.groupValues[1].replace(",", "")
    val amount = amountStr.toDoubleOrNull() ?: return
    if (amount < 50 || amount > 5000) return
    val key = "$pkg:$amount:${joined.hashCode()}"
    if (!seen.add(key)) return
    val isCig = cigKeywords.any { joined.contains(it) }
    val appName = if (pkg.contains("zomato")) "Zomato" else "Swiggy"
    postOrder(appName, amount, texts, isCig)
  }

  override fun onInterrupt() {}

  private fun collectText(node: AccessibilityNodeInfo?, out: MutableList<String>) {
    if (node == null) return
    node.text?.toString()?.takeIf { it.isNotBlank() }?.let { out.add(it) }
    node.contentDescription?.toString()?.takeIf { it.isNotBlank() }?.let { out.add(it) }
    for (i in 0 until node.childCount) collectText(node.getChild(i), out)
  }

  private fun postOrder(appName: String, amount: Double, items: List<String>, isCig: Boolean) {
    val iso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }.format(Date())
    val itemsArr = JSONArray()
    items.take(20).forEach { itemsArr.put(JSONObject().put("name", it).put("price", 0).put("qty", 1)) }
    if (isCig) itemsArr.put(JSONObject().put("name", "[CIGARETTES DETECTED]").put("price", amount).put("qty", 1))
    val body = JSONObject().put("user_id", userId).put("app_name", appName).put("order_date", iso).put("total_amount", amount).put("items", itemsArr).toString()
    val req = Request.Builder().url("$supabaseUrl/rest/v1/orders").addHeader("apikey", anonKey).addHeader("Authorization", "Bearer $anonKey").addHeader("Content-Type", "application/json").addHeader("Prefer", "return=minimal").post(body.toRequestBody("application/json".toMediaType())).build()
    client.newCall(req).execute().use { it.body?.close() }
  }

  private fun upsertConnected() {
    val body = JSONObject().put("user_id", userId).put("app_name", "Accessibility").toString()
    val req = Request.Builder().url("$supabaseUrl/rest/v1/connected_apps").addHeader("apikey", anonKey).addHeader("Authorization", "Bearer $anonKey").addHeader("Content-Type", "application/json").addHeader("Prefer", "return=minimal,resolution=merge-duplicates").post(body.toRequestBody("application/json".toMediaType())).build()
    try { client.newCall(req).execute().use { it.body?.close() } } catch (_: Exception) {}
  }
}
