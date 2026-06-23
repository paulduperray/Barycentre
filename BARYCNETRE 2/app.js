const COLORS = {
  navy: "#071C51",
  blue: "#0199FC",
  orange: "#FFA301",
  red: "#E4473F",
  green: "#2DB84C",
  grey: "#9AA5B5",
};

const FRANCE_SEEDS = [
  { city: "Paris", lat: 48.8566, lon: 2.3522 },
  { city: "Lille", lat: 50.6292, lon: 3.0573 },
  { city: "Lyon", lat: 45.764, lon: 4.8357 },
  { city: "Bordeaux", lat: 44.8378, lon: -0.5792 },
  { city: "Marseille", lat: 43.2965, lon: 5.3698 },
  { city: "Uzes", lat: 44.0121, lon: 4.4197 },
  { city: "Nantes", lat: 47.2184, lon: -1.5536 },
  { city: "Toulouse", lat: 43.6047, lon: 1.4442 },
  { city: "Strasbourg", lat: 48.5734, lon: 7.7521 },
  { city: "Rennes", lat: 48.1173, lon: -1.6778 },
  { city: "Dijon", lat: 47.322, lon: 5.0415 },
  { city: "Clermont", lat: 45.7772, lon: 3.087 },
  { city: "Rouen", lat: 49.4431, lon: 1.0993 },
  { city: "Tours", lat: 47.3941, lon: 0.6848 },
  { city: "Montpellier", lat: 43.6108, lon: 3.8767 },
  { city: "Nice", lat: 43.7102, lon: 7.262 },
];

const CANDIDATE_SEEDS = [
  { city: "Lyon", lat: 45.764, lon: 4.8357 },
  { city: "Orleans", lat: 47.9029, lon: 1.9093 },
  { city: "Toulouse", lat: 43.6047, lon: 1.4442 },
  { city: "Dijon", lat: 47.322, lon: 5.0415 },
  { city: "Nantes", lat: 47.2184, lon: -1.5536 },
  { city: "Paris", lat: 48.8566, lon: 2.3522 },
  { city: "Lille", lat: 50.6292, lon: 3.0573 },
  { city: "Bordeaux", lat: 44.8378, lon: -0.5792 },
  { city: "Marseille", lat: 43.2965, lon: 5.3698 },
  { city: "Strasbourg", lat: 48.5734, lon: 7.7521 },
  { city: "Rennes", lat: 48.1173, lon: -1.6778 },
  { city: "Tours", lat: 47.3941, lon: 0.6848 },
  { city: "Clermont", lat: 45.7772, lon: 3.087 },
  { city: "Rouen", lat: 49.4431, lon: 1.0993 },
  { city: "Montpellier", lat: 43.6108, lon: 3.8767 },
  { city: "Nice", lat: 43.7102, lon: 7.262 },
  { city: "Nancy", lat: 48.6921, lon: 6.1844 },
  { city: "Metz", lat: 49.1193, lon: 6.1757 },
  { city: "Reims", lat: 49.2583, lon: 4.0317 },
  { city: "Poitiers", lat: 46.5802, lon: 0.3404 },
];

const TRANSPORT_COST_MIN = 200;
const TRANSPORT_COST_MAX = 800;
const OSRM_ENDPOINT_TEMPLATE = "https://router.project-osrm.org/route/v1/driving/{fromLon},{fromLat};{toLon},{toLat}?overview=false";
const FRANCE_BOUNDS = [
  [41.0, -5.6],
  [51.6, 9.8],
];
const FRANCE_CENTER = [46.65, 2.45];

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const DEMO_CLIENTS = [
  { code: "CLI-PARIS", name: "Paris Distribution", lat: 48.8566, lon: 2.3522, volume: 420 },
  { code: "CLI-LILLE", name: "Lille Retail", lat: 50.6292, lon: 3.0573, volume: 210 },
  { code: "CLI-LYON", name: "Lyon Hub Client", lat: 45.764, lon: 4.8357, volume: 350 },
  { code: "CLI-BDX", name: "Bordeaux Ouest", lat: 44.8378, lon: -0.5792, volume: 190 },
];

const DEMO_PRODUCTION = [
  { code: "PROD-MRS", name: "Marseille Production", lat: 43.2965, lon: 5.3698, volume: 520 },
  { code: "PROD-UZES", name: "Uzes Atelier", lat: 44.0121, lon: 4.4197, volume: 260 },
];

const DEMO_CANDIDATES = [
  ...CANDIDATE_SEEDS.map((candidate) => ({
    code: `CAND-${candidate.city.toUpperCase()}`,
    name: `Entrepot ${candidate.city}`,
    lat: candidate.lat,
    lon: candidate.lon,
  })).slice(0, 4),
];

function withIds(rows) {
  return rows.map((row) => ({ id: createId(), ...row }));
}

const state = {
  currentPage: "dashboard",
  costRate: 1.8,
  apiLastStatus: "Pret",
  apiLastResponse: "Aucun appel API.",
  clients: withIds(DEMO_CLIENTS),
  production: withIds(DEMO_PRODUCTION),
  candidates: withIds(DEMO_CANDIDATES),
  roadCosts: [],
};

const elements = {
  pageTabs: document.querySelectorAll(".page-tab"),
  dashboardPage: document.getElementById("dashboardPage"),
  detailsPage: document.getElementById("detailsPage"),
  apiPage: document.getElementById("apiPage"),
  map: document.getElementById("map"),
  costRate: document.getElementById("costRate"),
  alertsPanel: document.getElementById("alertsPanel"),
  alertsList: document.getElementById("alertsList"),
  kpiVolume: document.getElementById("kpiVolume"),
  kpiClients: document.getElementById("kpiClients"),
  kpiSites: document.getElementById("kpiSites"),
  kpiCandidates: document.getElementById("kpiCandidates"),
  geoLat: document.getElementById("geoLat"),
  geoLon: document.getElementById("geoLon"),
  geoDistance: document.getElementById("geoDistance"),
  geoCost: document.getElementById("geoCost"),
  roadCandidate: document.getElementById("roadCandidate"),
  roadLat: document.getElementById("roadLat"),
  roadLon: document.getElementById("roadLon"),
  roadDistance: document.getElementById("roadDistance"),
  roadCost: document.getElementById("roadCost"),
  detailBestCandidate: document.getElementById("detailBestCandidate"),
  detailBestCost: document.getElementById("detailBestCost"),
  detailGeoGap: document.getElementById("detailGeoGap"),
  detailLinkCount: document.getElementById("detailLinkCount"),
  scenarioBoard: document.getElementById("scenarioBoard"),
  scenarioComparisonChart: document.getElementById("scenarioComparisonChart"),
  detailedMatrixTable: document.getElementById("detailedMatrixTable"),
  exportDetailedMatrix: document.getElementById("exportDetailedMatrix"),
  apiEndpointTemplate: document.getElementById("apiEndpointTemplate"),
  apiTestRoute: document.getElementById("apiTestRoute"),
  apiCalculateAll: document.getElementById("apiCalculateAll"),
  apiExportJson: document.getElementById("apiExportJson"),
  apiExportCsv: document.getElementById("apiExportCsv"),
  apiRouteCount: document.getElementById("apiRouteCount"),
  apiHaversineTotal: document.getElementById("apiHaversineTotal"),
  apiRoadTotal: document.getElementById("apiRoadTotal"),
  apiStatusCard: document.getElementById("apiStatusCard"),
  apiStatus: document.getElementById("apiStatus"),
  dashboardApiCard: document.getElementById("dashboardApiCard"),
  dashboardApiStatus: document.getElementById("dashboardApiStatus"),
  dashboardApiCalculateAll: document.getElementById("dashboardApiCalculateAll"),
  apiPayloadPreview: document.getElementById("apiPayloadPreview"),
  apiResponsePreview: document.getElementById("apiResponsePreview"),
  apiRoutesTable: document.getElementById("apiRoutesTable"),
  setAllVolumes: document.getElementById("setAllVolumes"),
  randomizeVolumesCosts: document.getElementById("randomizeVolumesCosts"),
  addClient: document.getElementById("addClient"),
  addProduction: document.getElementById("addProduction"),
  addCandidate: document.getElementById("addCandidate"),
  resetClients: document.getElementById("resetClients"),
  resetProduction: document.getElementById("resetProduction"),
  resetCandidates: document.getElementById("resetCandidates"),
  importClients: document.getElementById("importClients"),
  exportClients: document.getElementById("exportClients"),
  importProduction: document.getElementById("importProduction"),
  exportProduction: document.getElementById("exportProduction"),
  importCandidates: document.getElementById("importCandidates"),
  exportCandidates: document.getElementById("exportCandidates"),
  regenerateRoadCosts: document.getElementById("regenerateRoadCosts"),
  exportRoadCosts: document.getElementById("exportRoadCosts"),
  clientsCsvFile: document.getElementById("clientsCsvFile"),
  productionCsvFile: document.getElementById("productionCsvFile"),
  candidatesCsvFile: document.getElementById("candidatesCsvFile"),
  clientsTable: document.getElementById("clientsTable"),
  productionTable: document.getElementById("productionTable"),
  candidatesTable: document.getElementById("candidatesTable"),
};

