/**
 * TriPoint Diagnostics - Google Ads daily history backfill
 *
 * Pulls segmented-by-date performance into POST /api/ads/ingest/history.
 * First run fills history (may require multiple runs due to MAX_DAYS_PER_RUN).
 * Re-runs are incremental and idempotent (server skips existing days).
 *
 * Paste into Google Ads > Scripts. No Node/npm — AdsApp + UrlFetchApp only.
 */

// ============================================================
// CONFIG
// ============================================================
var CONFIG = {
  API_BASE: "https://beta.tripointdiagnostics.co.uk",
  ADS_API_SECRET: "4FHJLWSlWn72snFz5yNujfWWHoe9UZzi",
  BATCH_SIZE: 500,
  MAX_DAYS_PER_RUN: 365,
  CAMPAIGN_START_DATE: "2026-02-21",
  // AdsApp.report() rejects (or returns no rows for) very long segments.date ranges.
  // Chunk GAQL queries to stay under the platform limit (use 90 if you still see empty reports).
  GAQL_MAX_DAYS_PER_QUERY: 90
};

// ============================================================
// MAIN
// ============================================================
function main() {
  var t0 = new Date().getTime();
  var totals = {
    campaign: { sent: 0, inserted: 0, skipped: 0 },
    ad_group: { sent: 0, inserted: 0, skipped: 0 },
    keyword: { sent: 0, inserted: 0, skipped: 0 },
    search_term: { sent: 0, inserted: 0, skipped: 0 }
  };

  var coverageRows = fetchCoverage();
  var latestMap = buildLatestMap(coverageRows);
  var yesterday = getYesterdayYmd();
  var capLogged = {};

  var campaignIter = AdsApp.campaigns().withCondition("Status != REMOVED").get();
  while (campaignIter.hasNext()) {
    var campaign = campaignIter.next();
    var cname = campaign.getName();

    runHistoryForEntity("campaign", cname, latestMap, yesterday, totals, capLogged);
    runHistoryForEntity("ad_group", cname, latestMap, yesterday, totals, capLogged);
    runHistoryForEntity("keyword", cname, latestMap, yesterday, totals, capLogged);
    runHistoryForEntity("search_term", cname, latestMap, yesterday, totals, capLogged);
  }

  var elapsed = new Date().getTime() - t0;
  Logger.log(
    "TPD history done in " +
      elapsed +
      " ms | campaign sent=" +
      totals.campaign.sent +
      " ins=" +
      totals.campaign.inserted +
      " skip=" +
      totals.campaign.skipped +
      " | ad_group sent=" +
      totals.ad_group.sent +
      " ins=" +
      totals.ad_group.inserted +
      " skip=" +
      totals.ad_group.skipped +
      " | keyword sent=" +
      totals.keyword.sent +
      " ins=" +
      totals.keyword.inserted +
      " skip=" +
      totals.keyword.skipped +
      " | search_term sent=" +
      totals.search_term.sent +
      " ins=" +
      totals.search_term.inserted +
      " skip=" +
      totals.search_term.skipped
  );
}

// ============================================================
// COVERAGE + DATE RANGE
// ============================================================

function fetchCoverage() {
  var url = CONFIG.API_BASE + "/api/ads/history/coverage";
  var options = {
    method: "get",
    headers: { Authorization: "Bearer " + CONFIG.ADS_API_SECRET },
    muteHttpExceptions: true
  };
  try {
    var resp = UrlFetchApp.fetch(url, options);
    if (resp.getResponseCode() !== 200) {
      Logger.log("Coverage HTTP " + resp.getResponseCode() + ": " + resp.getContentText());
      return [];
    }
    var text = resp.getContentText();
    if (!text || text === "") {
      return [];
    }
    var parsed = JSON.parse(text);
    if (!parsed || parsed.length === undefined) {
      return [];
    }
    return parsed;
  } catch (e) {
    Logger.log("Coverage exception: " + e.toString());
    return [];
  }
}

