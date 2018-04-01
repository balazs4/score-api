const extract = () => {
  return [...document.querySelector('div[data-type=container]').children]
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
          const href = scoreLink
            ? window.location.origin + scoreLink.attributes['href'].value
            : null;
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
          acc.values.push(match);
        }
        return acc;
      },
      { values: [], meta: { id: null, date: null, name: null } }
    );
};

module.exports = browser => async resource => {
  const page = await browser.newPage();
  await page.goto(`http://livescore.com${resource}`, {
    waitUntil: 'networkidle2'
  });
  const { values } = await page.evaluate(extract);
  return values;
};