const map = L.map("map", {
  zoomControl: false,
  scrollWheelZoom: true,
  preferCanvas: true,
  zoomAnimation: false,
  fadeAnimation: false,
  markerZoomAnimation: false,
  maxBounds: FRANCE_BOUNDS,
  maxBoundsViscosity: 1,
  minZoom: 5,
}).fitBounds(FRANCE_BOUNDS, { padding: [18, 18], animate: false });

L.control.zoom({ position: "bottomright" }).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  tileSize: 256,
  detectRetina: false,
  updateWhenIdle: false,
  keepBuffer: 4,
  attribution: "&copy; OpenStreetMap",
}).addTo(map);

map.setMaxBounds(FRANCE_BOUNDS);

map.createPane("pointPane");
map.createPane("candidatePane");
map.createPane("warehousePane");
map.createPane("roadPane");
map.getPane("pointPane").style.zIndex = 520;
map.getPane("candidatePane").style.zIndex = 600;
map.getPane("warehousePane").style.zIndex = 650;
map.getPane("roadPane").style.zIndex = 660;

const layers = {
  points: L.layerGroup().addTo(map),
  candidates: L.layerGroup().addTo(map),
  geoOptimum: L.layerGroup().addTo(map),
  roadOptimum: L.layerGroup().addTo(map),
};

let latestMapBoundsItems = [];
let mapRefreshHandle = null;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversine(a, b) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function getAllPoints() {
  return [
    ...state.clients.map((point) => ({ ...point, type: "client" })),
    ...state.production.map((point) => ({ ...point, type: "production" })),
  ].filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon) && point.volume > 0);
}

function weightedCenter(points) {
  const totalVolume = points.reduce((sum, point) => sum + point.volume, 0);

  if (!points.length || totalVolume === 0) {
    return null;
  }

  return {
    lat: points.reduce((sum, point) => sum + point.lat * point.volume, 0) / totalVolume,
    lon: points.reduce((sum, point) => sum + point.lon * point.volume, 0) / totalVolume,
  };
}

function scoreGeoPoint(points, candidate) {
  return points.reduce((sum, point) => sum + haversine(point, candidate) * point.volume, 0);
}

function solveGeographic(points) {
  const center = weightedCenter(points);

  if (!center) {
    return null;
  }

  const scoreKmVol = scoreGeoPoint(points, center);

  return {
    lat: center.lat,
    lon: center.lon,
    scoreKmVol,
    totalCost: scoreKmVol * state.costRate,
    type: "geo",
  };
}

function roadCostKey(candidateCode, pointCode, pointType) {
  return `${candidateCode}|${pointCode}|${pointType}`;
}

function createTransportCost() {
  return randomInt(TRANSPORT_COST_MIN, TRANSPORT_COST_MAX);
}

function syncRoadCosts(options = {}) {
  const { regenerateCosts = false } = options;
  const existingLinks = new Map();

  state.roadCosts.forEach((link) => {
    existingLinks.set(roadCostKey(link.candidateCode, link.pointCode, link.pointType), link);
  });

  const points = getAllPoints();
  const nextRoadCosts = [];

  state.candidates.forEach((candidate) => {
    points.forEach((point) => {
      const key = roadCostKey(candidate.code, point.code, point.type);
      const existingLink = existingLinks.get(key);
      const existingCost = existingLink ? existingLink.transportCost : null;
      const transportCost = regenerateCosts || !Number.isFinite(existingCost) ? createTransportCost() : existingCost;
      const haversineKm = haversine(candidate, point);
      const fallbackRoadKm = Number(haversineKm.toFixed(1));
      const existingSource = existingLink ? existingLink.source || (existingLink.apiStatus === "API OK" ? "api" : "fallback") : "fallback";
      const hasApiDistance =
        existingLink &&
        ["api", "import"].includes(existingSource) &&
        Number.isFinite(existingLink.roadKm) &&
        coordinatesStillMatch(existingLink, candidate, point);

      nextRoadCosts.push({
        candidateCode: candidate.code,
        pointCode: point.code,
        pointType: point.type,
        fromLat: candidate.lat,
        fromLon: candidate.lon,
        toLat: point.lat,
        toLon: point.lon,
        haversineKm: Number(haversineKm.toFixed(1)),
        fallbackRoadKm,
        roadKm: hasApiDistance ? Number(existingLink.roadKm) : fallbackRoadKm,
        transportCost,
        durationMin: hasApiDistance && Number.isFinite(existingLink.durationMin) ? existingLink.durationMin : null,
        source: hasApiDistance ? "api" : "fallback",
        apiStatus: hasApiDistance ? "API OK" : "Fallback",
        apiError: hasApiDistance ? "" : existingLink?.apiError || "",
        updatedAt: hasApiDistance ? existingLink.updatedAt || "" : "",
      });
    });
  });

  state.roadCosts = nextRoadCosts;
}

function coordinatesStillMatch(link, candidate, point) {
  const storedCoordinates = [link.fromLat, link.fromLon, link.toLat, link.toLon];

  if (!storedCoordinates.every(Number.isFinite)) {
    return true;
  }

  return (
    nearlyEqual(link.fromLat, candidate.lat) &&
    nearlyEqual(link.fromLon, candidate.lon) &&
    nearlyEqual(link.toLat, point.lat) &&
    nearlyEqual(link.toLon, point.lon)
  );
}

function nearlyEqual(left, right) {
  return Math.abs(Number(left) - Number(right)) < 0.00001;
}

function regenerateRoadCosts() {
  syncRoadCosts({ regenerateCosts: true });
  render();
}

function buildRoadCostIndex(roadCosts) {
  const index = new Map();

  roadCosts.forEach((link) => {
    index.set(roadCostKey(link.candidateCode, link.pointCode, link.pointType), link);
  });

  return index;
}

function getRoadCostLink(index, candidateCode, point) {
  return index.get(roadCostKey(candidateCode, point.code, point.type)) || null;
}

function evaluateCandidate(candidate, points, roadCostIndex) {
  const missingLinks = [];
  let scoreKmVol = 0;
  let haversineKmVol = 0;
  let totalCost = 0;
  const linkDetails = [];

  points.forEach((point) => {
    const link = getRoadCostLink(roadCostIndex, candidate.code, point);
    const haversineKm = haversine(candidate, point);

    if (!link) {
      missingLinks.push({
        candidateCode: candidate.code,
        candidateName: candidate.name,
        pointCode: point.code,
        pointName: point.name,
        pointType: point.type,
      });
      return;
    }

    scoreKmVol += link.roadKm * point.volume;
    haversineKmVol += haversineKm * point.volume;
    totalCost += link.transportCost * point.volume;
    linkDetails.push({
      candidate,
      point,
      haversineKm,
      roadKm: link.roadKm,
      transportCost: link.transportCost,
      totalCost: link.transportCost * point.volume,
      source: link.source || "fallback",
      apiStatus: link.apiStatus || "Fallback",
      apiError: link.apiError || "",
    });
  });

  return {
    candidate,
    scoreKmVol,
    haversineKmVol,
    totalCost,
    linkDetails,
    missingLinks,
    isValid: missingLinks.length === 0,
  };
}

function solveRoad(candidates, points, roadCosts) {
  if (!candidates.length || !points.length) {
    return null;
  }

  const roadCostIndex = buildRoadCostIndex(roadCosts);
  const evaluations = candidates.map((candidate) => evaluateCandidate(candidate, points, roadCostIndex));
  const validEvaluations = evaluations.filter((evaluation) => evaluation.isValid);

  if (!validEvaluations.length) {
    return null;
  }

  validEvaluations.sort((left, right) => {
    if (left.totalCost !== right.totalCost) {
      return left.totalCost - right.totalCost;
    }

    return left.scoreKmVol - right.scoreKmVol;
  });

  const best = validEvaluations[0];

  return {
    candidateCode: best.candidate.code,
    candidateName: best.candidate.name,
    lat: best.candidate.lat,
    lon: best.candidate.lon,
    scoreKmVol: best.scoreKmVol,
    haversineKmVol: best.haversineKmVol,
    totalCost: best.totalCost,
    type: "road",
  };
}

