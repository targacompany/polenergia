(function () {
  'use strict';

  const DEFAULTS = {
    monthlyBill: 321.13,
    energyActivePrice: 0.62,
    distributionPrice: 0.48,
    resalePrice: 0.2,
    fixedCharges: 20,
    priceGrowth: 0.05,
    powerSelectionCoefficient: 0.9,
    productionCoefficient: 1.02,
    systemLossFactor: 0.99,
    selfConsumptionLevel: 0.7,
    pstrykRate: 0.24,
    minPvPower: 2.7,
    powerStep: 0.45
  };

  const POWER_COST_TABLE = [
    { power: 2.7, cost: 42990, battery: 5.8 },
    { power: 3.15, cost: 45980, battery: 6.1 },
    { power: 3.6, cost: 47980, battery: 6.1 },
    { power: 4.05, cost: 49980, battery: 6.1 },
    { power: 4.5, cost: 52230, battery: 6.1 },
    { power: 4.95, cost: 54480, battery: 6.1 },
    { power: 5.4, cost: 56730, battery: 6.1 },
    { power: 5.85, cost: 58980, battery: 6.1 },
    { power: 6.3, cost: 59980, battery: 6.1 },
    { power: 6.75, cost: 60980, battery: 6.1 },
    { power: 7.2, cost: 61980, battery: 6.1 },
    { power: 7.65, cost: 62980, battery: 6.1 },
    { power: 8.1, cost: 63980, battery: 6.1 },
    { power: 8.55, cost: 64980, battery: 6.1 },
    { power: 9, cost: 65980, battery: 6.1 },
    { power: 9.45, cost: 66480, battery: 6.1 },
    { power: 9.9, cost: 66980, battery: 6.1 }
  ];

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const billInput = document.getElementById('billInput');
    const resultBillInput = document.getElementById('resultBill');
    const energyActivePriceInput = document.getElementById('energyActivePrice');
    const distributionPriceInput = document.getElementById('distributionPrice');
    const resalePriceInput = document.getElementById('resalePrice');
    const fixedChargesInput = document.getElementById('fixedCharges');
    const priceGrowthInput = document.getElementById('priceGrowth');
    const pstrykToggle = document.querySelector('[data-calc="pstryk"]');

    const yearlyBillElement = document.getElementById('yearly-bill');
    const savingsElement = document.getElementById('savings');
    const pvElement = document.getElementById('recommendation-photovoltaics');
    const batteryElement = document.getElementById('recommendation-storage');
    const currentDemandElement = document.getElementById('currentDemand');

    if (!billInput || !resultBillInput) {
      console.warn('Solar calculator: required elements not found');
      return;
    }

    const fieldsWithDefaults = [
      { element: billInput, value: DEFAULTS.monthlyBill, digits: 2 },
      { element: energyActivePriceInput, value: DEFAULTS.energyActivePrice, digits: 3 },
      { element: distributionPriceInput, value: DEFAULTS.distributionPrice, digits: 3 },
      { element: resalePriceInput, value: DEFAULTS.resalePrice, digits: 3 },
      { element: fixedChargesInput, value: DEFAULTS.fixedCharges, digits: 2 },
      { element: priceGrowthInput, value: DEFAULTS.priceGrowth * 100, digits: 2 }
    ];

    fieldsWithDefaults.forEach(setDefaultValue);

    const inputs = [
      billInput,
      energyActivePriceInput,
      distributionPriceInput,
      resalePriceInput,
      fixedChargesInput,
      priceGrowthInput
    ].filter(Boolean);

    inputs.forEach((input) => input.addEventListener('input', update));

    if (pstrykToggle) {
      pstrykToggle.addEventListener('change', update);
      pstrykToggle.addEventListener('input', update);
    }

    update();

    function update() {
      const monthlyBill = parseInput(billInput.value);
      const pstrykEnabled = isPstrykEnabled(pstrykToggle);

      if (!Number.isFinite(monthlyBill) || monthlyBill <= 0) {
        clearOutputs();
        shareResults({ results: null, meta: { pstrykEnabled } });
        return;
      }

      const config = {
        energyActivePrice: readNumber(energyActivePriceInput, DEFAULTS.energyActivePrice),
        distributionPrice: readNumber(distributionPriceInput, DEFAULTS.distributionPrice),
        resalePrice: readNumber(resalePriceInput, DEFAULTS.resalePrice),
        fixedCharges: readNumber(fixedChargesInput, DEFAULTS.fixedCharges),
        priceGrowth: readPercent(priceGrowthInput, DEFAULTS.priceGrowth)
      };

      const totalEnergyRate = config.energyActivePrice + config.distributionPrice;
      if (!Number.isFinite(totalEnergyRate) || totalEnergyRate <= 0) {
        clearOutputs();
        shareResults({ results: null, meta: { pstrykEnabled } });
        return;
      }

      const billExFixed = Math.max(monthlyBill - config.fixedCharges, 0);
      const yearlyDemand = Math.max((billExFixed / totalEnergyRate) * 12, 0);

      const basePowerKw = (yearlyDemand * DEFAULTS.powerSelectionCoefficient) / 1000;
      const pvPower = Math.max(roundToStep(basePowerKw, DEFAULTS.powerStep), DEFAULTS.minPvPower);

      const costEntry = findCostEntry(pvPower);
      const installationCost = costEntry ? costEntry.cost : null;
      const batteryCapacity = costEntry ? costEntry.battery : null;

      const yearlyBillBefore = monthlyBill * 12;
      const productionBase = pvPower * 1000 * DEFAULTS.systemLossFactor * DEFAULTS.productionCoefficient;
      const selfConsumed = productionBase * DEFAULTS.selfConsumptionLevel;
      const exported = Math.max(productionBase - selfConsumed, 0);
      const gridEnergy = Math.max(yearlyDemand - selfConsumed, 0);

      const savingsWithout = selfConsumed * totalEnergyRate + exported * config.resalePrice;
      const extraPstryk = gridEnergy * DEFAULTS.pstrykRate * config.energyActivePrice;
      const savingsWith = savingsWithout + extraPstryk;

      const yearlyBillWithout = Math.max(yearlyBillBefore - savingsWithout, 0);
      const yearlyBillWith = Math.max(yearlyBillBefore - savingsWith, 0);

      const monthlyAfterWithout = yearlyBillWithout / 12;
      const monthlyAfterWith = yearlyBillWith / 12;
      const selectedMonthly = pstrykEnabled ? monthlyAfterWith : monthlyAfterWithout;
      const selectedYearly = pstrykEnabled ? yearlyBillWith : yearlyBillWithout;
      const selectedSavings = pstrykEnabled ? savingsWith : savingsWithout;

      setResultValue(resultBillInput, selectedMonthly);
      setTextValue(yearlyBillElement, selectedYearly);
      setTextValue(savingsElement, selectedSavings);
      setTextValue(pvElement, pvPower, 2);
      setTextValue(batteryElement, batteryCapacity, 1);
      setTextValue(currentDemandElement, yearlyDemand, 0);

      const detail = {
        results: {
          monthlyBill,
          yearlyDemand,
          pvPower,
          installationCost,
          batteryCapacity,
          firstYear: {
            pvBillWithout: yearlyBillWithout,
            pvBillWith: yearlyBillWith,
            savingsWithoutPstryk: savingsWithout,
            savingsWithPstryk: savingsWith
          }
        },
        meta: {
          pstrykEnabled
        }
      };

      shareResults(detail);
    }

    function clearOutputs() {
      setResultValue(resultBillInput, null);
      setTextValue(yearlyBillElement, null);
      setTextValue(savingsElement, null);
      setTextValue(pvElement, null);
      setTextValue(batteryElement, null);
      setTextValue(currentDemandElement, null);
    }
  }

  function setDefaultValue(config) {
    const { element, value, digits } = config;
    if (!element || element.value) return;
    if (element.tagName === 'INPUT' && element.type === 'number') {
      if (!Number.isFinite(value)) return;
      const factor = Number.isFinite(digits) ? digits : undefined;
      const numericString = factor !== undefined ? value.toFixed(factor) : String(value);
      element.value = numericString.replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1');
      if (element.dataset) element.dataset.rawValue = String(value);
      return;
    }
    element.value = formatNumber(value, digits);
    if (element.dataset) element.dataset.rawValue = String(value);
  }

  function parseInput(raw) {
    if (typeof raw !== 'string') {
      const numeric = Number(raw);
      return Number.isFinite(numeric) ? numeric : NaN;
    }
    const normalized = raw.replace(/\s+/g, '').replace(',', '.');
    const parsed = parseFloat(normalized);
    return Number.isNaN(parsed) ? NaN : parsed;
  }

  function readNumber(input, fallback) {
    if (!input) return fallback;
    const parsed = parseInput(input.value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function readPercent(input, fallback) {
    const value = readNumber(input, fallback);
    if (!Number.isFinite(value)) return fallback;
    return value > 1 ? value / 100 : value;
  }

  function roundToStep(value, step) {
    if (!Number.isFinite(value) || !step) return value;
    return Math.round(value / step) * step;
  }

  function findCostEntry(power) {
    if (!Number.isFinite(power) || POWER_COST_TABLE.length === 0) {
      return null;
    }

    for (let i = 0; i < POWER_COST_TABLE.length; i += 1) {
      if (power <= POWER_COST_TABLE[i].power + 1e-9) {
        return POWER_COST_TABLE[i];
      }
    }

    return POWER_COST_TABLE[POWER_COST_TABLE.length - 1];
  }

  function setResultValue(input, value) {
    if (!input) return;
    if (!Number.isFinite(value)) {
      input.value = '';
      if (input.dataset) input.dataset.rawValue = '';
      return;
    }
    input.value = formatNumber(value, 2);
    if (input.dataset) input.dataset.rawValue = String(value);
  }

  function setTextValue(element, value, digits = 2) {
    if (!element) return;
    if (!Number.isFinite(value)) {
      if ('value' in element) {
        element.value = '';
      } else {
        element.textContent = '';
      }
      if (element.dataset) element.dataset.rawValue = '';
      return;
    }

    if (element.tagName === 'INPUT' && element.type === 'number') {
      const factor = Number.isFinite(digits) ? digits : undefined;
      const numericString = factor !== undefined ? value.toFixed(factor) : String(value);
      element.value = numericString.replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1');
    } else {
      const formatted = formatNumber(value, digits);
      if ('value' in element) {
        element.value = formatted;
      } else {
        element.textContent = formatted;
      }
    }
    if (element.dataset) element.dataset.rawValue = String(value);
  }

  function formatNumber(value, digits = 2) {
    if (!Number.isFinite(value)) return '';
    return value.toLocaleString('pl-PL', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function isPstrykEnabled(toggle) {
    if (!toggle) return false;
    if (toggle.type === 'checkbox' || toggle.type === 'radio') {
      return Boolean(toggle.checked);
    }
    return Boolean(parseInput(toggle.value));
  }

  function shareResults(detail) {
    try {
      window.polenergiaCalculator = detail;
      document.dispatchEvent(new CustomEvent('polenergia:calculator:update', { detail }));
    } catch (error) {
      console.warn('Solar calculator: unable to share results', error);
    }
  }
})();
