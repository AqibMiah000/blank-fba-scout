/**
 * Amazon FBA & Profit/ROI Calculator Engine v1.3.0
 * Supports Amazon US fee structures, size tiers, break-even price, Q4 storage fees, and buy criteria.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FbaCalculator = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Category referral fee schedule
  const REFERRAL_FEE_RATES = {
    'appliances': (price) => (price <= 300 ? price * 0.15 : 300 * 0.15 + (price - 300) * 0.08),
    'automotive': 0.12,
    'baby': (price) => (price <= 10 ? price * 0.08 : price * 0.15),
    'beauty': (price) => (price <= 10 ? price * 0.08 : price * 0.15),
    'books': (price) => price * 0.15 + 1.80,
    'camera': 0.08,
    'cell phone': 0.08,
    'clothing': 0.17,
    'electronics': 0.08,
    'grocery': (price) => (price <= 15 ? price * 0.08 : price * 0.15),
    'health': (price) => (price <= 10 ? price * 0.08 : price * 0.15),
    'home & kitchen': 0.15,
    'kitchen & dining': 0.15,
    'office products': 0.15,
    'patio': 0.15,
    'pet supplies': 0.15,
    'sports': 0.15,
    'tools': 0.15,
    'toys': 0.15,
    'video games': 0.15
  };

  function getReferralRate(categoryName = '') {
    const catLower = (categoryName || '').toLowerCase();
    for (const [key, rate] of Object.entries(REFERRAL_FEE_RATES)) {
      if (catLower.includes(key)) {
        return typeof rate === 'function' ? 0.15 : rate;
      }
    }
    return 0.15;
  }

  function calculateReferralFee(price, categoryName = '') {
    if (!price || price <= 0) return 0;
    const catLower = (categoryName || '').toLowerCase();
    
    let rateFnOrNum = 0.15;
    for (const [key, rate] of Object.entries(REFERRAL_FEE_RATES)) {
      if (catLower.includes(key)) {
        rateFnOrNum = rate;
        break;
      }
    }

    let fee = typeof rateFnOrNum === 'function' ? rateFnOrNum(price) : price * rateFnOrNum;
    return Math.max(0.30, fee);
  }

  function determineSizeTier(dims, weightLb) {
    if (!dims || dims.length < 3) {
      dims = [10, 8, 2];
    }
    const sorted = [...dims].map(Number).sort((a, b) => b - a);
    const longest = sorted[0];
    const median = sorted[1];
    const shortest = sorted[2];
    const lengthAndGirth = longest + 2 * (median + shortest);
    const weightOz = (weightLb || 1) * 16;

    if (weightOz <= 16 && longest <= 15 && median <= 12 && shortest <= 0.75) {
      return { tier: 'Small standard', code: 'SMALL_STANDARD', longest, median, shortest, lengthAndGirth };
    }
    if ((weightLb || 1) <= 20 && longest <= 18 && median <= 14 && shortest <= 8) {
      return { tier: 'Large standard', code: 'LARGE_STANDARD', longest, median, shortest, lengthAndGirth };
    }
    if ((weightLb || 1) <= 50 && longest <= 59 && median <= 33 && lengthAndGirth <= 130) {
      return { tier: 'Large bulky', code: 'LARGE_BULKY', longest, median, shortest, lengthAndGirth };
    }
    return { tier: 'Extra-large / Oversize', code: 'EXTRA_LARGE', longest, median, shortest, lengthAndGirth };
  }

  function calculateDimensionalWeight(dims) {
    if (!dims || dims.length < 3) return 0;
    return (dims[0] * dims[1] * dims[2]) / 139;
  }

  function calculateCubicFeet(dims) {
    if (!dims || dims.length < 3) return 0.05;
    return Number(((dims[0] * dims[1] * dims[2]) / 1728).toFixed(3));
  }

  /**
   * Monthly Storage Fee (Standard vs Q4 Surge)
   */
  function calculateStorageFees(dims) {
    const cuFt = calculateCubicFeet(dims);
    // Standard Jan-Sep: ~$0.78 per cu ft
    const standardMonthly = Number((cuFt * 0.78).toFixed(2));
    // Q4 Peak Oct-Dec: ~$2.40 per cu ft
    const q4Monthly = Number((cuFt * 2.40).toFixed(2));

    return {
      cubicFeet: cuFt,
      standardMonthly: Math.max(0.05, standardMonthly),
      q4Monthly: Math.max(0.15, q4Monthly)
    };
  }

  function calculateFulfillmentFee(dims, actualWeightLb) {
    const weightLb = actualWeightLb > 0 ? actualWeightLb : 1.0;
    const tierInfo = determineSizeTier(dims, weightLb);
    const dimWeightLb = calculateDimensionalWeight(dims);

    let billableWeightLb = weightLb;
    if (weightLb > 0.75) {
      billableWeightLb = Math.max(weightLb, dimWeightLb);
    }
    const billableWeightOz = billableWeightLb * 16;

    let fee = 3.86;

    if (tierInfo.code === 'SMALL_STANDARD') {
      if (billableWeightOz <= 2) fee = 3.22;
      else if (billableWeightOz <= 4) fee = 3.32;
      else if (billableWeightOz <= 8) fee = 3.43;
      else if (billableWeightOz <= 12) fee = 3.59;
      else fee = 3.77;
    } else if (tierInfo.code === 'LARGE_STANDARD') {
      if (billableWeightOz <= 4) fee = 3.86;
      else if (billableWeightOz <= 8) fee = 4.08;
      else if (billableWeightOz <= 12) fee = 4.24;
      else if (billableWeightOz <= 16) fee = 4.75;
      else if (billableWeightLb <= 1.5) fee = 5.40;
      else if (billableWeightLb <= 2.0) fee = 5.69;
      else if (billableWeightLb <= 2.5) fee = 6.10;
      else if (billableWeightLb <= 3.0) fee = 6.39;
      else {
        const additionalHalfLbs = Math.ceil((billableWeightLb - 3.0) / 0.5);
        fee = 7.15 + additionalHalfLbs * 0.38;
      }
    } else if (tierInfo.code === 'LARGE_BULKY') {
      const extraLb = Math.max(0, Math.ceil(billableWeightLb - 1.0));
      fee = 9.73 + extraLb * 0.42;
    } else {
      const extraLb = Math.max(0, Math.ceil(billableWeightLb - 50.0));
      fee = 26.33 + extraLb * 0.38;
    }

    return {
      fee: Number(fee.toFixed(2)),
      sizeTier: tierInfo.tier,
      billableWeightLb: Number(billableWeightLb.toFixed(2)),
      dimensionalWeightLb: Number(dimWeightLb.toFixed(2))
    };
  }

  /**
   * Break-Even Price Calculation
   * BreakEven = (COGS + Shipping + Prep + FBA Fee) / (1 - ReferralRate)
   */
  function calculateBreakEven({ costOfGoods = 0, inboundShipping = 0, prepFee = 0, fbaFee = 0, category = '', targetRoi = 30 }) {
    const cogs = Number(costOfGoods) || 0;
    const ship = Number(inboundShipping) || 0;
    const prep = Number(prepFee) || 0;
    const fba = Number(fbaFee) || 0;
    const rate = getReferralRate(category);

    const totalFixed = cogs + ship + prep + fba;
    if (totalFixed <= 0) return { breakEvenPrice: 0, targetMinPrice: 0 };

    const breakEven = totalFixed / (1 - rate);

    // Target Min Price to achieve target ROI (e.g. 30%)
    const targetProfit = (cogs + ship + prep) * (targetRoi / 100);
    const targetMin = (totalFixed + targetProfit) / (1 - rate);

    return {
      breakEvenPrice: Number(breakEven.toFixed(2)),
      targetMinPrice: Number(targetMin.toFixed(2))
    };
  }

  /**
   * Complete Profitability, Break-Even & Criteria Calculation
   */
  function calculateProfit({
    sellingPrice = 0,
    costOfGoods = 0,
    category = '',
    dimensions = [10, 8, 2],
    weightLb = 1.0,
    inboundShippingRatePerLb = 0.40,
    prepFee = 0.20,
    targetRoi = 30,
    minProfit = 3.00,
    maxBsr = 50000,
    bsr = 0
  }) {
    const price = Number(sellingPrice) || 0;
    const cogs = Number(costOfGoods) || 0;
    const weight = Number(weightLb) > 0 ? Number(weightLb) : 1.0;
    const shipRate = Number(inboundShippingRatePerLb) >= 0 ? Number(inboundShippingRatePerLb) : 0.40;
    const prep = Number(prepFee) >= 0 ? Number(prepFee) : 0.20;

    const referralFee = calculateReferralFee(price, category);
    const fbaResult = calculateFulfillmentFee(dimensions, weight);
    const storageResult = calculateStorageFees(dimensions);
    const inboundShipping = weight * shipRate;

    const totalAmazonFees = referralFee + fbaResult.fee;
    const totalCosts = cogs + totalAmazonFees + inboundShipping + prep;
    const netProfit = price - totalCosts;

    const profitMargin = price > 0 ? (netProfit / price) * 100 : 0;
    const totalInvestment = cogs + inboundShipping + prep;
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

    // Break-even
    const be = calculateBreakEven({
      costOfGoods: cogs,
      inboundShipping,
      prepFee: prep,
      fbaFee: fbaResult.fee,
      category,
      targetRoi
    });

    // Custom Buy Criteria Evaluation
    const meetsCriteria = roi >= targetRoi && netProfit >= minProfit && (bsr > 0 ? bsr <= maxBsr : true);

    return {
      sellingPrice: price,
      costOfGoods: cogs,
      referralFee: Number(referralFee.toFixed(2)),
      fbaFee: fbaResult.fee,
      sizeTier: fbaResult.sizeTier,
      billableWeightLb: fbaResult.billableWeightLb,
      dimensionalWeightLb: fbaResult.dimensionalWeightLb,
      cubicFeet: storageResult.cubicFeet,
      standardMonthlyStorage: storageResult.standardMonthly,
      q4MonthlyStorage: storageResult.q4Monthly,
      inboundShipping: Number(inboundShipping.toFixed(2)),
      prepFee: Number(prep.toFixed(2)),
      totalAmazonFees: Number(totalAmazonFees.toFixed(2)),
      totalCosts: Number(totalCosts.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      profitMargin: Number(profitMargin.toFixed(1)),
      roi: Number(roi.toFixed(1)),
      breakEvenPrice: be.breakEvenPrice,
      targetMinPrice: be.targetMinPrice,
      meetsCriteria,
      isProfitable: netProfit > 0
    };
  }

  return {
    calculateReferralFee,
    determineSizeTier,
    calculateDimensionalWeight,
    calculateCubicFeet,
    calculateStorageFees,
    calculateFulfillmentFee,
    calculateBreakEven,
    calculateProfit
  };
});
