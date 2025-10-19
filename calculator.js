(function() {
    'use strict';
  
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  
    function init() {
      const billInput = document.getElementById("billInput");
      const resultBill = document.getElementById("resultBill");
      const currentDemandInput = document.getElementById("currentDemand");
      const energyActivePriceInput = document.getElementById("energyActivePrice");
      const distributionPriceInput = document.getElementById("distributionPrice");
      const resalePriceInput = document.getElementById("resalePrice");
      const fixedChargesInput = document.getElementById("fixedCharges");
      const priceGrowthInput = document.getElementById("priceGrowth");
      const dynamicPriceInput = document.getElementById("dynamicPrice");
      const recommendedPvElement = document.getElementById("recommendation-photovoltaics");
      const recommendedStorageElement = document.getElementById("recommendation-storage");
      const investmentReturnElement = document.getElementById("investment-return");
      const yearlyBillElement = document.getElementById("yearly-bill");
      const savingsElement = document.getElementById("savings");
  
      // Early return if required elements don't exist
      if (!billInput || !resultBill) {
        console.warn('Energy calculator: required elements not found');
        return;
      }
  
      // Default constants from CSV data
      const DEFAULT_CONFIG = {
        energyActivePrice: 0.615,         // Cena energii czynnej [zł brutto/kWh]
        distributionPrice: 0.48,          // Cena dystrybucji [zł brutto/kWh]
        resalePrice: 0.2007237,           // Cena odsprzedaży [zł brutto/kWh]
        fixedCharges: 20,                 // Opłaty stałe miesięczne [zł]
        powerSelectionCoefficient: 0.90,  // Współczynnik doboru mocy PV
        productionCoefficient: 1.02,      // Współczynnik produkcji energii
        systemLossFactor: 0.99,           // Straty systemowe (99% sprawności)
        selfConsumptionLevel: 0.70,       // Poziom autokonsumpcji (70%)
        moduleDegradationRate: 0.004,     // Degradacja modułów roczna (0.4%)
        grantValue: 23000,                // Dotacja Mój Prąd
        thermoDeductionRate: 0.32,        // Ulga termomodernizacyjna (32%)
        priceGrowth: 0.05,                // Wzrost cen energii (5%)
        pstrykRate: 0.24,                 // Zniżka PSTRYK (24%)
        minPvPower: 2.7,                  // Minimalna moc instalacji [kWp]
        powerRoundingStep: 0.45,          // Skok mocy instalacji [kWp]
        simulationYears: 25               // Liczba lat symulacji
      };

      const POWER_COST_TABLE = [
        { power: 2.70, cost: 42990, battery: 5.8 },
        { power: 3.15, cost: 45980, battery: 9.2 },
        { power: 3.60, cost: 47980, battery: 9.2 },
        { power: 4.05, cost: 49980, battery: 9.2 },
        { power: 4.50, cost: 52230, battery: 9.2 },
        { power: 4.95, cost: 54480, battery: 9.2 },
        { power: 5.40, cost: 56730, battery: 9.2 },
        { power: 5.85, cost: 58980, battery: 9.2 },
        { power: 6.30, cost: 59980, battery: 9.2 },
        { power: 6.75, cost: 60980, battery: 9.2 },
        { power: 7.20, cost: 61980, battery: 9.2 },
        { power: 7.65, cost: 62980, battery: 9.2 },
        { power: 8.10, cost: 63980, battery: 9.2 },
        { power: 8.55, cost: 64980, battery: 9.2 },
        { power: 9.00, cost: 65980, battery: 9.2 },
        { power: 9.45, cost: 66480, battery: 9.2 },
        { power: 9.90, cost: 66980, battery: 9.2 }
      ];
      function formatLocale(value, digits = 2) {
        if (!Number.isFinite(value)) return '';
        return value.toLocaleString('pl-PL', {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits
        });
      }

      function normalizeDecimalValue(raw) {
        if (!raw) return { plain: '', formatted: '', hasDecimal: false };
        let cleaned = raw.replace(/\s+/g, '').replace(',', '.');
        cleaned = cleaned.replace(/[^0-9.]/g, '');
        if (!cleaned) return { plain: '', formatted: '', hasDecimal: false };

        if (cleaned.startsWith('.')) cleaned = `0${cleaned}`;
        const hasTrailingDot = cleaned.endsWith('.') && cleaned.length > 1;
        const pieces = cleaned.split('.');
        const integerPart = pieces.shift() || '0';
        const decimalPart = pieces.join('');
        const hasDecimal = hasTrailingDot || decimalPart.length > 0;
        const plain = hasTrailingDot ? `${integerPart}.` : (decimalPart.length ? `${integerPart}.${decimalPart}` : integerPart);
        let formatted = integerPart;
        if (hasDecimal) {
          formatted += `,${decimalPart}`;
        }
        return { plain, formatted, hasDecimal };
      }

      function enableDecimalInput(element) {
        if (!element || element.readOnly) return;

        if ((element.getAttribute('type') || '').toLowerCase() === 'number') {
          element.setAttribute('type', 'text');
        }
        element.setAttribute('inputmode', 'decimal');
        element.setAttribute('pattern', '[0-9.,]*');
        const initialNormalized = normalizeDecimalValue(element.value);
        element.value = initialNormalized.formatted;
        element.dataset.plainValue = initialNormalized.plain;
        element.addEventListener('input', (event) => {
          const input = event.target;
          const previousValue = input.value;
          const caret = input.selectionStart || 0;
          const { plain, formatted, hasDecimal } = normalizeDecimalValue(previousValue);

          input.value = formatted;

          const diff = previousValue.length - formatted.length;
          let newCaret = Math.max(caret - diff, 0);

          if (formatted === '0') {
            newCaret = formatted.length;
          }

          requestAnimationFrame(() => {
            try {
              const caretPos = hasDecimal && formatted.length > newCaret ? newCaret : Math.min(newCaret, formatted.length);
              input.setSelectionRange(caretPos, caretPos);
            } catch (error) {
              /* ignore */
            }
          });

          input.dataset.plainValue = plain;
        });
      }

      function setElement(element, value, options) {
        if (!element) return;
        const { digits = 2, unit, fallback = '' } = options || {};
        const isInput = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';

        if (!Number.isFinite(value)) {
          if (isInput) {
            element.value = '';
          } else {
            element.textContent = fallback;
          }
          return;
        }

        const numeric = digits != null ? value.toFixed(digits) : String(value);
        const localized = digits != null ? formatLocale(value, digits) : numeric;
        const content = unit ? `${localized}${unit.startsWith(' ') ? unit : ` ${unit}`}` : localized;

        if (isInput) {
          element.value = localized;
          element.dataset.plainValue = numeric;
        } else {
          element.textContent = content;
        }
      }

      function formatNumber(value, digits = 2) {
        return formatLocale(value, digits);
      }

      function isPstrykEnabled() {
        if (!dynamicPriceInput) return false;

        const type = (dynamicPriceInput.getAttribute && dynamicPriceInput.getAttribute('type')) || dynamicPriceInput.type;
        if ((type === 'checkbox' || type === 'radio') && typeof dynamicPriceInput.checked === 'boolean') {
          return dynamicPriceInput.checked;
        }

        const rawValue = typeof dynamicPriceInput.value === 'number' ? dynamicPriceInput.value : dynamicPriceInput.value?.toString();
        if (typeof rawValue !== 'string') {
          return !!rawValue;
        }

        const normalized = rawValue.trim().toLowerCase();
        if (['1', 'true', 'tak', 'yes', 'on'].includes(normalized)) {
          return true;
        }

        const numeric = parseDecimal(rawValue);
        return !isNaN(numeric) && numeric > 0;
      }

      function shareResults(results, meta = {}) {
        const payload = { results, meta };
        try {
          window.polenergiaCalculator = payload;
          document.dispatchEvent(new CustomEvent('polenergia:calculator:update', { detail: payload }));
        } catch (error) {
          console.warn('Energy calculator: unable to share results', error);
        }
      }
  
      /**
       * Parse float with Polish decimal format support (comma as separator)
       * @param {string} value - Number string with comma or dot as decimal separator
       * @returns {number} Parsed float value
       */
      function parseDecimal(value) {
        if (value && typeof value === 'object' && 'plain' in value) {
          return parseFloat(value.plain);
        }
        if (!value) return NaN;
        if (typeof value === 'string') {
          const normalized = normalizeDecimalValue(value);
          return parseFloat(normalized.plain);
        }
        return parseFloat(value);
      }
  
      /**
       * Get current configuration (either default or user-provided)
       */
      function toDecimal(value, fallback, treatPercent = false) {
        const parsed = parseDecimal(value);
        if (isNaN(parsed)) return fallback;
        if (treatPercent && parsed > 1) {
          return parsed / 100;
        }
        return parsed;
      }

      function getConfig() {
        const config = { ...DEFAULT_CONFIG };

        config.energyActivePrice = toDecimal(energyActivePriceInput?.value, config.energyActivePrice);
        config.distributionPrice = toDecimal(distributionPriceInput?.value, config.distributionPrice);
        config.resalePrice = toDecimal(resalePriceInput?.value, config.resalePrice);
        config.fixedCharges = toDecimal(fixedChargesInput?.value, config.fixedCharges);
        config.priceGrowth = toDecimal(priceGrowthInput?.value, config.priceGrowth, true);

        return config;
      }
  
      /**
       * Round value to the nearest multiple of step (Excel MROUND equivalent)
       */
      function roundToStep(value, step, minimum) {
        if (!step || step === 0) return Math.max(value, minimum || 0);
        const rounded = Math.round(value / step) * step;
        const sanitized = Number.isFinite(rounded) ? rounded : value;
        if (typeof minimum === 'number') {
          return Math.max(sanitized, minimum);
        }
        return sanitized;
      }

      function findCostEntry(power) {
        const exact = POWER_COST_TABLE.find(entry => Math.abs(entry.power - power) < 1e-9);
        if (exact) return exact;

        for (let i = 0; i < POWER_COST_TABLE.length; i += 1) {
          const entry = POWER_COST_TABLE[i];
          if (power <= entry.power) {
            return entry;
          }
        }

        return POWER_COST_TABLE[POWER_COST_TABLE.length - 1];
      }

      function calculateSolar(monthlyBill, currentDemand = null) {
        const config = getConfig();

        if (!Number.isFinite(monthlyBill) || monthlyBill <= 0) {
          return null;
        }

        const totalEnergyPrice = config.energyActivePrice + config.distributionPrice;
        if (totalEnergyPrice <= 0) {
          return null;
        }

        const billWithoutFixed = Math.max(monthlyBill - config.fixedCharges, 0);
        const demandFromBill = (billWithoutFixed / totalEnergyPrice) * 12;
        const yearlyDemand = Number.isFinite(currentDemand) && currentDemand > 0 ? currentDemand : Math.max(demandFromBill, 0);

        const basePower = (yearlyDemand * config.powerSelectionCoefficient) / 1000;
        const pvPower = roundToStep(basePower, config.powerRoundingStep, config.minPvPower);
        const costEntry = findCostEntry(pvPower);
        const batteryCapacity = costEntry?.battery ?? null;
        const installationCost = costEntry?.cost ?? 0;
        const costAfterGrant = Math.max(installationCost - config.grantValue, 0);
        const thermoReliefValue = costAfterGrant * config.thermoDeductionRate;
        const costAfterThermo = costAfterGrant - thermoReliefValue;

        const baseProduction = pvPower * 1000 * config.systemLossFactor * config.productionCoefficient;

        const resultsPerYear = [];
        let monthlyBillNoPv = monthlyBill;
        let energyPrice = config.energyActivePrice;
        let distributionPrice = config.distributionPrice;
        let resalePrice = config.resalePrice;

        const baseSelfConsumed = baseProduction * config.selfConsumptionLevel;
        const baseExported = Math.max(baseProduction - baseSelfConsumed, 0);
        let gridEnergyPrev = Math.max(yearlyDemand - baseSelfConsumed, 0);
       let exportedPrev = baseExported;

        let cumulativeWithout = -costAfterThermo;
        let cumulativeWith = -costAfterThermo;

        for (let year = 1; year <= config.simulationYears; year += 1) {
          const production = year === 1 ? baseProduction : baseProduction * Math.max(0, 1 - config.moduleDegradationRate * year);
          const selfConsumed = production * config.selfConsumptionLevel;
          const exported = Math.max(production - selfConsumed, 0);
          const gridEnergy = year === 1
            ? Math.max(yearlyDemand - selfConsumed, 0)
            : Math.max(gridEnergyPrev + (exportedPrev - exported), 0);

          const yearlyBillNoPv = monthlyBillNoPv * 12;
          const savingsWithoutPstryk = (selfConsumed * (energyPrice + distributionPrice)) + (exported * resalePrice);
          const pstrykBenefitPerKwh = energyPrice * config.pstrykRate;
          const savingsWithPstryk = savingsWithoutPstryk + (gridEnergy * pstrykBenefitPerKwh);

          cumulativeWithout += savingsWithoutPstryk;
          cumulativeWith += savingsWithPstryk;

          resultsPerYear.push({
            year,
            monthlyBillNoPv,
            yearlyBillNoPv,
            production,
            selfConsumed,
            exported,
            gridEnergy,
            energyPrice,
            distributionPrice,
            resalePrice,
            pstrykBenefitPerKwh,
            savingsWithoutPstryk,
            savingsWithPstryk,
            cumulativeWithout,
            cumulativeWith,
            pvBillWithout: yearlyBillNoPv - savingsWithoutPstryk,
            pvBillWith: yearlyBillNoPv - savingsWithPstryk
          });

          monthlyBillNoPv *= 1 + config.priceGrowth;
          energyPrice *= 1 + config.priceGrowth;
          distributionPrice *= 1 + config.priceGrowth;
          resalePrice *= 1 + config.priceGrowth;
          gridEnergyPrev = gridEnergy;
          exportedPrev = exported;
        }

        const firstYear = resultsPerYear[0];

        function findPayback(key) {
          for (let i = 0; i < resultsPerYear.length; i += 1) {
            if (resultsPerYear[i][key] >= 0) {
              return resultsPerYear[i].year;
            }
          }
          return null;
        }

        const paybackWithout = findPayback('cumulativeWithout');
        const paybackWith = findPayback('cumulativeWith');
  
        return {
          yearlyDemand,
          pvPower,
          batteryCapacity,
          installationCost,
          costAfterGrant,
          thermoReliefValue,
          costAfterThermo,
          resultsPerYear,
          paybackWithout,
          paybackWith,
          firstYear
        };
      }
  
      /**
       * Handle input changes
       */
      function handleInput() {
        const monthlyBill = parseDecimal(billInput.value);

        
        if (isNaN(monthlyBill) || monthlyBill <= 0) {
          if (resultBill) resultBill.value = "";
          if (yearlyBillElement) yearlyBillElement.textContent = "";
          if (savingsElement) savingsElement.textContent = "";
          setElement(recommendedPvElement, '', {});
          setElement(recommendedStorageElement, '', {});
          setElement(investmentReturnElement, '', {});
          shareResults(null, { pstrykEnabled: isPstrykEnabled() });
          return;
        }
  
        const currentDemand = currentDemandInput ? parseDecimal(currentDemandInput.dataset.plainValue || currentDemandInput.value) : null;
        const calculation = calculateSolar(monthlyBill, currentDemand);

        if (!calculation) {
          if (resultBill) resultBill.value = "";
          if (yearlyBillElement) yearlyBillElement.textContent = "";
          if (savingsElement) savingsElement.textContent = "";
          setElement(recommendedPvElement, '', {});
          setElement(recommendedStorageElement, '', {});
          setElement(investmentReturnElement, '', {});
          shareResults(null, { pstrykEnabled: isPstrykEnabled() });
          return;
        }

        const { firstYear, resultsPerYear, pvPower, batteryCapacity, installationCost, costAfterGrant, costAfterThermo, thermoReliefValue, paybackWithout, paybackWith } = calculation;
        const pstrykEnabled = isPstrykEnabled();
        const selectedYearlyBill = pstrykEnabled ? firstYear.pvBillWith : firstYear.pvBillWithout;
        const selectedSavings = pstrykEnabled ? firstYear.savingsWithPstryk : firstYear.savingsWithoutPstryk;

        if (resultBill) {
          const monthlyPvBill = selectedYearlyBill / 12;
          setElement(resultBill, monthlyPvBill, { digits: 2 });
        }

        if (yearlyBillElement) {
          yearlyBillElement.textContent = formatNumber(selectedYearlyBill);
        }
        
        if (savingsElement) {
          savingsElement.textContent = formatNumber(selectedSavings);
        }

        setElement(recommendedPvElement, pvPower, { digits: 2 });
        setElement(recommendedStorageElement, batteryCapacity, { digits: 1 });
        const paybackYears = Number.isFinite(paybackWithout) ? paybackWithout : paybackWith;
        setElement(investmentReturnElement, paybackYears, { digits: 0 });

        shareResults(calculation, { pstrykEnabled });
      }
  
      // Attach event listeners
      const decimalInputs = [
        billInput,
        currentDemandInput,
        energyActivePriceInput,
        distributionPriceInput,
        resalePriceInput,
        fixedChargesInput,
        priceGrowthInput
      ];

      decimalInputs.forEach(enableDecimalInput);

      billInput.addEventListener("input", handleInput);
  
      const recalculationInputs = [
        currentDemandInput,
        energyActivePriceInput,
        distributionPriceInput,
        resalePriceInput,
        fixedChargesInput,
        priceGrowthInput
      ];

      recalculationInputs.forEach((input) => {
        if (!input) return;
        const { type } = input;
        const eventName = type === 'checkbox' || type === 'radio' ? 'change' : 'input';
        input.addEventListener(eventName, handleInput);
      });

      // TODO: align chart / analytics to use shareResults payload if required

      if (dynamicPriceInput) {
        const eventName = dynamicPriceInput.type === 'checkbox' || dynamicPriceInput.type === 'radio' ? 'change' : 'input';
        dynamicPriceInput.addEventListener(eventName, handleInput);
      }

      handleInput();
    }
  })();
