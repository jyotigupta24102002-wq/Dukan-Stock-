// js/utils/validators.js

/**
 * Common validation helpers
 */

export function validateText(value, {
  label = "Field",
  required = false,
  min = 0,
  max = 255,
  pattern = null
} = {}) {
  const valueTrimmed = String(value ?? "").trim();

  if (required && !valueTrimmed) {
    return {
      valid: false,
      message: `${label} is required`
    };
  }

  if (!valueTrimmed) {
    return {
      valid: true,
      value: ""
    };
  }

  if (valueTrimmed.length < min) {
    return {
      valid: false,
      message: `${label} must be at least ${min} characters`
    };
  }

  if (valueTrimmed.length > max) {
    return {
      valid: false,
      message: `${label} must not exceed ${max} characters`
    };
  }

  if (pattern && !pattern.test(valueTrimmed)) {
    return {
      valid: false,
      message: `${label} contains invalid characters`
    };
  }

  return {
    valid: true,
    value: valueTrimmed
  };
}


/**
 * Positive number
 * Example: 10, 10.5
 * Not allowed: 0, -5, abc
 */
export function validatePositiveNumber(value, label = "Value") {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return {
      valid: false,
      message: `${label} is required`
    };
  }

  const number = Number(raw);

  if (!Number.isFinite(number)) {
    return {
      valid: false,
      message: `${label} must be a valid number`
    };
  }

  if (number <= 0) {
    return {
      valid: false,
      message: `${label} must be greater than 0`
    };
  }

  return {
    valid: true,
    value: number
  };
}


/**
 * Non-negative number
 * Example: 0, 10, 10.5
 */
export function validateNonNegativeNumber(value, label = "Value") {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return {
      valid: true,
      value: 0
    };
  }

  const number = Number(raw);

  if (!Number.isFinite(number)) {
    return {
      valid: false,
      message: `${label} must be a valid number`
    };
  }

  if (number < 0) {
    return {
      valid: false,
      message: `${label} cannot be negative`
    };
  }

  return {
    valid: true,
    value: number
  };
}


/**
 * Positive integer
 * Example: 1, 2, 10
 */
export function validatePositiveInteger(value, label = "Quantity") {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return {
      valid: false,
      message: `${label} is required`
    };
  }

  if (!/^\d+$/.test(raw)) {
    return {
      valid: false,
      message: `${label} must be a whole number`
    };
  }

  const number = Number(raw);

  if (number <= 0) {
    return {
      valid: false,
      message: `${label} must be greater than 0`
    };
  }

  return {
    valid: true,
    value: number
  };
}


/**
 * Non-negative integer
 * Example: 0, 1, 2, 10
 */
export function validateNonNegativeInteger(value, label = "Quantity") {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return {
      valid: true,
      value: 0
    };
  }

  if (!/^\d+$/.test(raw)) {
    return {
      valid: false,
      message: `${label} must be a whole number`
    };
  }

  const number = Number(raw);

  if (number < 0) {
    return {
      valid: false,
      message: `${label} cannot be negative`
    };
  }

  return {
    valid: true,
    value: number
  };
}


/**
 * Date validation
 */
export function validateDate(value, {
  label = "Date",
  required = true,
  allowFuture = false
} = {}) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    if (required) {
      return {
        valid: false,
        message: `${label} is required`
      };
    }

    return {
      valid: true,
      value: ""
    };
  }

  const date = new Date(`${raw}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return {
      valid: false,
      message: `${label} is invalid`
    };
  }

  if (!allowFuture) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (date > today) {
      return {
        valid: false,
        message: `${label} cannot be a future date`
      };
    }
  }

  return {
    valid: true,
    value: raw
  };
}


/**
 * Product validation
 */
export function validateProduct(data) {
  const errors = {};

  const brand = validateText(data.brand, {
    label: "Brand",
    required: true,
    min: 2,
    max: 50,
    pattern: /^[a-zA-Z0-9][a-zA-Z0-9 .&'_-]*$/
  });

  if (!brand.valid) {
    errors.brand = brand.message;
  }

  const model = validateText(data.model, {
    label: "Model",
    required: true,
    min: 1,
    max: 80
  });

  if (!model.valid) {
    errors.model = model.message;
  }

  const description = validateText(data.desc, {
    label: "Description",
    max: 250
  });

  if (!description.valid) {
    errors.desc = description.message;
  }

  const sell = validateNonNegativeNumber(
    data.sell,
    "Selling price"
  );

  if (!sell.valid) {
    errors.sell = sell.message;
  }

  const min = validateNonNegativeInteger(
    data.min,
    "Minimum stock"
  );

  if (!min.valid) {
    errors.min = min.message;
  }

  const spec = validateNonNegativeNumber(
    data.spec,
    "Specification"
  );

  if (!spec.valid) {
    errors.spec = spec.message;
  }

  const wt = validateNonNegativeNumber(
    data.wt,
    "Weight"
  );

  if (!wt.valid) {
    errors.wt = wt.message;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      brand: brand.value ?? "",
      model: model.value ?? "",
      desc: description.value ?? "",
      sell: sell.value ?? 0,
      min: min.value ?? 0,
      spec: spec.value ?? "",
      wt: wt.value ?? ""
    }
  };
}


/**
 * Initial stock validation
 */
export function validateInitialStock({
  qty,
  buy,
  date
}) {
  const errors = {};

  const quantity = validateNonNegativeInteger(
    qty,
    "Initial quantity"
  );

  if (!quantity.valid) {
    errors.qty = quantity.message;
  }

  // Purchase price is required only when quantity > 0
  if (quantity.valid && quantity.value > 0) {
    const price = validatePositiveNumber(
      buy,
      "Purchase price"
    );

    if (!price.valid) {
      errors.buy = price.message;
    }
  }

  const stockDate = validateDate(date, {
    label: "Stock date",
    required: true,
    allowFuture: false
  });

  if (!stockDate.valid) {
    errors.date = stockDate.message;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      qty: quantity.value ?? 0,
      buy: Number(buy) || 0,
      date: stockDate.value ?? ""
    }
  };
}


/**
 * Transaction validation
 */
export function validateTransaction(data) {
  const errors = {};

  if (!data.pid) {
    errors.pid = "Please select an item";
  }

  const quantity = validatePositiveInteger(
    data.qty,
    "Quantity"
  );

  if (!quantity.valid) {
    errors.qty = quantity.message;
  }

  const price = validatePositiveNumber(
    data.price,
    "Price"
  );

  if (!price.valid) {
    errors.price = price.message;
  }

  const date = validateDate(data.date, {
    label: "Date",
    required: true,
    allowFuture: false
  });

  if (!date.valid) {
    errors.date = date.message;
  }

  const party = validateText(data.party, {
    label: "Party name",
    max: 100
  });

  if (!party.valid) {
    errors.party = party.message;
  }

  const note = validateText(data.note, {
    label: "Note",
    max: 250
  });

  if (!note.valid) {
    errors.note = note.message;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      pid: data.pid || "",
      qty: quantity.value ?? 0,
      price: price.value ?? 0,
      date: date.value ?? "",
      party: party.value ?? "",
      note: note.value ?? ""
    }
  };
}


/**
 * Format validation errors into one readable message.
 */
export function firstValidationError(errors) {
  const firstKey = Object.keys(errors || {})[0];

  return firstKey
    ? errors[firstKey]
    : "";
}