function buildScenarioComparisons(candidates, points, roadCosts, geo) {
  if (!candidates.length) {
    return [];
  }

  const totalVolume = points.reduce((sum, point) => sum + point.volume, 0);
  const roadCostIndex = buildRoadCostIndex(roadCosts);
  const evaluations = candidates.map((candidate) => evaluateCandidate(candidate, points, roadCostIndex));
  const validEvaluations = evaluations
    .filter((evaluation) => evaluation.isValid)
    .sort((left, right) => {
      if (left.totalCost !== right.totalCost) {
        return left.totalCost - right.totalCost;
      }

      return left.scoreKmVol - right.scoreKmVol;
    });
  const bestCost = validEvaluations.length ? validEvaluations[0].totalCost : 0;
  const rankByCandidate = new Map();

  validEvaluations.forEach((evaluation, index) => {
    rankByCandidate.set(evaluation.candidate.code, index + 1);
  });

  return evaluations.map((evaluation) => {
      const linkedCount = evaluation.linkDetails.length;
      const geoGapKm = geo ? haversine(evaluation.candidate, geo) : 0;
      const avgRoadKm = totalVolume ? evaluation.scoreKmVol / totalVolume : 0;
      const avgHaversineKm = totalVolume ? evaluation.haversineKmVol / totalVolume : 0;
      const avgLinkCost = linkedCount
        ? evaluation.linkDetails.reduce((sum, link) => sum + link.transportCost, 0) / linkedCount
        : 0;
      const costDelta = bestCost ? evaluation.totalCost - bestCost : 0;
      const costDeltaPct = bestCost ? (costDelta / bestCost) * 100 : 0;

      return {
        ...evaluation,
        rank: rankByCandidate.get(evaluation.candidate.code) || null,
        linkedCount,
        geoGapKm,
        avgRoadKm,
        avgHaversineKm,
        avgLinkCost,
        costDelta,
        costDeltaPct,
        costPerVolume: totalVolume ? evaluation.totalCost / totalVolume : 0,
      };
    });
}

function buildAlerts(candidates, points, roadCosts, roadResult) {
  const alerts = [];

  if (!candidates.length) {
    alerts.push({ code: "NO_CANDIDATES", message: "Aucun candidat entrepot defini." });
  }

  if (!points.length) {
    alerts.push({ code: "NO_POINTS", message: "Aucun client ou site de production actif." });
  }

  if (candidates.length && points.length && roadCosts.length) {
    const roadCostIndex = buildRoadCostIndex(roadCosts);
    const missingKeys = new Set();

    candidates.forEach((candidate) => {
      points.forEach((point) => {
        const link = getRoadCostLink(roadCostIndex, candidate.code, point);

        if (!link) {
          const key = roadCostKey(candidate.code, point.code, point.type);

          if (!missingKeys.has(key)) {
            missingKeys.add(key);
            const typeLabel = point.type === "client" ? "client" : "production";
            alerts.push({
              code: "MISSING_LINK",
              message: `Liaison manquante : ${candidate.code} -> ${point.code} (${typeLabel})`,
            });
          }
        }
      });
    });

    if (!roadResult && candidates.length && points.length) {
      alerts.push({
        code: "NO_VALID_CANDIDATE",
        message: "Aucun candidat couvert entierement par la base de couts.",
      });
    }
  }

  return alerts;
}

function calculateResults() {
  const points = getAllPoints();
  syncRoadCosts();
  const geo = solveGeographic(points);
  const road = solveRoad(state.candidates, points, state.roadCosts);
  const scenarios = buildScenarioComparisons(state.candidates, points, state.roadCosts, geo);
  const alerts = buildAlerts(state.candidates, points, state.roadCosts, road);

  return { points, geo, road, scenarios, alerts };
}

function formatNumber(value, digits = 0) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value || 0);
}