function buildLatestMap(rows) {
  var map = {};
  if (!rows || rows.length === 0) {
    return map;
  }
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    if (!row || !row.campaign || !row.entity_type) {
      continue;
    }
    var key = row.campaign + "\t" + row.entity_type;
    map[key] = row.latest_date;
  }
  return map;
}

function getYesterdayYmd() {
  var tz = AdsApp.currentAccount().getTimeZone();
  var now = new Date();
  var y = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return Utilities.formatDate(y, tz, "yyyy-MM-dd");
}

function runHistoryForEntity(entityType, campaignName, latestMap, yesterday, totals, capLogged) {
  var key = campaignName + "\t" + entityType;
  var startStr = latestMap[key] ? addDays(latestMap[key], 1) : CONFIG.CAMPAIGN_START_DATE;
  var endStr = yesterday;

  if (startStr > endStr) {
    return;
  }

  var spanInclusive = daysBetween(startStr, endStr) + 1;
  if (spanInclusive > CONFIG.MAX_DAYS_PER_RUN) {
    endStr = addDays(startStr, CONFIG.MAX_DAYS_PER_RUN - 1);
    if (!capLogged[campaignName]) {
      capLogged[campaignName] = true;
      Logger.log(
        "Warning: date range capped for " +
          campaignName +
          " (all entity types in this run) — run again to continue backfill."
      );
    }
  }

  var rows = collectRows(entityType, campaignName, startStr, endStr);
  postHistoryBatches(entityType, rows, totals[entityType]);
}

// ============================================================
// GAQL + ROW MAPPING
// ============================================================

