const puppeteer = require('puppeteer');

const [, , search, filter] = process.argv;

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
            const { date, name } = acc.meta;
            const match = {
              date,
              name,
              home,
              away,
              min,
              score,
              href
            };
            acc.matches.push(match);
          }
          return acc;
        },
        { matches: [], meta: { id: null, date: null, name: null } }
      )
  );

  const fullMatches = await Promise.all(
    matches
      .filter(
        x =>
          filter
            ? `${x.home}-${x.away}`.toLowerCase().includes(filter.toLowerCase())
            : true
      )
      .map(async match => {
        if (match.href === null) return match;
        const matchPage = await browser.newPage();
        await matchPage.goto(`http://livescore.com${match.href}`);
        const { values } = await matchPage.evaluate(match => {
          const rows = [
            ...document
              .querySelector('div[data-type=content]')
              .querySelectorAll('.row')
          ];

          return rows.reduce(
            (acc, obj) => {
              if (obj.attributes['data-type'].value.includes('header')) {
                acc.header = obj.innerText.replace(/\s/g, '').split(':')[0];
                acc.values[acc.header] = [];
                return acc;
              }
              if (obj.attributes['data-type'].value === 'incident') {
                const team = [match.home, match.away];
                const event =
                  obj
                    .querySelector('.sco')
                    .innerText.trim()
                    .split('-')
                    .map(x => x.trim())
                    .join('-') ||
                  Array.from(
                    new Set(
                      []
                        .concat(
                          ...[
                            ...obj
                              .querySelector('.sco')
                              .querySelectorAll('.inc')
                          ].map(y => y.attributes['class'].value.split(' '))
                        )
                        .filter(
                          y =>
                            y !== 'empty' &&
                            y !== 'inc' &&
                            y !== 'goal' &&
                            y !== 'inc-awy' &&
                            y !== 'inc-hom'
                        )
                    )
                  ).join(', ');
                const value = {
                  min: obj.querySelector('.min').innerText.trim(),
                  event,
                  player: [...obj.querySelectorAll('.ply')]
                    .map(
                      (y, i) =>
                        y.innerText.trim()
                          ? `${y.innerText.trim()} (${team[i]})`
                          : null
                    )
                    .filter(y => y)
                    .join(', ')
                };

                acc.values[acc.header].push(value);
                return acc;
              }
              acc.values[acc.header] = [...obj.children]
                .map(x => x.innerText.trim())
                .join(', ');
              return acc;
            },
            { values: {}, header: null }
          );
        }, match);
        return Object.assign({}, match, values);
      })
  );

  console.log(JSON.stringify(fullMatches, null, 2));
  await browser.close();
})();