function formatKmVolume(value) {
  return `${formatNumber(value, 0)} km.vol`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatPoint(result) {
  if (!result) {
    return "-";
  }

  return `${formatNumber(result.lat, 4)}, ${formatNumber(result.lon, 4)}`;
}

function render() {
  const results = calculateResults();
  renderKpis(results);
  renderAlerts(results);
  renderTables();
  renderDetails(results);
  renderApiStatusSummary(buildApiRoutes(results));

  if (state.currentPage === "dashboard") {
    renderMap(results);
  }

  if (state.currentPage === "api") {
    renderApiPage(results);
  }
}

function renderKpis(results) {
  const points = results.points;
  const totalVolume = points.reduce((sum, point) => sum + point.volume, 0);

  elements.kpiVolume.textContent = formatNumber(totalVolume);
  elements.kpiClients.textContent = formatNumber(state.clients.length);
  elements.kpiSites.textContent = formatNumber(state.production.length);
  elements.kpiCandidates.textContent = formatNumber(state.candidates.length);

  elements.geoLat.textContent = results.geo ? formatNumber(results.geo.lat, 5) : "-";
  elements.geoLon.textContent = results.geo ? formatNumber(results.geo.lon, 5) : "-";
  elements.geoDistance.textContent = results.geo ? formatKmVolume(results.geo.scoreKmVol) : "-";
  elements.geoCost.textContent = results.geo ? formatCurrency(results.geo.totalCost) : "-";

  elements.roadCandidate.textContent = results.road ? `${results.road.candidateName} (${results.road.candidateCode})` : "-";
  elements.roadLat.textContent = results.road ? formatNumber(results.road.lat, 5) : "-";
  elements.roadLon.textContent = results.road ? formatNumber(results.road.lon, 5) : "-";
  elements.roadDistance.textContent = results.road ? formatKmVolume(results.road.scoreKmVol) : "-";
  elements.roadCost.textContent = results.road ? formatCurrency(results.road.totalCost) : "-";
}

function renderAlerts(results) {
  const alerts = results.alerts;

  elements.alertsList.innerHTML = "";

  if (!alerts.length) {
    elements.alertsPanel.hidden = true;
    return;
  }

  elements.alertsPanel.hidden = false;

  alerts.forEach((alert) => {
    const item = document.createElement("li");
    item.textContent = alert.message;
    elements.alertsList.appendChild(item);
  });
}

function renderTables() {
  renderVolumeTable("clients", elements.clientsTable);
  renderVolumeTable("production", elements.productionTable);
  renderCandidateTable();
  renderCandidateActions();
}

function renderCandidateActions() {
  const existingCodes = new Set(state.candidates.map((row) => row.code));
  const availableCount = CANDIDATE_SEEDS.filter((candidate) => !existingCodes.has(candidateCodeFromCity(candidate.city))).length;

  elements.addCandidate.disabled = availableCount === 0;
  elements.addCandidate.textContent = availableCount === 0 ? "Liste complete" : "+ Ajouter";
}

function renderDetails(results) {
  const scenarios = results.scenarios || [];
  const bestScenario = scenarios.find((scenario) => scenario.rank === 1) || null;

  elements.detailBestCandidate.textContent = bestScenario
    ? `${bestScenario.candidate.name} (${bestScenario.candidate.code})`
    : "-";
  elements.detailBestCost.textContent = bestScenario ? formatCurrency(bestScenario.totalCost) : "-";
  elements.detailGeoGap.textContent = bestScenario ? `${formatNumber(bestScenario.geoGapKm, 1)} km` : "-";
  elements.detailLinkCount.textContent = formatNumber(state.roadCosts.length);

  renderScenarioBoard(scenarios);
  renderScenarioComparisonChart(scenarios);
  renderDetailedMatrix(scenarios);
}

function renderApiPage(results) {
  const routes = buildApiRoutes(results);
  const totalHaversine = routes.reduce((sum, route) => sum + route.haversineKm, 0);
  const totalRoad = routes.reduce((sum, route) => sum + route.roadKm, 0);

  elements.apiRouteCount.textContent = formatNumber(routes.length);
  elements.apiHaversineTotal.textContent = `${formatNumber(totalHaversine, 1)} km`;
  elements.apiRoadTotal.textContent = `${formatNumber(totalRoad, 1)} km`;
  elements.apiPayloadPreview.textContent = JSON.stringify(buildApiPayload(routes), null, 2);
  elements.apiResponsePreview.textContent = state.apiLastResponse;

  renderApiRoutesTable(routes);
}

function renderApiStatusSummary(routes) {
  const summary = getApiStatusSummary(routes);
  const label = `${formatNumber(summary.ok)} / ${formatNumber(summary.total)}`;

  elements.apiStatus.textContent = label;
  elements.dashboardApiStatus.textContent = label;
  applyApiStatusClass(elements.apiStatusCard, summary);
  applyApiStatusClass(elements.dashboardApiCard, summary);
}

function getApiStatusSummary(routes) {
  const total = routes.length;
  const ok = routes.filter((route) => route.status === "API OK").length;

  return {
    total,
    ok,
    complete: total > 0 && ok === total,
  };
}

function applyApiStatusClass(element, summary) {
  element.classList.toggle("api-complete", summary.complete);
  element.classList.toggle("api-missing", !summary.complete);
}

function buildApiRoutes(results = calculateResults()) {
  const points = results.points || [];
  const template = elements.apiEndpointTemplate.value.trim() || OSRM_ENDPOINT_TEMPLATE;
  const roadCostIndex = buildRoadCostIndex(state.roadCosts);

  return state.candidates.flatMap((candidate) =>
    points.map((point) => {
      const key = roadCostKey(candidate.code, point.code, point.type);
      const haversineKm = haversine(candidate, point);
      const fallbackRoadKm = haversineKm;
      const roadLink = roadCostIndex.get(key);
      const status = roadLink?.apiStatus || (roadLink?.source === "api" ? "API OK" : "Fallback");
      const roadKm = roadLink && Number.isFinite(roadLink.roadKm) ? roadLink.roadKm : fallbackRoadKm;

      return {
        key,
        candidateCode: candidate.code,
        candidateName: candidate.name,
        pointCode: point.code,
        pointName: point.name,
        pointType: point.type,
        fromLat: candidate.lat,
        fromLon: candidate.lon,
        toLat: point.lat,
        toLon: point.lon,
        haversineKm,
        fallbackRoadKm,
        roadKm,
        durationMin: roadLink && Number.isFinite(roadLink.durationMin) ? roadLink.durationMin : null,
        status,
        source: roadLink?.source || "fallback",
        apiError: roadLink?.apiError || "",
        url: formatApiUrl(template, candidate, point),
      };
    })
  );
}

function buildApiPayload(routes) {
  return {
    provider: "osrm-demo",
    route_count: routes.length,
    fallback: "haversine_direct",
    endpoint_template: elements.apiEndpointTemplate.value.trim() || OSRM_ENDPOINT_TEMPLATE,
    routes: routes.slice(0, 12).map((route) => ({
      id: route.key,
      candidate_code: route.candidateCode,
      point_code: route.pointCode,
      point_type: route.pointType,
      from: { lat: route.fromLat, lon: route.fromLon },
      to: { lat: route.toLat, lon: route.toLon },
      haversine_km: Number(route.haversineKm.toFixed(3)),
      road_km: Number(route.roadKm.toFixed(3)),
      status: route.status,
      url: route.url,
    })),
  };
}

function renderApiRoutesTable(routes) {
  elements.apiRoutesTable.innerHTML = "";

  routes.forEach((route) => {
    const tr = document.createElement("tr");
    const statusClass = route.status === "API OK" ? "ok" : route.status === "Fallback" ? "fallback" : "error";

    tr.innerHTML = `
      <td>${escapeHtml(route.candidateName)}<br><span class="scenario-code">${escapeHtml(route.candidateCode)}</span></td>
      <td>${escapeHtml(route.pointName)}<br><span class="scenario-code">${escapeHtml(route.pointCode)}</span></td>
      <td>${route.pointType === "client" ? "Client" : "Production"}</td>
      <td>${formatNumber(route.haversineKm, 1)} km</td>
      <td>${formatNumber(route.roadKm, 1)} km</td>
      <td><span class="api-status-pill ${statusClass}" title="${escapeAttribute(route.apiError || route.status)}">${escapeHtml(route.status)}</span></td>
      <td class="api-url-cell" title="${escapeAttribute(route.url)}">${escapeHtml(route.url)}</td>
    `;
    elements.apiRoutesTable.appendChild(tr);
  });
}

function formatApiUrl(template, candidate, point) {
  return template
    .replaceAll("{fromLat}", toInputNumber(candidate.lat, 5))
    .replaceAll("{fromLon}", toInputNumber(candidate.lon, 5))
    .replaceAll("{toLat}", toInputNumber(point.lat, 5))
    .replaceAll("{toLon}", toInputNumber(point.lon, 5))
    .replaceAll("{candidateCode}", encodeURIComponent(candidate.code))
    .replaceAll("{pointCode}", encodeURIComponent(point.code));
}

function parseRoadApiResponse(payload) {
  const route = Array.isArray(payload.routes) ? payload.routes[0] : null;

  if (route && Number.isFinite(route.distance)) {
    return {
      roadKm: route.distance / 1000,
      durationMin: Number.isFinite(route.duration) ? route.duration / 60 : null,
    };
  }

  if (Number.isFinite(payload.distance_km)) {
    return {
      roadKm: payload.distance_km,
      durationMin: Number.isFinite(payload.duration_min) ? payload.duration_min : null,
    };
  }

  if (Number.isFinite(payload.distance)) {
    return {
      roadKm: payload.distance > 1000 ? payload.distance / 1000 : payload.distance,
      durationMin: Number.isFinite(payload.duration) ? payload.duration / 60 : null,
    };
  }

  return null;
}

async function requestRoadApiDistance(route) {
  const response = await fetch(route.url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = await response.json();
  const parsed = parseRoadApiResponse(payload);

  if (!parsed) {
    throw new Error("Format de distance non reconnu");
  }

  return { payload, parsed };
}

function writeRoadCostApiResult(route, parsed) {
  writeRoadCostRoute(route, {
    roadKm: Number(parsed.roadKm.toFixed(1)),
    durationMin: Number.isFinite(parsed.durationMin) ? Number(parsed.durationMin.toFixed(1)) : null,
    source: "api",
    apiStatus: "API OK",
    apiError: "",
    updatedAt: new Date().toISOString(),
  });
}

function writeRoadCostFallback(route, errorMessage = "") {
  writeRoadCostRoute(route, {
    roadKm: Number(route.fallbackRoadKm.toFixed(1)),
    durationMin: null,
    source: "fallback",
    apiStatus: "Fallback",
    apiError: errorMessage,
    updatedAt: new Date().toISOString(),
  });
}

function writeRoadCostRoute(route, patch) {
  const index = state.roadCosts.findIndex(
    (link) =>
      link.candidateCode === route.candidateCode &&
      link.pointCode === route.pointCode &&
      link.pointType === route.pointType
  );
  const current = index >= 0 ? state.roadCosts[index] : {};
  const next = {
    ...current,
    candidateCode: route.candidateCode,
    pointCode: route.pointCode,
    pointType: route.pointType,
    fromLat: route.fromLat,
    fromLon: route.fromLon,
    toLat: route.toLat,
    toLon: route.toLon,
    haversineKm: Number(route.haversineKm.toFixed(1)),
    fallbackRoadKm: Number(route.fallbackRoadKm.toFixed(1)),
    transportCost: Number.isFinite(current.transportCost) ? current.transportCost : createTransportCost(),
    ...patch,
  };

  if (index >= 0) {
    state.roadCosts[index] = next;
  } else {
    state.roadCosts.push(next);
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function renderScenarioBoard(scenarios) {
  elements.scenarioBoard.innerHTML = "";

  if (!scenarios.length) {
    const empty = document.createElement("div");
    empty.className = "scenario-card";
    empty.innerHTML = `
      <div class="scenario-card-head">
        <div>
          <h3>Aucun scenario</h3>
          <span class="scenario-code">Ajoute au moins un candidat entrepot.</span>
        </div>
      </div>
    `;
    elements.scenarioBoard.appendChild(empty);
    return;
  }

  const orderedScenarios = orderScenariosByRank(scenarios);
  const maxCost = Math.max(...orderedScenarios.map((scenario) => scenario.totalCost), 1);
  const maxRoad = Math.max(...orderedScenarios.map((scenario) => scenario.avgRoadKm), 1);
  const maxGeoGap = Math.max(...orderedScenarios.map((scenario) => scenario.geoGapKm), 1);

  orderedScenarios.forEach((scenario) => {
    const card = document.createElement("article");
    card.className = `scenario-card${scenario.rank === 1 ? " best" : ""}`;
    const cardTooltip = `${scenario.candidate.name} - rang ${scenario.rank || "-"} | Cout ${formatCurrency(
      scenario.totalCost
    )} | Routier moyen ${formatNumber(scenario.avgRoadKm, 1)} km | Ecart au barycentre geo ${formatNumber(
      scenario.geoGapKm,
      1
    )} km`;
    card.innerHTML = `
      <div class="scenario-card-head has-tooltip" data-tooltip="${escapeAttribute(cardTooltip)}">
        <div>
          <h3>${escapeHtml(scenario.candidate.name)}</h3>
          <span class="scenario-code">${escapeHtml(scenario.candidate.code)} - ${formatPoint(scenario.candidate)}</span>
        </div>
        <span class="rank-badge">${scenario.rank ? `#${scenario.rank}` : "-"}</span>
      </div>

      <div class="scenario-cost-hero has-tooltip" data-tooltip="${escapeAttribute(
        `Somme des couts de liaison ponderes par les volumes. Ecart vs meilleur : ${formatCurrency(scenario.costDelta)}.`
      )}">
        <span>Cout transport total</span>
        <strong>${formatCurrency(scenario.totalCost)}</strong>
        <em>${scenario.rank === 1 ? "Meilleur scenario" : `+${formatCurrency(scenario.costDelta)} vs meilleur`}</em>
      </div>

      <div class="scenario-metrics">
        <div class="scenario-metric has-tooltip" data-tooltip="${escapeAttribute(
          `Ecart de cout par rapport au candidat le moins cher.`
        )}">
          <span>Ecart meilleur</span>
          <strong>${scenario.rank === 1 ? "Best" : `+${formatNumber(scenario.costDeltaPct, 1)}%`}</strong>
        </div>
        <div class="scenario-metric has-tooltip" data-tooltip="${escapeAttribute(
          `Distance routiere moyenne ponderee par les volumes.`
        )}">
          <span>Routier moyen</span>
          <strong>${formatNumber(scenario.avgRoadKm, 1)} km</strong>
        </div>
        <div class="scenario-metric has-tooltip" data-tooltip="${escapeAttribute(
          `Distance Haversine moyenne ponderee par les volumes.`
        )}">
          <span>Haversine moyen</span>
          <strong>${formatNumber(scenario.avgHaversineKm, 1)} km</strong>
        </div>
        <div class="scenario-metric has-tooltip" data-tooltip="${escapeAttribute(
          `Distance directe entre ce candidat et le barycentre geographique.`
        )}">
          <span>Dist. barycentre geo</span>
          <strong>${formatNumber(scenario.geoGapKm, 1)} km</strong>
        </div>
        <div class="scenario-metric has-tooltip" data-tooltip="${escapeAttribute(
          `Moyenne simple des couts de liaison.`
        )}">
          <span>Cout liaison moy.</span>
          <strong>${formatCurrency(scenario.avgLinkCost)}</strong>
        </div>
      </div>

      <div class="scenario-bars">
        <div class="bar-row has-tooltip" data-tooltip="${escapeAttribute(
          `Cout total du scenario : ${formatCurrency(scenario.totalCost)}.`
        )}">
          <span>Cout</span>
          <div class="bar-track"><i class="bar-fill cost" style="width:${barWidth(scenario.totalCost, maxCost)}%"></i></div>
          <span>${formatNumber(scenario.costPerVolume, 0)}/vol</span>
        </div>
        <div class="bar-row has-tooltip" data-tooltip="${escapeAttribute(
          `Distance routiere moyenne : OSRM si disponible, sinon Haversine directe en fallback, ponderee par les volumes.`
        )}">
          <span>Routier</span>
          <div class="bar-track"><i class="bar-fill" style="width:${barWidth(scenario.avgRoadKm, maxRoad)}%"></i></div>
          <span>${formatNumber(scenario.avgRoadKm, 0)} km</span>
        </div>
        <div class="bar-row has-tooltip" data-tooltip="${escapeAttribute(
          `Distance Haversine entre le candidat et le barycentre geographique.`
        )}">
          <span>Vs geo</span>
          <div class="bar-track"><i class="bar-fill geo-gap" style="width:${barWidth(scenario.geoGapKm, maxGeoGap)}%"></i></div>
          <span>${formatNumber(scenario.geoGapKm, 0)} km</span>
        </div>
      </div>
    `;
    elements.scenarioBoard.appendChild(card);
  });
}

function renderScenarioComparisonChart(scenarios) {
  elements.scenarioComparisonChart.innerHTML = "";

  if (!scenarios.length) {
    elements.scenarioComparisonChart.innerHTML = '<div class="chart-empty">Aucun candidat a comparer.</div>';
    return;
  }

  const orderedScenarios = orderScenariosByRank(scenarios);
  const maxCost = Math.max(...orderedScenarios.map((scenario) => scenario.totalCost), 1);
  const maxRoad = Math.max(...orderedScenarios.map((scenario) => scenario.avgRoadKm), 1);

  orderedScenarios.forEach((scenario) => {
    const row = document.createElement("div");
    row.className = `scenario-chart-row has-tooltip${scenario.rank === 1 ? " best" : ""}`;
    row.dataset.tooltip = `${scenario.candidate.name} | Cout ${formatCurrency(
      scenario.totalCost
    )} | Distance routiere moyenne ${formatNumber(scenario.avgRoadKm, 1)} km | Cout liaison moyen ${formatCurrency(
      scenario.avgLinkCost
    )}`;
    row.innerHTML = `
      <div class="chart-bars">
        <div class="chart-bar">
          <span class="bar-value">${formatCurrency(scenario.totalCost)}</span>
          <div class="bar-scale">
            <i class="vertical-bar cost" style="height:${barWidth(scenario.totalCost, maxCost)}%"></i>
          </div>
          <span class="bar-label">Cout</span>
        </div>
        <div class="chart-bar">
          <span class="bar-value">${formatNumber(scenario.avgRoadKm, 1)} km</span>
          <div class="bar-scale">
            <i class="vertical-bar distance" style="height:${barWidth(scenario.avgRoadKm, maxRoad)}%"></i>
          </div>
          <span class="bar-label">Distance</span>
        </div>
      </div>
      <div class="chart-candidate">
        <span class="rank-badge small">${scenario.rank ? `#${scenario.rank}` : "-"}</span>
        <div>
          <strong>${escapeHtml(scenario.candidate.name)}</strong>
          <span>${escapeHtml(scenario.candidate.code)}</span>
        </div>
      </div>
    `;
    elements.scenarioComparisonChart.appendChild(row);
  });
}

function orderScenariosByRank(scenarios) {
  return [...scenarios].sort((left, right) => {
    const leftRank = left.rank || Number.MAX_SAFE_INTEGER;
    const rightRank = right.rank || Number.MAX_SAFE_INTEGER;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return left.candidate.code.localeCompare(right.candidate.code);
  });
}

function renderDetailedMatrix(scenarios) {
  elements.detailedMatrixTable.innerHTML = "";

  scenarios.forEach((scenario) => {
    scenario.linkDetails.forEach((link) => {
      const tr = document.createElement("tr");
      const isApiOk = link.apiStatus === "API OK";

      if (!isApiOk) {
        tr.className = "matrix-row-api-missing";
        tr.title = link.apiError
          ? `Distance API non calculee : ${link.apiError}`
          : "Distance API non calculee : fallback Haversine utilise.";
      }

      tr.innerHTML = `
        <td>${scenario.rank || "-"}</td>
        <td>${escapeHtml(scenario.candidate.name)}<br><span class="scenario-code">${escapeHtml(scenario.candidate.code)}</span></td>
        <td>${escapeHtml(link.point.name)}<br><span class="scenario-code">${escapeHtml(link.point.code)}</span></td>
        <td>${link.point.type === "client" ? "Client" : "Prod"}</td>
        <td>${formatNumber(link.point.volume)}</td>
        <td>${formatNumber(link.haversineKm, 1)}</td>
        <td>${formatNumber(link.roadKm, 1)}</td>
        <td>${formatCurrency(link.transportCost)}</td>
        <td>${formatCurrency(link.totalCost)}</td>
        <td>${formatNumber(scenario.geoGapKm, 1)} km</td>
      `;
      elements.detailedMatrixTable.appendChild(tr);
    });
  });
}

function barWidth(value, max) {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }

  return Math.max(4, Math.min(100, (value / max) * 100));
}

function renderVolumeTable(type, tableBody) {
  tableBody.innerHTML = "";

  state[type].forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input class="cell-input" data-type="${type}" data-id="${row.id}" data-field="code" value="${escapeHtml(row.code)}" aria-label="Code"></td>
      <td><input class="cell-input" data-type="${type}" data-id="${row.id}" data-field="name" value="${escapeHtml(row.name)}" aria-label="Nom"></td>
      <td><input class="cell-input number" type="number" step="0.00001" data-type="${type}" data-id="${row.id}" data-field="lat" value="${toInputNumber(row.lat, 5)}" aria-label="Latitude"></td>
      <td><input class="cell-input number" type="number" step="0.00001" data-type="${type}" data-id="${row.id}" data-field="lon" value="${toInputNumber(row.lon, 5)}" aria-label="Longitude"></td>
      <td><input class="cell-input number" type="number" min="0" step="1" data-type="${type}" data-id="${row.id}" data-field="volume" value="${toInputNumber(row.volume, 0)}" aria-label="Volume"></td>
      <td><button class="small-action" type="button" data-action="delete" data-type="${type}" data-id="${row.id}" title="Supprimer" aria-label="Supprimer">x</button></td>
    `;
    tableBody.appendChild(tr);
  });
}