function escapeGaqlString(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function collectRows(entityType, campaignName, startStr, endStr) {
  var maxChunk = CONFIG.GAQL_MAX_DAYS_PER_QUERY;
  if (!maxChunk || maxChunk < 1) {
    maxChunk = 180;
  }
  var out = [];
  var cur = startStr;
  while (cur <= endStr) {
    var chunkEnd = addDays(cur, maxChunk - 1);
    if (chunkEnd > endStr) {
      chunkEnd = endStr;
    }
    var part = collectRowsForDateRange(entityType, campaignName, cur, chunkEnd);
    for (var j = 0; j < part.length; j++) {
      out.push(part[j]);
    }
    cur = addDays(chunkEnd, 1);
  }
  return out;
}

function collectRowsForDateRange(entityType, campaignName, startStr, endStr) {
  var q = "";
  var cname = escapeGaqlString(campaignName);

  if (entityType === "campaign") {
    q = [
      "SELECT",
      "  campaign.name,",
      "  campaign.status,",
      "  segments.date,",
      "  metrics.impressions,",
      "  metrics.clicks,",
      "  metrics.cost_micros,",
      "  metrics.conversions,",
      "  metrics.ctr,",
      "  metrics.average_cpc,",
      "  metrics.cost_per_conversion,",
      "  metrics.search_impression_share",
      "FROM campaign",
      "WHERE segments.date BETWEEN '" + startStr + "' AND '" + endStr + "'",
      "  AND campaign.status != 'REMOVED'",
      "  AND campaign.name = '" + cname + "'"
    ].join(" ");
  } else if (entityType === "ad_group") {
    q = [
      "SELECT",
      "  campaign.name,",
      "  ad_group.name,",
      "  segments.date,",
      "  metrics.impressions,",
      "  metrics.clicks,",
      "  metrics.cost_micros,",
      "  metrics.conversions,",
      "  metrics.ctr,",
      "  metrics.average_cpc,",
      "  metrics.cost_per_conversion",
      "FROM ad_group",
      "WHERE segments.date BETWEEN '" + startStr + "' AND '" + endStr + "'",
      "  AND ad_group.status != 'REMOVED'",
      "  AND metrics.impressions > 0",
      "  AND campaign.name = '" + cname + "'"
    ].join(" ");
  } else if (entityType === "keyword") {
    q = [
      "SELECT",
      "  campaign.name,",
      "  ad_group.name,",
      "  ad_group_criterion.keyword.text,",
      "  ad_group_criterion.keyword.match_type,",
      "  segments.date,",
      "  ad_group_criterion.quality_info.quality_score,",
      "  metrics.impressions,",
      "  metrics.clicks,",
      "  metrics.cost_micros,",
      "  metrics.conversions,",
      "  metrics.ctr,",
      "  metrics.average_cpc,",
      "  metrics.cost_per_conversion,",
      "  metrics.search_impression_share",
      "FROM keyword_view",
      "WHERE segments.date BETWEEN '" + startStr + "' AND '" + endStr + "'",
      "  AND ad_group_criterion.status != 'REMOVED'",
      "  AND metrics.impressions > 0",
      "  AND campaign.name = '" + cname + "'"
    ].join(" ");
  } else if (entityType === "search_term") {
    q = [
      "SELECT",
      "  campaign.name,",
      "  ad_group.name,",
      "  search_term_view.search_term,",
      "  segments.search_term_match_type,",
      "  segments.date,",
      "  metrics.impressions,",
      "  metrics.clicks,",
      "  metrics.cost_micros,",
      "  metrics.conversions,",
      "  metrics.ctr,",
      "  metrics.average_cpc",
      "FROM search_term_view",
      "WHERE segments.date BETWEEN '" + startStr + "' AND '" + endStr + "'",
      "  AND metrics.impressions > 0",
      "  AND campaign.name = '" + cname + "'"
    ].join(" ");
  } else {
    return [];
  }

  var out = [];
  try {
    var iter = AdsApp.report(q).rows();
    while (iter.hasNext()) {
      var r = iter.next();
      var row = mapReportRow(entityType, r);
      if (row) {
        out.push(row);
      }
    }
  } catch (e) {
    Logger.log(
      "GAQL report error " +
        entityType +
        " " +
        campaignName +
        " " +
        startStr +
        ".." +
        endStr +
        ": " +
        e.toString()
    );
  }
  return out;
}

function mapReportRow(entityType, r) {
  var d = str(r["segments.date"]);
  if (entityType === "campaign") {
    var cn = str(r["campaign.name"]);
    return {
      date: d,
      entity_name: cn,
      campaign: cn,
      ad_group: "",
      match_type: null,
      keyword: "",
      search_term: "",
      impressions: integer(r["metrics.impressions"]),
      clicks: integer(r["metrics.clicks"]),
      cost: micros(r["metrics.cost_micros"]),
      conversions: decimal(r["metrics.conversions"]),
      ctr: decimal(r["metrics.ctr"]),
      avg_cpc: micros(r["metrics.average_cpc"]),
      cost_per_conversion: micros(r["metrics.cost_per_conversion"]),
      impression_share: str(r["metrics.search_impression_share"]),
      quality_score: null
    };
  }
  if (entityType === "ad_group") {
    var c2 = str(r["campaign.name"]);
    var ag = str(r["ad_group.name"]);
    return {
      date: d,
      entity_name: ag,
      campaign: c2,
      ad_group: ag,
      match_type: null,
      keyword: "",
      search_term: "",
      impressions: integer(r["metrics.impressions"]),
      clicks: integer(r["metrics.clicks"]),
      cost: micros(r["metrics.cost_micros"]),
      conversions: decimal(r["metrics.conversions"]),
      ctr: decimal(r["metrics.ctr"]),
      avg_cpc: micros(r["metrics.average_cpc"]),
      cost_per_conversion: micros(r["metrics.cost_per_conversion"]),
      impression_share: null,
      quality_score: null
    };
  }
  if (entityType === "keyword") {
    var c3 = str(r["campaign.name"]);
    var ag3 = str(r["ad_group.name"]);
    var kw = str(r["ad_group_criterion.keyword.text"]);
    return {
      date: d,
      entity_name: kw,
      campaign: c3,
      ad_group: ag3,
      match_type: str(r["ad_group_criterion.keyword.match_type"]),
      keyword: kw,
      search_term: "",
      impressions: integer(r["metrics.impressions"]),
      clicks: integer(r["metrics.clicks"]),
      cost: micros(r["metrics.cost_micros"]),
      conversions: decimal(r["metrics.conversions"]),
      ctr: decimal(r["metrics.ctr"]),
      avg_cpc: micros(r["metrics.average_cpc"]),
      cost_per_conversion: micros(r["metrics.cost_per_conversion"]),
      impression_share: str(r["metrics.search_impression_share"]),
      quality_score: str(r["ad_group_criterion.quality_info.quality_score"])
    };
  }
  if (entityType === "search_term") {
    var c4 = str(r["campaign.name"]);
    var ag4 = str(r["ad_group.name"]);
    var st = str(r["search_term_view.search_term"]);
    return {
      date: d,
      entity_name: st,
      campaign: c4,
      ad_group: ag4,
      match_type: str(r["segments.search_term_match_type"]),
      keyword: "",
      search_term: st,
      impressions: integer(r["metrics.impressions"]),
      clicks: integer(r["metrics.clicks"]),
      cost: micros(r["metrics.cost_micros"]),
      conversions: decimal(r["metrics.conversions"]),
      ctr: decimal(r["metrics.ctr"]),
      avg_cpc: micros(r["metrics.average_cpc"]),
      cost_per_conversion: 0,
      impression_share: null,
      quality_score: null
    };
  }
  return null;
}

// ============================================================
// POST BATCHES
// ============================================================

function postHistoryBatches(entityType, rows, acc) {
  if (!rows || rows.length === 0) {
    return;
  }
  var url = CONFIG.API_BASE + "/api/ads/ingest/history";
  var i = 0;
  while (i < rows.length) {
    var batch = rows.slice(i, i + CONFIG.BATCH_SIZE);
    i = i + CONFIG.BATCH_SIZE;
    var payload = { entity_type: entityType, rows: batch };
    var options = {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + CONFIG.ADS_API_SECRET },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    try {
      var resp = UrlFetchApp.fetch(url, options);
      var code = resp.getResponseCode();
      var body = resp.getContentText();
      if (code === 200) {
        var parsed = JSON.parse(body);
        acc.sent = acc.sent + (parsed.received || 0);
        acc.inserted = acc.inserted + (parsed.inserted || 0);
        acc.skipped = acc.skipped + (parsed.skipped || 0);
        Logger.log(
          entityType + " batch: received=" + parsed.received + " inserted=" + parsed.inserted + " skipped=" + parsed.skipped
        );
      } else {
        Logger.log("History POST error " + code + ": " + body);
      }
    } catch (e) {
      Logger.log("History POST exception: " + e.toString());
    }
  }
}

// ============================================================
// HELPERS (monetary + strings — same idea as code.gs)
// ============================================================

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
  if (val === null || val === undefined) {
    return "";
  }
  return String(val);
}

