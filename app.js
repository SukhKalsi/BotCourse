"use strict";

const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const token = process.env.SLACK_TOKEN || '';
const isPhone = require('is-phone');

const rtm = new RtmClient(token, {
  logLevel: 'error',
  // logLevel: 'debug',
  // Initialise a data store for our client, this will load additional helper functions for the storing and retrieval of data
  dataStore: new MemoryDataStore(),
  // Boolean indicating whether Slack should automatically reconnect after an error response
  autoReconnect: true,
  // Boolean indicating whether each message should be marked as read or not after it is processed
  autoMark: true,
});

/* proxy for now, for flexibility in this area later */
const setState = (newState, stateResponse = false) => {
  if (stateResponse) {
    response[state] = stateResponse; // to keep it dry i suppose...  
  }
  
  state = newState;
}

const states = {
  DEFAULT: "DEFAULT",
  GET_NAME: "GET_NAME",
  GET_ADDRESS: "GET_ADDRESS",
  GET_PHONE: "GET_PHONE",
  GET_GENDER: "GET_GENDER",
  GET_EMAIL: "GET_EMAIL",
}

/* init state, set initial state */
let state;
state = states.DEFAULT;

/* functions that send responses and set state, called based on state */

const handlers = {};
const response = {
    GET_NAME: "",
    GET_ADDRESS: "",
    GET_PHONE: "",
    GET_GENDER: "",
    GET_EMAIL: "",
}

handlers.DEFAULT = (message) => {
  console.log(message.text, state);
  rtm.sendMessage("Welcome! What's your name?", message.channel);
  setState(states.GET_NAME);
  console.log(message.text, state);
}

handlers.GET_NAME = (message) => {
  console.log(message.text, state);
  rtm.sendMessage("Ok, what's your address?", message.channel);
  setState(states.GET_ADDRESS, message.text);
  console.log(message.text, state);
}

handlers.GET_ADDRESS = (message) => {
  console.log(message.text, state);
  rtm.sendMessage("What's your phone number?", message.channel);
  setState(states.GET_PHONE, message.text);
  console.log(message.text, state);
}

handlers.GET_PHONE = (message) => {
  
  if (isPhone(message.text)) {
    rtm.sendMessage("Almost there! What's your gender?", message.channel)
    setState(states.GET_GENDER, message.text);
  } else {
    rtm.sendMessage("Oops. Please enter a valid number: (QQQ) QQQ-QQQQ", message.channel);
  }

  console.log(message.text, state);
}

handlers.GET_GENDER = (message) => {
  console.log(message.text, state);
  rtm.sendMessage("And finally...what's your email address?", message.channel)
  setState(states.GET_EMAIL, message.text);
  console.log(message.text, state);
}

handlers.GET_EMAIL = (message) => {
  console.log(message.text, state);
  setState(states.DEFAULT, message.text);

  rtm.sendMessage("All set!", message.channel);
  rtm.sendMessage("Your response...", message.channel);
  
  for (var key in response) {
    rtm.sendMessage(response[key], message.channel);
  }

  console.log(message.text, state);
}

const router = (message) => {
  handlers[state](message);
}

// Listens to all `message` events from the team
rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  router(message);
});

rtm.start();