function renderCandidateTable() {
  const tableBody = elements.candidatesTable;
  tableBody.innerHTML = "";

  state.candidates.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input class="cell-input" data-type="candidates" data-id="${row.id}" data-field="code" value="${escapeHtml(row.code)}" aria-label="Code"></td>
      <td><input class="cell-input" data-type="candidates" data-id="${row.id}" data-field="name" value="${escapeHtml(row.name)}" aria-label="Nom"></td>
      <td><input class="cell-input number" type="number" step="0.00001" data-type="candidates" data-id="${row.id}" data-field="lat" value="${toInputNumber(row.lat, 5)}" aria-label="Latitude"></td>
      <td><input class="cell-input number" type="number" step="0.00001" data-type="candidates" data-id="${row.id}" data-field="lon" value="${toInputNumber(row.lon, 5)}" aria-label="Longitude"></td>
      <td><button class="small-action" type="button" data-action="delete" data-type="candidates" data-id="${row.id}" title="Supprimer" aria-label="Supprimer">x</button></td>
    `;
    tableBody.appendChild(tr);
  });
}

function renderMap(results) {
  layers.points.clearLayers();
  layers.candidates.clearLayers();
  layers.geoOptimum.clearLayers();
  layers.roadOptimum.clearLayers();

  results.points.forEach((point) => {
    const color = point.type === "client" ? COLORS.blue : COLORS.red;
    L.circleMarker([point.lat, point.lon], {
      pane: "pointPane",
      radius: pointRadius(point.volume),
      color: "#FFFFFF",
      weight: 3,
      fillColor: color,
      fillOpacity: 0.95,
    })
      .bindPopup(popupContent(point))
      .addTo(layers.points);
  });

  const winningCode = results.road ? results.road.candidateCode : null;

  state.candidates.forEach((candidate) => {
    const isWinner = candidate.code === winningCode;
    L.circleMarker([candidate.lat, candidate.lon], {
      pane: "candidatePane",
      radius: isWinner ? 14 : 10,
      color: "#FFFFFF",
      weight: isWinner ? 4 : 2,
      fillColor: isWinner ? COLORS.green : COLORS.grey,
      fillOpacity: isWinner ? 1 : 0.65,
    })
      .bindPopup(`
        <div class="popup-title">${escapeHtml(candidate.name)}</div>
        <div class="popup-meta">${escapeHtml(candidate.code)}</div>
        <div class="popup-meta">${isWinner ? "Candidat routier retenu" : "Candidat entrepot"}</div>
      `)
      .addTo(layers.candidates);
  });

  if (results.geo) {
    L.circleMarker([results.geo.lat, results.geo.lon], {
      pane: "warehousePane",
      radius: 14,
      color: "#FFFFFF",
      weight: 4,
      fillColor: COLORS.orange,
      fillOpacity: 1,
    })
      .bindPopup(`
        <div class="popup-title">Barycentre geographique</div>
        <div class="popup-meta">${formatPoint(results.geo)}</div>
        <div class="popup-meta">${formatKmVolume(results.geo.scoreKmVol)}</div>
      `)
      .addTo(layers.geoOptimum);
  }

  if (results.road) {
    L.circleMarker([results.road.lat, results.road.lon], {
      pane: "roadPane",
      radius: 14,
      color: "#FFFFFF",
      weight: 4,
      fillColor: COLORS.green,
      fillOpacity: 1,
    })
      .bindPopup(`
        <div class="popup-title">Candidat routier retenu</div>
        <div class="popup-meta">${escapeHtml(results.road.candidateName)} (${escapeHtml(results.road.candidateCode)})</div>
        <div class="popup-meta">${formatKmVolume(results.road.scoreKmVol)}</div>
        <div class="popup-meta">${formatCurrency(results.road.totalCost)}</div>
      `)
      .addTo(layers.roadOptimum);
  }

  const boundsItems = results.points.map((point) => [point.lat, point.lon]);
  state.candidates.forEach((candidate) => boundsItems.push([candidate.lat, candidate.lon]));

  if (results.geo) {
    boundsItems.push([results.geo.lat, results.geo.lon]);
  }

  latestMapBoundsItems = boundsItems;
  scheduleMapRefresh();
}

function refreshMapLayout() {
  map.invalidateSize({ pan: false });
  map.fitBounds(FRANCE_BOUNDS, { padding: [18, 18], maxZoom: 6, animate: false });
  map.panInsideBounds(FRANCE_BOUNDS, { animate: false });
}

function scheduleMapRefresh() {
  if (mapRefreshHandle) {
    clearTimeout(mapRefreshHandle);
  }

  requestAnimationFrame(refreshMapLayout);
  mapRefreshHandle = setTimeout(refreshMapLayout, 120);
}

function pointRadius(volume) {
  return Math.max(8, Math.min(17, 7 + Math.sqrt(volume) / 3));
}

function popupContent(point) {
  const typeLabel = point.type === "client" ? "Client" : "Site de prod";
  return `
    <div class="popup-title">${escapeHtml(point.name)}</div>
    <div class="popup-meta">${escapeHtml(point.code)} - ${typeLabel}</div>
    <div class="popup-meta">Volume ${formatNumber(point.volume)}</div>
    <div class="popup-meta">${formatNumber(point.lat, 5)}, ${formatNumber(point.lon, 5)}</div>
  `;
}

function toInputNumber(value, digits) {
  return Number(value).toFixed(digits);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.round(randomBetween(min, max));
}

function randomFrancePoint() {
  const seed = FRANCE_SEEDS[randomInt(0, FRANCE_SEEDS.length - 1)];
  const lat = clamp(seed.lat + randomBetween(-0.32, 0.32), 41.4, 51.1);
  const lon = clamp(seed.lon + randomBetween(-0.42, 0.42), -4.8, 8.2);

  return {
    city: seed.city,
    lat: Number(lat.toFixed(5)),
    lon: Number(lon.toFixed(5)),
  };
}

function makeUniqueCode(prefix, existingCodes) {
  let index = existingCodes.length + 1;
  let code = `${prefix}-${index}`;

  while (existingCodes.includes(code)) {
    index += 1;
    code = `${prefix}-${index}`;
  }

  return code;
}

function candidateCodeFromCity(city) {
  return `CAND-${city.toUpperCase()}`;
}

function addRandomPoint(type) {
  const point = randomFrancePoint();
  const label = type === "clients" ? "Client" : "Production";
  const prefix = type === "clients" ? "CLI" : "PROD";
  const index = state[type].length + 1;
  const existingCodes = state[type].map((row) => row.code);

  state[type].push({
    id: createId(),
    code: makeUniqueCode(prefix, existingCodes),
    name: `${label} ${index} - ${point.city}`,
    lat: point.lat,
    lon: point.lon,
    volume: randomInt(80, 620),
  });

  render();
}

function addRandomCandidate() {
  const existingCodes = new Set(state.candidates.map((row) => row.code));
  const availableCandidates = CANDIDATE_SEEDS.filter((candidate) => !existingCodes.has(candidateCodeFromCity(candidate.city)));

  if (!availableCandidates.length) {
    return;
  }

  const point = availableCandidates[randomInt(0, availableCandidates.length - 1)];

  state.candidates.push({
    id: createId(),
    code: candidateCodeFromCity(point.city),
    name: `Entrepot ${point.city}`,
    lat: Number(point.lat.toFixed(5)),
    lon: Number(point.lon.toFixed(5)),
  });

  render();
}

function setAllVolumesAndTransportCostsTo100() {
  state.clients.forEach((point) => {
    point.volume = 100;
  });

  state.production.forEach((point) => {
    point.volume = 100;
  });

  syncRoadCosts();
  state.roadCosts.forEach((link) => {
    link.transportCost = 100;
  });

  render();
}

function randomizeVolumesAndTransportCosts() {
  state.clients.forEach((point) => {
    point.volume = randomInt(80, 620);
  });

  state.production.forEach((point) => {
    point.volume = randomInt(80, 620);
  });

  syncRoadCosts({ regenerateCosts: true });
  render();
}

function resetDataset(type) {
  if (type === "candidates") {
    state.candidates = withIds(DEMO_CANDIDATES);
  } else {
    state[type] = withIds(type === "clients" ? DEMO_CLIENTS : DEMO_PRODUCTION);
  }

  render();
}

function updatePointFromInput(input) {
  const { type, id, field } = input.dataset;
  const row = state[type].find((item) => item.id === id);

  if (!row) {
    return;
  }

  if (field === "code") {
    row.code = input.value.trim().toUpperCase() || row.code;
    render();
    return;
  }

  if (field === "name") {
    row.name = input.value.trim() || row.name;
    render();
    return;
  }

  const value = Number(input.value);

  if (!Number.isFinite(value)) {
    render();
    return;
  }

  if (field === "lat") {
    row.lat = clamp(value, -90, 90);
  }

  if (field === "lon") {
    row.lon = clamp(value, -180, 180);
  }

  if (field === "volume") {
    row.volume = Math.max(0, Math.round(value));
  }

  render();
}

function deletePoint(type, id) {
  state[type] = state[type].filter((row) => row.id !== id);
  render();
}

function exportCsv(type) {
  let headers;
  let rows;

  if (type === "candidates") {
    headers = ["code", "nom", "latitude", "longitude"];
    rows = state.candidates.map((row) => [row.code, row.name, row.lat, row.lon]);
  } else {
    headers = ["code", "nom", "latitude", "longitude", "volume"];
    rows = state[type].map((row) => [row.code, row.name, row.lat, row.lon, row.volume]);
  }

  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = `baryentrepot-${type}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportRoadCostsCsv() {
  const csv = [
    ["candidate_code", "point_code", "point_type", "km_routier", "cout_transport_eur", "source", "api_status", "duration_min", "api_error"],
    ...state.roadCosts.map((row) => [
      row.candidateCode,
      row.pointCode,
      row.pointType,
      row.roadKm,
      row.transportCost,
      row.source || "fallback",
      row.apiStatus || "Fallback",
      Number.isFinite(row.durationMin) ? row.durationMin : "",
      row.apiError || "",
    ]),
  ]
    .map((row) => row.map(csvCell).join(";"))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "baryentrepot-couts-routiers.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportDetailedMatrixCsv() {
  const results = calculateResults();
  const rows = [];

  results.scenarios.forEach((scenario) => {
    scenario.linkDetails.forEach((link) => {
      rows.push([
        scenario.rank || "",
        scenario.candidate.code,
        scenario.candidate.name,
        link.point.code,
        link.point.name,
        link.point.type,
        link.point.volume,
        link.haversineKm.toFixed(1),
        link.roadKm.toFixed(1),
        link.transportCost,
        link.totalCost,
        scenario.geoGapKm.toFixed(1),
      ]);
    });
  });

  const csv = [
    [
      "rang",
      "candidate_code",
      "candidate_name",
      "point_code",
      "point_name",
      "point_type",
      "volume",
      "haversine_km",
      "routier_km",
      "cout_liaison_eur",
      "cout_total_eur",
      "distance_barycentre_geo_km",
    ],
    ...rows,
  ]
    .map((row) => row.map(csvCell).join(";"))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "baryentrepot-matrice-scenarios.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

async function testFirstApiRoute() {
  const routes = buildApiRoutes(calculateResults());
  const route = routes[0];

  if (!route) {
    state.apiLastStatus = "Aucune liaison";
    state.apiLastResponse = "Aucune liaison disponible.";
    render();
    return;
  }

  state.apiLastStatus = "Appel en cours";
  render();

  try {
    const { payload, parsed } = await requestRoadApiDistance(route);
    writeRoadCostApiResult(route, parsed);
    state.apiLastStatus = "API OK";
    state.apiLastResponse = JSON.stringify(payload, null, 2).slice(0, 3500);
  } catch (error) {
    writeRoadCostFallback(route, error.message);
    state.apiLastStatus = "Fallback";
    state.apiLastResponse = `${route.url}\n\n${error.message}\n\nFallback Haversine conserve : ${formatNumber(route.fallbackRoadKm, 1)} km`;
  }

  render();
}

async function calculateAllApiDistances() {
  const routes = buildApiRoutes(calculateResults());
  const initialSummary = getApiStatusSummary(routes);
  const pendingRoutes = routes.filter((route) => route.status !== "API OK");

  if (!routes.length) {
    state.apiLastStatus = "Aucune liaison";
    state.apiLastResponse = "Aucune liaison disponible.";
    render();
    return;
  }

  if (!pendingRoutes.length) {
    state.apiLastStatus = `Deja complet : API OK ${initialSummary.ok}/${initialSummary.total}`;
    state.apiLastResponse = "Toutes les distances API sont deja disponibles. Aucun appel OSRM relance.";
    render();
    showApiSuccessDialog("Toutes les distances API sont deja disponibles. Aucun appel OSRM n'a ete relance.");
    return;
  }

  let apiOkCount = initialSummary.ok;
  let fallbackCount = 0;

  for (let index = 0; index < pendingRoutes.length; index += 1) {
    const route = pendingRoutes[index];
    state.apiLastStatus = `${index + 1}/${pendingRoutes.length} manquantes`;

    try {
      const { payload, parsed } = await requestRoadApiDistance(route);
      writeRoadCostApiResult(route, parsed);
      apiOkCount += 1;
      state.apiLastResponse = JSON.stringify(
        {
          route: route.key,
          status: "API OK",
          distance_km: Number(parsed.roadKm.toFixed(3)),
          duration_min: Number.isFinite(parsed.durationMin) ? Number(parsed.durationMin.toFixed(1)) : null,
          raw: payload,
        },
        null,
        2
      ).slice(0, 3500);
    } catch (error) {
      writeRoadCostFallback(route, error.message);
      fallbackCount += 1;
      state.apiLastResponse = `${route.key}\n${route.url}\n\n${error.message}\n\nFallback Haversine : ${formatNumber(route.fallbackRoadKm, 1)} km`;
    }

    state.apiLastStatus = `${index + 1}/${pendingRoutes.length} manquantes - API OK ${apiOkCount}/${routes.length} / Fallback ${fallbackCount}`;
    render();

    await wait(80);
  }

  const finalSummary = getApiStatusSummary(buildApiRoutes(calculateResults()));
  state.apiLastStatus = `Termine : API OK ${finalSummary.ok}/${finalSummary.total} / Fallback ${fallbackCount}`;
  render();

  if (finalSummary.complete) {
    showApiSuccessDialog();
  }
}

function showApiSuccessDialog(message = "Les distances sont bien recuperees par l'API OSRM et prises en compte dans le calcul routier.") {
  if (globalThis.window && typeof window.alert === "function") {
    window.alert(message);
  }
}

function exportApiRoutesJson() {
  const routes = buildApiRoutes(calculateResults());
  downloadText(
    "baryentrepot-api-routiere.json",
    JSON.stringify(
      {
        provider: "osrm-demo",
        fallback: "haversine_direct",
        endpoint_template: elements.apiEndpointTemplate.value.trim() || OSRM_ENDPOINT_TEMPLATE,
        routes,
      },
      null,
      2
    ),
    "application/json;charset=utf-8"
  );
}

function exportApiRoutesCsv() {
  const routes = buildApiRoutes(calculateResults());
  const csv = [
    ["candidate_code", "candidate_name", "point_code", "point_name", "point_type", "from_lat", "from_lon", "to_lat", "to_lon", "haversine_km", "fallback_km", "road_km", "status", "duration_min", "url"],
    ...routes.map((route) => [
      route.candidateCode,
      route.candidateName,
      route.pointCode,
      route.pointName,
      route.pointType,
      route.fromLat,
      route.fromLon,
      route.toLat,
      route.toLon,
      route.haversineKm.toFixed(3),
      route.fallbackRoadKm.toFixed(3),
      route.roadKm.toFixed(3),
      route.status,
      Number.isFinite(route.durationMin) ? route.durationMin.toFixed(1) : "",
      route.url,
    ]),
  ]
    .map((row) => row.map(csvCell).join(";"))
    .join("\n");

  downloadText("baryentrepot-api-routiere.csv", csv, "text/csv;charset=utf-8");
}

function downloadText(filename, contents, type) {
  const blob = new Blob([contents], { type });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function importCsv(file, type) {
  const reader = new FileReader();

  reader.onload = () => {
    const rows = parseEntityCsv(String(reader.result || ""), type === "candidates" ? "candidate" : "volume");
    state[type] = rows.map((row) => ({
      id: createId(),
      ...row,
    }));
    render();
  };

  reader.readAsText(file);
}

function importRoadCosts(file) {
  const reader = new FileReader();

  reader.onload = () => {
    state.roadCosts = parseRoadCostsCsv(String(reader.result || ""));
    render();
  };

  reader.readAsText(file);
}

function parseCsv(text) {
  const clean = text.trim();

  if (!clean) {
    return { delimiter: ",", lines: [] };
  }

  const delimiter = detectDelimiter(clean);
  const lines = clean.split(/\r?\n/).filter(Boolean);

  return { delimiter, lines };
}

function parseEntityCsv(text, entityType) {
  const { delimiter, lines } = parseCsv(text);

  if (!lines.length) {
    return [];
  }

  const header = splitCsvLine(lines[0], delimiter).map(normalizeHeader);
  const hasHeader = header.some((cell) =>
    ["code", "nom", "name", "latitude", "lat", "longitude", "lon", "lng", "volume", "vol"].includes(cell)
  );
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line) => splitCsvLine(line, delimiter))
    .map((cells) => entityRowFromCells(cells, hasHeader ? header : null, entityType))
    .filter(Boolean);
}

function parseRoadCostsCsv(text) {
  const { delimiter, lines } = parseCsv(text);

  if (!lines.length) {
    return [];
  }

  const header = splitCsvLine(lines[0], delimiter).map(normalizeHeader);
  const hasHeader = header.some((cell) =>
    ["candidate_code", "point_code", "point_type", "km_routier", "cout_transport_eur", "source", "api_status"].includes(cell)
  );
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line) => splitCsvLine(line, delimiter))
    .map((cells) => roadCostRowFromCells(cells, hasHeader ? header : null))
    .filter(Boolean);
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/)[0] || "";
  return (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
}

