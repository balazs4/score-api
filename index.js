const puppeteer = require('puppeteer');
const setupGetAllMatches = require('./getAllMatches');
const setupGetMatchDetails = require('./getMatchDetails');

const [, , resource = '/soccer/', filterText] = process.argv;

const fn = filterText
  ? ({ home, away }) => [home, away].some(x => x.includes(filterText))
  : _ => true;

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const getAllMatches = setupGetAllMatches(browser);
  const getMatchDetails = setupGetMatchDetails(browser);

  const matches = await getAllMatches(resource);
  const details = await Promise.all(matches.filter(fn).map(getMatchDetails));

  await browser.close();
  console.log(JSON.stringify(details, null, 2));
  return details;
})();