/**
 * formatDate — JS Date to YYYY-MM-DD (UTC calendar parts).
 */
function formatDate(date) {
  var y = date.getUTCFullYear();
  var m = date.getUTCMonth() + 1;
  var d = date.getUTCDate();
  return y + "-" + pad2(m) + "-" + pad2(d);
}

function pad2(n) {
  return n < 10 ? "0" + n : "" + n;
}

/**
 * addDays — YYYY-MM-DD string, n days later (UTC).
 */
function addDays(dateStr, n) {
  var parts = dateStr.split("-");
  var y = parseInt(parts[0], 10);
  var mo = parseInt(parts[1], 10) - 1;
  var da = parseInt(parts[2], 10);
  var dt = new Date(Date.UTC(y, mo, da));
  dt.setUTCDate(dt.getUTCDate() + n);
  return formatDate(dt);
}

/**
 * daysBetween — exclusive day difference (end - start). YYYY-MM-DD strings, UTC.
 */
function daysBetween(startStr, endStr) {
  var partsS = startStr.split("-");
  var partsE = endStr.split("-");
  var s = Date.UTC(
    parseInt(partsS[0], 10),
    parseInt(partsS[1], 10) - 1,
    parseInt(partsS[2], 10)
  );
  var e = Date.UTC(
    parseInt(partsE[0], 10),
    parseInt(partsE[1], 10) - 1,
    parseInt(partsE[2], 10)
  );
  return Math.round((e - s) / (24 * 60 * 60 * 1000));
}