function splitCsvLine(line, delimiter) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function normalizeHeader(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function entityRowFromCells(cells, header, entityType) {
  const get = (keys, fallbackIndex) => {
    if (!header) {
      return cells[fallbackIndex];
    }

    const index = header.findIndex((cell) => keys.includes(cell));
    return index >= 0 ? cells[index] : cells[fallbackIndex];
  };

  const code = String(get(["code"], 0) || "").trim().toUpperCase();
  const name = get(["nom", "name", "site", "client"], 1);
  const lat = parseLocaleNumber(get(["latitude", "lat"], 2));
  const lon = parseLocaleNumber(get(["longitude", "lon", "lng"], 3));
  const volume = parseLocaleNumber(get(["volume", "vol"], 4));

  if (!code || !name || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  if (entityType === "candidate") {
    return { code, name, lat, lon };
  }

  if (!Number.isFinite(volume)) {
    return null;
  }

  return { code, name, lat, lon, volume };
}

function roadCostRowFromCells(cells, header) {
  const get = (keys, fallbackIndex) => {
    if (!header) {
      return cells[fallbackIndex];
    }

    const index = header.findIndex((cell) => keys.includes(cell));
    return index >= 0 ? cells[index] : cells[fallbackIndex];
  };

  const candidateCode = String(get(["candidate_code", "candidat"], 0) || "").trim().toUpperCase();
  const pointCode = String(get(["point_code", "point"], 1) || "").trim().toUpperCase();
  const pointType = String(get(["point_type", "type"], 2) || "").trim().toLowerCase();
  const roadKm = parseLocaleNumber(get(["km_routier", "km", "distance"], 3));
  const transportCost = parseLocaleNumber(get(["cout_transport_eur", "cout_transport", "cout"], 4));
  const source = String(get(["source"], 5) || "api").trim().toLowerCase();
  const apiStatus = String(get(["api_status", "statut", "status"], 6) || (source === "api" ? "API OK" : "Fallback")).trim();
  const durationMin = parseLocaleNumber(get(["duration_min", "duree_min"], 7));
  const apiError = String(get(["api_error", "erreur"], 8) || "").trim();

  if (!candidateCode || !pointCode || !["client", "production"].includes(pointType)) {
    return null;
  }

  if (!Number.isFinite(roadKm) || !Number.isFinite(transportCost)) {
    return null;
  }

  return {
    candidateCode,
    pointCode,
    pointType,
    roadKm,
    transportCost,
    source: source === "fallback" ? "fallback" : "api",
    apiStatus: apiStatus || (source === "fallback" ? "Fallback" : "API OK"),
    durationMin: Number.isFinite(durationMin) ? durationMin : null,
    apiError,
  };
}

function parseLocaleNumber(value) {
  return Number(String(value).replace(",", "."));
}

function handleTableInputChange(event) {
  const input = event.target.closest("input[data-field]");

  if (input) {
    updatePointFromInput(input);
  }
}

function handleTableClick(event) {
  const button = event.target.closest("button[data-action='delete']");

  if (button) {
    deletePoint(button.dataset.type, button.dataset.id);
  }
}

function switchPage(page) {
  state.currentPage = page;
  elements.dashboardPage.hidden = page !== "dashboard";
  elements.detailsPage.hidden = page !== "details";
  elements.apiPage.hidden = page !== "api";
  elements.pageTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.page === page);
  });

  render();

  if (page === "dashboard") {
    setTimeout(refreshMapLayout, 80);
  } else if (page === "details") {
    elements.detailsPage.scrollTop = 0;
  } else if (page === "api") {
    elements.apiPage.scrollTop = 0;
  }
}

