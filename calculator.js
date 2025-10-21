  const INPUT_IDS = {
    billInput: 'billInput',
    currentDemand: 'currentDemand',
    energyActivePrice: 'energyActivePrice',
    distributionPrice: 'distributionPrice',
    resalePrice: 'resalePrice',
    fixedCharges: 'fixedCharges',
    priceGrowth: 'priceGrowth',
  dynamicPrice: 'dynamicPrice'
  };

  const INSTALLATION_TABLE = [
    { pvKw: 2.7, price: 42990, storageKwh: 5.8 },
    { pvKw: 3.15, price: 45980, storageKwh: 9.2 },
    { pvKw: 3.6, price: 47980, storageKwh: 9.2 },
    { pvKw: 4.05, price: 49980, storageKwh: 9.2 },
    { pvKw: 4.5, price: 52230, storageKwh: 9.2 },
    { pvKw: 4.95, price: 54480, storageKwh: 9.2 },
    { pvKw: 5.4, price: 56730, storageKwh: 9.2 },
    { pvKw: 5.85, price: 58980, storageKwh: 9.2 },
    { pvKw: 6.3, price: 59980, storageKwh: 9.2 },
    { pvKw: 6.75, price: 60980, storageKwh: 9.2 },
    { pvKw: 7.2, price: 61980, storageKwh: 9.2 },
    { pvKw: 7.65, price: 62980, storageKwh: 9.2 },
    { pvKw: 8.1, price: 63980, storageKwh: 9.2 },
    { pvKw: 8.55, price: 64980, storageKwh: 9.2 },
    { pvKw: 9.0, price: 65980, storageKwh: 9.2 },
    { pvKw: 9.45, price: 66480, storageKwh: 9.2 },
    { pvKw: 9.9, price: 66980, storageKwh: 9.2 }
  ];

  const STORAGE_TABLE = [
    { storageKwh: 6.1, pvMatchKw: 4.066666667 },
    { storageKwh: 9.2, pvMatchKw: 6.133333333 },
    { storageKwh: 12.2, pvMatchKw: 8.133333333 },
    { storageKwh: 18.4, pvMatchKw: 12.26666667 },
    { storageKwh: 24.4, pvMatchKw: 16.26666667 },
    { storageKwh: 11.5, pvMatchKw: 7.666666667 },
    { storageKwh: 17.3, pvMatchKw: 11.53333333 },
    { storageKwh: 23.0, pvMatchKw: 15.33333333 },
    { storageKwh: 34.6, pvMatchKw: 23.06666667 },
    { storageKwh: 46.1, pvMatchKw: 30.73333333 }
  ];

  const CONSTANTS = {
    minPvKw: 2.7,
    pvStep: 0.45,
    pvLossFactor: 0.99,
    years: 25,
    grantAmount: 23000,
    productionFactor: 1.02,
    autoconsumptionRate: 0.7,
    moduleDegradation: 0.004,
    selectionFactor: 0.9,
    taxReliefRate: 0.32,
    dynamicPriceRate: 0.24
  };

  const formatCurrency = (value) =>
    typeof value === 'number'
      ? value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '';

  const formatNumber = (value, fractionDigits = 2) =>
    typeof value === 'number'
      ? value.toLocaleString('pl-PL', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })
      : '';

  function readNumber(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const value = el.value ?? el.textContent;
    const parsed = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function readBoolean(id) {
    const el = document.getElementById(id);
    if (!el) return false;
    if ('checked' in el) return Boolean(el.checked);
    const value = el.value ?? el.textContent;
    if (typeof value === 'string') {
      const lowered = value.trim().toLowerCase();
      return lowered === 'true' || lowered === '1' || lowered === 'yes';
    }
    return Boolean(value);
  }

  function readInputs() {
    return {
      billInput: readNumber(INPUT_IDS.billInput),
      currentDemand: readNumber(INPUT_IDS.currentDemand),
      energyActivePrice: readNumber(INPUT_IDS.energyActivePrice),
      distributionPrice: readNumber(INPUT_IDS.distributionPrice),
      resalePrice: readNumber(INPUT_IDS.resalePrice),
      fixedCharges: readNumber(INPUT_IDS.fixedCharges),
      priceGrowth: readNumber(INPUT_IDS.priceGrowth),
      dynamicPrice: readBoolean(INPUT_IDS.dynamicPrice)
    };
  }

  const mround = (value, multiple) => {
    if (!multiple) return value;
    return Math.round(value / multiple) * multiple;
  };

  function pickInstallation(pvKw) {
    if (!INSTALLATION_TABLE.length) {
      return { pvKw: CONSTANTS.minPvKw, price: 0, storageKwh: null };
    }
    const entry = INSTALLATION_TABLE.find((row) => pvKw <= row.pvKw) || INSTALLATION_TABLE[INSTALLATION_TABLE.length - 1];
    return entry;
  }

  function pickStorage(pvKw) {
    if (!STORAGE_TABLE.length) return null;
    let best = STORAGE_TABLE[0];
    let bestDistance = Math.abs(best.pvMatchKw - pvKw);
    for (let i = 1; i < STORAGE_TABLE.length; i += 1) {
      const candidate = STORAGE_TABLE[i];
      const distance = Math.abs(candidate.pvMatchKw - pvKw);
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    }
    return best;
  }

  function buildProfitabilityTable(inputs, derived) {
    const rows = [];
    const {
      billInput,
      currentDemand,
      energyActivePrice,
      distributionPrice,
      resalePrice,
      priceGrowth
    } = inputs;

    const {
      baseProduction,
      netInstallationCost
    } = derived;

    const growth = 1 + priceGrowth;

    let previousExported = 0;
    let previousImported = 0;
    let cumulativeWithout = 0;
    let cumulativeWith = 0;

    for (let yearIndex = 0; yearIndex < CONSTANTS.years; yearIndex += 1) {
      const yearNumber = yearIndex + 1;
      const growthFactor = Math.pow(growth, yearIndex);

      const monthlyBill = billInput * growthFactor;
      const yearlyBill = monthlyBill * 12;

      const activePrice = energyActivePrice * growthFactor;
      const currentDistributionPrice = distributionPrice * growthFactor;
      const currentResalePrice = resalePrice * growthFactor;
      const dynamicPricePerKwh = activePrice * CONSTANTS.dynamicPriceRate;

    const degradationFactor = yearIndex === 0 ? 1 : Math.max(1 - CONSTANTS.moduleDegradation * yearNumber, 0);
    const production = baseProduction * degradationFactor;
      const autoconsumption = production * CONSTANTS.autoconsumptionRate;
      const exported = production - autoconsumption;

      const imported = yearIndex === 0
        ? currentDemand - autoconsumption
        : previousImported + (previousExported - exported);

      const savingsWithout = autoconsumption * (activePrice + currentDistributionPrice) + exported * currentResalePrice;
      const savingsWith = savingsWithout + imported * dynamicPricePerKwh;

      cumulativeWithout = yearIndex === 0
        ? -netInstallationCost + savingsWithout
        : cumulativeWithout + savingsWithout;

      cumulativeWith = yearIndex === 0
        ? -netInstallationCost + savingsWith
        : cumulativeWith + savingsWith;

      const pvBillWithout = yearlyBill - savingsWithout;
      const pvBillWith = yearlyBill - savingsWith;

      rows.push({
        year: yearNumber,
        monthlyBill,
        yearlyBill,
        production,
        autoconsumption,
        exported,
        imported,
        activePrice,
        distributionPrice: currentDistributionPrice,
        resalePrice: currentResalePrice,
        dynamicPricePerKwh,
        savingsWithout,
        savingsWith,
        cumulativeWithout,
        cumulativeWith,
        pvBillWithout,
        pvBillWith
      });

      previousExported = exported;
      previousImported = imported;
    }

    return rows;
  }

  function computeResults(inputs) {
    const baselineYearlyBill = inputs.billInput * 12;
    const recommendedPv = Math.max(
      CONSTANTS.minPvKw,
      mround((inputs.currentDemand * CONSTANTS.selectionFactor) / 1000, CONSTANTS.pvStep)
    );

    const baseProduction = recommendedPv * 1000 * CONSTANTS.pvLossFactor * CONSTANTS.productionFactor;

    const installation = pickInstallation(recommendedPv);
    const installationCost = installation.price || 0;
    const installationCostWithGrant = Math.max(installationCost - CONSTANTS.grantAmount, 0);
    const netInstallationCost = installationCostWithGrant * (1 - CONSTANTS.taxReliefRate);

    const storage = pickStorage(recommendedPv);

    const table = buildProfitabilityTable(inputs, { baseProduction, netInstallationCost });
    const firstYear = table[0] || null;

    const yearlyBill = firstYear
      ? (inputs.dynamicPrice ? firstYear.pvBillWith : firstYear.pvBillWithout)
      : baselineYearlyBill;

    const savings = baselineYearlyBill - yearlyBill;

    let paybackYear = null;
    for (let i = 0; i < table.length; i += 1) {
      if (table[i].cumulativeWith >= 0) {
        paybackYear = table[i].year;
        break;
      }
    }

    return {
      baselineYearlyBill,
      yearlyBill,
      savings,
      recommendedPv,
      recommendedStorage: storage ? storage.storageKwh : null,
      installationCost,
      installationCostWithGrant,
      netInstallationCost,
      baseProduction,
      table,
      firstYear,
      paybackYear
    };
  }

  function setOutput(id, value, formatter = null) {
    const el = document.getElementById(id);
    if (!el) return;
    const formatted = formatter ? formatter(value) : value;
    if ('value' in el) {
      el.value = formatted;
    } else {
      el.textContent = formatted;
    }
  }

  function updateOutputs(results) {
    setOutput('yearlyBill', results.yearlyBill, formatCurrency);
    setOutput('resultBill', results.yearlyBill / 12, formatCurrency);
    setOutput('savings', results.savings, formatCurrency);
    setOutput('recommendation-photovoltaics', results.recommendedPv, (value) => formatNumber(value, 2));
    if (results.recommendedStorage !== null) {
      setOutput('recommendation-storage', results.recommendedStorage, (value) => formatNumber(value, 1));
    }
    if (results.paybackYear !== null) {
      setOutput('investment-return', results.paybackYear, (value) => formatNumber(value, 0));
    }
  }

  function dispatchResults(inputs, results) {
    const detail = {
      inputs,
      results: {
        yearlyBill: results.yearlyBill,
        savings: results.savings,
        recommendedPv: results.recommendedPv,
        recommendedStorage: results.recommendedStorage,
        baseProduction: results.baseProduction,
        installationCost: results.installationCost,
        installationCostWithGrant: results.installationCostWithGrant,
        netInstallationCost: results.netInstallationCost,
        paybackYear: results.paybackYear,
        firstYear: results.firstYear,
        table: results.table
      }
    };

    window.polenergiaCalculator = detail;
    document.dispatchEvent(new CustomEvent('polenergia:calculator:update', { detail }));
  }

  function recalculate() {
    const inputs = readInputs();
    const results = computeResults(inputs);
    updateOutputs(results);
    dispatchResults(inputs, results);
  }

  function attachListeners() {
    Object.values(INPUT_IDS).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = () => recalculate();
      el.addEventListener('change', handler);
      el.addEventListener('input', handler);
    });
  }

  attachListeners();
  recalculate();

  window.polenergiaRecalculate = recalculate;

