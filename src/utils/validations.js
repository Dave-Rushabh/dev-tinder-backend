const validator = require("validator");
const userModel = require("../models/user");
const bcrypt = require("bcrypt");

const validateSignUpData = (data) => {
  const MANDATORY_FIELDS = [
    "firstName",
    "lastName",
    "emailId",
    "password",
    "age",
    "gender",
  ];

  const isAllMandatoryFieldsPresent = MANDATORY_FIELDS.every((item) =>
    Object.keys(data).includes(item)
  );

  const isStrongPassword = (pwd) => {
    return validator.isStrongPassword(pwd);
  };

  if (!isAllMandatoryFieldsPresent) {
    return {
      isValid: false,
      error: `All mandatory fields are required => ${MANDATORY_FIELDS}`,
    };
  }

  if (!isStrongPassword(data.password)) {
    return {
      isValid: false,
      error: "Password is not strong enough",
    };
  }

  return { isValid: true };
};

const validateSignInData = async (data) => {
  const MANDATORY_FIELDS = ["emailId", "password"];
  const isAllMandatoryFieldsPresent = MANDATORY_FIELDS.every((item) =>
    Object.keys(data).includes(item)
  );

  if (!isAllMandatoryFieldsPresent) {
    return {
      isValid: false,
      error: `All mandatory fields are required => ${MANDATORY_FIELDS}`,
    };
  }

  const isUserExist = await userModel.findOne({ emailId: data.emailId });

  if (!isUserExist) {
    return {
      isValid: false,
      error: "Invalid credentials",
    };
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    isUserExist.password
  );

  if (!isPasswordValid) {
    return {
      isValid: false,
      error: "Invalid credentials",
    };
  }

  return { isValid: true };
};

module.exports = {
  validateSignUpData,
  validateSignInData,
};