elements.pageTabs.forEach((tab) => {
  tab.addEventListener("click", () => switchPage(tab.dataset.page));
});

elements.costRate.addEventListener("input", () => {
  const value = Number(elements.costRate.value);
  state.costRate = Number.isFinite(value) && value >= 0 ? value : 0;
  render();
});

elements.addClient.addEventListener("click", () => addRandomPoint("clients"));
elements.addProduction.addEventListener("click", () => addRandomPoint("production"));
elements.addCandidate.addEventListener("click", addRandomCandidate);
elements.resetClients.addEventListener("click", () => resetDataset("clients"));
elements.resetProduction.addEventListener("click", () => resetDataset("production"));
elements.resetCandidates.addEventListener("click", () => resetDataset("candidates"));
elements.setAllVolumes.addEventListener("click", setAllVolumesAndTransportCostsTo100);
elements.randomizeVolumesCosts.addEventListener("click", randomizeVolumesAndTransportCosts);

elements.importClients.addEventListener("click", () => elements.clientsCsvFile.click());
elements.exportClients.addEventListener("click", () => exportCsv("clients"));
elements.importProduction.addEventListener("click", () => elements.productionCsvFile.click());
elements.exportProduction.addEventListener("click", () => exportCsv("production"));
elements.importCandidates.addEventListener("click", () => elements.candidatesCsvFile.click());
elements.exportCandidates.addEventListener("click", () => exportCsv("candidates"));
elements.regenerateRoadCosts.addEventListener("click", regenerateRoadCosts);
elements.exportRoadCosts.addEventListener("click", exportRoadCostsCsv);
elements.exportDetailedMatrix.addEventListener("click", exportDetailedMatrixCsv);
elements.apiTestRoute.addEventListener("click", testFirstApiRoute);
elements.apiCalculateAll.addEventListener("click", calculateAllApiDistances);
elements.dashboardApiCalculateAll.addEventListener("click", calculateAllApiDistances);
elements.apiExportJson.addEventListener("click", exportApiRoutesJson);
elements.apiExportCsv.addEventListener("click", exportApiRoutesCsv);

