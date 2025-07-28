const express = require("express");
const { requireUser } = require("./middleware/auth.js");

module.exports = require('express').Router();