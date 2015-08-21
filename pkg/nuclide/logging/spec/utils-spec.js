'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {patchErrorsOfLoggingEvent, serializeLoggingEvent, deserializeLoggingEvent} from '../lib/utils';
import addPrepareStackTraceHook from '../lib/stacktrace';

import type {LoggingEvent} from '../lib/types';

// Construct a loggingEvent following log4js event format.
function createLoggingEvent(...args: Array<any>): LoggingEvent {
  return {
    startTime: new Date(),
    categoryName: 'test',
    data: args,
    level: {
      level: 40000,
      levelStr: 'ERROR',
    },
    logger: {
      category: 'arsenal',
      _events: {
        log: [
          null,
          null,
        ],
      },
    },
  };
}

describe('Logview Appender Utils.', () => {
  beforeEach(() => {
    addPrepareStackTraceHook();
  });

  it('patches error of loggingEvent', () => {
    var error = new Error('test');
    var loggingEventWithError = createLoggingEvent(error);
    expect(loggingEventWithError.data[0] instanceof Error).toBe(true);
    expect(loggingEventWithError.data[0]).toBe(error);

    var patchedLoggingEventWithError = patchErrorsOfLoggingEvent(loggingEventWithError);
    expect(patchedLoggingEventWithError.data[0] instanceof Error).toBe(false);
    expect(typeof patchedLoggingEventWithError.data[0].stack).toBe('string');
    expect(patchedLoggingEventWithError.data[0].stackTrace instanceof Array).toBe(true);
  });

  it('addes error if no error exists in loggingEvent.data', () => {
    var loggingEventWithoutError = createLoggingEvent();
    expect(loggingEventWithoutError.data.length).toBe(0);
    var patchedLoggingEventWithoutError = patchErrorsOfLoggingEvent(loggingEventWithoutError);
    expect(typeof patchedLoggingEventWithoutError.data[0].stack).toBe('string');
  });

  it('Test serialization/deserialization utils.', () => {
    var loggingEvent = patchErrorsOfLoggingEvent(createLoggingEvent(new Error('123')));

    var serialization = serializeLoggingEvent(loggingEvent);
    expect(typeof serialization === 'string').toBe(true);

    var deserialization = deserializeLoggingEvent(serialization);
    expect(deserialization.startTime.toString()).toEqual(loggingEvent.startTime.toString());
    expect(deserialization.categoryName).toEqual(loggingEvent.categoryName);
    expect(JSON.stringify(deserialization.level))
        .toEqual(JSON.stringify(loggingEvent.level));
    expect(JSON.stringify(deserialization.logger))
        .toEqual(JSON.stringify(loggingEvent.logger));
    expect(JSON.stringify(deserialization.data[0]))
        .toEqual(JSON.stringify(loggingEvent.data[0]));
  });
});
