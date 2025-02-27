/* eslint-disable import/no-extraneous-dependencies */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import matchMediaMock from 'match-media-mock';
import ResizeObserverPolyfill from 'resize-observer-polyfill';
import 'jest-canvas-mock';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

process.env.LMS_BASE_URL = 'http://localhost:18000';
process.env.MARKETING_SITE_BASE_URL = 'http://marketing.url';
process.env.LOGOUT_URL = 'http://localhost:18000/logout';
process.env.BASE_URL = 'http://localhost:8734';

// testing utility to mock window width, etc.
global.window.matchMedia = matchMediaMock.create();

jest.mock('@edx/frontend-platform/logging');
jest.mock('@edx/frontend-platform/analytics');

// Upgrading to Node16 shows unhandledPromiseRejection warnings as errors so adding a handler
process.on('unhandledRejection', (reason, p) => {
  // eslint-disable-next-line no-console
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason.stack);
});

global.ResizeObserver = ResizeObserverPolyfill;
