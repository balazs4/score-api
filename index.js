const puppeteer = require('puppeteer');

const [, , search] = process.argv;

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(`http://livescore.com${search}`);

  const { matches } = await page.evaluate(() =>
    [...document.querySelector('div[data-type=container]').children]
      .filter(x => x.attributes['data-type'])
      .reduce(
        (acc, row) => {
          const type = row.attributes['data-type'].value;
          if (type === 'stg') {
            const id = row.attributes['data-stg-id'].value;
            const date = row.attributes['data-id'].value;

            if (acc.meta.id !== id) {
              const name = row.children[0].children[0].innerText;
              acc.meta = Object.assign(acc.meta, { id, name, date });
            }
            if (acc.meta.date !== date) {
              acc.meta.date = date;
            }
          }
          if (type === 'evt') {
            const [home, away] = [...row.querySelectorAll('.ply.name')].map(x =>
              x.innerText.trim()
            );
            const min = row.querySelector('.min').innerText.trim();
            const scoreElement = row.querySelector('.sco');
            const score = scoreElement.innerText
              .split('-')
              .map(x => x.trim())
              .join('-');
            const scoreLink = scoreElement.querySelector('a.scorelink');
            const href = scoreLink ? scoreLink.attributes['href'].value : null;
            const match = {
              home,
              away,
              min,
              href,
              score
            };
            acc.matches.push(Object.assign(match, acc.meta));
          }
          return acc;
        },
        { matches: [], meta: { id: null, date: null, name: null } }
      )
  );

  const fullMatches = await Promise.all(
    matches.map(async match => {
      if (match.href === null) return match;
      const matchPage = await browser.newPage();
      await matchPage.goto(`http://livescore.com${match.href}`);
      const raw = await matchPage.evaluate(() => {
        return [
          ...document
            .querySelector('div[data-type=content]')
            .querySelectorAll('.row')
        ].map(x => x.innerText.replace(/\n/g, ' '));
      });
      return Object.assign({}, match, { raw });
    })
  );

  console.log(JSON.stringify(fullMatches, null, 2));
  await browser.close();
})();
