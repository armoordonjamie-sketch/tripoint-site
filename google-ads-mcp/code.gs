/**
 * TriPoint Diagnostics - Google Ads Data Export Script
 *
 * Posts campaign, ad group, keyword, search term and ad performance
 * data to your local FastAPI backend via Cloudflare tunnel.
 *
 * SETUP:
 * 1. Google Ads > Tools & Settings > Bulk Actions > Scripts > + New Script
 * 2. Paste this entire file
 * 3. Set ADS_API_SECRET below to match your .env
 * 4. Click Preview to verify, then Save
 * 5. Schedule: Daily at 07:00 (gives full previous day data)
 */

// ============================================================
// CONFIG - update ADS_API_SECRET to match your .env
// ============================================================
var CONFIG = {
  API_ENDPOINT: "https://beta.tripointdiagnostics.co.uk/api/ads/ingest",
  ADS_API_SECRET: "4FHJLWSlWn72snFz5yNujfWWHoe9UZzi",
  DATE_RANGE: "LAST_7_DAYS"
  // Options: YESTERDAY, LAST_7_DAYS, LAST_30_DAYS, THIS_MONTH
};


// ============================================================
// MAIN
// ============================================================
function main() {
  Logger.log("TPD export starting | range: " + CONFIG.DATE_RANGE);
 
  var payload = {
    exported_at:  new Date().toISOString(),
    date_range:   CONFIG.DATE_RANGE,
    campaigns:    getCampaigns(),
    ad_groups:    getAdGroups(),
    keywords:     getKeywords(),
    search_terms: getSearchTerms(),
    ads:          getAds()
  };
 
  Logger.log([
    "Collected",
    payload.campaigns.length,    "campaigns,",
    payload.ad_groups.length,    "ad groups,",
    payload.keywords.length,     "keywords,",
    payload.search_terms.length, "search terms,",
    payload.ads.length,          "ads"
  ].join(" "));
 
  sendToApi(payload);
}
 
 
// ============================================================
// CAMPAIGNS
// ============================================================
function getCampaigns() {
  var rows = [];
 
  var query = [
    "SELECT",
    "  campaign.id,",
    "  campaign.name,",
    "  campaign.status,",
    "  campaign.advertising_channel_type,",
    "  campaign_budget.amount_micros,",
    "  metrics.impressions,",
    "  metrics.clicks,",
    "  metrics.cost_micros,",
    "  metrics.conversions,",
    "  metrics.conversions_value,",
    "  metrics.ctr,",
    "  metrics.average_cpc,",
    "  metrics.search_impression_share,",
    "  metrics.search_budget_lost_impression_share,",
    "  metrics.search_rank_lost_impression_share,",
    "  metrics.cost_per_conversion",
    "FROM campaign",
    "WHERE segments.date DURING " + CONFIG.DATE_RANGE,
    "  AND campaign.status != 'REMOVED'"
  ].join(" ");
 
  var iter = AdsApp.report(query).rows();
  while (iter.hasNext()) {
    var r = iter.next();
    rows.push({
      id:                   str(r["campaign.id"]),
      name:                 str(r["campaign.name"]),
      status:               str(r["campaign.status"]),
      channel:              str(r["campaign.advertising_channel_type"]),
      daily_budget:         micros(r["campaign_budget.amount_micros"]),
      impressions:          integer(r["metrics.impressions"]),
      clicks:               integer(r["metrics.clicks"]),
      cost:                 micros(r["metrics.cost_micros"]),
      conversions:          decimal(r["metrics.conversions"]),
      conv_value:           decimal(r["metrics.conversions_value"]),
      ctr:                  decimal(r["metrics.ctr"]),
      avg_cpc:              micros(r["metrics.average_cpc"]),
      impression_share:     str(r["metrics.search_impression_share"]),
      budget_lost_is:       str(r["metrics.search_budget_lost_impression_share"]),
      rank_lost_is:         str(r["metrics.search_rank_lost_impression_share"]),
      cost_per_conversion:  micros(r["metrics.cost_per_conversion"])
    });
  }
 
  return rows;
}
 
 
// ============================================================
// AD GROUPS
// ============================================================
function getAdGroups() {
  var rows = [];
 
  var query = [
    "SELECT",
    "  campaign.name,",
    "  ad_group.id,",
    "  ad_group.name,",
    "  ad_group.status,",
    "  metrics.impressions,",
    "  metrics.clicks,",
    "  metrics.cost_micros,",
    "  metrics.conversions,",
    "  metrics.ctr,",
    "  metrics.average_cpc,",
    "  metrics.cost_per_conversion",
    "FROM ad_group",
    "WHERE segments.date DURING " + CONFIG.DATE_RANGE,
    "  AND ad_group.status != 'REMOVED'",
    "  AND metrics.impressions > 0"
  ].join(" ");
 
  var iter = AdsApp.report(query).rows();
  while (iter.hasNext()) {
    var r = iter.next();
    rows.push({
      campaign:            str(r["campaign.name"]),
      id:                  str(r["ad_group.id"]),
      name:                str(r["ad_group.name"]),
      status:              str(r["ad_group.status"]),
      impressions:         integer(r["metrics.impressions"]),
      clicks:              integer(r["metrics.clicks"]),
      cost:                micros(r["metrics.cost_micros"]),
      conversions:         decimal(r["metrics.conversions"]),
      ctr:                 decimal(r["metrics.ctr"]),
      avg_cpc:             micros(r["metrics.average_cpc"]),
      cost_per_conversion: micros(r["metrics.cost_per_conversion"])
    });
  }
 
  return rows;
}
 
 
// ============================================================
// KEYWORDS
// ============================================================
function getKeywords() {
  var rows = [];
 
  var query = [
    "SELECT",
    "  campaign.name,",
    "  ad_group.name,",
    "  ad_group_criterion.keyword.text,",
    "  ad_group_criterion.keyword.match_type,",
    "  ad_group_criterion.status,",
    "  ad_group_criterion.quality_info.quality_score,",
    "  ad_group_criterion.quality_info.search_predicted_ctr,",
    "  metrics.impressions,",
    "  metrics.clicks,",
    "  metrics.cost_micros,",
    "  metrics.conversions,",
    "  metrics.ctr,",
    "  metrics.average_cpc,",
    "  metrics.search_impression_share,",
    "  metrics.cost_per_conversion",
    "FROM keyword_view",
    "WHERE segments.date DURING " + CONFIG.DATE_RANGE,
    "  AND ad_group_criterion.status != 'REMOVED'",
    "  AND metrics.impressions > 0"
  ].join(" ");
 
  var iter = AdsApp.report(query).rows();
  while (iter.hasNext()) {
    var r = iter.next();
    rows.push({
      campaign:            str(r["campaign.name"]),
      ad_group:            str(r["ad_group.name"]),
      keyword:             str(r["ad_group_criterion.keyword.text"]),
      match_type:          str(r["ad_group_criterion.keyword.match_type"]),
      status:              str(r["ad_group_criterion.status"]),
      quality_score:       str(r["ad_group_criterion.quality_info.quality_score"]),
      pred_ctr:            str(r["ad_group_criterion.quality_info.search_predicted_ctr"]),
      ad_relevance:        "",
      lp_experience:       "",
      impressions:         integer(r["metrics.impressions"]),
      clicks:              integer(r["metrics.clicks"]),
      cost:                micros(r["metrics.cost_micros"]),
      conversions:         decimal(r["metrics.conversions"]),
      ctr:                 decimal(r["metrics.ctr"]),
      avg_cpc:             micros(r["metrics.average_cpc"]),
      impression_share:    str(r["metrics.search_impression_share"]),
      cost_per_conversion: micros(r["metrics.cost_per_conversion"])
    });
  }
 
  return rows;
}
 
 
// ============================================================
// SEARCH TERMS
// ============================================================
function getSearchTerms() {
  var rows = [];
 
  var query = [
    "SELECT",
    "  campaign.name,",
    "  ad_group.name,",
    "  search_term_view.search_term,",
    "  segments.search_term_match_type,",
    "  metrics.impressions,",
    "  metrics.clicks,",
    "  metrics.cost_micros,",
    "  metrics.conversions,",
    "  metrics.ctr,",
    "  metrics.average_cpc",
    "FROM search_term_view",
    "WHERE segments.date DURING " + CONFIG.DATE_RANGE,
    "  AND metrics.impressions > 0"
  ].join(" ");
 
  var iter = AdsApp.report(query).rows();
  while (iter.hasNext()) {
    var r = iter.next();
    rows.push({
      campaign:    str(r["campaign.name"]),
      ad_group:    str(r["ad_group.name"]),
      search_term: str(r["search_term_view.search_term"]),
      match_type:  str(r["segments.search_term_match_type"]),
      impressions: integer(r["metrics.impressions"]),
      clicks:      integer(r["metrics.clicks"]),
      cost:        micros(r["metrics.cost_micros"]),
      conversions: decimal(r["metrics.conversions"]),
      ctr:         decimal(r["metrics.ctr"]),
      avg_cpc:     micros(r["metrics.average_cpc"])
    });
  }
 
  return rows;
}
 
 
// ============================================================
// ADS (Responsive Search Ads)
// ============================================================
function getAds() {
  var rows = [];
 
  var query = [
    "SELECT",
    "  campaign.name,",
    "  ad_group.name,",
    "  ad_group_ad.ad.id,",
    "  ad_group_ad.ad.type,",
    "  ad_group_ad.status,",
    "  ad_group_ad.ad.responsive_search_ad.headlines,",
    "  ad_group_ad.ad.responsive_search_ad.descriptions,",
    "  ad_group_ad.ad.final_urls,",
    "  metrics.impressions,",
    "  metrics.clicks,",
    "  metrics.cost_micros,",
    "  metrics.conversions,",
    "  metrics.ctr,",
    "  metrics.average_cpc",
    "FROM ad_group_ad",
    "WHERE segments.date DURING " + CONFIG.DATE_RANGE,
    "  AND ad_group_ad.status != 'REMOVED'",
    "  AND metrics.impressions > 0"
  ].join(" ");
 
  var iter = AdsApp.report(query).rows();
  while (iter.hasNext()) {
    var r = iter.next();
    rows.push({
      campaign:     str(r["campaign.name"]),
      ad_group:     str(r["ad_group.name"]),
      ad_id:        str(r["ad_group_ad.ad.id"]),
      ad_type:      str(r["ad_group_ad.ad.type"]),
      status:       str(r["ad_group_ad.status"]),
      headlines:    extractAssetText(r["ad_group_ad.ad.responsive_search_ad.headlines"]),
      descriptions: extractAssetText(r["ad_group_ad.ad.responsive_search_ad.descriptions"]),
      final_url:    extractFirstUrl(r["ad_group_ad.ad.final_urls"]),
      impressions:  integer(r["metrics.impressions"]),
      clicks:       integer(r["metrics.clicks"]),
      cost:         micros(r["metrics.cost_micros"]),
      conversions:  decimal(r["metrics.conversions"]),
      ctr:          decimal(r["metrics.ctr"]),
      avg_cpc:      micros(r["metrics.average_cpc"])
    });
  }
 
  return rows;
}
 
 
// ============================================================
// SEND TO API
// ============================================================
function sendToApi(payload) {
  var options = {
    method:             "post",
    contentType:        "application/json",
    headers: {
      "Authorization": "Bearer " + CONFIG.ADS_API_SECRET
    },
    payload:            JSON.stringify(payload),
    muteHttpExceptions: true
  };
 
  try {
    var response = UrlFetchApp.fetch(CONFIG.API_ENDPOINT, options);
    var code     = response.getResponseCode();
    var body     = response.getContentText();
 
    if (code === 200) {
      Logger.log("SUCCESS " + code + ": " + body);
    } else {
      Logger.log("ERROR " + code + ": " + body);
    }
  } catch (e) {
    Logger.log("FETCH EXCEPTION: " + e.toString());
  }
}
 
 
// ============================================================
// HELPERS
// ============================================================
 