elements.apiEndpointTemplate.addEventListener("input", () => {
  state.apiLastStatus = "Pret";

  if (state.currentPage === "api") {
    render();
  }
});

elements.clientsCsvFile.addEventListener("change", () => {
  const [file] = elements.clientsCsvFile.files;

  if (file) {
    importCsv(file, "clients");
  }

  elements.clientsCsvFile.value = "";
});

elements.productionCsvFile.addEventListener("change", () => {
  const [file] = elements.productionCsvFile.files;

  if (file) {
    importCsv(file, "production");
  }

  elements.productionCsvFile.value = "";
});

elements.candidatesCsvFile.addEventListener("change", () => {
  const [file] = elements.candidatesCsvFile.files;

  if (file) {
    importCsv(file, "candidates");
  }

  elements.candidatesCsvFile.value = "";
});

elements.clientsTable.addEventListener("change", handleTableInputChange);
elements.productionTable.addEventListener("change", handleTableInputChange);
elements.candidatesTable.addEventListener("change", handleTableInputChange);
elements.clientsTable.addEventListener("click", handleTableClick);
elements.productionTable.addEventListener("click", handleTableClick);
elements.candidatesTable.addEventListener("click", handleTableClick);

window.addEventListener("load", () => {
  setTimeout(refreshMapLayout, 50);
  setTimeout(refreshMapLayout, 300);
});

window.addEventListener("resize", scheduleMapRefresh);

if ("ResizeObserver" in window) {
  new ResizeObserver(scheduleMapRefresh).observe(elements.map);
}

render();