// Google Ads stores all monetary values as integer micros (millionths).
// TPD account currency is GBP so divide by 1,000,000.
function micros(val) {
  var n = parseFloat(val);
  return isNaN(n) ? 0.0 : Math.round((n / 1000000) * 100) / 100;
}
 
function integer(val) {
  var n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}
 
function decimal(val) {
  var n = parseFloat(val);
  return isNaN(n) ? 0.0 : Math.round(n * 10000) / 10000;
}
 
function str(val) {
  if (val === null || val === undefined) return "";
  return String(val);
}
 
// RSA headlines and descriptions come back as arrays of asset objects.
// Google Ads Scripts serialises each object as "[object Object]" when
// you call toString() directly. This function iterates the raw value,
// pulls the text property from each asset, and joins them with " | ".
function extractAssetText(val) {
  if (!val) return "";
  try {
    // If it came through as an actual array (Scripts sometimes does this)
    if (typeof val === "object" && val.length !== undefined) {
      var texts = [];
      for (var i = 0; i < val.length; i++) {
        var item = val[i];
        if (item && item.text) {
          texts.push(item.text);
        } else if (item && typeof item === "string") {
          texts.push(item);
        }
      }
      return texts.join(" | ");
    }
    // Fallback: arrived as a plain string, return as-is
    var s = String(val);
    if (s === "[object Object]" || s === "") return "";
    return s;
  } catch (e) {
    return "";
  }
}
 
// final_urls is a repeated field - extract just the first URL.
function extractFirstUrl(val) {
  if (!val) return "";
  try {
    if (typeof val === "object" && val.length !== undefined && val.length > 0) {
      return String(val[0]);
    }
    var s = String(val);
    // Strip array brackets if present: ["https://..."]
    s = s.replace(/^\[/, "").replace(/\]$/, "").replace(/^"/, "").replace(/"$/, "").trim();
    return s;
  } catch (e) {
    return "";
  }
}
 